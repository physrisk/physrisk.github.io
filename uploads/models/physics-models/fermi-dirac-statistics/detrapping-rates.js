/* global jStat:readable, Random: readable, plotlyPlot:readable, setTimeout:readable */

const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const update_interval = 10;
let continue_flag = false;

const N_LEVELS = 99; // excludes conduction band!
const N_PARTICLES = 50;
const N_SPACES = N_LEVELS - N_PARTICLES;
const RUN_STEPS = 10 * N_PARTICLES;
const ENERGIES = Array(N_LEVELS)
    .fill(null)
    .map((v, i) => i + 1);

let temperature = 1;
let states = Array(N_LEVELS).fill(0);
let times = Array(states.length).fill(0);
let free_particles = 0;
let steps_done = 0;
let free_history = 0;
let state_history = Array(states.length).fill(0);

const DETRAP_BINS = 100;
const MAX_DETRAP_HISTORY = 10000;
let detrapping_history = [];

let prob_plot = new plotlyPlot("probPlot", ["E", "P(E)"], [10, 15, 40, 60]);
let detrap_plot = new plotlyPlot("detrapPlot", ["γ", "P(γ)"], [10, 15, 40, 60]);
let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");

const COLORS = ["#c11", "#444"];

function get_fermi_theory(T) {
    let norm = 1 - free_history / N_PARTICLES;
    return Array(ENERGIES.length)
        .fill(null)
        .map((v, i) => {
            return norm / (1 + Math.exp((i + 1 - N_PARTICLES) / T));
        });
}

function get_rate_theory(rate_start, rate_end, T, hist_steps = 100) {
    const norm =
        1 /
        (N_LEVELS +
            T *
                Math.log(
                    Math.exp(N_PARTICLES / T) /
                        (Math.exp(N_PARTICLES / T) + Math.exp(N_LEVELS / T))
                ));
    const rate_step = (rate_end - rate_start) / (hist_steps - 1);
    let rates = Array(hist_steps)
        .fill(0)
        .map((v, i) => Math.pow(10, rate_start + rate_step * i));
    let probs = rates.map(
        (v) => (norm * T) / (Math.exp(-(N_LEVELS + 1 - N_PARTICLES) / T) + v)
    );
    return {
        rate: rates.map((v) => Math.log10(v)),
        prob: probs.map((v) => Math.log10(v)),
    };
}

function plot() {
    const fermi_theory = get_fermi_theory(temperature);
    const data = state_history.map((v) => v / steps_done);
    prob_plot.update(
        [ENERGIES, ENERGIES],
        [data, fermi_theory],
        ["markers", "lines"],
        COLORS
    );
    const detrap_start = Math.min(...detrapping_history);
    const detrap_end = Math.max(...detrapping_history);
    const detrap_step = (detrap_end - detrap_start) / (DETRAP_BINS - 1);
    const bins = Array(DETRAP_BINS)
        .fill(0)
        .map((v, i) => i * detrap_step + detrap_start);
    const bin_widths = bins.map((v, i, a) => {
        if (i == 0) {
            return Math.pow(10, a[i]);
        }
        return Math.pow(10, a[i]) - Math.pow(10, a[i - 1]);
    });
    let counts = jStat.histogram(detrapping_history, DETRAP_BINS);
    counts = counts.map((v, i) =>
        Math.log10(v / detrapping_history.length / bin_widths[i])
    );
    let rate_theory = get_rate_theory(detrap_start, detrap_end, temperature);
    detrap_plot.update(
        [bins, rate_theory.rate],
        [counts, rate_theory.prob],
        ["markers", "lines"],
        COLORS
    );
    if (detrapping_history.length > MAX_DETRAP_HISTORY) {
        detrapping_history = detrapping_history.slice(-MAX_DETRAP_HISTORY);
    }
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
    times = Array(states.length).fill(0);
    steps_done = 1;
    free_particles = 0;
    state_history = states.slice();
    detrapping_history = [];
    free_history = free_particles;
}

function step() {
    let particle_id = Math.ceil(rng.uniform(0, N_PARTICLES));
    let loc_particle = -1;
    let loc_space = -1;
    if (particle_id > N_PARTICLES - free_particles) {
        // free particle is selected
        let space_id = Math.ceil(rng.uniform(0, N_SPACES + free_particles));
        let current_loc = 0;
        while (loc_space < 0) {
            if (states[current_loc] == 0) {
                space_id -= 1;
                if (space_id == 0) {
                    loc_space = current_loc;
                }
            }
            current_loc += 1;
        }
        loc_particle = N_LEVELS + 1;
    } else {
        // non-free particle is selected
        let current_loc = 0;
        while (loc_particle < 0) {
            if (states[current_loc] == 1) {
                particle_id -= 1;
                if (particle_id == 0) {
                    loc_particle = current_loc;
                }
            }
            current_loc += 1;
        }
        loc_space = N_LEVELS + 1;
    }

    let jump_prob = Math.exp((loc_particle - loc_space) / temperature);
    times = times.map((v) => v + 1);
    if (rng.random() < jump_prob) {
        if (loc_space == N_LEVELS + 1) {
            free_particles = free_particles + 1;
            // times need to be counted as 1/n_particles
            detrapping_history.push(
                -Math.log10(times[loc_particle] / N_PARTICLES)
            );
            states[loc_particle] = 0;
            times[loc_particle] = 0;
        }
        if (loc_particle == N_LEVELS + 1) {
            free_particles = free_particles - 1;
            states[loc_space] = 1;
            times[loc_space] = 0;
        }
    }
}

function run() {
    for (let i = 0; i < RUN_STEPS; i += 1) {
        step();
    }
    free_history =
        (free_history * steps_done + free_particles) / (steps_done + 1);
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
