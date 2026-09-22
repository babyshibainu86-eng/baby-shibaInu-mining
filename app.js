// ==========================================
// BABY SHIBA INU - MINI APP
// APP VERSION 3.1
// Stable User + CloudStorage + Local Backup
// Referral Ready for Telegram Serverless
// VIP Test Purchase System
// Supabase Telegram Authentication
// SAFE Persistent Game Save / Load
// ==========================================


// ==========================================
// SUPABASE TELEGRAM AUTH
// ==========================================

const SUPABASE_TELEGRAM_AUTH_URL =
    "https://xtfleiaormhmbzwurqoi.supabase.co/functions/v1/bright-endpoint";


// ==========================================
// TELEGRAM
// ==========================================

let tg =
    window.Telegram?.WebApp || null;


// ==========================================
// TELEGRAM CLOUD STORAGE
// ==========================================

let saveInProgress = false;
let savePending = false;


// ==========================================
// SUPABASE SAVE SYSTEM
// ==========================================

let supabaseReady = false;
let supabaseSaveInProgress = false;
let supabaseSavePending = false;
let supabaseSaveTimer = null;
let lastSupabaseSaveTime = 0;

const SUPABASE_SAVE_INTERVAL = 5000;


// ==========================================
// TELEGRAM USER
// ==========================================

let telegramUser = null;
let user = null;


// ==========================================
// CONNECT TELEGRAM
// ==========================================

function initTelegram() {

    tg =
        window.Telegram?.WebApp || null;

    if (!tg) {

        console.log(
            "⚠️ Telegram WebApp not available"
        );

        return;

    }

    try {

        tg.ready();
        tg.expand();

    } catch (error) {

        console.log(
            "Telegram init error:",
            error
        );

    }

    telegramUser =
        tg.initDataUnsafe?.user || null;

    console.log(
        "📱 Telegram WebApp connected"
    );

    console.log(
        "Telegram User:",
        telegramUser
    );

}


// ==========================================
// GET TELEGRAM USER
// ==========================================

function getTelegramUser() {

    if (tg) {

        const currentUser =
            tg.initDataUnsafe?.user || null;

        if (currentUser) {

            telegramUser =
                currentUser;

        }

    }

    if (telegramUser) {

        return {

            id:
                telegramUser.id || null,

            firstName:
                telegramUser.first_name ||
                "Player",

            lastName:
                telegramUser.last_name ||
                "",

            username:
                telegramUser.username ||
                ""

        };

    }

    return {

        id: null,

        firstName: "Guest",

        lastName: "",

        username: ""

    };

}


// ==========================================
// REFRESH USER
// ==========================================

function refreshUser() {

    const currentUser =
        getTelegramUser();

    user =
        currentUser;

    console.log(
        "👤 Current User:",
        user
    );

    return user;

}


// ==========================================
// SUPABASE TELEGRAM AUTHENTICATION
// IMPORTANT:
// DO NOT LOAD GAME FROM SUPABASE ON LOGIN
// ==========================================

async function authenticateWithSupabase() {

    try {

        if (
            !tg ||
            !tg.initData
        ) {

            console.log(
                "⚠️ Telegram initData not available for Supabase authentication"
            );

            return null;

        }

        console.log(
            "🔐 Authenticating Telegram user with Supabase..."
        );

        const response =
            await fetch(
                SUPABASE_TELEGRAM_AUTH_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            initData:
                                tg.initData,

                            action:
                                "auth"

                        })

                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "❌ Supabase authentication error:",
                data
            );

            return null;

        }

        if (!data.success) {

            console.error(
                "❌ Supabase returned error:",
                data
            );

            return null;

        }

        console.log(
            "✅ Supabase authentication successful:",
            data
        );


        // ======================================
        // IMPORTANT
        // NEVER LOAD data.user INTO GAME HERE
        //
        // LocalStorage / Telegram CloudStorage
        // is the recovery source at startup.
        //
        // Supabase is used for persistent SAVE.
        // ======================================

        supabaseReady = true;

        console.log(
            "☁️ Supabase persistent storage ready"
        );

        return data;

    } catch (error) {

        console.error(
            "❌ Supabase connection error:",
            error
        );

        supabaseReady = false;

        return null;

    }

}


// ==========================================
// LOAD GAME FROM SUPABASE
// SAFE FUNCTION
// ==========================================

function loadGameFromSupabase(dbGame) {

    if (!dbGame) {

        return false;

    }

    try {

        const current =
            {
                ...defaultState,
                ...game
            };


        const dbBalance =
            Number(dbGame.balance);

        const currentBalance =
            Number(current.balance);


        // ======================================
        // NEVER ALLOW ZERO TO DESTROY
        // A NON-ZERO LOCAL BALANCE
        // ======================================

        let safeBalance =
            currentBalance;


        if (
            currentBalance <= 0 &&
            Number.isFinite(dbBalance) &&
            dbBalance > 0
        ) {

            safeBalance =
                dbBalance;

        }


        if (
            currentBalance > 0
        ) {

            safeBalance =
                currentBalance;

        }


        game = {

            ...defaultState,

            ...current,

            balance:
                safeBalance,

            totalMined:
                Math.max(
                    Number(current.totalMined) || 0,
                    Number(dbGame.totalMined) || 0
                ),

            level:
                Math.max(
                    Number(current.level) || 1,
                    Number(dbGame.level) || 1
                ),

            xp:
                Math.max(
                    Number(current.xp) || 0,
                    Number(dbGame.xp) || 0
                ),

            tapPower:
                Math.max(
                    Number(current.tapPower) || 1,
                    Number(dbGame.tapPower) || 1
                ),

            energy:
                Number.isFinite(
                    Number(dbGame.energy)
                )
                    ? Number(dbGame.energy)
                    : Number(current.energy) || 1250,

            maxEnergy:
                Math.max(
                    Number(current.maxEnergy) || 1250,
                    Number(dbGame.maxEnergy) || 1250
                ),

            mineRate:
                Math.max(
                    Number(current.mineRate) || 4,
                    Number(dbGame.mineRate) || 4
                ),

            tapLevel:
                Math.max(
                    Number(current.tapLevel) || 1,
                    Number(dbGame.tapLevel) || 1
                ),

            energyLevel:
                Math.max(
                    Number(current.energyLevel) || 1,
                    Number(dbGame.energyLevel) || 1
                ),

            boostLevel:
                Math.max(
                    Number(current.boostLevel) || 1,
                    Number(dbGame.boostLevel) || 1
                ),

            missionProgress:
                Math.max(
                    Number(current.missionProgress) || 0,
                    Number(dbGame.missionProgress) || 0
                ),

            missionClaimed:
                Boolean(
                    current.missionClaimed ||
                    dbGame.missionClaimed
                ),

            sound:
                current.sound !== false &&
                dbGame.sound !== false

        };


        // ======================================
        // SAFETY
        // ======================================

        if (
            game.energy < 0
        ) {

            game.energy = 0;

        }

        if (
            game.energy >
            getEffectiveMaxEnergy()
        ) {

            game.energy =
                getEffectiveMaxEnergy();

        }

        if (
            game.level < 1
        ) {

            game.level = 1;

        }

        if (
            game.tapLevel < 1
        ) {

            game.tapLevel = 1;

        }

        if (
            game.energyLevel < 1
        ) {

            game.energyLevel = 1;

        }

        if (
            game.boostLevel < 1
        ) {

            game.boostLevel = 1;

        }

        console.log(
            "🛡️ Safe Supabase merge completed:",
            game
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Supabase game load error:",
            error
        );

        return false;

    }

}


