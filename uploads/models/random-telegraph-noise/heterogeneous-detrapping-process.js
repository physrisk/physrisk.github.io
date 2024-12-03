const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const PSD_POINTS = 100;
const PSD_NORM = [50, 55, 60, 65, 70];
const PSD_BOUNDS = [-6, 0];
const PSD_FREQS = jStat
    .seq(PSD_BOUNDS[0], PSD_BOUNDS[1], PSD_POINTS)
    .map((v) => Math.pow(10, v));

const GENERATE_EVENTS = 30;
const GENERATE_INTERVAL = 100;

let continue_flag = true;

let cutoff_plot = new plotlyPlot(
    "cutoffPlot",
    ["t", "lg[min(γ)]"],
    [10, 15, 40, 60]
);
let tau_pdf_plot = new plotlyPlot(
    "tauPdfPlot",
    ["lg[τ], lg[θ]", "lg[p(τ)], lg[p(θ)]"],
    [10, 15, 40, 60]
);
let rate_pdf_plot = new plotlyPlot(
    "ratePdfPlot",
    ["γ", "p(γ)"],
    [10, 15, 40, 60]
);
let psd_plot = new plotlyPlot(
    "psdPlot",
    ["lg[f]", "lg[S(f)]"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#47c", "#444"];

// histograms
let n_frames = 0;
const HISTOGRAM_POINTS = 100;
const VALUE_SCALE = [0.01, 1.5];
let tau_histogram = Array(HISTOGRAM_POINTS).fill(0);
let tau_vals = Array(HISTOGRAM_POINTS).fill(0);
let theta_histogram = Array(HISTOGRAM_POINTS).fill(0);
let rate_histogram = Array(HISTOGRAM_POINTS).fill(0);
let rate_vals = Array(HISTOGRAM_POINTS).fill(0);
let rate_smallest = 1e9;
let min_rate_history = {
    clock: [],
    value: [],
    theory: [],
};
let tau_largest = 1 / rate_smallest;

function initialize_histograms() {
    n_frames = 0;

    tau_histogram = Array(HISTOGRAM_POINTS).fill(0);
    let tau_min = Math.log10(VALUE_SCALE[0] / sim_max_rate);
    let tau_max = Math.log10(VALUE_SCALE[1] / sim_min_rate);
    let tau_step = (tau_max - tau_min) / HISTOGRAM_POINTS;
    tau_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => i * tau_step + tau_min);

    theta_histogram = Array(HISTOGRAM_POINTS).fill(0);

    rate_histogram = Array(HISTOGRAM_POINTS).fill(0);
    let rate_step = (sim_max_rate - sim_min_rate) / HISTOGRAM_POINTS;
    rate_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => i * rate_step + sim_min_rate);
    rate_smallest = 1e9;
    min_rate_history = {
        clock: [],
        value: [],
        theory: [],
    };
    tau_largest = 1 / rate_smallest;
}

function update_histograms(rates, taus, thetas) {
    let update_tau_histogram = commonFunctions.makePdf(
        taus,
        Math.log10(VALUE_SCALE[0] / sim_max_rate),
        Math.log10(VALUE_SCALE[1] / sim_min_rate),
        HISTOGRAM_POINTS,
        false
    );
    tau_histogram = tau_histogram.map((v, i) => {
        return ((n_frames - 1) * v + update_tau_histogram[i]) / n_frames;
    });

    let update_theta_histogram = commonFunctions.makePdf(
        thetas,
        Math.log10(VALUE_SCALE[0] / sim_max_rate),
        Math.log10(VALUE_SCALE[1] / sim_min_rate),
        HISTOGRAM_POINTS,
        false
    );
    theta_histogram = theta_histogram.map((v, i) => {
        return ((n_frames - 1) * v + update_theta_histogram[i]) / n_frames;
    });

    let update_rate_histogram = commonFunctions.makePdf(
        rates,
        sim_min_rate,
        sim_max_rate,
        HISTOGRAM_POINTS,
        false
    );
    rate_histogram = rate_histogram.map((v, i) => {
        return ((n_frames - 1) * v + update_rate_histogram[i]) / n_frames;
    });
    rate_smallest = Math.min(rate_smallest, ...rates);
    min_rate_history.clock.push(clock);
    min_rate_history.value.push(Math.log10(rate_smallest));
    min_rate_history.theory.push(
        Math.log10(sim_max_rate / (sim_recombination_rate * clock))
    );
    if (min_rate_history.clock.length > 300) {
        min_rate_history.clock = [...Array(100)].map(
            (_, idx) => min_rate_history.clock[idx * 3]
        );
        min_rate_history.value = [...Array(100)].map(
            (_, idx) => min_rate_history.value[idx * 3]
        );
        min_rate_history.theory = [...Array(100)].map(
            (_, idx) => min_rate_history.theory[idx * 3]
        );
    }
    tau_largest = Math.max(tau_largest, ...taus);

    let min_la_exp = Math.floor(Math.log10(rate_smallest));
    document.getElementById("min_la_exp").innerHTML = min_la_exp;
    document.getElementById("min_la_mantissa").innerHTML = (
        rate_smallest / Math.pow(10, min_la_exp)
    ).toFixed(2);

    let tmp_tau_largest = Math.pow(10, tau_largest);
    let max_tau_exp = Math.floor(tau_largest);
    document.getElementById("max_tau_exp").innerHTML = max_tau_exp;
    document.getElementById("max_tau_mantissa").innerHTML = (
        tmp_tau_largest / Math.pow(10, max_tau_exp)
    ).toFixed(2);
}

