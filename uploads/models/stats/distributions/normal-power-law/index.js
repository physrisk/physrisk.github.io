const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const STEP_POINTS = 1000;
const STEP_INTERVAL = 10;
let continue_flag = false;

let value_pdf_plot = new plotlyPlot(
    "valuePdfPlot",
    ["lg[x], lg[μ], lg[σ]", "lg[p(x)], lg[p(μ)], lg[p(σ)]"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#063", "#05a"];

let model_mean_exp = 2;
let model_mean_min = 1;
let model_mean_max = 1e4;
let model_std_exp = 0;
let model_std_min = 1;
let model_std_max = 1;
let n_runs = 0;

const HISTOGRAM_POINTS = 100;
const VALUE_SCALE = 10;
let value_histogram = Array(HISTOGRAM_POINTS).fill(0);
let value_vals = Array(HISTOGRAM_POINTS).fill(0);
let mean_histogram = Array(HISTOGRAM_POINTS).fill(0);
let mean_vals = Array(HISTOGRAM_POINTS).fill(0);
let std_histogram = Array(HISTOGRAM_POINTS).fill(0);
let std_vals = Array(HISTOGRAM_POINTS).fill(0);

function plot_histograms() {
    value_pdf_plot.update(
        [value_vals, mean_vals, std_vals],
        [
            value_histogram.map((v, i) => {
                let bin_width = 1;
                if (i > 0) {
                    bin_width =
                        Math.pow(10, value_vals[i]) -
                        Math.pow(10, value_vals[i - 1]);
                } else {
                    bin_width =
                        Math.pow(10, value_vals[1]) -
                        Math.pow(10, value_vals[0]);
                }
                return Math.log10(v / bin_width);
            }),
            mean_histogram.map((v, i) => {
                let bin_width = 1;
                if (i > 0) {
                    bin_width =
                        Math.pow(10, mean_vals[i]) -
                        Math.pow(10, mean_vals[i - 1]);
                } else {
                    bin_width =
                        Math.pow(10, mean_vals[1]) - Math.pow(10, mean_vals[0]);
                }
                return Math.log10(v / bin_width);
            }),
            std_histogram.map((v, i) => {
                let bin_width = 1;
                if (i > 0) {
                    bin_width =
                        Math.pow(10, std_vals[i]) -
                        Math.pow(10, std_vals[i - 1]);
                } else {
                    bin_width =
                        Math.pow(10, std_vals[1]) - Math.pow(10, std_vals[0]);
                }
                return Math.log10(v / bin_width);
            }),
        ],
        "lines",
        COLORS
    );
}

function update_histograms(sample) {
    let update_value_histogram = commonFunctions.makePdf(
        sample.values,
        Math.log10(Math.max(model_mean_min, model_std_min) / VALUE_SCALE),
        Math.log10((model_mean_max + model_std_max) * VALUE_SCALE),
        HISTOGRAM_POINTS,
        false
    );
    value_histogram = value_histogram.map((v, i) => {
        return ((n_runs - 1) * v + update_value_histogram[i]) / n_runs;
    });

    let update_mean_histogram = commonFunctions.makePdf(
        sample.means,
        Math.log10(model_mean_min),
        Math.log10(model_mean_max),
        HISTOGRAM_POINTS,
        false
    );
    mean_histogram = mean_histogram.map((v, i) => {
        return ((n_runs - 1) * v + update_mean_histogram[i]) / n_runs;
    });

    let update_std_histogram = commonFunctions.makePdf(
        sample.stds,
        Math.log10(model_std_min),
        Math.log10(model_std_max),
        HISTOGRAM_POINTS,
        false
    );
    std_histogram = std_histogram.map((v, i) => {
        return ((n_runs - 1) * v + update_std_histogram[i]) / n_runs;
    });
}

function generate_multi_samples(
    mean_power,
    mean_low,
    mean_high,
    std_power,
    std_low,
    std_high
) {
    let value, mean, std;
    let new_values = Array(STEP_POINTS).fill(0);
    let new_means = Array(STEP_POINTS).fill(0);
    let new_stds = Array(STEP_POINTS).fill(0);
    for (let i = 0; i < STEP_POINTS; i += 1) {
        [value, mean, std] = generate_single_sample(
            mean_power,
            mean_low,
            mean_high,
            std_power,
            std_low,
            std_high
        );
        new_values[i] = Math.log10(value);
        new_means[i] = Math.log10(mean);
        new_stds[i] = Math.log10(std);
    }
    return { values: new_values, means: new_means, stds: new_stds };
}

function generate_single_sample(
    mean_power,
    mean_low,
    mean_high,
    std_power,
    std_low,
    std_high
) {
    let mean_sample = mean_low;
    let std_sample = std_low;
    if (mean_low < mean_high) {
        if (mean_power == 0) {
            mean_sample = rng.uniform(mean_low, mean_high);
        } else {
            mean_sample = generate_proper_bounded_pareto(
                mean_power - 1,
                mean_low,
                mean_high
            );
        }
    }
    if (std_low < std_high) {
        if (std_power == 0) {
            std_sample = rng.uniform(std_low, std_high);
        } else {
            std_sample = generate_proper_bounded_pareto(
                std_power - 1,
                std_low,
                std_high
            );
        }
    }
    let value_sample = -1;
    while (value_sample < 0) {
        value_sample = rng.normal(mean_sample, std_sample);
    }
    return [value_sample, mean_sample, std_sample];
}

function generate_proper_bounded_pareto(alpha_power, low, high) {
    let uniform = rng.random();
    if (alpha_power == 0) {
        return low * Math.pow(high / low, uniform);
    }
    let scale = Math.pow(high / low, alpha_power);
    let result = Math.pow(1 - uniform + uniform / scale, -1 / alpha_power);
    return low * result;
}

function frame() {
    n_runs += 1;

    let step_sample = generate_multi_samples(
        model_mean_exp,
        model_mean_min,
        model_mean_max,
        model_std_exp,
        model_std_min,
        model_std_max
    );

    update_histograms(step_sample);

    plot_histograms();

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

    model_mean_exp = my_parse_float(document.getElementById("mean_exp").value);
    model_mean_min = Math.pow(
        10,
        my_parse_float(document.getElementById("min_mean").value)
    );
    model_mean_max = Math.pow(
        10,
        my_parse_float(document.getElementById("max_mean").value)
    );
    if (model_mean_min > model_mean_max) {
        document.getElementById("max_mean").value = Math.round(
            Math.log10(model_mean_min)
        ).toFixed(0);
        model_mean_max = Math.pow(
            10,
            my_parse_float(document.getElementById("max_mean").value)
        );
    }

    model_std_exp = my_parse_float(document.getElementById("std_exp").value);
    model_std_min = Math.pow(
        10,
        my_parse_float(document.getElementById("min_std").value)
    );
    model_std_max = Math.pow(
        10,
        my_parse_float(document.getElementById("max_std").value)
    );
    if (model_std_min > model_std_max) {
        document.getElementById("max_std").value = Math.round(
            Math.log10(model_std_min)
        ).toFixed(0);
        model_std_max = Math.pow(
            10,
            my_parse_float(document.getElementById("max_std").value)
        );
    }

    n_runs = 0;

    value_histogram = Array(HISTOGRAM_POINTS).fill(0);
    let value_min = Math.log10(
        Math.max(model_mean_min, model_std_min) / VALUE_SCALE
    );
    let value_max = Math.log10((model_mean_max + model_std_max) * VALUE_SCALE);
    let value_step = (value_max - value_min) / HISTOGRAM_POINTS;
    value_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => i * value_step + value_min);

    mean_histogram = Array(HISTOGRAM_POINTS).fill(0);
    let mean_min = Math.log10(model_mean_min);
    let mean_max = Math.log10(model_mean_max);
    let mean_step = (mean_max - mean_min) / HISTOGRAM_POINTS;
    mean_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => i * mean_step + mean_min);

    std_histogram = Array(HISTOGRAM_POINTS).fill(0);
    let std_min = Math.log10(model_std_min);
    let std_max = Math.log10(model_std_max);
    let std_step = (std_max - std_min) / HISTOGRAM_POINTS;
    std_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => i * std_step + std_min);

    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});
