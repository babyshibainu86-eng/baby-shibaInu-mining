// ==========================================
// BABY SHIBA ARENA - TEST VERSION 1.0
// ==========================================

const arena = {
    player: {
        name: "Baby Shiba",
        level: 1,
        hp: 100,
        maxHp: 100,
        attack: 20,
        defense: 10,
        energy: 100
    },

    enemy: {
        name: "Forest Slime",
        level: 1,
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 5
    },

    battleActive: false
};


// ==========================================
// START BATTLE
// ==========================================

function startArenaBattle() {

    arena.player.hp = arena.player.maxHp;
    arena.enemy.hp = arena.enemy.maxHp;
    arena.battleActive = true;

    updateArenaUI();

    addBattleLog("⚔️ Battle Started!");
    addBattleLog("🐕 Baby Shiba entered the Arena!");
    addBattleLog("🟢 Forest Slime appeared!");
}


// ==========================================
// BASIC ATTACK
// ==========================================

function playerAttack() {

    if (!arena.battleActive) {
        addBattleLog("⚠️ Start the battle first!");
        return;
    }

    const damage = Math.max(
        1,
        arena.player.attack - arena.enemy.defense
    );

    arena.enemy.hp -= damage;

    addBattleLog(
        `🐕 Baby Shiba attacks! -${damage} HP`
    );

    updateArenaUI();

    if (arena.enemy.hp <= 0) {
        winBattle();
        return;
    }

    enemyAttack();
}


// ==========================================
// ENEMY ATTACK
// ==========================================

function enemyAttack() {

    const damage = Math.max(
        1,
        arena.enemy.attack - arena.player.defense
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

    addBattleLog("💀 DEFEAT!");
    addBattleLog("Try again!");
}


// ==========================================
// RESET
// ==========================================

function resetArena() {

    arena.player.hp = arena.player.maxHp;
    arena.enemy.hp = arena.enemy.maxHp;
    arena.battleActive = false;

    updateArenaUI();

    addBattleLog("🔄 Arena reset.");
}


// ==========================================
// UPDATE UI
// ==========================================

function updateArenaUI() {

    const playerHP = document.getElementById("player-hp");
    const enemyHP = document.getElementById("enemy-hp");

    if (playerHP) {
        playerHP.textContent =
            `${Math.max(0, arena.player.hp)} / ${arena.player.maxHp}`;
    }

    if (enemyHP) {
        enemyHP.textContent =
            `${Math.max(0, arena.enemy.hp)} / ${arena.enemy.maxHp}`;
    }
}


// ==========================================
// BATTLE LOG
// ==========================================

function addBattleLog(message) {

    const log = document.getElementById("battle-log");

    if (!log) return;

    const line = document.createElement("div");

    line.textContent = message;

    log.appendChild(line);

    log.scrollTop = log.scrollHeight;
          }
