const INTERVAL = 100;
const INTERVAL_WARS = 1;
let continue_flag = false;

const N_CASTLES = 5;
const CASTLE_VALUES = [3, 2, 2, 1, 1];
const N_TROOPS = 25;

let cpu_strategy = 0;
// const CPU_PRIORITY_STRATEGY = 0; // default
const CPU_RANDOM_STRATEGY = 1;
const CPU_WEIGHTED_05_STRATEGY = 2;
const CPU_WEIGHTED_STRATEGY = 3;
const CPU_WEIGHTED_30_STRATEGY = 4;
const CPU_FIXED_13_STRATEGY = 5;
const CPU_FIXED_1312_STRATEGY = 6;
const CPU_FIXED_988_STRATEGY = 7;
const CPU_COPYCAT_STRATEGY = 8;
const CPU_RANDOMIZE = 9;

const CPU_PRIORITIES = [
    [0, 1],
    [0, 2],
    [0, 3, 4],
    [1, 2, 3],
    [1, 2, 4],
];
const CPU_MIN_COMMIT_MIN = 0;
const CPU_MIN_COMMIT_MAX = 3;

const ADA_COLOR = "rgb(0, 152, 32)";
const CPU_COLOR = "rgb(182, 0, 14)";
const NEUTRAL_COLOR = "rgb(211, 211, 211)";

let ada_record = {
    won: 0,
    drawn: 0,
    lost: 0,
};
let history_ada_last = Array(N_CASTLES).fill(Math.floor(N_TROOPS / N_CASTLES));

// CPU play history is necessary for ADA to work
let history_cpu_play = Array(N_CASTLES)
    .fill(null)
    .map(() => Array(N_TROOPS + 1).fill(0));
function record_play_history(assignment) {
    for (let castle_id = 0; castle_id < N_CASTLES; castle_id += 1) {
        for (
            let count_id = assignment[castle_id];
            count_id <= N_TROOPS;
            count_id += 1
        ) {
            history_cpu_play[castle_id][count_id] += 1;
        }
    }
}

function clear_play_history() {
    history_cpu_play = Array(N_CASTLES)
        .fill(null)
        .map(() => Array(N_TROOPS + 1).fill(0));
}

function ada_play(history) {
    function default_strategy() {
        const minimal_commit = Math.floor(N_TROOPS / N_CASTLES);
        let assignment = Array(N_CASTLES).fill(minimal_commit);
        let remaining_troops = N_TROOPS - N_CASTLES * minimal_commit;
        while (remaining_troops > 0) {
            let which_castle = Math.floor(Math.random() * N_CASTLES);
            assignment[which_castle] += 1;
            remaining_troops -= 1;
        }
        return assignment;
    }
    function get_castle_payoff(idx, commit, history) {
        const castle_value = CASTLE_VALUES[idx];
        const play_history = history[idx];
        const total_games = play_history[play_history.length - 1];
        let will_beat = 0;
        if (commit > 0) {
            will_beat = play_history[commit - 1] / total_games;
        }
        const will_lose = 1 - play_history[commit] / total_games;
        return castle_value * (will_beat - will_lose);
    }
    function calculate_expectation(assignment, history) {
        let total = 0;
        for (let i = 0; i < N_CASTLES; i += 1) {
            total += get_castle_payoff(i, assignment[i], history);
        }
        return total;
    }
    function adapt_strategy(idx, search_order, assignment, history) {
        const already_assigned = assignment.reduce((s, v) => s + v, 0);
        let _assignment = assignment.slice();
        let _expectation = -Infinity;
        if (idx == N_CASTLES - 1) {
            _assignment[search_order[idx]] = N_TROOPS - already_assigned;
            _expectation = calculate_expectation(_assignment, history);
        } else {
            let _best_assign = 0;
            let _best_expectation = -Infinity;
            for (
                let assign = 0;
                assign < N_TROOPS - already_assigned;
                assign += 1
            ) {
                _assignment[search_order[idx]] = assign;
                let temp = adapt_strategy(
                    idx + 1,
                    search_order,
                    _assignment,
                    history
                );
                if (temp.expectation > _best_expectation) {
                    _best_assign = temp.assignment.slice();
                    _best_expectation = temp.expectation;
                } else if (temp.expectation == _best_expectation) {
                    if (Math.random() < 0.5) {
                        _best_assign = temp.assignment.slice();
                        _best_expectation = temp.expectation;
                    }
                }
            }
            _assignment = _best_assign;
            _expectation = _best_expectation;
        }
        return { assignment: _assignment, expectation: _expectation };
    }

    const total_games = ada_record.won + ada_record.drawn + ada_record.lost;
    if (total_games == 0) {
        return default_strategy();
    }

    let search_order = commonFunctions.shuffleArray(
        Array(N_CASTLES)
            .fill(null)
            .map((v, i) => i)
    );
    return adapt_strategy(0, search_order, Array(N_CASTLES).fill(0), history)
        .assignment;
}