// ==========================================
// SAFE NUMBER
// ==========================================

function safeNumber(value, fallback = 0) {

    const number =
        Number(value);

    if (
        Number.isFinite(number)
    ) {

        return number;

    }

    return fallback;

}


// ==========================================
// SAVE GAME TO SUPABASE
// ==========================================

async function saveGameToSupabase() {

    if (
        !supabaseReady ||
        !tg ||
        !tg.initData
    ) {

        return false;

    }

    if (supabaseSaveInProgress) {

        supabaseSavePending = true;

        return false;

    }

    try {

        supabaseSaveInProgress = true;
        supabaseSavePending = false;


        const gameData = {

            balance:
                Math.max(
                    0,
                    safeNumber(
                        game.balance,
                        0
                    )
                ),

            totalMined:
                Math.max(
                    0,
                    safeNumber(
                        game.totalMined,
                        0
                    )
                ),

            level:
                Math.max(
                    1,
                    safeNumber(
                        game.level,
                        1
                    )
                ),

            xp:
                Math.max(
                    0,
                    safeNumber(
                        game.xp,
                        0
                    )
                ),

            tapPower:
                Math.max(
                    1,
                    safeNumber(
                        game.tapPower,
                        1
                    )
                ),

            energy:
                Math.max(
                    0,
                    safeNumber(
                        game.energy,
                        1250
                    )
                ),

            maxEnergy:
                Math.max(
                    1250,
                    safeNumber(
                        game.maxEnergy,
                        1250
                    )
                ),

            mineRate:
                Math.max(
                    4,
                    safeNumber(
                        game.mineRate,
                        4
                    )
                ),

            tapLevel:
                Math.max(
                    1,
                    safeNumber(
                        game.tapLevel,
                        1
                    )
                ),

            energyLevel:
                Math.max(
                    1,
                    safeNumber(
                        game.energyLevel,
                        1
                    )
                ),

            boostLevel:
                Math.max(
                    1,
                    safeNumber(
                        game.boostLevel,
                        1
                    )
                ),

            missionProgress:
                Math.max(
                    0,
                    safeNumber(
                        game.missionProgress,
                        0
                    )
                ),

            missionClaimed:
                Boolean(
                    game.missionClaimed
                ),

            sound:
                game.sound !== false

        };


        console.log(
            "☁️ Saving game to Supabase:",
            gameData
        );


        const response =
            await fetch(
                SUPABASE_TELEGRAM_AUTH_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            initData:
                                tg.initData,

                            action:
                                "save",

                            game:
                                gameData

                        })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "❌ Supabase save error:",
                data
            );

            return false;

        }


        lastSupabaseSaveTime =
            Date.now();


        console.log(
            "☁️ Supabase game saved successfully"
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Supabase save exception:",
            error
        );

        return false;

    } finally {

        supabaseSaveInProgress = false;


        if (
            supabaseSavePending
        ) {

            supabaseSavePending =
                false;

            queueSupabaseSave();

        }

    }

}


// ==========================================
// QUEUE SUPABASE SAVE
// ==========================================

function queueSupabaseSave(
    immediate = false
) {

    if (
        !supabaseReady
    ) {

        return;

    }


    // ======================================
    // IMMEDIATE SAVE
    // ======================================

    if (
        immediate
    ) {

        if (
            supabaseSaveTimer
        ) {

            clearTimeout(
                supabaseSaveTimer
            );

            supabaseSaveTimer =
                null;

        }

        saveGameToSupabase();

        return;

    }


    if (
        supabaseSaveTimer
    ) {

        return;

    }


    const now =
        Date.now();


    const elapsed =
        now -
        lastSupabaseSaveTime;


    if (
        elapsed >=
        SUPABASE_SAVE_INTERVAL
    ) {

        saveGameToSupabase();

        return;

    }


    const remaining =
        SUPABASE_SAVE_INTERVAL -
        elapsed;


    supabaseSaveTimer =
        setTimeout(
            () => {

                supabaseSaveTimer =
                    null;

                saveGameToSupabase();

            },
            remaining
        );

}


// ==========================================
// GET DISPLAY NAME
// ==========================================

function getUserDisplayName(targetUser) {

    if (!targetUser) {

        return "Player";

    }

    const firstName =
        targetUser.firstName ||
        targetUser.first_name ||
        "";

    const lastName =
        targetUser.lastName ||
        targetUser.last_name ||
        "";

    const fullName =
        (
            firstName +
            " " +
            lastName
        ).trim();

    if (fullName) {

        return fullName;

    }

    if (targetUser.username) {

        return (
            "@" +
            targetUser.username
        );

    }

    return "Player";

}


// ==========================================
// GAME STATE
// ==========================================

const defaultState = {

    balance: 0,

    totalMined: 0,

    level: 1,

    xp: 0,

    tapPower: 1,

    energy: 1250,

    maxEnergy: 1250,

    mineRate: 4,

    tapLevel: 1,

    energyLevel: 1,

    boostLevel: 1,

    missionProgress: 0,

    missionClaimed: false,

    sound: true,


    // ==========================================
    // VIP
    // ==========================================

    vipLevel: 0,

    vipRewardClaimed: false,

    vipLastRewardDate: "",


    // ==========================================
    // REFERRAL
    // ==========================================

    referralCode: "",

    referralCount: 0,

    referralEarnings: 0,

    referredBy: "",

    referrals: [],


    // ==========================================
    // REFERRAL READY DATA
    // ==========================================

    pendingReferral: null,

    referralProcessed: false

};


let game = {

    ...defaultState

};


// ==========================================
// REFERRAL SETTINGS
// ==========================================

const REFERRAL_REWARD = 3000;


// ==========================================
// VIP SETTINGS
// ==========================================

const VIP_LEVELS = {

    0: {

        name: "Free Member",

        miningBonus: 0,

        energyBonus: 0,

        dailyReward: 0,

        price: 0

    },

    1: {

        name: "VIP 1",

        miningBonus: 10,

        energyBonus: 100,

        dailyReward: 500,

        price: 10000

    },

    2: {

        name: "VIP 2",

        miningBonus: 25,

        energyBonus: 250,

        dailyReward: 1000,

        price: 50000

    },

    3: {

        name: "VIP 3",

        miningBonus: 50,

        energyBonus: 500,

        dailyReward: 2500,

        price: 150000

    },

    4: {

        name: "VIP 4",

        miningBonus: 75,

        energyBonus: 750,

        dailyReward: 5000,

        price: 400000

    },

    5: {

        name: "VIP 5",

        miningBonus: 100,

        energyBonus: 1000,

        dailyReward: 10000,

        price: 1000000

    }

};


// ==========================================
// GET VIP DATA
// ==========================================

function getVIPData() {

    const level =
        Number(game.vipLevel) || 0;

    return (
        VIP_LEVELS[level] ||
        VIP_LEVELS[0]
    );

}


// ==========================================
// GET VIP PRICE
// ==========================================

function getVIPPrice(level) {

    const vip =
        VIP_LEVELS[level];

    if (!vip) {

        return 0;

    }

    return (
        Number(vip.price) || 0
    );

}


