document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    // ==========================================
    // TELEGRAM
    // ==========================================

    const tg = window.Telegram && window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;

    if (tg) {
        try {
            tg.ready();
            tg.expand();
        } catch (error) {
            console.log("Telegram WebApp init:", error);
        }
    }


    // ==========================================
    // STORAGE
    // ==========================================

    const STORAGE_KEY = "babyShibaGameState";


    // ==========================================
    // GAME STATE
    // ==========================================

    let state = {
        balance: 0,
        totalMined: 0,
        level: 1,
        xp: 0,

        tapPower: 1,
        mineRate: 1,

        energy: 1000,
        maxEnergy: 1000,

        vipLevel: 0,

        lastVipReward: 0,

        upgrades: {
            tap: 1,
            energy: 1,
            mining: 1
        }
    };


    // ==========================================
    // LOAD SAVED DATA
    // ==========================================

    function loadState() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return;
            }

            const parsed = JSON.parse(saved);

            if (!parsed || typeof parsed !== "object") {
                return;
            }

            state = {
                ...state,
                ...parsed,

                upgrades: {
                    ...state.upgrades,
                    ...(parsed.upgrades || {})
                }
            };

        } catch (error) {

            console.log("Load state error:", error);

        }

    }


    // ==========================================
    // SAVE DATA
    // ==========================================

    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.log("Save state error:", error);

        }

    }


    loadState();


    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const introPage = document.getElementById("introPage");
    const gameApp = document.getElementById("gameApp");
    const startGame = document.getElementById("startGame");

    const playerName = document.getElementById("playerName");
    const playerId = document.getElementById("playerId");

    const balance = document.getElementById("balance");
    const totalMined = document.getElementById("totalMined");

    const levelValue = document.getElementById("levelValue");
    const xpValue = document.getElementById("xpValue");
    const xpText = document.getElementById("xpText");
    const xpFill = document.getElementById("xpFill");

    const mineRate = document.getElementById("mineRate");
    const tapPower = document.getElementById("tapPower");

    const energy = document.getElementById("energy");
    const maxEnergy = document.getElementById("maxEnergy");
    const energyFill = document.getElementById("energyFill");

    const vipLevel = document.getElementById("vipLevel");
    const currentVipLevel = document.getElementById("currentVipLevel");
    const vipMiningBonus = document.getElementById("vipMiningBonus");
    const vipEnergyBonus = document.getElementById("vipEnergyBonus");

    const shibaButton = document.getElementById("shibaButton");

    const toast = document.getElementById("toast");
    const effects = document.getElementById("effects");


    // ==========================================
    // TELEGRAM USER
    // ==========================================

    function setupTelegramUser() {

        if (
            tg &&
            tg.initDataUnsafe &&
            tg.initDataUnsafe.user
        ) {

            const user = tg.initDataUnsafe.user;

            if (playerName) {

                const firstName = user.first_name || "";
                const lastName = user.last_name || "";

                const fullName =
                    `${firstName} ${lastName}`.trim();

                playerName.textContent =
                    fullName || user.username || "Player";
            }

            if (playerId) {
                playerId.textContent =
                    user.id || "---";
            }

        } else {

            if (playerName) {
                playerName.textContent = "Player";
            }

            if (playerId) {
                playerId.textContent = "---";
            }

        }

    }


    setupTelegramUser();


    // ==========================================
    // NUMBER FORMAT
    // ==========================================

    function formatNumber(value) {

        const number = Number(value) || 0;

        return Math.floor(number).toLocaleString("en-US");

    }


    // ==========================================
    // TOAST
    // ==========================================

    let toastTimer = null;

    function showToast(message) {

        if (!toast) {
            return;
        }

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            toast.classList.remove("show");

        }, 1800);

    }


    // ==========================================
    // XP
    // ==========================================

    function xpRequired() {

        return state.level * 100;

    }


    function addXP(amount) {

        state.xp += amount;

        while (state.xp >= xpRequired()) {

            state.xp -= xpRequired();

            state.level += 1;

            showToast(
                `🎉 Level ${state.level}!`
            );

        }

    }


    // ==========================================
    // VIP
    // ==========================================

    const VIP_DATA = {

        0: {
            mining: 0,
            energy: 0
        },

        1: {
            mining: 5,
            energy: 100
        },

        2: {
            mining: 10,
            energy: 200
        },

        3: {
            mining: 15,
            energy: 300
        },

        4: {
            mining: 25,
            energy: 500
        },

        5: {
            mining: 50,
            energy: 1000
        }

    };


    function getVipData() {

        return VIP_DATA[state.vipLevel] ||
            VIP_DATA[0];

    }


    // ==========================================
    // UPDATE VIP UI
    // ==========================================

    function updateVipUI() {

        const data = getVipData();

        if (vipLevel) {
            vipLevel.textContent = state.vipLevel;
        }

        if (currentVipLevel) {

            currentVipLevel.textContent =
                `VIP ${state.vipLevel}`;

        }

        if (vipMiningBonus) {

            vipMiningBonus.textContent =
                `+${data.mining}%`;

        }

        if (vipEnergyBonus) {

            vipEnergyBonus.textContent =
                `+${data.energy}`;

        }

    }


    // ==========================================
    // UPDATE GAME UI
    // ==========================================

    function updateUI() {

        if (balance) {
            balance.textContent =
                formatNumber(state.balance);
        }

        if (totalMined) {
            totalMined.textContent =
                formatNumber(state.totalMined);
        }

        if (levelValue) {
            levelValue.textContent =
                state.level;
        }

        if (xpValue) {
            xpValue.textContent =
                formatNumber(state.xp);
        }

        if (tapPower) {
            tapPower.textContent =
                formatNumber(state.tapPower);
        }

        if (mineRate) {
            mineRate.textContent =
                formatNumber(state.mineRate);
        }

        if (energy) {
            energy.textContent =
                Math.floor(state.energy);
        }

        if (maxEnergy) {
            maxEnergy.textContent =
                Math.floor(state.maxEnergy);
        }


        // ENERGY BAR

        if (energyFill) {

            const percent =
                state.maxEnergy > 0
                    ? (state.energy / state.maxEnergy) * 100
                    : 0;

            energyFill.style.width =
                `${Math.max(0, Math.min(100, percent))}%`;

        }


        // XP BAR

        const required = xpRequired();

        if (xpText) {

            xpText.textContent =
                `${formatNumber(state.xp)} / ${formatNumber(required)}`;

        }

        if (xpFill) {

            const percent =
                required > 0
                    ? (state.xp / required) * 100
                    : 0;

            xpFill.style.width =
                `${Math.max(0, Math.min(100, percent))}%`;

        }


        updateVipUI();

    }


    // ==========================================
    // PAGE NAVIGATION
    // ==========================================

    function showPage(pageId) {

        const pages =
            document.querySelectorAll(".game-page");

        pages.forEach(page => {

            page.classList.remove("active");

        });


        const selectedPage =
            document.getElementById(pageId);

        if (selectedPage) {

            selectedPage.classList.add("active");

        }


        const navItems =
            document.querySelectorAll(".nav-item");

        navItems.forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset &&
                item.dataset.page === pageId
            ) {

                item.classList.add("active");

            }

        });


        window.scrollTo(0, 0);

    }


    // ==========================================
    // BOTTOM NAVIGATION
    // ==========================================

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


    // ==========================================
    // START GAME
    // ==========================================

    if (startGame) {

        startGame.addEventListener("click", () => {

            if (introPage) {
                introPage.classList.remove("active");
                introPage.classList.add("hidden");
            }

            if (gameApp) {
                gameApp.classList.remove("hidden");
            }

            showPage("miningPage");

            updateUI();

        });

    }


    // ==========================================
    // TAP MINING
    // ==========================================

    function mineByTap() {

        if (state.energy < 1) {

            showToast("⚡ Not enough energy");

            return;

        }


        const vipBonus =
            getVipData().mining / 100;

        const amount =
            state.tapPower *
            (1 + vipBonus);


        state.balance += amount;

        state.totalMined += amount;

        state.energy -= 1;

        addXP(1);

        createCoinEffect(amount);

        updateUI();

    }


    if (shibaButton) {

        shibaButton.addEventListener(
            "click",
            mineByTap
        );

    }


    // ==========================================
    // COIN EFFECT
    // ==========================================

    function createCoinEffect(amount) {

        if (!effects) {
            return;
        }

        const element =
            document.createElement("div");

        element.className = "coin-effect";

        element.textContent =
            `+${formatNumber(amount)}`;

        effects.appendChild(element);


        setTimeout(() => {

            element.remove();

        }, 900);

    }


    // ==========================================
    // ENERGY PACK
    // ==========================================

    const energyPackButton =
        document.getElementById("energyPackButton");


    if (energyPackButton) {

        energyPackButton.addEventListener(
            "click",
            () => {

                const price = 250;

                if (state.balance < price) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;
                }


                state.balance -= price;

                state.energy =
                    Math.min(
                        state.maxEnergy,
                        state.energy + 250
                    );


                showToast(
                    "⚡ +250 Energy"
                );

                updateUI();

                saveState();

            }
        );

    }


    // ==========================================
    // MINING BOOST
    // ==========================================

    const miningBoostButton =
        document.getElementById(
            "miningBoostButton"
        );


    if (miningBoostButton) {

        miningBoostButton.addEventListener(
            "click",
            () => {

                const price = 500;

                if (state.balance < price) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;
                }


                state.balance -= price;

                state.tapPower += 1;

                showToast(
                    "🚀 Tap Power increased"
                );

                updateUI();

                saveState();

            }
        );

    }


    // ==========================================
    // VIP ACTIVATION
    // ==========================================

    const vipButtons =
        document.querySelectorAll(
            ".vip-buy-btn"
        );


    vipButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const selectedVip =
                    Number(
                        button.dataset.vip
                    );


                if (!selectedVip) {
                    return;
                }


                const prices = {

                    1: 10000,
                    2: 50000,
                    3: 150000,
                    4: 400000,
                    5: 1000000

                };


                const price =
                    prices[selectedVip];


                if (selectedVip <= state.vipLevel) {

                    showToast(
                        "👑 VIP already activated"
                    );

                    return;

                }


                if (state.balance < price) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                state.balance -= price;

                state.vipLevel =
                    selectedVip;


                const vipData =
                    getVipData();


                state.maxEnergy =
                    1000 + vipData.energy;


                state.energy =
                    Math.min(
                        state.maxEnergy,
                        state.energy + vipData.energy
                    );


                showToast(
                    `👑 VIP ${selectedVip} activated`
                );


                updateUI();

                saveState();

            }
        );

    });


    // ==========================================
    // VIP DAILY REWARD
    // ==========================================

    const vipRewardButton =
        document.getElementById(
            "vipRewardButton"
        );


    if (vipRewardButton) {

        vipRewardButton.addEventListener(
            "click",
            () => {

                const now =
                    Date.now();

                const oneDay =
                    24 * 60 * 60 * 1000;


                if (
                    state.lastVipReward &&
                    now - state.lastVipReward < oneDay
                ) {

                    showToast(
                        "🎁 Reward already claimed"
                    );

                    return;

                }


                const reward =
                    100 * (state.vipLevel + 1);


                state.balance += reward;

                state.lastVipReward =
                    now;


                showToast(
                    `🎁 +${formatNumber(reward)} BSHIB`
                );


                updateUI();

                saveState();

            }
        );

    }


    // ==========================================
    // REFERRAL
    // ==========================================

    const referralCode =
        document.getElementById(
            "referralCode"
        );


    const copyReferral =
        document.getElementById(
            "copyReferral"
        );


    if (copyReferral) {

        copyReferral.addEventListener(
            "click",
            async () => {

                const code =
                    referralCode
                        ? referralCode.textContent
                        : "BSHIB";


                try {

                    await navigator.clipboard.writeText(
                        code
                    );

                    showToast(
                        "📋 Referral copied"
                    );

                } catch (error) {

                    showToast(
                        "📋 BSHIB"
                    );

                }

            }
        );

    }


    // ==========================================
    // INVITE FRIENDS
    // ==========================================

    const inviteFriends =
        document.getElementById(
            "inviteFriends"
        );


    if (inviteFriends) {

        inviteFriends.addEventListener(
            "click",
            () => {

                const text =
                    "Join Baby Shiba Inu 🐕";

                const url =
                    "https://t.me/shibababycoinbot";


                if (tg) {

                    try {

                        tg.openTelegramLink(
                            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
                        );

                        return;

                    } catch (error) {

                        console.log(error);

                    }

                }


                window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
                    "_blank"
                );

            }
        );

    }


    // ==========================================
    // UPGRADE TAP POWER
    // ==========================================

    const upgradeTapButton =
        document.getElementById(
            "upgradeTapButton"
        );


    if (upgradeTapButton) {

        upgradeTapButton.addEventListener(
            "click",
            () => {

                const level =
                    state.upgrades.tap;

                const price =
                    level * 100;


                if (state.balance < price) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                state.balance -= price;

                state.upgrades.tap += 1;

                state.tapPower += 1;


                showToast(
                    "🚀 Tap Power upgraded"
                );


                updateUI();

                saveState();

            }
        );

    }


    // ==========================================
    // UPGRADE ENERGY
    // ==========================================

    const upgradeEnergyButton =
        document.getElementById(
            "upgradeEnergyButton"
        );


    if (upgradeEnergyButton) {

        upgradeEnergyButton.addEventListener(
            "click",
            () => {

                const level =
                    state.upgrades.energy;

                const price =
                    level * 150;


                if (state.balance < price) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                state.balance -= price;

                state.upgrades.energy += 1;

                state.maxEnergy += 100;

                state.energy =
                    Math.min(
                        state.maxEnergy,
                        state.energy + 100
                    );


                showToast(
                    "⚡ Max Energy upgraded"
                );


                updateUI();

                saveState();

            }
        );

    }


    // ==========================================
    // UPGRADE MINING RATE
    // ==========================================

    const upgradeMiningButton =
        document.getElementById(
            "upgradeMiningButton"
        );


    if (upgradeMiningButton) {

        upgradeMiningButton.addEventListener(
            "click",
            () => {

                const level =
                    state.upgrades.mining;

                const price =
                    level * 300;


                if (state.balance < price) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                state.balance -= price;

                state.upgrades.mining += 1;

                state.mineRate += 1;


                showToast(
                    "⛏️ Mining Rate upgraded"
                );


                updateUI();

                saveState();

            }
        );

    }


    // ==========================================
    // AUTOMATIC MINING
    // ==========================================

    setInterval(() => {

        if (state.energy <= 0) {
            return;
        }


        const vipBonus =
            getVipData().mining / 100;


        const amount =
            state.mineRate *
            (1 + vipBonus);


        state.balance += amount;

        state.totalMined += amount;

        state.energy =
            Math.max(
                0,
                state.energy - 1
            );


        addXP(1);

        updateUI();

    }, 1000);


    // ==========================================
    // ENERGY RECHARGE
    // ==========================================

    setInterval(() => {

        if (
            state.energy <
            state.maxEnergy
        ) {

            state.energy =
                Math.min(
                    state.maxEnergy,
                    state.energy + 1
                );

            updateUI();

        }

    }, 3000);


    // ==========================================
    // AUTO SAVE
    // ==========================================

    setInterval(() => {

        saveState();

    }, 5000);


    // ==========================================
    // INITIAL UI
    // ==========================================

    updateUI();

});
