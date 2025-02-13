const Site = require("../env");
const Log = require("./log");
const { get } = require("./make_request");


class SolPrice {
    static #current = 0;

    /**
     * 
     * @returns {number} - Current price of Sol.
     */
    static getPrice = () => {
        return SolPrice.#current;
    }

    static #run = () => {
        get(Site.SOLPRICE_API, res => {
            if(res.succ){
                SolPrice.#current = res.message.solPrice;
            }
            setTimeout(() => {
                SolPrice.#run();
            }, Site.SOLPRICE_INTERVAL_MS);
        });
    }

    static init = () => {
        Log.flow("SolPrice > Init.", 0);
        SolPrice.#run();
        return true;
    }
}

module.exports = SolPrice;