// ==========================================
// VIP MINING RATE
// ==========================================

function getEffectiveMineRate() {

    const vip =
        getVIPData();

    const baseRate =
        Number(game.mineRate) || 0;

    const bonus =
        vip.miningBonus || 0;

    return (

        baseRate *

        (
            1 +
            bonus / 100
        )

    );

}


// ==========================================
// VIP MAX ENERGY
// ==========================================

function getEffectiveMaxEnergy() {

    const vip =
        getVIPData();

    const baseEnergy =
        Number(game.maxEnergy) || 0;

    const bonus =
        vip.energyBonus || 0;

    return (
        baseEnergy +
        bonus
    );

}


// ==========================================
// TODAY DATE
// ==========================================

function getTodayDate() {

    const now =
        new Date();

    return (

        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0")

    );

}


// ==========================================
// BUY VIP
// ==========================================

function buyVIP(level) {

    const newLevel =
        Number(level);

    if (
        !Number.isInteger(
            newLevel
        )
    ) {

        showToast(
            "❌ Invalid VIP level"
        );

        return;

    }

    if (
        newLevel < 1 ||
        newLevel > 5
    ) {

        showToast(
            "❌ Invalid VIP level"
        );

        return;

    }

    if (
        newLevel <=
        Number(game.vipLevel)
    ) {

        showToast(
            "👑 You already have this VIP or higher"
        );

        return;

    }

    const vip =
        VIP_LEVELS[newLevel];

    if (!vip) {

        showToast(
            "❌ VIP not found"
        );

        return;

    }

    const cost =
        getVIPPrice(
            newLevel
        );

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.vipLevel =
        newLevel;

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (
        game.energy >
        effectiveMaxEnergy
    ) {

        game.energy =
            effectiveMaxEnergy;

    }

    game.vipRewardClaimed =
        false;

    game.vipLastRewardDate =
        "";

    saveGame();

    updateUI();

    if (
        tg &&
        tg.HapticFeedback
    ) {

        tg.HapticFeedback
            .impactOccurred(
                "medium"
            );

    }

    showToast(

        "👑 " +
        vip.name +
        " activated!"

    );

    console.log(
        "👑 VIP purchased:",
        newLevel,
        vip
    );

}


// ==========================================
// CLAIM VIP DAILY REWARD
// ==========================================

function claimVIPDailyReward() {

    const vip =
        getVIPData();

    if (
        game.vipLevel <= 0 ||
        vip.dailyReward <= 0
    ) {

        showToast(
            "🔒 VIP reward is locked"
        );

        return;

    }

    const today =
        getTodayDate();

    if (
        game.vipLastRewardDate ===
        today
    ) {

        showToast(
            "🎁 VIP reward already claimed"
        );

        return;

    }

    game.balance +=
        vip.dailyReward;

    game.vipLastRewardDate =
        today;

    game.vipRewardClaimed =
        true;

    saveGame();

    updateUI();

    showToast(
        "🎁 +" +
        formatNumber(
            vip.dailyReward
        ) +
        " BSHIB VIP Reward"
    );

}


// ==========================================
// SET VIP LEVEL
// ==========================================

function setVIPLevel(level) {

    const newLevel =
        Number(level);

    if (
        !Number.isInteger(
            newLevel
        )
    ) {

        return;

    }

    if (
        newLevel < 0 ||
        newLevel > 5
    ) {

        return;

    }

    game.vipLevel =
        newLevel;

    const effectiveMax =
        getEffectiveMaxEnergy();

    if (
        game.energy >
        effectiveMax
    ) {

        game.energy =
            effectiveMax;

    }

    saveGame();

    updateUI();

    console.log(
        "👑 VIP level changed:",
        game.vipLevel
    );

}


// ==========================================
// REFERRAL CODE
// ==========================================

function generateReferralCode() {

    if (game.referralCode) {

        return game.referralCode;

    }

    if (user && user.id) {

        game.referralCode =
            "BSHIB" +
            String(user.id);

    } else {

        game.referralCode =
            "BSHIBGUEST";

    }

    saveGame();

    return game.referralCode;

}


// ==========================================
// GET REFERRAL CODE
// ==========================================

function getReferralCode() {

    if (game.referralCode) {

        return game.referralCode;

    }

    if (user && user.id) {

        return (
            "BSHIB" +
            String(user.id)
        );

    }

    return "BSHIBGUEST";

}


// ==========================================
// GET REFERRAL LINK
// ==========================================

function getReferralLink() {

    const code =
        getReferralCode();

    return (

        "https://t.me/" +
        "shibababycoinbot" +
        "?startapp=" +
        encodeURIComponent(code)

    );

}


// ==========================================
// READ INCOMING REFERRAL
// ==========================================

function getIncomingReferral() {

    if (!tg) {

        return "";

    }

    const startParam =
        tg.initDataUnsafe?.start_param;

    if (!startParam) {

        return "";

    }

    return String(startParam);

}


// ==========================================
// CREATE REFERRAL USER DATA
// ==========================================

function createReferralUserData() {

    const currentUser =
        getTelegramUser();

    return {

        id:
            currentUser.id || null,

        firstName:
            currentUser.firstName ||
            "Player",

        lastName:
            currentUser.lastName ||
            "",

        username:
            currentUser.username ||
            "",

        displayName:
            getUserDisplayName(
                currentUser
            ),

        joinedAt:
            new Date().toISOString(),

        reward:
            REFERRAL_REWARD,

        rewardPaid:
            false

    };

}


// ==========================================
// PROCESS INCOMING REFERRAL
// ==========================================

function processReferral() {

    const incomingReferral =
        getIncomingReferral();

    if (!incomingReferral) {

        return;

    }

    console.log(
        "🔗 Incoming referral:",
        incomingReferral
    );

    if (
        game.referralProcessed ||
        game.referredBy
    ) {

        console.log(
            "ℹ️ Referral already processed:",
            game.referredBy
        );

        return;

    }

    const myCode =
        getReferralCode();

    if (
        incomingReferral ===
        myCode
    ) {

        console.log(
            "❌ Self referral blocked"
        );

        return;

    }

    if (
        !incomingReferral.startsWith(
            "BSHIB"
        )
    ) {

        console.log(
            "⚠️ Invalid BSHIB referral code:",
            incomingReferral
        );

        return;

    }

    game.referredBy =
        incomingReferral;

    game.referralProcessed =
        true;

    const referralUser =
        createReferralUserData();

    game.pendingReferral = {

        inviterCode:
            incomingReferral,

        invitedUser:
            referralUser,

        status:
            "pending_serverless",

        createdAt:
            new Date().toISOString()

    };

    saveGame();

    updateUI();

    showToast(
        "🔗 Referral recorded!"
    );

    console.log(
        "✅ Referral ready for Serverless:",
        game.pendingReferral
    );

}


// ==========================================
// LOCAL STORAGE KEY
// ==========================================

function getGameStorageKey() {

    if (user && user.id) {

        return (
            "babyShibaGame_" +
            String(user.id)
        );

    }

    return "babyShibaGame_GUEST";

}


// ==========================================
// LOCAL BACKUP SAVE
// ==========================================

