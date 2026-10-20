const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const PHI_1_VALS = 301;
const PHI_1_MIN = -2.1;
const PHI_1_MAX = 2.1;
const PHI_1_STEP = (PHI_1_MAX - PHI_1_MIN) / (PHI_1_VALS - 1);
const PHI_1 = Array(PHI_1_VALS)
    .fill(null)
    .map((v, i) => PHI_1_MIN + i * PHI_1_STEP);
const VAR_INF = 200;
const VAR_NEG = -1;

let var_plot = new plotlyPlot(
    "variancePlot",
    ["ϕ1", "Var[x]"],
    [10, 15, 40, 60]
);
var_plot.setRanges(true, [-0.1, 15.1]);
var_plot.reset();

function calculate_stationary_var(phi_1, phi_2) {
    if (phi_1 < -1 + phi_2 || 1 - phi_2 < phi_1) {
        return VAR_NEG;
    }
    const numerator = 1 - phi_2;
    const denominator = (1 + phi_2) * (1 - phi_1 * phi_1 + phi_2 * (phi_2 - 2));
    let result = numerator / denominator;
    result = (isFinite(result) && result) || VAR_INF;
    return result;
}

const phi_2_input = document.getElementById("phi_2");
phi_2_input.addEventListener("change", () => replot());
function replot() {
    const phi_2 = my_parse_float(phi_2_input.value);
    const variances = PHI_1.map((v) => calculate_stationary_var(v, phi_2));
    var_plot.update([PHI_1], [variances]);
}
replot();
