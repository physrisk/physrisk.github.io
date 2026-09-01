const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const REELECTION_AFTER = 100;
const N_POLITICIANS = 141;
let party_tolerance = 0.1;
let majority_fraction = 0.6;
let n_independent_politicians = 0;

let continue_flag = false;
let current_speed = 2;
const SPEED_VALUES = [5, 20, 100]; // must be divisors of REELECTION_AFTER
let steps_per_frame = SPEED_VALUES[current_speed];
const FRAME_INTERVAL = 50;

let legislature_canvas = document.getElementById("legislaturePlot");
const MAJORITY_COLOR = "#47c";
const MINORITY_COLOR = "#c11";
const PROPOSAL_COLOR = "#063";
const POLITICIAN_SIZE = 3;
const PROPOSAL_RADIUS = 3;

let majority_party = [];
let minority_party = [];
let majority_politicians = [];
let minority_politicians = [];
let independent_politicians = [];

let current_law_id = 0;
let current_legislature = 0;
let last_proposal = [];

let efficiency_histogram = Array(2 * REELECTION_AFTER + 1).fill(0);
const EFFICIENCY_HISTOGRAM_VALS = Array(efficiency_histogram.length)
    .fill(null)
    .map((v, i) => i / REELECTION_AFTER - 1.0);

let acceptance_histogram = Array(REELECTION_AFTER + 1).fill(0);
const ACCEPTANCE_HISTOGRAM_VALS = Array(acceptance_histogram.length)
    .fill(null)
    .map((v, i) => i / REELECTION_AFTER);
let legislature_accepted = 0;

let gain_history = [0];
const MAX_GAIN_HISTORY = REELECTION_AFTER + 1;
let acceptance_efficiency_means = Array(acceptance_histogram.length).fill(0);
let acceptance_efficiency_ranges = Array(acceptance_histogram.length)
    .fill(null)
    .map(() => [1, 0]);

let gain_series_plot = new plotlyPlot(
    "gainPlot",
    ["time", "social welfare"],
    [10, 10, 40, 60]
);
let acceptance_efficiency_plot = new plotlyPlot(
    "acceptanceEfficiencyPlot",
    ["acceptance", "efficiency"],
    [10, 10, 40, 60]
);
let efficiency_histogram_plot = new plotlyPlot(
    "efficiencyHistogramPlot",
    ["efficiency", "frequency"],
    [10, 10, 40, 60]
);
let acceptance_histogram_plot = new plotlyPlot(
    "acceptanceHistogramPlot",
    ["acceptance", "frequency"],
    [10, 10, 40, 60]
);

function step() {
    const n_majority = majority_politicians.length;
    const n_minority = minority_politicians.length;

    let proposer, proposer_party_id;
    [proposer, proposer_party_id] = (() => {
        const picker = N_POLITICIANS * Math.random();
        if (picker < n_majority) {
            return [majority_politicians[Math.floor(picker)], 0];
        }
        if (picker < n_majority + n_minority) {
            return [minority_politicians[Math.floor(picker - n_majority)], 1];
        }
        return [
            independent_politicians[
                Math.floor(picker - n_majority - n_minority)
            ],
            2,
        ];
    })();
    last_proposal = [...proposer];

    let vote_count = 0;
    if (proposer_party_id == 0) {
        vote_count += n_majority;
    } else {
        majority_politicians.forEach(() => {
            if (last_proposal[1] >= majority_party[1]) {
                if (Math.random() >= majority_party[0]) {
                    vote_count += 1;
                }
            }
        });
    }
    if (proposer_party_id == 1) {
        vote_count += n_minority;
    } else {
        minority_politicians.forEach(() => {
            if (last_proposal[1] >= minority_party[1]) {
                if (Math.random() >= minority_party[0]) {
                    vote_count += 1;
                }
            }
        });
    }
    independent_politicians.forEach((v) => {
        if (last_proposal[1] >= v[1]) {
            if (Math.random() >= v[0]) {
                vote_count += 1;
            }
        }
    });

    return [vote_count >= N_POLITICIANS / 2, 2 * last_proposal[1] - 1];
}