function saveLocalBackup() {

    try {

        const key =
            getGameStorageKey();

        const data =
            JSON.stringify(game);

        localStorage.setItem(
            key,
            data
        );

        console.log(
            "💾 Local backup saved:",
            key
        );

    } catch (error) {

        console.log(
            "❌ Local backup save error:",
            error
        );

    }

}


// ==========================================
// LOCAL BACKUP LOAD
// ==========================================

function loadLocalBackup() {

    try {

        const key =
            getGameStorageKey();

        const saved =
            localStorage.getItem(
                key
            );

        if (!saved) {

            return false;

        }

        const parsed =
            JSON.parse(saved);

        game = {

            ...defaultState,

            ...parsed

        };

        console.log(
            "💾 Local backup loaded:",
            game
        );

        return true;

    } catch (error) {

        console.log(
            "❌ Local backup load error:",
            error
        );

        return false;

    }

}


// ==========================================
// TELEGRAM CLOUD STORAGE SAVE
// ==========================================

function saveGame() {

    // ======================================
    // LOCAL BACKUP
    // ======================================

    saveLocalBackup();


    // ======================================
    // SUPABASE
    // ======================================

    queueSupabaseSave();


    // ======================================
    // TELEGRAM CLOUD STORAGE
    // ======================================

    if (saveInProgress) {

        savePending = true;

        return;

    }

    try {

        const storage =

            window.Telegram &&

            Telegram.WebApp &&

            Telegram.WebApp.CloudStorage;

        if (!storage) {

            console.log(
                "⚠️ CloudStorage unavailable - local + Supabase backup used"
            );

            return;

        }

        saveInProgress = true;

        savePending = false;

        const data =
            JSON.stringify(game);

        storage.setItem(

            "game",

            data,

            function(error, success) {

                saveInProgress = false;

                if (error) {

                    console.log(
                        "❌ CloudStorage save error:",
                        error
                    );

                } else {

                    console.log(
                        "☁️ CloudStorage saved:",
                        success
                    );

                }

                if (savePending) {

                    savePending = false;

                    saveGame();

                }

            }

        );

    } catch (error) {

        saveInProgress = false;

        console.log(
            "❌ Save exception:",
            error
        );

    }

}


// ==========================================
// MERGE LOCAL + CLOUD SAFELY
// ==========================================

function mergeGameStates(
    localGame,
    cloudGame
) {

    const localState = {

        ...defaultState,

        ...(localGame || {})

    };


    const cloudState = {

        ...defaultState,

        ...(cloudGame || {})

    };


    const localBalance =
        safeNumber(
            localState.balance,
            0
        );


    const cloudBalance =
        safeNumber(
            cloudState.balance,
            0
        );


    // ======================================
    // BALANCE PROTECTION
    //
    // Non-zero balance must NEVER be
    // replaced by zero automatically.
    // ======================================

    let finalBalance = 0;


    if (
        localBalance > 0 &&
        cloudBalance <= 0
    ) {

        finalBalance =
            localBalance;

    } else if (
        cloudBalance > 0 &&
        localBalance <= 0
    ) {

        finalBalance =
            cloudBalance;

    } else if (
        localBalance > 0 &&
        cloudBalance > 0
    ) {

        // Keep the larger valid balance.
        // This prevents an older zero/smaller
        // value from destroying progress.
        finalBalance =
            Math.max(
                localBalance,
                cloudBalance
            );

    } else {

        finalBalance = 0;

    }


    const merged = {

        ...defaultState,

        ...localState,

        balance:
            finalBalance,

        totalMined:
            Math.max(
                safeNumber(
                    localState.totalMined,
                    0
                ),
                safeNumber(
                    cloudState.totalMined,
                    0
                )
            ),

        level:
            Math.max(
                1,
                safeNumber(
                    localState.level,
                    1
                ),
                safeNumber(
                    cloudState.level,
                    1
                )
            ),

        xp:
            Math.max(
                safeNumber(
                    localState.xp,
                    0
                ),
                safeNumber(
                    cloudState.xp,
                    0
                )
            ),

        tapPower:
            Math.max(
                1,
                safeNumber(
                    localState.tapPower,
                    1
                ),
                safeNumber(
                    cloudState.tapPower,
                    1
                )
            ),

        maxEnergy:
            Math.max(
                1250,
                safeNumber(
                    localState.maxEnergy,
                    1250
                ),
                safeNumber(
                    cloudState.maxEnergy,
                    1250
                )
            ),

        mineRate:
            Math.max(
                4,
                safeNumber(
                    localState.mineRate,
                    4
                ),
                safeNumber(
                    cloudState.mineRate,
                    4
                )
            ),

        tapLevel:
            Math.max(
                1,
                safeNumber(
                    localState.tapLevel,
                    1
                ),
                safeNumber(
                    cloudState.tapLevel,
                    1
                )
            ),

        energyLevel:
            Math.max(
                1,
                safeNumber(
                    localState.energyLevel,
                    1
                ),
                safeNumber(
                    cloudState.energyLevel,
                    1
                )
            ),

        boostLevel:
            Math.max(
                1,
                safeNumber(
                    localState.boostLevel,
                    1
                ),
                safeNumber(
                    cloudState.boostLevel,
                    1
                )
            ),

        missionProgress:
            Math.max(
                safeNumber(
                    localState.missionProgress,
                    0
                ),
                safeNumber(
                    cloudState.missionProgress,
                    0
                )
            ),

        // Energy should use the cloud value
        // when it is valid, otherwise local.
        energy:
            Number.isFinite(
                Number(cloudState.energy)
            )
                ? Math.max(
                    0,
                    Number(cloudState.energy)
                )
                : Math.max(
                    0,
                    safeNumber(
                        localState.energy,
                        1250
                    )
                ),

        missionClaimed:
            Boolean(
                localState.missionClaimed ||
                cloudState.missionClaimed
            ),

        sound:
            localState.sound !== false &&
            cloudState.sound !== false,

        // ==================================
        // VIP
        // ==================================

        vipLevel:
            Math.max(
                0,
                Math.min(
                    5,
                    safeNumber(
                        localState.vipLevel,
                        0
                    )
                )
            ),

        vipRewardClaimed:
            Boolean(
                localState.vipRewardClaimed ||
                cloudState.vipRewardClaimed
            ),

        vipLastRewardDate:
            localState.vipLastRewardDate ||
            cloudState.vipLastRewardDate ||
            "",

        // ==================================
        // REFERRAL
        // ==================================

        referralCode:
            localState.referralCode ||
            cloudState.referralCode ||
            "",

        referralCount:
            Math.max(
                0,
                safeNumber(
                    localState.referralCount,
                    0
                ),
                safeNumber(
                    cloudState.referralCount,
                    0
                )
            ),

        referralEarnings:
            Math.max(
                0,
                safeNumber(
                    localState.referralEarnings,
                    0
                ),
                safeNumber(
                    cloudState.referralEarnings,
                    0
                )
            ),

        referredBy:
            localState.referredBy ||
            cloudState.referredBy ||
            "",

        referrals:
            Array.isArray(
                localState.referrals
            )
                ? localState.referrals
                : (
                    Array.isArray(
                        cloudState.referrals
                    )
                        ? cloudState.referrals
                        : []
                ),

        pendingReferral:
            localState.pendingReferral ||
            cloudState.pendingReferral ||
            null,

        referralProcessed:
            Boolean(
                localState.referralProcessed ||
                cloudState.referralProcessed
            )

    };


    // ======================================
    // FINAL SAFETY
    // ======================================

    if (
        merged.energy < 0
    ) {

        merged.energy = 0;

    }


    if (
        merged.level < 1
    ) {

        merged.level = 1;

    }


    if (
        merged.mineRate < 4
    ) {

        merged.mineRate = 4;

    }


    if (
        merged.maxEnergy < 1250
    ) {

        merged.maxEnergy = 1250;

    }


    return merged;

}


