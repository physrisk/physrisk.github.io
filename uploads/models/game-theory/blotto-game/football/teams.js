const TEAMS = (() => {
    let team_data = [];

    fetch("./data/teams.csv")
        .then((response) => response.text())
        .then((data) => {
            let lines = data.trim().split("\n");
            team_data = lines.map((v) => v.split(","));
        });

    function load_eleven_team() {
        let _team = do_reset_teams(away_team.id, false)[0];
        let pick = Math.floor(Math.random() * team_data.length);
        let team_name = team_data[pick][0];
        let form = team_data[pick][1].split(";").map((v) => v.split(" "));
        KEEPERS.update(_team, parseInt(form[0][0]), parseInt(form[0][1]));
        for (let section_id = 0; section_id < 9; section_id += 1) {
            let form_idx = 9 - section_id;
            if (form[form_idx][0] == "") {
                continue;
            }
            let true_section_id = section_id;
            if (away_team.id == "away") {
                true_section_id = 8 - section_id;
            }
            for (let p_id = 0; p_id < form[form_idx].length; p_id += 1) {
                let level = parseInt(form[form_idx][p_id][1]);
                let mode = form[form_idx][p_id][0] == "a" ? 0 : 1;
                PLAYERS.add(_team, true_section_id, level, mode);
            }
        }
        _team.name = team_name;
        refresh_pitch_flag = true;
    }

    return {
        load_eleven_team: load_eleven_team,
    };
})();
