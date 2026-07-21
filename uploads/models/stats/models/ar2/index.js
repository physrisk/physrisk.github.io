const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

const SERIES_POINTS = 201;
const TIME = Array(SERIES_POINTS)
    .fill(null)
    .map((v, i) => i);
const NOISE = Array(SERIES_POINTS)
    .fill(null)
    .map(() => rng.normal(0, 1));

let series_plot = new plotlyPlot("seriesPlot", ["t", "x(t)"], [10, 15, 40, 60]);
series_plot.setRanges(true, [-15.1, 15.1]);
series_plot.reset();

let plot_title = document.getElementById("plotTitle");

function calculate_series(phi_1, phi_2) {
    const series = new Array(SERIES_POINTS).fill(0);

    series[0] = NOISE[0];
    series[1] = phi_1 * series[0] + NOISE[1];
    for (let t = 2; t < SERIES_POINTS; t += 1) {
        series[t] = phi_1 * series[t - 1] + phi_2 * series[t - 2] + NOISE[t];
    }

    return series;
}

function is_non_stationary(phi_1, phi_2) {
    if (
        phi_1 < -1 + phi_2 ||
        1 - phi_2 < phi_1 ||
        phi_2 < -1 ||
        1 - Math.abs(phi_1) < phi_2
    ) {
        return true;
    }
    return false;
}

const phi_1_input = document.getElementById("phi_1");
phi_1_input.addEventListener("change", () => replot());
const phi_2_input = document.getElementById("phi_2");
phi_2_input.addEventListener("change", () => replot());
function replot() {
    const phi_1 = my_parse_float(phi_1_input.value);
    const phi_2 = my_parse_float(phi_2_input.value);
    const series = calculate_series(phi_1, phi_2);
    series_plot.update([TIME], [series]);

    const var_series = jStat.variance(series);
    const stationarity_flag = is_non_stationary(phi_1, phi_2);
    plot_title.innerHTML = `In ${stationarity_flag ? "non-" : ""}stationary regime (Var[x]=${stationarity_flag ? "???" : var_series.toFixed(2)})`;
}
replot();
