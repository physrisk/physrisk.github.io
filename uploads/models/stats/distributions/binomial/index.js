const N_SAMPLES = 100;
const STEP_INTERVAL = 300;
let continue_flag = false;

let pdf_plot = new plotlyPlot("pdfPlot", ["k", "p(k)"]);
pdf_plot.setPlotType("bar");

let outcome_plot = document.getElementById("outcomePlot");
let outcome_plot_ctx = outcome_plot.getContext("2d");

const COLORS = ["#c11", "#666"];
const BALL_COLORS = ["#00f", "#f00"];
const SPACE_COLOR = "#666";
const BALL_RADIUS = 17;
const BALL_SPACE = 6;
const N_SHOW_ROWS = 3;

let n_successes, n_failures, n_experiments;
let histogram_vals = [];
let histogram_counts = [];
let theory_counts = [];

function draw_single_sample(n, n_s, n_f) {
    const dummy_result = Array(n).fill(null);
    if (n_s <= 0 && n_f <= 0) {
        return dummy_result;
    }
    const prob = n_s / (n_s + n_f);
    return dummy_result.map(() => (Math.random() < prob ? 1 : 0));
}

function visualize_sample(ctx, x_pos, y_pos, single_sample) {
    single_sample.forEach((v, i) => {
        ctx.beginPath();
        if (v !== null) {
            ctx.arc(
                x_pos + BALL_RADIUS + (2 * BALL_RADIUS + BALL_SPACE) * i,
                y_pos,
                BALL_RADIUS,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = BALL_COLORS[v];
            ctx.fill();
        } else {
            ctx.arc(
                x_pos + BALL_RADIUS + (2 * BALL_RADIUS + BALL_SPACE) * i,
                y_pos,
                BALL_RADIUS,
                0,
                Math.PI
            );
            ctx.strokeStyle = SPACE_COLOR;
            ctx.stroke();
        }
    });
}

function visualize_experiments(sample) {
    outcome_plot_ctx.clearRect(0, 0, outcome_plot.width, outcome_plot.height);
    const group_plot_size =
        2 * n_experiments * BALL_RADIUS + (n_experiments - 1) * BALL_SPACE;
    const n_show_cols = Math.floor(10 / n_experiments);
    const col_space =
        (outcome_plot.width - 2 * BALL_SPACE - group_plot_size * n_show_cols) /
        n_show_cols;
    for (let row_idx = 0; row_idx < N_SHOW_ROWS; row_idx += 1) {
        for (let col_idx = 0; col_idx < n_show_cols; col_idx += 1) {
            visualize_sample(
                outcome_plot_ctx,
                col_space * 0.5 + (col_space + group_plot_size) * col_idx,
                BALL_SPACE +
                    BALL_RADIUS +
                    row_idx * (2 * BALL_RADIUS + BALL_SPACE),
                sample[col_idx * N_SHOW_ROWS + row_idx]
            );
        }
    }
}

function update_histogram() {
    const n_total = jStat.sum(histogram_counts);
    pdf_plot.update(
        [histogram_vals],
        [histogram_counts.map((v) => v / n_total), theory_counts],
        "markers",
        COLORS
    );
}

function frame() {
    const sample = Array(N_SAMPLES)
        .fill(null)
        .map(() => draw_single_sample(n_experiments, n_successes, n_failures));
    const results = Array(N_SAMPLES)
        .fill(null)
        .map((_, i) => jStat.sum(sample[i]));
    results.forEach((v) => (histogram_counts[v] += 1));

    update_histogram();
    visualize_experiments(sample);

    if (continue_flag) {
        window.setTimeout(frame, STEP_INTERVAL);
    } else {
        start_btn.disabled = false;
    }
}

function initialize() {
    n_successes = parseInt(document.getElementById("n_successes").value);
    n_failures = parseInt(document.getElementById("n_failures").value);
    n_experiments = parseInt(document.getElementById("n_experiments").value);

    histogram_vals = Array(n_experiments + 1)
        .fill(null)
        .map((_, i) => i);
    histogram_counts = Array(n_experiments + 1).fill(0);

    const n_total = n_successes + n_failures;
    const prob = n_successes / n_total;
    theory_counts = histogram_vals.map((v) =>
        jStat.binomial.pdf(v, n_experiments, prob)
    );
}

// events
let start_btn = document.getElementById("start");
start_btn.addEventListener("click", () => {
    initialize();
    continue_flag = true;
    start_btn.disabled = true;
    continue_btn.innerHTML = "Pause";
    frame();
});
let continue_btn = document.getElementById("continue");
continue_btn.addEventListener("click", () => {
    continue_flag = !continue_flag;
    if (continue_flag) {
        start_btn.disabled = true;
        continue_btn.innerHTML = "Pause";
        frame();
    } else {
        start_btn.disabled = false;
        continue_btn.innerHTML = "Continue";
    }
});

// onload
window.addEventListener("load", () => {
    n_experiments = parseInt(document.getElementById("n_experiments").value);
    const sample = Array(N_SAMPLES)
        .fill(null)
        .map(() => draw_single_sample(n_experiments, 0, 0));
    visualize_experiments(sample);
});
