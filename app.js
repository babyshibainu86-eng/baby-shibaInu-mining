// ==========================================
// BABY SHIBA INU - TELEGRAM MINI APP
// App Version 1.1
// ==========================================

const tg = window.Telegram?.WebApp;

// ------------------------------------------
// Telegram initialization
// ------------------------------------------

let telegramUser = null;

if (tg) {
    tg.ready();
    tg.expand();

    telegramUser = tg.initDataUnsafe?.user || null;

    // Telegram theme
    if (tg.colorScheme === "dark") {
        document.documentElement.classList.add("telegram-dark");
    }

    console.log("Telegram Mini App connected");

    if (telegramUser) {
        console.log("Telegram User:", telegramUser);
    }
}

// ------------------------------------------
// Telegram User
// ------------------------------------------

function getTelegramUser() {

    if (telegramUser) {
        return {
            id: telegramUser.id || null,
            firstName: telegramUser.first_name || "Player",
            lastName: telegramUser.last_name || "",
            username: telegramUser.username || "",
            languageCode: telegramUser.language_code || ""
        };
    }

    // Browser testing
    return {
        id: null,
        firstName: "Guest",
        lastName: "",
        username: "",
        languageCode: ""
    };
}

const user = getTelegramUser();

// ------------------------------------------
// Game State
// ------------------------------------------

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

let game = loadGame();

// ------------------------------------------
// Local Storage
// ------------------------------------------

