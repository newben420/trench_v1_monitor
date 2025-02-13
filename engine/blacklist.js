const path = require("path");
const fs = require("fs");
const Site = require("./../env");
const JSP = require("./../lib/json_safe_parse");
const Log = require("./../lib/log");
/**
 * Manages creator blacklist operations.
 */
class BlacklistDriver {

    static #list = [];
    static #path = path.resolve(Site.PERSISTENCE_DIRECTORY, "blacklist.json");
    static #changes = false;

    /**
     * Adds creator address to blacklist
     * @param {string} address 
     * @returns {Promise<boolean>}
     */
    static add = (address) => {
        return new Promise((resolve, reject) => {
            if (BlacklistDriver.#list.indexOf(address) === -1) {
                BlacklistDriver.#list.push(address);
                BlacklistDriver.#changes = true;
            }
            resolve(true);
        });
    }

    /**
     * Removes creator addressfrom blaclist.
     * @param {string} address 
     * @returns {Promise<boolean>}
     */
    static remove = (address) => {
        return new Promise((resolve, reject) => {
            const index = BlacklistDriver.#list.indexOf(address);
            if (index !== -1) {
                BlacklistDriver.#list.splice(index, 1);
                BlacklistDriver.#changes = true;
            }
            resolve(true);
        });
    }

    /**
     * Checks if creator address is blacklisted.
     * @param {string} address 
     * @returns {boolean} - true if blacklisted, else false.
     */
    static check = (address) => BlacklistDriver.#list.indexOf(address) !== -1;

    /**
     * Ensures the driver is initialized.
     * @returns {Promise<boolean>}
     */
    static init = () => {
        return new Promise(async (resolve, reject) => {
            if (fs.existsSync(BlacklistDriver.#path)) {
                fs.readFile(BlacklistDriver.#path, "utf8", (err, data) => {
                    if (err) {
                        Log.dev(err);
                        Log.flow(`Persistence > Init > Blacklist error '${err.message}'.`, 0);
                        resolve(false);
                    }
                    else {
                        BlacklistDriver.#list = JSP(data, true);
                        resolve(true);
                    }
                });
            }
            else {
                resolve(await BlacklistDriver.save());
            }
        });
    }

    /**
     * Persists driver data.
     * @param {boolean} exit - if called on process exit.
     * @returns {Promise<boolean>}
     */
    static save = (exit = false) => {
        if(exit){
            if(BlacklistDriver.#changes){
                fs.writeFileSync(BlacklistDriver.#path, JSON.stringify(BlacklistDriver.#list), "utf8");
            }
        }
        return new Promise((resolve, reject) => {
            if(!exit && BlacklistDriver.#changes){
                fs.writeFile(BlacklistDriver.#path, JSON.stringify(BlacklistDriver.#list), "utf8", (err) => {
                    if (err) {
                        Log.dev(err);
                        resolve(false);
                    }
                    else {
                        BlacklistDriver.#changes = false;
                        resolve(true);
                    }
                });
            }
            else{
                resolve(true);
            }
        });
    }
}

module.exports = BlacklistDriver;