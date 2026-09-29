const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const STEP_POINTS = 100;
const STEP_INTERVAL = 10;
let continue_flag = false;

let main_plot = new plotlyPlot(
    "mainPlot",
    ["Σx", "lg[p(Σx)]"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#222"];

let sim_x_0 = 0;
let theory_x_0 = 0;
let sim_gamma = 1;
let theory_gamma = 1;
let sim_n_sum = 1;
let n_runs = 0;

const HISTOGRAM_POINTS = 100;
const HISTOGRAM_INTERVAL = 5;
let histogram_vals = Array(HISTOGRAM_POINTS).fill(0);
let histogram = Array(HISTOGRAM_POINTS).fill(0);
let histogram_min = -HISTOGRAM_INTERVAL;
let histogram_max = HISTOGRAM_INTERVAL;
let histogram_step = (2 * HISTOGRAM_INTERVAL) / (HISTOGRAM_POINTS - 1);

function plot_histogram() {
    const sim_pdf = histogram.map((v) => Math.log10(v / histogram_step));

    const cauchy_pdf = histogram_vals.map((v) =>
        Math.log10(jStat.cauchy.pdf(v, theory_x_0, theory_gamma))
    );

    main_plot.update([histogram_vals], [sim_pdf, cauchy_pdf], "lines", COLORS);
}

function update_histogram(new_sample) {
    let new_histogram = Array(HISTOGRAM_POINTS).fill(0);
    new_sample.forEach((v) => {
        if (v > histogram_min && v < histogram_max) {
            new_histogram[Math.floor((v - histogram_min) / histogram_step)] +=
                1;
        }
    });
    new_histogram = new_histogram.map((v) => v / new_sample.length);
    histogram = histogram.map((v, i) => {
        return ((n_runs - 1) * v + new_histogram[i]) / n_runs;
    });
}

function generate_multiple_samples(n_samples, x_0, gamma, n_sum) {
    return Array(n_samples)
        .fill(null)
        .map(() => generate_single_sample(x_0, gamma, n_sum));
}

function generate_single_sample(x_0, gamma, n_sum) {
    return Array(n_sum)
        .fill(null)
        .map(() => jStat.cauchy.sample(x_0, gamma))
        .reduce((a, c) => a + c);
}

function frame() {
    n_runs += 1;

    let step_sample = generate_multiple_samples(
        STEP_POINTS,
        sim_x_0,
        sim_gamma,
        sim_n_sum
    );

    update_histogram(step_sample);

    plot_histogram();

    if (continue_flag) {
        window.setTimeout(frame, STEP_INTERVAL);
    } else {
        generate_btn.disabled = false;
    }
}

// events
let generate_btn = document.getElementById("generate");
generate_btn.addEventListener("click", () => {
    generate_btn.disabled = true;
    stop_btn.disabled = false;
    continue_flag = true;

    sim_x_0 = my_parse_float(document.getElementById("x_0").value);
    sim_gamma = my_parse_float(document.getElementById("gamma").value);
    sim_n_sum = parseInt(document.getElementById("n_sum").value);
    n_runs = 0;

    theory_x_0 = Math.round(sim_x_0 * sim_n_sum * 10) / 10;
    document.getElementById("theory_x_0").value = theory_x_0;
    theory_gamma = Math.round(sim_gamma * sim_n_sum * 100) / 100;
    document.getElementById("theory_gamma").value = theory_gamma;

    histogram_min = (-HISTOGRAM_INTERVAL + sim_x_0) * sim_n_sum;
    histogram_max = (HISTOGRAM_INTERVAL + sim_x_0) * sim_n_sum;
    histogram_step = (histogram_max - histogram_min) / (HISTOGRAM_POINTS + 1);
    histogram_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => (i + 0.5) * histogram_step + histogram_min);
    histogram = Array(HISTOGRAM_POINTS).fill(0);

    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.disabled = true;
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});

function update_theory() {
    if (n_runs == 0) return;
    theory_x_0 = my_parse_float(document.getElementById("theory_x_0").value);
    theory_gamma = my_parse_float(
        document.getElementById("theory_gamma").value
    );
    plot_histogram();
}
document
    .getElementById("theory_x_0")
    .addEventListener("change", () => update_theory());
document
    .getElementById("theory_gamma")
    .addEventListener("change", () => update_theory());
