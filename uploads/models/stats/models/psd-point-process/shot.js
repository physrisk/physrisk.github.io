const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const OBSERVATION_STEPS = 1048576;
const PSD_POINTS = 128;
const PERIOD = 1;
const OBSERVATION_TIME = OBSERVATION_STEPS * PERIOD;

let series_plot = new plotlyPlot("seriesPlot", ["t", "I(t)"], [10, 15, 40, 60]);
let psd_plot = new plotlyPlot(
    "psdPlot",
    ["lg[f]", "lg[S(f)]"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#444"];

function generate_series(rate = 1, shot_duration = 1) {
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
    }
    return {
        series: series,
        n_events: n_events,
    };
}

function get_psd(series) {
    let bin_factor = Math.pow(OBSERVATION_STEPS, 1 / (PSD_POINTS + 1));
    let bin_edges = jStat.unique(
        Array(PSD_POINTS)
            .fill(null)
            .map((v, i) => {
                return Math.floor(Math.pow(bin_factor, i + 1));
            })
    );
    let bin_mids = bin_edges.map((v, i) => {
        if (i == 0) {
            return v / OBSERVATION_TIME;
        }
        return (v + bin_edges[i - 1] + 1) / (2 * OBSERVATION_TIME);
    });

    let series_mean = series.n_events / series.series.length;
    let normalized_series = series.series.map((v) => v - series_mean);
    let raw_psd = real_psd(normalized_series);
    let norm_psd = rescale_psd(
        raw_psd.map((v) => (2 * Math.PI * v) / OBSERVATION_TIME),
        bin_edges
    );
    return {
        freq: bin_mids,
        psd: norm_psd,
    };
}

function get_theory(freqs, n_events, lambda, T) {
    let bar_nu = n_events / OBSERVATION_TIME;
    let const_term = 12 * bar_nu;
    return freqs.map((f) => {
        let omega = 2 * Math.PI * f;
        let omega_T = omega * T;
        return (const_term / Math.pow(omega, 2)) * (1 - Math.cos(omega_T));
    });
}

function run(rate = 1e-4, shot_duration = 1e2) {
    let series = generate_series(rate, shot_duration);
    let psd = get_psd(series);

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

    let freqs = psd.freq.map((v) => Math.log10(v));
    let theory = get_theory(psd.freq, series.n_events, rate, shot_duration);
    psd_plot.update(
        [freqs, freqs],
        [psd.psd.map((v) => Math.log10(v)), theory.map((v) => Math.log10(v))],
        "lines",
        COLORS
    );
}

function enforce_rate_limit() {
    let rate_exp = my_parse_float(document.getElementById("event_rate").value);
    let shot_exp = my_parse_float(
        document.getElementById("shot_duration").value
    );
    if (shot_exp > -rate_exp) {
        document.getElementById("event_rate").value = -shot_exp;
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
