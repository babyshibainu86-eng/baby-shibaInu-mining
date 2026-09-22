/* =========================================================
   BABY SHIBA INU
   PHASE 0 — MINING
   APP.JS v1.0
   ========================================================= */

"use strict";

/* =========================================================
   TELEGRAM
========================================================= */

const tg =
    window.Telegram && window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;


/* =========================================================
   GAME CONFIG
========================================================= */

const GAME_CONFIG = {

    /* Starting values */
    startBalance: 0,
    startTotalMined: 0,

    startLevel: 1,
    startXP: 0,

    startTapPower: 1,

    startEnergy: 1000,
    startMaxEnergy: 1000,

    startMineRate: 1,

    /* Energy */
    energyPerTap: 1,
    energyRegenPerSecond: 1,

    /* XP */
    xpPerTap: 1,
    xpPerMining: 1,

    /* Upgrade */
    upgradeBaseCost: 100,

    /* Offline mining */
    maxOfflineSeconds: 3600

};


/* =========================================================
   GAME STATE
========================================================= */

const defaultGame = {

    balance: GAME_CONFIG.startBalance,

    totalMined: GAME_CONFIG.startTotalMined,

    level: GAME_CONFIG.startLevel,

    xp: GAME_CONFIG.startXP,

    tapPower: GAME_CONFIG.startTapPower,

    energy: GAME_CONFIG.startEnergy,

    maxEnergy: GAME_CONFIG.startMaxEnergy,

    mineRate: GAME_CONFIG.startMineRate,

    tapLevel: 1,

    miningLevel: 1,

    lastSavedAt: Date.now(),

    lastMiningAt: Date.now()

};


/* =========================================================
   CURRENT GAME
========================================================= */

let game = {
    ...defaultGame
};


/* =========================================================
   USER
========================================================= */

let telegramUser = null;

let userStorageKey = "babyShibaGame_guest";


/* =========================================================
   FLAGS
========================================================= */

let gameReady = false;

let cloudAvailable = false;


/* =========================================================
   SAFE NUMBER
========================================================= */

function safeNumber(value, fallback = 0) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return number;
}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    value = safeNumber(value, 0);

    if (value >= 1000000000) {
        return (
            (value / 1000000000).toFixed(2) +
            "B"
        );
    }

    if (value >= 1000000) {
        return (
            (value / 1000000).toFixed(2) +
            "M"
        );
    }

    if (value >= 1000) {
        return (
            (value / 1000).toFixed(2) +
            "K"
        );
    }

    return Math.floor(value).toLocaleString();
}


/* =========================================================
   TELEGRAM INIT
========================================================= */

function initTelegram() {

    if (!tg) {

        console.log(
            "ℹ️ Telegram WebApp not detected."
        );

        return;
    }

    try {

        tg.ready();

        tg.expand();

        console.log(
            "✅ Telegram WebApp initialized."
        );

    } catch (error) {

        console.error(
            "Telegram initialization error:",
            error
        );
    }
}


/* =========================================================
   GET TELEGRAM USER
========================================================= */

function loadTelegramUser() {

    if (
        !tg ||
        !tg.initDataUnsafe ||
        !tg.initDataUnsafe.user
    ) {

        console.log(
            "ℹ️ Telegram user unavailable."
        );

        return;
    }

    telegramUser =
        tg.initDataUnsafe.user;


    userStorageKey =
        "babyShibaGame_" +
        String(telegramUser.id);


    console.log(
        "👤 Telegram User:",
        telegramUser
    );
}


/* =========================================================
   UPDATE USER UI
========================================================= */