// ==========================================
// LOAD FROM TELEGRAM CLOUD STORAGE
// SAFE RECOVERY VERSION
// ==========================================

async function loadGameFromTelegram() {

    return new Promise((resolve) => {

        const storage =

            window.Telegram &&

            Telegram.WebApp &&

            Telegram.WebApp.CloudStorage;


        // ======================================
        // LOCAL BACKUP
        // ======================================

        let localGame = null;

        try {

            const key =
                getGameStorageKey();

            const localSaved =
                localStorage.getItem(
                    key
                );

            if (localSaved) {

                localGame =
                    JSON.parse(
                        localSaved
                    );

                console.log(
                    "💾 Local recovery data found:",
                    localGame
                );

            }

        } catch (error) {

            console.log(
                "⚠️ Local recovery read failed:",
                error
            );

        }


        // ======================================
        // NO CLOUD STORAGE
        // ======================================

        if (!storage) {

            console.log(
                "⚠️ CloudStorage unavailable"
            );


            if (localGame) {

                game =
                    mergeGameStates(
                        localGame,
                        null
                    );

            } else {

                game = {

                    ...defaultState

                };

            }


            saveLocalBackup();

            resolve(true);

            return;

        }


        // ======================================
        // GET CLOUD
        // ======================================

        storage.getItem(

            "game",

            function(error, value) {

                if (error) {

                    console.log(
                        "❌ CloudStorage load error:",
                        error
                    );


                    if (localGame) {

                        game =
                            mergeGameStates(
                                localGame,
                                null
                            );

                    } else {

                        game = {

                            ...defaultState

                        };

                    }


                    saveLocalBackup();

                    resolve(true);

                    return;

                }


                let cloudGame = null;


                if (value) {

                    try {

                        cloudGame =
                            JSON.parse(
                                value
                            );

                        console.log(
                            "☁️ CloudStorage data found:",
                            cloudGame
                        );

                    } catch (parseError) {

                        console.log(
                            "❌ CloudStorage JSON error:",
                            parseError
                        );

                    }

                } else {

                    console.log(
                        "🆕 No CloudStorage data"
                    );

                }


                // ==================================
                // MERGE BOTH SOURCES
                // ==================================

                game =
                    mergeGameStates(
                        localGame,
                        cloudGame
                    );


                console.log(
                    "🛡️ SAFE RECOVERED GAME:",
                    game
                );


                // ==================================
                // WRITE RECOVERED STATE LOCALLY
                // ==================================

                saveLocalBackup();


                // ==================================
                // IMPORTANT:
                // Only rewrite Telegram CloudStorage
                // after the merge is complete.
                // ==================================

                try {

                    storage.setItem(
                        "game",
                        JSON.stringify(game),
                        function(
                            saveError,
                            saveSuccess
                        ) {

                            if (saveError) {

                                console.log(
                                    "⚠️ Recovered CloudStorage save error:",
                                    saveError
                                );

                            } else {

                                console.log(
                                    "✅ Recovered state written to CloudStorage:",
                                    saveSuccess
                                );

                            }

                            resolve(true);

                        }
                    );

                } catch (saveError) {

                    console.log(
                        "⚠️ CloudStorage recovery write exception:",
                        saveError
                    );

                    resolve(true);

                }

            }

        );

    });

}


// ==========================================
// PAGE SYSTEM
// ==========================================

function showPage(pageId) {

    const pages =
        document.querySelectorAll(
            ".game-page"
        );

    pages.forEach(page => {

        page.classList.remove(
            "active"
        );

    });

    const selected =
        document.getElementById(
            pageId
        );

    if (selected) {

        selected.classList.add(
            "active"
        );

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    updateNavigation(pageId);

}


// ==========================================
// NAVIGATION
// ==========================================

function updateNavigation(pageId) {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        if (
            item.dataset.page ===
            pageId
        ) {

            item.classList.add(
                "active"
            );

        } else {

            item.classList.remove(
                "active"
            );

        }

    });

}


// ==========================================
// SETUP NAVIGATION
// ==========================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.addEventListener(

            "click",

            () => {

                const pageId =
                    item.dataset.page;

                if (pageId) {

                    showPage(pageId);

                }

            }

        );

    });

}


// ==========================================
// START GAME
// ==========================================

function startGame() {

    const intro =
        document.getElementById(
            "introPage"
        );

    const gameApp =
        document.getElementById(
            "gameApp"
        );

    if (intro) {

        intro.classList.add(
            "hidden"
        );

    }

    if (gameApp) {

        gameApp.classList.remove(
            "hidden"
        );

    }

    showPage(
        "miningPage"
    );

    if (
        tg &&
        tg.HapticFeedback
    ) {

        tg.HapticFeedback
            .impactOccurred(
                "medium"
            );

    }

}


// ==========================================
// PLAYER INFO
// ==========================================

function updatePlayerInfo() {

    const nameElement =
        document.getElementById(
            "playerName"
        );

    const idElement =
        document.getElementById(
            "playerId"
        );

    if (nameElement) {

        if (
            user &&
            user.username
        ) {

            nameElement.textContent =
                "@" +
                user.username;

        } else {

            nameElement.textContent =

                (

                    user &&
                    user.firstName

                        ? user.firstName

                        : "Player"

                ) +

                (

                    user &&
                    user.lastName

                        ? " " +
                          user.lastName

                        : ""

                );

        }

    }

    if (idElement) {

        idElement.textContent =

            user &&
            user.id

                ? "Telegram ID: " +
                  user.id

                : "Telegram ID: Guest";

    }

}


// ==========================================
// UI
// ==========================================