function cpu_play() {
    let _strat = cpu_strategy;
    if (_strat == CPU_RANDOMIZE) {
        _strat == Math.floor(CPU_RANDOMIZE * Math.random());
    }
    if (_strat == CPU_RANDOM_STRATEGY) {
        return cpu_play_random();
    }
    if (_strat == CPU_WEIGHTED_05_STRATEGY) {
        return cpu_play_weighted(0.5);
    }
    if (_strat == CPU_WEIGHTED_STRATEGY) {
        return cpu_play_weighted();
    }
    if (_strat == CPU_WEIGHTED_30_STRATEGY) {
        return cpu_play_weighted(3.0);
    }
    if (_strat == CPU_FIXED_13_STRATEGY) {
        return cpu_play_fixed13();
    }
    if (_strat == CPU_FIXED_1312_STRATEGY) {
        return cpu_play_fixed1312();
    }
    if (_strat == CPU_FIXED_988_STRATEGY) {
        return cpu_play_fixed988();
    }
    if (_strat == CPU_COPYCAT_STRATEGY) {
        return cpu_play_copycat();
    }
    return cpu_play_priority();
}

function cpu_play_random() {
    let assignment = Array(N_CASTLES).fill(0);
    for (let assigned = 0; assigned < N_TROOPS; assigned += 1) {
        let which = Math.floor(Math.random() * N_CASTLES);
        assignment[which] += 1;
    }
    return assignment;
}

function cpu_play_weighted(weight_power = 1) {
    const weight_transformer = (w) => Math.pow(w, weight_power);
    let assignment = Array(N_CASTLES).fill(0);
    const total_weight = CASTLE_VALUES.reduce(
        (s, v) => s + weight_transformer(v),
        0
    );
    for (let assigned = 0; assigned < N_TROOPS; assigned += 1) {
        let picker = Math.random() * total_weight;
        let which = 0;
        while (picker > 0 && which < N_CASTLES) {
            picker = picker - weight_transformer(CASTLE_VALUES[which]);
            which = which + 1;
        }
        assignment[which - 1] += 1;
    }
    return assignment;
}

function cpu_play_fixed13() {
    return [13, 3, 3, 3, 3];
}

function cpu_play_fixed1312() {
    if (Math.random() < 0.5) {
        return [13, 12, 0, 0, 0];
    }
    return [13, 0, 12, 0, 0];
}

function cpu_play_fixed988() {
    let assignment = [9, 0, 0, 0, 0];
    if (Math.random() < 0.5) {
        assignment[1] = 8;
    } else {
        assignment[2] = 8;
    }
    if (Math.random() < 0.5) {
        assignment[3] = 8;
    } else {
        assignment[4] = 8;
    }
    return assignment;
}

function cpu_play_copycat() {
    return history_ada_last;
}

