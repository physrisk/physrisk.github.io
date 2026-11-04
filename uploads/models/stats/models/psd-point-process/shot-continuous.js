const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const OBSERVATION_STEPS = 1048576;
const PERIOD = 1;
const OBSERVATION_TIME = OBSERVATION_STEPS * PERIOD;
const PSD_POINTS = 100;
const PSD_BOUNDS = [-5, -0.3];
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

function get_shot_contribution(start, end) {
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

function generate_series(rate = 1, shot_duration = 1) {
    let fourier_real = Array(PSD_FREQS.length).fill(0);
    let fourier_imag = Array(PSD_FREQS.length).fill(0);
    let series = Array(OBSERVATION_STEPS).fill(0);
    let n_events = 0;
    let tau = rng.exponential(rate);
    let event_time = tau;
    while (event_time < OBSERVATION_TIME) {
        let from = Math.ceil(event_time / PERIOD);
        let to = Math.floor((event_time + shot_duration) / PERIOD);
        for (let i = from; i < OBSERVATION_STEPS && i <= to; i += 1) {
            series[i] += 1;
        }
        n_events += 1;
        tau = rng.exponential(rate);
        event_time = event_time + tau;

        let shot_contrib = get_shot_contribution(
            event_time,
            event_time + shot_duration
        );
        fourier_real = fourier_real.map((v, i) => v + shot_contrib.real[i]);
        fourier_imag = fourier_imag.map((v, i) => v + shot_contrib.imag[i]);
    }
    let psd = Array(PSD_FREQS.length)
        .fill(0)
        .map((v, i) => {
            return (
                (2 *
                    (Math.pow(fourier_real[i], 2) +
                        Math.pow(fourier_imag[i], 2))) /
                OBSERVATION_TIME
            );
        });
    return {
        series: series,
        n_events: n_events,
        psd: psd,
    };
}

function get_theory(freqs, n_events, lambda, T) {
    let bar_nu = n_events / OBSERVATION_TIME;
    let const_term = 6 * bar_nu;
    return freqs.map((f) => {
        let omega = 2 * Math.PI * f;
        let omega_T = omega * T;
        return (const_term / Math.pow(omega, 2)) * (1 - Math.cos(omega_T));
    });
}

function run(rate = 1e-4, shot_duration = 1e2) {
    let series = generate_series(rate, shot_duration);

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
    let theory = get_theory(PSD_FREQS, series.n_events, rate, shot_duration);
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

function enforce_rate_limit() {
    let rate_exp = my_parse_float(document.getElementById("event_rate").value);
    let shot_exp = my_parse_float(
        document.getElementById("shot_duration").value
    );
    if (shot_exp > -rate_exp + 1) {
        document.getElementById("event_rate").value = -shot_exp + 1;
    }
}

// events
document.getElementById("generate").addEventListener("click", () => {
    let rate = Math.pow(
        10,
        my_parse_float(document.getElementById("event_rate").value)
    );
    let shot_duration = Math.pow(
        10,
        my_parse_float(document.getElementById("shot_duration").value)
    );
    run(rate, shot_duration);
});

document.getElementById("event_rate").addEventListener("change", () => {
    enforce_rate_limit();
});
document.getElementById("shot_duration").addEventListener("change", () => {
    enforce_rate_limit();
});
