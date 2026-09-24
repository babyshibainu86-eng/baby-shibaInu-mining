document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       TELEGRAM
    ========================================= */

    const tg = window.Telegram && window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;

    if (tg) {
        try {
            tg.ready();
            tg.expand();
        } catch (error) {
            console.log("Telegram WebApp init error:", error);
        }
    }


    /* =========================================
       DOM
    ========================================= */

    const introPage = document.getElementById("introPage");
    const gameApp = document.getElementById("gameApp");
    const startGame = document.getElementById("startGame");

    const shibaButton = document.getElementById("shibaButton");

    const balanceEl = document.getElementById("balance");
    const totalMinedEl = document.getElementById("totalMined");

    const tapPowerEl = document.getElementById("tapPower");
    const mineRateEl = document.getElementById("mineRate");
    const statsMineRateEl = document.getElementById("statsMineRate");

    const energyEl = document.getElementById("energy");
    const maxEnergyEl = document.getElementById("maxEnergy");
    const energyFill = document.getElementById("energyFill");

    const levelEl = document.getElementById("level");
    const levelNameEl = document.getElementById("levelName");
    const xpFill = document.getElementById("xpFill");

    const playerNameEl = document.getElementById("playerName");
    const playerIdEl = document.getElementById("playerId");

    const refCodeEl = document.getElementById("refCode");

    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");

    const effects = document.getElementById("effects");

    const soundBtn = document.getElementById("soundBtn");

    const buyEnergyPackBtn = document.getElementById("buyEnergyPack");
    const buyMiningBoostBtn = document.getElementById("buyMiningBoost");

    const claimVipRewardBtn = document.getElementById("claimVipReward");

    const copyRefBtn = document.getElementById("copyRef");
    const inviteBtn = document.getElementById("inviteBtn");


    /* =========================================
       DEFAULT GAME STATE
    ========================================= */

    const DEFAULT_STATE = {
        balance: 0,
        totalMined: 0,

        tapPower: 1,
        mineRate: 1,

        energy: 1000,
        maxEnergy: 1000,

        level: 1,
        xp: 0,

        vipLevel: 0,

        tapCost: 100,
        energyCost: 250,
        boostCost: 500,

        energyPackCost: 250,
        miningBoostCost: 500,

        lastSaved: Date.now()
    };


    const STORAGE_KEY = "babyShibaGameState";


    let state = loadGame();


    /* =========================================
       HELPERS
    ========================================= */

    function formatNumber(value) {
        const number = Number(value) || 0;

        return Math.floor(number).toLocaleString("en-US");
    }


    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }


    function saveGame() {
        try {
            state.lastSaved = Date.now();

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );
        } catch (error) {
            console.log("Save error:", error);
        }
    }


    function loadGame() {
        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return { ...DEFAULT_STATE };
            }

            const parsed = JSON.parse(saved);

            return {
                ...DEFAULT_STATE,
                ...parsed
            };

        } catch (error) {

            console.log("Load error:", error);

            return { ...DEFAULT_STATE };
        }
    }


    /* =========================================
       TELEGRAM USER
    ========================================= */

    function setupTelegramUser() {

        if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {

            if (playerNameEl) {
                playerNameEl.textContent = "Player";
            }

            if (playerIdEl) {
                playerIdEl.textContent = "Telegram ID";
            }

            if (refCodeEl) {
                refCodeEl.textContent = "BSHIB";
            }

            return;
        }


        const user = tg.initDataUnsafe.user;


        let displayName = "";

        if (user.first_name) {
            displayName += user.first_name;
        }

        if (user.last_name) {
            displayName += " " + user.last_name;
        }

        if (!displayName.trim()) {
            displayName = user.username
                ? "@" + user.username
                : "Player";
        }


        if (playerNameEl) {
            playerNameEl.textContent = displayName.trim();
        }


        if (playerIdEl) {
            playerIdEl.textContent = "ID: " + user.id;
        }


        if (refCodeEl) {

            const code = user.username
                ? user.username
                : String(user.id);

            refCodeEl.textContent = code;
        }
    }


    /* =========================================
       PAGE NAVIGATION
    ========================================= */

    window.showPage = function (pageId) {

        const pages = document.querySelectorAll(".game-page");

        pages.forEach(function (page) {
            page.classList.remove("active");
        });


        const selectedPage = document.getElementById(pageId);

        if (selectedPage) {
            selectedPage.classList.add("active");
        }


        const navItems = document.querySelectorAll(".nav-item");

        navItems.forEach(function (item) {
            item.classList.remove("active");
        });


        const navButtons = document.querySelectorAll(".nav-item");

        navButtons.forEach(function (button) {

            const clickCode = button.getAttribute("onclick") || "";

            if (clickCode.includes("'" + pageId + "'")) {
                button.classList.add("active");
            }

        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* =========================================
       START GAME
    ========================================= */

    if (startGame) {

        startGame.addEventListener("click", function () {

            if (introPage) {
                introPage.classList.remove("active");
            }

            if (gameApp) {
                gameApp.classList.remove("hidden");
            }

            window.showPage("miningPage");

            updateUI();
            saveGame();

        });

    }


    /* =========================================
       TAP MINING
    ========================================= */

    function tapMine(x, y) {

        if (state.energy <= 0) {

            showToast("⚡ Not enough Energy");

            return;
        }


        const amount = Math.max(
            1,
            Number(state.tapPower) || 1
        );


        state.balance += amount;

        state.totalMined += amount;

        state.energy -= 1;

        state.xp += amount;


        checkLevel();

        updateUI();


        createCoinEffect(
            "+" + formatNumber(amount),
            x,
            y
        );


        if (tg) {

            try {

                tg.HapticFeedback.impactOccurred("light");

            } catch (error) {

                console.log("Haptic error:", error);

            }

        }


        saveGame();
    }


    /* =========================================
       SHIBA BUTTON
    ========================================= */

    if (shibaButton) {

        shibaButton.addEventListener(
            "pointerdown",
            function (event) {

                event.preventDefault();

                tapMine(
                    event.clientX,
                    event.clientY
                );

            }
        );


        shibaButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

            }
        );

    }


    /* =========================================
       LEVEL SYSTEM
    ========================================= */

    function getRequiredXP(level) {

        return Math.max(
            100,
            level * 100
        );
    }


    function checkLevel() {

        let requiredXP = getRequiredXP(state.level);


        while (state.xp >= requiredXP) {

            state.xp -= requiredXP;

            state.level += 1;

            requiredXP = getRequiredXP(state.level);

            showToast(
                "🎉 Level Up! LVL " + state.level
            );
        }

    }


    function getLevelName(level) {

        if (level >= 20) return "Shiba Legend";
        if (level >= 15) return "Shiba Master";
        if (level >= 10) return "Shiba Warrior";
        if (level >= 5) return "Shiba Hunter";

        return "Shiba Rookie";
    }


    /* =========================================
       VIP
    ========================================= */

    const VIP_DATA = {

        0: {
            name: "Free Member",
            mining: 0,
            energy: 0,
            daily: 0,
            price: 0
        },

        1: {
            name: "Starter",
            mining: 10,
            energy: 100,
            daily: 500,
            price: 10000
        },

        2: {
            name: "Hunter",
            mining: 25,
            energy: 250,
            daily: 1000,
            price: 50000
        },

        3: {
            name: "Warrior",
            mining: 50,
            energy: 500,
            daily: 2500,
            price: 150000
        },

        4: {
            name: "Elite",
            mining: 75,
            energy: 750,
            daily: 5000,
            price: 400000
        },

        5: {
            name: "Shiba Legend",
            mining: 100,
            energy: 1000,
            daily: 10000,
            price: 1000000
        }

    };


    function updateVIP() {

        const vip = VIP_DATA[state.vipLevel] || VIP_DATA[0];


        const vipCurrentName =
            document.getElementById("vipCurrentName");

        const vipLevel =
            document.getElementById("vipLevel");

        const vipMiningBonus =
            document.getElementById("vipMiningBonus");

        const vipEnergyBonus =
            document.getElementById("vipEnergyBonus");

        const vipDailyReward =
            document.getElementById("vipDailyReward");


        if (vipCurrentName) {
            vipCurrentName.textContent = vip.name;
        }

        if (vipLevel) {
            vipLevel.textContent =
                "VIP " + state.vipLevel;
        }

        if (vipMiningBonus) {
            vipMiningBonus.textContent =
                "+" + vip.mining + "%";
        }

        if (vipEnergyBonus) {
            vipEnergyBonus.textContent =
                "+" + vip.energy;
        }

        if (vipDailyReward) {

            vipDailyReward.textContent =
                vip.daily > 0
                    ? formatNumber(vip.daily) + " BSHIB"
                    : "Locked";

        }


        updateVIPCards();
    }


    function updateVIPCards() {

        const cards =
            document.querySelectorAll(".vip-level-card");


        cards.forEach(function (card) {

            const level =
                Number(card.dataset.vipLevel);


            const button =
                card.querySelector(".vip-buy-btn");


            if (!button) return;


            card.classList.remove(
                "current-vip",
                "locked-vip"
            );


            if (level === state.vipLevel) {

                card.classList.add("current-vip");

                button.disabled = true;

                button.textContent = "✅ Current";

                return;
            }


            if (level < state.vipLevel) {

                button.disabled = true;

                button.textContent = "✅ Unlocked";

                return;
            }


            const vip = VIP_DATA[level];

            if (!vip) return;


            button.disabled = false;

            button.textContent =
                "👑 Activate VIP " + level;

        });

    }


    /* =========================================
       VIP BUY
    ========================================= */

    const vipButtons =
        document.querySelectorAll(".vip-buy-btn[data-vip-level]");


    vipButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const targetLevel =
                Number(button.dataset.vipLevel);


            const vip =
                VIP_DATA[targetLevel];


            if (!vip) return;


            if (targetLevel <= state.vipLevel) {

                showToast("✅ VIP already unlocked");

                return;
            }


            if (state.balance < vip.price) {

                showToast(
                    "❌ Not enough BSHIB"
                );

                return;
            }


            state.balance -= vip.price;

            state.vipLevel = targetLevel;


            const oldMaxEnergy =
                state.maxEnergy;


            state.maxEnergy =
                1000 + vip.energy;


            state.energy =
                Math.min(
                    state.energy +
                    (state.maxEnergy - oldMaxEnergy),
                    state.maxEnergy
                );


            showToast(
                "👑 VIP " +
                targetLevel +
                " Activated!"
            );


            updateUI();

            saveGame();

        });

    });


    /* =========================================
       VIP DAILY REWARD
    ========================================= */

    if (claimVipReward) {

        claimVipReward.addEventListener(
            "click",
            function () {

                const vip =
                    VIP_DATA[state.vipLevel] ||
                    VIP_DATA[0];


                if (state.vipLevel <= 0) {

                    showToast(
                        "🔒 Upgrade VIP first"
                    );

                    return;
                }


                const reward =
                    Number(vip.daily) || 0;


                if (reward <= 0) {

                    showToast(
                        "🔒 Reward unavailable"
                    );

                    return;
                }


                state.balance += reward;


                showToast(
                    "🎁 +" +
                    formatNumber(reward) +
                    " BSHIB"
                );


                updateUI();

                saveGame();

            }
        );

    }


    /* =========================================
       UPGRADES
    ========================================= */

    window.upgradeTap = function () {

        const cost =
            Number(state.tapCost) || 100;


        if (state.balance < cost) {

            showToast("❌ Not enough BSHIB");

            return;
        }


        state.balance -= cost;

        state.tapPower += 1;

        state.tapCost =
            Math.floor(cost * 1.5);


        showToast("⚡ Tap Power Upgraded!");

        updateUI();

        saveGame();
    };


    window.upgradeEnergy = function () {

        const cost =
            Number(state.energyCost) || 250;


        if (state.balance < cost) {

            showToast("❌ Not enough BSHIB");

            return;
        }


        state.balance -= cost;

        state.maxEnergy += 250;

        state.energy =
            Math.min(
                state.energy + 250,
                state.maxEnergy
            );


        state.energyCost =
            Math.floor(cost * 1.5);


        showToast("🔋 Energy Upgraded!");

        updateUI();

        saveGame();
    };


    window.upgradeBoost = function () {

        const cost =
            Number(state.boostCost) || 500;


        if (state.balance < cost) {

            showToast("❌ Not enough BSHIB");

            return;
        }


        state.balance -= cost;

        state.mineRate += 1;

        state.boostCost =
            Math.floor(cost * 1.5);


        showToast("🚀 Mining Rate Increased!");

        updateUI();

        saveGame();
    };


    /* =========================================
       SHOP
    ========================================= */

    if (buyEnergyPackBtn) {

        buyEnergyPackBtn.addEventListener(
            "click",
            function () {

                const cost =
                    Number(state.energyPackCost) || 250;


                if (state.balance < cost) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;
                }


                state.balance -= cost;


                state.energy =
                    Math.min(
                        state.energy + 500,
                        state.maxEnergy
                    );


                showToast(
                    "⚡ Energy Restored!"
                );


                updateUI();

                saveGame();

            }
        );

    }


    if (buyMiningBoostBtn) {

        buyMiningBoostBtn.addEventListener(
            "click",
            function () {

                const cost =
                    Number(state.miningBoostCost) || 500;


                if (state.balance < cost) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;
                }


                state.balance -= cost;

                state.mineRate += 1;


                showToast(
                    "🚀 Mining Boost Activated!"
                );


                updateUI();

                saveGame();

            }
        );

    }


    /* =========================================
       REFERRAL
    ========================================= */

    if (copyRefBtn) {

        copyRefBtn.addEventListener(
            "click",
            async function () {

                const code =
                    refCodeEl
                        ? refCodeEl.textContent
                        : "BSHIB";


                try {

                    await navigator.clipboard.writeText(
                        code
                    );

                    showToast(
                        "📋 Referral copied!"
                    );

                } catch (error) {

                    showToast(
                        "📋 " + code
                    );

                }

            }
        );

    }


    if (inviteBtn) {

        inviteBtn.addEventListener(
            "click",
            function () {

                const botUsername =
                    "shibababycoinbot";


                const text =
                    "Join Baby Shiba Inu 🐕";


                const url =
                    "https://t.me/" +
                    botUsername;


                if (tg) {

                    try {

                        tg.openTelegramLink(
                            url
                        );

                        return;

                    } catch (error) {

                        console.log(
                            "Telegram link error:",
                            error
                        );

                    }

                }


                window.open(
                    url,
                    "_blank"
                );

            }
        );

    }


    /* =========================================
       SOUND BUTTON
    ========================================= */

    let soundEnabled = true;


    if (soundBtn) {

        soundBtn.addEventListener(
            "click",
            function () {

                soundEnabled =
                    !soundEnabled;


                soundBtn.textContent =
                    soundEnabled
                        ? "🔊"
                        : "🔇";

            }
        );

    }


    /* =========================================
       UI UPDATE
    ========================================= */

    function updateUI() {

        if (balanceEl) {
            balanceEl.textContent =
                formatNumber(state.balance);
        }


        if (totalMinedEl) {
            totalMinedEl.textContent =
                formatNumber(state.totalMined);
        }


        if (tapPowerEl) {
            tapPowerEl.textContent =
                formatNumber(state.tapPower);
        }


        if (mineRateEl) {

            mineRateEl.textContent =
                formatNumber(state.mineRate) +
                " BSHIB/s";

        }


        if (statsMineRateEl) {

            statsMineRateEl.textContent =
                formatNumber(state.mineRate);

        }


        if (energyEl) {
            energyEl.textContent =
                formatNumber(state.energy);
        }


        if (maxEnergyEl) {
            maxEnergyEl.textContent =
                formatNumber(state.maxEnergy);
        }


        if (energyFill) {

            const percentage =
                state.maxEnergy > 0
                    ? (
                        state.energy /
                        state.maxEnergy
                    ) * 100
                    : 0;


            energyFill.style.width =
                clamp(
                    percentage,
                    0,
                    100
                ) + "%";

        }


        if (levelEl) {
            levelEl.textContent =
                state.level;
        }


        if (levelNameEl) {
            levelNameEl.textContent =
                getLevelName(state.level);
        }


        if (xpFill) {

            const requiredXP =
                getRequiredXP(state.level);


            const percentage =
                requiredXP > 0
                    ? (
                        state.xp /
                        requiredXP
                    ) * 100
                    : 0;


            xpFill.style.width =
                clamp(
                    percentage,
                    0,
                    100
                ) + "%";

        }


        const tapCost =
            document.getElementById("tapCost");

        const energyCost =
            document.getElementById("energyCost");

        const boostCost =
            document.getElementById("boostCost");

        const energyPackCost =
            document.getElementById("energyPackCost");

        const miningBoostCost =
            document.getElementById("miningBoostCost");


        if (tapCost) {
            tapCost.textContent =
                formatNumber(state.tapCost);
        }


        if (energyCost) {
            energyCost.textContent =
                formatNumber(state.energyCost);
        }


        if (boostCost) {
            boostCost.textContent =
                formatNumber(state.boostCost);
        }


        if (energyPackCost) {
            energyPackCost.textContent =
                formatNumber(state.energyPackCost);
        }


        if (miningBoostCost) {
            miningBoostCost.textContent =
                formatNumber(state.miningBoostCost);
        }


        updateVIP();

    }


    /* =========================================
       COIN EFFECT
       EXACT TOUCH POSITION
    ========================================= */

    function createCoinEffect(text, x, y) {

        if (!effects) return;


        const effect =
            document.createElement("div");


        effect.className =
            "coin-effect";


        effect.textContent =
            text;


        /*
         * Pointer coordinates are already
         * viewport coordinates.
         *
         * .effects is fixed to viewport.
         */

        if (
            typeof x === "number" &&
            typeof y === "number"
        ) {

            effect.style.left =
                x + "px";

            effect.style.top =
                y + "px";

        } else {

            const rect =
                shibaButton
                    ? shibaButton.getBoundingClientRect()
                    : null;


            if (rect) {

                effect.style.left =
                    (
                        rect.left +
                        rect.width / 2
                    ) + "px";


                effect.style.top =
                    (
                        rect.top +
                        rect.height / 2
                    ) + "px";

            } else {

                effect.style.left =
                    "50%";

                effect.style.top =
                    "50%";

            }

        }


        effects.appendChild(effect);


        setTimeout(
            function () {

                if (effect.parentNode) {
                    effect.remove();
                }

            },
            900
        );

    }


    /* =========================================
       TOAST
    ========================================= */

    let toastTimer = null;


    function showToast(message) {

        if (!toast || !toastText) return;


        toastText.textContent =
            message;


        toast.classList.add("show");


        if (toastTimer) {
            clearTimeout(toastTimer);
        }


        toastTimer =
            setTimeout(
                function () {

                    toast.classList.remove("show");

                },
                1800
            );

    }


    window.showToast = showToast;


    /* =========================================
       AUTO MINING
    ========================================= */

    setInterval(
        function () {

            if (!gameApp) return;

            if (
                gameApp.classList.contains("hidden")
            ) {
                return;
            }


            const amount =
                Math.max(
                    0,
                    Number(state.mineRate) || 0
                );


            if (amount > 0) {

                state.balance += amount;

                state.totalMined += amount;

                state.xp += amount;

                checkLevel();

                updateUI();

            }

        },
        1000
    );


    /* =========================================
       ENERGY RECHARGE
    ========================================= */

    setInterval(
        function () {

            if (!gameApp) return;

            if (
                gameApp.classList.contains("hidden")
            ) {
                return;
            }


            if (
                state.energy <
                state.maxEnergy
            ) {

                state.energy += 1;


                if (
                    state.energy >
                    state.maxEnergy
                ) {

                    state.energy =
                        state.maxEnergy;

                }


                updateUI();

            }

        },
        1000
    );


    /* =========================================
       AUTO SAVE
    ========================================= */

    setInterval(
        function () {

            if (!gameApp) return;

            if (
                gameApp.classList.contains("hidden")
            ) {
                return;
            }


            saveGame();

        },
        5000
    );


    /* =========================================
       INITIALIZE
    ========================================= */

    setupTelegramUser();

    updateUI();

    window.showPage("miningPage");


    console.log(
        "Baby Shiba Inu game initialized successfully."
    );

});
