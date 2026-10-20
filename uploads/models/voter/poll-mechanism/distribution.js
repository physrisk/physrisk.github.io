const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const SHOW_POLLS = 0;
const COLORS = ["#cc1111", "#05a", "#333333"];

const N_MODELS = 1000;
let simulation_time = 0;
let delayed_models = Array(N_MODELS).fill(null);
let polled_models = Array(N_MODELS).fill(null);
let continue_flag = false;
const STEP_INTERVAL = 100;
const PERIODS_PER_FRAME = 1;

const BIN_SIZE = 10;

let plot_label = document.getElementById("plotLabel");
let hist_plot = new plotlyPlot("histogram", ["X", "p(X)"]);

function update_histogram_plot() {
    const beta_dist = jStat.beta(
        delayed_models[0].epsi_1,
        delayed_models[0].epsi_0
    );
    let delayed_freq_count = Array(
        Math.floor(delayed_models[0].n_agents / BIN_SIZE) + 1
    ).fill(0);
    let polled_freq_count = Array(
        Math.floor(polled_models[0].n_agents / BIN_SIZE) + 1
    ).fill(0);
    const freq_vals = Array(delayed_freq_count.length)
        .fill(null)
        .map((v, i) => i * BIN_SIZE);
    delayed_models.forEach((model) => {
        delayed_freq_count[Math.floor(model.x / BIN_SIZE)] += 1;
    });
    polled_models.forEach((model) => {
        polled_freq_count[Math.floor(model.x / BIN_SIZE)] += 1;
    });

    plot_label.innerHTML = `Ensemble PMF (t=${simulation_time}·τ)`;
    hist_plot.update(
        [freq_vals, freq_vals, freq_vals],
        [
            delayed_freq_count.map((v) => v / N_MODELS / BIN_SIZE),
            polled_freq_count.map((v) => v / N_MODELS / BIN_SIZE),
            freq_vals.map(
                (v) =>
                    beta_dist.pdf(v / delayed_models[0].n_agents) /
                    delayed_models[0].n_agents
            ),
        ],
        "lines",
        COLORS
    );
}

function simulate(steps) {
    for (let i = 0; i < steps; i += 1) {
        delayed_models.forEach((model) => model.simulate_period());
        polled_models.forEach((model) => model.simulate_period());
    }

    simulation_time += steps;

    delayed_models.forEach((model) => model.trim_history(SHOW_POLLS));
    polled_models.forEach((model) => model.trim_history(SHOW_POLLS));
}

function frame(override_flag = false) {
    if (continue_flag || override_flag) {
        simulate(PERIODS_PER_FRAME);

        update_histogram_plot();

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
    const seed = Math.floor(Math.random() * 100000);
    simulation_time = 0;
    delayed_models = Array(N_MODELS)
        .fill(null)
        .map((v, i) => {
            let model = new PollDelayedModel(epsi_0, epsi_1, n_agents);
            model.set_periods(tau, 1);
            model.set_initial_condition(x_0 / n_agents, a_0 / n_agents);
            model.set_seed(seed + i);
            return model;
        });
    polled_models = Array(N_MODELS)
        .fill(null)
        .map((v, i) => {
            let model = new PollModel(epsi_0, epsi_1, n_agents);
            model.set_periods(tau, 1);
            model.set_initial_condition(x_0 / n_agents);
            model.set_seed(seed + N_MODELS + i);
            return model;
        });
}

// events
let start_btn = document.getElementById("start");
start_btn.addEventListener("click", () => {
    continue_flag = true;
    start_btn.disabled = true;
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
        restart_btn.innerHTML = "Pause";
        frame();
    } else {
        start_btn.disabled = false;
        restart_btn.innerHTML = "Continue";
    }
});
restart_btn.disabled = true;

/*main*/
window.onload = () => {
    initialize();
};