function loadGame() {

    try {

        const saved = localStorage.getItem("babyShibaGame");

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

    try {

        localStorage.setItem(
            "babyShibaGame",
            JSON.stringify(game)
        );

    } catch (error) {

        console.log("Save error:", error);

    }
}

// ------------------------------------------
// Player Information
// ------------------------------------------

function updatePlayerInfo() {

    const nameElement = document.getElementById("playerName");
    const idElement = document.getElementById("playerId");

    if (nameElement) {

        if (user.username) {

            nameElement.textContent =
                "@" + user.username;

        } else {

            nameElement.textContent =
                user.firstName +
                (user.lastName
                    ? " " + user.lastName
                    : "");

        }

    }

    if (idElement) {

        if (user.id) {

            idElement.textContent =
                "Telegram ID: " + user.id;

        } else {

            idElement.textContent =
                "Telegram ID: Guest";

        }

    }
}

// ------------------------------------------
// UI Update
// ------------------------------------------

function updateUI() {

    const balance = document.getElementById("balance");
    const totalMined = document.getElementById("totalMined");

    const level = document.getElementById("level");
    const levelName = document.getElementById("levelName");

    const xpFill = document.getElementById("xpFill");

    const tapPower = document.getElementById("tapPower");

    const energy = document.getElementById("energy");
    const maxEnergy = document.getElementById("maxEnergy");

    const energyFill = document.getElementById("energyFill");

    const mineRate = document.getElementById("mineRate");

    const missionProgress = document.getElementById("missionProgress");
    const missionFill = document.getElementById("missionFill");

    const tapCost = document.getElementById("tapCost");
    const energyCost = document.getElementById("energyCost");
    const boostCost = document.getElementById("boostCost");

    const infoLevel = document.getElementById("infoLevel");
    const infoStatus = document.getElementById("infoStatus");

    if (balance) {
        balance.textContent =
            formatNumber(game.balance);
    }

    if (totalMined) {
        totalMined.textContent =
            formatNumber(game.totalMined);
    }

    if (level) {
        level.textContent = game.level;
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

    if (energyFill) {

        const percent =
            (game.energy / game.maxEnergy) * 100;

        energyFill.style.width =
            Math.max(0, Math.min(100, percent)) + "%";
    }

    if (xpFill) {

        const xpNeeded =
            game.level * 1000;

        const percent =
            (game.xp / xpNeeded) * 100;

        xpFill.style.width =
            Math.max(0, Math.min(100, percent)) + "%";
    }

    if (missionProgress) {

        missionProgress.textContent =
            Math.min(game.missionProgress, 1000) +
            " / 1000";
    }

    if (missionFill) {

        const percent =
            (Math.min(game.missionProgress, 1000) / 1000) * 100;

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

    if (infoLevel) {
        infoLevel.textContent =
            game.level;
    }

    if (infoStatus) {

        infoStatus.textContent =
            user.id
                ? "Telegram Connected"
                : "Guest Mode";
    }
}

// ------------------------------------------
// Number formatting
// ------------------------------------------

function formatNumber(number) {

    return Math.floor(number).toLocaleString("en-US");
}

// ------------------------------------------
// Level System
// ------------------------------------------

function getLevelName(level) {

    if (level >= 20) return "Shiba Legend";
    if (level >= 15) return "Shiba Master";
    if (level >= 10) return "Shiba Elite";
    if (level >= 5) return "Shiba Warrior";

    return "Shiba Rookie";
}

function addXP(amount) {

    game.xp += amount;

    const required =
        game.level * 1000;

    if (game.xp >= required) {

        game.xp -= required;

        game.level++;

        showToast(
            "🎉 Level Up! Level " +
            game.level
        );
    }
}

// ------------------------------------------
// Mining
// ------------------------------------------

function mine() {

    if (game.energy <= 0) {

        showToast("⚡ Energy is empty!");

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

    saveGame();

    updateUI();
}

// ------------------------------------------
// Automatic Mining
// ------------------------------------------

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

// ------------------------------------------
// Energy Regeneration
// ------------------------------------------

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

// ------------------------------------------
// Upgrade Costs
// ------------------------------------------

function getTapCost() {

    return Math.floor(
        100 * Math.pow(1.6, game.tapLevel - 1)
    );
}

function getEnergyCost() {

    return Math.floor(
        250 * Math.pow(1.7, game.energyLevel - 1)
    );
}

function getBoostCost() {

    return Math.floor(
        500 * Math.pow(1.8, game.boostLevel - 1)
    );
}

// ------------------------------------------
// Upgrade Tap
// ------------------------------------------

function upgradeTap() {

    const cost =
        getTapCost();

    if (game.balance < cost) {

        showToast("❌ Not enough BSHIB");

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

// ------------------------------------------
// Upgrade Energy
// ------------------------------------------

function upgradeEnergy() {

    const cost =
        getEnergyCost();

    if (game.balance < cost) {

        showToast("❌ Not enough BSHIB");

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

// ------------------------------------------
// Upgrade Mining Boost
// ------------------------------------------

function upgradeBoost() {

    const cost =
        getBoostCost();

    if (game.balance < cost) {

        showToast("❌ Not enough BSHIB");

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

// ------------------------------------------
// Daily Mission
// ------------------------------------------

function claimMission() {

    if (game.missionProgress < 1000) {

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

// ------------------------------------------
// Referral
// ------------------------------------------

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

    if (tg && tg.openTelegramLink) {

        tg.openTelegramLink(
            "https://t.me/share/url?url=" +
            encodeURIComponent(link) +
            "&text=" +
            encodeURIComponent(
                "🐕 Join Baby Shiba Inu Mining!"
            )
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

// ------------------------------------------
// Wallet
// ------------------------------------------

function connectWallet() {

    showToast(
        "🔐 Wallet integration coming soon"
    );
}

// ------------------------------------------
// Sound
// ------------------------------------------

function toggleSound() {

    game.sound =
        !game.sound;

    const button =
        document.getElementById("soundBtn");

    if (button) {

        button.textContent =
            game.sound
                ? "🔊"
                : "🔇";
    }

    saveGame();
}

// ------------------------------------------
// Toast
// ------------------------------------------

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const toastText =
        document.getElementById("toastText");

    if (!toast || !toastText) {
        return;
    }

    toastText.textContent =
        message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);
}

// ------------------------------------------
// Coin Animation
// ------------------------------------------

function createCoinEffect(amount) {

    const effects =
        document.getElementById("effects");

    if (!effects) {
        return;
    }

    const coin =
        document.createElement("div");

    coin.className =
        "coin-effect";

    coin.textContent =
        "+" + amount;

    coin.style.left =
        (45 + Math.random() * 10) + "%";

    coin.style.top =
        "45%";

    effects.appendChild(coin);

    setTimeout(() => {

        coin.remove();

    }, 1000);
}

// ------------------------------------------
// Navigation
// ------------------------------------------

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const page =
                    item.dataset.page;

                if (!page) {
                    return;
                }

                const target =
                    document.getElementById(page);

                if (target) {

                    target.scrollIntoView({
                        behavior: "smooth"
                    });
                }

            }
        );

    });
}

// ------------------------------------------
// Buttons
// ------------------------------------------

function setupButtons() {

    const shibaButton =
        document.getElementById("shibaButton");

    const claimMissionButton =
        document.getElementById("claimMission");

    const upgradeTapButton =
        document.getElementById("upgradeTap");

    const upgradeEnergyButton =
        document.getElementById("upgradeEnergy");

    const upgradeBoostButton =
        document.getElementById("upgradeBoost");

    const copyRefButton =
        document.getElementById("copyRef");

    const inviteButton =
        document.getElementById("inviteBtn");

    const walletButton =
        document.getElementById("walletBtn");

    const soundButton =
        document.getElementById("soundBtn");

    if (shibaButton) {
        shibaButton.addEventListener(
            "click",
            mine
        );
    }

    if (claimMissionButton) {
        claimMissionButton.addEventListener(
            "click",
            claimMission
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

    if (walletButton) {
        walletButton.addEventListener(
            "click",
            connectWallet
        );
    }

    if (soundButton) {
        soundButton.addEventListener(
            "click",
            toggleSound
        );
    }
}

// ------------------------------------------
// Start App
// ------------------------------------------

function initApp() {

    updatePlayerInfo();

    setupReferral();

    setupButtons();

    setupNavigation();

    updateUI();

    console.log(
        "Baby Shiba Inu Mini App ready"
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

document.addEventListener(
    "DOMContentLoaded",
    initApp
);