function updateUI() {

    const balance =
        document.getElementById(
            "balance"
        );

    const totalMined =
        document.getElementById(
            "totalMined"
        );

    const level =
        document.getElementById(
            "level"
        );

    const levelName =
        document.getElementById(
            "levelName"
        );

    const xpFill =
        document.getElementById(
            "xpFill"
        );

    const tapPower =
        document.getElementById(
            "tapPower"
        );

    const energy =
        document.getElementById(
            "energy"
        );

    const maxEnergy =
        document.getElementById(
            "maxEnergy"
        );

    const energyFill =
        document.getElementById(
            "energyFill"
        );

    const mineRate =
        document.getElementById(
            "mineRate"
        );

    const statsMineRate =
        document.getElementById(
            "statsMineRate"
        );

    const missionProgress =
        document.getElementById(
            "missionProgress"
        );

    const missionFill =
        document.getElementById(
            "missionFill"
        );

    const tapCost =
        document.getElementById(
            "tapCost"
        );

    const energyCost =
        document.getElementById(
            "energyCost"
        );

    const boostCost =
        document.getElementById(
            "boostCost"
        );

    if (balance) {

        balance.textContent =
            formatNumber(
                game.balance
            );

    }

    if (totalMined) {

        totalMined.textContent =
            formatNumber(
                game.totalMined
            );

    }

    if (level) {

        level.textContent =
            game.level;

    }

    if (levelName) {

        levelName.textContent =
            getLevelName(
                game.level
            );

    }

    if (tapPower) {

        tapPower.textContent =
            game.tapPower;

    }

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (energy) {

        energy.textContent =
            Math.floor(
                game.energy
            );

    }

    if (maxEnergy) {

        maxEnergy.textContent =
            effectiveMaxEnergy;

    }

    const effectiveMineRate =
        getEffectiveMineRate();

    if (mineRate) {

        mineRate.textContent =
            formatMiningRate(
                effectiveMineRate
            ) +
            " BSHIB/s";

    }

    if (statsMineRate) {

        statsMineRate.textContent =
            formatMiningRate(
                effectiveMineRate
            );

    }

    if (energyFill) {

        const percent =

            (
                game.energy /
                effectiveMaxEnergy
            ) * 100;

        energyFill.style.width =

            Math.max(

                0,

                Math.min(
                    100,
                    percent
                )

            ) + "%";

    }

    if (xpFill) {

        const required =
            game.level * 1000;

        const percent =

            (
                game.xp /
                required
            ) * 100;

        xpFill.style.width =

            Math.max(

                0,

                Math.min(
                    100,
                    percent
                )

            ) + "%";

    }

    if (missionProgress) {

        missionProgress.textContent =

            Math.min(
                game.missionProgress,
                1000
            ) +
            " / 1000";

    }

    if (missionFill) {

        const percent =

            (
                Math.min(
                    game.missionProgress,
                    1000
                ) / 1000
            ) * 100;

        missionFill.style.width =
            percent + "%";

    }

    if (tapCost) {

        tapCost.textContent =
            formatNumber(
                getTapCost()
            );

    }

    if (energyCost) {

        energyCost.textContent =
            formatNumber(
                getEnergyCost()
            );

    }

    if (boostCost) {

        boostCost.textContent =
            formatNumber(
                getBoostCost()
            );

    }

    const refCode =
        document.getElementById(
            "refCode"
        );

    if (refCode) {

        refCode.textContent =
            getReferralCode();

    }

    const referralCount =
        document.getElementById(
            "referralCount"
        );

    if (referralCount) {

        referralCount.textContent =
            game.referralCount;

    }

    const referralEarnings =
        document.getElementById(
            "referralEarnings"
        );

    if (referralEarnings) {

        referralEarnings.textContent =
            formatNumber(
                game.referralEarnings
            );

    }

    const referralName =
        document.getElementById(
            "referralName"
        );

    if (referralName) {

        if (
            game.pendingReferral &&
            game.pendingReferral.invitedUser
        ) {

            referralName.textContent =
                game.pendingReferral
                    .invitedUser
                    .displayName;

        } else {

            referralName.textContent =
                "";

        }

    }


    // ======================================
    // VIP
    // ======================================

    const vip =
        getVIPData();

    const vipLevel =
        document.getElementById(
            "vipLevel"
        );

    const vipLevelName =
        document.getElementById(
            "vipLevelName"
        );

    const vipMiningBonus =
        document.getElementById(
            "vipMiningBonus"
        );

    const vipEnergyBonus =
        document.getElementById(
            "vipEnergyBonus"
        );

    const vipDailyReward =
        document.getElementById(
            "vipDailyReward"
        );

    const vipCurrentName =
        document.getElementById(
            "vipCurrentName"
        );

    if (vipLevel) {

        vipLevel.textContent =
            "VIP " +
            game.vipLevel;

    }

    if (vipLevelName) {

        vipLevelName.textContent =
            vip.name;

    }

    if (vipMiningBonus) {

        vipMiningBonus.textContent =
            "+" +
            vip.miningBonus +
            "%";

    }

    if (vipEnergyBonus) {

        vipEnergyBonus.textContent =
            "+" +
            vip.energyBonus;

    }

    if (vipDailyReward) {

        if (
            vip.dailyReward > 0
        ) {

            vipDailyReward.textContent =
                formatNumber(
                    vip.dailyReward
                ) +
                " BSHIB";

        } else {

            vipDailyReward.textContent =
                "Locked";

        }

    }

    if (vipCurrentName) {

        vipCurrentName.textContent =
            vip.name;

    }

    const vipDailyButton =
        document.getElementById(
            "claimVipReward"
        );

    if (vipDailyButton) {

        if (
            game.vipLevel <= 0
        ) {

            vipDailyButton.disabled =
                true;

            vipDailyButton.textContent =
                "🔒 VIP Reward Locked";

        } else if (
            game.vipLastRewardDate ===
            getTodayDate()
        ) {

            vipDailyButton.disabled =
                true;

            vipDailyButton.textContent =
                "✅ Reward Claimed";

        } else {

            vipDailyButton.disabled =
                false;

            vipDailyButton.textContent =
                "🎁 Claim VIP Reward";

        }

    }

    for (
        let levelNumber = 1;
        levelNumber <= 5;
        levelNumber++
    ) {

        const card =
            document.querySelector(
                '[data-vip-level="' +
                levelNumber +
                '"]'
            );

        if (!card) {

            continue;

        }

        const buyButton =
            card.querySelector(
                ".vip-buy-btn"
            );

        const priceElement =
            card.querySelector(
                ".vip-price"
            );

        const vipCardData =
            VIP_LEVELS[levelNumber];

        if (priceElement) {

            priceElement.textContent =
                formatNumber(
                    vipCardData.price
                ) +
                " BSHIB";

        }

        if (buyButton) {

            if (
                game.vipLevel >=
                levelNumber
            ) {

                buyButton.disabled =
                    true;

                buyButton.textContent =
                    "✅ Active";

            } else {

                buyButton.disabled =
                    false;

                buyButton.textContent =
                    "👑 Activate VIP " +
                    levelNumber;

            }

        }

        if (
            game.vipLevel ===
            levelNumber
        ) {

            card.classList.add(
                "current-vip"
            );

        } else {

            card.classList.remove(
                "current-vip"
            );

        }

    }

}


// ==========================================
// NUMBER
// ==========================================

function formatNumber(number) {

    return Math.floor(number)
        .toLocaleString(
            "en-US"
        );

}


// ==========================================
// MINING RATE FORMAT
// ==========================================

function formatMiningRate(number) {

    if (
        Number.isInteger(number)
    ) {

        return String(number);

    }

    return number.toFixed(2);

}


// ==========================================
// LEVEL NAME
// ==========================================

function getLevelName(level) {

    if (level >= 20) {

        return "Shiba Legend";

    }

    if (level >= 15) {

        return "Shiba Master";

    }

    if (level >= 10) {

        return "Shiba Elite";

    }

    if (level >= 5) {

        return "Shiba Warrior";

    }

    return "Shiba Rookie";

}


// ==========================================
// XP
// ==========================================

function addXP(amount) {

    game.xp += amount;

    const required =
        game.level * 1000;

    if (
        game.xp >=
        required
    ) {

        game.xp -= required;

        game.level++;

        saveGame();

        console.log(
            "💾 Level saved:",
            game.level
        );

        showToast(
            "🎉 Level Up! Level " +
            game.level
        );

    }

}


// ==========================================
// MINING
// ==========================================