function reset_legislature() {
    current_legislature += 1;
    // set party coordinates
    majority_party = [
        (1 - 2 * party_tolerance) * Math.random() + party_tolerance,
        (1 - 2 * party_tolerance) * Math.random() + party_tolerance,
    ];
    minority_party = [
        (1 - 2 * party_tolerance) * Math.random() + party_tolerance,
        (1 - 2 * party_tolerance) * Math.random() + party_tolerance,
    ];

    // generate politiciansfor majority, minority and independents
    const n_majority = Math.round(
        (N_POLITICIANS - n_independent_politicians) * majority_fraction
    );
    majority_politicians = Array(n_majority)
        .fill(null)
        .map(() => {
            const random_angle = 2 * Math.PI * Math.random();
            const random_radius = party_tolerance * Math.random();
            return [
                majority_party[0] + random_radius * Math.cos(random_angle),
                majority_party[1] + random_radius * Math.sin(random_angle),
            ];
        });
    const n_minority = N_POLITICIANS - n_independent_politicians - n_majority;
    minority_politicians = Array(n_minority)
        .fill(null)
        .map(() => {
            const random_angle = 2 * Math.PI * Math.random();
            const random_radius = party_tolerance * Math.random();
            return [
                minority_party[0] + random_radius * Math.cos(random_angle),
                minority_party[1] + random_radius * Math.sin(random_angle),
            ];
        });

    independent_politicians = Array(n_independent_politicians)
        .fill(null)
        .map(() => [Math.random(), Math.random()]);

    last_proposal = [];
    legislature_accepted = 0;
}

function initialize() {
    majority_fraction = my_parse_float(
        document.getElementById("majorityFraction").value
    );
    n_independent_politicians = parseInt(
        document.getElementById("nIndependents").value
    );
    party_tolerance = my_parse_float(
        document.getElementById("partyTolerance").value
    );

    current_law_id = 0;
    current_legislature = -1;
    efficiency_histogram = Array(efficiency_histogram.length).fill(0);
    acceptance_histogram = Array(acceptance_histogram.length).fill(0);
    gain_history = [0];
    acceptance_efficiency_means = Array(acceptance_histogram.length).fill(0);
    acceptance_efficiency_ranges = Array(acceptance_histogram.length)
        .fill(null)
        .map(() => [1, 0]);

    reset_legislature();
}

