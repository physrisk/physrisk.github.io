const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let main_plot = new plotlyPlot("mainPlot", ["t", "P(t)"]);

const N_POINTS = 1000;
const SHOW_TIME = 100;
const COLORS = [
    "#666",
    "#c11",
    "#d70",
    "#8a0",
    "#094",
    "#0ac",
    "#666",
    "#05a",
    "#85f",
];

function simulate_verhulst(n, dt, p_0, a, k) {
    let results = Array(n).fill(p_0);
    for (let i = 1; i < results.length; i += 1) {
        results[i] =
            results[i - 1] + a * results[i - 1] * (1 - results[i - 1] / k) * dt;
        if (results[i] < 0) {
            results[i] = results[i - 1] / 2;
        }
    }
    return results;
}

function update_plot() {
    const alpha = my_parse_float(document.getElementById("alpha").value);
    const K = my_parse_float(document.getElementById("K").value);

    const n_trajectories = COLORS.length;
    const dP = K / (n_trajectories - 3);
    const P_0 = Array(n_trajectories)
        .fill(null)
        .map((_, i) => i * dP);

    const dt = SHOW_TIME / (N_POINTS - 1);
    const time = Array(N_POINTS)
        .fill(null)
        .map((_, i) => i * dt);
    const vals = P_0.map((v) => simulate_verhulst(N_POINTS, dt, v, alpha, K));

    main_plot.update([time], vals, "lines", COLORS);
}

// events
document.getElementById("alpha").addEventListener("change", update_plot);
document.getElementById("K").addEventListener("change", update_plot);

// onload
window.addEventListener("load", update_plot);
