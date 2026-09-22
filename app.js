/* =========================================================
   BABY SHIBA INU
   APP.JS — FULL GAME ENGINE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    /* =====================================================
       TELEGRAM
    ===================================================== */

    const tg =
        window.Telegram &&
        window.Telegram.WebApp
            ? window.Telegram.WebApp
            : null;

    if (tg) {
        try {
            tg.ready();
            tg.expand();
        } catch (e) {
            console.log("Telegram WebApp init:", e);
        }
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const startButton = document.getElementById("startGame");
    const introPage = document.getElementById("introPage");
    const gameApp = document.getElementById("gameApp");

    const shibaButton = document.getElementById("shibaButton");

    const balanceEl = document.getElementById("balance");
    const totalMinedEl = document.getElementById("totalMined");

    const tapPowerEl = document.getElementById("tapPower");
    const mineRateEl = document.getElementById("mineRate");
    const statsMineRateEl =
        document.getElementById("statsMineRate");

    const energyEl = document.getElementById("energy");
    const maxEnergyEl =
        document.getElementById("maxEnergy");

    const energyFill =
        document.getElementById("energyFill");

    const levelEl =
        document.getElementById("level");

    const levelNameEl =
        document.getElementById("levelName");

    const xpFill =
        document.getElementById("xpFill");

    const playerNameEl =
        document.getElementById("playerName");

    const playerIdEl =
        document.getElementById("playerId");

    const miningStatusEl =
        document.getElementById("miningStatus");

    const toast =
        document.getElementById("toast");

    const toastText =
        document.getElementById("toastText");

    const effects =
        document.getElementById("effects");


    /* =====================================================
       GAME STATE
    ===================================================== */

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


    let state = loadGame();


    /* =====================================================
       LEVEL NAMES
    ===================================================== */

    const LEVEL_NAMES = {

        1: "Shiba Rookie",
        2: "Shiba Starter",
        3: "Shiba Hunter",
        4: "Shiba Fighter",
        5: "Shiba Warrior",
        6: "Shiba Elite",
        7: "Shiba Master",
        8: "Shiba Legend",
        9: "Shiba King",
        10: "Shiba Emperor"
    };


    /* =====================================================
       NUMBER FORMAT
    ===================================================== */

    function formatNumber(number) {

        const n = Number(number) || 0;

        if (n < 1000) {
            return Math.floor(n).toString();
        }

        return Math.floor(n).toLocaleString("en-US");
    }


    /* =====================================================
       SAVE GAME
    ===================================================== */

    function saveGame() {

        state.lastSaved = Date.now();

        try {

            localStorage.setItem(
                "babyShibaGameState",
                JSON.stringify(state)
            );

        } catch (e) {

            console.log(
                "Local save unavailable:",
                e
            );
        }
    }


    /* =====================================================
       LOAD GAME
    ===================================================== */

    function loadGame() {

        try {

            const saved =
                localStorage.getItem(
                    "babyShibaGameState"
                );

            if (saved) {

                const parsed =
                    JSON.parse(saved);

                return {
                    ...DEFAULT_STATE,
                    ...parsed
                };
            }

        } catch (e) {

            console.log(
                "Load game error:",
                e
            );
        }

        return {
            ...DEFAULT_STATE
        };
    }


    /* =====================================================
       PLAYER INFORMATION
    ===================================================== */

    function setupTelegramUser() {

        if (
            !tg ||
            !tg.initDataUnsafe ||
            !tg.initDataUnsafe.user
        ) {

            if (playerNameEl) {
                playerNameEl.textContent =
                    "Player";
            }

            if (playerIdEl) {
                playerIdEl.textContent =
                    "Telegram ID";
            }

            return;
        }

        const user =
            tg.initDataUnsafe.user;

        let name = "";

        if (user.first_name) {
            name += user.first_name;
        }

        if (user.last_name) {
            name += " " + user.last_name;
        }

        if (!name && user.username) {
            name = "@" + user.username;
        }

        if (!name) {
            name = "Player";
        }

        if (playerNameEl) {
            playerNameEl.textContent = name;
        }

        if (playerIdEl) {
            playerIdEl.textContent =
                "ID: " + user.id;
        }

        const refCode =
            document.getElementById("refCode");

        if (refCode) {
            refCode.textContent =
                "BSHIB-" + user.id;
        }
    }


    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    window.showPage = function (pageId) {

        const pages =
            document.querySelectorAll(
                ".game-page"
            );

        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );

        pages.forEach(function (page) {

            page.classList.remove("active");

        });

        const selectedPage =
            document.getElementById(pageId);

        if (!selectedPage) {
            return;
        }

        selectedPage.classList.add("active");


        /* NAV ACTIVE */

        navItems.forEach(function (button) {

            button.classList.remove("active");

            const code =
                button.getAttribute("onclick") || "";

            if (
                code.includes(
                    "'" + pageId + "'"
                ) ||
                code.includes(
                    '"' + pageId + '"'
                )
            ) {

                button.classList.add("active");
            }

        });


        /* MINING ACTIVE */

        if (pageId === "miningPage") {

            const miningNav =
                document.getElementById(
                    "miningNav"
                );

            if (miningNav) {
                miningNav.classList.add("active");
            }
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* =====================================================
       START GAME
    ===================================================== */

    if (startButton) {

        startButton.addEventListener(
            "click",
            function () {

                if (introPage) {

                    introPage.classList.remove(
                        "active"
                    );

                    introPage.style.display =
                        "none";
                }

                if (gameApp) {

                    gameApp.classList.remove(
                        "hidden"
                    );

                    gameApp.style.display =
                        "block";
                }

                window.showPage(
                    "miningPage"
                );

                updateUI();

                saveGame();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );
    }


    /* =====================================================
       TAP TO MINE
    ===================================================== */

    function tapMine() {

        if (state.energy <= 0) {

            showToast(
                "⚡ Not enough Energy"
            );

            return;
        }


        const amount =
            Math.max(
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
            "+" + formatNumber(amount)
        );


        if (tg) {

            try {

                tg.HapticFeedback.impactOccurred(
                    "light"
                );

            } catch (e) {}

        }


        saveGame();

    }


    /* =====================================================
       TAP BUTTON
    ===================================================== */

    if (shibaButton) {

        shibaButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                tapMine();

            }
        );

        shibaButton.addEventListener(
            "touchstart",
            function () {

                /* Prevent duplicate handling */

            },
            {
                passive: true
            }
        );
    }


    /* =====================================================
       AUTO MINING
    ===================================================== */

    function autoMine() {

        const amount =
            Number(state.mineRate) || 0;

        if (amount <= 0) {
            return;
        }


        state.balance += amount;

        state.totalMined += amount;

        state.xp += amount;


        checkLevel();

        updateUI();

    }


    /* =====================================================
       ENERGY RECHARGE
    ===================================================== */

    function rechargeEnergy() {

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
    }


    /* =====================================================
       LEVEL SYSTEM
    ===================================================== */

    function xpNeeded() {

        return (
            state.level * 100
        );
    }


    function checkLevel() {

        let needed =
            xpNeeded();


        while (
            state.xp >= needed &&
            state.level < 100
        ) {

            state.xp -= needed;

            state.level += 1;

            needed =
                xpNeeded();


            showToast(
                "🎉 Level Up! LVL " +
                state.level
            );

        }
    }


    /* =====================================================
       UPDATE UI
    ===================================================== */

    function updateUI() {

        if (balanceEl) {

            balanceEl.textContent =
                formatNumber(
                    state.balance
                );
        }


        if (totalMinedEl) {

            totalMinedEl.textContent =
                formatNumber(
                    state.totalMined
                );
        }


        if (tapPowerEl) {

            tapPowerEl.textContent =
                formatNumber(
                    state.tapPower
                );
        }


        if (mineRateEl) {

            mineRateEl.textContent =
                formatNumber(
                    state.mineRate
                ) + " BSHIB/s";
        }


        if (statsMineRateEl) {

            statsMineRateEl.textContent =
                formatNumber(
                    state.mineRate
                );
        }


        if (energyEl) {

            energyEl.textContent =
                Math.floor(
                    state.energy
                );
        }


        if (maxEnergyEl) {

            maxEnergyEl.textContent =
                Math.floor(
                    state.maxEnergy
                );
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
                Math.max(
                    0,
                    Math.min(
                        100,
                        percentage
                    )
                ) + "%";
        }


        if (levelEl) {

            levelEl.textContent =
                state.level;
        }


        if (levelNameEl) {

            levelNameEl.textContent =
                LEVEL_NAMES[
                    state.level
                ] ||
                "Shiba Legend";
        }


        if (xpFill) {

            const needed =
                xpNeeded();

            const percentage =
                needed > 0
                    ? (
                        state.xp /
                        needed
                    ) * 100
                    : 0;

            xpFill.style.width =
                Math.max(
                    0,
                    Math.min(
                        100,
                        percentage
                    )
                ) + "%";
        }


        updateUpgradeUI();

        updateShopUI();

        updateVIPUI();
    }


    /* =====================================================
       UPGRADE UI
    ===================================================== */

    function updateUpgradeUI() {

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


        if (tapCost) {

            tapCost.textContent =
                formatNumber(
                    state.tapCost
                );
        }


        if (energyCost) {

            energyCost.textContent =
                formatNumber(
                    state.energyCost
                );
        }


        if (boostCost) {

            boostCost.textContent =
                formatNumber(
                    state.boostCost
                );
        }
    }


    /* =====================================================
       TAP POWER UPGRADE
    ===================================================== */

    window.upgradeTap = function () {

        const cost =
            Number(state.tapCost);


        if (state.balance < cost) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }


        state.balance -= cost;

        state.tapPower += 1;

        state.tapCost =
            Math.ceil(
                state.tapCost * 1.5
            );


        showToast(
            "⚡ Tap Power upgraded!"
        );


        updateUI();

        saveGame();
    };


    /* =====================================================
       ENERGY UPGRADE
    ===================================================== */

    window.upgradeEnergy = function () {

        const cost =
            Number(state.energyCost);


        if (state.balance < cost) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }


        state.balance -= cost;

        state.maxEnergy += 250;

        state.energy += 250;


        if (
            state.energy >
            state.maxEnergy
        ) {

            state.energy =
                state.maxEnergy;
        }


        state.energyCost =
            Math.ceil(
                state.energyCost * 1.6
            );


        showToast(
            "🔋 Max Energy increased!"
        );


        updateUI();

        saveGame();
    };


    /* =====================================================
       MINING BOOST UPGRADE
    ===================================================== */

    window.upgradeBoost = function () {

        const cost =
            Number(state.boostCost);


        if (state.balance < cost) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }


        state.balance -= cost;

        state.mineRate += 1;

        state.boostCost =
            Math.ceil(
                state.boostCost * 1.7
            );


        showToast(
            "🚀 Mining Rate increased!"
        );


        updateUI();

        saveGame();
    };


    /* =====================================================
       SHOP UI
    ===================================================== */

    function updateShopUI() {

        const energyPackCost =
            document.getElementById(
                "energyPackCost"
            );

        const miningBoostCost =
            document.getElementById(
                "miningBoostCost"
            );


        if (energyPackCost) {

            energyPackCost.textContent =
                formatNumber(
                    state.energyPackCost
                );
        }


        if (miningBoostCost) {

            miningBoostCost.textContent =
                formatNumber(
                    state.miningBoostCost
                );
        }
    }


    /* =====================================================
       ENERGY PACK
    ===================================================== */

    const buyEnergyPack =
        document.getElementById(
            "buyEnergyPack"
        );


    if (buyEnergyPack) {

        buyEnergyPack.addEventListener(
            "click",
            function () {

                const cost =
                    state.energyPackCost;


                if (state.balance < cost) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;
                }


                state.balance -= cost;

                state.energy += 500;


                if (
                    state.energy >
                    state.maxEnergy
                ) {

                    state.energy =
                        state.maxEnergy;
                }


                showToast(
                    "⚡ Energy restored!"
                );


                updateUI();

                saveGame();

            }
        );
    }


    /* =====================================================
       MINING BOOST SHOP
    ===================================================== */

    const buyMiningBoost =
        document.getElementById(
            "buyMiningBoost"
        );


    if (buyMiningBoost) {

        buyMiningBoost.addEventListener(
            "click",
            function () {

                const cost =
                    state.miningBoostCost;


                if (state.balance < cost) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;
                }


                state.balance -= cost;

                state.mineRate += 2;


                showToast(
                    "🚀 Mining Boost activated!"
                );


                updateUI();

                saveGame();

            }
        );
    }


    /* =====================================================
       VIP SYSTEM
    ===================================================== */

    const VIP_DATA = {

        0: {
            name: "Free Member",
            miningBonus: "+0%",
            energyBonus: "+0",
            daily: "Locked"
        },

        1: {
            name: "Starter",
            miningBonus: "+10%",
            energyBonus: "+100",
            daily: "500 BSHIB"
        },

        2: {
            name: "Hunter",
            miningBonus: "+25%",
            energyBonus: "+250",
            daily: "1,000 BSHIB"
        },

        3: {
            name: "Warrior",
            miningBonus: "+50%",
            energyBonus: "+500",
            daily: "2,500 BSHIB"
        },

        4: {
            name: "Elite",
            miningBonus: "+75%",
            energyBonus: "+750",
            daily: "5,000 BSHIB"
        },

        5: {
            name: "Shiba Legend",
            miningBonus: "+100%",
            energyBonus: "+1,000",
            daily: "10,000 BSHIB"
        }
    };


    function updateVIPUI() {

        const data =
            VIP_DATA[state.vipLevel] ||
            VIP_DATA[0];


        const currentName =
            document.getElementById(
                "vipCurrentName"
            );

        const vipLevel =
            document.getElementById(
                "vipLevel"
            );

        const miningBonus =
            document.getElementById(
                "vipMiningBonus"
            );

        const energyBonus =
            document.getElementById(
                "vipEnergyBonus"
            );

        const dailyReward =
            document.getElementById(
                "vipDailyReward"
            );


        if (currentName) {
            currentName.textContent =
                data.name;
        }

        if (vipLevel) {
            vipLevel.textContent =
                "VIP " +
                state.vipLevel;
        }

        if (miningBonus) {
            miningBonus.textContent =
                data.miningBonus;
        }

        if (energyBonus) {
            energyBonus.textContent =
                data.energyBonus;
        }

        if (dailyReward) {
            dailyReward.textContent =
                data.daily;
        }


        document
            .querySelectorAll(
                ".vip-level-card"
            )
            .forEach(function (card) {

                const level =
                    Number(
                        card.dataset.vipLevel
                    );

                card.classList.toggle(
                    "current-vip",
                    level === state.vipLevel
                );
            });
    }


    /* =====================================================
       VIP BUY BUTTONS
    ===================================================== */

    document
        .querySelectorAll(".vip-buy-btn")
        .forEach(function (button) {

            if (
                button.disabled
            ) {
                return;
            }


            button.addEventListener(
                "click",
                function () {

                    const level =
                        Number(
                            button.dataset.vipLevel
                        );


                    const prices = {

                        1: 10000,

                        2: 50000,

                        3: 150000,

                        4: 400000,

                        5: 1000000
                    };


                    const price =
                        prices[level];


                    if (!price) {
                        return;
                    }


                    if (
                        state.balance <
                        price
                    ) {

                        showToast(
                            "❌ Not enough BSHIB"
                        );

                        return;
                    }


                    if (
                        level <=
                        state.vipLevel
                    ) {

                        showToast(
                            "👑 You already have this VIP"
                        );

                        return;
                    }


                    state.balance -=
                        price;

                    state.vipLevel =
                        level;


                    const vipData =
                        VIP_DATA[level];


                    if (vipData) {

                        const bonus =
                            parseInt(
                                vipData.energyBonus
                            ) || 0;

                        state.maxEnergy =
                            1000 + bonus;

                        if (
                            state.energy >
                            state.maxEnergy
                        ) {

                            state.energy =
                                state.maxEnergy;
                        }
                    }


                    showToast(
                        "👑 VIP " +
                        level +
                        " activated!"
                    );


                    updateUI();

                    saveGame();

                }
            );
        });


    /* =====================================================
       VIP DAILY REWARD
    ===================================================== */

    const claimVipReward =
        document.getElementById(
            "claimVipReward"
        );


    if (claimVipReward) {

        claimVipReward.addEventListener(
            "click",
            function () {

                if (
                    state.vipLevel <= 0
                ) {

                    showToast(
                        "🔒 VIP Reward Locked"
                    );

                    return;
                }


                const rewards = {

                    1: 500,

                    2: 1000,

                    3: 2500,

                    4: 5000,

                    5: 10000
                };


                const reward =
                    rewards[
                        state.vipLevel
                    ] || 0;


                state.balance +=
                    reward;


                state.totalMined +=
                    reward;


                showToast(
                    "🎁 +" +
                    formatNumber(
                        reward
                    ) +
                    " BSHIB"
                );


                updateUI();

                saveGame();

            }
        );
    }


    /* =====================================================
       FRIENDS — COPY
    ===================================================== */

    const copyRef =
        document.getElementById(
            "copyRef"
        );


    if (copyRef) {

        copyRef.addEventListener(
            "click",
            async function () {

                const refCode =
                    document.getElementById(
                        "refCode"
                    );


                if (!refCode) {
                    return;
                }


                const text =
                    refCode.textContent;


                try {

                    await navigator.clipboard
                        .writeText(text);

                    showToast(
                        "📋 Referral code copied!"
                    );

                } catch (e) {

                    showToast(
                        "📋 " + text
                    );
                }

            }
        );
    }


    /* =====================================================
       INVITE FRIENDS
    ===================================================== */

    const inviteBtn =
        document.getElementById(
            "inviteBtn"
        );


    if (inviteBtn) {

        inviteBtn.addEventListener(
            "click",
            function () {

                const botUsername =
                    "shibababycoinbot";


                const userId =
                    tg &&
                    tg.initDataUnsafe &&
                    tg.initDataUnsafe.user
                        ? tg.initDataUnsafe.user.id
                        : "";


                const referral =
                    userId
                        ? "?start=ref_" +
                          userId
                        : "";


                const link =
                    "https://t.me/" +
                    botUsername +
                    referral;


                const shareUrl =
                    "https://t.me/share/url?url=" +
                    encodeURIComponent(
                        link
                    ) +
                    "&text=" +
                    encodeURIComponent(
                        "🐕 Join Baby Shiba Inu and start mining BSHIB!"
                    );


                if (tg) {

                    try {

                        tg.openTelegramLink(
                            shareUrl
                        );

                        return;

                    } catch (e) {}
                }


                window.open(
                    shareUrl,
                    "_blank"
                );
            }
        );
    }


    /* =====================================================
       SOUND BUTTON
    ===================================================== */

    const soundBtn =
        document.getElementById(
            "soundBtn"
        );


    let soundOn = true;


    if (soundBtn) {

        soundBtn.addEventListener(
            "click",
            function () {

                soundOn =
                    !soundOn;

                soundBtn.textContent =
                    soundOn
                        ? "🔊"
                        : "🔇";

                showToast(
                    soundOn
                        ? "🔊 Sound ON"
                        : "🔇 Sound OFF"
                );
            }
        );
    }


    /* =====================================================
       COIN EFFECT
    ===================================================== */

    function createCoinEffect(text) {

        if (!effects) {
            return;
        }


        const effect =
            document.createElement(
                "div"
            );


        effect.className =
            "coin-effect";


        effect.textContent =
            text;


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


        effects.appendChild(
            effect
        );


        setTimeout(
            function () {

                effect.remove();

            },
            1000
        );
    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer = null;


    function showToast(message) {

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


        if (toastTimer) {

            clearTimeout(
                toastTimer
            );
        }


        toastTimer =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                1800
            );
    }


    /* =====================================================
       AUTO GAME LOOPS
    ===================================================== */

    setInterval(
        function () {

            autoMine();

            rechargeEnergy();

            saveGame();

        },
        1000
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    setupTelegramUser();

    updateUI();


    /*
       IMPORTANT:
       Intro remains visible initially.
       Mining opens after START MINING.
    */

    if (
        gameApp &&
        !gameApp.classList.contains(
            "hidden"
        )
    ) {

        window.showPage(
            "miningPage"
        );
    }


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "🐕 Baby Shiba Inu Game loaded"
    );

    console.log(
        "💰 Balance:",
        state.balance
    );

    console.log(
        "⛏️ Mining Rate:",
        state.mineRate
    );

    console.log(
        "⚡ Energy:",
        state.energy
    );

});
