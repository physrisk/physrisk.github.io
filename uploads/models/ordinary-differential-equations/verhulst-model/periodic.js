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
    "#000",
];

function simulate_verhulst_variable_k(n, dt, p_0, a, k_arr) {
    let results = Array(n).fill(p_0);
    for (let i = 1; i < results.length; i += 1) {
        results[i] =
            results[i - 1] +
            a * results[i - 1] * (1 - results[i - 1] / k_arr[i]) * dt;
        if (results[i] < 0) {
            results[i] = results[i - 1] / 2;
        }
    }
    return results;
}

function update_plot(event) {
    const alpha = my_parse_float(document.getElementById("alpha").value);
    let K_min = my_parse_float(document.getElementById("K_min").value);
    let K_max = my_parse_float(document.getElementById("K_max").value);
    if (K_min > K_max) {
        if (event.target.id == "K_max") {
            K_min = K_max;
            document.getElementById("K_min").value = K_min;
        } else {
            K_max = K_min;
            document.getElementById("K_max").value = K_max;
        }
    }
    const K_amplitude = K_max - K_min;
    const K_period = my_parse_float(document.getElementById("K_period").value);

    const n_trajectories = COLORS.length - 1;
    const dP = (K_max + K_min) / (2 * (n_trajectories - 3));
    const P_0 = Array(n_trajectories)
        .fill(null)
        .map((_, i) => i * dP);

    const dt = SHOW_TIME / (N_POINTS - 1);
    const time = Array(N_POINTS)
        .fill(null)
        .map((_, i) => i * dt);
    const K_vals = time.map(
        (v) =>
            K_min +
            (K_amplitude / 2) * (1 + Math.cos((2 * Math.PI * v) / K_period))
    );
    let vals = P_0.map((v) =>
        simulate_verhulst_variable_k(N_POINTS, dt, v, alpha, K_vals)
    );
    vals.push(K_vals);

    main_plot.update([time], vals, "lines", COLORS);
}

// events
document.getElementById("alpha").addEventListener("change", update_plot);
document.getElementById("K_min").addEventListener("change", update_plot);
document.getElementById("K_max").addEventListener("change", update_plot);
document.getElementById("K_period").addEventListener("change", update_plot);

// onload
window.addEventListener("load", update_plot);
