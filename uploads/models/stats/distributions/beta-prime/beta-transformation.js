const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const N_SAMPLES = 3000;
const N_HISTOGRAM_POINTS = 101;

let xpdf_plot = new plotlyPlot("xpdfPlot", ["x", "p(x)"]);
let ypdf_plot = new plotlyPlot("ypdfPlot", ["lg[y]", "lg[p(y)]"]);

const COLORS = ["#c11", "#094", "#666"];

function beta_pdf(x, alpha, beta) {
    const norm = jStat.betafn(alpha, beta);
    return x.map(
        (v) => (Math.pow(v, alpha - 1) * Math.pow(1 - v, beta - 1)) / norm
    );
}

function beta_prime_pdf(lg_y, alpha, beta) {
    const norm = Math.log10(jStat.betafn(alpha, beta));
    return lg_y.map(
        (v) =>
            (alpha - 1) * v -
            (alpha + beta) * Math.log10(1 + Math.pow(10, v)) -
            norm
    );
}

function generate() {
    const alpha = my_parse_float(document.getElementById("alpha").value);
    const beta = my_parse_float(document.getElementById("beta").value);

    const beta_samples = Array(N_SAMPLES)
        .fill(null)
        .map(() => jStat.beta.sample(alpha, beta));
    const ratio_samples = beta_samples.map((v) => Math.log10(v / (1 - v)));

    const hist_beta_min = 0;
    const hist_beta_max = 1;
    const hist_beta_step =
        (hist_beta_max - hist_beta_min) / (N_HISTOGRAM_POINTS - 1);
    const hist_beta_vals = Array(N_HISTOGRAM_POINTS)
        .fill(null)
        .map((_, i) => hist_beta_min + hist_beta_step * i);

    let beta_hist = Array(N_HISTOGRAM_POINTS).fill(0);
    beta_samples.forEach((v) => {
        let idx = Math.floor((v - hist_beta_min) / hist_beta_step);
        beta_hist[idx] += 1;
    });
    beta_hist = beta_hist.map((v) => v / (N_SAMPLES * hist_beta_step));

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

    const theory_beta_hist = beta_pdf(hist_beta_vals, alpha, beta);
    const theory_ratio_hist = beta_prime_pdf(hist_ratio_vals, alpha, beta);

    xpdf_plot.update([hist_beta_vals], [beta_hist, theory_beta_hist], "lines", [
        COLORS[0],
        COLORS[2],
    ]);
    ypdf_plot.update(
        [hist_ratio_vals],
        [ratio_hist, theory_ratio_hist],
        "lines",
        [COLORS[1], COLORS[2]]
    );
}

// events
document.getElementById("generate").addEventListener("click", () => generate());
