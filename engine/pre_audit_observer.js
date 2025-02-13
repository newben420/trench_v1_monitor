const WebSocket = require('ws');
const Site = require("./../env");
const Log = require('../lib/log');

class PreAuditObserver {
    /**
     *@type {WebSocket}
     */
    static #ws;

    static #memory = {};

    /**
     * Registers web socket in Pre-audit Observer.
     * @param {*} ws 
     */
    static registerSocket = (ws) => {
        PreAuditObserver.#ws = ws;
    }

    static #stopObservation = (id) => {
        if (PreAuditObserver.#memory[id]) {
            let payload = {
                method: "unsubscribeTokenTrade",
                keys: [id]
            }
            PreAuditObserver.#ws.send(JSON.stringify(payload));
            clearTimeout(PreAuditObserver.#memory[id].TOO);
            clearInterval(PreAuditObserver.#memory[id].SDO);
            delete PreAuditObserver.#memory[id];
            Log.flow(`PAO > Stopped observing ${id}.`, 3);
        }

    }

    static #startObservation = (id) => {
        let payload = {
            method: "subscribeTokenTrade",
            keys: [id]
        }
        PreAuditObserver.#ws.send(JSON.stringify(payload));
        Log.flow(`PAO > Now observing ${id}.`, 3);
    }

    static newToken = (data) => {
        const tokensObserved = Object.keys(PreAuditObserver.#memory).length;
        if (tokensObserved < Site.PAO_MAX_TOKENS) {
            const id = data.mint;
            PreAuditObserver.#memory[id] = {}
            PreAuditObserver.#memory[id].TOO = setTimeout(() => {
                PreAuditObserver.#stopObservation(id);
            }, Site.PAO_TIMEOUT_MS);
            PreAuditObserver.#memory[id].SDO = setInterval(() => {
                if (PreAuditObserver.#memory[id]) {
                    if ((Date.now() - PreAuditObserver.#memory[id].observeData.lastUpdated) >= Site.PAO_SELF_DES_TIMEOUT_MS) {
                        PreAuditObserver.#stopObservation(id);
                    }
                }
            }, Site.PAO_SELF_DES_INTERVAL_MS);
            PreAuditObserver.#memory[id].launchData = { ...data, mint: undefined, txType: undefined };
            PreAuditObserver.#memory[id].observeData = {
                buys: 0,
                sells: 0,
                holders: [],
                mc: data.marketCapSol ?? 0,
                startTime: Date.now(),
                lastUpdated: Date.now(),
            };
            PreAuditObserver.#startObservation(id);
        }
    }

    static newTrade = (data) => {
        if (data.txType === "buy" || data.txType === "sell") {
            const id = data.mint;
            if (PreAuditObserver.#memory[id]){
                PreAuditObserver.#memory[id].observeData.lastUpdated = Date.now();
                // TODO
            }
        }
        console.log(data);
    }
}

module.exports = PreAuditObserver;