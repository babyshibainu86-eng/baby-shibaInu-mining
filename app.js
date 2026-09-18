// ==========================================
// BABY SHIBA INU - MINI APP
// APP VERSION 2.0
// ==========================================

const tg = window.Telegram?.WebApp || null;
let saveInProgress = false;
let savePending = false;
if (tg) {
    tg.ready();
    tg.expand();
}

const SUPABASE_FUNCTION_URL =
    "https://xtfleiaormhmbzwurqoi.supabase.co/functions/v1/bright-endpoint";

async function connectTelegramUser() {

    if (!tg || !tg.initData) {
        console.log("Telegram initData not available");
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_FUNCTION_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    initData: tg.initData
                })
            }
        );

        const data = await response.json();

        console.log("Server user:", data);

        if (data.success && data.user) {

            game.balance = Number(data.user.balance);
            game.totalMined = Number(data.user.total_mined);
            game.level = Number(data.user.level);
            game.xp = Number(data.user.xp);
            game.tapPower = Number(data.user.tap_power);
            game.energy = Number(data.user.energy);
            game.maxEnergy = Number(data.user.max_energy);
            game.mineRate = Number(data.user.mine_rate);
            game.tapLevel = Number(data.user.tap_level);
            game.energyLevel = Number(data.user.energy_level);
            game.boostLevel = Number(data.user.boost_level);
            game.missionProgress =
                Number(data.user.mission_progress);
            game.missionClaimed =
                Boolean(data.user.mission_claimed);
            game.sound =
                Boolean(data.user.sound);

            saveGame();
            render();
        }

    } catch (error) {

        console.error(
            "Telegram connection error:",
            error
        );

    }
                }

let telegramUser = null;

// ==========================================
// TELEGRAM
// ==========================================

if (tg) {
    tg.ready();
    tg.expand();

    telegramUser = tg.initDataUnsafe?.user || null;

    console.log("Telegram Mini App connected");
    console.log("Telegram User:", telegramUser);
}

// ==========================================
// USER
// ==========================================

function getTelegramUser() {

    if (telegramUser) {

        return {
            id: telegramUser.id || null,
            firstName: telegramUser.first_name || "Player",
            lastName: telegramUser.last_name || "",
            username: telegramUser.username || ""
        };

    }

    return {
        id: null,
        firstName: "Guest",
        lastName: "",
        username: ""
    };
}

const user = getTelegramUser();

// ==========================================
// GAME STATE
// ==========================================

const defaultState = {

    balance: 0,
    totalMined: 0,

    level: 1,
    xp: 0,

    tapPower: 1,

    energy: 1000,
    maxEnergy: 1000,

    mineRate: 1,

    tapLevel: 1,
    energyLevel: 1,
    boostLevel: 1,

    missionProgress: 0,
    missionClaimed: false,

    sound: true
};

let game = {
    ...defaultState
};
// ==========================================
// LOCAL STORAGE - PER TELEGRAM USER
// ==========================================

function getGameStorageKey() {

    if (user.id) {

        return "babyShibaGame_" + user.id;

    }

    return "babyShibaGame_GUEST";

}

function loadGame() {

    try {

        const saved =
            localStorage.getItem(
                getGameStorageKey()
            );

        if (saved) {

            return {
                ...defaultState,
                ...JSON.parse(saved)
            };
        }

    } catch (error) {

        console.log("Load error:", error);

    }

    return {
        ...defaultState
    };
}
function saveGame() {

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
                "❌ Telegram CloudStorage unavailable"
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
                        "✅ Latest game saved:",
                        success
                    );

                }

                if (savePending) {

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
async function loadGameFromTelegram() {

    return new Promise((resolve) => {

        if (
            !window.Telegram ||
            !Telegram.WebApp ||
            !Telegram.WebApp.CloudStorage
        ) {

            console.log(
                "❌ Telegram CloudStorage unavailable"
            );

            resolve(false);
            return;
        }

        Telegram.WebApp.CloudStorage.getItem(
            "game",
            function(error, value) {

                if (error) {

                    console.log(
                        "❌ CloudStorage load error:",
                        error
                    );

                    resolve(false);
                    return;
                }

                console.log(
                    "☁️ CloudStorage data:",
                    value
                );

                if (!value) {

                    console.log(
                        "🆕 New Telegram player"
                    );

                    game = {
                        ...defaultState
                    };

                    resolve(true);
                    return;
                }

                try {

                    const savedGame =
                        JSON.parse(value);

                    game = {
                        ...defaultState,
                        ...savedGame
                    };

                    console.log(
                        "✅ Game loaded:",
                        game
                    );

                    resolve(true);

                } catch (error) {

                    console.log(
                        "❌ Game data error:",
                        error
                    );

                    resolve(false);

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
        document.querySelectorAll(".game-page");

    pages.forEach(page => {

        page.classList.remove("active");

    });

    const selected =
        document.getElementById(pageId);

    if (selected) {

        selected.classList.add("active");

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
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        if (item.dataset.page === pageId) {

            item.classList.add("active");

        } else {

            item.classList.remove("active");

        }

    });
}

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const pageId =
                item.dataset.page;

            if (pageId) {

                showPage(pageId);

            }

        });

    });

}

