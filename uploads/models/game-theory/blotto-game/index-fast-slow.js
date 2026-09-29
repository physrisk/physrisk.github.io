const INTERVAL = 100;
const INTERVAL_WARS = 1;
let continue_flag = false;

const N_CASTLES = 5;
const N_RESOURCES = 30;
const TROOP_COST = [1, 2];

const AI_PRIORITIES = [3, 3];
const AI_CONSERVE = [0.25, 0.75];
const AI_MIN_COMMIT_MIN = 0;
const AI_MIN_COMMIT_MAX = 3;

const PLAYER_COLOR = "rgb(0, 105, 182)";
const AI_COLOR = "rgb(182, 0, 14)";
const NEUTRAL_COLOR = "rgb(211, 211, 211)";

let game_state = {};
function reset_game_state() {
    game_state = {
        round: 1,
        player: {
            troops: [Array(N_CASTLES).fill(0), Array(N_CASTLES).fill(0)],
        },
        ai: { troops: [Array(N_CASTLES).fill(0), Array(N_CASTLES).fill(0)] },
    };
}

const message_div = document.getElementById("message-round");
const svg_player_texts = document.querySelectorAll(".svg-player-assigned");
const svg_ai_texts = document.querySelectorAll(".svg-ai-assigned");
function draw_game_state() {
    const current_round = game_state.round;

    if (current_round <= 2) {
        update_round_message(current_round);
    } else {
        update_outcome_message();
    }

    update_player_assignments(current_round);
    update_ai_assignments(current_round);

    update_castles(current_round);
}

function get_current_resources(whose, decrease = 0) {
    return (
        N_RESOURCES -
        decrease -
        whose.troops[0].reduce((a, v) => a + v, 0) * TROOP_COST[0] -
        whose.troops[1].reduce((a, v) => a + v, 0) * TROOP_COST[1]
    );
}

function get_current_assignable(whose, decrease = 0) {
    const current_resources = get_current_resources(whose, decrease);
    return Math.floor(current_resources / TROOP_COST[game_state.round - 1]);
}

function update_round_message(current_round) {
    const current_troop_cost = TROOP_COST[current_round - 1];
    const current_resources = get_current_resources(game_state.player);
    message_div.innerHTML = `Round #${current_round} (${current_troop_cost} resource${current_troop_cost == 1 ? "" : "s"} = 1 troop). ${current_resources} resource${current_resources == 1 ? "" : "s"}.`;
}

function update_outcome_message() {
    const outcomes = Array(N_CASTLES)
        .fill(null)
        .map((v, i) => {
            const player_troops =
                game_state.player.troops[0][i] + game_state.player.troops[1][i];
            const ai_troops =
                game_state.ai.troops[0][i] + game_state.ai.troops[1][i];
            if (player_troops > ai_troops) {
                return 1;
            }
            if (player_troops < ai_troops) {
                return -1;
            }
            return 0;
        });
    const overall_outcome = outcomes.reduce((a, v) => a + v, 0);
    if (overall_outcome > 0) {
        message_div.innerHTML = "You have won!";
    } else if (overall_outcome < 0) {
        message_div.innerHTML = "You have lost!";
    } else {
        message_div.innerHTML = "Stalemate!";
    }
}

function update_player_assignments(current_round) {
    svg_player_texts.forEach((e) => {
        const castle_id = parseInt(e.id.split("-").pop()) - 1;
        const first_round = "" + game_state.player.troops[0][castle_id];
        const second_round =
            current_round > 1
                ? "+" + game_state.player.troops[1][castle_id]
                : "";
        e.textContent = `${first_round}${second_round}`;
    });
}

function update_ai_assignments(current_round) {
    svg_ai_texts.forEach((e) => {
        const castle_id = parseInt(e.id.split("-").pop()) - 1;
        const first_round =
            current_round > 1 ? "" + game_state.ai.troops[0][castle_id] : "?";
        const second_round =
            current_round > 2
                ? "+" + game_state.ai.troops[1][castle_id]
                : current_round == 1
                  ? ""
                  : "+?";
        e.textContent = `${first_round}${second_round}`;
    });
}

