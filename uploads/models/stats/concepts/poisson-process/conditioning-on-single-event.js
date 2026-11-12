const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let rng = new Random();

let pdf_plot = new plotlyPlot("pdfPlot", ["t", "p(t|n=1)"]);
pdf_plot.setPlotType("bar");

const COLORS = ["#c11"];

let start_btn = document.getElementById("start");
let resume_btn = document.getElementById("resume");
let rejected_events = document.getElementById("rejected_events");

const EXPERIMENTS_PER_UPDATE = 100;
const INTERVAL = 100;
let continue_flag = false;

let event_rate = 1;
let observation_period = 1;
let failure_count = 0;
let event_count = 0;

const N_HISTOGRAM_POINTS = 50;
let histogram_vals = Array(N_HISTOGRAM_POINTS)
    .fill(null)
    .map((_, i) => ((i + 0.5) * observation_period) / N_HISTOGRAM_POINTS);
let histogram_counts = Array(N_HISTOGRAM_POINTS).fill(0);

function conduct_single_experiment() {
    let first_event_time = rng.exponential(event_rate);
    let second_event_time = rng.exponential(event_rate);
    if (
        first_event_time + second_event_time < observation_period ||
        first_event_time > observation_period
    ) {
        return -1;
    }
    return first_event_time;
}

function step() {
    for (let i = 0; i < EXPERIMENTS_PER_UPDATE; i += 1) {
        const time = conduct_single_experiment();
        if (time < 0) {
            failure_count += 1;
        } else {
            const idx = Math.floor(
                (time / observation_period) * N_HISTOGRAM_POINTS
            );
            histogram_counts[idx] += 1;
            event_count += 1;
        }
    }

    rejected_events.innerHTML = `${((100 * failure_count) / (failure_count + event_count)).toFixed(1)}%`;
    pdf_plot.update(
        [histogram_vals],
        [
            histogram_counts.map(
                (v) =>
                    v / event_count / (observation_period / N_HISTOGRAM_POINTS)
            ),
        ],
        "markers",
        COLORS
    );

    // decide if to continue
    if (continue_flag) {
        setTimeout(step, INTERVAL);
    } else {
        resume_btn.disabled = false;
    }
}

// events
start_btn.addEventListener("click", () => {
    continue_flag = true;
    start_btn.disabled = true;
    resume_btn.disabled = false;
    resume_btn.innerHTML = "Pause";

    event_rate = my_parse_float(document.getElementById("event_rate").value);
    observation_period = my_parse_float(
        document.getElementById("observation_period").value
    );
    failure_count = 0;
    event_count = 0;

    histogram_vals = Array(N_HISTOGRAM_POINTS)
        .fill(null)
        .map((_, i) => ((i + 0.5) * observation_period) / N_HISTOGRAM_POINTS);
    histogram_counts = Array(N_HISTOGRAM_POINTS).fill(0);

    step();
});
resume_btn.addEventListener("click", () => {
    continue_flag = !continue_flag;
    start_btn.disabled = continue_flag;
    resume_btn.disabled = !continue_flag;
    if (continue_flag) {
        resume_btn.innerHTML = "Pause";
    } else {
        resume_btn.innerHTML = "Resume";
        setTimeout(step, INTERVAL);
    }
});
