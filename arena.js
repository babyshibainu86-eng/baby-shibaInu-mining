// ==========================================
// BABY SHIBA ARENA
// TEST VERSION 1.1
// ==========================================


// ==========================================
// GAME DATA
// ==========================================

const arena = {

    player: {
        name: "Baby Shiba",
        level: 1,

        hp: 100,
        maxHp: 100,

        attack: 20,
        defense: 10,

        energy: 100,
        maxEnergy: 100
    },

    enemy: {
        name: "Forest Slime",
        level: 1,

        hp: 100,
        maxHp: 100,

        attack: 15,
        defense: 5
    },

    battleActive: false,
    dodgeActive: false
};


// ==========================================
// START BATTLE
// ==========================================

function startArenaBattle() {

    arena.player.hp = arena.player.maxHp;
    arena.player.energy = arena.player.maxEnergy;

    arena.enemy.hp = arena.enemy.maxHp;

    arena.battleActive = true;
    arena.dodgeActive = false;

    updateArenaUI();

    setBattleStatus(
        "⚔️ Battle Started!",
        "Forest Slime has appeared!"
    );

    addBattleLog("⚔️ Battle Started!");
    addBattleLog("🐕 Baby Shiba entered the Arena!");
    addBattleLog("🟢 Forest Slime appeared!");
}


// ==========================================
// PLAYER ATTACK
// ==========================================

function playerAttack() {

    if (!arena.battleActive) {

        addBattleLog(
            "⚠️ Start the battle first!"
        );

        return;
    }

    const damage = Math.max(
        1,
        arena.player.attack -
        arena.enemy.defense
    );

    arena.enemy.hp -= damage;

    addBattleLog(
        `🗡️ Baby Shiba attacks! -${damage} HP`
    );

    updateArenaUI();

    if (arena.enemy.hp <= 0) {

        winBattle();

        return;
    }

    enemyTurn();
}


// ==========================================
// ABILITY
// FLAME DASH
// ==========================================

function playerAbility() {

    if (!arena.battleActive) {

        addBattleLog(
            "⚠️ Start the battle first!"
        );

        return;
    }

    if (arena.player.energy < 20) {

        addBattleLog(
            "⚡ Not enough Energy!"
        );

        return;
    }

    arena.player.energy -= 20;

    const damage = Math.max(
        1,
        arena.player.attack + 15 -
        arena.enemy.defense
    );

    arena.enemy.hp -= damage;

    setBattleStatus(
        "🔥 FLAME DASH!",
        "Baby Shiba rushes forward!"
    );

    addBattleLog(
        `🔥 Flame Dash! -${damage} HP`
    );

    updateArenaUI();

    if (arena.enemy.hp <= 0) {

        winBattle();

        return;
    }

    enemyTurn();
}


// ==========================================
// ULTIMATE
// SHIBA NOVA
// ==========================================

function playerUltimate() {

    if (!arena.battleActive) {

        addBattleLog(
            "⚠️ Start the battle first!"
        );

        return;
    }

    if (arena.player.energy < 50) {

        addBattleLog(
            "⚡ Not enough Energy!"
        );

        return;
    }

    arena.player.energy -= 50;

    const damage = Math.max(
        1,
        arena.player.attack + 40 -
        arena.enemy.defense
    );

    arena.enemy.hp -= damage;

    setBattleStatus(
        "☄️ SHIBA NOVA!",
        "Baby Shiba unleashes a powerful attack!"
    );

    addBattleLog(
        `☄️ Shiba Nova! -${damage} HP`
    );

    updateArenaUI();

    if (arena.enemy.hp <= 0) {

        winBattle();

        return;
    }

    enemyTurn();
}


// ==========================================
// DODGE
// ==========================================

function playerDodge() {

    if (!arena.battleActive) {

        addBattleLog(
            "⚠️ Start the battle first!"
        );

        return;
    }

    arena.dodgeActive = true;

    setBattleStatus(
        "🛡️ DODGE READY!",
        "Baby Shiba prepares to evade!"
    );

    addBattleLog(
        "🛡️ Baby Shiba is ready to dodge!"
    );

    setTimeout(() => {

        if (arena.battleActive) {

            enemyAttack();

        }

    }, 500);
}