function updateUserUI() {

    const nameElement =
        document.getElementById(
            "player-name"
        );

    const idElement =
        document.getElementById(
            "player-id"
        );


    if (nameElement) {

        if (telegramUser) {

            const firstName =
                telegramUser.first_name || "";

            const lastName =
                telegramUser.last_name || "";

            const fullName =
                (
                    firstName +
                    " " +
                    lastName
                ).trim();


            nameElement.textContent =
                fullName ||
                telegramUser.username ||
                "Player";

        } else {

            nameElement.textContent =
                "Player";
        }
    }


    if (idElement) {

        if (telegramUser) {

            idElement.textContent =
                "ID: " +
                telegramUser.id;

        } else {

            idElement.textContent =
                "ID: -";
        }
    }
}


/* =========================================================
   NORMALIZE STATE
========================================================= */

function normalizeGameState(data) {

    if (!data || typeof data !== "object") {

        return {
            ...defaultGame
        };
    }


    return {

        balance:
            Math.max(
                0,
                safeNumber(
                    data.balance,
                    defaultGame.balance
                )
            ),


        totalMined:
            Math.max(
                0,
                safeNumber(
                    data.totalMined,
                    defaultGame.totalMined
                )
            ),


        level:
            Math.max(
                1,
                Math.floor(
                    safeNumber(
                        data.level,
                        defaultGame.level
                    )
                )
            ),


        xp:
            Math.max(
                0,
                safeNumber(
                    data.xp,
                    defaultGame.xp
                )
            ),


        tapPower:
            Math.max(
                1,
                safeNumber(
                    data.tapPower,
                    defaultGame.tapPower
                )
            ),


        energy:
            Math.max(
                0,
                safeNumber(
                    data.energy,
                    defaultGame.energy
                )
            ),


        maxEnergy:
            Math.max(
                1,
                safeNumber(
                    data.maxEnergy,
                    defaultGame.maxEnergy
                )
            ),


        mineRate:
            Math.max(
                1,
                safeNumber(
                    data.mineRate,
                    defaultGame.mineRate
                )
            ),


        tapLevel:
            Math.max(
                1,
                Math.floor(
                    safeNumber(
                        data.tapLevel,
                        defaultGame.tapLevel
                    )
                )
            ),


        miningLevel:
            Math.max(
                1,
                Math.floor(
                    safeNumber(
                        data.miningLevel,
                        defaultGame.miningLevel
                    )
                )
            ),


        lastSavedAt:
            safeNumber(
                data.lastSavedAt,
                Date.now()
            ),


        lastMiningAt:
            safeNumber(
                data.lastMiningAt,
                Date.now()
            )

    };
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadLocalGame() {

    try {

        const raw =
            localStorage.getItem(
                userStorageKey
            );


        if (!raw) {

            console.log(
                "ℹ️ No local game found."
            );

            return null;
        }


        const parsed =
            JSON.parse(raw);


        const normalized =
            normalizeGameState(parsed);


        console.log(
            "💾 Local game loaded:",
            normalized
        );


        return normalized;

    } catch (error) {

        console.error(
            "❌ LocalStorage load error:",
            error
        );

        return null;
    }
}


/* =========================================================
   LOCAL SAVE
========================================================= */

function saveLocalGame() {

    try {

        game.lastSavedAt =
            Date.now();

        game.lastMiningAt =
            Date.now();


        localStorage.setItem(
            userStorageKey,
            JSON.stringify(game)
        );


        /*
         * Guest backup.
         * This gives us an additional local
         * recovery point.
         */

        localStorage.setItem(
            "babyShibaGame_guest",
            JSON.stringify(game)
        );


        console.log(
            "💾 Local game saved."
        );


    } catch (error) {

        console.error(
            "❌ LocalStorage save error:",
            error
        );
    }
}


/* =========================================================
   TELEGRAM CLOUD LOAD
========================================================= */

function loadCloudGame() {

    return new Promise(function(resolve) {

        if (
            !tg ||
            !tg.CloudStorage
        ) {

            resolve(null);

            return;
        }


        try {

            tg.CloudStorage.getItem(
                "game",
                function(error, value) {

                    if (error) {

                        console.log(
                            "⚠️ CloudStorage load error:",
                            error
                        );

                        resolve(null);

                        return;
                    }


                    if (!value) {

                        resolve(null);

                        return;
                    }


                    try {

                        const parsed =
                            JSON.parse(value);


                        const normalized =
                            normalizeGameState(
                                parsed
                            );


                        cloudAvailable =
                            true;


                        console.log(
                            "☁️ Telegram game loaded:",
                            normalized
                        );


                        resolve(
                            normalized
                        );


                    } catch (parseError) {

                        console.error(
                            "Cloud JSON error:",
                            parseError
                        );

                        resolve(null);
                    }

                }
            );

        } catch (error) {

            console.error(
                "CloudStorage exception:",
                error
            );

            resolve(null);
        }
    });
}


/* =========================================================
   TELEGRAM CLOUD SAVE
========================================================= */

function saveCloudGame() {

    return new Promise(function(resolve) {

        if (
            !tg ||
            !tg.CloudStorage
        ) {

            resolve(false);

            return;
        }


        try {

            tg.CloudStorage.setItem(
                "game",
                JSON.stringify(game),
                function(error, success) {

                    if (error) {

                        console.log(
                            "⚠️ CloudStorage save error:",
                            error
                        );

                        resolve(false);

                        return;
                    }


                    cloudAvailable =
                        true;


                    console.log(
                        "☁️ Game saved to Telegram."
                    );


                    resolve(
                        success !== false
                    );

                }
            );

        } catch (error) {

            console.error(
                "CloudStorage save exception:",
                error
            );

            resolve(false);
        }
    });
}


/* =========================================================
   LOAD GAME
========================================================= */

async function loadGame() {

    /*
     * IMPORTANT:
     * We never overwrite a valid local game
     * with an empty CloudStorage game.
     */

    const localGame =
        loadLocalGame();


    const cloudGame =
        await loadCloudGame();


    let selectedGame = null;


    if (localGame && cloudGame) {

        /*
         * During the recovery phase we use
         * the stronger progression.
         */

        const localScore =
            calculateGameScore(
                localGame
            );


        const cloudScore =
            calculateGameScore(
                cloudGame
            );


        if (cloudScore > localScore) {

            selectedGame =
                cloudGame;

            console.log(
                "🏆 Cloud game selected."
            );

        } else {

            selectedGame =
                localGame;

            console.log(
                "🏆 Local game selected."
            );
        }


    } else if (localGame) {

        selectedGame =
            localGame;


    } else if (cloudGame) {

        selectedGame =
            cloudGame;


    } else {

        selectedGame = {
            ...defaultGame
        };

        console.log(
            "🆕 New game created."
        );
    }


    game =
        normalizeGameState(
            selectedGame
        );


    /*
     * Offline mining.
     */

    applyOfflineMining();


    /*
     * Save the selected state locally.
     */

    saveLocalGame();


    /*
     * Save to Telegram only after
     * a valid state has been selected.
     */

    await saveCloudGame();


    console.log(
        "✅ Game loading completed."
    );
}


/* =========================================================
   GAME SCORE
========================================================= */

function calculateGameScore(state) {

    state =
        normalizeGameState(
            state
        );


    /*
     * Balance and progression
     * are the most important values.
     */

    let score = 0;


    score +=
        state.balance * 1000000;


    score +=
        state.totalMined * 1000;


    score +=
        state.level * 100000;


    score +=
        state.xp * 100;


    score +=
        state.mineRate * 10000;


    score +=
        state.tapPower * 5000;


    score +=
        state.tapLevel * 3000;


    score +=
        state.miningLevel * 3000;


    score +=
        state.maxEnergy;


    return score;
}


/* =========================================================
   OFFLINE MINING
========================================================= */

function applyOfflineMining() {

    const now =
        Date.now();


    const lastTime =
        safeNumber(
            game.lastMiningAt,
            now
        );


    let seconds =
        Math.floor(
            (now - lastTime) / 1000
        );


    if (seconds <= 0) {

        return;
    }


    /*
     * Maximum offline mining:
     * 1 hour.
     */

    seconds =
        Math.min(
            seconds,
            GAME_CONFIG.maxOfflineSeconds
        );


    const offlineReward =
        game.mineRate *
        seconds;


    if (offlineReward <= 0) {

        return;
    }


    game.balance +=
        offlineReward;


    game.totalMined +=
        offlineReward;


    game.lastMiningAt =
        now;


    console.log(
        "⛏️ Offline mining:",
        offlineReward,
        "BSHIB"
    );
}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    const balanceElement =
        document.getElementById(
            "balance"
        );


    const totalMinedElement =
        document.getElementById(
            "total-mined"
        );


    const levelElement =
        document.getElementById(
            "level"
        );


    const xpElement =
        document.getElementById(
            "xp"
        );


    const mineRateElement =
        document.getElementById(
            "mine-rate"
        );


    const tapPowerElement =
        document.getElementById(
            "tap-power"
        );


    const energyElement =
        document.getElementById(
            "energy"
        );


    const maxEnergyElement =
        document.getElementById(
            "max-energy"
        );


    const energyFillElement =
        document.getElementById(
            "energy-fill"
        );


    if (balanceElement) {

        balanceElement.textContent =
            formatNumber(
                game.balance
            );
    }


    if (totalMinedElement) {

        totalMinedElement.textContent =
            formatNumber(
                game.totalMined
            );
    }


    if (levelElement) {

        levelElement.textContent =
            game.level;
    }


    if (xpElement) {

        xpElement.textContent =
            formatNumber(
                game.xp
            );
    }


    if (mineRateElement) {

        mineRateElement.textContent =
            formatNumber(
                game.mineRate
            );
    }


    if (tapPowerElement) {

        tapPowerElement.textContent =
            formatNumber(
                game.tapPower
            );
    }


    if (energyElement) {

        energyElement.textContent =
            Math.floor(
                game.energy
            ).toLocaleString();
    }


    if (maxEnergyElement) {

        maxEnergyElement.textContent =
            Math.floor(
                game.maxEnergy
            ).toLocaleString();
    }


    if (energyFillElement) {

        const percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (
                        game.energy /
                        game.maxEnergy
                    ) * 100
                )
            );


        energyFillElement.style.width =
            percentage + "%";
    }


    const miningStatus =
        document.getElementById(
            "mining-status"
        );


    if (miningStatus) {

        miningStatus.textContent =
            game.mineRate > 0
                ? "ACTIVE"
                : "OFF";
    }


    updateUpgradeButton();
}


