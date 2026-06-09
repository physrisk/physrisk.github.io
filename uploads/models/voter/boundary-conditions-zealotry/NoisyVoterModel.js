class NoisyVoterModel {
    constructor(
        epsi_0 = 1,
        epsi_1 = 1,
        x_initial = 500,
        z_0 = 0,
        z_1 = 0,
        min_boundary = -1,
        max_boundary = -1,
        n_agents = 1000
    ) {
        this.epsi_0 = epsi_0;
        this.epsi_1 = epsi_1;
        this.zealots_0 = z_0;
        if (this.zealots_0 < 0) {
            this.zealots_0 = 0;
        }
        this.zealots_1 = z_1;
        if (this.zealots_1 < 0) {
            this.zealots_1 = 0;
        }
        this.min_boundary = min_boundary;
        if (this.min_boundary < 0) {
            this.min_boundary = 0;
        }
        this.max_boundary = max_boundary;
        if (this.max_boundary < 0) {
            this.max_boundary = n_agents;
        }
        this.n_agents = n_agents;
        this.initialize(x_initial);
    }
    initialize(x_initial) {
        this.last_x = x_initial;
        this.x = x_initial;
        this.t = 0;
    }
    to_1_rate(x = null) {
        if (x === null) {
            x = this.x;
        }
        const x_0 = this.n_agents - x;
        const x_1 = x;
        return Math.max((x_0 - this.zealots_0) * (this.epsi_1 + x_1), 0);
    }
    to_0_rate(x = null) {
        if (x === null) {
            x = this.x;
        }
        const x_0 = this.n_agents - x;
        const x_1 = x;
        return Math.max((x_1 - this.zealots_1) * (this.epsi_0 + x_0), 0);
    }
    step(until_time) {
        while (this.t < until_time) {
            this.single_step();
        }
        return this.last_x;
    }
    single_step() {
        const to_1_rate = this.to_1_rate();
        const to_0_rate = this.to_0_rate();
        const total_rate = to_1_rate + to_0_rate;

        const dt = jStat.exponential.sample(total_rate);

        this.last_x = this.x;
        if (jStat.uniform.sample(0, 1) < to_1_rate / total_rate) {
            this.x = this.x + 1;
        } else {
            this.x = this.x - 1;
        }
        this.x = Math.min(
            Math.max(this.x, this.min_boundary),
            this.max_boundary
        );
        this.t = this.t + dt;
    }
}
