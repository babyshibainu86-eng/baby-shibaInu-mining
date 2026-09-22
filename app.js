/* =========================================================
   BABY SHIBA INU - BSHIB MINING GAME
   Version: Phase 0 Stable
   No Supabase
   Telegram WebApp + LocalStorage + Telegram CloudStorage
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       TELEGRAM
    ===================================================== */

    const tg = window.Telegram && window.Telegram.WebApp
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

    const telegramUser =
        tg && tg.initDataUnsafe && tg.initDataUnsafe.user
            ? tg.initDataUnsafe.user
            : null;

    const playerId = telegramUser
        ? String(telegramUser.id)
        : "guest";

    const playerName = telegramUser
        ? (
            telegramUser.first_name ||
            telegramUser.username ||
            "Player"
        )
        : "Player";


    /* =====================================================
       STORAGE
    ===================================================== */

    const LOCAL_KEY = "babyShibaGame_" + playerId;
    const CLOUD_KEY = "babyShibaGame";

    let cloudAvailable = false;


    /* =====================================================
       DEFAULT GAME STATE
    ===================================================== */

    const DEFAULT_STATE = {
        balance: 0,
        totalMined: 0,

        level: 1,
        xp: 0,

        tapPower: 1,
        mineRate: 1,

        energy: 1000,
        maxEnergy: 1000,

        tapLevel: 1,
        energyLevel: 1,
        boostLevel: 1,

        miningStarted: false,

        lastUpdate: Date.now(),

        vipLevel: 0,

        lastVipReward: 0,

        referralCode: "",

        energyPackCost: 250,
        miningBoostCost: 500,

        tapCost: 100,
        energyCost: 250,
        boostCost: 500
    };


    let state = JSON.parse(JSON.stringify(DEFAULT_STATE));


    /* =====================================================
       HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function formatNumber(value) {
        value = Number(value) || 0;

        if (value >= 1000000000) {
            return (value / 1000000000).toFixed(2) + "B";
        }

        if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + "M";
        }

        if (value >= 1000) {
            return (value / 1000).toFixed(2) + "K";
        }

        return Math.floor(value).toLocaleString();
    }


    function saveLocal() {
        try {
            localStorage.setItem(
                LOCAL_KEY,
                JSON.stringify(state)
            );
        } catch (e) {
            console.log("Local save error:", e);
        }
    }


    /* =====================================================
       TELEGRAM CLOUD STORAGE
    ===================================================== */

    function cloudSave() {

        if (
            !tg ||
            !tg.CloudStorage ||
            typeof tg.CloudStorage.setItem !== "function"
        ) {
            return;
        }

        try {

            tg.CloudStorage.setItem(
                CLOUD_KEY,
                JSON.stringify(state),
                function (error) {

                    if (error) {
                        console.log(
                            "Telegram CloudStorage save:",
                            error
                        );
                        return;
                    }

                    cloudAvailable = true;

                }
            );

        } catch (e) {
            console.log("Cloud save error:", e);
        }
    }


    function saveGame() {
        saveLocal();
        cloudSave();
    }


    /* =====================================================
       CLOUD LOAD
    ===================================================== */

    function loadCloud(callback) {

        if (
            !tg ||
            !tg.CloudStorage ||
            typeof tg.CloudStorage.getItem !== "function"
        ) {
            callback(null);
            return;
        }

        try {

            tg.CloudStorage.getItem(
                CLOUD_KEY,
                function (error, value) {

                    if (error) {
                        console.log(
                            "Cloud load error:",
                            error
                        );

                        callback(null);
                        return;
                    }

                    if (!value) {
                        callback(null);
                        return;
                    }

                    try {

                        const parsed =
                            JSON.parse(value);

                        callback(parsed);

                    } catch (e) {

                        console.log(
                            "Cloud JSON error:",
                            e
                        );

                        callback(null);
                    }
                }
            );

        } catch (e) {
            console.log(
                "CloudStorage unavailable:",
                e
            );

            callback(null);
        }
    }


    /* =====================================================
       STATE MERGE / RECOVERY
    ===================================================== */

    function normalizeState(data) {

        if (!data || typeof data !== "object") {
            return null;
        }

        const result =
            JSON.parse(
                JSON.stringify(DEFAULT_STATE)
            );

        Object.keys(result).forEach(function (key) {

            if (
                Object.prototype.hasOwnProperty.call(
                    data,
                    key
                )
            ) {
                result[key] = data[key];
            }

        });

        return result;
    }


    function stateScore(data) {

        if (!data) return -1;

        return (
            Number(data.balance || 0) +
            Number(data.totalMined || 0) +
            Number(data.level || 1) * 1000 +
            Number(data.xp || 0) +
            Number(data.tapPower || 1) * 100 +
            Number(data.mineRate || 1) * 100
        );
    }


    function loadLocal() {

        try {

            const raw =
                localStorage.getItem(LOCAL_KEY);

            if (!raw) {
                return null;
            }

            const parsed =
                JSON.parse(raw);

            return normalizeState(parsed);

        } catch (e) {

            console.log(
                "Local load error:",
                e
            );

            return null;
        }
    }


    function recoverGame() {

        const localState = loadLocal();

        loadCloud(function (cloudState) {

            const normalizedCloud =
                normalizeState(cloudState);

            let selected = null;

            if (
                localState &&
                normalizedCloud
            ) {

                if (
                    stateScore(localState) >=
                    stateScore(normalizedCloud)
                ) {
                    selected = localState;
                } else {
                    selected = normalizedCloud;
                }

            } else if (localState) {

                selected = localState;

            } else if (normalizedCloud) {

                selected = normalizedCloud;

            } else {

                selected =
                    JSON.parse(
                        JSON.stringify(
                            DEFAULT_STATE
                        )
                    );
            }

            state = normalizeState(selected);

            if (!state.referralCode) {
                state.referralCode =
                    "BSHIB-" +
                    playerId.slice(-6);
            }

            state.lastUpdate = Date.now();

            saveLocal();

            updateOfflineMining();

            renderAll();

        });
    }


    /* =====================================================
       OFFLINE MINING
    ===================================================== */

    function updateOfflineMining() {

        if (!state.miningStarted) {
            return;
        }

        const now = Date.now();

        const previous =
            Number(state.lastUpdate || now);

        let seconds =
            (now - previous) / 1000;

        if (seconds < 0) {
            seconds = 0;
        }

        /*
           Offline mining cap:
           Maximum 8 hours
        */

        seconds =
            Math.min(seconds, 8 * 60 * 60);

        const earned =
            seconds *
            Number(state.mineRate || 1);

        if (earned > 0) {

            state.balance += earned;

            state.totalMined += earned;

            addXP(
                Math.floor(earned / 10)
            );
        }

        state.lastUpdate = now;

        saveLocal();
    }


    /* =====================================================
       XP / LEVEL
    ===================================================== */

    function xpRequired() {

        return 100 * state.level;
    }


    function addXP(amount) {

        amount =
            Number(amount) || 0;

        if (amount <= 0) {
            return;
        }

        state.xp += amount;

        while (
            state.xp >= xpRequired()
        ) {

            state.xp -= xpRequired();

            state.level++;

            showToast(
                "🎉 Level Up! LVL " +
                state.level
            );
        }
    }


    function levelName() {

        const names = [
            "Shiba Rookie",
            "Shiba Miner",
            "Shiba Hunter",
            "Shiba Warrior",
            "Shiba Master",
            "Shiba Legend",
            "Shiba Elite",
            "Shiba King"
        ];

        return (
            names[
                Math.min(
                    state.level - 1,
                    names.length - 1
                )
            ]
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderAll() {

        /* PLAYER */

        if ($("playerName")) {
            $("playerName").textContent =
                playerName;
        }

        if ($("playerId")) {
            $("playerId").textContent =
                "ID: " + playerId;
        }


        /* BALANCE */

        if ($("balance")) {
            $("balance").textContent =
                formatNumber(state.balance);
        }


        /* LEVEL */

        if ($("level")) {
            $("level").textContent =
                state.level;
        }

        if ($("levelName")) {
            $("levelName").textContent =
                levelName();
        }


        /* XP */

        if ($("xpFill")) {

            const required =
                xpRequired();

            const percent =
                Math.min(
                    100,
                    (state.xp / required) * 100
                );

            $("xpFill").style.width =
                percent + "%";
        }


        /* TAP POWER */

        if ($("tapPower")) {
            $("tapPower").textContent =
                formatNumber(
                    state.tapPower
                );
        }


        /* MINING RATE */

        if ($("mineRate")) {

            $("mineRate").textContent =
                formatNumber(
                    state.mineRate
                ) +
                " BSHIB/s";
        }


        if ($("statsMineRate")) {

            $("statsMineRate").textContent =
                formatNumber(
                    state.mineRate
                );
        }


        /* TOTAL MINED */

        if ($("totalMined")) {

            $("totalMined").textContent =
                formatNumber(
                    state.totalMined
                );
        }


        /* ENERGY */

        state.energy =
            Math.max(
                0,
                Math.min(
                    state.energy,
                    state.maxEnergy
                )
            );

        if ($("energy")) {

            $("energy").textContent =
                Math.floor(
                    state.energy
                );
        }

        if ($("maxEnergy")) {

            $("maxEnergy").textContent =
                Math.floor(
                    state.maxEnergy
                );
        }


        if ($("energyFill")) {

            const percent =
                (
                    state.energy /
                    state.maxEnergy
                ) * 100;

            $("energyFill").style.width =
                percent + "%";
        }


        /* STATUS */

        if ($("miningStatus")) {

            $("miningStatus").textContent =
                state.miningStarted
                    ? "Mining"
                    : "Ready";
        }


        /* UPGRADE COSTS */

        if ($("tapCost")) {
            $("tapCost").textContent =
                formatNumber(
                    state.tapCost
                );
        }

        if ($("energyCost")) {
            $("energyCost").textContent =
                formatNumber(
                    state.energyCost
                );
        }

        if ($("boostCost")) {
            $("boostCost").textContent =
                formatNumber(
                    state.boostCost
                );
        }


        /* SHOP */

        if ($("energyPackCost")) {

            $("energyPackCost").textContent =
                formatNumber(
                    state.energyPackCost
                );
        }

        if ($("miningBoostCost")) {

            $("miningBoostCost").textContent =
                formatNumber(
                    state.miningBoostCost
                );
        }


        /* VIP */

        renderVIP();


        /* REFERRAL */

        if ($("refCode")) {

            $("refCode").textContent =
                state.referralCode;
        }
    }


    /* =====================================================
       START GAME
    ===================================================== */

    function startGame() {

        state.miningStarted = true;

        state.lastUpdate =
            Date.now();

        saveGame();

        showPage("miningPage");

        renderAll();

        showToast(
            "🐕 Baby Shiba Mining Started!"
        );
    }


    /* =====================================================
       TAP MINING
    ===================================================== */

    function mineTap() {

        if (!state.miningStarted) {

            startGame();

            return;
        }


        if (state.energy < 1) {

            showToast(
                "⚡ Not enough energy"
            );

            return;
        }


        const amount =
            Number(state.tapPower || 1);


        state.energy -= 1;

        state.balance += amount;

        state.totalMined += amount;

        addXP(1);

        state.lastUpdate =
            Date.now();

        saveGame();

        renderAll();

        createCoinEffect(
            "+" + formatNumber(amount)
        );
    }


    /* =====================================================
       AUTO MINING
    ===================================================== */

    let lastMiningTick =
        Date.now();

    function autoMiningTick() {

        if (!state.miningStarted) {
            lastMiningTick =
                Date.now();

            return;
        }

        const now =
            Date.now();

        let seconds =
            (now - lastMiningTick) / 1000;

        if (seconds <= 0) {
            return;
        }

        /*
           Prevent huge jumps
        */

        seconds =
            Math.min(seconds, 5);

        const earned =
            state.mineRate *
            seconds;

        if (earned > 0) {

            state.balance += earned;

            state.totalMined += earned;

            addXP(
                Math.floor(earned / 10)
            );
        }

        lastMiningTick =
            now;

        state.lastUpdate =
            now;

        renderAll();
    }


    /* =====================================================
       ENERGY REGEN
    ===================================================== */

    let lastEnergyTick =
        Date.now();

    function energyTick() {

        if (!state.miningStarted) {
            lastEnergyTick =
                Date.now();

            return;
        }

        const now =
            Date.now();

        const seconds =
            (now - lastEnergyTick) / 1000;

        if (seconds < 1) {
            return;
        }

        /*
           1 energy / second
        */

        if (
            state.energy <
            state.maxEnergy
        ) {

            state.energy =
                Math.min(
                    state.maxEnergy,
                    state.energy +
                    Math.floor(seconds)
                );

            renderAll();
        }

        lastEnergyTick =
            now;
    }


    /* =====================================================
       UPGRADES
    ===================================================== */

    window.upgradeTap = function () {

        if (
            state.balance <
            state.tapCost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }

        state.balance -=
            state.tapCost;

        state.tapPower += 1;

        state.tapLevel += 1;

        state.tapCost =
            Math.floor(
                state.tapCost * 1.6
            );

        saveGame();

        renderAll();

        showToast(
            "⚡ Tap Power upgraded!"
        );
    };


    window.upgradeEnergy = function () {

        if (
            state.balance <
            state.energyCost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }

        state.balance -=
            state.energyCost;

        state.maxEnergy += 100;

        state.energy =
            Math.min(
                state.maxEnergy,
                state.energy + 100
            );

        state.energyLevel += 1;

        state.energyCost =
            Math.floor(
                state.energyCost * 1.7
            );

        saveGame();

        renderAll();

        showToast(
            "🔋 Maximum Energy upgraded!"
        );
    };


    window.upgradeBoost = function () {

        if (
            state.balance <
            state.boostCost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }

        state.balance -=
            state.boostCost;

        state.mineRate += 1;

        state.boostLevel += 1;

        state.boostCost =
            Math.floor(
                state.boostCost * 1.8
            );

        saveGame();

        renderAll();

        showToast(
            "🚀 Mining Rate upgraded!"
        );
    };


    /* =====================================================
       SHOP
    ===================================================== */

    function buyEnergyPack() {

        if (
            state.balance <
            state.energyPackCost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }

        state.balance -=
            state.energyPackCost;

        state.energy =
            Math.min(
                state.maxEnergy,
                state.energy + 500
            );

        saveGame();

        renderAll();

        showToast(
            "⚡ +500 Energy"
        );
    }


    function buyMiningBoost() {

        if (
            state.balance <
            state.miningBoostCost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }

        state.balance -=
            state.miningBoostCost;

        state.mineRate += 2;

        saveGame();

        renderAll();

        showToast(
            "🚀 Mining Boost activated!"
        );
    }


    /* =====================================================
       VIP
    ===================================================== */

    const VIP_DATA = {

        0: {
            name: "Free Member",
            mining: 0,
            energy: 0,
            reward: 0
        },

        1: {
            name: "Starter",
            mining: 10,
            energy: 100,
            reward: 500,
            cost: 10000
        },

        2: {
            name: "Hunter",
            mining: 25,
            energy: 250,
            reward: 1000,
            cost: 50000
        },

        3: {
            name: "Warrior",
            mining: 50,
            energy: 500,
            reward: 2500,
            cost: 150000
        },

        4: {
            name: "Elite",
            mining: 75,
            energy: 750,
            reward: 5000,
            cost: 400000
        },

        5: {
            name: "Shiba Legend",
            mining: 100,
            energy: 1000,
            reward: 10000,
            cost: 1000000
        }
    };


    function renderVIP() {

        const vip =
            VIP_DATA[
                state.vipLevel
            ] ||
            VIP_DATA[0];


        if ($("vipCurrentName")) {

            $("vipCurrentName").textContent =
                vip.name;
        }


        if ($("vipLevel")) {

            $("vipLevel").textContent =
                "VIP " +
                state.vipLevel;
        }


        if ($("vipMiningBonus")) {

            $("vipMiningBonus").textContent =
                "+" +
                vip.mining +
                "%";
        }


        if ($("vipEnergyBonus")) {

            $("vipEnergyBonus").textContent =
                "+" +
                vip.energy;
        }


        if ($("vipDailyReward")) {

            $("vipDailyReward").textContent =
                vip.reward
                    ? formatNumber(vip.reward) +
                      " BSHIB"
                    : "Locked";
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

                if (
                    level ===
                    state.vipLevel
                ) {

                    card.classList.add(
                        "current-vip"
                    );

                } else {

                    card.classList.remove(
                        "current-vip"
                    );
                }
            });
    }


    function buyVIP(level) {

        level =
            Number(level);

        const vip =
            VIP_DATA[level];

        if (!vip) {
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


        if (
            state.balance <
            vip.cost
        ) {

            showToast(
                "❌ Not enough BSHIB"
            );

            return;
        }


        state.balance -=
            vip.cost;

        state.vipLevel =
            level;


        /*
           Apply VIP energy bonus
        */

        const oldVip =
            VIP_DATA[
                Math.max(
                    0,
                    level - 1
                )
            ];


        const energyIncrease =
            vip.energy -
            oldVip.energy;


        state.maxEnergy +=
            energyIncrease;

        state.energy =
            Math.min(
                state.maxEnergy,
                state.energy +
                energyIncrease
            );


        /*
           Mining bonus
        */

        const baseRate =
            Math.max(
                1,
                state.mineRate
            );

        const bonusDifference =
            (
                vip.mining -
                oldVip.mining
            ) / 100;

        state.mineRate =
            baseRate *
            (
                1 +
                bonusDifference
            );


        saveGame();

        renderAll();

        showToast(
            "👑 VIP " +
            level +
            " Activated!"
        );
    }


    function claimVIPReward() {

        const vip =
            VIP_DATA[
                state.vipLevel
            ];


        if (
            !vip ||
            !vip.reward
        ) {

            showToast(
                "🔒 VIP reward is locked"
            );

            return;
        }


        const now =
            Date.now();

        const oneDay =
            24 * 60 * 60 * 1000;


        if (
            now -
            state.lastVipReward <
            oneDay
        ) {

            showToast(
                "⏳ Come back tomorrow"
            );

            return;
        }


        state.balance +=
            vip.reward;

        state.lastVipReward =
            now;

        saveGame();

        renderAll();

        showToast(
            "🎁 +" +
            formatNumber(vip.reward) +
            " BSHIB"
        );
    }


    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    window.showPage = function (pageId) {

        const pages =
            document.querySelectorAll(
                ".game-page"
            );


        pages.forEach(function (page) {

            page.classList.remove(
                "active"
            );
        });


        const target =
            $(pageId);

        if (target) {

            target.classList.add(
                "active"
            );
        }


        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(function (button) {

                button.classList.remove(
                    "active"
                );
            });


        const navButtons =
            document.querySelectorAll(
                ".nav-item"
            );


        navButtons.forEach(function (button) {

            const onclick =
                button.getAttribute(
                    "onclick"
                ) || "";


            if (
                onclick.includes(
                    "'" + pageId + "'"
                )
            ) {

                button.classList.add(
                    "active"
                );
            }
        });


        window.scrollTo(
            0,
            0
        );
    };


    /* =====================================================
       REFERRAL
    ===================================================== */

    function createReferralLink() {

        const botUsername =
            "shibababycoinbot";

        return (
            "https://t.me/" +
            botUsername +
            "?start=" +
            encodeURIComponent(
                state.referralCode
            )
        );
    }


    function copyReferral() {

        const link =
            createReferralLink();


        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            navigator.clipboard
                .writeText(link)
                .then(function () {

                    showToast(
                        "📋 Referral link copied!"
                    );

                })
                .catch(function () {

                    showToast(
                        link
                    );
                });

        } else {

            showToast(
                link
            );
        }
    }


    function inviteFriends() {

        const link =
            createReferralLink();


        const text =
            "🐕 Join Baby Shiba Inu!\n\n" +
            "Mine BSHIB, upgrade your Shiba and prepare for the Arena!\n\n" +
            link;


        if (tg) {

            try {

                tg.openTelegramLink(
                    "https://t.me/share/url?url=" +
                    encodeURIComponent(link) +
                    "&text=" +
                    encodeURIComponent(
                        text
                    )
                );

                return;

            } catch (e) {}
        }


        window.open(
            "https://t.me/share/url?url=" +
            encodeURIComponent(link) +
            "&text=" +
            encodeURIComponent(text),
            "_blank"
        );
    }


    /* =====================================================
       SOUND
    ===================================================== */

    let soundEnabled = true;


    function playTapSound() {

        if (!soundEnabled) {
            return;
        }

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            const ctx =
                new AudioContext();

            const oscillator =
                ctx.createOscillator();

            const gain =
                ctx.createGain();

            oscillator.frequency.value =
                520;

            oscillator.type =
                "sine";

            gain.gain.value =
                0.04;

            oscillator.connect(
                gain
            );

            gain.connect(
                ctx.destination
            );

            oscillator.start();

            oscillator.stop(
                ctx.currentTime +
                0.06
            );

        } catch (e) {}
    }


    function toggleSound() {

        soundEnabled =
            !soundEnabled;


        if ($("soundBtn")) {

            $("soundBtn").textContent =
                soundEnabled
                    ? "🔊"
                    : "🔇";
        }

        showToast(
            soundEnabled
                ? "🔊 Sound On"
                : "🔇 Sound Off"
        );
    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer = null;


    function showToast(message) {

        const toast =
            $("toast");

        const toastText =
            $("toastText");


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


        clearTimeout(
            toastTimer
        );


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
       COIN EFFECT
    ===================================================== */

    function createCoinEffect(text) {

        const effects =
            $("effects");


        if (!effects) {
            return;
        }


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "coin-effect";


        element.textContent =
            text;


        element.style.position =
            "absolute";

        element.style.left =
            "50%";

        element.style.top =
            "45%";

        element.style.pointerEvents =
            "none";


        effects.appendChild(
            element
        );


        setTimeout(
            function () {

                element.remove();

            },
            900
        );
    }


    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    function setupEvents() {


        /* START */

        const start =
            $("startGame");

        if (start) {

            start.addEventListener(
                "click",
                function () {

                    startGame();
                }
            );
        }


        /* SHIBA TAP */

        const shiba =
            $("shibaButton");

        if (shiba) {

            shiba.addEventListener(
                "click",
                function () {

                    playTapSound();

                    mineTap();
                }
            );
        }


        /* SOUND */

        const sound =
            $("soundBtn");

        if (sound) {

            sound.addEventListener(
                "click",
                toggleSound
            );
        }


        /* SHOP */

        const energyPack =
            $("buyEnergyPack");

        if (energyPack) {

            energyPack.addEventListener(
                "click",
                buyEnergyPack
            );
        }


        const miningBoost =
            $("buyMiningBoost");

        if (miningBoost) {

            miningBoost.addEventListener(
                "click",
                buyMiningBoost
            );
        }


        /* VIP BUY BUTTONS */

        document
            .querySelectorAll(
                ".vip-buy-btn[data-vip-level]"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        buyVIP(
                            button.dataset.vipLevel
                        );
                    }
                );
            });


        /* VIP REWARD */

        const vipReward =
            $("claimVipReward");

        if (vipReward) {

            vipReward.disabled =
                false;

            vipReward.addEventListener(
                "click",
                claimVIPReward
            );
        }


        /* REFERRAL */

        const copyRef =
            $("copyRef");

        if (copyRef) {

            copyRef.addEventListener(
                "click",
                copyReferral
            );
        }


        const invite =
            $("inviteBtn");

        if (invite) {

            invite.addEventListener(
                "click",
                inviteFriends
            );
        }
    }


    /* =====================================================
       GLOBAL ACCESS
    ===================================================== */

    window.BabyShiba = {

        getState: function () {
            return state;
        },

        save: function () {
            saveGame();
        },

        mine: mineTap,

        start: startGame,

        recover: recoverGame
    };


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        console.log(
            "🐕 Baby Shiba Inu starting..."
        );

        console.log(
            "Player:",
            playerName,
            playerId
        );


        setupEvents();


        /*
           Keep Intro visible initially.
           gameApp remains hidden until START.
        */

        if ($("introPage")) {
            $("introPage").classList.add(
                "active"
            );
        }


        if ($("gameApp")) {
            $("gameApp").classList.add(
                "hidden"
            );
        }


        /*
           Recover saved data.
        */

        recoverGame();


        /*
           Game loops
        */

        setInterval(
            autoMiningTick,
            1000
        );

        setInterval(
            energyTick,
            1000
        );


        /*
           Save periodically
        */

        setInterval(
            function () {

                if (
                    state.miningStarted
                ) {

                    state.lastUpdate =
                        Date.now();

                    saveGame();
                }

            },
            10000
        );
    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();
