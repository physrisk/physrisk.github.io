const VAR_INF = 200;
const VAR_NEG = -1;

function calculate_noise_variance(epsi_0, epsi_1, n_agents, tau) {
    const phi_1 = Math.exp(-(epsi_0 + epsi_1 + n_agents) * tau);
    const epsi_sum = epsi_0 + epsi_1;
    const numerator =
        -epsi_1 *
        epsi_0 *
        n_agents *
        (epsi_sum - n_agents * (-2 + phi_1)) *
        (epsi_sum + epsi_sum * phi_1 + 2 * n_agents * phi_1) *
        (-1 + Math.pow(phi_1, 2));

    const denominator =
        epsi_sum *
        (Math.pow(epsi_sum, 3) * (1 + phi_1) +
            Math.pow(n_agents, 2) * phi_1 * (1 + phi_1) +
            epsi_sum *
                n_agents *
                (1 + phi_1 * (-1 - 2 * n_agents * (-2 + phi_1) + 4 * phi_1)) +
            Math.pow(epsi_sum, 2) *
                (2 * Math.pow(phi_1, 2) +
                    n_agents * (2 - (-3 + phi_1) * phi_1)));

    return numerator / denominator;
}

function calculate_stationary_var(epsi_0, epsi_1, n_agents, tau) {
    const phi_1 = Math.exp(-(epsi_0 + epsi_1 + n_agents) * tau);
    const phi_2 = ((1 - phi_1) * n_agents) / (epsi_0 + epsi_1 + n_agents);
    if (phi_1 < -1 + phi_2 || 1 - phi_2 < phi_1) {
        return VAR_NEG;
    }
    const noise_variance = calculate_noise_variance(
        epsi_0,
        epsi_1,
        n_agents,
        tau
    );
    const numerator = (1 - phi_2) * noise_variance;
    const denominator = (1 + phi_2) * (1 - phi_1 * phi_1 + phi_2 * (phi_2 - 2));
    let result = numerator / denominator;
    result = (isFinite(result) && result) || VAR_INF;
    return result;
}
