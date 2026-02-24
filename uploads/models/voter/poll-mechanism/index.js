const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const SHOW_POLLS = 20;
const POLL_PERIODS = 10;
const COLORS = ["#cc1111", "#333333", "#999999"];

let model = null;
let continue_flag = false;
const STEP_INTERVAL = 400;
const PERIODS_PER_FRAME = 1;
const QUICK_SIM_STEPS = 1000 * PERIODS_PER_FRAME;

let time_plot = new plotlyPlot("timeSeries", ["t / τ", "X(t)"]);

function update_series_plot() {
    const time = Array(model.history_x.length)
        .fill(null)
        .map((v, i) => model.start_poll + i / model.period_steps);
    const cur_poll = model.history_poll
        .slice(model.period_steps)
        .concat(Array(model.period_steps).fill(model.x));
    time_plot.update(
        [time, time, time],
        [model.history_x, model.history_poll, cur_poll],
        "lines",
        COLORS
    );
}

function simulate(steps) {
    for (let i = 0; i < steps; i += 1) {
        model.simulate_period();
    }

    model.trim_history(SHOW_POLLS);
}

function frame(override_flag = false) {
    if (continue_flag || override_flag) {
        simulate(PERIODS_PER_FRAME);

        update_series_plot();

        if (continue_flag) {
            window.setTimeout(frame, STEP_INTERVAL);
        }
    } else {
        start_btn.disabled = false;
    }
}

function initialize() {
    const tau = Math.pow(
        10,
        my_parse_float(document.getElementById("tau").value)
    );
    const epsi_0 = my_parse_float(document.getElementById("epsi_0").value);
    const epsi_1 = my_parse_float(document.getElementById("epsi_1").value);
    const n_agents = parseInt(document.getElementById("n_agents").value);
    const x_0 = parseInt(document.getElementById("x_0").value);
    const a_0 = parseInt(document.getElementById("a_0").value);
    model = new PollDelayedModel(epsi_0, epsi_1, n_agents);
    model.set_periods(tau, POLL_PERIODS);
    model.set_initial_condition(x_0 / n_agents, a_0 / n_agents);
}

// events
let start_btn = document.getElementById("start");
start_btn.addEventListener("click", () => {
    continue_flag = true;
    start_btn.disabled = true;
    quick_btn.disabled = true;
    restart_btn.disabled = false;
    restart_btn.innerHTML = "Pause";
    initialize();
    frame();
});
let restart_btn = document.getElementById("restart");
restart_btn.addEventListener("click", () => {
    continue_flag = !continue_flag;
    if (continue_flag) {
        start_btn.disabled = true;
        quick_btn.disabled = true;
        restart_btn.innerHTML = "Pause";
        frame();
    } else {
        start_btn.disabled = false;
        quick_btn.disabled = false;
        restart_btn.innerHTML = "Continue";
    }
});
restart_btn.disabled = true;
let quick_btn = document.getElementById("quick");
quick_btn.addEventListener("click", () => {
    simulate(QUICK_SIM_STEPS - 1);
    frame(true);
});
quick_btn.disabled = true;

/*main*/
window.onload = () => {
    initialize();
};
