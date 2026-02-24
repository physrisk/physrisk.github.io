const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

let main_plot = new plotlyPlot(
    "mainPlot",
    ["experiment #", "estimate"],
    [10, 15, 40, 60]
);

const COLORS = ["#c11", "#222"];

function plot_outcome(outcome, true_prob) {
    main_plot.update(
        [outcome.map((v, i) => i + 1)],
        [outcome, Array(outcome.length).fill(true_prob)],
        "lines",
        COLORS
    );
}

function conduct_experiments(p, n) {
    return Array(n)
        .fill(null)
        .map(() => (Math.random() > p ? 0 : 1))
        .reduce((a, c) => (a = [...a, a[a.length - 1] + c]), [0])
        .slice(1)
        .map((v, i) => v / (i + 1));
}

// events
let generate_btn = document.getElementById("generate");
generate_btn.addEventListener("click", () => {
    const probability = my_parse_float(
        document.getElementById("probability").value
    );
    const n_experiments = parseInt(
        document.getElementById("n_experiments").value
    );
    const outcomes = conduct_experiments(probability, n_experiments);
    plot_outcome(outcomes, probability);
});

// on load
generate_btn.click();
