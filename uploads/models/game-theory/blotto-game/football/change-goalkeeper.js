const KEEPERS = (() => {
    // goal keeper edit stuff
    let update_goalkeeper = document.getElementById("update-goalkeeper");

    let level = 1;
    let gloves = 1;

    let level_input = document.getElementById("goalkeeper-level");
    let gloves_input = document.getElementById("goalkeeper-gloves");
    level_input.value = level;
    gloves_input.value = gloves;

    document
        .getElementById("goalkeeper-level-down")
        .addEventListener("click", () => {
            if (level > 1) {
                level = level - 1;
                level_input.value = level;
            }
        });
    document
        .getElementById("goalkeeper-gloves-down")
        .addEventListener("click", () => {
            if (gloves > 1) {
                gloves = gloves - 1;
                gloves_input.value = gloves;
            }
        });
    document
        .getElementById("goalkeeper-level-up")
        .addEventListener("click", () => {
            level = level + 1;
            level_input.value = level;
        });
    document
        .getElementById("goalkeeper-gloves-up")
        .addEventListener("click", () => {
            gloves = gloves + 1;
            gloves_input.value = gloves;
        });

    function update_keeper(team, level, gloves) {
        team.goalkeeper.level = level;
        team.goalkeeper.gloves = gloves;
    }

    update_goalkeeper.addEventListener("click", () => {
        if (sent_message == away_team.goalkeeper.id) {
            update_keeper(
                away_team,
                parseInt(level_input.value),
                parseInt(gloves_input.value)
            );
        } else {
            update_keeper(
                home_team,
                parseInt(level_input.value),
                parseInt(gloves_input.value)
            );
        }
        level = 1;
        gloves = 1;
        level_input.value = level;
        gloves_input.value = gloves;
        change_goalkeeper_card.style.display = "none";
        refresh_pitch_flag = true;
        pitch_card.style.display = "block";
    });

    return {
        update: update_keeper,
    };
})();
