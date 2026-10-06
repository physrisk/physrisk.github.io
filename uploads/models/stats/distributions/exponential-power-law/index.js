const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const STEP_POINTS = 1000;
const STEP_INTERVAL = 10;
let continue_flag = false;

let value_pdf_plot = new plotlyPlot(
    "valuePdfPlot",
    ["lg[x]", "lg[p(x)]"],
    [10, 15, 40, 60]
);
let rate_pdf_plot = new plotlyPlot(
    "ratePdfPlot",
    ["λ", "p(λ)"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#444"];

let model_alpha_power = 0;
let model_min = 1;
let model_max = 1e4;
let n_runs = 0;

const HISTOGRAM_POINTS = 100;
const VALUE_SCALE = 10;
let value_histogram = Array(HISTOGRAM_POINTS).fill(0);
let value_vals = Array(HISTOGRAM_POINTS).fill(0);
let rate_histogram = Array(HISTOGRAM_POINTS).fill(0);
let rate_vals = Array(HISTOGRAM_POINTS).fill(0);

function get_theory(lg_vals, alpha_power, rate_low, rate_high) {
    let norm = 1;
    if (alpha_power == 1) {
        norm = norm / (Math.log(rate_high) - Math.log(rate_low));
    } else {
        norm =
            (lanczos_gamma(2 - alpha_power) * (1 - alpha_power)) /
            (Math.pow(rate_high, 1 - alpha_power) -
                Math.pow(rate_low, 1 - alpha_power));
    }
    norm = Math.log10(norm);
    return lg_vals.map((v) => -(2 - alpha_power) * v + norm);
}

function lanczos_gamma(x) {
    if (x < 0.5) {
        return Math.PI / (Math.sin(Math.PI * x) * lanczos_gamma(1 - x));
    }
    x -= 1;
    const p = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    const g = 7;
    const t = x + g + 0.5;
    const a = p.reduce((a_v, p_i, i) => {
        return a_v + p_i / (x + i);
    }, p[0]);
    return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
}

function plot_histograms() {
    let rate_density_norm = rate_vals[1] - rate_vals[0];
    rate_pdf_plot.update(
        [rate_vals],
        [rate_histogram.map((v) => v / rate_density_norm)],
        "lines",
        COLORS
    );
    let theory = get_theory(
        value_vals,
        model_alpha_power,
        model_min,
        model_max
    );
    value_pdf_plot.update(
        [value_vals, value_vals],
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
            theory,
        ],
        "lines",
        COLORS
    );
}

function update_histograms(sample) {
    let update_value_histogram = commonFunctions.makePdf(
        sample.values,
        Math.log10(1 / (model_max * VALUE_SCALE)),
        Math.log10(VALUE_SCALE / model_min),
        HISTOGRAM_POINTS,
        false
    );
    value_histogram = value_histogram.map((v, i) => {
        return ((n_runs - 1) * v + update_value_histogram[i]) / n_runs;
    });

    let update_rate_histogram = commonFunctions.makePdf(
        sample.rates,
        model_min,
        model_max,
        HISTOGRAM_POINTS,
        false
    );
    rate_histogram = rate_histogram.map((v, i) => {
        return ((n_runs - 1) * v + update_rate_histogram[i]) / n_runs;
    });
}

function generate_multi_samples(alpha_power, low, high) {
    let value, rate;
    let new_values = Array(STEP_POINTS).fill(0);
    let new_rates = Array(STEP_POINTS).fill(0);
    for (let i = 0; i < STEP_POINTS; i += 1) {
        [value, rate] = generate_single_sample(alpha_power, low, high);
        new_values[i] = Math.log10(value);
        new_rates[i] = rate;
    }
    return { values: new_values, rates: new_rates };
}

function generate_single_sample(alpha_power, low, high) {
    let rate_sample = 0;
    if (alpha_power == 0) {
        rate_sample = rng.uniform(low, high);
    } else {
        rate_sample = generate_proper_bounded_pareto(
            alpha_power - 1,
            low,
            high
        );
    }
    let value_sample = rng.exponential(rate_sample);
    return [value_sample, rate_sample];
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
        model_alpha_power,
        model_min,
        model_max
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

    model_alpha_power = my_parse_float(
        document.getElementById("rate_exp").value
    );
    model_min = Math.pow(
        10,
        my_parse_float(document.getElementById("min_rate").value)
    );
    model_max = Math.pow(
        10,
        my_parse_float(document.getElementById("max_rate").value)
    );
    if (model_min * 10 > model_max) {
        document.getElementById("max_rate").value = Math.round(
            Math.log10(model_min) + 1
        ).toFixed(0);
        model_max = Math.pow(
            10,
            my_parse_float(document.getElementById("max_rate").value)
        );
    }
    n_runs = 0;

    value_histogram = Array(HISTOGRAM_POINTS).fill(0);
    let value_min = Math.log10(1 / (model_max * VALUE_SCALE));
    let value_max = Math.log10(VALUE_SCALE / model_min);
    let value_step = (value_max - value_min) / HISTOGRAM_POINTS;
    value_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => i * value_step + value_min);

    rate_histogram = Array(HISTOGRAM_POINTS).fill(0);
    let rate_step = (model_max - model_min) / HISTOGRAM_POINTS;
    rate_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => i * rate_step + model_min);

    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});
