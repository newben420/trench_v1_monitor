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
                holders: {},
                mc: data.marketCapSol ?? 0,
                startTime: Date.now(),
                lastUpdated: Date.now(),
            };
            PreAuditObserver.#memory[id].observeData.holders[id] = data.initialBuy;
            PreAuditObserver.#startObservation(id);
        }
    }

    static newTrade = (data) => {
        if (data.txType === "buy" || data.txType === "sell") {
            const id = data.mint;
            const actor = data.traderPublicKey;
            if (PreAuditObserver.#memory[id]) {
                PreAuditObserver.#memory[id].observeData.lastUpdated = Date.now();
                if (data.txType === "buy") {
                    // buy trade
                    PreAuditObserver.#memory[id].observeData.buys++;
                    PreAuditObserver.#memory[id].observeData.holders[actor] = data.newTokenBalance;
                }
                else {
                    // sell trade
                    PreAuditObserver.#memory[id].observeData.sells++;
                    PreAuditObserver.#memory[id].observeData.holders[actor] -= data.tokenAmount;
                    // TODO - update to represent actual remaining sol amt below...and above, use actual from data
                    PreAuditObserver.#memory[id].observeData.holders[actor] = data.newTokenBalance;
                    if (data.newTokenBalance <= 0) {
                        delete PreAuditObserver.#memory[id].observeData.holders[actor];
                    }
                }
                const mcSol = data.marketCapSol;
                // TODO - keep track of market cap
                // TODO - update market cap, convert to USD and check if audit should be triggered or not
                // TODO -  before audit is triggered, calculate total supply so as to determine percentages of each holder to use in audit
            }
        }
        // TODO - remove below console.log when no longer needed
        console.log(data);
    }
}

module.exports = PreAuditObserver;