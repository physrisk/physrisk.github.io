const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let models = [];
const n_agents = 1000;

let time_points = 128;
const time_step = 1/64;
let last_time = 0;
let time = new Array(time_points);
let series = new Array(time_points);

let time_series_plot = new plotlyPlot("timeSeries", ["t", "x(t)"]);
time_series_plot.setRanges(true, [0, 1]);
time_series_plot.reset();

let rate_plot = new plotlyPlot("ratePlot", ["x", "λ(x) / N^2"]);
const RATE_POINTS =101;
const RATE_COLORS =["#c11", "#800", "#05a", "#036"];

let hist_plot = new plotlyPlot("histPlot", ["x", "lg[p(x)]"]);
hist_plot.setRanges([0, 1], true);
hist_plot.reset();
let hist = [];
let histogram_max = 12800;

let stopButton = document.getElementById("stop");
stopButton.addEventListener("click", () => onStopButtonClick());
stopButton.disabled = true;
let startButton = document.getElementById("start");
startButton.addEventListener("click", () => onStartButtonClick());

let timeoutID = null;
let updateTimeout = 30;
let updateSteps = 1;

function onStopButtonClick() {
    if(startButton.disabled) {
        stop();
        stopButton.innerHTML = "Continue";
    } else {
        resume();
        stopButton.innerHTML = "Stop";
    }
    startButton.disabled = !startButton.disabled;
}

function stop() {
    window.clearTimeout(timeoutID);
    timeoutID=null;
}

function resume() {
    timeoutID=window.setTimeout("frame()", updateTimeout);
}

function onStartButtonClick() {
    setup();
    onStopButtonClick();
    startButton.disabled = true;
    stopButton.disabled = false;
}

let paramFields = document.querySelectorAll("input[type=number]");
paramFields.forEach(v => {
    v.addEventListener("change", () => onParamChange());
});

function onParamChange() {
    let epsi_0 = my_parse_float(document.getElementById("epsi_0").value);
    let epsi_1 = my_parse_float(document.getElementById("epsi_1").value);
    let z_0 = my_parse_float(document.getElementById("z_0").value);
    let z_1 = my_parse_float(document.getElementById("z_1").value);

    const x_initial = Math.floor((n_agents - z_0 - z_1) / 2) + z_1;
    let tmp_model_z = new NoisyVoterModel(epsi_0, epsi_1, x_initial, z_0, z_1, -1, -1, n_agents);
    let tmp_model_b = new NoisyVoterModel(epsi_0, epsi_1, x_initial, 0, 0, z_0, n_agents - z_1, n_agents);

    const rate_norm_factor = Math.pow(n_agents, 2);
    const rate_x = Array(RATE_POINTS).fill(null).map((v, i) => (n_agents-z_0-z_1)*i/(RATE_POINTS-1)+z_0);
    const rate_lambda =[
        rate_x.map(v => tmp_model_z.to_1_rate(v)/rate_norm_factor),
        rate_x.map(v => tmp_model_z.to_0_rate(v)/rate_norm_factor),
        rate_x.map(v => tmp_model_b.to_1_rate(v)/rate_norm_factor),
        rate_x.map(v => tmp_model_b.to_0_rate(v)/rate_norm_factor),
    ];

    rate_plot.update([rate_x], rate_lambda, "lines", RATE_COLORS);
}

function frame() {
    let last_x = 0;
    for(let i=0; i<updateSteps; i+=1) {
        last_x = simulate();
        append_time_series_data(last_time, last_x);
    }
    plotFigures();
    resume();
}

function simulate() {
    last_time = last_time + time_step;
    return models.map((v) => v.step(last_time));
}

function append_time_series_data(t, x) {
    time.splice(0,1);
    series.splice(0,1);
    time.push(t);
    series.push(x);

    hist.push(...x);
    if(hist.length > histogram_max) {
        hist.splice(0, hist.length - histogram_max);
    }
}

function plotFigures() {
    time_series_plot.update([time], jStat.transpose(series));

    let pdf = commonFunctions.makePdf(hist, 0, 1, 1001, true);
    let nicePdf = commonFunctions.pdfModification(pdf, false, 0, 1, 31, 0, 1e-3, 1);
    let alpha = models.models[0].distParams[0];
    let beta = models.models[0].distParams[1];
    hist_plot.update(
        [nicePdf.map(v => v[0])],
        [nicePdf.map(v => Math.log10(v[1])),
         nicePdf.map(v => Math.log10(jStat.beta.pdf(v[0], alpha, beta)))],
        ["markers", "lines"],
        ["#aaa", "#111"]
    );
}

function setup() {
    let epsi_0 = my_parse_float(document.getElementById("epsi_0").value);
    let epsi_1 = my_parse_float(document.getElementById("epsi_1").value);
    let z_0 = my_parse_float(document.getElementById("z_0").value);
    let z_1 = my_parse_float(document.getElementById("z_1").value);

    const x_initial = Math.floor((n_agents - z_0 - z_1) / 2) + z_1;
    models[0] = new NoisyVoterModel(epsi_0, epsi_1, x_initial, z_0, z_1, -1, -1, n_agents);
    models[1] = new NoisyVoterModel(epsi_0, epsi_1, x_initial, 0, 0, z_0, n_agents - z_1, n_agents);


    time = time.fill((1-time_points)*time_step).map((v,i) => i*time_step + v);
    last_time = 0;
    series = series.fill(models.step(-1));

    hist = [];
}

// on window load
window.addEventListener("load", () => {
    setup();
    onParamChange();
    plotFigures();
});
