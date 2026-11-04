const my_parse_float = (val) => parseFloat(("" + val).replace(",", "."));

const N_AGENTS = 1000;
const MIN_FREE_AGENTS = 100;

const RATE_POINTS = 101;
const RATE_COLORS = ["#c11", "#05a"];
let birth_rate_plot = new plotlyPlot("birthRatePlot", ["X", "λ(X)"]);
let death_rate_plot = new plotlyPlot("deathRatePlot", ["X", "μ(X)"]);

let param_fields = document.querySelectorAll("input[type=number]");
param_fields.forEach((v) => {
    v.addEventListener("change", () => on_param_change());
});

function on_param_change() {
    let epsi_0 = my_parse_float(document.getElementById("epsi_0").value);
    let epsi_1 = my_parse_float(document.getElementById("epsi_1").value);
    let z_0 = my_parse_float(document.getElementById("z_0").value);
    let z_1 = my_parse_float(document.getElementById("z_1").value);

    let max_z_0 = N_AGENTS - z_1 - MIN_FREE_AGENTS;
    let max_z_1 = N_AGENTS - z_0 - MIN_FREE_AGENTS;

    document.getElementById("z_0").setAttribute("max", max_z_0);
    document.getElementById("z_1").setAttribute("max", max_z_1);

    let x_initial = Math.floor((N_AGENTS - z_0 - z_1) / 2) + z_1;
    let tmp_model_z = new NoisyVoterModel(
        epsi_0,
        epsi_1,
        x_initial,
        z_0,
        z_1,
        -1,
        -1,
        N_AGENTS
    );
    let tmp_model_b = new NoisyVoterModel(
        epsi_0,
        epsi_1,
        x_initial,
        0,
        0,
        z_1,
        N_AGENTS - z_0,
        N_AGENTS
    );

    let rate_x = Array(RATE_POINTS)
        .fill(null)
        .map((v, i) => ((N_AGENTS - z_0 - z_1) * i) / (RATE_POINTS - 1) + z_1);
    let birth_rate_lambda = [
        rate_x.map((v) => tmp_model_z.to_1_rate(v)),
        rate_x.map((v) => tmp_model_b.to_1_rate(v)),
    ];
    let death_rate_lambda = [
        rate_x.map((v) => tmp_model_z.to_0_rate(v)),
        rate_x.map((v) => tmp_model_b.to_0_rate(v)),
    ];

    birth_rate_plot.update([rate_x], birth_rate_lambda, "lines", RATE_COLORS);
    death_rate_plot.update([rate_x], death_rate_lambda, "lines", RATE_COLORS);
}

// on window load
window.addEventListener("load", () => {
    on_param_change();
});
