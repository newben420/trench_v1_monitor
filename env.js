const { config } = require("dotenv");
config();

class Site {
    static HTTP_TIMEOUT = parseInt(process.env.HTTP_TIMEOUT || "30000");
    static PRODUCTION = process.env.PRODUCTION == "true";
    static MAX_FLOW_LOG_WEIGHT = parseInt(process.env.MAX_FLOW_LOG_WEIGHT || "5");
    static PORT = parseInt(process.env.PORT || "5000");
}

module.exports = Site;