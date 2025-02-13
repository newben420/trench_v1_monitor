const Persistence = require("./persistence");
const Log = require("./log");
/**
 * A function that 
 */

/**
 * Async function that initializes the application
 * @returns {Promise<boolean>} - A promise that resolves to true if successful, else false.
 */
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