/* =========================================================
   TAP / MINE
========================================================= */

function mine() {

    if (!gameReady) {

        return;
    }


    /*
     * Energy limit.
     */

    if (
        game.energy <
        GAME_CONFIG.energyPerTap
    ) {

        showMessage(
            "Not enough energy"
        );

        return;
    }


    /*
     * Consume energy.
     */

    game.energy -=
        GAME_CONFIG.energyPerTap;


    /*
     * Reward.
     */

    const reward =
        Math.max(
            1,
            game.tapPower
        );


    game.balance +=
        reward;


    game.totalMined +=
        reward;


    /*
     * XP.
     */

    game.xp +=
        GAME_CONFIG.xpPerTap;


    checkLevelUp();


    /*
     * Visual feedback.
     */

    animateMineButton();


    updateUI();


    /*
     * Save.
     */

    saveGame();
}


/* =========================================================
   AUTO MINING
========================================================= */

function autoMine() {

    if (!gameReady) {

        return;
    }


    const reward =
        Math.max(
            0,
            game.mineRate
        );


    if (reward <= 0) {

        return;
    }


    game.balance +=
        reward;


    game.totalMined +=
        reward;


    game.xp +=
        GAME_CONFIG.xpPerMining;


    checkLevelUp();


    updateUI();
}