function draw_legislature() {
    let drawing_context = legislature_canvas.getContext("2d");
    drawing_context.save();

    const full_context_width = legislature_canvas.width;
    const full_context_height = legislature_canvas.height;
    const context_size = Math.min(full_context_height, full_context_width) - 2;
    const context_top_pad = Math.floor(
        (full_context_height - context_size) / 2
    );
    const context_left_pad = Math.floor(
        (full_context_width - context_size) / 2
    );

    // clear the drawing
    drawing_context.fillStyle = "#ccc";
    drawing_context.fillRect(0, 0, full_context_width, full_context_height);

    drawing_context.translate(context_left_pad, context_top_pad);
    drawing_context.fillStyle = "#fff";
    drawing_context.fillRect(0, 0, context_size, context_size);

    // plotting the parties
    drawing_context.save();
    drawing_context.globalAlpha = 0.6;
    const party_radius = party_tolerance * context_size;
    drawing_context.beginPath();
    drawing_context.lineWidth = 0;
    drawing_context.fillStyle = MAJORITY_COLOR;
    drawing_context.arc(
        Math.floor(majority_party[0] * context_size),
        Math.floor((1 - majority_party[1]) * context_size),
        party_radius,
        0,
        2 * Math.PI
    );
    drawing_context.fill();
    drawing_context.beginPath();
    drawing_context.lineWidth = 0;
    drawing_context.fillStyle = MINORITY_COLOR;
    drawing_context.arc(
        Math.floor(minority_party[0] * context_size),
        Math.floor((1 - minority_party[1]) * context_size),
        party_radius,
        0,
        2 * Math.PI
    );
    drawing_context.fill();
    drawing_context.restore();

    // plotting the politicians
    drawing_context.fillStyle = MAJORITY_COLOR;
    majority_politicians.forEach((v) => {
        drawing_context.fillRect(
            Math.floor(v[0] * context_size) -
                Math.floor((POLITICIAN_SIZE - 1) / 2),
            Math.floor((1 - v[1]) * context_size) -
                Math.floor((POLITICIAN_SIZE - 1) / 2),
            POLITICIAN_SIZE,
            POLITICIAN_SIZE
        );
    });
    drawing_context.fillStyle = MINORITY_COLOR;
    minority_politicians.forEach((v) => {
        drawing_context.fillRect(
            Math.floor(v[0] * context_size) -
                Math.floor((POLITICIAN_SIZE - 1) / 2),
            Math.floor((1 - v[1]) * context_size) -
                Math.floor((POLITICIAN_SIZE - 1) / 2),
            POLITICIAN_SIZE,
            POLITICIAN_SIZE
        );
    });
    drawing_context.fillStyle = "#333";
    independent_politicians.forEach((v) => {
        drawing_context.fillRect(
            Math.floor(v[0] * context_size) -
                Math.floor((POLITICIAN_SIZE - 1) / 2),
            Math.floor((1 - v[1]) * context_size) -
                Math.floor((POLITICIAN_SIZE - 1) / 2),
            POLITICIAN_SIZE,
            POLITICIAN_SIZE
        );
    });

    // draw last proposal
    if (last_proposal.length > 0) {
        drawing_context.save();
        drawing_context.globalAlpha = 0.6;
        drawing_context.beginPath();
        drawing_context.lineWidth = 0;
        drawing_context.fillStyle = PROPOSAL_COLOR;
        drawing_context.arc(
            Math.floor(last_proposal[0] * context_size),
            Math.floor((1 - last_proposal[1]) * context_size),
            PROPOSAL_RADIUS,
            0,
            2 * Math.PI
        );
        drawing_context.fill();
        drawing_context.beginPath();
        drawing_context.lineWidth = 1;
        drawing_context.strokeStyle = PROPOSAL_COLOR;
        drawing_context.moveTo(
            0,
            Math.floor((1 - last_proposal[1]) * context_size)
        );
        drawing_context.lineTo(
            context_size,
            Math.floor((1 - last_proposal[1]) * context_size)
        );
        drawing_context.stroke();
        drawing_context.moveTo(Math.floor(last_proposal[0] * context_size), 0);
        drawing_context.lineTo(
            Math.floor(last_proposal[0] * context_size),
            context_size
        );
        drawing_context.stroke();
        drawing_context.restore();
    }

    // draw the zero lines
    drawing_context.setLineDash([5, 5]);
    drawing_context.beginPath();
    drawing_context.strokeStyle = "#666";
    drawing_context.lineWidth = 1;
    drawing_context.moveTo(2.5, Math.floor(context_size / 2));
    drawing_context.lineTo(context_size, Math.floor(context_size / 2));
    drawing_context.stroke();
    drawing_context.beginPath();
    drawing_context.moveTo(Math.floor(context_size / 2), 2.5);
    drawing_context.lineTo(Math.floor(context_size / 2), context_size);
    drawing_context.stroke();
    drawing_context.setLineDash([]);

    // draw surrounding frame
    drawing_context.beginPath();
    drawing_context.strokeStyle = "#000";
    drawing_context.lineWidth = 1;
    drawing_context.rect(0, 0, context_size, context_size);
    drawing_context.stroke();

    drawing_context.restore();
}

function update_header() {
    if (current_law_id > 0) {
        document.getElementById("avgSocialGain").innerHTML =
            `${(gain_history[gain_history.length - 1] / current_law_id).toFixed(3)}`;
        document.getElementById("legislatureNumber").innerHTML =
            `${current_legislature.toFixed(0)}`;
    }
}

function plot_acceptance_histogram() {
    if (current_legislature == 0) {
        acceptance_histogram_plot.reset();
        return;
    }
    acceptance_histogram_plot.update(
        [ACCEPTANCE_HISTOGRAM_VALS],
        [
            acceptance_histogram.map((v, i) => {
                let mult = 1;
                if (i == 0 || i == efficiency_histogram.length - 1) {
                    mult = 2;
                }
                return (mult * v) / current_legislature;
            }),
        ]
    );
}

