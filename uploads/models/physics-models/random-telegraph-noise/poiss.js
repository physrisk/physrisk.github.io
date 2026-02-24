const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const OBSERVATION_STEPS = 1048576;
const PERIOD = 1;
const OBSERVATION_TIME = OBSERVATION_STEPS * PERIOD;
const PSD_POINTS = 100;
const PSD_BOUNDS = [-6, -0.3];
const PSD_FREQS = jStat.seq(PSD_BOUNDS[0], PSD_BOUNDS[1], PSD_POINTS).map(
    // ensure that only "natural" frequencies are observed
    (v) => Math.round(Math.pow(10, v) * OBSERVATION_TIME) / OBSERVATION_TIME
);

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

function get_gap_pulse(clock, generation_rate, n_success, recombination_rate) {
    let tau = 0;
    let n = 0;
    while (n < n_success) {
        tau += rng.exponential(generation_rate);
        if (clock + tau > OBSERVATION_TIME) {
            tau = OBSERVATION_TIME - clock;
            return [tau, 0];
        }
        n += 1;
    }
    let theta = rng.exponential(recombination_rate);
    if (clock + tau + theta > OBSERVATION_TIME) {
        theta = OBSERVATION_TIME - clock - tau;
    }
    return [tau, theta];
}

function append_pulse(series, start_time, end_time) {
    let from = Math.ceil(start_time / PERIOD);
    let to = Math.floor(end_time / PERIOD);
    for (let i = from; i < OBSERVATION_STEPS && i <= to; i += 1) {
        series[i] += 1;
    }
    return series;
}

function generate_series(
    generation_rate = 1,
    n_success = 1,
    recombination_rate = 1
) {
    let tau, theta, pulse_contrib, gap_contrib, pulse_start, pulse_end;
    let fourier_pulse_real = Array(PSD_FREQS.length).fill(0);
    let fourier_pulse_imag = Array(PSD_FREQS.length).fill(0);
    let fourier_gap_real = Array(PSD_FREQS.length).fill(0);
    let fourier_gap_imag = Array(PSD_FREQS.length).fill(0);
    let series = Array(OBSERVATION_STEPS).fill(0);
    let n_events = 0;
    let clock = 0;
    let total_pulse_duration = 0;
    while (clock < OBSERVATION_TIME) {
        [tau, theta] = get_gap_pulse(
            clock,
            generation_rate,
            n_success,
            recombination_rate
        );

        total_pulse_duration = total_pulse_duration + theta;

        pulse_start = clock + tau;
        pulse_end = pulse_start + theta;

        series = append_pulse(series, pulse_start, pulse_end);

        n_events += 1;
        clock = pulse_end;

        pulse_contrib = get_rectangular_contribution(pulse_start, pulse_end);
        fourier_pulse_real = fourier_pulse_real.map(
            (v, i) => v + pulse_contrib.real[i]
        );
        fourier_pulse_imag = fourier_pulse_imag.map(
            (v, i) => v + pulse_contrib.imag[i]
        );

        gap_contrib = get_rectangular_contribution(clock, pulse_start);
        fourier_gap_real = fourier_gap_real.map(
            (v, i) => v + gap_contrib.real[i]
        );
        fourier_gap_imag = fourier_gap_imag.map(
            (v, i) => v + gap_contrib.imag[i]
        );
    }

    let series_mean = total_pulse_duration / OBSERVATION_TIME;
    let pulse_norm = 1 - series_mean;
    let gap_norm = -series_mean;

    let psd = Array(PSD_FREQS.length)
        .fill(0)
        .map((v, i) => {
            let real_part =
                pulse_norm * fourier_pulse_real[i] +
                gap_norm * fourier_gap_real[i];
            let imag_part =
                pulse_norm * fourier_pulse_imag[i] +
                gap_norm * fourier_gap_imag[i];
            return (
                (2 * (Math.pow(real_part, 2) + Math.pow(imag_part, 2))) /
                OBSERVATION_TIME
            );
        });
    return {
        series: series,
        n_events: n_events,
        psd: psd,
    };
}

function get_theory(freqs, n_events, generation_rate, recombination_rate) {
    let bar_nu = n_events / OBSERVATION_TIME;
    let const_term = 4 * bar_nu;
    let rate_sum_sq = Math.pow(generation_rate + recombination_rate, 2);
    return freqs.map((f) => {
        let omega = 2 * Math.PI * f;
        return const_term / (rate_sum_sq + Math.pow(omega, 2));
    });
}

function run(generation_rate = 1, n_success = 1, recombination_rate = 1) {
    let series = generate_series(
        generation_rate,
        n_success,
        recombination_rate
    );

    series_plot.update(
        [
            Array(series.series.length)
                .fill(null)
                .map((v, i) => {
                    return i * PERIOD;
                }),
        ],
        [series.series],
        "lines",
        COLORS
    );

    let freqs = PSD_FREQS.map((v) => Math.log10(v));
    let theory = get_theory(
        PSD_FREQS,
        series.n_events,
        generation_rate,
        recombination_rate
    );
    psd_plot.update(
        [freqs, freqs],
        [
            series.psd.map((v) => Math.log10(v)),
            theory.map((v) => Math.log10(v)),
        ],
        "lines",
        COLORS
    );
}

// events
document.getElementById("generate").addEventListener("click", () => {
    let generation_rate = Math.pow(
        10,
        my_parse_float(document.getElementById("generation_rate").value)
    );
    let n_success = parseInt(document.getElementById("n_success").value);
    let recombination_rate = Math.pow(
        10,
        my_parse_float(document.getElementById("recombination_rate").value)
    );
    run(generation_rate, n_success, recombination_rate);
});
