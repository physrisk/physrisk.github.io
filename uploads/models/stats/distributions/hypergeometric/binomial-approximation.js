const N_SAMPLES = 100;
const STEP_INTERVAL = 300;
let continue_flag = false;

let pdf_plot = new plotlyPlot("pdfPlot", ["k", "p(k)"]);
pdf_plot.setPlotType("bar");

let outcome_plot = document.getElementById("outcomePlot");
let outcome_plot_ctx = outcome_plot.getContext("2d");

const COLORS = ["#c11", "#f89"];
const BALL_COLORS = [
    "#00f",
    "#f00",
    "rgba(60, 60, 180, 0.5)",
    "rgba(180, 60, 60, 0.5)",
];
const SPACE_COLOR = "#666";
const BALL_RADIUS = 17;
const BALL_SPACE = 6;
const N_SHOW_ROWS = 3;

let n_successes, n_failures, n_experiments;
let histogram_vals = [];
let replacement_histogram_counts = [];
let no_replacement_histogram_counts = [];

function draw_single_sample(n, n_s, n_f, with_replacement = true) {
    const dummy_result = Array(n).fill(null);
    if (n_s <= 0 && n_f <= 0) {
        return dummy_result;
    }
    if (with_replacement) {
        const prob = n_s / (n_s + n_f);
        return dummy_result.map(() => (Math.random() < prob ? 1 : 0));
    } else {
        let n_s_remaining = n_s;
        let n_f_remaining = n_f;
        return dummy_result.map(() => {
            const n_balls_remaining = n_s_remaining + n_f_remaining;
            if (n_balls_remaining === 0) return null;
            const was_success_drawn =
                Math.random() < n_s_remaining / n_balls_remaining;
            if (was_success_drawn) {
                n_s_remaining -= 1;
                return 1;
            } else {
                n_f_remaining -= 1;
                return 0;
            }
        });
    }
}

function visualize_sample(ctx, x_pos, y_pos, single_sample, n_balls_show) {
    const full_balls_show = Math.floor(n_balls_show);
    const half_balls_show = Math.ceil(n_balls_show) - full_balls_show;
    single_sample.forEach((v, i) => {
        if (i >= full_balls_show + half_balls_show) return;
        const angle_start = i < full_balls_show ? 0 : Math.PI / 2;
        const angle_end = i < full_balls_show ? 2 * Math.PI : (3 * Math.PI) / 2;
        if (v !== null) {
            ctx.beginPath();
            ctx.arc(
                x_pos + BALL_RADIUS + (2 * BALL_RADIUS + BALL_SPACE) * i,
                y_pos,
                BALL_RADIUS,
                angle_start,
                angle_end
            );
            ctx.fillStyle = BALL_COLORS[v + (i < full_balls_show ? 0 : 2)];
            ctx.fill();
        } else {
            ctx.beginPath();
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

function visualize_experiments(left_sample, right_sample) {
    outcome_plot_ctx.clearRect(0, 0, outcome_plot.width, outcome_plot.height);
    const n_balls_shown = n_experiments <= 5 ? n_experiments : 5.5;
    const group_plot_size =
        2 * n_balls_shown * BALL_RADIUS + (n_balls_shown - 1) * BALL_SPACE;
    const n_show_cols = 2;
    const col_space =
        (outcome_plot.width - 2 * BALL_SPACE - group_plot_size * n_show_cols) /
        n_show_cols;
    for (let row_idx = 0; row_idx < N_SHOW_ROWS; row_idx += 1) {
        visualize_sample(
            outcome_plot_ctx,
            col_space * 0.5,
            BALL_SPACE + BALL_RADIUS + row_idx * (2 * BALL_RADIUS + BALL_SPACE),
            left_sample[row_idx],
            n_balls_shown
        );
        visualize_sample(
            outcome_plot_ctx,
            col_space * 0.5 + (col_space + group_plot_size),
            BALL_SPACE + BALL_RADIUS + row_idx * (2 * BALL_RADIUS + BALL_SPACE),
            right_sample[row_idx],
            n_balls_shown
        );
    }
}

function update_histogram() {
    const n_rep = jStat.sum(replacement_histogram_counts);
    const n_norep = jStat.sum(no_replacement_histogram_counts);
    pdf_plot.update(
        [histogram_vals],
        [
            replacement_histogram_counts.map((v) => v / n_rep),
            no_replacement_histogram_counts.map((v) => v / n_norep),
        ],
        "markers",
        COLORS
    );
}

function frame() {
    const replacement_sample = Array(N_SAMPLES)
        .fill(null)
        .map(() =>
            draw_single_sample(n_experiments, n_successes, n_failures, true)
        );
    const replacement_results = Array(N_SAMPLES)
        .fill(null)
        .map((_, i) => jStat.sum(replacement_sample[i]));
    replacement_results.forEach((v) => (replacement_histogram_counts[v] += 1));

    const no_replacement_sample = Array(N_SAMPLES)
        .fill(null)
        .map(() =>
            draw_single_sample(n_experiments, n_successes, n_failures, false)
        );
    const no_replacement_results = Array(N_SAMPLES)
        .fill(null)
        .map((_, i) => jStat.sum(no_replacement_sample[i]));
    no_replacement_results.forEach(
        (v) => (no_replacement_histogram_counts[v] += 1)
    );

    update_histogram();
    visualize_experiments(replacement_sample, no_replacement_sample);

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
    const n_balls = n_successes + n_failures;
    if (n_balls < n_experiments) {
        n_experiments = n_balls;
        document.getElementById("n_experiments").value = n_balls;
    }

    histogram_vals = Array(n_experiments + 1)
        .fill(null)
        .map((_, i) => i);
    replacement_histogram_counts = Array(n_experiments + 1).fill(0);
    no_replacement_histogram_counts = Array(n_experiments + 1).fill(0);
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
    visualize_experiments(sample, sample);
});
