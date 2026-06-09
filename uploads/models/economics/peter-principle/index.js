const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let time_plot = new plotlyPlot(
    "timeSeries",
    ["time", "company efficiency"],
    [10, 10, 40, 60]
);
let competence_history = [];
let current_step = 0;
const MAX_HISTORY = 300;

let histogram_plot = new plotlyPlot(
    "histogramPlot",
    ["company efficiency", "frequency"],
    [10, 10, 40, 60]
);
const HISTOGRAM_BINS = 31;
let histogram = Array(HISTOGRAM_BINS).fill(0);
const HISTOGRAM_BIN_SIZE = 1.0 / (HISTOGRAM_BINS - 1);
const HISTOGRAM_VALS = histogram.map((v, i) => i * HISTOGRAM_BIN_SIZE);

let continue_flag = false;
const STEPS_PER_FRAME = 5;
const FRAME_INTERVAL = 30;

const LEVELS = 6;
const BRANCHING = 3;
let _level_weights = [];
let _total_level_weight = 0;

const START_MIN_AGE = 18;
const START_MAX_AGE = 25;
const RETIREMENT_AGE = 65;

const required_competence = 0.1;
let competence_correlation = 1.0;
const COMPETENCE_CORRELATION_VALS = [0.9, 0];
let promotion_algorithm = 0;
let continue_multiplier = 0;
let continue_promotion_algorithm = 0;
let continue_competence_hypothesis = 0;

let hierarchy_canvas = document.getElementById("hierarchyPlot");
const HIERARCHY_BLOCK_WIDTH = Math.floor(
    hierarchy_canvas.width / Math.pow(BRANCHING, LEVELS - 1)
);
const HIERARCHY_LEFT_PAD = Math.floor(
    (hierarchy_canvas.width -
        HIERARCHY_BLOCK_WIDTH * Math.pow(BRANCHING, LEVELS - 1)) /
        2
);
let _hierarchy_block_heights = [];
let _hierarchy_block_starts = [];
let _hierarchy_top_pad = 0;

let hierarchy = {};

function randomize_age(full = false) {
    if (!full) {
        return START_MIN_AGE + (START_MAX_AGE - START_MIN_AGE) * Math.random();
    }
    return START_MIN_AGE + (RETIREMENT_AGE - START_MIN_AGE) * Math.random();
}

function randomize_competence(previous = 0, correlation = 0) {
    let noise = Math.random();
    return correlation * previous + (1.0 - correlation) * noise;
}

function initialize_agent(full_age_rng = false) {
    return {
        age: randomize_age(full_age_rng),
        competence: randomize_competence(),
    };
}

function update_level_weights(multiplier) {
    _level_weights = Array(LEVELS)
        .fill(null)
        .map((v, i) => Math.pow(1 + multiplier, LEVELS - i - 1));
    _total_level_weight = _level_weights.reduce((c, v) => c + v, 0);
    _hierarchy_block_heights = (() => {
        const default_size = Math.round(
            hierarchy_canvas.height / _total_level_weight
        );
        return _level_weights.map((v) =>
            Math.max(Math.floor(default_size * v), 1)
        );
    })();
    _hierarchy_block_starts = (() => {
        const cum_sum = (
            (sum) => (value) =>
                (sum += value)
        )(0);
        return [0, ..._hierarchy_block_heights.map(cum_sum)];
    })();
    _hierarchy_top_pad = Math.floor(
        (hierarchy_canvas.height -
            _hierarchy_block_starts[_hierarchy_block_starts.length - 1]) /
            2
    );
    if (-_hierarchy_top_pad + 1 >= _hierarchy_block_heights[0]) {
        _hierarchy_top_pad = 0;
    }
}

function update_level_multiplier(override = null) {
    let level_multiplier = 0;
    if (override === null) {
        level_multiplier = my_parse_float(level_multiplier_input.value);
    } else {
        level_multiplier = override;
        level_multiplier_input.value = override;
    }
    update_level_weights(level_multiplier);
    return level_multiplier;
}

function restore_simulation_values() {
    update_level_multiplier(continue_multiplier);

    promotion_algorithm = continue_promotion_algorithm;
    promotion_algorithm_input.value = promotion_algorithm;

    competence_correlation =
        COMPETENCE_CORRELATION_VALS[continue_competence_hypothesis];
    competence_hypothesis_input.value = continue_competence_hypothesis;
}