function update_castles(current_round) {
    for (let castle_id = 0; castle_id < N_CASTLES; castle_id += 1) {
        let player_troops = game_state.player.troops[0][castle_id];
        if (current_round > 1) {
            player_troops =
                player_troops + game_state.player.troops[1][castle_id];
        }
        let ai_troops = 0;
        if (current_round > 1) {
            ai_troops = ai_troops + game_state.ai.troops[0][castle_id];
        }
        if (current_round > 2) {
            ai_troops = ai_troops + game_state.ai.troops[1][castle_id];
        }

        const castle_obj = document.getElementById(`castle-${castle_id + 1}`);
        if (player_troops > ai_troops) {
            castle_obj.style.fill = PLAYER_COLOR;
        } else if (player_troops < ai_troops) {
            castle_obj.style.fill = AI_COLOR;
        } else {
            castle_obj.style.fill = NEUTRAL_COLOR;
        }
    }
}

function ai_strategy() {
    const current_round = game_state.round;
    if (current_round == 1) {
        ai_first_round_strategy();
    } else if (current_round == 2) {
        ai_second_round_strategy();
    }
}

function ai_first_round_strategy() {
    const priority_castles = commonFunctions
        .shuffleArray(
            Array(N_CASTLES)
                .fill(null)
                .map((v, i) => i)
        )
        .slice(0, AI_PRIORITIES[0]);

    console.log("First round:");
    console.log(
        `\tPriority castles: ${priority_castles.map((v) => v + 1).sort()}`
    );

    const minimal_commit =
        Math.floor(Math.random() * (AI_MIN_COMMIT_MAX - AI_MIN_COMMIT_MIN)) +
        AI_MIN_COMMIT_MIN;
    game_state.ai.troops[0] = Array(N_CASTLES).fill(minimal_commit);

    console.log(`\tCommiting ${minimal_commit} troops to all castles.`);

    const conserve_resources =
        2 *
        Math.round(
            (N_RESOURCES *
                (Math.random() * (AI_CONSERVE[1] - AI_CONSERVE[0]) +
                    AI_CONSERVE[0])) /
                2
        );

    let remaining_troops = get_current_assignable(
        game_state.ai,
        conserve_resources
    );
    console.log(`\tWill randomly assign ${remaining_troops} troops.`);
    while (remaining_troops > 0) {
        const which_id = Math.floor(Math.random() * priority_castles.length);
        const castle_id = priority_castles[which_id];
        game_state.ai.troops[0][castle_id] += 1;
        remaining_troops -= 1;
        console.log(`\tAssigning 1 troop to #${castle_id + 1}`);
    }
}

function ai_second_round_strategy() {
    let priority_castles = Array(N_CASTLES)
        .fill(null)
        .map((v, i) => [
            i,
            Math.abs(
                game_state.ai.troops[0][i] - game_state.player.troops[0][i]
            ) + Math.random(),
        ])
        .sort((e1, e2) => e1[1] - e2[1])
        .slice(0, AI_PRIORITIES[1])
        .map((v) => v[0]);

    console.log("Second round:");
    console.log(
        `\tPriority castles: ${priority_castles.map((v) => v + 1).sort()}`
    );

    console.log("Strategic phase");
    let remaining_troops = get_current_assignable(game_state.ai);
    for (let which_id = 0; which_id < priority_castles.length; which_id += 1) {
        const castle_id = priority_castles[which_id];
        const initial_diff =
            game_state.player.troops[0][castle_id] -
            game_state.ai.troops[0][castle_id];
        if (initial_diff >= 0) {
            console.log(
                `\tFor castle #${castle_id + 1} there is difference of ${initial_diff}.`
            );
            console.log(`\t\tStill have ${remaining_troops} troops.`);
            if (initial_diff < remaining_troops) {
                console.log("\t\tTrying to win.");
                game_state.ai.troops[1][castle_id] = initial_diff + 1;
            } else if (initial_diff == remaining_troops) {
                console.log("\t\tTrying for stalemate.");
                game_state.ai.troops[1][castle_id] = initial_diff;
            } else {
                console.log(
                    "\t\tSeems impossible to win or draw. Disabling priority for this castle"
                );
                game_state.ai.troops[1][castle_id] = 0;
                priority_castles.splice(castle_id, 1);
            }
            console.log(
                `\t\tUsing ${game_state.ai.troops[1][castle_id]} troops.`
            );
            remaining_troops =
                remaining_troops - game_state.ai.troops[1][castle_id];
        } else {
            console.log(`\tIn castle #${castle_id + 1} currently in lead.`);
            console.log("\t\tDoing nothing.");
        }
    }

    console.log("Random assignment phase");
    if (priority_castles.length < 1) {
        console.log("\tIt seems impossible to win. Disabling priorities.");
        priority_castles = Array(N_CASTLES)
            .fill(null)
            .map((v, i) => i);
    }

    remaining_troops = get_current_assignable(game_state.ai);
    while (remaining_troops > 0) {
        const which_id = Math.floor(Math.random() * priority_castles.length);
        const castle_id = priority_castles[which_id];
        game_state.ai.troops[1][castle_id] += 1;
        remaining_troops -= 1;
        console.log(`\tAssigning 1 troop to #${castle_id + 1}`);
    }
}