/* =========================================================
   ENERGY REGEN
========================================================= */

function regenerateEnergy() {

    if (!gameReady) {

        return;
    }


    if (
        game.energy >=
        game.maxEnergy
    ) {

        return;
    }


    game.energy +=
        GAME_CONFIG.energyRegenPerSecond;


    if (
        game.energy >
        game.maxEnergy
    ) {

        game.energy =
            game.maxEnergy;
    }


    updateUI();
}


/* =========================================================
   LEVEL SYSTEM
========================================================= */

function getXPRequiredForNextLevel() {

    return (
        game.level *
        100
    );
}


function checkLevelUp() {

    let required =
        getXPRequiredForNextLevel();


    while (
        game.xp >= required
    ) {

        game.xp -=
            required;


        game.level +=
            1;


        /*
         * Small level reward.
         */

        game.maxEnergy +=
            50;


        game.energy =
            game.maxEnergy;


        console.log(
            "🎉 Level Up:",
            game.level
        );


        required =
            getXPRequiredForNextLevel();
    }
}


/* =========================================================
   UPGRADE COST
========================================================= */

function getUpgradeCost() {

    return Math.floor(
        GAME_CONFIG.upgradeBaseCost *
        Math.pow(
            1.8,
            game.miningLevel - 1
        )
    );
}