function cpu_play_priority() {
    function cpu_pick_priorities() {
        let pick = Math.floor(Math.random() * CPU_PRIORITIES.length);
        return CPU_PRIORITIES[pick].slice();
    }
    function cpu_pick_castle(weights) {
        let normalized_weight = weights.map(
            (
                (sum) => (value) =>
                    (sum += value)
            )(0)
        );
        normalized_weight = normalized_weight.map(
            (v) => v / normalized_weight[normalized_weight.length - 1]
        );
        let r = Math.random();
        for (let idx = 0; idx < normalized_weight.length; idx += 1) {
            if (r < normalized_weight[idx]) {
                return idx;
            }
        }
    }
    let priority_castles = cpu_pick_priorities();
    let priority_weights = CASTLE_VALUES.filter((v, i) =>
        priority_castles.includes(i)
    );
    let minimal_commit =
        Math.floor(Math.random() * (CPU_MIN_COMMIT_MAX - CPU_MIN_COMMIT_MIN)) +
        CPU_MIN_COMMIT_MIN;
    let assignment = Array(N_CASTLES).fill(minimal_commit);
    let remaining_troops = N_TROOPS - N_CASTLES * minimal_commit;
    while (remaining_troops > 0) {
        let which_priority = cpu_pick_castle(priority_weights);
        assignment[priority_castles[which_priority]] += 1;
        remaining_troops -= 1;
    }
    return assignment;
}

function conduct_attack(update_ui = true) {
    let ada_assignment = ada_play(history_cpu_play);
    let cpu_assignment = cpu_play();

    history_ada_last = ada_assignment.slice();
    record_play_history(cpu_assignment);

    let battle_status = 0;
    for (let idx = 0; idx < N_CASTLES; idx += 1) {
        let castle_obj = document.getElementById(`castle-${idx + 1}`);
        if (cpu_assignment[idx] > ada_assignment[idx]) {
            if (update_ui) castle_obj.style.fill = CPU_COLOR;
            battle_status -= CASTLE_VALUES[idx];
        } else if (ada_assignment[idx] > cpu_assignment[idx]) {
            if (update_ui) castle_obj.style.fill = ADA_COLOR;
            battle_status += CASTLE_VALUES[idx];
        } else {
            if (update_ui) castle_obj.style.fill = NEUTRAL_COLOR;
        }
    }
    update_record(battle_status);

    if (update_ui) {
        update_inputs(cpu_assignment, "cpu");
        update_inputs(ada_assignment, "ada");
        update_message(battle_status);
    }
}

function update_record(battle_status) {
    if (battle_status > 0) {
        ada_record.won += 1;
    } else if (battle_status < 0) {
        ada_record.lost += 1;
    } else {
        ada_record.drawn += 1;
    }
}

function update_inputs(assignment, which = "") {
    assignment.forEach((v, i) => {
        document.getElementById(
            `${which.length > 0 ? which + "-" : ""}troop-${i + 1}`
        ).value = v;
    });
}

const MSG_RESET_RECORD = -9999;
function update_message(battle_status) {
    let message_field = document.getElementById("message");
    if (battle_status == MSG_RESET_RECORD) {
        message_field.innerHTML = "Ada's record was reset!";
    } else if (battle_status > 0) {
        message_field.innerHTML = "Ada has won the war!";
    } else if (battle_status < 0) {
        message_field.innerHTML = "Ada has lost the war!";
    } else {
        message_field.innerHTML = "Stalemate!";
    }
    message_field.innerHTML += ` Ada's overall record is ${ada_record.won}-${ada_record.drawn}-${ada_record.lost}.`;
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

function get_cpu_strategy() {
    cpu_strategy = parseInt(document.getElementById("cpu-strategy").value);
    reset();
}

function reset() {
    ada_record = {
        won: 0,
        drawn: 0,
        lost: 0,
    };
    clear_play_history();
    update_message(MSG_RESET_RECORD);
    continuous_btn.innerHTML = "Start attacking";
}

// events
let attack_btn = document.getElementById("attack");
attack_btn.addEventListener("click", () => {
    conduct_attack(true);
});
let reset_btn = document.getElementById("reset");
reset_btn.addEventListener("click", () => {
    reset();
});
let continuous_btn = document.getElementById("continuous");
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
let cpu_strategy_sel = document.getElementById("cpu-strategy");
cpu_strategy_sel.addEventListener("change", () => {
    get_cpu_strategy();
});

document.getElementById("ada-label").style.color = ADA_COLOR;
document.getElementById("ada-label").style.fontWeight = 700;
document.getElementById("cpu-label").style.color = CPU_COLOR;
document.getElementById("cpu-label").style.fontWeight = 700;

update_message(MSG_RESET_RECORD);
