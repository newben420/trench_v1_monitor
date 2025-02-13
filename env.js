const { config } = require("dotenv");
config();
const path = require("path");
const rootDir = require("./root");

class Site {
    static HTTP_TIMEOUT = parseInt(process.env.HTTP_TIMEOUT || "30000");
    static PRODUCTION = process.env.PRODUCTION == "true";
    static MAX_FLOW_LOG_WEIGHT = parseInt(process.env.MAX_FLOW_LOG_WEIGHT || "5");
    static PORT = parseInt(process.env.PORT || "5000");
    static BACKUP_INTERVAL_MS = parseInt(process.env.BACKUP_INTERVAL_MS || "60000");
    static WS_URL = process.env.WS_URL ?? "";
    static PERSISTENCE_DIRECTORY = path.resolve(rootDir(), `storage${process.env.PERSISTENCE_DIRECTORY ? `_${process.env.PERSISTENCE_DIRECTORY}` : ''}`);
}

module.exports = Site;