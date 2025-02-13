const Site = require("../env");
const Log = require("./log");
const fs = require("fs");

/**
 * This handles major persistenc operations.
 */
class Persistence {
    /**
     * Handles initialization of persistence at load.
     * @returns Promise<boolean>} - A promise that resolves to true if everything works okay.
     */
    static init = () => {
        /**
         * Async function that ensures persistence directory is created.
         * @returns Promise<boolean>} - A promise that resolves to true if everything works okay.
         */
        const main = () => {
            return new Promise((resolve, reject) => {
                if (fs.existsSync(Site.PERSISTENCE_DIRECTORY)) {
                    Log.flow(`Persistence > Init > Directory exists.`, 0);
                    resolve(true);
                }
                else {
                    fs.mkdir(Site.PERSISTENCE_DIRECTORY, {
                        recursive: false,
                    }, err => {
                        if (err) {
                            Log.dev(err);
                            Log.flow(`Persistence > Init > Directory creation failed with ${err.message}.`, 0);
                            resolve(false);
                        }
                        else {
                            Log.flow(`Persistence > Init > Directory created.`, 0);
                            resolve(true);
                        }
                    });
                }
            });
        }

        return new Promise(async (resolve, reject) => {
            resolve((await main()))
        });
    }

    /**
     * This method is called on process exit so everything can be cleaned.
     */
    static exit = () => {
        Log.flow(`Persistence > Exit > Cleaning up.`, 0);
    }
}

module.exports = Persistence;