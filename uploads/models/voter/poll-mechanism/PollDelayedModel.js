class PollDelayedModel {
    constructor(
        epsi_0 = 1,
        epsi_1 = 1,
        n_agents = 1000,
        x_0 = 0.5,
        tau = 1e-4,
        period_steps = 10,
        seed = -1
    ) {
        this.start_poll = 0;
        this.epsi_0 = epsi_0;
        this.epsi_1 = epsi_1;
        this.n_agents = n_agents;
        this.set_periods(tau, period_steps);
        this.set_initial_condition(x_0, x_0);
        this.set_seed(seed);
    }
    set_periods(tau = 1e-4, period_steps = 10) {
        this.tau = tau;
        this.period_steps = period_steps;
        this.step_duration = this.tau / period_steps;
    }
    set_seed(seed = -1) {
        if (seed < 0) {
            this.rng = new Random();
        } else {
            this.rng = new Random(seed);
        }
    }
    set_initial_condition(x_0 = 0.5, prev_poll = -1) {
        let state = Math.round(x_0 * this.n_agents);
        let poll = state;
        if (prev_poll >= 0 && prev_poll <= 1) {
            poll = Math.round(prev_poll * this.n_agents);
        }
        this.x = state;
        this.cur_poll = state;
        this.prev_poll = poll;
        this.history_x = [this.x];
        this.history_poll = [this.prev_poll];
    }
    sample_binomial(n, p) {
        let result = 0;
        for (let i = 0; i < n; i += 1) {
            if (this.rng.random() <= p) {
                result += 1;
            }
        }
        return result;
    }
    simulate_period() {
        const poll = this.prev_poll;
        const epsi_0_effective = this.epsi_0 + (this.n_agents - poll);
        const epsi_1_effective = this.epsi_1 + poll;
        const stationary_state =
            epsi_1_effective / (epsi_0_effective + epsi_1_effective);
        const rate_term = epsi_0_effective + epsi_1_effective;
        const exp_term = Math.exp(-rate_term * this.step_duration);
        for (let i = 0; i < this.period_steps; i += 1) {
            const prob_1 = stationary_state + (1 - stationary_state) * exp_term;
            const prob_0 = stationary_state - stationary_state * exp_term;
            const new_x =
                this.sample_binomial(this.x, prob_1) +
                this.sample_binomial(this.n_agents - this.x, prob_0);
            this.x = new_x;
            this.history_x.push(new_x);
            this.history_poll.push(poll);
        }
        this.prev_poll = this.cur_poll;
        this.cur_poll = this.x;
    }
    trim_history(n_polls) {
        if (n_polls <= 0) {
            this.history_x = [this.x];
            this.history_poll = [this.prev_poll];
            this.start_poll += (this.history_x.length - 1) / this.period_steps;
            return;
        }
        const max_length = n_polls * this.period_steps + 1;
        if (this.history_x.length > max_length) {
            const drop_elems = this.history_x.length - max_length;
            this.history_x.splice(0, drop_elems);
            this.history_poll.splice(0, drop_elems);
            this.start_poll += drop_elems / this.period_steps;
        }
    }
}