// ==========================================
// START GAME
// ==========================================

function startGame() {

    const intro =
        document.getElementById("introPage");

    const gameApp =
        document.getElementById("gameApp");

    if (intro) {

        intro.classList.add("hidden");

    }

    if (gameApp) {

        gameApp.classList.remove("hidden");

    }

    showPage("miningPage");

    if (tg && tg.HapticFeedback) {

        tg.HapticFeedback.impactOccurred("medium");

    }

}

// ==========================================
// PLAYER INFO
// ==========================================

function updatePlayerInfo() {

    const nameElement =
        document.getElementById("playerName");

    const idElement =
        document.getElementById("playerId");

    if (nameElement) {

        if (user.username) {

            nameElement.textContent =
                "@" + user.username;

        } else {

            nameElement.textContent =
                user.firstName +
                (
                    user.lastName
                        ? " " + user.lastName
                        : ""
                );

        }

    }

    if (idElement) {

        idElement.textContent =
            user.id
                ? "Telegram ID: " + user.id
                : "Telegram ID: Guest";

    }

}

// ==========================================
// UI
// ==========================================

function updateUI() {

    const balance =
        document.getElementById("balance");

    const totalMined =
        document.getElementById("totalMined");

    const level =
        document.getElementById("level");

    const levelName =
        document.getElementById("levelName");

    const xpFill =
        document.getElementById("xpFill");

    const tapPower =
        document.getElementById("tapPower");

    const energy =
        document.getElementById("energy");

    const maxEnergy =
        document.getElementById("maxEnergy");

    const energyFill =
        document.getElementById("energyFill");

    const mineRate =
        document.getElementById("mineRate");

    const statsMineRate =
        document.getElementById("statsMineRate");

    const missionProgress =
        document.getElementById("missionProgress");

    const missionFill =
        document.getElementById("missionFill");

    const tapCost =
        document.getElementById("tapCost");

    const energyCost =
        document.getElementById("energyCost");

    const boostCost =
        document.getElementById("boostCost");

    if (balance) {

        balance.textContent =
            formatNumber(game.balance);

    }

    if (totalMined) {

        totalMined.textContent =
            formatNumber(game.totalMined);

    }

    if (level) {

        level.textContent =
            game.level;

    }

    if (levelName) {

        levelName.textContent =
            getLevelName(game.level);

    }

    if (tapPower) {

        tapPower.textContent =
            game.tapPower;

    }

    if (energy) {

        energy.textContent =
            Math.floor(game.energy);

    }

    if (maxEnergy) {

        maxEnergy.textContent =
            game.maxEnergy;

    }

    if (mineRate) {

        mineRate.textContent =
            game.mineRate + " BSHIB/s";

    }

    if (statsMineRate) {

        statsMineRate.textContent =
            game.mineRate;

    }

    if (energyFill) {

        const percent =
            (game.energy / game.maxEnergy) * 100;

        energyFill.style.width =
            Math.max(
                0,
                Math.min(100, percent)
            ) + "%";

    }

    if (xpFill) {

        const required =
            game.level * 1000;

        const percent =
            (game.xp / required) * 100;

        xpFill.style.width =
            Math.max(
                0,
                Math.min(100, percent)
            ) + "%";

    }

    if (missionProgress) {

        missionProgress.textContent =
            Math.min(
                game.missionProgress,
                1000
            ) + " / 1000";

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
            formatNumber(getTapCost());

    }

    if (energyCost) {

        energyCost.textContent =
            formatNumber(getEnergyCost());

    }

    if (boostCost) {

        boostCost.textContent =
            formatNumber(getBoostCost());

    }

}

