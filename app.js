// ==========================================
// Baby Shiba Inu - Mine to Earn
// Version 1.0
// ==========================================

"use strict";


// ==========================================
// TELEGRAM MINI APP
// ==========================================

const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#080b14");
        tg.setBackgroundColor("#080b14");
    } catch (error) {
        console.log("Telegram theme setup skipped.");
    }
}


// ==========================================
// GAME STATE
// ==========================================

const defaultGame = {
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


// ==========================================
// PLAYER
// ==========================================

let telegramUser = null;

if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    telegramUser = tg.initDataUnsafe.user;
}

const playerNameElement = document.getElementById("playerName");
const playerIdElement = document.getElementById("playerId");


if (telegramUser) {

    const firstName = telegramUser.first_name || "Baby Shiba";

    playerNameElement.textContent = firstName;

    playerIdElement.textContent =
        "Telegram #" + telegramUser.id;

} else {

    playerNameElement.textContent =
        "Baby Shiba Miner";

    playerIdElement.textContent =
        "Player #000000";
}


// ==========================================
// DOM ELEMENTS
// ==========================================

const balanceElement =
    document.getElementById("balance");

const levelElement =
    document.getElementById("level");

const levelNameElement =
    document.getElementById("levelName");

const xpFillElement =
    document.getElementById("xpFill");

const shibaButton =
    document.getElementById("shibaButton");

const energyElement =
    document.getElementById("energy");

const maxEnergyElement =
    document.getElementById("maxEnergy");

const energyFillElement =
    document.getElementById("energyFill");

const tapPowerElement =
    document.getElementById("tapPower");

const mineRateElement =
    document.getElementById("mineRate");

const totalMinedElement =
    document.getElementById("totalMined");

const infoLevelElement =
    document.getElementById("infoLevel");

const infoStatusElement =
    document.getElementById("infoStatus");

const missionFillElement =
    document.getElementById("missionFill");

const missionProgressElement =
    document.getElementById("missionProgress");

const claimMissionButton =
    document.getElementById("claimMission");

const tapCostElement =
    document.getElementById("tapCost");

const energyCostElement =
    document.getElementById("energyCost");

const boostCostElement =
    document.getElementById("boostCost");

const refCodeElement =
    document.getElementById("refCode");

const toastElement =
    document.getElementById("toast");

const toastTextElement =
    document.getElementById("toastText");

const effectsElement =
    document.getElementById("effects");

const soundButton =
    document.getElementById("soundBtn");

const walletButton =
    document.getElementById("walletBtn");

const walletStatus =
    document.getElementById("walletStatus");

const inviteButton =
    document.getElementById("inviteBtn");

const copyRefButton =
    document.getElementById("copyRef");


// ==========================================
// GAME STORAGE
// ==========================================