function initialize() {
    let competence_hypothesis = parseInt(competence_hypothesis_input.value);
    competence_correlation = COMPETENCE_CORRELATION_VALS[competence_hypothesis];

    promotion_algorithm = parseInt(promotion_algorithm_input.value);

    continue_multiplier = update_level_multiplier();
    continue_promotion_algorithm = promotion_algorithm;
    continue_competence_hypothesis = competence_hypothesis;

    hierarchy = {};
    for (let level_id = 0; level_id < LEVELS; level_id += 1) {
        hierarchy[`level_${level_id}`] = Array(Math.pow(BRANCHING, level_id))
            .fill(null)
            .map(() => initialize_agent(true));
    }
    current_step = 0;
    competence_history = [];

    histogram = Array(HISTOGRAM_BINS).fill(0);
}

function replace_agent(level_id, agent_id) {
    if (level_id == LEVELS - 1) {
        // at the bottom level recruit new person
        hierarchy[`level_${level_id}`][agent_id] = initialize_agent();
        return;
    }
    const pick_best = (arr) => {
        let best_idx = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i]["competence"] > arr[best_idx]["competence"]) {
                best_idx = i;
            }
        }
        return best_idx;
    };
    const pick_worst = (arr) => {
        let best_idx = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i]["competence"] < arr[best_idx]["competence"]) {
                best_idx = i;
            }
        }
        return best_idx;
    };
    const pick_random = (arr) => {
        return Math.floor(Math.random() * arr.length);
    };
    const pick_best_or_worst = (arr) => {
        let r = Math.random();
        if (r < 0.5) {
            return pick_best(arr);
        }
        return pick_worst(arr);
    };
    const picker_fn = [pick_best, pick_worst, pick_random, pick_best_or_worst][
        promotion_algorithm
    ];

    let other_level = level_id + 1;
    let best_idx = picker_fn(hierarchy[`level_${other_level}`]);
    hierarchy[`level_${level_id}`][agent_id] = {
        age: hierarchy[`level_${other_level}`][best_idx]["age"],
        competence: randomize_competence(
            hierarchy[`level_${other_level}`][best_idx]["competence"],
            competence_correlation
        ),
    };
    replace_agent(other_level, best_idx);
}

function calculate_company_efficiency() {
    let overall_competence = 0;
    for (let level_id = 0; level_id < LEVELS; level_id += 1) {
        let level_competence = 0;
        for (
            let agent_id = 0;
            agent_id < hierarchy[`level_${level_id}`].length;
            agent_id += 1
        ) {
            level_competence +=
                hierarchy[`level_${level_id}`][agent_id]["competence"];
        }
        level_competence /= hierarchy[`level_${level_id}`].length;
        overall_competence += level_competence * _level_weights[level_id];
    }
    return overall_competence / _total_level_weight;
}

function step() {
    for (let level_id = LEVELS - 1; level_id >= 0; level_id -= 1) {
        for (
            let agent_id = 0;
            agent_id < hierarchy[`level_${level_id}`].length;
            agent_id += 1
        ) {
            let needs_replacement = false;

            // age the agent
            hierarchy[`level_${level_id}`][agent_id]["age"] += 1;

            // retire the agent
            if (
                hierarchy[`level_${level_id}`][agent_id]["age"] >=
                RETIREMENT_AGE
            ) {
                needs_replacement = true;
            }

            // remove incompetent
            if (
                hierarchy[`level_${level_id}`][agent_id]["competence"] <
                required_competence
            ) {
                needs_replacement = true;
            }

            if (needs_replacement) {
                replace_agent(level_id, agent_id);
            }
        }
    }
}