// ==========================================
// NUMBER
// ==========================================

function formatNumber(number) {

    return Math.floor(number)
        .toLocaleString("en-US");

}

// ==========================================
// LEVEL
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

function addXP(amount) {

    game.xp += amount;

    const required =
        game.level * 1000;

    if (game.xp >= required) {

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

    if (game.energy <= 0) {

        showToast(
            "⚡ Energy is empty!"
        );

        return;

    }

    const amount =
        game.tapPower;

    game.balance += amount;

    game.totalMined += amount;

    game.energy -= 1;

    game.missionProgress += amount;

    addXP(amount);

    createCoinEffect(amount);

    if (tg && tg.HapticFeedback) {

        tg.HapticFeedback.impactOccurred(
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

    if (game.energy <= 0) {

        return;

    }

    const amount =
        game.mineRate;

    game.balance += amount;

    game.totalMined += amount;

    game.energy -= 1;

    game.missionProgress += amount;

    addXP(amount);

    saveGame();

    updateUI();

}, 1000);

// ==========================================
// ENERGY REGENERATION
// ==========================================

setInterval(() => {

    if (game.energy < game.maxEnergy) {

        game.energy += 5;

        if (game.energy > game.maxEnergy) {

            game.energy =
                game.maxEnergy;

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

    if (game.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -= cost;

    game.tapPower += 1;

    game.tapLevel += 1;

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

    if (game.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -= cost;

    game.maxEnergy += 250;

    game.energy =
        game.maxEnergy;

    game.energyLevel += 1;

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

    if (game.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -= cost;

    game.mineRate += 1;

    game.boostLevel += 1;

    showToast(
        "🚀 Mining Boost upgraded!"
    );

    saveGame();

    updateUI();

}

// ==========================================
// REFERRAL
// ==========================================

function getReferralCode() {

    if (user.id) {

        return "BSHIB" + user.id;

    }

    return "BSHIBGUEST";

}

function setupReferral() {

    const refCode =
        document.getElementById("refCode");

    if (refCode) {

        refCode.textContent =
            getReferralCode();

    }

}

function copyReferral() {

    const code =
        getReferralCode();

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

}

function inviteFriends() {

    const code =
        getReferralCode();

    const botUsername =
        "shibababycoinbot";

    const link =
        "https://t.me/" +
        botUsername +
        "?startapp=" +
        encodeURIComponent(code);

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

        navigator.clipboard
            .writeText(link)
            .then(() => {

                showToast(
                    "📨 Invite link copied!"
                );

            });

    }

}

// ==========================================
// MISSION
// ==========================================

function claimMission() {

    if (
        game.missionProgress < 1000
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

    game.balance += 100;

    game.missionClaimed = true;

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
        document.getElementById("toast");

    const toastText =
        document.getElementById("toastText");

    if (
        !toast ||
        !toastText
    ) {

        return;

    }

    toastText.textContent =
        message;

    toast.classList.add("show");

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

    effects.appendChild(coin);

    setTimeout(() => {

        coin.remove();

    }, 1000);

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
        );if (upgradeTapButton) {

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

}

// ==========================================
// INITIALIZE
// ==========================================

async function initApp() {

    await loadGameFromTelegram();

    updatePlayerInfo();

    setupReferral();

    setupButtons();

    setupNavigation();

    updateUI();

    console.log(
        "🐕 Baby Shiba Inu App 2.0 Ready"
    );

    console.log(
        "Telegram ID:",
        user.id
    );

    console.log(
        "Username:",
        user.username
    );

}

// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    initApp
);
document.addEventListener(
    "visibilitychange",
    function() {

        if (document.visibilityState === "hidden") {

            saveGame();

        }

    }
);
