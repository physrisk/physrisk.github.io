const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));
const my_arccot = (x) => Math.PI / 2 - Math.atan(x);

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

let psd_plot = new plotlyPlot(
    "psdPlot",
    ["lg[f]", "lg[S(f)]"],
    [10, 15, 40, 60]
);

let combined = 0;
let combined_psd = Array(PSD_FREQS.length).fill(0);
let continue_flag = false;
const STEPS = 100;
const TIMEOUT = 100;

const MARKERS = ["markers", "lines"];
const COLORS = ["#c11", "#444"];

function get_theory(freqs, min_rate, max_rate) {
    return freqs.map((f) => {
        let half_omega = Math.PI * f;
        let diff_term =
            my_arccot(half_omega / max_rate) - my_arccot(half_omega / min_rate);
        let norm_term = 1 / (max_rate - min_rate);
        return (norm_term * diff_term) / half_omega;
    });
}

function get_lorentzian(freqs, generation_rate, recombination_rate) {
    let rate_sum_sq = Math.pow(generation_rate + recombination_rate, 2);
    return freqs.map((f) => {
        let omega = 2 * Math.PI * f;
        return 4 / (rate_sum_sq + Math.pow(omega, 2));
    });
}

function run(min_rate = 1e-6, max_rate = 1) {
    let generation_rate = 0;
    let recombination_rate = 0;
    let psd = [];

    for (let step = 0; step < STEPS; step += 1) {
        generation_rate = rng.uniform(min_rate, max_rate);
        recombination_rate = generation_rate;
        psd = get_lorentzian(PSD_FREQS, generation_rate, recombination_rate);
        combined_psd = combined_psd.map((v, i) => v + psd[i]);
    }
    combined = combined + STEPS;

    let freqs = PSD_FREQS.map((v) => Math.log10(v));
    let theory = get_theory(PSD_FREQS, min_rate, max_rate);
    psd_plot.update(
        [freqs, freqs],
        [
            combined_psd.map((v) => Math.log10(v / combined)),
            theory.map((v) => Math.log10(v)),
        ],
        MARKERS,
        COLORS
    );

    psd = null;
    delete psd;

    if (continue_flag) {
        window.setTimeout(() => {
            run(min_rate, max_rate);
        }, TIMEOUT);
    } else {
        generate_btn.disabled = false;
    }
}

// events
let generate_btn = document.getElementById("generate");
let stop_btn = document.getElementById("stop");

generate_btn.addEventListener("click", () => {
    let min_rate = Math.pow(
        10,
        my_parse_float(document.getElementById("min_rate").value)
    );
    let max_rate = Math.pow(
        10,
        my_parse_float(document.getElementById("max_rate").value)
    );
    if (min_rate > max_rate) {
        let new_exp = Math.log10(max_rate) - 1;
        min_rate = Math.pow(10, new_exp);
        document.getElementById("min_rate").value = parseFloat(
            new_exp.toFixed(2)
        );
    }
    combined = 0;
    combined_psd = Array(PSD_FREQS.length).fill(0);
    continue_flag = true;
    generate_btn.disabled = true;
    stop_btn.disabled = false;
    run(min_rate, max_rate);
});
stop_btn.addEventListener("click", () => {
    continue_flag = false;
    stop_btn.disabled = true;
});
