const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let pdf_plot = new plotlyPlot("pdfPlot", ["x", "p(x)"], [10, 15, 40, 60]);
let cdf_plot = new plotlyPlot("cdfPlot", ["x", "F(x)"], [10, 15, 40, 60]);

const COLORS = ["#c11", "#666"];

const X_POINTS = 101;

function update_plots(mu, sigma) {
    const x_bounds = [-1.5, 1.5];
    const x_step = (x_bounds[1] - x_bounds[0]) / (X_POINTS - 1);
    const x_vals = Array(X_POINTS)
        .fill(null)
        .map((_, i) => x_bounds[0] + x_step * i);

    const pdf_vals = x_vals.map((v) => jStat.normal.pdf(v, mu, sigma));
    const cdf_vals = x_vals.map((v) => jStat.normal.cdf(v, mu, sigma));

    let delta_vals = Array(x_vals.length).fill(0);
    const zero_index = x_vals.findIndex((x) => Math.abs(x - mu) < x_step / 2);
    delta_vals[zero_index] = pdf_vals[zero_index] * 2;

    let theta_vals = x_vals.map((_, i) => (i >= zero_index ? 1 : 0));

    pdf_plot.update([x_vals], [pdf_vals, delta_vals], "lines", COLORS);
    cdf_plot.update([x_vals], [cdf_vals, theta_vals], "lines", COLORS);
}

// events
let mu_input = document.getElementById("mu");
let sigma_input = document.getElementById("sigma");
function on_update() {
    const mu = my_parse_float(mu_input.value);
    const sigma = Math.pow(10, 0.5 * my_parse_float(sigma_input.value));

    update_plots(mu, sigma);
}
mu_input.addEventListener("change", on_update);
sigma_input.addEventListener("change", on_update);

// on_load
on_update();
