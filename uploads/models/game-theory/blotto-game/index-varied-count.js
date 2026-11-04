const INTERVAL = 100;
const INTERVAL_WARS = 1;
let continue_flag = false;

const N_CASTLES = 2;
const HUMAN_TROOPS = parseInt(document.getElementById("troop-total").value);
let human_relinquish_flag = false;

const PLAYER_COLOR = "rgb(0, 105, 182)";
const AI_COLOR = "rgb(182, 0, 14)";
const NEUTRAL_COLOR = "rgb(211, 211, 211)";

let player_record = {
    won: 0,
    drawn: 0,
    lost: 0,
};

function ai_strategy(ai_troops, opp_troops) {
    const diff = opp_troops - ai_troops;
    if (diff > 0) {
        return ai_weak_strategy(ai_troops, diff);
    }
    if (diff == 0) {
        return ai_random_strategy(ai_troops);
    }
    return ai_strong_strategy(ai_troops, -diff);
}

function ai_strong_strategy(ai_troops, diff) {
    const opp_troops = ai_troops - diff;
    const variants = Math.ceil(opp_troops / diff);
    let width = diff - (opp_troops % diff);
    if (width == diff) {
        width = 0;
    }
    const which = Math.floor(variants * Math.random());
    const castle_1 =
        Math.floor(width * Math.random()) + (opp_troops - which * diff);
    return [castle_1, ai_troops - castle_1];
}

function ai_weak_strategy(ai_troops, diff) {
    const variants = Math.ceil(ai_troops / diff);
    let width = ai_troops % diff;
    if (width == 0) {
        width = diff;
    }
    const which = Math.floor(variants * Math.random());
    const castle_1 = Math.floor(width * Math.random()) + which * diff;
    return [castle_1, ai_troops - castle_1];
}

function ai_random_strategy(ai_troops) {
    const castle_1 = Math.floor((ai_troops + 1) * Math.random());
    return [castle_1, ai_troops - castle_1];
}

function conduct_attack(update_ui = true) {
    const ai_troops = parseInt(ai_troop_total_input.value);
    let player_assignment = Array(N_CASTLES).fill(null);
    if (!human_relinquish_flag) {
        player_assignment = player_assignment.map((v, i) =>
            parseInt(document.getElementById(`troop-${i + 1}`).value)
        );
    } else {
        player_assignment = ai_strategy(HUMAN_TROOPS, ai_troops);
        if (update_ui) {
            player_assignment.forEach((v, i) => {
                document.getElementById(`troop-${i + 1}`).value = v;
            });
        }
    }
    let battle_status = 0;
    let ai_assignment = ai_strategy(ai_troops, HUMAN_TROOPS);
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

    update_record(battle_status);

    if (update_ui) {
        update_ai(ai_assignment);
        update_message(battle_status);
    }
}

function update_record(battle_status) {
    if (battle_status > 0) {
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

function update_message(battle_status = 0) {
    let message_field = document.getElementById("message");
    let total_battles =
        player_record.won + player_record.drawn + player_record.lost;
    if (total_battles == 0) {
        message_field.innerHTML = "You haven't yet fought!";
        return;
    }
    if (battle_status > 0) {
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
        continuous_btn.disabled = false;
        continuous_btn.innerHTML = "Resume attacking";
    }
}

// events
const attack_btn = document.getElementById("attack");
attack_btn.addEventListener("click", () => {
    conduct_attack(true);
});
const reset_btn = document.getElementById("reset");
reset_btn.addEventListener("click", () => {
    player_record = {
        won: 0,
        drawn: 0,
        lost: 0,
    };
    update_message();
    continuous_btn.innerHTML = "Start attacking";
});
const continuous_btn = document.getElementById("continuous");
continuous_btn.addEventListener("click", () => {
    if (continue_flag) {
        continue_flag = false;
    } else {
        continue_flag = true;
        attack_btn.disabled = true;
        reset_btn.disabled = true;
        continuous_btn.innerHTML = "Pause attacking";
        setTimeout(run, INTERVAL);
    }
});
const ai_troop_total_input = document.getElementById("ai-troop-total");
ai_troop_total_input.addEventListener("change", () => {
    update_ai(ai_random_strategy(parseInt(ai_troop_total_input.value)));
});
const troop_1_input = document.getElementById("troop-1");
troop_1_input.addEventListener("change", () => {
    document.getElementById("troop-2").value =
        HUMAN_TROOPS - parseInt(troop_1_input.value);
});
const relinquish_checkbox = document.getElementById("relinquish-checkbox");
relinquish_checkbox.addEventListener("change", () => {
    human_relinquish_flag = relinquish_checkbox.checked;
    if (human_relinquish_flag) {
        document.getElementById("player-label").innerHTML = "CPU:";
    } else {
        document.getElementById("player-label").innerHTML = "You:";
    }
});

document.getElementById("player-label").style.color = PLAYER_COLOR;
document.getElementById("player-label").style.fontWeight = 700;
document.getElementById("ai-label").style.color = AI_COLOR;
document.getElementById("ai-label").style.fontWeight = 700;
