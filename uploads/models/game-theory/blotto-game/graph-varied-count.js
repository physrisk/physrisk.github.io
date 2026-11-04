let graph = new plotlyPlot("graph", ["Castle 1", "Castle 2"]);

const COLORS = ["#0069b6", "#b6000e", "#333", "#333"];
const PLAY_COLOR = "rgba(102, 102, 102, 0.5)";

function update_graph() {
    let blotto_power = parseInt(document.getElementById("blotto-power").value);
    let enemy_power = parseInt(document.getElementById("enemy-power").value);
    let weak_power = Math.min(blotto_power, enemy_power);
    let strong_power = Math.max(blotto_power, enemy_power);

    const blotto_curve = {
        x: [0, blotto_power],
        y: [blotto_power, 0],
    };
    const enemy_curve = {
        x: [0, enemy_power],
        y: [enemy_power, 0],
    };

    const left_partition = get_left_partition(weak_power, strong_power);
    const right_partition = get_right_partition(weak_power, strong_power);

    graph.setRanges([-0.1, strong_power + 2], [-0.1, strong_power + 2]);
    graph.update(
        [blotto_curve.x, enemy_curve.x, left_partition.x, right_partition.x],
        [blotto_curve.y, enemy_curve.y, left_partition.y, right_partition.y],
        "lines",
        COLORS
    );

    for (let i = 0; i < left_partition.x.length; i += 1) {
        let highlight_points = [];
        if (i % 2 == 0) {
            highlight_points.push(
                [left_partition.x[i], left_partition.y[i]],
                [right_partition.x[i + 1], right_partition.y[i + 1]]
            );
        } else {
            highlight_points.push(
                [right_partition.x[i - 1], right_partition.y[i - 1]],
                [left_partition.x[i], left_partition.y[i]]
            );
        }
        Plotly.addTraces(graph.id, generate_polygon(highlight_points));
    }
}

function generate_polygon(points) {
    return {
        x: [points[0][0], points[1][0], points[0][0], points[0][0]],
        y: [points[0][1], points[1][1], points[1][1], points[0][1]],
        fill: "toself",
        fillcolor: PLAY_COLOR,
        line: {
            color: "rgba(0, 0, 0, 0)",
        },
        type: "scatter",
        mode: "lines",
    };
}

function get_left_partition(weak_power, strong_power) {
    let prev_x = 0;
    let prev_y = weak_power;
    let points = {
        x: [prev_x],
        y: [prev_y],
    };
    if (weak_power == strong_power) {
        return points;
    }

    while (prev_y > 0) {
        let next_x = strong_power - prev_y;
        points.x.push(next_x);
        points.y.push(prev_y);
        prev_y = weak_power - next_x;
        points.x.push(next_x);
        points.y.push(prev_y);
        prev_x = next_x;
    }
    points.x = points.x.slice(0, -1);
    points.y = points.y.slice(0, -1);

    return points;
}

function get_right_partition(weak_power, strong_power) {
    let prev_x = weak_power;
    let prev_y = 0;
    let points = {
        x: [prev_x],
        y: [prev_y],
    };
    if (weak_power == strong_power) {
        return points;
    }

    while (prev_x > 0) {
        let next_y = strong_power - prev_x;
        points.x.push(prev_x);
        points.y.push(next_y);
        prev_x = weak_power - next_y;
        points.x.push(prev_x);
        points.y.push(next_y);
    }
    points.x = points.x.slice(0, -1);
    points.y = points.y.slice(0, -1);
    points.x = points.x.reverse();
    points.y = points.y.reverse();

    return points;
}

document.getElementById("enemy-power").addEventListener("change", () => {
    update_graph();
});

// on load

(() => {
    update_graph();
})();
