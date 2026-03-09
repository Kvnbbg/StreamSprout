class Telemetry {
    constructor() {
        this.counters = {
            ticks: 0,
            aiFallbacks: 0,
        };
    }

    inc(name) {
        this.counters[name] = (this.counters[name] || 0) + 1;
    }
}

module.exports = { Telemetry };
