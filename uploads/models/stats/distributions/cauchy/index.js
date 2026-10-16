const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const STEP_POINTS = 100;
const STEP_INTERVAL = 10;
let continue_flag = false;

let main_plot = new plotlyPlot("mainPlot", ["x", "lg[p(x)]"], [10, 15, 40, 60]);

const COLORS = ["#c11", "#05a"];

let sim_x_0 = 0;
let theory_x_0 = 0;
let sim_gamma = 1;
let theory_gamma = 1;
let sim_n_sum = 1;
let n_runs = 0;

const HISTOGRAM_POINTS = 100;
const HISTOGRAM_INTERVAL = 5;

function plot_histogram(cauchy_x_0, cauchy_gamma, norm_mean, norm_std) {
    const histogram_min = (-HISTOGRAM_INTERVAL + sim_x_0) * sim_n_sum;
    const histogram_max = (HISTOGRAM_INTERVAL + sim_x_0) * sim_n_sum;
    const histogram_step =
        (histogram_max - histogram_min) / (HISTOGRAM_POINTS + 1);
    const histogram_vals = Array(HISTOGRAM_POINTS)
        .fill(0)
        .map((v, i) => (i + 0.5) * histogram_step + histogram_min);

    const cauchy_pdf = histogram_vals.map((v) =>
        Math.log10(jStat.cauchy.pdf(v, cauchy_x_0, cauchy_gamma))
    );
    const norm_pdf = histogram_vals.map((v) =>
        Math.log10(jStat.normal.pdf(v, norm_mean, norm_std))
    );

    main_plot.setRanges(true, [
        Math.floor(Math.min(...cauchy_pdf) * 10) / 10 - 0.1,
        Math.ceil(Math.max(...cauchy_pdf, ...norm_pdf) * 10) / 10 + 0.1,
    ]);
    main_plot.update([histogram_vals], [cauchy_pdf, norm_pdf], "lines", COLORS);
}

// events
function update_plots() {
    const cauchy_x_0 = my_parse_float(
        document.getElementById("cauchy_x_0").value
    );
    const cauchy_gamma = my_parse_float(
        document.getElementById("cauchy_gamma").value
    );
    const norm_mean = my_parse_float(
        document.getElementById("norm_mean").value
    );
    const norm_std = my_parse_float(document.getElementById("norm_std").value);
    plot_histogram(cauchy_x_0, cauchy_gamma, norm_mean, norm_std);
}
document.querySelectorAll("#controlWrapper input").forEach((elem) => {
    elem.addEventListener("change", () => update_plots());
});

// onLoad
update_plots();