// events
const proceed_btn = document.getElementById("proceed");
proceed_btn.addEventListener("click", () => {
    ai_strategy();
    game_state.round = game_state.round + 1;
    if (game_state.round > 3) {
        reset_game_state();
        proceed_btn.innerHTML = ">";
        if (game_state.round == 2) {
            proceed_btn.setAttribute("title", "Proceed to the outcome.");
        } else {
            proceed_btn.setAttribute("title", "Proceed to the next round.");
        }
    } else if (game_state.round == 3) {
        proceed_btn.innerHTML = "<";
        proceed_btn.setAttribute("title", "Start new campaign.");
    }
    draw_game_state();
});
document.querySelectorAll(".troop-remove").forEach((e) => {
    e.addEventListener("click", (event) => {
        if (game_state.round == 3) return;
        const castle_id = parseInt(event.srcElement.id.split("-")[1]) - 1;
        if (game_state.player.troops[game_state.round - 1][castle_id] < 1)
            return;
        game_state.player.troops[game_state.round - 1][castle_id] -= 1;
        draw_game_state();
    });
});
document.querySelectorAll(".troop-add").forEach((e) => {
    e.addEventListener("click", (event) => {
        if (game_state.round == 3) return;
        const remaining_troops = get_current_assignable(game_state.player);
        if (remaining_troops < 1) return;
        const castle_id = parseInt(event.srcElement.id.split("-")[1]) - 1;
        game_state.player.troops[game_state.round - 1][castle_id] += 1;
        draw_game_state();
    });
});
/*const troop_inputs = document.querySelectorAll(".player-troop-input");
troop_inputs.forEach((e) => {
    e.addEventListener("change", (event) => {
        const elem_id = event.srcElement.id;
        const castle_id = parseInt(elem_id.split("-")[1]) - 1;
        const value = parseInt(document.getElementById(elem_id).value);
        game_state.player.troops[game_state.round - 1][castle_id] = value;
        let current_resources = get_current_resources(game_state.player);
        if (current_resources < 0) {
            while (current_resources < 0) {
                game_state.player.troops[game_state.round - 1][castle_id] -= 1;
                current_resources = get_current_resources(game_state.player);
            }
            document.getElementById(elem_id).value =
                "" + game_state.player.troops[game_state.round - 1][castle_id];
        }
        draw_game_state();
    });
});*/

// on load
// set styles and attributes
(() => {
    proceed_btn.setAttribute("title", "Proceed to the outcome.");

    document.querySelectorAll(".svg-ai-assigned").forEach((e) => {
        e.style.fill = AI_COLOR;
    });
    document.querySelectorAll(".svg-player-assigned").forEach((e) => {
        e.style.fill = PLAYER_COLOR;
    });
})();
// other on load
reset_game_state();
draw_game_state();
