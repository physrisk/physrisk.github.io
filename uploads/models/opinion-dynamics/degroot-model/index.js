const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let current_state = [Math.random(), Math.random(), Math.random()];
let interaction_matrix = Array(3)
    .fill(null)
    .map(() => Array(3).fill(0));

const STEP_INTERVAL = 100;
let continue_flag = false;

function initialize() {
    current_state = [Math.random(), Math.random(), Math.random()];

    for (let i = 0; i < interaction_matrix.length; i += 1) {
        let total = 0;
        for (let j = 0; j < interaction_matrix[i].length; j += 1) {
            interaction_matrix[i][j] = my_parse_float(
                document.getElementById(`interaction${i}${j}`).value
            );
            if (isNaN(interaction_matrix[i][j])) {
                interaction_matrix[i][j] = 0;
            }
            total = total + interaction_matrix[i][j];
        }
        if (total > 0) {
            interaction_matrix[i] = interaction_matrix[i].map((v) => v / total);
        } else {
            interaction_matrix[i][i] = 1;
        }
        for (let j = 0; j < interaction_matrix[i].length; j += 1) {
            document.getElementById(`interaction${i}${j}`).value =
                interaction_matrix[i][j];
        }
    }
}

function simulate_step() {
    let old_state = current_state.slice();
    for (let i = 0; i < current_state.length; i += 1) {
        current_state[i] = 0;
        for (let j = 0; j < current_state.length; j += 1) {
            current_state[i] += interaction_matrix[i][j] * old_state[j];
        }
    }
}

function update_plot() {
    const n_states = current_state.length;
    for (let state_idx = 0; state_idx < n_states; state_idx += 1) {
        let state_circle = document.getElementById(`stateCircle${state_idx}`);
        let color_intensity = 255 - Math.round(255 * current_state[state_idx]);
        state_circle.style.fill = `hsl(${color_intensity},100%,30%)`;
    }

    for (let from_idx = 0; from_idx < n_states; from_idx += 1) {
        for (let to_idx = 0; to_idx < n_states; to_idx += 1) {
            if (from_idx == to_idx) {
                let state_circle = document.getElementById(
                    `stateCircle${from_idx}`
                );
                let color_intensity =
                    255 -
                    Math.round(255 * interaction_matrix[from_idx][to_idx]);
                state_circle.style.stroke = `rgb(${color_intensity},${color_intensity},${color_intensity})`;
            } else {
                let transition_arrow = document.getElementById(
                    `transitionArrow${from_idx}${to_idx}`
                );
                let color_intensity =
                    255 -
                    Math.round(255 * interaction_matrix[from_idx][to_idx]);
                transition_arrow.style.stroke = `rgb(${color_intensity},${color_intensity},${color_intensity})`;
            }
        }
    }
}

function frame() {
    simulate_step();

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

    initialize();
    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});

window.onload = () => {
    initialize();
    update_plot();
};
