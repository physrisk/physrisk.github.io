const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let main_plot = new plotlyPlot(
    "mainPlot",
    ["value", "log-probability"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#222"];

const N_SAMPLES = 10000;
let lhs_samples = [];

const HISTOGRAM_POINTS = 101;
let histogram_vals = [];
let lhs_histogram = [];

function update_plot() {
    const sum_x0 = my_parse_float(document.getElementById("sum_x0").value);
    const sum_gamma = my_parse_float(
        document.getElementById("sum_gamma").value
    );

    const theory_vals = histogram_vals.map((v) =>
        Math.log10(jStat.cauchy.pdf(v, sum_x0, sum_gamma))
    );

    main_plot.update(
        [histogram_vals],
        [lhs_histogram, theory_vals],
        "lines",
        COLORS
    );
}

function generate_cauchy_samples(n_samples, x_0, gamma) {
    return Array(n_samples)
        .fill(null)
        .map(() => jStat.cauchy.sample(x_0, gamma));
}

function generate_samples() {
    const x_x0 = my_parse_float(document.getElementById("x_x0").value);
    const x_gamma = my_parse_float(document.getElementById("x_gamma").value);
    const y_x0 = my_parse_float(document.getElementById("y_x0").value);
    const y_gamma = my_parse_float(document.getElementById("y_gamma").value);

    const coeff_a = my_parse_float(document.getElementById("coeff_a").value);
    const coeff_b = my_parse_float(document.getElementById("coeff_b").value);
    const coeff_c = my_parse_float(document.getElementById("coeff_c").value);

    const x_samples = generate_cauchy_samples(N_SAMPLES, x_x0, x_gamma);
    const y_samples = generate_cauchy_samples(N_SAMPLES, y_x0, y_gamma);

    lhs_samples = Array(N_SAMPLES)
        .fill(null)
        .map((v, i) => {
            return coeff_a * x_samples[i] + coeff_b * y_samples[i] + coeff_c;
        });

    const lhs_location = coeff_a * x_x0 + coeff_b * y_x0 + coeff_c;
    const lhs_spread = 3 * (coeff_a * x_gamma + coeff_b * y_gamma);
    const histogram_min = lhs_location - lhs_spread;
    const histogram_max = lhs_location + lhs_spread;
    const histogram_step =
        (histogram_max - histogram_min) / (HISTOGRAM_POINTS - 1);
    const histogram_norm_factor = Math.log10(histogram_step * N_SAMPLES);

    histogram_vals = Array(HISTOGRAM_POINTS)
        .fill(null)
        .map((v, i) => {
            return histogram_min + histogram_step * i;
        });
    lhs_histogram = Array(HISTOGRAM_POINTS).fill(0);
    lhs_samples.forEach((v) => {
        if (v < histogram_min - 0.5) return;
        if (v > histogram_max) return;
        const hist_idx = Math.round((v - histogram_min) / histogram_step);
        lhs_histogram[hist_idx] += 1;
    });
    lhs_histogram = lhs_histogram.map((v) => {
        return Math.log10(v) - histogram_norm_factor;
    });
}

// events
let generate_btn = document.getElementById("generate");
generate_btn.addEventListener("click", () => {
    generate_samples();
    update_plot();
});
document.querySelectorAll(".theoryParam").forEach((elem) => {
    elem.addEventListener("change", () => {
        update_plot();
    });
});

// main
window.onload = () => {
    generate_btn.click();
};
