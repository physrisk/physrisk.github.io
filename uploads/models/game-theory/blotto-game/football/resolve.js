const RESOLVER = (() => {
    const LW_ZONE = 0;
    const RW_ZONE = 1;
    const CA_ZONE = 2;
    const CM_ZONE = 3;
    const CD_ZONE = 4;
    const ZONES = [LW_ZONE, RW_ZONE, CA_ZONE, CM_ZONE, CD_ZONE];
    const OPPOSITE_ZONES = [RW_ZONE, LW_ZONE, CD_ZONE, CM_ZONE, CA_ZONE];
    const ZONE_SECTIONS = [[0, 3, 6], [2, 5, 8], [1], [4], [7]];
    const ZONE_NAMES = [
        "Left Wing",
        "Right Wing",
        "Central Attack",
        "Central Midfield",
        "Central Defense",
    ];
    const SECTION_ZONES = [
        LW_ZONE,
        CA_ZONE,
        RW_ZONE,
        LW_ZONE,
        CM_ZONE,
        RW_ZONE,
        LW_ZONE,
        CD_ZONE,
        RW_ZONE,
    ];

    function sort_team_players(team, role, section_ids) {
        let players = [];
        section_ids.forEach((s_id) => {
            team.sections[s_id].players.forEach((p) => {
                if (p.role == role) {
                    players.push(p);
                }
            });
        });

        return players.sort((v1, v2) => {
            let p2 = v2.level * 100 + 10 - v2.section_id + v2.luck;
            let p1 = v1.level * 100 + 10 - v1.section_id + v1.luck;
            return p2 - p1;
        });
    }

    function resolve_exchange(attack_team, defense_team, section_ids) {
        let defense_section_ids = section_ids.map(
            (v) => defense_team.sections.length - v - 1
        );

        let attack_players = sort_team_players(attack_team, 0, section_ids);
        let defense_players = sort_team_players(
            defense_team,
            1,
            defense_section_ids
        );

        console.log(
            `    ${attack_team.id} team has [${attack_players.map(
                (v) => v.level
            )}] level players on attack.`
        );
        console.log(
            `    ${defense_team.id} team has [${defense_players.map(
                (v) => v.level
            )}] level players on defense.`
        );

        let defense_idx = 0;
        attack_players.forEach((att) => {
            let active_defense = { id: "noone", level: 0, used: 0 };
            if (defense_idx < defense_players.length) {
                active_defense = JSON.parse(
                    JSON.stringify(defense_players[defense_idx])
                );
            }
            if (att.level > active_defense.level) {
                if (
                    att.level <= defense_team.goalkeeper.level &&
                    defense_team.goalkeeper.saved <
                        defense_team.goalkeeper.gloves
                ) {
                    defense_team.goalkeeper.saved =
                        defense_team.goalkeeper.saved + 1;
                    console.log(
                        `    Shot by [A${
                            att.level
                        }] was saved by the keeper [G${
                            defense_team.goalkeeper.level
                        }x${
                            defense_team.goalkeeper.gloves -
                            defense_team.goalkeeper.saved
                        }].`
                    );
                } else {
                    console.log(`    [A${att.level}] goal!`);
                    att.scored = true;
                    attack_team.goals = attack_team.goals + 1;
                    attack_team.opportunities = attack_team.opportunities + 1;
                }
            } else {
                defense_idx = defense_idx + 1;
                console.log(
                    `    [A${att.level}] was blocked by [D${active_defense.level}].`
                );
            }
        });
    }

    function resolve_zone(zone_id) {
        console.log(`  Resolving ${ZONE_NAMES[zone_id]}:`);

        let resolve_sections = ZONE_SECTIONS[zone_id];
        if (!match.sections[resolve_sections[0]].resolved) {
            resolve_sections.forEach((s_id) => {
                match.sections[s_id].resolved = true;
            });
            resolve_exchange(home_team, away_team, resolve_sections);

            resolve_sections = ZONE_SECTIONS[OPPOSITE_ZONES[zone_id]];
            resolve_exchange(away_team, home_team, resolve_sections);
        }

        refresh_pitch_flag = true;
    }

    function resolve_match() {
        console.log("Resolving Match!");
        ZONES.forEach((zone_id) => {
            resolve_zone(zone_id, false);
        });
    }

    return {
        SECTION_ZONES: SECTION_ZONES,
        resolve_match: resolve_match,
    };
})();
