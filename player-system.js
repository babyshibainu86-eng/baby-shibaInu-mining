/* =========================================================
   BABY SHIBA INU
   PLAYER SYSTEM - V1
   Standalone Module
   ========================================================= */

const BabyShibaPlayer = (() => {

    const DEFAULT_PLAYER = {
        telegramId: null,
        username: "",
        firstName: "",

        balance: 0,
        totalMined: 0,

        level: 1,
        xp: 0,

        tapPower: 1,
        miningRate: 1,

        energy: 100,
        maxEnergy: 100,

        vipLevel: 0,

        items: {},
        upgrades: {},

        missions: {},
        referrals: [],

        createdAt: null,
        lastLogin: null
    };

    function createPlayer(telegramUser = null) {

        const now = Date.now();

        return {
            ...DEFAULT_PLAYER,

            telegramId: telegramUser?.id || null,
            username: telegramUser?.username || "",
            firstName: telegramUser?.first_name || "",

            createdAt: now,
            lastLogin: now
        };
    }

    function normalizePlayer(player) {

        return {
            ...DEFAULT_PLAYER,
            ...player,

            items: {
                ...(DEFAULT_PLAYER.items || {}),
                ...(player?.items || {})
            },

            upgrades: {
                ...(DEFAULT_PLAYER.upgrades || {}),
                ...(player?.upgrades || {})
            },

            missions: {
                ...(DEFAULT_PLAYER.missions || {}),
                ...(player?.missions || {})
            },

            referrals: Array.isArray(player?.referrals)
                ? player.referrals
                : []
        };
    }

    function addBalance(player, amount) {

        amount = Number(amount) || 0;

        if (amount <= 0) return player;

        player.balance += amount;
        player.totalMined += amount;

        return player;
    }

    function addXP(player, amount) {

        amount = Number(amount) || 0;

        if (amount <= 0) return player;

        player.xp += amount;

        while (player.xp >= getXPRequired(player.level)) {

            player.xp -= getXPRequired(player.level);
            player.level++;

            player.tapPower += 1;
            player.maxEnergy += 25;
            player.energy = player.maxEnergy;
        }

        return player;
    }

    function getXPRequired(level) {

        level = Number(level) || 1;

        return 100 + ((level - 1) * 50);
    }

    function consumeEnergy(player, amount) {

        amount = Number(amount) || 0;

        if (amount <= 0) return true;

        if (player.energy < amount) {
            return false;
        }

        player.energy -= amount;

        return true;
    }

    function restoreEnergy(player, amount) {

        amount = Number(amount) || 0;

        if (amount <= 0) return player;

        player.energy = Math.min(
            player.maxEnergy,
            player.energy + amount
        );

        return player;
    }

    function setMiningRate(player, rate) {

        rate = Number(rate) || 1;

        player.miningRate = Math.max(1, rate);

        return player;
    }

    function setTapPower(player, power) {

        power = Number(power) || 1;

        player.tapPower = Math.max(1, power);

        return player;
    }

    function addItem(player, itemId, amount = 1) {

        if (!itemId) return player;

        amount = Number(amount) || 0;

        if (amount <= 0) return player;

        if (!player.items[itemId]) {
            player.items[itemId] = 0;
        }

        player.items[itemId] += amount;

        return player;
    }

    function removeItem(player, itemId, amount = 1) {

        if (!itemId) return false;

        amount = Number(amount) || 0;

        if (!player.items[itemId]) {
            return false;
        }

        if (player.items[itemId] < amount) {
            return false;
        }

        player.items[itemId] -= amount;

        return true;
    }

    function getItem(player, itemId) {

        return Number(player.items[itemId] || 0);
    }

    function setUpgrade(player, upgradeId, level) {

        if (!upgradeId) return player;

        level = Number(level) || 0;

        player.upgrades[upgradeId] = Math.max(0, level);

        return player;
    }

    function getUpgrade(player, upgradeId) {

        return Number(player.upgrades[upgradeId] || 0);
    }

    function setVIP(player, level) {

        level = Number(level) || 0;

        player.vipLevel = Math.max(0, level);

        return player;
    }

    function login(player) {

        player.lastLogin = Date.now();

        return player;
    }

    return {

        createPlayer,
        normalizePlayer,

        addBalance,
        addXP,

        getXPRequired,

        consumeEnergy,
        restoreEnergy,

        setMiningRate,
        setTapPower,

        addItem,
        removeItem,
        getItem,

        setUpgrade,
        getUpgrade,

        setVIP,

        login
    };

})();

/* Make module available globally */
window.BabyShibaPlayer = BabyShibaPlayer;