function plot_efficiency_histogram() {
    if (current_legislature == 0) {
        efficiency_histogram_plot.reset();
        return;
    }
    efficiency_histogram_plot.update(
        [EFFICIENCY_HISTOGRAM_VALS],
        [
            efficiency_histogram.map((v, i) => {
                let mult = 1;
                if (i == 0 || i == efficiency_histogram.length - 1) {
                    mult = 2;
                }
                return (mult * v) / current_legislature;
            }),
        ]
    );
}

function plot_gain_series() {
    let time = Array(gain_history.length)
        .fill(null)
        .map((v, i) => current_law_id - gain_history.length + i);

    gain_series_plot.update([time], [gain_history]);
}

function plot_acceptance_efficiency() {
    const vals = ACCEPTANCE_HISTOGRAM_VALS.filter(
        (v, i) =>
            acceptance_efficiency_ranges[i][0] <=
            acceptance_efficiency_ranges[i][1]
    );
    const vals_split = vals.map((v) => [v, v]);
    const means = acceptance_efficiency_means.filter(
        (v, i) =>
            acceptance_efficiency_ranges[i][0] <=
            acceptance_efficiency_ranges[i][1]
    );
    const ranges = acceptance_efficiency_ranges.filter((v) => v[0] <= v[1]);

    acceptance_efficiency_plot.update(
        [vals, ...vals_split],
        [means, ...ranges],
        ["markers", ...Array(vals_split.length).fill("lines")],
        ["#47c", ...Array(vals_split.length).fill("rgba(20, 20, 20, 0.5)")]
    );
}

function update_plots() {
    update_header();
    draw_legislature();
    plot_gain_series();
    plot_acceptance_histogram();
    plot_efficiency_histogram();
    plot_acceptance_efficiency();
}

function frame() {
    if (continue_flag) {
        let success, social_gain;
        const laws_until_reelection =
            REELECTION_AFTER - (current_law_id % REELECTION_AFTER);

        const steps_to_do = Math.min(laws_until_reelection, steps_per_frame);
        for (let i = 0; i < steps_to_do; i += 1) {
            [success, social_gain] = step();
            current_law_id += 1;
            legislature_accepted += success;
            if (!success) {
                social_gain = 0;
            }
            gain_history.push(
                gain_history[gain_history.length - 1] + social_gain
            );
        }
        gain_history.splice(0, gain_history.length - MAX_GAIN_HISTORY);

        if (current_law_id % REELECTION_AFTER == 0) {
            const total_gain =
                gain_history[gain_history.length - 1] - gain_history[0];
            const efficiency = total_gain / REELECTION_AFTER;

            efficiency_histogram[Math.round(total_gain) + REELECTION_AFTER] +=
                1;
            acceptance_histogram[legislature_accepted] += 1;

            if (acceptance_histogram[legislature_accepted] == 1) {
                acceptance_efficiency_means[legislature_accepted] = efficiency;
                acceptance_efficiency_ranges[legislature_accepted] = [
                    efficiency,
                    efficiency,
                ];
            } else {
                acceptance_efficiency_means[legislature_accepted] =
                    acceptance_efficiency_means[legislature_accepted] +
                    (efficiency -
                        acceptance_efficiency_means[legislature_accepted]) /
                        (acceptance_histogram[legislature_accepted] - 1);
                acceptance_efficiency_ranges[legislature_accepted] = [
                    Math.min(
                        acceptance_efficiency_ranges[legislature_accepted][0],
                        efficiency
                    ),
                    Math.max(
                        acceptance_efficiency_ranges[legislature_accepted][1],
                        efficiency
                    ),
                ];
            }

            reset_legislature();
        }

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

let speed_btn = document.getElementById("speed");
function update_speed_btn_text() {
    const next_speed = SPEED_VALUES[(current_speed + 1) % SPEED_VALUES.length];
    speed_btn.innerText = `Go ${steps_per_frame < next_speed ? "faster" : "slower"} (${((next_speed / FRAME_INTERVAL) * 1000).toFixed(0)} pps)`;
}
speed_btn.addEventListener("click", () => {
    current_speed = (current_speed + 1) % SPEED_VALUES.length;
    steps_per_frame = SPEED_VALUES[current_speed];
    update_speed_btn_text();
});
update_speed_btn_text();

// main
window.onload = () => {
    initialize();
    update_plots();
};
