document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* ========================================
       TELEGRAM
    ======================================== */

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
            console.log("Telegram:", e);
        }
    }


    /* ========================================
       STORAGE
    ======================================== */

    const STORAGE_KEY = "babyShibaMiningGame";


    /* ========================================
       GAME STATE
    ======================================== */

    let game = {
        balance: 0,
        totalMined: 0,

        level: 1,
        xp: 0,

        tapPower: 1,
        mineRate: 1,

        energy: 1000,
        maxEnergy: 1000,

        vipLevel: 0,

        lastDailyReward: 0
    };


    /* ========================================
       LOAD GAME
    ======================================== */

    function loadGame() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return;
            }

            const data =
                JSON.parse(saved);

            if (!data || typeof data !== "object") {
                return;
            }

            game.balance =
                Number(data.balance) || 0;

            game.totalMined =
                Number(data.totalMined) || 0;

            game.level =
                Number(data.level) || 1;

            game.xp =
                Number(data.xp) || 0;

            game.tapPower =
                Number(data.tapPower) || 1;

            game.mineRate =
                Number(data.mineRate) || 1;

            game.energy =
                Number(data.energy);

            if (isNaN(game.energy)) {
                game.energy = 1000;
            }

            game.maxEnergy =
                Number(data.maxEnergy);

            if (isNaN(game.maxEnergy)) {
                game.maxEnergy = 1000;
            }

            game.vipLevel =
                Number(data.vipLevel) || 0;

            game.lastDailyReward =
                Number(data.lastDailyReward) || 0;

        } catch (error) {

            console.log("Load error:", error);

        }

    }


    /* ========================================
       SAVE GAME
    ======================================== */

    function saveGame() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(game)
            );

        } catch (error) {

            console.log("Save error:", error);

        }

    }


    loadGame();


    /* ========================================
       DOM
    ======================================== */

    const introPage =
        document.getElementById("introPage");

    const gameApp =
        document.getElementById("gameApp");

    const startGame =
        document.getElementById("startGame");


    const playerName =
        document.getElementById("playerName");

    const playerId =
        document.getElementById("playerId");


    const balance =
        document.getElementById("balance");

    const totalMined =
        document.getElementById("totalMined");

    const levelValue =
        document.getElementById("levelValue");

    const xpValue =
        document.getElementById("xpValue");

    const xpText =
        document.getElementById("xpText");

    const xpFill =
        document.getElementById("xpFill");


    const mineRate =
        document.getElementById("mineRate");

    const tapPower =
        document.getElementById("tapPower");


    const energy =
        document.getElementById("energy");

    const maxEnergy =
        document.getElementById("maxEnergy");

    const energyFill =
        document.getElementById("energyFill");


    const vipLevel =
        document.getElementById("vipLevel");

    const currentVipLevel =
        document.getElementById("currentVipLevel");

    const vipMiningBonus =
        document.getElementById("vipMiningBonus");

    const vipEnergyBonus =
        document.getElementById("vipEnergyBonus");


    const shibaButton =
        document.getElementById("shibaButton");


    const toast =
        document.getElementById("toast");

    const effects =
        document.getElementById("effects");


    /* ========================================
       NUMBER
    ======================================== */

    function number(value) {

        return Math.floor(
            Number(value) || 0
        ).toLocaleString("en-US");

    }


    /* ========================================
       TOAST
    ======================================== */

    let toastTimeout = null;

    function showToast(message) {

        if (!toast) {
            return;
        }

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout =
            setTimeout(function () {

                toast.classList.remove("show");

            }, 1800);

    }


    /* ========================================
       TELEGRAM USER
    ======================================== */

    function loadTelegramUser() {

        if (
            tg &&
            tg.initDataUnsafe &&
            tg.initDataUnsafe.user
        ) {

            const user =
                tg.initDataUnsafe.user;

            let name =
                user.first_name || "";

            if (user.last_name) {
                name +=
                    " " + user.last_name;
            }

            name =
                name.trim() ||
                user.username ||
                "Player";


            if (playerName) {
                playerName.textContent =
                    name;
            }


            if (playerId) {
                playerId.textContent =
                    user.id || "---";
            }

        }

    }


    loadTelegramUser();


    /* ========================================
       XP / LEVEL
    ======================================== */

    function xpNeeded() {

        return game.level * 100;

    }


    function addXP(amount) {

        game.xp += amount;


        while (
            game.xp >= xpNeeded()
        ) {

            game.xp -= xpNeeded();

            game.level += 1;

            showToast(
                "🎉 Level " +
                game.level
            );

        }

    }


    /* ========================================
       VIP DATA
    ======================================== */

    const VIP = {

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


    function getVIP() {

        return (
            VIP[game.vipLevel] ||
            VIP[0]
        );

    }


    /* ========================================
       UPDATE VIP
    ======================================== */

    function updateVIP() {

        const vip =
            getVIP();


        if (vipLevel) {
            vipLevel.textContent =
                game.vipLevel;
        }


        if (currentVipLevel) {
            currentVipLevel.textContent =
                "VIP " +
                game.vipLevel;
        }


        if (vipMiningBonus) {
            vipMiningBonus.textContent =
                "+" +
                vip.mining +
                "%";
        }


        if (vipEnergyBonus) {
            vipEnergyBonus.textContent =
                "+" +
                vip.energy;
        }

    }


    /* ========================================
       UPDATE UI
    ======================================== */

    function updateUI() {

        if (balance) {
            balance.textContent =
                number(game.balance);
        }


        if (totalMined) {
            totalMined.textContent =
                number(game.totalMined);
        }


        if (levelValue) {
            levelValue.textContent =
                game.level;
        }


        if (xpValue) {
            xpValue.textContent =
                number(game.xp);
        }


        if (tapPower) {
            tapPower.textContent =
                number(game.tapPower);
        }


        if (mineRate) {
            mineRate.textContent =
                number(game.mineRate);
        }


        if (energy) {
            energy.textContent =
                Math.floor(game.energy);
        }


        if (maxEnergy) {
            maxEnergy.textContent =
                Math.floor(game.maxEnergy);
        }


        /* ENERGY BAR */

        if (energyFill) {

            let percent =
                (
                    game.energy /
                    game.maxEnergy
                ) * 100;


            if (!isFinite(percent)) {
                percent = 0;
            }


            percent =
                Math.max(
                    0,
                    Math.min(100, percent)
                );


            energyFill.style.width =
                percent + "%";

        }


        /* XP BAR */

        const required =
            xpNeeded();


        if (xpText) {

            xpText.textContent =
                number(game.xp) +
                " / " +
                number(required);

        }


        if (xpFill) {

            let percent =
                (
                    game.xp /
                    required
                ) * 100;


            percent =
                Math.max(
                    0,
                    Math.min(100, percent)
                );


            xpFill.style.width =
                percent + "%";

        }


        updateVIP();

    }


    /* ========================================
       PAGE SYSTEM
    ======================================== */

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


        const page =
            document.getElementById(pageId);


        if (page) {

            page.classList.add(
                "active"
            );

        }


        const nav =
            document.querySelectorAll(
                ".nav-item"
            );


        nav.forEach(function (item) {

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


        window.scrollTo(0, 0);

    }


    /* ========================================
       NAVIGATION
    ======================================== */

    document
        .querySelectorAll(".nav-item")
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    const page =
                        item.dataset.page;

                    if (page) {
                        showPage(page);
                    }

                }
            );

        });


    /* ========================================
       START GAME
    ======================================== */

    if (startGame) {

        startGame.addEventListener(
            "click",
            function () {

                if (introPage) {

                    introPage.classList.add(
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


                updateUI();

            }
        );

    }


    /* ========================================
       TAP MINING
    ======================================== */

    if (shibaButton) {

        shibaButton.addEventListener(
            "click",
            function () {

                if (game.energy < 1) {

                    showToast(
                        "⚡ Not enough energy"
                    );

                    return;

                }


                const vip =
                    getVIP();


                const bonus =
                    1 +
                    (
                        vip.mining /
                        100
                    );


                const earned =
                    game.tapPower *
                    bonus;


                game.balance +=
                    earned;


                game.totalMined +=
                    earned;


                game.energy -= 1;


                addXP(1);


                createEffect(
                    earned
                );


                updateUI();

            }
        );

    }


    /* ========================================
       EFFECT
    ======================================== */

    function createEffect(amount) {

        if (!effects) {
            return;
        }


        const item =
            document.createElement("div");


        item.className =
            "coin-effect";


        item.textContent =
            "+" +
            number(amount);


        effects.appendChild(item);


        setTimeout(
            function () {

                item.remove();

            },
            900
        );

    }


    /* ========================================
       SHOP - ENERGY
    ======================================== */

    const energyPack =
        document.getElementById(
            "energyPackButton"
        );


    if (energyPack) {

        energyPack.addEventListener(
            "click",
            function () {

                const price = 250;


                if (
                    game.balance <
                    price
                ) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                game.balance -=
                    price;


                game.energy =
                    Math.min(
                        game.maxEnergy,
                        game.energy + 250
                    );


                showToast(
                    "⚡ +250 Energy"
                );


                updateUI();

                saveGame();

            }
        );

    }


    /* ========================================
       SHOP - MINING BOOST
    ======================================== */

    const miningBoost =
        document.getElementById(
            "miningBoostButton"
        );


    if (miningBoost) {

        miningBoost.addEventListener(
            "click",
            function () {

                const price = 500;


                if (
                    game.balance <
                    price
                ) {

                    showToast(
                        "❌ Not enough BSHIB"
                    );

                    return;

                }


                game.balance -=
                    price;


                game.tapPower += 1;


                showToast(
                    "🚀 Tap Power +1"
                );


                updateUI();

                saveGame();

            }
        );

    }


    /* ========================================
       VIP PURCHASE
    ======================================== */

    const vipPrices = {

        1: 10000,
        2: 50000,
        3: 150000,
        4: 400000,
        5: 1000000

    };


    document
        .querySelectorAll(".vip-buy-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const selected =
                        Number(
                            button.dataset.vip
                        );


                    if (
                        selected <=
                        game.vipLevel
                    ) {

                        showToast(
                            "👑 Already activated"
                        );

                        return;

                    }


                    const price =
                        vipPrices[selected];


                    if (
                        game.balance <
                        price
                    ) {

                        showToast(
                            "❌ Not enough BSHIB"
                        );

                        return;

                    }


                    game.balance -=
                        price;


                    game.vipLevel =
                        selected;


                    const vip =
                        getVIP();


                    game.maxEnergy =
                        1000 +
                        vip.energy;


                    game.energy =
                        Math.min(
                            game.maxEnergy,
                            game.energy +
                            vip.energy
                        );


                    showToast(
                        "👑 VIP " +
                        selected +
                        " Activated"
                    );


                    updateUI();

                    saveGame();

                }
            );

        });


    /* ========================================
       DAILY VIP REWARD
    ======================================== */

    const vipReward =
        document.getElementById(
            "vipRewardButton"
        );


    if (vipReward) {

        vipReward.addEventListener(
            "click",
            function () {

                const now =
                    Date.now();


                const day =
                    24 *
                    60 *
                    60 *
                    1000;


                if (
                    game.lastDailyReward &&
                    (
                        now -
                        game.lastDailyReward
                    ) < day
                ) {

                    showToast(
                        "🎁 Already claimed today"
                    );

                    return;

                }


                const reward =
                    100 *
                    (
                        game.vipLevel + 1
                    );


                game.balance +=
                    reward;


                game.lastDailyReward =
                    now;


                showToast(
                    "🎁 +" +
                    number(reward) +
                    " BSHIB"
                );


                updateUI();

                saveGame();

            }
        );

    }


    /* ========================================
       COPY REFERRAL
    ======================================== */

    const copyReferral =
        document.getElementById(
            "copyReferral"
        );


    const referralCode =
        document.getElementById(
            "referralCode"
        );


    if (copyReferral) {

        copyReferral.addEventListener(
            "click",
            function () {

                const code =
                    referralCode
                        ? referralCode.textContent
                        : "BSHIB";


                if (
                    navigator.clipboard
                ) {

                    navigator.clipboard
                        .writeText(code)
                        .then(function () {

                            showToast(
                                "📋 Copied"
                            );

                        })
                        .catch(function () {

                            showToast(
                                "📋 BSHIB"
                            );

                        });

                } else {

                    showToast(
                        "📋 BSHIB"
                    );

                }

            }
        );

    }


    /* ========================================
       INVITE FRIENDS
    ======================================== */

    const inviteFriends =
        document.getElementById(
            "inviteFriends"
        );


    if (inviteFriends) {

        inviteFriends.addEventListener(
            "click",
            function () {

                const bot =
                    "https://t.me/shibababycoinbot";


                const text =
                    "Join Baby Shiba Inu 🐕";


                const share =
                    "https://t.me/share/url" +
                    "?url=" +
                    encodeURIComponent(bot) +
                    "&text=" +
                    encodeURIComponent(text);


                if (tg) {

                    try {

                        tg.openTelegramLink(
                            share
                        );

                        return;

                    } catch (e) {

                        console.log(e);

                    }

                }


                window.open(
                    share,
                    "_blank"
                );

            }
        );

    }


    /* ========================================
       AUTOMATIC MINING
    ======================================== */

    setInterval(
        function () {

            if (game.energy <= 0) {
                return;
            }


            const vip =
                getVIP();


            const bonus =
                1 +
                (
                    vip.mining /
                    100
                );


            const earned =
                game.mineRate *
                bonus;


            game.balance +=
                earned;


            game.totalMined +=
                earned;


            game.energy =
                Math.max(
                    0,
                    game.energy - 1
                );


            addXP(1);


            updateUI();

        },
        1000
    );


    /* ========================================
       ENERGY RECHARGE
    ======================================== */

    setInterval(
        function () {

            if (
                game.energy <
                game.maxEnergy
            ) {

                game.energy =
                    Math.min(
                        game.maxEnergy,
                        game.energy + 1
                    );


                updateUI();

            }

        },
        3000
    );


    /* ========================================
       AUTO SAVE
    ======================================== */

    setInterval(
        function () {

            saveGame();

        },
        5000
    );


    /* ========================================
       FIRST UI UPDATE
    ======================================== */

    updateUI();

});