/* =========================================================
   UPGRADE
========================================================= */

function upgradeMining() {

    if (!gameReady) {

        return;
    }


    const cost =
        getUpgradeCost();


    if (
        game.balance <
        cost
    ) {

        showMessage(
            "Not enough BSHIB"
        );

        return;
    }


    game.balance -=
        cost;


    game.miningLevel +=
        1;


    game.mineRate +=
        1;


    game.tapPower +=
        1;


    /*
     * Small Energy improvement.
     */

    game.maxEnergy +=
        100;


    game.energy =
        Math.min(
            game.energy + 100,
            game.maxEnergy
        );


    console.log(
        "⬆️ Mining upgraded:",
        game.miningLevel
    );


    updateUI();


    saveGame();


    showMessage(
        "Mining upgraded!"
    );
}


/* =========================================================
   UPGRADE BUTTON
========================================================= */

function updateUpgradeButton() {

    const button =
        document.getElementById(
            "upgrade-button"
        );


    if (!button) {

        return;
    }


    const cost =
        getUpgradeCost();


    button.textContent =
        "UPGRADE • " +
        formatNumber(cost) +
        " BSHIB";


    button.disabled =
        game.balance < cost;
}


/* =========================================================
   BUTTON ANIMATION
========================================================= */

function animateMineButton() {

    const button =
        document.getElementById(
            "mine-button"
        );


    if (!button) {

        return;
    }


    button.classList.remove(
        "mine-click"
    );


    /*
     * Force browser reflow.
     */

    void button.offsetWidth;


    button.classList.add(
        "mine-click"
    );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

    console.log(
        "ℹ️",
        message
    );


    /*
     * Telegram popup when available.
     */

    if (
        tg &&
        typeof tg.showPopup === "function"
    ) {

        try {

            tg.showPopup({

                title:
                    "Baby Shiba Inu",

                message:
                    message,

                buttons: [
                    {
                        id: "ok",
                        type: "default",
                        text: "OK"
                    }
                ]

            });

            return;

        } catch (error) {

            console.log(
                "Telegram popup unavailable."
            );
        }
    }


    /*
     * Simple temporary message.
     */

    const existing =
        document.getElementById(
            "game-message"
        );


    if (existing) {

        existing.textContent =
            message;

        return;
    }


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.id =
        "game-message";


    messageElement.textContent =
        message;


    document.body.appendChild(
        messageElement
    );


    setTimeout(
        function() {

            if (
                messageElement.parentNode
            ) {

                messageElement.remove();
            }

        },
        1800
    );
}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(page) {

    const screens = {

        mining:
            "mining-screen",

        items:
            "items-screen",

        shop:
            "shop-screen",

        vip:
            "vip-screen",

        friends:
            "friends-screen",

        arena:
            "arena-screen"

    };


    Object.keys(screens).forEach(
        function(key) {

            const screen =
                document.getElementById(
                    screens[key]
                );


            if (!screen) {
                return;
            }


            if (key === page) {

                screen.classList.add(
                    "active"
                );

            } else {

                screen.classList.remove(
                    "active"
                );
            }
        }
    );


    /*
     * Update bottom navigation.
     */

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            function(button) {

                if (
                    button.dataset.page ===
                    page
                ) {

                    button.classList.add(
                        "active"
                    );

                } else {

                    button.classList.remove(
                        "active"
                    );
                }
            }
        );
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    const intro =
        document.getElementById(
            "intro-screen"
        );


    const mining =
        document.getElementById(
            "mining-screen"
        );


    if (intro) {

        intro.classList.remove(
            "active"
        );
    }


    if (mining) {

        mining.classList.add(
            "active"
        );
    }


    gameReady =
        true;


    updateUI();


    console.log(
        "🚀 Mining started."
    );
}


