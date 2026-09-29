const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const STEP_POINTS = 1000;
const STEP_INTERVAL = 10;
let continue_flag = false;

let main_plot = new plotlyPlot(
    "mainPlot",
    ["Z, Y", "p(Z), p(Y)"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#222", "#666"];

let sim_alpha = 1;
let sim_beta = 1;
let sim_n_sum = 1;
let n_runs = 0;

const HISTOGRAM_POINTS = 100;
let histogram = Array(HISTOGRAM_POINTS).fill(0);
let histogram_vals = Array(HISTOGRAM_POINTS).fill(0);

function plot_histogram() {
    const beta_mean = sim_alpha / (sim_alpha + sim_beta);
    const theory_mean = sim_n_sum * beta_mean;
    const beta_std = Math.sqrt(
        (sim_alpha * sim_beta) /
            (Math.pow(sim_alpha + sim_beta, 2) * (sim_alpha + sim_beta + 1))
    );
    const theory_std = Math.sqrt(sim_n_sum) * beta_std;
    const hist_vals = histogram_vals.map((v) => (v - theory_mean) / theory_std);

    const density_norm = (histogram_vals[1] - histogram_vals[0]) / theory_std;
    const sim_pdf = histogram.map((v) => v / density_norm);

    const normal_pdf = hist_vals.map((v) => jStat.normal.pdf(v, 0, 1));
    const beta_pdf = hist_vals.map(
        (v) =>
            beta_std *
            jStat.beta.pdf(beta_std * v + beta_mean, sim_alpha, sim_beta)
    );

    main_plot.update(
        [hist_vals],
        [sim_pdf, normal_pdf, beta_pdf],
        "lines",
        COLORS
    );
}

function update_histogram(new_sample) {
    let new_histogram = Array(HISTOGRAM_POINTS).fill(0);
    const histogram_step = histogram_vals[1] - histogram_vals[0];
    new_sample.forEach((v) => {
        new_histogram[Math.floor(v / histogram_step)] += 1;
    });
    new_histogram = new_histogram.map((v) => v / new_sample.length);
    histogram = histogram.map((v, i) => {
        return ((n_runs - 1) * v + new_histogram[i]) / n_runs;
    });
}

function generate_multiple_samples(n_samples, alpha, beta, n_sum) {
    return Array(n_samples)
        .fill(null)
        .map(() => generate_single_sample(alpha, beta, n_sum));
}

function generate_single_sample(alpha, beta, n_sum) {
    return Array(n_sum)
        .fill(null)
        .map(() => jStat.beta.sample(alpha, beta))
        .reduce((a, c) => a + c);
}

function frame() {
    n_runs += 1;

    let step_sample = generate_multiple_samples(
        STEP_POINTS,
        sim_alpha,
        sim_beta,
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

    sim_alpha = my_parse_float(document.getElementById("alpha").value);
    sim_beta = my_parse_float(document.getElementById("beta").value);
    sim_n_sum = parseInt(document.getElementById("n_sum").value);
    n_runs = 0;

    histogram = Array(HISTOGRAM_POINTS).fill(0);
    let histogram_step = sim_n_sum / HISTOGRAM_POINTS;
    histogram_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => (i + 0.5) * histogram_step);

    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});