function mine() {

    if (
        game.energy <= 0
    ) {

        showToast(
            "⚡ Energy is empty!"
        );

        return;

    }

    const effectiveMineRate =
        getEffectiveMineRate();

    const amount =

        game.tapPower +
        effectiveMineRate -
        1;

    game.balance +=
        amount;

    game.totalMined +=
        amount;

    game.energy -=
        1;

    game.missionProgress +=
        amount;

    addXP(amount);

    createCoinEffect(
        amount
    );

    if (
        tg &&
        tg.HapticFeedback
    ) {

        tg.HapticFeedback
            .impactOccurred(
                "light"
            );

    }

    saveGame();

    updateUI();

}


// ==========================================
// AUTO MINING
// ==========================================

setInterval(() => {

    if (
        game.energy <= 0
    ) {

        return;

    }

    const amount =
        getEffectiveMineRate();

    game.balance +=
        amount;

    game.totalMined +=
        amount;

    game.energy -=
        1;

    game.missionProgress +=
        amount;

    addXP(amount);

    saveGame();

    updateUI();

}, 1000);


// ==========================================
// ENERGY REGENERATION
// ==========================================

setInterval(() => {

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (
        game.energy <
        effectiveMaxEnergy
    ) {

        game.energy += 5;

        if (
            game.energy >
            effectiveMaxEnergy
        ) {

            game.energy =
                effectiveMaxEnergy;

        }

        saveGame();

        updateUI();

    }

}, 1000);


// ==========================================
// UPGRADE COSTS
// ==========================================

function getTapCost() {

    return Math.floor(

        100 *

        Math.pow(
            1.6,
            game.tapLevel - 1
        )

    );

}


function getEnergyCost() {

    return Math.floor(

        250 *

        Math.pow(
            1.7,
            game.energyLevel - 1
        )

    );

}


function getBoostCost() {

    return Math.floor(

        500 *

        Math.pow(
            1.8,
            game.boostLevel - 1
        )

    );

}


// ==========================================
// TAP UPGRADE
// ==========================================

function upgradeTap() {

    const cost =
        getTapCost();

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.tapPower +=
        1;

    game.tapLevel +=
        1;

    showToast(
        "⚡ Tap Power upgraded!"
    );

    saveGame();

    updateUI();

}


// ==========================================
// ENERGY UPGRADE
// ==========================================

function upgradeEnergy() {

    const cost =
        getEnergyCost();

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.maxEnergy +=
        250;

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    game.energy =
        effectiveMaxEnergy;

    game.energyLevel +=
        1;

    showToast(
        "🔋 Energy upgraded!"
    );

    saveGame();

    updateUI();

}


// ==========================================
// BOOST UPGRADE
// ==========================================

function upgradeBoost() {

    const cost =
        getBoostCost();

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.mineRate +=
        1;

    game.boostLevel +=
        1;

    showToast(
        "🚀 Mining Boost upgraded!"
    );

    saveGame();

    updateUI();

}


// ==========================================
// REFERRAL UI
// ==========================================

function setupReferral() {

    const refCode =
        document.getElementById(
            "refCode"
        );

    if (refCode) {

        refCode.textContent =
            getReferralCode();

    }

    const referralCount =
        document.getElementById(
            "referralCount"
        );

    if (referralCount) {

        referralCount.textContent =
            game.referralCount;

    }

    const referralEarnings =
        document.getElementById(
            "referralEarnings"
        );

    if (referralEarnings) {

        referralEarnings.textContent =
            formatNumber(
                game.referralEarnings
            );

    }

    const referralName =
        document.getElementById(
            "referralName"
        );

    if (referralName) {

        if (
            game.pendingReferral &&
            game.pendingReferral.invitedUser
        ) {

            referralName.textContent =
                game.pendingReferral
                    .invitedUser
                    .displayName;

        } else {

            referralName.textContent =
                "";

        }

    }

}


// ==========================================
// COPY REFERRAL
// ==========================================

function copyReferral() {

    const code =
        getReferralCode();

    if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(code)
            .then(() => {

                showToast(
                    "📋 Referral copied!"
                );

            })
            .catch(() => {

                showToast(
                    "Copy failed"
                );

            });

    } else {

        showToast(
            "Copy not available"
        );

    }

}


// ==========================================
// INVITE FRIENDS
// ==========================================

function inviteFriends() {

    const link =
        getReferralLink();

    const shareUrl =

        "https://t.me/share/url?url=" +

        encodeURIComponent(link) +

        "&text=" +

        encodeURIComponent(
            "🐕 Join Baby Shiba Inu Mining!"
        );

    if (
        tg &&
        tg.openTelegramLink
    ) {

        tg.openTelegramLink(
            shareUrl
        );

    } else {

        if (
            navigator.clipboard
        ) {

            navigator.clipboard
                .writeText(link)
                .then(() => {

                    showToast(
                        "📨 Invite link copied!"
                    );

                });

        }

    }

}


// ==========================================
// MISSION
// ==========================================

function claimMission() {

    if (
        game.missionProgress <
        1000
    ) {

        showToast(
            "🎯 Mission not completed"
        );

        return;

    }

    if (game.missionClaimed) {

        showToast(
            "✅ Mission already claimed"
        );

        return;

    }

    game.balance +=
        100;

    game.missionClaimed =
        true;

    showToast(
        "🎁 +100 BSHIB Mission Reward"
    );

    saveGame();

    updateUI();

}


// ==========================================
// WALLET
// ==========================================

function connectWallet() {

    showToast(
        "🔐 Wallet coming soon"
    );

}


// ==========================================
// SOUND
// ==========================================

function toggleSound() {

    game.sound =
        !game.sound;

    const button =
        document.getElementById(
            "soundBtn"
        );

    if (button) {

        button.textContent =

            game.sound
                ? "🔊"
                : "🔇";

    }

    saveGame();

}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastText =
        document.getElementById(
            "toastText"
        );

    if (
        !toast ||
        !toastText
    ) {

        return;

    }

    toastText.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2200);

}


// ==========================================
// COIN EFFECT
// ==========================================

function createCoinEffect(amount) {

    const effects =
        document.getElementById(
            "effects"
        );

    if (!effects) {

        return;

    }

    const coin =
        document.createElement(
            "div"
        );

    coin.className =
        "coin-effect";

    coin.textContent =
        "+" + amount;

    coin.style.left =

        (
            45 +
            Math.random() * 10
        ) + "%";

    coin.style.top =
        "45%";

    effects.appendChild(
        coin
    );

    setTimeout(() => {

        coin.remove();

    }, 1000);

}


// ==========================================
// SHOP - ENERGY PACK
// ==========================================

function buyEnergyPack() {

    const cost = 250;

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (
        game.energy >=
        effectiveMaxEnergy
    ) {

        showToast(
            "⚡ Energy is already full!"
        );

        return;

    }

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.energy =

        Math.min(

            game.energy + 500,

            effectiveMaxEnergy

        );

    saveGame();

    updateUI();

    showToast(
        "⚡ +500 Energy!"
    );

}


// ==========================================
// SHOP - MINING BOOST
// ==========================================

function buyMiningBoost() {

    const cost = 500;

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.mineRate +=
        1;

    saveGame();

    updateUI();

    showToast(
        "🚀 Mining Boost +1!"
    );

}


// ==========================================
// BUTTONS
// ==========================================

