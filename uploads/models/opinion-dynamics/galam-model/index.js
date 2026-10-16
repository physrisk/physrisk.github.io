const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let plot = new plotlyPlot("figDiv", ["t", "ξ"], [10, 15, 40, 50]);
const COLORS = ["#f43"];

const field_width = 50;
const field_height = 40;
const cell_size = 5;
const n_particles = field_width * field_height;

const STEP_INTERVAL = 30;
const INTERACTIONS_PER_INTERVAL = 10;
let continue_flag = false;

let group_size_probs;

let particle_opinion;
let current_total_opinion;
let current_time;
let history;

function update_plot() {
    document.getElementById("plotLabel").innerHTML =
        `S. Galam referendum model (t=${current_time})`;
    plot.update([history.time], [history.value], "lines", COLORS);
}

function update_field() {
    let graphicsContext = document.getElementById("plotDiv").getContext("2d");
    for (let i = 0; i < field_width; i += 1) {
        for (let j = 0; j < field_height; j += 1) {
            if (particle_opinion[j * field_width + i] < 0) {
                graphicsContext.fillStyle = "rgb(255,0,0)";
            } else {
                graphicsContext.fillStyle = "rgb(0,0,255)";
            }
            graphicsContext.fillRect(
                i * cell_size,
                j * cell_size,
                cell_size,
                cell_size
            );
        }
    }
}

function single_step() {
    let r = Math.random();
    let group_size = 2;
    while (
        group_size - 2 < group_size_probs.length &&
        r > group_size_probs[group_size - 2]
    ) {
        r -= group_size_probs[group_size - 2];
        group_size += 1;
    }

    let participant_ids = Array(group_size).fill(null);
    let group_opinion = 0;
    for (let i = 0; i < group_size; i += 1) {
        let id = Math.floor(Math.random() * n_particles);
        if (i > 0) {
            while (participant_ids.indexOf(id) > -1)
                id = Math.floor(Math.random() * n_particles);
        }
        participant_ids[i] = id;
        group_opinion += particle_opinion[id];
    }
    current_total_opinion -= group_opinion;

    if (group_opinion > 0) {
        for (let i = 0; i < group_size; i += 1) {
            particle_opinion[participant_ids[i]] = 1;
            current_total_opinion += 1;
        }
    } else {
        for (let i = 0; i < group_size; i += 1) {
            particle_opinion[participant_ids[i]] = -1;
            current_total_opinion -= 1;
        }
    }

    if (
        current_total_opinion == n_particles ||
        current_total_opinion == -n_particles
    ) {
        restart_btn.click();
    }
}

function frame() {
    for (let j = 0; j < INTERACTIONS_PER_INTERVAL; j += 1) {
        if (
            current_total_opinion < n_particles &&
            current_total_opinion > -n_particles
        )
            single_step();
    }
    current_time += INTERACTIONS_PER_INTERVAL;

    history.time.push(current_time);
    history.value.push(current_total_opinion / n_particles);
    update_plot();
    update_field();

    if (continue_flag) {
        window.setTimeout(frame, STEP_INTERVAL);
    } else {
        start_btn.disabled = false;
    }
}

function initialize() {
    group_size_probs = [1, 0, 0, 0, 0];
    let normalization_factor = 0;
    for (let group_size = 2; group_size <= 6; group_size += 1) {
        group_size_probs[group_size - 2] = Math.abs(
            my_parse_float(
                document.getElementById(`group_${group_size}_prob`).value
            )
        );
        normalization_factor += group_size_probs[group_size - 2];
    }
    if (normalization_factor < 1e-5) {
        group_size_probs = [1, 0, 0, 0, 0];
    } else {
        group_size_probs = group_size_probs.map(
            (v) => v / normalization_factor
        );
    }
    for (let group_size = 2; group_size <= 6; group_size += 1) {
        document.getElementById(`group_${group_size}_prob`).value =
            group_size_probs[group_size - 2];
    }

    current_total_opinion = 0;
    current_time = 0;

    let initial_condition = my_parse_float(
        document.getElementById("initial_condition").value
    );
    let positive_prob = (1.0 + initial_condition) / 2.0;
    particle_opinion = Array(n_particles)
        .fill(null)
        .map(() => {
            if (Math.random() < positive_prob) {
                current_total_opinion += 1;
                return 1;
            }
            current_total_opinion -= 1;
            return -1;
        });
    history = {
        time: [0],
        value: [current_total_opinion / n_particles],
    };
}

// events
let start_btn = document.getElementById("start");
start_btn.addEventListener("click", () => {
    initialize();
    continue_flag = true;
    start_btn.disabled = true;
    restart_btn.innerHTML = "Pause";
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

/*main*/
window.onload = () => {
    initialize();
    update_plot();
    update_field();
};
