const Persistence = require("./persistence");
const Log = require("./log");

/**
 * 
 * @param {Function} callback - a boolean parameter callback function.
 */
const main = async (callback) => {
    const init = (await Persistence.init());
    if(init) {
        Log.flow(`Init > Successful.`, 0);
    }
    else{
        Log.flow(`Init > Failed.`, 0);
    }
    callback(init);
}

module.exports = main;