function setupButtons() {

    const startButton =
        document.getElementById(
            "startGame"
        );

    const mineButton =
        document.getElementById(
            "shibaButton"
        );

    const soundButton =
        document.getElementById(
            "soundBtn"
        );

    const upgradeTapButton =
        document.getElementById(
            "upgradeTap"
        );

    const upgradeEnergyButton =
        document.getElementById(
            "upgradeEnergy"
        );

    const upgradeBoostButton =
        document.getElementById(
            "upgradeBoost"
        );

    const buyEnergyPackButton =
        document.getElementById(
            "buyEnergyPack"
        );

    const buyMiningBoostButton =
        document.getElementById(
            "buyMiningBoost"
        );

    const copyRefButton =
        document.getElementById(
            "copyRef"
        );

    const inviteButton =
        document.getElementById(
            "inviteBtn"
        );

    const claimMissionButton =
        document.getElementById(
            "claimMission"
        );

    const walletButton =
        document.getElementById(
            "walletBtn"
        );

    const claimVIPButton =
        document.getElementById(
            "claimVipReward"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            startGame
        );

    }

    if (mineButton) {

        mineButton.addEventListener(
            "click",
            mine
        );

    }

    if (soundButton) {

        soundButton.addEventListener(
            "click",
            toggleSound
        );

    }

    if (upgradeTapButton) {

        upgradeTapButton.addEventListener(
            "click",
            upgradeTap
        );

    }

    if (upgradeEnergyButton) {

        upgradeEnergyButton.addEventListener(
            "click",
            upgradeEnergy
        );

    }

    if (upgradeBoostButton) {

        upgradeBoostButton.addEventListener(
            "click",
            upgradeBoost
        );

    }

    if (buyEnergyPackButton) {

        buyEnergyPackButton.addEventListener(
            "click",
            buyEnergyPack
        );

    }

    if (buyMiningBoostButton) {

        buyMiningBoostButton.addEventListener(
            "click",
            buyMiningBoost
        );

    }

    if (copyRefButton) {

        copyRefButton.addEventListener(
            "click",
            copyReferral
        );

    }

    if (inviteButton) {

        inviteButton.addEventListener(
            "click",
            inviteFriends
        );

    }

    if (claimMissionButton) {

        claimMissionButton.addEventListener(
            "click",
            claimMission
        );

    }

    if (walletButton) {

        walletButton.addEventListener(
            "click",
            connectWallet
        );

    }

    if (claimVIPButton) {

        claimVIPButton.addEventListener(
            "click",
            claimVIPDailyReward
        );

    }

    const vipBuyButtons =
        document.querySelectorAll(
            ".vip-buy-btn"
        );

    vipBuyButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    const level =
                        Number(
                            this.dataset.vipLevel
                        );

                    buyVIP(level);

                }
            );

        }
    );

}


// ==========================================
// INITIALIZE APP
// ==========================================

async function initApp() {

    initTelegram();

    refreshUser();


    console.log(
        "👤 Telegram ID before load:",
        user.id
    );

    console.log(
        "👤 Telegram username:",
        user.username
    );


    // ======================================
    // LOAD LOCAL + TELEGRAM SAFELY
    // ======================================

    await loadGameFromTelegram();


    refreshUser();


    // ======================================
    // SUPABASE AUTH
    //
    // IMPORTANT:
    // Authentication only.
    // It does NOT overwrite game state.
    // ======================================

    const supabaseData =
        await authenticateWithSupabase();


    if (
        supabaseData
    ) {

        console.log(
            "☁️ Supabase connected - SAVE mode active"
        );

    } else {

        console.log(
            "⚠️ Supabase unavailable - backup storage remains active"
        );

    }


    // ======================================
    // VIP DATA SAFETY
    // ======================================

    if (
        typeof game.vipLevel !==
        "number"
    ) {

        game.vipLevel = 0;

    }

    if (
        game.vipLevel < 0 ||
        game.vipLevel > 5
    ) {

        game.vipLevel = 0;

    }

    if (
        typeof game.vipRewardClaimed !==
        "boolean"
    ) {

        game.vipRewardClaimed =
            false;

    }

    if (
        typeof game.vipLastRewardDate !==
        "string"
    ) {

        game.vipLastRewardDate =
            "";

    }


    // ======================================
    // BASIC GAME DATA SAFETY
    // ======================================

    game.balance =
        Math.max(
            0,
            safeNumber(
                game.balance,
                0
            )
        );

    game.totalMined =
        Math.max(
            0,
            safeNumber(
                game.totalMined,
                0
            )
        );

    game.level =
        Math.max(
            1,
            safeNumber(
                game.level,
                1
            )
        );

    game.xp =
        Math.max(
            0,
            safeNumber(
                game.xp,
                0
            )
        );

    game.tapPower =
        Math.max(
            1,
            safeNumber(
                game.tapPower,
                1
            )
        );

    game.maxEnergy =
        Math.max(
            1250,
            safeNumber(
                game.maxEnergy,
                1250
            )
        );

    game.mineRate =
        Math.max(
            4,
            safeNumber(
                game.mineRate,
                4
            )
        );

    game.tapLevel =
        Math.max(
            1,
            safeNumber(
                game.tapLevel,
                1
            )
        );

    game.energyLevel =
        Math.max(
            1,
            safeNumber(
                game.energyLevel,
                1
            )
        );

    game.boostLevel =
        Math.max(
            1,
            safeNumber(
                game.boostLevel,
                1
            )
        );


    // ======================================
    // REFERRAL
    // ======================================

    generateReferralCode();

    processReferral();


    // ======================================
    // UI
    // ======================================

    updatePlayerInfo();

    setupReferral();

    setupButtons();

    setupNavigation();

    updateUI();


    // ======================================
    // FINAL SAFE SAVE
    // ======================================

    if (
        supabaseReady
    ) {

        queueSupabaseSave();

    }


    // ======================================
    // FINAL LOGS
    // ======================================

    console.log(
        "🐕 Baby Shiba Inu App 3.1 Ready"
    );

    console.log(
        "Telegram ID:",
        user.id
    );

    console.log(
        "Username:",
        user.username
    );

    console.log(
        "Display Name:",
        getUserDisplayName(user)
    );

    console.log(
        "Referral Code:",
        getReferralCode()
    );

    console.log(
        "Referral Link:",
        getReferralLink()
    );

    console.log(
        "VIP Level:",
        game.vipLevel
    );

    console.log(
        "VIP Data:",
        getVIPData()
    );

    console.log(
        "Pending Referral:",
        game.pendingReferral
    );

    console.log(
        "Supabase Ready:",
        supabaseReady
    );

    console.log(
        "💰 FINAL BALANCE:",
        game.balance
    );

    console.log(
        "⛏️ FINAL MINE RATE:",
        game.mineRate
    );

    console.log(
        "🐕 Current Game:",
        game
    );

}


// ==========================================
// START
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    initApp

);


// ==========================================
// SAVE WHEN APP HIDDEN
// ==========================================

document.addEventListener(

    "visibilitychange",

    function() {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            // Local + Telegram
            saveGame();


            // Immediate Supabase save
            if (
                supabaseReady
            ) {

                queueSupabaseSave(
                    true
                );

            }

        }

    }

);


// ==========================================
// SAVE BEFORE PAGE UNLOAD
// ==========================================

window.addEventListener(
    "beforeunload",
    function() {

        saveGame();

    }
);