// ==========================================
// ENEMY TURN
// ==========================================

function enemyTurn() {

    setTimeout(() => {

        enemyAttack();

    }, 500);
}


// ==========================================
// ENEMY ATTACK
// ==========================================

function enemyAttack() {

    if (!arena.battleActive) {
        return;
    }

    if (arena.dodgeActive) {

        arena.dodgeActive = false;

        addBattleLog(
            "💨 Baby Shiba dodged the attack!"
        );

        return;
    }

    const damage = Math.max(
        1,
        arena.enemy.attack -
        arena.player.defense
    );

    arena.player.hp -= damage;

    addBattleLog(
        `🟢 Forest Slime attacks! -${damage} HP`
    );

    updateArenaUI();

    if (arena.player.hp <= 0) {

        loseBattle();

    }
}


// ==========================================
// WIN
// ==========================================

function winBattle() {

    arena.battleActive = false;

    setBattleStatus(
        "🏆 VICTORY!",
        "Baby Shiba defeated Forest Slime!"
    );

    addBattleLog("🏆 VICTORY!");
    addBattleLog("🦴 +10 Bone");
    addBattleLog("🪙 +25 Coin");
    addBattleLog("✨ +20 XP");

    updateArenaUI();
}


// ==========================================
// LOSE
// ==========================================

function loseBattle() {

    arena.battleActive = false;

    setBattleStatus(
        "💀 DEFEAT!",
        "Baby Shiba was defeated."
    );

    addBattleLog("💀 DEFEAT!");
    addBattleLog("Try again!");

    updateArenaUI();
}


// ==========================================
// RESET
// ==========================================

function resetArena() {

    arena.player.hp =
        arena.player.maxHp;

    arena.player.energy =
        arena.player.maxEnergy;

    arena.enemy.hp =
        arena.enemy.maxHp;

    arena.battleActive = false;
    arena.dodgeActive = false;

    setBattleStatus(
        "Ready for Battle",
        "Enter the Baby Shiba Arena"
    );

    addBattleLog(
        "🔄 Arena reset."
    );

    updateArenaUI();
}


// ==========================================
// UPDATE UI
// ==========================================

function updateArenaUI() {

    const playerHP =
        document.getElementById("player-hp");

    const enemyHP =
        document.getElementById("enemy-hp");

    const playerHPBar =
        document.getElementById("player-hp-bar");

    const enemyHPBar =
        document.getElementById("enemy-hp-bar");


    if (playerHP) {

        playerHP.textContent =
            `${Math.max(
                0,
                arena.player.hp
            )} / ${arena.player.maxHp}`;
    }


    if (enemyHP) {

        enemyHP.textContent =
            `${Math.max(
                0,
                arena.enemy.hp
            )} / ${arena.enemy.maxHp}`;
    }


    if (playerHPBar) {

        const percent =
            (
                arena.player.hp /
                arena.player.maxHp
            ) * 100;

        playerHPBar.style.width =
            `${Math.max(
                0,
                percent
            )}%`;
    }


    if (enemyHPBar) {

        const percent =
            (
                arena.enemy.hp /
                arena.enemy.maxHp
            ) * 100;

        enemyHPBar.style.width =
            `${Math.max(
                0,
                percent
            )}%`;
    }
}


// ==========================================
// BATTLE STATUS
// ==========================================

function setBattleStatus(
    title,
    subtitle
) {

    const status =
        document.getElementById(
            "battle-status"
        );

    const message =
        document.getElementById(
            "battle-subtitle"
        );

    if (status) {
        status.textContent = title;
    }

    if (message) {
        message.textContent = subtitle;
    }
}


// ==========================================
// BATTLE LOG
// ==========================================

function addBattleLog(message) {

    const log =
        document.getElementById(
            "battle-log"
        );

    if (!log) {
        return;
    }

    const line =
        document.createElement(
            "div"
        );

    line.textContent =
        message;

    log.appendChild(line);

    log.scrollTop =
        log.scrollHeight;
}


// ==========================================
// INITIALIZE ARENA
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateArenaUI();

        addBattleLog(
            "🐕 Baby Shiba Arena loaded."
        );

    }
);