/* =========================================================
   SAVE GAME
========================================================= */

let saveTimer = null;


function saveGame() {

    if (!gameReady) {

        return;
    }


    /*
     * Prevent excessive writes.
     */

    if (saveTimer) {

        clearTimeout(
            saveTimer
        );
    }


    saveTimer =
        setTimeout(
            async function() {

                saveLocalGame();

                await saveCloudGame();

                saveTimer =
                    null;

            },
            300
        );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEvents() {

    /*
     * Start
     */

    const startButton =
        document.getElementById(
            "start-button"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            startGame
        );
    }


    /*
     * Mine
     */

    const mineButton =
        document.getElementById(
            "mine-button"
        );


    if (mineButton) {

        mineButton.addEventListener(
            "click",
            mine
        );
    }


    /*
     * Upgrade
     */

    const upgradeButton =
        document.getElementById(
            "upgrade-button"
        );


    if (upgradeButton) {

        upgradeButton.addEventListener(
            "click",
            upgradeMining
        );
    }


    /*
     * Navigation
     */

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const page =
                            button.dataset.page;


                        if (page) {

                            showScreen(
                                page
                            );
                        }

                    }
                );
            }
        );
}


/* =========================================================
   GAME LOOP
========================================================= */

function startGameLoops() {

    /*
     * Auto Mining
     */

    setInterval(
        function() {

            autoMine();

        },
        1000
    );


    /*
     * Energy
     */

    setInterval(
        function() {

            regenerateEnergy();

        },
        1000
    );


    /*
     * Periodic save
     */

    setInterval(
        function() {

            if (gameReady) {

                saveGame();
            }

        },
        10000
    );
}


/* =========================================================
   VISIBILITY SAVE
========================================================= */

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            if (gameReady) {

                saveGame();
            }
        }
    }
);


/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        if (gameReady) {

            saveLocalGame();
        }
    }
);


/* =========================================================
   INIT APP
========================================================= */

async function initApp() {

    console.log(
        "🐕 Baby Shiba Inu starting..."
    );


    /*
     * Telegram
     */

    initTelegram();


    /*
     * User
     */

    loadTelegramUser();

    updateUserUI();


    /*
     * Load game
     */

    await loadGame();


    /*
     * Events
     */

    setupEvents();


    /*
     * UI
     */

    updateUI();


    /*
     * Game loops
     */

    startGameLoops();


    console.log(
        "✅ Baby Shiba Inu ready."
    );
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();
}


/* =========================================================
   DEBUG
========================================================= */

window.BabyShiba =
    {

        getGame: function() {

            return {
                ...game
            };
        },


        save: function() {

            saveGame();
        },


        reset: function() {

            game = {
                ...defaultGame,
                lastSavedAt: Date.now(),
                lastMiningAt: Date.now()
            };


            saveLocalGame();

            updateUI();


            console.log(
                "⚠️ Game reset."
            );
        }

    };


console.log(
    "🟢 Baby Shiba Inu App.js loaded successfully."
);
