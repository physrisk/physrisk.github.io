let home_team = null;
let away_team = null;
let match = null;
let refresh_pitch_flag = false;

function do_reset_match() {
    match = {
        has_started: false,
        sections: Array(9)
            .fill(null)
            .map(() => {
                return { resolved: false };
            }),
    };
    refresh_pitch_flag = true;
}
do_reset_match();

function do_reset_teams(which = "both", refresh = true) {
    let returns = [];
    if (which == "both" || which == "home") {
        home_team = {
            id: "home",
            name: "You",
            goals: 0,
            opportunities: 0,
            scores: Array(5).fill(0),
            advantages: 0,
            n_players: 0,
            sections: Array(9)
                .fill(null)
                .map(() => {
                    return {
                        players: [],
                    };
                }),
            goalkeeper: {
                id: "player-home-gk",
                role: 2,
                level: 1,
                gloves: 1,
                saved: 0,
            },
        };
        returns.push(home_team);
    }
    if (which == "both" || which == "away") {
        away_team = {
            id: "away",
            name: "CPU",
            goals: 0,
            opportunities: 0,
            scores: Array(5).fill(0),
            advantages: 0,
            n_players: 0,
            sections: Array(9)
                .fill(null)
                .map(() => {
                    return {
                        players: [],
                    };
                }),
            goalkeeper: {
                id: "player-away-gk",
                role: 2,
                level: 1,
                gloves: 1,
                saved: 0,
            },
        };
        returns.push(away_team);
    }
    refresh_pitch_flag = refresh;
    return returns;
}
do_reset_teams();

function do_save_teams() {
    if (match.has_started) {
        return;
    }
    window.localStorage.setItem("home_team", JSON.stringify(home_team));
    window.localStorage.setItem("away_team", JSON.stringify(away_team));
}

let sent_message = false;

let player_card = document.getElementById("player-card");
let load_eleven_team_card = document.getElementById("load-eleven-team-card");
let change_goalkeeper_card = document.getElementById("change-goalkeeper-card");
let menu_card = document.getElementById("menu-card");
let pitch_card = document.getElementById("pitch-card");

pitch_card.style.display = "block";
