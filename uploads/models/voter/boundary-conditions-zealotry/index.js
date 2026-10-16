const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let models = [];
const N_AGENTS = 1000;
const MIN_FREE_AGENTS = 100;
const COLORS = ["#c11", "#05a"];

const TIME_POINTS = 128;
const time_step = 1 / 64;
let last_time = 0;
let n_steps = 0;
let series = [];

let time_series_plot = new plotlyPlot("timeSeries", ["t", "X(t)"]);
time_series_plot.setRanges(true, [0, N_AGENTS]);
time_series_plot.reset();

let hist_plot = new plotlyPlot("histPlot", ["X", "lg[p(X)]"]);
hist_plot.reset();
let hist = [];
const PDF_POINTS = 100;

let continue_flag = false;
const FRAME_INTERVAL = 30;
const FRAME_STEPS = 4;

function frame() {
    let last_x = [];
    for (let i = 0; i < FRAME_STEPS; i += 1) {
        last_time = last_time + time_step;
        last_x = models.map((v) => v.step(last_time));
        append_time_series_data(last_time, last_x);
    }
    n_steps += FRAME_STEPS;

    plot_figures();

    if (continue_flag) {
        window.setTimeout(frame, FRAME_INTERVAL);
    }
}

function plot_figures() {
    const _series_data = jStat.transpose(series);
    time_series_plot.update(
        [_series_data[0]],
        [_series_data[1], _series_data[2]],
        "lines",
        COLORS
    );

    const _hist_data = jStat.transpose(hist);
    const _pdf_points = Math.min(PDF_POINTS, _hist_data[0].length / 2);
    const _pdf_1 = jStat.transpose(
        commonFunctions.pdfModification(
            _hist_data[1],
            false,
            _hist_data[0][0] - 0.5,
            _hist_data[0][_hist_data[0].length - 1] + 0.5,
            _pdf_points,
            _hist_data[0][0],
            1,
            n_steps
        )
    );
    const _pdf_2 = jStat.transpose(
        commonFunctions.pdfModification(
            _hist_data[2],
            false,
            _hist_data[0][0],
            _hist_data[0][_hist_data[0].length - 1],
            _pdf_points,
            _hist_data[0][0],
            1,
            n_steps
        )
    );
    hist_plot.update(
        [_pdf_1[0], _pdf_2[0]],
        [
            _pdf_1[1].map((v) => Math.log10(v)),
            _pdf_2[1].map((v) => Math.log10(v)),
        ],
        "lines",
        COLORS
    );
}

function append_time_series_data(t, x) {
    series.push([t, ...x]);
    if (series.length > TIME_POINTS) {
        series.splice(0, 1);
    }

    hist[x[0] - hist[0][0]][1] += 1;
    hist[x[1] - hist[0][0]][2] += 1;
}

function initialize() {
    let epsi_0 = my_parse_float(document.getElementById("epsi_0").value);
    let epsi_1 = my_parse_float(document.getElementById("epsi_1").value);
    let z_0 = parseInt(document.getElementById("z_0").value);
    let z_1 = parseInt(document.getElementById("z_1").value);

    const x_initial = Math.floor((N_AGENTS - z_0 - z_1) / 2) + z_1;

    time_series_plot.setRanges(true, [z_1 - 1, N_AGENTS - z_0 + 1]);

    models[0] = new NoisyVoterModel(
        epsi_0,
        epsi_1,
        x_initial,
        z_0,
        z_1,
        -1,
        -1,
        N_AGENTS
    );
    models[1] = new NoisyVoterModel(
        epsi_0,
        epsi_1,
        x_initial,
        0,
        0,
        z_1,
        N_AGENTS - z_0,
        N_AGENTS
    );

    last_time = 0;
    n_steps = 0;
    series = [[last_time, x_initial, x_initial]];

    hist = new Array(N_AGENTS - z_0 - z_1 + 1)
        .fill([0, 0, 0])
        .map((v, i) => [z_1 + i, 0, 0]);
}

// events
let start_btn = document.getElementById("start");
start_btn.addEventListener("click", () => {
    resume_btn.disabled = false;

    resume_btn.innerHTML = "Pause";
    start_btn.disabled = true;
    continue_flag = true;

    initialize();
    frame();
});
let resume_btn = document.getElementById("resume");
resume_btn.addEventListener("click", () => {
    if (continue_flag) {
        resume_btn.innerHTML = "Resume";
        start_btn.disabled = false;
        continue_flag = false;
    } else {
        resume_btn.innerHTML = "Pause";
        start_btn.disabled = true;
        continue_flag = true;

        frame();
    }
});
resume_btn.disabled = true;

let param_fields = document.querySelectorAll("input[type=number]");
param_fields.forEach((v) => {
    v.addEventListener("change", () => on_param_change());
});
function on_param_change() {
    let z_0 = parseInt(document.getElementById("z_0").value);
    let z_1 = parseInt(document.getElementById("z_1").value);

    let max_z_0 = N_AGENTS - z_1 - MIN_FREE_AGENTS;
    let max_z_1 = N_AGENTS - z_0 - MIN_FREE_AGENTS;

    document.getElementById("z_0").setAttribute("max", max_z_0);
    document.getElementById("z_1").setAttribute("max", max_z_1);
}

// on window load
window.addEventListener("load", () => {
    initialize();
    on_param_change();
});
