const WebSocket = require('ws');
const Site = require("./../env");
const Log = require('../lib/log');
const SolPrice = require('../lib/sol_price');
const { get } = require('../lib/make_request');
const Audit = require('./audit');

/**
 * Pre-audit observer class.
 * This class observes token creation and trade events to determine if a token has fulfilled predefined conditions and is ready for audit.
 */
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

    /**
     * Stops observing a token.
     * @param {string} id - Token mint address.
     */
    static #stopObservation = (id) => {
        if (PreAuditObserver.#memory[id]) {
            let payload = {
                method: "unsubscribeTokenTrade",
                keys: [id]
            }
            PreAuditObserver.#ws.send(JSON.stringify(payload));
            clearTimeout(PreAuditObserver.#memory[id].TOO);
            clearInterval(PreAuditObserver.#memory[id].SDO);
            Log.flow(`PAO > Stopped observing '${PreAuditObserver.#memory[id].launchData.name}' at MC $${PreAuditObserver.#memory[id].observeData.mc}.`, 3);
            delete PreAuditObserver.#memory[id];
        }

    }

    /**
    * Starts observing a token.
    * @param {string} id - Token mint address.
    */
    static #startObservation = (id) => {
        let payload = {
            method: "subscribeTokenTrade",
            keys: [id]
        }
        PreAuditObserver.#ws.send(JSON.stringify(payload));
        Log.flow(`PAO > Now observing '${PreAuditObserver.#memory[id].launchData.name}' at MC $${PreAuditObserver.#memory[id].observeData.mc}.`, 3);
    }

    /**
     * Called when a new token is created.
     * @param {any} data - New token data. 
     */
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
                mc: (data.marketCapSol ?? 0) * SolPrice.get(),
                mcSol: data.marketCapSol ?? 0,
                startTime: Date.now(),
                price: 0,
                lastUpdated: Date.now(),
            };
            PreAuditObserver.#memory[id].observeData.holders[data.traderPublicKey.toString()] = data.initialBuy;
            PreAuditObserver.#startObservation(id);
        }
    }

    /**
     * Called when a new trade is made on observed token.
     * @param {*} data - Trade data.
     */
    static newTrade = (data) => {
        if (data.txType === "buy" || data.txType === "sell") {
            const id = data.mint.toString();
            const actor = data.traderPublicKey.toString();
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
                    PreAuditObserver.#memory[id].observeData.holders[actor] = data.newTokenBalance;
                    if (data.newTokenBalance <= 0) {
                        delete PreAuditObserver.#memory[id].observeData.holders[actor];
                    }
                }
                const mcSol = data.marketCapSol ?? 0;
                PreAuditObserver.#memory[id].observeData.mc = mcSol * SolPrice.get();
                PreAuditObserver.#memory[id].observeData.mcSol = mcSol;
                PreAuditObserver.#memory[id].observeData.price = data.solAmount / data.tokenAmount;
                if (PreAuditObserver.#memory[id].observeData.mc >= Site.PAO_MIN_MARKET_CAP) {
                    // Market cap limit reached
                    let row = structuredClone({
                        launchData: {...PreAuditObserver.#memory[id].launchData, mint: id},
                        observeData: PreAuditObserver.#memory[id].observeData,
                        totalSupply: 1,
                    });
                    PreAuditObserver.#stopObservation(id);
                    get(Site.SOLPRICE_API + "/coins/" + id, res => {
                        if (res.succ) {
                            row.totalSupply = res.message.total_supply;
                        }
                        row.cirSupply = Object.keys(row.observeData.holders).reduce((sum, key) => sum + row.observeData.holders[key], 0);
                        Object.keys(row.observeData.holders).forEach(key => {
                            row.observeData.holders[key] = (row.observeData.holders[key] / row.cirSupply) * 100;
                        });
                        Audit.addToQueue(row);
                    });
                }
            }
        }
    }
}

module.exports = PreAuditObserver;