function loadGame() {

    try {

        const saved =
            localStorage.getItem("babyShibaGame");

        if (!saved) {
            return { ...defaultGame };
        }

        return {
            ...defaultGame,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.log("Save data could not be loaded.");

        return { ...defaultGame };
    }
}


function saveGame() {

    try {

        localStorage.setItem(
            "babyShibaGame",
            JSON.stringify(game)
        );

    } catch (error) {

        console.log("Save data could not be saved.");
    }
}


// ==========================================
// NUMBER FORMAT
// ==========================================

function formatNumber(number) {

    if (number >= 1000000000) {
        return (number / 1000000000).toFixed(2) + "B";
    }

    if (number >= 1000000) {
        return (number / 1000000).toFixed(2) + "M";
    }

    if (number >= 1000) {
        return (number / 1000).toFixed(2) + "K";
    }

    return Math.floor(number).toString();
}


// ==========================================
// LEVEL SYSTEM
// ==========================================

function xpRequired() {

    return game.level * 1000;
}


function getLevelName() {

    const names = [
        "Baby Miner",
        "Shiba Miner",
        "Shiba Hunter",
        "Shiba Master",
        "Shiba Warrior",
        "Shiba Legend",
        "Baby Shiba King"
    ];

    return names[
        Math.min(game.level - 1, names.length - 1)
    ];
}


function addXP(amount) {

    game.xp += amount;

    while (game.xp >= xpRequired()) {

        game.xp -= xpRequired();

        game.level++;

        showToast(
            "🎉 Level Up! Level " + game.level
        );

        if (tg) {
            try {
                tg.HapticFeedback.notificationOccurred("success");
            } catch (error) {}
        }
    }
}


// ==========================================
// UPDATE UI
// ==========================================

function updateUI() {

    balanceElement.textContent =
        formatNumber(game.balance);

    totalMinedElement.textContent =
        formatNumber(game.totalMined);

    levelElement.textContent =
        game.level;

    infoLevelElement.textContent =
        game.level;

    levelNameElement.textContent =
        getLevelName();

    tapPowerElement.textContent =
        "+" + game.tapPower;

    mineRateElement.textContent =
        game.mineRate + "/s";

    energyElement.textContent =
        Math.floor(game.energy);

    maxEnergyElement.textContent =
        game.maxEnergy;

    infoStatusElement.textContent =
        game.energy > 0
            ? "Mining"
            : "No Energy";


    // XP

    const xpPercent =
        (game.xp / xpRequired()) * 100;

    xpFillElement.style.width =
        Math.min(xpPercent, 100) + "%";


    // Energy

    const energyPercent =
        (game.energy / game.maxEnergy) * 100;

    energyFillElement.style.width =
        Math.max(0, Math.min(energyPercent, 100)) + "%";


    // Mission

    const missionPercent =
        Math.min(
            (game.missionProgress / 1000) * 100,
            100
        );

    missionFillElement.style.width =
        missionPercent + "%";

    missionProgressElement.textContent =
        Math.floor(game.missionProgress) +
        " / 1,000";


    if (
        game.missionProgress >= 1000 &&
        !game.missionClaimed
    ) {

        claimMissionButton.disabled = false;

        claimMissionButton.textContent =
            "🎁 Claim +100 BSHIB";

    } else if (game.missionClaimed) {

        claimMissionButton.disabled = true;

        claimMissionButton.textContent =
            "✓ Reward Claimed";

    } else {

        claimMissionButton.disabled = true;

        claimMissionButton.textContent =
            "Claim Reward";
    }


    // Upgrade prices

    tapCostElement.textContent =
        formatNumber(getTapCost());

    energyCostElement.textContent =
        formatNumber(getEnergyCost());

    boostCostElement.textContent =
        formatNumber(getBoostCost());


    // Referral

    const referralCode =
        getReferralCode();

    refCodeElement.textContent =
        referralCode;


    // Status

    const miningStatus =
        document.getElementById("miningStatus");

    if (miningStatus) {

        if (game.energy > 0) {

            miningStatus.textContent =
                "⛏️ Mining is active";

        } else {

            miningStatus.textContent =
                "⚡ Waiting for energy...";
        }
    }


    saveGame();
}


// ==========================================
// MINING
// ==========================================

function mine() {

    if (game.energy < 1) {

        showToast(
            "⚡ Not enough energy!"
        );

        if (tg) {
            try {
                tg.HapticFeedback.notificationOccurred("error");
            } catch (error) {}
        }

        return;
    }


    const amount =
        game.tapPower;


    game.balance += amount;

    game.totalMined += amount;

    game.energy -= 1;

    game.missionProgress += amount;

    addXP(amount);


    createCoinEffect(
        "+" + amount
    );


    if (tg) {

        try {
            tg.HapticFeedback.impactOccurred("light");
        } catch (error) {}
    }


    updateUI();
}


// ==========================================
// MINE BUTTON
// ==========================================

if (shibaButton) {

    shibaButton.addEventListener(
        "click",
        mine
    );
}


// ==========================================
// AUTOMATIC MINING
// ==========================================

setInterval(() => {

    if (
        game.energy > 0 &&
        game.mineRate > 0
    ) {

        const amount =
            game.mineRate;

        game.balance += amount;

        game.totalMined += amount;

        game.energy =
            Math.max(
                0,
                game.energy - 1
            );

        game.missionProgress += amount;

        addXP(amount);

        updateUI();
    }

}, 1000);


// ==========================================
// ENERGY REGENERATION
// ==========================================

setInterval(() => {

    if (game.energy < game.maxEnergy) {

        game.energy += 5;

        if (game.energy > game.maxEnergy) {
            game.energy = game.maxEnergy;
        }

        updateUI();
    }

}, 1000);


// ==========================================
// UPGRADE COSTS
// ==========================================

function getTapCost() {

    return Math.floor(
        100 *
        Math.pow(1.6, game.tapLevel - 1)
    );
}


function getEnergyCost() {

    return Math.floor(
        250 *
        Math.pow(1.7, game.energyLevel - 1)
    );
}


function getBoostCost() {

    return Math.floor(
        500 *
        Math.pow(1.8, game.boostLevel - 1)
    );
}


// ==========================================
// TAP POWER UPGRADE
// ==========================================

const upgradeTap =
    document.getElementById("upgradeTap");


if (upgradeTap) {

    upgradeTap.addEventListener(
        "click",
        () => {

            const cost =
                getTapCost();


            if (game.balance < cost) {

                showToast(
                    "❌ Not enough BSHIB"
                );

                return;
            }


            game.balance -= cost;

            game.tapLevel++;

            game.tapPower++;

            addXP(50);

            showToast(
                "👆 Mining Power upgraded!"
            );

            updateUI();
        }
    );
}


// ==========================================
// ENERGY UPGRADE
// ==========================================

const upgradeEnergy =
    document.getElementById("upgradeEnergy");


if (upgradeEnergy) {

    upgradeEnergy.addEventListener(
        "click",
        () => {

            const cost =
                getEnergyCost();


            if (game.balance < cost) {

                showToast(
                    "❌ Not enough BSHIB"
                );

                return;
            }


            game.balance -= cost;

            game.energyLevel++;

            game.maxEnergy += 250;

            game.energy =
                game.maxEnergy;

            addXP(75);

            showToast(
                "⚡ Energy capacity upgraded!"
            );

            updateUI();
        }
    );
}


// ==========================================
// MINING BOOST UPGRADE
// ==========================================

const upgradeBoost =
    document.getElementById("upgradeBoost");


if (upgradeBoost) {

    upgradeBoost.addEventListener(
        "click",
        () => {

            const cost =
                getBoostCost();


            if (game.balance < cost) {

                showToast(
                    "❌ Not enough BSHIB"
                );

                return;
            }


            game.balance -= cost;

            game.boostLevel++;

            game.mineRate++;

            addXP(100);

            showToast(
                "🚀 Mining Boost upgraded!"
            );

            updateUI();
        }
    );
}


// ==========================================
// DAILY MISSION
// ==========================================

if (claimMissionButton) {

    claimMissionButton.addEventListener(
        "click",
        () => {

            if (
                game.missionProgress < 1000 ||
                game.missionClaimed
            ) {
                return;
            }


            game.balance += 100;

            game.missionClaimed = true;

            addXP(100);

            showToast(
                "🎁 +100 BSHIB Mission Reward!"
            );

            updateUI();
        }
    );
}


// ==========================================
// REFERRAL CODE
// ==========================================

function getReferralCode() {

    if (
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ) {

        return "BSHIB-" +
            tg.initDataUnsafe.user.id;
    }


    let localCode =
        localStorage.getItem(
            "babyShibaReferral"
        );


    if (!localCode) {

        localCode =
            "BSHIB-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

        localStorage.setItem(
            "babyShibaReferral",
            localCode
        );
    }


    return localCode;
}


// ==========================================
// COPY REFERRAL
// ==========================================

if (copyRefButton) {

    copyRefButton.addEventListener(
        "click",
        async () => {

            const code =
                getReferralCode();

            try {

                await navigator.clipboard.writeText(
                    code
                );

                showToast(
                    "📋 Referral code copied!"
                );

            } catch (error) {

                showToast(
                    "Referral: " + code
                );
            }
        }
    );
}


// ==========================================
// INVITE FRIENDS
// ==========================================

if (inviteButton) {

    inviteButton.addEventListener(
        "click",
        () => {

            const code =
                getReferralCode();


            const botUsername =
                "BabyShibaInuBot";


            const inviteLink =
                "https://t.me/" +
                botUsername +
                "?start=" +
                encodeURIComponent(code);


            if (tg) {

                try {

                    tg.openTelegramLink(
                        "https://t.me/share/url?url=" +
                        encodeURIComponent(inviteLink) +
                        "&text=" +
                        encodeURIComponent(
                            "🐕 Join Baby Shiba Inu and start mining BSHIB!"
                        )
                    );

                    return;

                } catch (error) {}
            }


            window.open(
                "https://t.me/share/url?url=" +
                encodeURIComponent(inviteLink) +
                "&text=" +
                encodeURIComponent(
                    "🐕 Join Baby Shiba Inu and start mining BSHIB!"
                ),
                "_blank"
            );
        }
    );
}


// ==========================================
// WALLET
// ==========================================

if (walletButton) {

    walletButton.addEventListener(
        "click",
        () => {

            showToast(
                "🔐 Wallet connection will be added in the next version."
            );

        }
    );
}


// ==========================================
// SOUND
// ==========================================

if (soundButton) {

    soundButton.addEventListener(
        "click",
        () => {

            game.sound =
                !game.sound;


            soundButton.textContent =
                game.sound
                    ? "🔊"
                    : "🔇";


            saveGame();
        }
    );
}


// ==========================================
// NAVIGATION
// ==========================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(
    (item) => {

        item.addEventListener(
            "click",
            () => {

                navItems.forEach(
                    (nav) => {
                        nav.classList.remove(
                            "active"
                        );
                    }
                );


                item.classList.add(
                    "active"
                );


                const page =
                    item.dataset.page;


                if (page === "mine") {

                    document
                        .querySelector(".mining-card")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }


                if (page === "friends") {

                    document
                        .querySelector(".referral-card")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }


                if (page === "wallet") {

                    document
                        .querySelector(".wallet-card")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }


                if (page === "home") {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }

            }
        );

    }
);


// ==========================================
// COIN EFFECT
// ==========================================

function createCoinEffect(text) {

    if (!effectsElement) {
        return;
    }


    const effect =
        document.createElement("div");


    effect.className =
        "coin-effect";


    effect.textContent =
        text;


    const rect =
        shibaButton.getBoundingClientRect();


    effect.style.left =
        (
            rect.left +
            rect.width / 2 -
            15
        ) + "px";


    effect.style.top =
        (
            rect.top +
            20
        ) + "px";


    effectsElement.appendChild(
        effect
    );


    setTimeout(
        () => {
            effect.remove();
        },
        800
    );
}


// ==========================================
// TOAST
// ==========================================

let toastTimer = null;


function showToast(message) {

    if (!toastElement) {
        return;
    }


    toastTextElement.textContent =
        message;


    toastElement.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toastElement.classList.remove(
                    "show"
                );

            },
            2000
        );
}


// ==========================================
// INITIALIZE
// ==========================================

updateUI();


console.log(
    "🐕 Baby Shiba Inu Mine-to-Earn loaded."
);
