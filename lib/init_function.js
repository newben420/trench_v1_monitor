const Persistence = require("./persistence");
const Log = require("./log");
const SolPrice = require("./sol_price");
/**
 * 
 * @param {Function} callback - a boolean parameter callback function.
 */
const main = async (callback) => {
    const init = (await Persistence.init()) && SolPrice.init();
    if(init) {
        Log.flow(`Init > Successful.`, 0);
    }
    else{
        Log.flow(`Init > Failed.`, 0);
    }
    callback(init);
}

module.exports = main;