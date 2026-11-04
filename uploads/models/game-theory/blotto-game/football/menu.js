(() => {
    // menu related stuff
    let section_clicked = false;
    let section_number = false;
    let player_clicked = false;

    let start_match = document.getElementById("start-match");
    let start_match_tooltip = document.getElementById("start-match-tooltip");
    let reset_match = document.getElementById("reset-match");
    let add_player = document.getElementById("add-player");
    let add_player_tooltip = document.getElementById("add-player-tooltip");
    let remove_player = document.getElementById("remove-player");
    let remove_player_tooltip = document.getElementById(
        "remove-player-tooltip"
    );
    let change_goalkeeper = document.getElementById("change-goalkeeper");
    let close_menu = document.getElementById("close-menu");

    reset_match.addEventListener("click", () => {
        let temp = window.localStorage.getItem("home_team");
        if (temp !== null) {
            home_team = JSON.parse(temp);
        }
        do_reset_teams("away");
        do_reset_match();
        close("pitch");
    });

    start_match.addEventListener("click", () => {
        if (home_team.n_players != 10) {
            close("pitch");
            return;
        }
        if (away_team.n_players != 10) {
            TEAMS.load_eleven_team();
        }
        do_save_teams();
        match.has_started = true;
        RESOLVER.resolve_match();
        close("pitch");
    });

    function open_menu(event) {
        section_clicked = this.id;
        section_number = 0;
        player_clicked = event.target.id;
        if (section_clicked == player_clicked) {
            player_clicked = false;
        }

        document
            .querySelectorAll("#menu-card button")
            .forEach((v) => (v.disabled = false));

        change_goalkeeper.disabled = match.has_started;
        reset_match.disabled = !match.has_started;

        add_player.disabled = match.has_started | (home_team.n_players >= 10);
        add_player_tooltip.title = "";
        if (home_team.n_players >= 10) {
            add_player_tooltip.title =
                "You can't add players until you remove some.";
        }

        start_match.disabled = match.has_started | (home_team.n_players != 10);
        start_match_tooltip.title = "You may start the match.";
        if (match.has_started) {
            start_match_tooltip.title =
                "Reset current match before starting new one.";
        }
        if (home_team.n_players != 10) {
            start_match_tooltip.title = `You need to have exactly 10 outfield players to start the match (currently ${home_team.n_players}).`;
        }

        remove_player.disabled =
            match.has_started ||
            player_clicked === false ||
            player_clicked === "" ||
            player_clicked.split("-")[1] == "away";
        remove_player_tooltip.title = "";
        if (!match.has_started && remove_player.disabled) {
            remove_player_tooltip.title =
                "You may remove your players if you click on them.";
        }

        let menu_title = "";
        switch (section_clicked) {
            case "pitch-away-gk":
                section_number = 10;
                menu_title = "Away Goalkeeper";
                add_player.disabled = true;
                remove_player.disabled = true;
                player_clicked = "player-away-gk";
                break;
            case "pitch-home-gk":
                section_number = 11;
                menu_title = "Home Goalkeeper";
                add_player.disabled = true;
                remove_player.disabled = true;
                player_clicked = "player-home-gk";
                break;
            case "pitch-ca":
                section_number = 1;
                menu_title = "Central Attack section";
                break;
            case "pitch-cm":
                section_number = 4;
                menu_title = "Central Midfield section";
                break;
            case "pitch-cd":
                section_number = 7;
                menu_title = "Central Defence section";
                break;
            case "pitch-lwa":
                section_number = 0;
                menu_title = "Left Attack section";
                break;
            case "pitch-lwm":
                section_number = 3;
                menu_title = "Left Midfield section";
                break;
            case "pitch-lwd":
                section_number = 6;
                menu_title = "Left Defence section";
                break;
            case "pitch-rwa":
                section_number = 2;
                menu_title = "Right Attack section";
                break;
            case "pitch-rwm":
                section_number = 5;
                menu_title = "Right Midfield section";
                break;
            case "pitch-rwd":
                section_number = 8;
                menu_title = "Right Defence section";
                break;
        }
        document.getElementById("menu-title").innerHTML = menu_title;

        pitch_card.style.display = "none";
        menu_card.style.display = "block";
    }
    document
        .querySelectorAll(
            ".pitch-section, .pitch-section-wing, .pitch-section-gk"
        )
        .forEach((v) => v.addEventListener("click", open_menu));

    function close(destination, message = false) {
        switch (destination) {
            case "pitch":
                pitch_card.style.display = "block";
                refresh_pitch_flag = true;
                break;
            case "change-goalkeeper":
                change_goalkeeper_card.style.display = "block";
                break;
            case "add-player":
                player_card.style.display = "block";
                break;
            case "load-eleven-team":
                load_eleven_team_card.style.display = "block";
                break;
        }
        menu_card.style.display = "none";
        sent_message = message;
        player_clicked = false;
        section_clicked = false;
        section_number = false;
    }
    close_menu.addEventListener("click", () => {
        close("pitch");
    });

    change_goalkeeper.addEventListener("click", () => {
        player_clicked = "player-home-gk";
        close("change-goalkeeper", player_clicked);
    });
    add_player.addEventListener("click", () => {
        close("add-player", section_number);
    });
    remove_player.addEventListener("click", () => {
        if (player_clicked.split("-")[1] == "home") {
            home_team.sections[section_number].players = home_team.sections[
                section_number
            ].players.filter((v) => {
                if (v.id === player_clicked) {
                    home_team.n_players = home_team.n_players - 1;
                    return false;
                }
                return true;
            });
        }
        close("pitch");
    });
})();
