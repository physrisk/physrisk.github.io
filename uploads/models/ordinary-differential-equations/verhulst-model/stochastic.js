const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let main_plot = new plotlyPlot("mainPlot", ["t", "P(t)"]);

const N_POINTS = 1000;
const SHOW_TIME = 100;
const COLORS = ["#c11", "#d70", "#8a0", "#094", "#0ac", "#05a", "#85f"];

const rng = new Random();
let NOISE = Array(COLORS.length).fill(Array(N_POINTS - 1).fill(null));
function regenerate_noise() {
    NOISE = NOISE.map((v) => v.map(() => rng.normal(0, 1)));
}
regenerate_noise();

function simulate_alpha(mu, sigma, dt, noise) {
    const sqrt_dt = Math.sqrt(dt);
    return Array(noise.length)
        .fill(null)
        .map((_, i) => mu + sigma * sqrt_dt * noise[i]);
}

function simulate_verhulst_stochastic_a(n, dt, p_0, a_arr, k) {
    let results = Array(n).fill(p_0);
    for (let i = 1; i < results.length; i += 1) {
        results[i] =
            results[i - 1] +
            a_arr[i - 1] * results[i - 1] * (1 - results[i - 1] / k) * dt;
        if (results[i] < 0) {
            results[i] = results[i - 1] / 2;
        }
    }
    return results;
}

function update_plot() {
    const mu = my_parse_float(document.getElementById("mu").value);
    const sigma = my_parse_float(document.getElementById("sigma").value);
    const P_0 = my_parse_float(document.getElementById("P_0").value);
    const K = my_parse_float(document.getElementById("K").value);

    const dt = SHOW_TIME / (N_POINTS - 1);
    const time = Array(N_POINTS)
        .fill(null)
        .map((_, i) => i * dt);
    let vals = COLORS.map((_, i) => {
        const alpha = simulate_alpha(mu, sigma, dt, NOISE[i]);
        return simulate_verhulst_stochastic_a(N_POINTS, dt, P_0, alpha, K);
    });

    main_plot.update([time], vals, "lines", COLORS);
}

// events
document.getElementById("mu").addEventListener("change", update_plot);
document.getElementById("sigma").addEventListener("change", update_plot);
document.getElementById("K").addEventListener("change", update_plot);
document.getElementById("P_0").addEventListener("change", update_plot);
document.getElementById("regenerate").addEventListener("click", () => {
    regenerate_noise();
    update_plot();
});

// onload
window.addEventListener("load", update_plot);
