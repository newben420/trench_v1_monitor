const Site = require("./../env");
const GDT = require("./get_date_time");

class Log {
    /**
     * Logs to stdout in development.
     * @param {any} message 
     */
    static dev = (message) => {
        if(!Site.PRODUCTION){
            console.log(message);
        }
    }

    /**
     * 
     * @param {string} message - message to log. 
     * @param {number} weight - weight of log from 1.
     */
    static flow = (message, weight = 0) => {
        if(Site.MAX_FLOW_LOG_WEIGHT >= weight){
            console.log(`${GDT()} FLOW: ${message}`);
        }
    }
}

module.exports = Log;