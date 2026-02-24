const PLAYERS = (() => {
    // player card events
    let home_team_indicator = true;
    let home_input = document.getElementById("player-home");
    home_input.classList.add("selected");

    let attack_indicator = true;
    let attack_input = document.getElementById("player-attack");
    let defence_input = document.getElementById("player-defence");
    if (attack_indicator) {
        attack_input.classList.add("selected");
    } else {
        defence_input.classList.add("selected");
    }
    attack_input.addEventListener("click", () => {
        if (!attack_indicator) {
            defence_input.classList.remove("selected");
            attack_input.classList.add("selected");
        }
        attack_indicator = !attack_indicator;
    });
    defence_input.addEventListener("click", () => {
        if (attack_indicator) {
            attack_input.classList.remove("selected");
            defence_input.classList.add("selected");
        }
        attack_indicator = !attack_indicator;
    });

    let level = 1;
    let level_input = document.getElementById("player-level");
    level_input.value = level;
    document.getElementById("player-level-up").addEventListener("click", () => {
        level = level + 1;
        level_input.value = level;
    });
    document
        .getElementById("player-level-down")
        .addEventListener("click", () => {
            if (level > 1) {
                level = level - 1;
                level_input.value = level;
            }
        });

    function close() {
        player_card.style.display = "none";
        pitch_card.style.display = "block";
    }
    document
        .getElementById("player-card-close")
        .addEventListener("click", () => {
            close();
        });
    let add_player_counter = 0;
    function add_player(team, section_id, level, mode) {
        if (team.id == "away") {
            section_id = team.sections.length - section_id - 1;
        }
        team.n_players = team.n_players + 1;
        add_player_counter = add_player_counter + 1;
        team.sections[section_id].players.push({
            id: `player-${team.id}-${add_player_counter}`,
            section_id: section_id,
            role: mode,
            level: level,
            luck: Math.random(),
            scored: false,
        });
    }
    document.getElementById("player-card-add").addEventListener("click", () => {
        let section_id = sent_message;
        let level = parseInt(level_input.value);
        let mode = attack_indicator ? 0 : 1;
        add_player(
            home_team_indicator ? home_team : away_team,
            section_id,
            level,
            mode
        );
        refresh_pitch_flag = true;
        close();
    });
    return {
        add: add_player,
    };
})();
