/* global jStat:readable, Random: readable, plotlyPlot:readable, setTimeout:readable */

const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let update_interval = 10;
let continue_flag = false;

const N_LEVELS = 100;
const N_PARTICLES = 50;
const N_SPACES = N_LEVELS - N_PARTICLES;
const RUN_STEPS = N_PARTICLES;
const ENERGIES = Array(N_LEVELS)
    .fill(null)
    .map((v, i) => i + 1);

let temperature = 1;
let states = Array(N_LEVELS).fill(0);
let steps_done = 0;
let state_history = Array(states.length).fill(0);

let prob_plot = new plotlyPlot("probPlot", ["E", "P(E)"], [10, 15, 40, 60]);
let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");

const COLORS = ["#c11", "#444"];

function get_theory(T) {
    return Array(ENERGIES.length)
        .fill(null)
        .map((v, i) => {
            return 1 / (1 + Math.exp((i + 1 - N_PARTICLES) / T));
        });
}

function plot() {
    let theory = get_theory(temperature);
    let data = state_history.map((v) => v / steps_done);
    prob_plot.update(
        [ENERGIES, ENERGIES],
        [data, theory],
        ["markers", "lines"],
        COLORS
    );
}

function initialize() {
    temperature = Math.pow(
        10,
        my_parse_float(document.getElementById("temperature").value)
    );
    let tmp = Array(N_LEVELS)
        .fill(null)
        .map(() => rng.random());
    let cutoff = jStat.percentile(tmp, N_PARTICLES / N_LEVELS);
    states = tmp.map((v) => (v < cutoff ? 1 : 0));
    steps_done = 1;
    state_history = states.slice();
}

function step() {
    let particle_id = Math.ceil(rng.uniform(0, N_PARTICLES));
    let space_id = Math.ceil(rng.uniform(0, N_SPACES));

    let loc_particle = -1;
    let loc_space = -1;
    let current_loc = 0;
    while (loc_particle < 0 || loc_space < 0) {
        if (states[current_loc] == 1) {
            particle_id -= 1;
            if (particle_id == 0) {
                loc_particle = current_loc;
            }
        } else {
            space_id -= 1;
            if (space_id == 0) {
                loc_space = current_loc;
            }
        }
        current_loc += 1;
    }

    let jump_prob = Math.exp((loc_particle - loc_space) / temperature);
    if (rng.random() < jump_prob) {
        states[loc_space] = 1;
        states[loc_particle] = 0;
    }
}

function run() {
    for (let i = 0; i < RUN_STEPS; i += 1) {
        step();
    }
    steps_done = steps_done + 1;
    state_history = state_history.map((v, i) => v + states[i]);
    plot();
    if (continue_flag) {
        setTimeout(run, update_interval);
    }
}

// events
start_btn.addEventListener("click", () => {
    start_btn.disabled = true;
    resume_btn.innerHTML = "Stop";

    initialize();

    continue_flag = true;
    setTimeout(run, update_interval);

    resume_btn.disabled = false;
});
resume_btn.addEventListener("click", () => {
    resume_btn.disabled = true;
    continue_flag = !continue_flag;
    if (continue_flag) {
        setTimeout(run, update_interval);
        resume_btn.innerHTML = "Stop";
    } else {
        resume_btn.innerHTML = "Resume";
    }
    start_btn.disabled = continue_flag;
    resume_btn.disabled = false;
});
resume_btn.disabled = true;
