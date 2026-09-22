
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

function hex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBytes(value) {
  return new TextEncoder().encode(value);
}

async function hmacSha256(keyBytes, messageBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return await crypto.subtle.sign("HMAC", key, messageBytes);
}

async function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) {
    throw new Error("Missing Telegram authentication data");
  }

  const params = new URLSearchParams(initData);

  const receivedHash = params.get("hash");

  if (!receivedHash) {
    throw new Error("Telegram hash missing");
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // Telegram WebApp validation
  const secretKey = await hmacSha256(
    toBytes("WebAppData"),
    toBytes(botToken)
  );

  const calculatedHashBuffer = await hmacSha256(
    new Uint8Array(secretKey),
    toBytes(dataCheckString)
  );

  const calculatedHash = hex(calculatedHashBuffer);

  if (calculatedHash !== receivedHash) {
    throw new Error("Invalid Telegram authentication hash");
  }

  const authDate = Number(params.get("auth_date"));

  if (!authDate) {
    throw new Error("Telegram auth_date missing");
  }

  const now = Math.floor(Date.now() / 1000);

  // 24 hour validity
  if (now - authDate > 86400) {
    throw new Error("Telegram authentication expired");
  }

  const userRaw = params.get("user");

  if (!userRaw) {
    throw new Error("Telegram user missing");
  }

  let telegramUser;

  try {
    telegramUser = JSON.parse(userRaw);
  } catch {
    throw new Error("Invalid Telegram user data");
  }

  if (!telegramUser.id) {
    throw new Error("Telegram user ID missing");
  }

  return telegramUser;
}

function getSupabaseKey() {
  return (
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SERVICE_KEY") ||
    Deno.env.get("SUPABASE_SECRET_KEYS")
  );
}

async function supabaseRequest(path, options = {}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = getSupabaseKey();

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is missing");
  }

  if (!serviceKey) {
    throw new Error("Supabase service key is missing");
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const result = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers,
  });

  const text = await result.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!result.ok) {
    console.error("Supabase error:", result.status, data);

    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || data?.hint || "Supabase request failed"
    );
  }

  return data;
}

function numberValue(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function booleanValue(value, fallback = false) {
  if (typeof value === "boolean") return value;

  if (value === "true") return true;
  if (value === "false") return false;

  return fallback;
}

function buildSaveData(game) {
  return {
    balance: Math.max(0, numberValue(game?.balance)),
    total_mined: Math.max(0, numberValue(game?.totalMined)),
    level: Math.max(1, numberValue(game?.level, 1)),
    xp: Math.max(0, numberValue(game?.xp)),
    tap_power: Math.max(1, numberValue(game?.tapPower, 1)),
    energy: Math.max(0, numberValue(game?.energy)),
    max_energy: Math.max(1, numberValue(game?.maxEnergy, 1)),
    mine_rate: Math.max(1, numberValue(game?.mineRate, 1)),
    tap_level: Math.max(1, numberValue(game?.tapLevel, 1)),
    energy_level: Math.max(1, numberValue(game?.energyLevel, 1)),
    boost_level: Math.max(1, numberValue(game?.boostLevel, 1)),
    progress: Math.max(0, numberValue(game?.missionProgress)),
    mission_claimed: booleanValue(game?.missionClaimed, false),
    sound: booleanValue(game?.sound, true),
  };
}

function cleanUser(user) {
  if (!user) return null;

  return {
    id: user.id ?? null,
    telegram_id: user.telegram_id ?? null,
    username: user.username ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    balance: user.balance ?? 0,
    total_mined: user.total_mined ?? 0,
    level: user.level ?? 1,
    xp: user.xp ?? 0,
    tap_power: user.tap_power ?? 1,
    energy: user.energy ?? 1250,
    max_energy: user.max_energy ?? 1250,
    mine_rate: user.mine_rate ?? 4,
    tap_level: user.tap_level ?? 1,
    energy_level: user.energy_level ?? 1,
    boost_level: user.boost_level ?? 1,
    mission: user.mission ?? 0,
    progress: user.progress ?? 0,
    mission_claimed: user.mission_claimed ?? false,
    sound: user.sound ?? true,
    created_at: user.created_at ?? null,
  };
}

async function findUser(telegramId) {
  const users = await supabaseRequest(
    `users?telegram_id=eq.${encodeURIComponent(String(telegramId))}&select=*`
  );

  if (!Array.isArray(users) || users.length === 0) {
    return null;
  }

  return users[0];
}

async function createUser(telegramUser) {
  const telegramId = String(telegramUser.id);

  const newUser = {
    telegram_id: telegramId,
    username: telegramUser.username || "",
    first_name: telegramUser.first_name || "",
    last_name: telegramUser.last_name || "",

    balance: 0,
    total_mined: 0,
    level: 1,
    xp: 0,

    tap_power: 1,

    energy: 1250,
    max_energy: 1250,

    mine_rate: 4,

    tap_level: 1,
    energy_level: 1,
    boost_level: 1,

    mission: 0,
    progress: 0,
    mission_claimed: false,

    sound: true,
  };

  const created = await supabaseRequest("users", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(newUser),
  });

  if (!Array.isArray(created) || !created[0]) {
    throw new Error("Could not create user");
  }

  return created[0];
}