function draw_hierarchy() {
    const apply_cmap = (value) => {
        value = Math.min(Math.max(value, 0), 1);
        const lin_interp = (start, end, x) => start + (end - start) * x;
        const low_color = [0, 0, 255]; // blue
        const mid_color = [255, 255, 255]; // white
        const high_color = [255, 0, 0]; // red
        if (value < 0.5) {
            // low-mid value range
            const v = value / 0.5;
            const r = Math.round(lin_interp(low_color[0], mid_color[0], v));
            const g = Math.round(lin_interp(low_color[1], mid_color[1], v));
            const b = Math.round(lin_interp(low_color[2], mid_color[2], v));
            return `rgb(${r}, ${g}, ${b})`;
        }
        // mid-high value range
        const v = (value - 0.5) / 0.5;
        const r = Math.round(lin_interp(mid_color[0], high_color[0], v));
        const g = Math.round(lin_interp(mid_color[1], high_color[1], v));
        const b = Math.round(lin_interp(mid_color[2], high_color[2], v));
        return `rgb(${r}, ${g}, ${b})`;
    };

    let drawing_context = hierarchy_canvas.getContext("2d");

    // clear the drawing
    drawing_context.fillStyle = "#fff";
    drawing_context.fillRect(
        0,
        0,
        hierarchy_canvas.width,
        hierarchy_canvas.height
    );

    // fill in the drawing
    let block_size = 1;
    for (let level_id = 0; level_id < LEVELS; level_id += 1) {
        block_size = Math.pow(BRANCHING, LEVELS - 1 - level_id);
        for (
            let agent_id = 0;
            agent_id < hierarchy[`level_${level_id}`].length;
            agent_id += 1
        ) {
            drawing_context.fillStyle = apply_cmap(
                hierarchy[`level_${level_id}`][agent_id]["competence"]
            );
            drawing_context.fillRect(
                agent_id * block_size * HIERARCHY_BLOCK_WIDTH +
                    HIERARCHY_LEFT_PAD,
                _hierarchy_block_starts[level_id] + _hierarchy_top_pad,
                HIERARCHY_BLOCK_WIDTH * block_size,
                _hierarchy_block_heights[level_id]
            );
        }
    }
}

function plot_competence() {
    if (competence_history.length == 0) {
        return;
    }
    const time = Array(competence_history.length)
        .fill(null)
        .map((v, i) => i + current_step - competence_history.length);
    time_plot.update([time], [competence_history]);
}

function plot_histogram() {
    if (competence_history.length == 0) {
        return;
    }
    const prob_density = histogram.map((v, i) => {
        let mult = 1;
        if (i == 0 || i == histogram.length - 1) {
            mult = 2;
        }
        return (mult * v) / current_step;
    });
    histogram_plot.update([HISTOGRAM_VALS], [prob_density]);
}

function update_plots() {
    draw_hierarchy();
    plot_competence();
    plot_histogram();
}

function frame() {
    if (continue_flag) {
        let company_efficiency = 0;
        for (let i = 0; i < STEPS_PER_FRAME; i += 1) {
            step();
            company_efficiency = calculate_company_efficiency();
            competence_history.push(company_efficiency);
            histogram[Math.round(company_efficiency / HISTOGRAM_BIN_SIZE)] += 1;
        }
        current_step += STEPS_PER_FRAME;
        competence_history.splice(0, competence_history.length - MAX_HISTORY);

        update_plots();

        if (continue_flag) {
            window.setTimeout(frame, FRAME_INTERVAL);
        }
    }
}

// events
let start_btn = document.getElementById("start");
start_btn.addEventListener("click", () => {
    continue_flag = true;
    start_btn.disabled = true;
    level_multiplier_input.disabled = true;
    competence_hypothesis_input.disabled = true;
    promotion_algorithm_input.disabled = true;
    restart_btn.disabled = false;
    restart_btn.innerHTML = "Pause";
    initialize();
    frame();
});

let restart_btn = document.getElementById("restart");
restart_btn.addEventListener("click", () => {
    continue_flag = !continue_flag;
    if (continue_flag) {
        restore_simulation_values();
        start_btn.disabled = true;
        level_multiplier_input.disabled = true;
        competence_hypothesis_input.disabled = true;
        promotion_algorithm_input.disabled = true;
        restart_btn.innerHTML = "Pause";
        frame();
    } else {
        start_btn.disabled = false;
        level_multiplier_input.disabled = false;
        competence_hypothesis_input.disabled = false;
        promotion_algorithm_input.disabled = false;
        restart_btn.innerHTML = "Continue";
    }
});
restart_btn.disabled = true;

let level_multiplier_input = document.getElementById("level_multiplier");
level_multiplier_input.addEventListener("change", () => {
    update_level_multiplier();
    update_plots();
});

let competence_hypothesis_input = document.getElementById(
    "competence_hypothesis"
);
let promotion_algorithm_input = document.getElementById("promotion_algorithm");

// main
window.onload = () => {
    initialize();
    update_plots();
};
