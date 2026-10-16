const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const N_SAMPLES = 10000;
const N_HISTOGRAM_POINTS = 101;

let xpdf_plot = new plotlyPlot("xpdfPlot", ["x", "p(x)"]);
let ypdf_plot = new plotlyPlot("ypdfPlot", ["lg[y]", "lg[p(y)]"]);

const COLORS = ["#c11", "#05a", "#094", "#666"];

function beta_prime_pdf(lg_x, alpha, beta) {
    const norm = Math.log10(jStat.betafn(alpha, beta));
    return lg_x.map(
        (v) =>
            (alpha - 1) * v -
            (alpha + beta) * Math.log10(1 + Math.pow(10, v)) -
            norm
    );
}

function generate() {
    const alpha_1 = my_parse_float(document.getElementById("alpha_1").value);
    const theta_1 = my_parse_float(document.getElementById("theta_1").value);
    const alpha_2 = my_parse_float(document.getElementById("alpha_2").value);
    const theta_2 = my_parse_float(document.getElementById("theta_2").value);

    const gamma_1_samples = Array(N_SAMPLES)
        .fill(null)
        .map(() => jStat.gamma.sample(alpha_1, theta_1));
    const gamma_2_samples = Array(N_SAMPLES)
        .fill(null)
        .map(() => jStat.gamma.sample(alpha_2, theta_2));

    const hist_gamma_min = 0;
    const hist_gamma_max = Math.max(...gamma_1_samples, ...gamma_2_samples);
    const hist_gamma_step =
        (hist_gamma_max - hist_gamma_min) / (N_HISTOGRAM_POINTS - 1);
    const hist_gamma_vals = Array(N_HISTOGRAM_POINTS)
        .fill(null)
        .map((_, i) => hist_gamma_min + hist_gamma_step * i);
    let gamma_1_hist = Array(N_HISTOGRAM_POINTS).fill(0);
    let gamma_2_hist = Array(N_HISTOGRAM_POINTS).fill(0);
    gamma_1_samples.forEach((v) => {
        let idx = Math.floor((v - hist_gamma_min) / hist_gamma_step);
        gamma_1_hist[idx] += 1;
    });
    gamma_2_samples.forEach((v) => {
        let idx = Math.floor((v - hist_gamma_min) / hist_gamma_step);
        gamma_2_hist[idx] += 1;
    });
    gamma_1_hist = gamma_1_hist.map((v) => v / (N_SAMPLES * hist_gamma_step));
    gamma_2_hist = gamma_2_hist.map((v) => v / (N_SAMPLES * hist_gamma_step));
    const theory_gamma_1_hist = hist_gamma_vals.map((v) =>
        jStat.gamma.pdf(v, alpha_1, theta_1)
    );
    const theory_gamma_2_hist = hist_gamma_vals.map((v) =>
        jStat.gamma.pdf(v, alpha_2, theta_2)
    );

    const ratio_samples = Array(N_SAMPLES)
        .fill(null)
        .map((_, i) => gamma_1_samples[i] / gamma_2_samples[i])
        .map((v) => Math.log10(v));
    const hist_ratio_max = Math.max(...ratio_samples);
    const hist_ratio_min = Math.max(
        Math.min(...ratio_samples),
        -hist_ratio_max
    );
    const hist_ratio_step =
        (hist_ratio_max - hist_ratio_min) / (N_HISTOGRAM_POINTS - 1);
    const hist_ratio_vals = Array(N_HISTOGRAM_POINTS)
        .fill(null)
        .map((_, i) => hist_ratio_min + i * hist_ratio_step);
    const hist_ratio_diffs = hist_ratio_vals.map((v, i, a) => {
        if (i == 0) {
            // estimate first bin width based on the next bin width
            return Math.pow(10, a[1]) - Math.pow(10, v);
        }
        return Math.pow(10, v) - Math.pow(10, a[i - 1]);
    });
    let ratio_hist = Array(N_HISTOGRAM_POINTS).fill(0);
    ratio_samples.forEach((v) => {
        let idx = Math.floor((v - hist_ratio_min) / hist_ratio_step);
        ratio_hist[idx] += 1;
    });
    ratio_hist = ratio_hist.map((v, i) =>
        Math.log10(v / (N_SAMPLES * hist_ratio_diffs[i]))
    );
    const theory_ratio_hist = beta_prime_pdf(hist_ratio_vals, alpha_1, alpha_2);

    xpdf_plot.update(
        [hist_gamma_vals],
        [gamma_1_hist, gamma_2_hist, theory_gamma_1_hist, theory_gamma_2_hist],
        "lines",
        [COLORS[0], COLORS[1], COLORS[3], COLORS[3]]
    );
    ypdf_plot.update(
        [hist_ratio_vals],
        [ratio_hist, theory_ratio_hist],
        "lines",
        [COLORS[2], COLORS[3]]
    );
}

// events
document.getElementById("generate").addEventListener("click", () => generate());
