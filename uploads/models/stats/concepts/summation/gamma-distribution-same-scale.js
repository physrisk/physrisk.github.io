const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const STEP_POINTS = 100;
const STEP_INTERVAL = 10;
let continue_flag = false;

let main_plot = new plotlyPlot("mainPlot", ["Σx", "p(Σx)"], [10, 15, 40, 60]);

const COLORS = ["#c11", "#222"];

let sim_alpha = [1, 2, 3];
let theory_alpha = sim_alpha.reduce((a, c) => a + c, 0);
let sim_theta = 1;
let theory_theta = sim_theta;
let n_runs = 0;

const HISTOGRAM_POINTS = 100;
const HISTOGRAM_INTERVAL = 3;
let histogram_vals = Array(HISTOGRAM_POINTS).fill(0);
let histogram = Array(HISTOGRAM_POINTS).fill(0);
const histogram_min = 0;
let histogram_max =
    theory_alpha * theory_theta +
    HISTOGRAM_INTERVAL * Math.sqrt(theory_alpha) * theory_theta;
let histogram_step = (histogram_max - histogram_min) / (HISTOGRAM_POINTS + 1);

function plot_histogram() {
    const sim_pdf = histogram.map((v) => v / histogram_step);

    const gamma_pdf = histogram_vals.map((v) =>
        jStat.gamma.pdf(v, theory_alpha, theory_theta)
    );

    main_plot.update([histogram_vals], [sim_pdf, gamma_pdf], "lines", COLORS);
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

function generate_multiple_samples(n_samples, alpha, theta) {
    return Array(n_samples)
        .fill(null)
        .map(
            () =>
                jStat.gamma.sample(alpha[0], theta) +
                jStat.gamma.sample(alpha[1], theta) +
                jStat.gamma.sample(alpha[2], theta)
        );
}

function frame() {
    n_runs += 1;

    let step_sample = generate_multiple_samples(
        STEP_POINTS,
        sim_alpha,
        sim_theta
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

    sim_alpha = [
        my_parse_float(document.getElementById("alpha_1").value),
        my_parse_float(document.getElementById("alpha_2").value),
        my_parse_float(document.getElementById("alpha_3").value),
    ];
    sim_theta = my_parse_float(document.getElementById("theta").value);
    n_runs = 0;

    theory_alpha = sim_alpha.reduce((a, c) => a + c, 0);
    document.getElementById("theory_alpha").value = theory_alpha;
    theory_theta = sim_theta;
    document.getElementById("theory_theta").value = theory_theta;

    histogram_max =
        theory_alpha * theory_theta +
        HISTOGRAM_INTERVAL * Math.sqrt(theory_alpha) * theory_theta;
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
    theory_alpha = my_parse_float(
        document.getElementById("theory_alpha").value
    );
    theory_theta = my_parse_float(
        document.getElementById("theory_theta").value
    );
    plot_histogram();
}
document
    .getElementById("theory_alpha")
    .addEventListener("change", () => update_theory());
document
    .getElementById("theory_theta")
    .addEventListener("change", () => update_theory());
