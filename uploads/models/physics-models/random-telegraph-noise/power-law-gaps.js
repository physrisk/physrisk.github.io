const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const SHOW_PULSES = 100;
const PSD_POINTS = 100;
const PSD_NORM = [50, 55, 60, 65, 70];
const PSD_BOUNDS = [-6, 0];
const PSD_FREQS = jStat
    .seq(PSD_BOUNDS[0], PSD_BOUNDS[1], PSD_POINTS)
    .map((v) => Math.pow(10, v));

const GENERATE_EVENTS = 10;
const GENERATE_INTERVAL = 100;

let continue_flag = true;

let series_plot = new plotlyPlot("seriesPlot", ["t", "I(t)"], [10, 15, 40, 60]);
let psd_plot = new plotlyPlot(
    "psdPlot",
    ["lg[f]", "lg[S(f)]"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#444"];

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

function generate_pareto(power, low, high) {
    let uniform = rng.random();
    let scale = Math.pow(high / low, power);
    let result = Math.pow(1 - uniform + uniform / scale, -1 / power);
    return low * result;
}

function get_gap_pulse(clock, power_gap, min_gap, max_gap, recombination_rate) {
    let tau = generate_pareto(power_gap, min_gap, max_gap);
    let theta = rng.exponential(recombination_rate);
    return [tau, theta];
}

function append_pulse(initial_clock, tau, theta) {
    if (series.time.length > 4 * SHOW_PULSES + 1) {
        series.time = series.time.slice(
            series.time.length - 4 * SHOW_PULSES - 1
        );
        series.value = series.value.slice(
            series.value.length - 4 * SHOW_PULSES - 1
        );
    }
    series.time.push(initial_clock + tau);
    series.value.push(0);
    series.time.push(initial_clock + tau);
    series.value.push(1);
    series.time.push(initial_clock + tau + theta);
    series.value.push(1);
    series.time.push(initial_clock + tau + theta);
    series.value.push(0);
}

let sim_power_gap = 1.0;
let sim_min_gap = 1.0;
let sim_max_gap = 1e4;
let sim_recombination_rate = 1e-3;
let clock = 0;
let n_events = 0;
let total_pulse_duration = 0;
let fourier_pulse_real = [0];
let fourier_pulse_imag = [0];
let fourier_gap_real = [0];
let fourier_gap_imag = [0];
let series = {
    time: [0],
    value: [0],
};
let psd = [0];

function generate_pulse(
    power_gap = 1,
    min_gap = 1,
    max_gap = 100,
    recombination_rate = 1
) {
    let tau, theta, pulse_start, pulse_end, pulse_contrib, gap_contrib;
    [tau, theta] = get_gap_pulse(
        clock,
        power_gap,
        min_gap,
        max_gap,
        recombination_rate
    );
    append_pulse(clock, tau, theta);

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
}

function get_theory(freqs, power) {
    let beta = 2 - power;
    if (sim_min_gap > 1 / sim_recombination_rate && power < 1) {
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
    series_plot.update([series.time], [series.value], "lines", COLORS);

    let freqs = PSD_FREQS.map((v) => Math.log10(v));
    let theory = get_theory(PSD_FREQS, sim_power_gap);
    psd_plot.update(
        [freqs, freqs],
        [psd.map((v) => Math.log10(v)), theory.map((v) => Math.log10(v))],
        "lines",
        COLORS
    );
}

function frame() {
    for (let i = 0; i < GENERATE_EVENTS; i += 1) {
        generate_pulse(
            sim_power_gap,
            sim_min_gap,
            sim_max_gap,
            sim_recombination_rate
        );
    }
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
    sim_min_gap = Math.pow(
        10,
        my_parse_float(document.getElementById("min_gap").value)
    );
    sim_max_gap = Math.pow(
        10,
        my_parse_float(document.getElementById("max_gap").value)
    );
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
    series = {
        time: [0],
        value: [0],
    };
    psd = Array(PSD_FREQS.length).fill(0);
    frame();
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});
