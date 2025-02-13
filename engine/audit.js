const Log = require("../lib/log");

/**
 * Audit class
 * This class is responsible for auditing tokens.
 */
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
            Log.flow(`Audit > '${data.launchData.name}'.`, 1);
            // TODO - CONTINUE FROM HERE
        }
        Audit.#isRunning = false;
    }

}

module.exports = Audit;