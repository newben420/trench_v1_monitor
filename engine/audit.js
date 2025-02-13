class Audit {
    /**
     * @type {any[]}
     */
    static #queue = [];

    /**
     * @type {boolean}
     */
    static #isRunning = false;

    /**
     * Adds data to audit queue
     * @param {any} data 
     */
    static addToQueue = (data) => {
        Audit.#queue.push(data);
        Audit.#run();
    }

    /**
     * Runs audit on queue
     */
    static #run = () => {
        if (Audit.#isRunning) {
            return;
        }
        Audit.#isRunning = true;
        while (Audit.#queue.length > 0) {
            const data = Audit.#queue.shift();
            // TODO
        }
        Audit.#isRunning = false;
    }

}

module.exports = Audit;