async function updateUserProfile(user, telegramUser) {
  const updateData = {
    username: telegramUser.username || "",
    first_name: telegramUser.first_name || "",
    last_name: telegramUser.last_name || "",
  };

  const updated = await supabaseRequest(
    `users?telegram_id=eq.${encodeURIComponent(String(user.telegram_id))}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(updateData),
    }
  );

  return Array.isArray(updated) && updated[0]
    ? updated[0]
    : user;
}

async function saveGame(telegramUser, game) {
  const telegramId = String(telegramUser.id);

  const existingUser = await findUser(telegramId);

  if (!existingUser) {
    throw new Error("User not found. Authenticate first.");
  }

  const saveData = buildSaveData(game);

  const updated = await supabaseRequest(
    `users?telegram_id=eq.${encodeURIComponent(telegramId)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(saveData),
    }
  );

  if (!Array.isArray(updated) || !updated[0]) {
    throw new Error("Game save failed");
  }

  return updated[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return response(
      {
        success: false,
        error: "POST required",
      },
      405
    );
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!botToken) {
      return response(
        {
          success: false,
          error: "TELEGRAM_BOT_TOKEN is missing",
        },
        500
      );
    }

    const body = await req.json();

    const initData = body?.initData;

    if (!initData) {
      return response(
        {
          success: false,
          error: "initData missing",
        },
        400
      );
    }

    // ---------------------------------------
    // Telegram authentication
    // ---------------------------------------

    const telegramUser = await verifyTelegramInitData(
      initData,
      botToken
    );

    const action = body?.action || "auth";

    // ---------------------------------------
    // SAVE GAME
    // ---------------------------------------

    if (action === "save") {
      if (!body?.game) {
        return response(
          {
            success: false,
            error: "Game data missing",
          },
          400
        );
      }

      const savedUser = await saveGame(
        telegramUser,
        body.game
      );

      return response({
        success: true,
        action: "save",
        saved: true,
        user: cleanUser(savedUser),
      });
    }

    // ---------------------------------------
    // AUTH / LOAD USER
    // ---------------------------------------

    let user = await findUser(telegramUser.id);

    let newUser = false;

    if (!user) {
      user = await createUser(telegramUser);
      newUser = true;
    } else {
      user = await updateUserProfile(
        user,
        telegramUser
      );
    }

    return response({
      success: true,
      action: "auth",
      newUser,
      user: cleanUser(user),
    });
  } catch (error) {
    console.error("bright-endpoint error:", error);

    return response(
      {
        success: false,
        error: error?.message || "Unknown error",
      },
      500
    );
  }
});
