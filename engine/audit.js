const Site = require("../env");
const Log = require("../lib/log");
const { get } = require("../lib/make_request");
const { Res } = require("../lib/res");
const SolPrice = require("../lib/sol_price");

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
    static #run = async () => {
        if (Audit.#isRunning) {
            return;
        }
        Audit.#isRunning = true;
        while (Audit.#queue.length > 0) {
            const data = Audit.#queue.shift();
            const { launchData, observeData, totalSupply, cirSupply } = data;
            Log.flow(`Audit > '${data.launchData.name}'.`, 1);
            console.log(data);
            // prerequites
            let banCreator = false;
            let errorMessage = "";
            let compute = {
                deployerHasOtherTokens: false,
                deployerTotalTokens: 1,
                deployAllTokensAboveMCTheshPerc: 0,
                deployerSoldSome: false,
            };

            // audit functions
            const checkDeployerOtherTokens = () => {
                return new Promise((fx, reject) => {
                    get(`${Site.SOLPRICE_API}/coins/user-created-coins/${launchData.traderPublicKey}?limit=2000&offset=0`, res => {
                        if (!res.succ) {
                            fx(res);
                        }
                        else {
                            let totalTokens = res.message.length;
                            compute.deployerHasOtherTokens = totalTokens > 1;
                            compute.deployerTotalTokens = totalTokens;
                            let ratio = res.message.filter(token => (parseFloat(token.market_cap) * SolPrice.get()) >= Site.AU_CREATOR_OTHER_TOKENS_MC_THRESH).length / totalTokens;
                            compute.deployAllTokensAboveMCTheshPerc = ratio / totalTokens * 100;
                            fx(new Res(true));
                        }
                    });
                });
            }

            checkIfDeployerSoldSome = () => {
                compute.deployerSoldSome = (cirSupply * (observeData.holders[launchData.traderPublicKey] ?? 0)) < launchData.initialBuy;
                return compute.deployerSoldSome;
            }

            // audit flows
            const succDepOtherTokens = await checkDeployerOtherTokens();
            const depSoldSome = checkIfDeployerSoldSome();
            console.log(succDepOtherTokens, depSoldSome);
            console.log(compute);
            
        }
        Audit.#isRunning = false;
    }

}

module.exports = Audit;