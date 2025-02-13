const { config } = require("dotenv");
config();
const path = require("path");
const rootDir = require("./root");

/**
 * This class handles application configurations and parses env data into the right types and format.
 */
class Site {
    static HTTP_TIMEOUT = parseInt(process.env.HTTP_TIMEOUT || "30000");
    static PRODUCTION = process.env.PRODUCTION == "true";
    static MAX_FLOW_LOG_WEIGHT = parseInt(process.env.MAX_FLOW_LOG_WEIGHT || "5");
    static PORT = parseInt(process.env.PORT || "5000");
    static BACKUP_INTERVAL_MS = parseInt(process.env.BACKUP_INTERVAL_MS || "60000");
    static WS_URL = process.env.WS_URL ?? "";
    static PERSISTENCE_DIRECTORY = path.resolve(rootDir(), `storage${process.env.PERSISTENCE_DIRECTORY ? `_${process.env.PERSISTENCE_DIRECTORY}` : ''}`);
    static LAUNCH_MIN_SOL = parseFloat(process.env.LAUNCH_MIN_SOL || "0");
    static LAUNCH_MIN_MC_SOL = parseFloat(process.env.LAUNCH_MIN_MC_SOL || "0");
    static LAUNCH_MIN_SOL_BD = parseFloat(process.env.LAUNCH_MIN_SOL_BD || "0");
    static PAO_MIN_MARKET_CA = parseFloat(process.env.PAO_MIN_MARKET_CA || "100000");
    static PAO_TIMEOUT_MS = parseInt(process.env.PAO_TIMEOUT_MS || "360000");
    static PAO_SELF_DES_TIMEOUT_MS = parseInt(process.env.PAO_SELF_DES_TIMEOUT_MS || "10000");
    static PAO_SELF_DES_INTERVAL_MS  = parseInt(process.env.PAO_SELF_DES_INTERVAL_MS || "2000");
    static PAO_MAX_TOKENS = parseInt(process.env.PAO_MAX_TOKENS || "10") || Infinity;
}

module.exports = Site;