const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let hist_plot = new plotlyPlot("histPlot", ["o", "p(o)"], [10, 15, 40, 50]);
const COLORS = ["#666", "#f43"];

const N_AGENTS = 300;
const N_BINS = 50;
const MIN_STD = 1e-3;

let current_state = Array(N_AGENTS)
    .fill(null)
    .map(() => rng.normal(0, 0.5));
let interaction_matrix = Array(N_AGENTS)
    .fill(null)
    .map((v, i) => {
        let trust = Array(N_AGENTS)
            .fill(null)
            .map((vv, j) => {
                if (i == j) {
                    return 5;
                }
                if (rng.random() < 0.8) {
                    return rng.random();
                }
                return 0;
            });
        let total = trust.reduce((a, v) => a + v, 0);
        return trust.map((v) => v / total);
    });
let initial_histogram = jStat.histogram(current_state, N_BINS);
let initial_min = Math.min(...current_state);
let initial_max = Math.max(...current_state);
let initial_bin_locs = Array(N_BINS)
    .fill(null)
    .map(
        (v, i) =>
            initial_min + ((i + 0.5) * (initial_max - initial_min)) / N_BINS
    );

const STEP_INTERVAL = 300;
let continue_flag = false;

function initialize() {
    let mu = my_parse_float(document.getElementById("mu").value);
    let sigma = my_parse_float(document.getElementById("sigma").value);
    let prob_trust = my_parse_float(document.getElementById("probTrust").value);
    let self_trust = my_parse_float(document.getElementById("selfTrust").value);
    current_state = Array(N_AGENTS)
        .fill(null)
        .map(() => rng.normal(mu, sigma));
    interaction_matrix = Array(N_AGENTS)
        .fill(null)
        .map((v, i) => {
            let trust = Array(N_AGENTS)
                .fill(null)
                .map((vv, j) => {
                    if (i == j) {
                        return self_trust;
                    }
                    if (rng.random() < prob_trust) {
                        return rng.random();
                    }
                    return 0;
                });
            let total = trust.reduce((a, v) => a + v, 0);
            return trust.map((v) => v / total);
        });
    initial_histogram = jStat.histogram(current_state, N_BINS);
    initial_min = Math.min(...current_state);
    initial_max = Math.max(...current_state);
    initial_bin_locs = Array(N_BINS)
        .fill(null)
        .map(
            (v, i) =>
                initial_min + ((i + 0.5) * (initial_max - initial_min)) / N_BINS
        );
}

function simulate_step() {
    let old_state = current_state.slice();
    for (let i = 0; i < N_AGENTS; i += 1) {
        current_state[i] = 0;
        for (let j = 0; j < N_AGENTS; j += 1) {
            current_state[i] += interaction_matrix[i][j] * old_state[j];
        }
    }
    let std_dev = jStat.stdev(current_state);
    if (std_dev < MIN_STD) {
        stop_btn.click();
    }
}

function update_plot() {
    let current_histogram = jStat.histogram(current_state, N_BINS);
    let current_min = Math.min(...current_state);
    let current_max = Math.max(...current_state);
    let current_bin_locs = Array(N_BINS)
        .fill(null)
        .map(
            (v, i) =>
                current_min + ((i + 0.5) * (current_max - current_min)) / N_BINS
        );
    hist_plot.update(
        [initial_bin_locs, current_bin_locs],
        [initial_histogram, current_histogram],
        "markers",
        COLORS
    );
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
