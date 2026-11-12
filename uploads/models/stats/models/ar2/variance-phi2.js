const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const PHI_2_VALS = 301;
const PHI_2_MIN = -1.1;
const PHI_2_MAX = 1.1;
const PHI_2_STEP = (PHI_2_MAX - PHI_2_MIN) / (PHI_2_VALS - 1);
const PHI_2 = Array(PHI_2_VALS)
    .fill(null)
    .map((v, i) => PHI_2_MIN + i * PHI_2_STEP);
const VAR_INF = 200;
const VAR_NEG = -1;

let var_plot = new plotlyPlot(
    "variancePlot",
    ["ϕ2", "Var[x]"],
    [10, 15, 40, 60]
);
var_plot.setRanges(true, [-0.1, 15.1]);
var_plot.reset();

function calculate_stationary_var(phi_1, phi_2) {
    if (phi_2 < -1 || 1 - Math.abs(phi_1) < phi_2) {
        return VAR_NEG;
    }
    const numerator = 1 - phi_2;
    const denominator = (1 + phi_2) * (1 - phi_1 * phi_1 + phi_2 * (phi_2 - 2));
    let result = numerator / denominator;
    result = (isFinite(result) && result) || VAR_INF;
    return result;
}

const phi_1_input = document.getElementById("phi_1");
phi_1_input.addEventListener("change", () => replot());
function replot() {
    const phi_1 = my_parse_float(phi_1_input.value);
    const variances = PHI_2.map((v) => calculate_stationary_var(phi_1, v));
    var_plot.update([PHI_2], [variances]);
}
replot();
