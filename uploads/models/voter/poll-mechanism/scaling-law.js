const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const TAU_1_VALS = 301;
const TAU_1_MIN = -5;
const TAU_1_MAX = -1;
const TAU_1_STEP = (TAU_1_MAX - TAU_1_MIN) / (TAU_1_VALS - 1);
const TAU_1_LG = Array(TAU_1_VALS)
    .fill(null)
    .map((v, i) => TAU_1_MIN + i * TAU_1_STEP);
const TAU_1 = TAU_1_LG.map((v) => Math.pow(10, v));

let scaling_plot = new plotlyPlot(
    "scalingPlot",
    ["lg[τ]", "L(τ)"],
    [10, 15, 40, 60]
);
scaling_plot.reset();

function calculate_scaling_law(epsi_0, epsi_1, n_agents, tau) {
    const variance = calculate_stationary_var(epsi_0, epsi_1, n_agents, tau);
    const numerator =
        epsi_0 * epsi_1 * Math.pow(n_agents, 2) -
        Math.pow(epsi_0 + epsi_1, 2) * variance;
    const denominator =
        Math.pow(epsi_0 + epsi_1, 3) * variance -
        epsi_0 * epsi_1 * (epsi_0 + epsi_1) * n_agents;
    return numerator / denominator;
}

const epsi_0_input = document.getElementById("epsi_0");
epsi_0_input.addEventListener("change", () => replot());
const epsi_1_input = document.getElementById("epsi_1");
epsi_1_input.addEventListener("change", () => replot());
const n_agents_input = document.getElementById("n_agents");
n_agents_input.addEventListener("change", () => replot());
function replot() {
    const epsi_0 = my_parse_float(epsi_0_input.value);
    const epsi_1 = my_parse_float(epsi_1_input.value);
    const n_agents = Math.pow(10, my_parse_float(n_agents_input.value));
    const scaling_law = TAU_1.map((v) =>
        calculate_scaling_law(epsi_0, epsi_1, n_agents, v)
    );
    scaling_plot.update([TAU_1_LG], [scaling_law]);
}
replot();
