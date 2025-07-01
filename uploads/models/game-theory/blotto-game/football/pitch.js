(() => {
    // pitch related stuff

    const SECTION_IDS = [
        "pitch-lwa",
        "pitch-ca",
        "pitch-rwa",
        "pitch-lwm",
        "pitch-cm",
        "pitch-rwm",
        "pitch-lwd",
        "pitch-cd",
        "pitch-rwd",
    ];

    function clear_pitch() {
        document
            .querySelectorAll(".home-part, .away-part, .pitch-section-gk")
            .forEach((v) => {
                while (v.firstChild) {
                    v.removeChild(v.lastChild);
                }
            });
    }

    function generate_player_html(id, team, role, level, scored, times = 0) {
        return `<div id="${id}" class="player ${team} ${role}${scored ? " scored" : ""}">${
            times == 0 ? "" : times + "x"
        }${level}</div>`;
    }

    function add_keepers(team) {
        let section = document.getElementById(`pitch-${team.id}-gk`);
        section.innerHTML = generate_player_html(
            team.goalkeeper.id,
            team.id,
            "goalkeeper",
            team.goalkeeper.level,
            false,
            team.goalkeeper.gloves - team.goalkeeper.saved
        );
    }

    function add_players(team) {
        let is_away_team = team.id == "away";
        for (let idx = 0; idx < team.sections.length; idx = idx + 1) {
            let s_id = idx;
            if (is_away_team) {
                s_id = team.sections.length - idx - 1;
            }
            if (team.sections[s_id].players.length >= 0) {
                let section_obj = document.querySelector(
                    `#${SECTION_IDS[idx]} .${team.id}-part`
                );
                team.sections[s_id].players.forEach((v) => {
                    section_obj.innerHTML =
                        section_obj.innerHTML +
                        generate_player_html(
                            v.id,
                            team.id,
                            v.role == 0 ? "attack" : "defence",
                            v.level,
                            v.scored
                        );
                });
            }
        }
    }

    function process_score() {
        const mask_unstarted = (v) => (match.has_started ? v : "-");
        document.getElementById("pitch-score-line").innerHTML =
            `${home_team.name} ${mask_unstarted(home_team.goals)}:${mask_unstarted(
                away_team.goals
            )} ${away_team.name}`;
    }

    function process_resolved() {
        document.querySelectorAll(".resolved").forEach((v) => {
            v.classList.remove("resolved");
        });
        match.sections.forEach((s, i) => {
            if (s.resolved) {
                document
                    .getElementById(SECTION_IDS[i])
                    .classList.add("resolved");
            }
        });
    }

    function refresh_pitch(reset_timer = false) {
        if (refresh_pitch_flag) {
            do_save_teams();
            clear_pitch();
            process_score();
            add_keepers(home_team);
            add_keepers(away_team);
            add_players(home_team);
            add_players(away_team);
            process_resolved();
            refresh_pitch_flag = false;
        }
        if (reset_timer) {
            setTimeout(refresh_pitch, 100, true);
        }
    }

    refresh_pitch_flag = true;
    setTimeout(refresh_pitch, 100, true);
})();
