let rng = new Random();

const N_SAMPLES = 1000;
const STEP_INTERVAL = 100;
let continue_flag = false;

let pdf_plot = new plotlyPlot("pdfPlot", ["k", "p(k)"], [10, 15, 40, 60]);
pdf_plot.setRanges(true, [-0.1, 1.1]);
pdf_plot.reset();

const COLORS = ["#c11", "#05a"];

let hist_taken = 0;
let hist_vals = [];
let hist_binom = [];
let hist_hyper = [];

let n_balls = 5;
let n_reds = 2;

function do_draw_ball(n_balls, n_reds) {
    return rng.uniform(0, n_balls) <= n_reds;
}

function perform_single_draw(n_draws, n_balls, n_reds, no_replace = true) {
    let current_balls = n_balls;
    let current_reds = n_reds;
    let drawn_reds = 0;
    let drawn_balls = 0;
    if (n_draws > n_balls && no_replace) {
        n_draws = n_balls;
    }
    for (; drawn_balls < n_draws; drawn_balls = drawn_balls + 1) {
        let is_red = do_draw_ball(current_balls, current_reds);
        if (is_red) {
            if (no_replace) {
                current_reds = current_reds - 1;
            }
            drawn_reds = drawn_reds + 1;
        }
        if (no_replace) {
            current_balls = current_balls - 1;
        }
    }
    return drawn_reds;
}

function perform_multi_draw(
    n_steps,
    n_draws,
    n_balls,
    n_reds,
    no_replace = true
) {
    return Array(n_steps)
        .fill(null)
        .map(() => perform_single_draw(n_draws, n_balls, n_reds, no_replace));
}

function take_identical_samples(n_steps, n_draws, n_balls, n_reds) {
    let binom_sample = perform_multi_draw(
        n_steps,
        n_draws,
        n_balls,
        n_reds,
        true
    );
    let hyper_sample = perform_multi_draw(
        n_steps,
        n_draws,
        n_balls,
        n_reds,
        false
    );
    return [binom_sample, hyper_sample];
}

function update_histograms(histogram_max, binom_sample, hyper_sample) {
    hist_taken = 0;
    hist_vals = Array(histogram_max + 1)
        .fill(null)
        .map((v, i) => i);
    hist_binom = Array(histogram_max + 1).fill(0);
    hist_hyper = Array(histogram_max + 1).fill(0);

    let idx;
    for (idx = 0; idx < N_SAMPLES; idx += 1) {
        hist_binom[binom_sample[idx]] += 1;
        hist_hyper[hyper_sample[idx]] += 1;
    }
    hist_taken = hist_taken + N_SAMPLES;
}

function plot_histograms() {
    pdf_plot.update(
        [hist_vals, hist_vals],
        [
            hist_binom.map((v) => v / hist_taken),
            hist_hyper.map((v) => v / hist_taken),
        ],
        "lines",
        COLORS
    );
}

function frame(n_draws) {
    let binom_sample, hyper_sample;
    [binom_sample, hyper_sample] = take_identical_samples(
        N_SAMPLES,
        n_draws,
        n_balls,
        n_reds
    );

    update_histograms(n_balls, binom_sample, hyper_sample);

    plot_histograms();

    document.getElementById("pdfPlotTitleLabel").innerHTML = n_draws;

    if (continue_flag && n_draws < n_balls) {
        window.setTimeout(() => frame(n_draws + 1), STEP_INTERVAL);
    } else {
        iterate_btn.disabled = false;
        if (n_draws >= n_balls) {
            stop_btn.click();
        }
    }
}

// events
let iterate_btn = document.getElementById("iterate");
iterate_btn.addEventListener("click", () => {
    iterate_btn.disabled = true;
    stop_btn.disabled = false;
    continue_flag = true;

    n_balls = parseInt(document.getElementById("n_balls").value);
    n_reds = parseInt(document.getElementById("n_reds").value);

    if (n_reds > n_balls) {
        n_reds = n_balls;
    }
    document.getElementById("n_reds").value = n_reds;

    let n_draws = 1;
    frame(n_draws);
});
let stop_btn = document.getElementById("stop");
stop_btn.addEventListener("click", () => {
    stop_btn.disabled = true;
    continue_flag = false;
});