function plot_histograms() {
    let rate_density_norm = rate_vals[1] - rate_vals[0];
    rate_pdf_plot.update(
        [rate_vals],
        [rate_histogram.map((v) => v / rate_density_norm)],
        "lines",
        COLORS
    );
    tau_pdf_plot.update(
        [tau_vals, tau_vals],
        [
            tau_histogram.map((v, i) => {
                let bin_width = 1;
                if (i > 0) {
                    bin_width =
                        Math.pow(10, tau_vals[i]) -
                        Math.pow(10, tau_vals[i - 1]);
                } else {
                    bin_width =
                        Math.pow(10, tau_vals[1]) - Math.pow(10, tau_vals[0]);
                }
                return Math.log10(v / bin_width);
            }),
            theta_histogram.map((v, i) => {
                let bin_width = 1;
                if (i > 0) {
                    bin_width =
                        Math.pow(10, tau_vals[i]) -
                        Math.pow(10, tau_vals[i - 1]);
                } else {
                    bin_width =
                        Math.pow(10, tau_vals[1]) - Math.pow(10, tau_vals[0]);
                }
                return Math.log10(v / bin_width);
            }),
        ],
        "lines",
        COLORS
    );
    cutoff_plot.update(
        [min_rate_history.clock, min_rate_history.clock],
        [min_rate_history.value, min_rate_history.theory],
        "lines",
        [COLORS[0], COLORS[2]]
    );
}

// spectrum and signal generation
function get_rectangular_contribution(start, end) {
    let real = PSD_FREQS.map((freq) => {
        let start_term = Math.sin(2 * Math.PI * freq * start);
        let end_term = Math.sin(2 * Math.PI * freq * end);
        return (end_term - start_term) / (2 * Math.PI * freq);
    });
    let imag = PSD_FREQS.map((freq) => {
        let start_term = Math.cos(2 * Math.PI * freq * start);
        let end_term = Math.cos(2 * Math.PI * freq * end);
        return (end_term - start_term) / (2 * Math.PI * freq);
    });
    return {
        real: real,
        imag: imag,
    };
}

