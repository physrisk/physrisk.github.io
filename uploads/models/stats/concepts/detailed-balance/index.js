const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const N_PARTICLES = 1000;
const P_REMAIN = 0.8;
let sym_degree = 0.5;

let current_state = [0, N_PARTICLES, 0];
let last_transitions = Array(current_state.length)
    .fill(null)
    .map(() => Array(current_state.length).fill(0));
let transition_matrix = [
    [P_REMAIN, 1 - P_REMAIN, 0],
    [0, P_REMAIN, 1 - P_REMAIN],
    [1 - P_REMAIN, 0, P_REMAIN],
];

const STEP_INTERVAL = 100;
let continue_flag = false;

const COLOR_POWER = 0.75;
// These min and max should usually be fine as mean state occupation is 1/3
const COLOR_STATE_MIN = 0.25;
const COLOR_STATE_MAX = 0.45;

function initialize() {
    current_state = [0, N_PARTICLES, 0];
    last_transitions = Array(current_state.length)
        .fill(null)
        .map(() => Array(current_state.length).fill(0));
    transition_matrix = [
        [
            P_REMAIN,
            (1 - P_REMAIN) * (sym_degree / 2),
            (1 - P_REMAIN) * (1 - sym_degree / 2),
        ],
        [
            (1 - P_REMAIN) * (1 - sym_degree / 2),
            P_REMAIN,
            (1 - P_REMAIN) * (sym_degree / 2),
        ],
        [
            (1 - P_REMAIN) * (sym_degree / 2),
            (1 - P_REMAIN) * (1 - sym_degree / 2),
            P_REMAIN,
        ],
    ];
}

function perform_transitions() {
    const n_states = current_state.length;
    let prev_state = current_state.slice();
    current_state = Array(n_states).fill(0);
    last_transitions = Array(current_state.length)
        .fill(null)
        .map(() => Array(current_state.length).fill(0.0));
    let switches = 0;
    for (let from_idx = 0; from_idx < n_states; from_idx += 1) {
        for (
            let agent_idx = 0;
            agent_idx < prev_state[from_idx];
            agent_idx += 1
        ) {
            let to_idx = 0;
            let pick = Math.random();
            for (; to_idx < n_states; to_idx += 1) {
                pick = pick - transition_matrix[from_idx][to_idx];
                if (pick <= 0) {
                    break;
                }
            }
            if (to_idx >= n_states) {
                to_idx = n_states - 1;
            }
            current_state[to_idx] = current_state[to_idx] + 1;
            last_transitions[from_idx][to_idx] =
                last_transitions[from_idx][to_idx] + 1;
            if (from_idx != to_idx) {
                switches = switches + 1;
            }
        }
    }
    last_transitions = last_transitions.map((row) =>
        row.map((v) => v / switches)
    );
}

function update_plot() {
    const n_states = current_state.length;
    for (let state_idx = 0; state_idx < n_states; state_idx += 1) {
        let state_circle = document.getElementById(`stateCircle${state_idx}`);
        let state_occupation = Math.min(
            Math.max(current_state[state_idx] / N_PARTICLES, COLOR_STATE_MIN),
            COLOR_STATE_MAX
        );
        let color_intensity = Array(3).fill(
            255 -
                Math.round(
                    (255 * (state_occupation - COLOR_STATE_MIN)) /
                        (COLOR_STATE_MAX - COLOR_STATE_MIN)
                )
        );
        color_intensity[state_idx] = 255;
        state_circle.style.fill = `rgb(${color_intensity[0]},${color_intensity[1]},${color_intensity[2]})`;
    }

    for (let from_idx = 0; from_idx < n_states; from_idx += 1) {
        for (let to_idx = 0; to_idx < n_states; to_idx += 1) {
            if (from_idx == to_idx) {
                continue;
            }
            let transition_arrow = document.getElementById(
                `transitionArrow${from_idx}${to_idx}`
            );
            let color_intensity = Array(3).fill(
                255 -
                    Math.round(
                        255 *
                            Math.pow(
                                last_transitions[from_idx][to_idx],
                                COLOR_POWER
                            )
                    )
            );
            color_intensity[from_idx] = 255;
            transition_arrow.style.stroke = `rgb(${color_intensity[0]},${color_intensity[1]},${color_intensity[2]})`;
        }
    }
}

function frame() {
    perform_transitions();

    update_plot();

    if (continue_flag) {
        window.setTimeout(frame, STEP_INTERVAL);
    } else {
        simulate_btn.disabled = false;
    }
}

// events
let simulate_btn = document.getElementById("simulate");
simulate_btn.addEventListener("click", () => {
    simulate_btn.disabled = true;
    stop_btn.disabled = false;
    continue_flag = true;

    sym_degree =
        1 - my_parse_float(document.getElementById("assym_degree").value);
    initialize();
    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});
