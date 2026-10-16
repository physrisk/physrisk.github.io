const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const N_BINS = 15;
let p_new = 0.5;
let city_sizes = [];
let n_citizens = 0;

const STEP_INTERVAL = 300;
const N_ADD = 1000;
const N_MASS_ADD = 1000000;
let continue_flag = false;

let pdf_plot = new plotlyPlot("pdfPlot", ["lg(city size)", "lg(city count)"]);
pdf_plot.setPlotType("bar");

const COLORS = ["#c11", "#666"];

function initialize() {
    p_new = my_parse_float(document.getElementById("p_new").value);
    city_sizes = [1];
    n_citizens = 1;
}

function add_citizen() {
    n_citizens += 1;

    if (Math.random() < p_new) {
        city_sizes.push(1);
        return;
    }
    let which = Math.random() * n_citizens;

    for (let i = 0; i < city_sizes.length; i+=1) {
        which -= city_sizes[i];
        if (which < 0) {
            city_sizes[i] += 1;
            break;
        }
    }
}

function get_log_binned_hist(arr, n_bins) {
    if (arr.length === 0 || n_bins < 1) return { edges: [], counts: [] };

    let min = arr[0];
    let max = arr[0];
    for(let i=0;i<arr.length;i+=1) {
        min = arr[i] >= min ? min : arr[i];
        max = arr[i] <= max ? max : arr[i];
    }

    if (min === max) {
        return { edges: [min, max], counts: [arr.length] };
    }

    const lg_min = Math.log10(min);
    const lg_max = Math.log10(max + 1);
    const step = (lg_max - lg_min) / n_bins;

    const edges = new Array(n_bins + 1);
    for (let i = 0; i < n_bins; i+=1) {
        edges[i] = lg_min + i * step;
    }
    edges[n_bins] = lg_max;

    const counts = new Array(n_bins).fill(0);
    arr.forEach((v) => {
        let i = Math.floor((Math.log10(v) - lg_min) / step);
        if (i >= n_bins || i < 0) return;
        counts[i]+=1;
    });

    let proper_edges = [edges[0]];
    let proper_counts = [counts[0]];
    for(let i=1; i<n_bins; i+=1) {
        let edge_start = Math.pow(10, proper_edges[proper_edges.length-1]);
        let edge_end = Math.pow(10, edges[i]);
        if(edge_end - edge_start <= 1) {
            proper_counts[proper_counts.length-1] += counts[i];
        } else {
            proper_edges.push(edges[i]);
            proper_counts.push(counts[i]);
        }
    }
    proper_edges.push(edges[edges.length-1]);

    return { edges: proper_edges, counts: proper_counts };
}

function update_histogram() {
    const { edges, counts } = get_log_binned_hist(city_sizes, N_BINS);
    const mids = counts.map((_, i) => Math.log10((Math.pow(10, edges[i]) + Math.pow(10,edges[i+1]))/2));
    pdf_plot.update([mids], [counts.map(v => Math.log10(v))], "markers", COLORS);
}


function frame() {
    for(let i=0;i<N_ADD;i+=1) {
        add_citizen();
    }

    update_histogram();

    if (continue_flag) {
        window.setTimeout(frame, STEP_INTERVAL);
    } else {
        start_btn.disabled = false;
    }
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
let mass_add_btn = document.getElementById("massAdd");
mass_add_btn.addEventListener("click", () => {
    for(let i=0;i<N_MASS_ADD;i+=1) {
        add_citizen();
    }
    update_histogram();
});

// onload
window.addEventListener("load", () => {
    initialize();
});