function generate_tau(power, low, high, n_success) {
    let rate = generate_proper_bounded_pareto(power - 1, low, high);
    let tau = 0;
    let n = 0;
    while (n < n_success) {
        tau += rng.exponential(rate);
        n += 1;
    }
    return [rate, tau];
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

function get_gap_pulse(
    clock,
    power_gap,
    min_rate,
    max_rate,
    n_success,
    recombination_rate
) {
    let rate, tau;
    [rate, tau] = generate_tau(power_gap, min_rate, max_rate, n_success);
    let theta = rng.exponential(recombination_rate);
    return [rate, tau, theta];
}

let sim_power_gap = 1.0;
let sim_min_rate = 1e-4;
let sim_max_rate = 1;
let sim_n_success = 1;
let sim_recombination_rate = 1e-3;
let clock = 0;
let n_events = 0;
let total_pulse_duration = 0;
let fourier_pulse_real = [0];
let fourier_pulse_imag = [0];
let fourier_gap_real = [0];
let fourier_gap_imag = [0];
let psd = [0];

function generate_pulse(
    power_gap = 1,
    min_rate = 0.01,
    max_rate = 1,
    n_success = 1,
    recombination_rate = 1
) {
    let rate, tau, theta, pulse_start, pulse_end, pulse_contrib, gap_contrib;
    [rate, tau, theta] = get_gap_pulse(
        clock,
        power_gap,
        min_rate,
        max_rate,
        n_success,
        recombination_rate
    );
    total_pulse_duration = total_pulse_duration + theta;
    pulse_start = clock + tau;
    pulse_end = pulse_start + theta;

    pulse_contrib = get_rectangular_contribution(pulse_start, pulse_end);
    fourier_pulse_real = fourier_pulse_real.map(
        (v, i) => v + pulse_contrib.real[i]
    );
    fourier_pulse_imag = fourier_pulse_imag.map(
        (v, i) => v + pulse_contrib.imag[i]
    );

    gap_contrib = get_rectangular_contribution(clock, pulse_start);
    fourier_gap_real = fourier_gap_real.map((v, i) => v + gap_contrib.real[i]);
    fourier_gap_imag = fourier_gap_imag.map((v, i) => v + gap_contrib.imag[i]);

    n_events += 1;
    clock = pulse_end;

    let series_mean = total_pulse_duration / clock;
    let pulse_norm = 1 - series_mean;
    let gap_norm = -series_mean;

    psd = Array(PSD_FREQS.length)
        .fill(0)
        .map((v, i) => {
            let real_part =
                pulse_norm * fourier_pulse_real[i] +
                gap_norm * fourier_gap_real[i];
            let imag_part =
                pulse_norm * fourier_pulse_imag[i] +
                gap_norm * fourier_gap_imag[i];
            return (
                (2 * (Math.pow(real_part, 2) + Math.pow(imag_part, 2))) / clock
            );
        });

    return [rate, tau, theta];
}

function get_theory(freqs, power) {
    let beta = 1 - power;
    if (sim_max_rate < sim_recombination_rate && power < 1) {
        beta = power;
    }
    // ad-hoc normalization
    // Although in the article we do have normalization constants derived,
    // they are just too complicated to be efficiently calculated in a
    // JavaScript app.
    let normalization = Math.pow(
        10,
        jStat.mean(
            PSD_NORM.map(
                (v) => beta * Math.log10(PSD_FREQS[v]) + Math.log10(psd[v])
            )
        )
    );
    return freqs.map((f) => {
        return normalization / Math.pow(f, beta);
    });
}

function update_plots() {
    let freqs = PSD_FREQS.map((v) => Math.log10(v));
    let theory = get_theory(PSD_FREQS, sim_power_gap);
    psd_plot.update(
        [freqs, freqs],
        [psd.map((v) => Math.log10(v)), theory.map((v) => Math.log10(v))],
        "lines",
        [COLORS[0], COLORS[2]]
    );

    plot_histograms();
}

function frame() {
    let rate, tau, theta;
    let sample_rates = Array(GENERATE_EVENTS).fill(0);
    let sample_lg_tau = Array(GENERATE_EVENTS).fill(0);
    let sample_lg_theta = Array(GENERATE_EVENTS).fill(0);
    for (let i = 0; i < GENERATE_EVENTS; i += 1) {
        [rate, tau, theta] = generate_pulse(
            sim_power_gap,
            sim_min_rate,
            sim_max_rate,
            sim_n_success,
            sim_recombination_rate
        );
        sample_rates[i] = rate;
        sample_lg_tau[i] = Math.log10(tau);
        sample_lg_theta[i] = Math.log10(theta);
    }
    n_frames = n_frames + 1;
    update_histograms(sample_rates, sample_lg_tau, sample_lg_theta);
    update_plots();
    if (continue_flag) {
        window.setTimeout(frame, GENERATE_INTERVAL);
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
    sim_power_gap = my_parse_float(document.getElementById("power_gap").value);
    sim_min_rate = Math.pow(
        10,
        my_parse_float(document.getElementById("min_rate").value)
    );
    sim_max_rate = Math.pow(
        10,
        my_parse_float(document.getElementById("max_rate").value)
    );
    if (sim_min_rate > sim_max_rate) {
        sim_min_rate = sim_max_rate;
        document.getElementById("min_rate").value = Math.log10(sim_min_rate).toFixed(1);
    }
    sim_n_success = parseInt(document.getElementById("n_success").value);
    sim_recombination_rate = Math.pow(
        10,
        -my_parse_float(document.getElementById("recombination_time").value)
    );
    clock = 0;
    n_events = 0;
    total_pulse_duration = 0;
    fourier_pulse_real = Array(PSD_FREQS.length).fill(0);
    fourier_pulse_imag = Array(PSD_FREQS.length).fill(0);
    fourier_gap_real = Array(PSD_FREQS.length).fill(0);
    fourier_gap_imag = Array(PSD_FREQS.length).fill(0);
    psd = Array(PSD_FREQS.length).fill(0);
    initialize_histograms();
    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});
