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

    const energyEl = document.getElementById("energy");
    const maxEnergyEl = document.getElementById("maxEnergy");
    const energyFill = document.getElementById("energyFill");

    const levelEl = document.getElementById("levelValue");
    const xpValueEl = document.getElementById("xpValue");
    const xpFill = document.getElementById("xpFill");
    const xpTextEl = document.getElementById("xpText");

    const playerNameEl = document.getElementById("playerName");
    const playerIdEl = document.getElementById("playerId");

    const referralCodeEl = document.getElementById("referralCode");

    const toast = document.getElementById("toast");

    const effects = document.getElementById("effects");

    const energyPackButton =
        document.getElementById("energyPackButton");

    const miningBoostButton =
        document.getElementById("miningBoostButton");

    const vipRewardButton =
        document.getElementById("vipRewardButton");

    const copyReferralButton =
        document.getElementById("copyReferral");

    const inviteFriendsButton =
        document.getElementById("inviteFriends");

    const vipLevelEl =
        document.getElementById("vipLevel");

    const currentVipLevelEl =
        document.getElementById("currentVipLevel");

    const vipMiningBonusEl =
        document.getElementById("vipMiningBonus");

    const vipEnergyBonusEl =
        document.getElementById("vipEnergyBonus");

    const tapUpgradeLevelEl =
        document.getElementById("tapUpgradeLevel");

    const energyUpgradeValueEl =
        document.getElementById("energyUpgradeValue");

    const miningUpgradeValueEl =
        document.getElementById("miningUpgradeValue");


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


    const STORAGE_KEY =
        "babyShibaGameState";


    let state =
        loadGame();


    /* =========================================
       HELPERS
    ========================================= */

    function formatNumber(value) {

        const number =
            Number(value) || 0;

        return Math.floor(number)
            .toLocaleString("en-US");

    }


    function clamp(value, min, max) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }


    function saveGame() {

        try {

            state.lastSaved =
                Date.now();

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.log(
                "Save error:",
                error
            );

        }

    }


    function loadGame() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!saved) {

                return {
                    ...DEFAULT_STATE
                };

            }


            const parsed =
                JSON.parse(saved);


            return {
                ...DEFAULT_STATE,
                ...parsed
            };

        } catch (error) {

            console.log(
                "Load error:",
                error
            );

            return {
                ...DEFAULT_STATE
            };

        }

    }


    /* =========================================
       TELEGRAM USER
    ========================================= */

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
                    "---";
            }

            if (referralCodeEl) {
                referralCodeEl.textContent =
                    "BSHIB";
            }

            return;
        }


        const user =
            tg.initDataUnsafe.user;


        let displayName = "";


        if (user.first_name) {

            displayName +=
                user.first_name;

        }


        if (user.last_name) {

            displayName +=
                " " + user.last_name;

        }


        if (!displayName.trim()) {

            displayName =
                user.username
                    ? "@" + user.username
                    : "Player";

        }


        if (playerNameEl) {

            playerNameEl.textContent =
                displayName.trim();

        }


        if (playerIdEl) {

            playerIdEl.textContent =
                user.id;

        }


        if (referralCodeEl) {

            const code =
                user.username
                    ? user.username
                    : String(user.id);

            referralCodeEl.textContent =
                code;

        }

    }


    /* =========================================
       PAGE NAVIGATION
    ========================================= */

    function showPage(pageId) {

        const pages =
            document.querySelectorAll(
                ".game-page"
            );


        pages.forEach(function (page) {

            page.classList.remove(
                "active"
            );

        });


        const selectedPage =
            document.getElementById(
                pageId
            );


        if (selectedPage) {

            selectedPage.classList.add(
                "active"
            );

        }


        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        navItems.forEach(function (item) {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.page ===
                pageId
            ) {

                item.classList.add(
                    "active"
                );

            }

        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    window.showPage =
        showPage;


    /* =========================================
       BOTTOM NAVIGATION
    ========================================= */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                const pageId =
                    item.dataset.page;


                if (pageId) {

                    showPage(
                        pageId
                    );

                }

            }
        );

    });


    /* =========================================
       START GAME
    ========================================= */

    if (startGame) {

        startGame.addEventListener(
            "click",
            function () {

                if (introPage) {

                    introPage.classList.remove(
                        "active"
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


                updateUI();

                saveGame();

            }
        );

    }


    /* =========================================
       TAP MINING
    ========================================= */

    function tapMine(x, y) {

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


        state.balance +=
            amount;


        state.totalMined +=
            amount;


        state.energy -=
            1;


        state.xp +=
            amount;


        checkLevel();

        updateUI();


        createCoinEffect(
            "+" + formatNumber(amount),
            x,
            y
        );


        if (tg) {

            try {

                tg.HapticFeedback
                    .impactOccurred(
                        "light"
                    );

            } catch (error) {

                console.log(
                    "Haptic error:",
                    error
                );

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
            Number(level) * 100
        );

    }


    function checkLevel() {

        let requiredXP =
            getRequiredXP(
                state.level
            );


        while (
            state.xp >=
            requiredXP
        ) {

            state.xp -=
                requiredXP;


            state.level +=
                1;


            requiredXP =
                getRequiredXP(
                    state.level
                );


            showToast(
                "🎉 Level Up! LVL " +
                state.level
            );

        }

    }


    /* =========================================
       VIP
    ========================================= */

    const VIP_DATA = {

        0: {
            mining: 0,
            energy: 0,
            daily: 0,
            price: 0
        },

        1: {
            mining: 5,
            energy: 100,
            daily: 500,
            price: 10000
        },

        2: {
            mining: 10,
            energy: 200,
            daily: 1000,
            price: 50000
        },

        3: {
            mining: 15,
            energy: 300,
            daily: 2500,
            price: 150000
        },

        4: {
            mining: 25,
            energy: 500,
            daily: 5000,
            price: 400000
        },

        5: {
            mining: 50,
            energy: 1000,
            daily: 10000,
            price: 1000000
        }

    };


    function updateVIP() {

        const vip =
            VIP_DATA[
                state.vipLevel
            ] || VIP_DATA[0];


        if (vipLevelEl) {

            vipLevelEl.textContent =
                state.vipLevel;

        }


        if (currentVipLevelEl) {

            currentVipLevelEl.textContent =
                "VIP " +
                state.vipLevel;

        }


        if (vipMiningBonusEl) {

            vipMiningBonusEl.textContent =
                "+" +
                vip.mining +
                "%";

        }


        if (vipEnergyBonusEl) {

            vipEnergyBonusEl.textContent =
                "+" +
                vip.energy;

        }


        updateVIPButtons();

    }


    function updateVIPButtons() {

        const buttons =
            document.querySelectorAll(
                ".vip-buy-btn"
            );


        buttons.forEach(
            function (button) {

                const level =
                    Number(
                        button.dataset.vip
                    );


                if (!level) return;


                if (
                    level <=
                    state.vipLevel
                ) {

                    button.disabled =
                        true;

                    button.textContent =
                        "ACTIVE";

                } else {

                    button.disabled =
                        false;

                    button.textContent =
                        "ACTIVATE";

                }

            }
        );

    }


    /* =========================================
       VIP BUTTONS
    ========================================= */

    const vipButtons =
        document.querySelectorAll(
            ".vip-buy-btn"
        );


    vipButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const targetLevel =
                        Number(
                            button.dataset.vip
                        );


                    const vip =
                        VIP_DATA[
                            targetLevel
                        ];


                    if (!vip) return;


                    if (
                        targetLevel <=
                        state.vipLevel
                    ) {

                        showToast(
                            "✅ VIP already active"
                        );

                        return;

                    }


                    if (
                        state.balance <
                        vip.price
                    ) {

                        showToast(
                            "❌ Not enough BSHIB"
                        );

                        return;

                    }


                    state.balance -=
                        vip.price;


                    state.vipLevel =
                        targetLevel;


                    const oldMaxEnergy =
                        state.maxEnergy;


                    state.maxEnergy =
                        1000 +
                        vip.energy;


                    state.energy =
                        Math.min(
                            state.energy +
                            (
                                state.maxEnergy -
                                oldMaxEnergy
                            ),
                            state.maxEnergy
                        );


                    showToast(
                        "👑 VIP " +
                        targetLevel +
                        " Activated!"
                    );


                    updateUI();

                    saveGame();

                }
            );

        }
    );


    /* =========================================
       VIP DAILY REWARD
    ========================================= */

    if (vipRewardButton) {

        vipRewardButton.addEventListener(
            "click",
            function () {

                const vip =
                    VIP_DATA[
                        state.vipLevel
                    ] || VIP_DATA[0];


                if (
                    state.vipLevel <= 0
                ) {

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


                state.balance +=
                    reward;


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
       SHOP
    ========================================= */

    if (energyPackButton) {

        energyPackButton.addEventListener(
            "click",
            function () {

                const cost =
                    Number(
                        state.energyPackCost
                    ) || 250;


                if (
                    state.balance <
                    cost
                ) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                state.balance -=
                    cost;


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


    if (miningBoostButton) {

        miningBoostButton.addEventListener(
            "click",
            function () {

                const cost =
                    Number(
                        state.miningBoostCost
                    ) || 500;


                if (
                    state.balance <
                    cost
                ) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                state.balance -=
                    cost;


                state.mineRate +=
                    1;


                showToast(
                    "🚀 Mining Boost Activated!"
                );


                updateUI();

                saveGame();

            }
        );

    }


    /* =========================================
       UPGRADES
    ========================================= */

    if (tapUpgradeLevelEl) {

        tapUpgradeLevelEl.textContent =
            state.tapPower;

    }


    window.upgradeTap = function () {

        const cost =
            Number(
                state.tapCost
            ) || 100;


        if (
            state.balance <
            cost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;

        }


        state.balance -=
            cost;


        state.tapPower +=
            1;


        state.tapCost =
            Math.floor(
                cost * 1.5
            );


        showToast(
            "⚡ Tap Power Upgraded!"
        );


        updateUI();

        saveGame();

    };


    window.upgradeEnergy = function () {

        const cost =
            Number(
                state.energyCost
            ) || 250;


        if (
            state.balance <
            cost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;

        }


        state.balance -=
            cost;


        state.maxEnergy +=
            250;


        state.energy =
            Math.min(
                state.energy + 250,
                state.maxEnergy
            );


        state.energyCost =
            Math.floor(
                cost * 1.5
            );


        showToast(
            "🔋 Energy Upgraded!"
        );


        updateUI();

        saveGame();

    };


    window.upgradeBoost = function () {

        const cost =
            Number(
                state.boostCost
            ) || 500;


        if (
            state.balance <
            cost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;

        }


        state.balance -=
            cost;


        state.mineRate +=
            1;


        state.boostCost =
            Math.floor(
                cost * 1.5
            );


        showToast(
            "🚀 Mining Rate Increased!"
        );


        updateUI();

        saveGame();

    };


    /* =========================================
       REFERRAL
    ========================================= */

    if (copyReferralButton) {

        copyReferralButton.addEventListener(
            "click",
            async function () {

                const code =
                    referralCodeEl
                        ? referralCodeEl.textContent
                        : "BSHIB";


                try {

                    await navigator.clipboard
                        .writeText(code);


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


    if (inviteFriendsButton) {

        inviteFriendsButton.addEventListener(
            "click",
            function () {

                const url =
                    "https://t.me/shibababycoinbot";


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
       UI UPDATE
    ========================================= */

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
                );

        }


        if (energyEl) {

            energyEl.textContent =
                formatNumber(
                    state.energy
                );

        }


        if (maxEnergyEl) {

            maxEnergyEl.textContent =
                formatNumber(
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


        if (xpValueEl) {

            xpValueEl.textContent =
                formatNumber(
                    state.xp
                );

        }


        if (xpFill) {

            const requiredXP =
                getRequiredXP(
                    state.level
                );


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


            if (xpTextEl) {

                xpTextEl.textContent =
                    formatNumber(
                        state.xp
                    ) +
                    " / " +
                    formatNumber(
                        requiredXP
                    );

            }

        }


        if (tapUpgradeLevelEl) {

            tapUpgradeLevelEl.textContent =
                state.tapPower;

        }


        if (energyUpgradeValueEl) {

            energyUpgradeValueEl.textContent =
                formatNumber(
                    state.maxEnergy
                );

        }


        if (miningUpgradeValueEl) {

            miningUpgradeValueEl.textContent =
                formatNumber(
                    state.mineRate
                );

        }


        updateVIP();

    }


    /* =========================================
       COIN TAP EFFECT
    ========================================= */

    function createCoinEffect(
        text,
        x,
        y
    ) {

        if (!effects) return;


        const effect =
            document.createElement(
                "div"
            );


        effect.className =
            "coin-effect";


        effect.textContent =
            text;


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
                    ? shibaButton
                        .getBoundingClientRect()
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

            }

        }


        effects.appendChild(
            effect
        );


        setTimeout(
            function () {

                if (
                    effect.parentNode
                ) {

                    effect.remove();

                }

            },
            900
        );

    }


    /* =========================================
       TOAST
    ========================================= */

    let toastTimer =
        null;


    function showToast(message) {

        if (!toast) return;


        toast.textContent =
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


    window.showToast =
        showToast;


    /* =========================================
       AUTO MINING
    ========================================= */

    setInterval(
        function () {

            if (!gameApp) return;


            if (
                gameApp.classList.contains(
                    "hidden"
                )
            ) {

                return;

            }


            const amount =
                Math.max(
                    0,
                    Number(
                        state.mineRate
                    ) || 0
                );


            if (amount > 0) {

                state.balance +=
                    amount;


                state.totalMined +=
                    amount;


                state.xp +=
                    amount;


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
                gameApp.classList.contains(
                    "hidden"
                )
            ) {

                return;

            }


            if (
                state.energy <
                state.maxEnergy
            ) {

                state.energy +=
                    1;


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
                gameApp.classList.contains(
                    "hidden"
                )
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

    showPage(
        "miningPage"
    );


    console.log(
        "Baby Shiba Inu game initialized successfully."
    );

});
