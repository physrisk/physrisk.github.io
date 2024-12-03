const INTERVAL = 100;
const INTERVAL_WARS = 1;
let continue_flag = false;

const N_CASTLES = 5;
const N_TROOPS = 30;

const COST_ROUND_1 = 1;
const COST_ROUND_2 = 2;
let current_round = 1;

const AI_PRIORITIES = 3;
const AI_MIN_COMMIT_MIN = 0;
const AI_MIN_COMMIT_MAX = 3;

const PLAYER_COLOR = "rgb(0, 105, 182)";
const AI_COLOR = "rgb(182, 0, 14)";
const NEUTRAL_COLOR = "rgb(211, 211, 211)";

let player_record = {
    won: 0,
    drawn: 0,
    lost: 0,
};

function ai_strategy() {
    let priority_castles = commonFunctions
        .shuffleArray(
            Array(N_CASTLES)
                .fill(null)
                .map((v, i) => i)
        )
        .slice(0, AI_PRIORITIES)
        .sort((v1, v2) => v1 > v2);
    let minimal_commit =
        Math.floor(Math.random() * (AI_MIN_COMMIT_MAX - AI_MIN_COMMIT_MIN)) +
        AI_MIN_COMMIT_MIN;
    let assignment = Array(N_CASTLES).fill(minimal_commit);
    let remaining_troops = N_TROOPS - N_CASTLES * minimal_commit;
    while (remaining_troops > 0) {
        let which_priority = Math.floor(Math.random() * AI_PRIORITIES);
        assignment[priority_castles[which_priority]] += 1;
        remaining_troops -= 1;
    }
    return assignment;
}

function conduct_attack(update_ui = true) {
    let player_assignment = Array(N_CASTLES)
        .fill(null)
        .map((v, i) =>
            parseInt(document.getElementById(`troop-${i + 1}`).value)
        );
    let battle_status = 0;
    let wrong_assignment = false;
    let assigned_troops = player_assignment.reduce((a, v) => a + v, 0);
    let negative_troops = player_assignment.filter((v) => v < 0).length;
    if (assigned_troops != N_TROOPS || negative_troops > 0) {
        player_assignment = player_assignment.fill(0);
        wrong_assignment = true;
    }
    let ai_assignment = ai_strategy();
    for (let idx = 0; idx < N_CASTLES; idx += 1) {
        let castle_obj = document.getElementById(`castle-${idx + 1}`);
        if (ai_assignment[idx] > player_assignment[idx]) {
            if (update_ui) castle_obj.style.fill = AI_COLOR;
            battle_status -= 1;
        } else if (player_assignment[idx] > ai_assignment[idx]) {
            if (update_ui) castle_obj.style.fill = PLAYER_COLOR;
            battle_status += 1;
        } else {
            if (update_ui) castle_obj.style.fill = NEUTRAL_COLOR;
        }
    }

    update_record(battle_status, wrong_assignment);

    if (update_ui) {
        update_ai(ai_assignment);
        update_message(battle_status, wrong_assignment);
        update_inputs();
    }
}

function update_record(battle_status, wrong_assignment) {
    if (wrong_assignment) {
        player_record.lost += 1;
    } else if (battle_status > 0) {
        player_record.won += 1;
    } else if (battle_status < 0) {
        player_record.lost += 1;
    } else {
        player_record.drawn += 1;
    }
}

function update_ai(ai_assignment) {
    ai_assignment.forEach((v, i) => {
        document.getElementById(`ai-troop-${i + 1}`).value = v;
    });
}

function update_inputs() {
    let other_round = 2;
    if (current_round == 2) {
        other_round = 1;
    }

    document.querySelector(`.round-header.round-${current_round}`).style.color =
        "inherit";
    document.querySelector(
        `.round-header.round-${current_round}`
    ).style.fontWeight = 700;

    document.getElementById(`player-label-${current_round}`).style.color =
        PLAYER_COLOR;
    document.getElementById(`player-label-${current_round}`).style.fontWeight =
        700;
    document.getElementById(`ai-label-${current_round}`).style.color = AI_COLOR;
    document.getElementById(`ai-label-${current_round}`).style.fontWeight = 700;
    document
        .querySelectorAll(`.human-alloc.round-${current_round} .switch-input`)
        .forEach((elem) => {
            elem.disabled = false;
        });

    document.querySelector(`.round-header.round-${other_round}`).style.color =
        NEUTRAL_COLOR;
    document.querySelector(
        `.round-header.round-${other_round}`
    ).style.fontWeight = 400;

    document.getElementById(`player-label-${other_round}`).style.color =
        NEUTRAL_COLOR;
    document.getElementById(`player-label-${other_round}`).style.fontWeight =
        400;
    document.getElementById(`ai-label-${other_round}`).style.color =
        NEUTRAL_COLOR;
    document.getElementById(`ai-label-${other_round}`).style.fontWeight = 400;
    document
        .querySelectorAll(`.human-alloc.round-${other_round} .switch-input`)
        .forEach((elem) => {
            elem.disabled = true;
        });
}

function update_message(battle_status, wrong_assignment) {
    let message_field = document.getElementById("message");
    if (wrong_assignment) {
        message_field.innerHTML = "You have improperly assigned your troops!";
    } else if (battle_status > 0) {
        message_field.innerHTML = "You have won the war!";
    } else if (battle_status < 0) {
        message_field.innerHTML = "You have lost the war!";
    } else {
        message_field.innerHTML = "Stalemate!";
    }
    message_field.innerHTML += ` Your overall record is ${player_record.won}-${player_record.drawn}-${player_record.lost}.`;
}

function run() {
    for (let i = 1; i < INTERVAL_WARS; i += 1) {
        conduct_attack(false);
    }
    conduct_attack(true);
    if (continue_flag) {
        setTimeout(run, INTERVAL);
    } else {
        attack_btn.disabled = false;
        reset_btn.disabled = false;
    }
}

// events
let attack_btn = document.getElementById("attack");
attack_btn.addEventListener("click", () => {
    conduct_attack(true);
});
let reset_btn = document.getElementById("reset");
reset_btn.addEventListener("click", () => {
    player_record = {
        won: 0,
        drawn: 0,
        lost: 0,
    };
});

// on load
update_inputs();
