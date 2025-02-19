const init = require("./lib/init_function");
const killer = require("./lib/kill_process");
const Log = require("./lib/log");
const Persistence = require("./lib/persistence");
const WebSocket = require('ws');
const JSP = require("./lib/json_safe_parse");
const Site = require("./env");
const Blacklist = require("./engine/blacklist");
const PAO = require("./engine/pre_audit_observer");

/**
 * This is called if initialization is successful, to continue setting up.
 */
const proceedAfterInit = () => {
    const ws = new WebSocket(Site.WS_URL);
    ws.on('open', () => {
        PAO.registerSocket(ws);
        Log.flow(`WebSocket > Connected.`, 4);
        // Subscribing to token creation events
        let payload = {
            method: "subscribeNewToken",
        }
        ws.send(JSON.stringify(payload));
    });

    ws.on('close', () => {
        Log.flow(`WebSocket > Disconnected.`, 4);
    });

    ws.on('error', (err) => {
        Log.flow(`WebSocket > Error > ${err.message}`, 4);
    });

    ws.on('message', data => {
        const message = JSP(data);
        const keys = Object.keys(message);
        if (keys.length === 1 && keys[0] === 'message') {
            Log.flow(`WebSocket > Message > ${message.message}`, 4);
        }
        else {
            if (message.txType == "create") {
                // NEW TOKEN
                if (!Blacklist.check(message.traderPublicKey)) {
                    // Creator of this token is not blacklisted.
                    const valid = ((message.solAmount || message.solAmount === 0) ? (message.solAmount >= Site.LAUNCH_MIN_SOL) : false) &&
                    ((message.marketCapSol || message.marketCapSol === 0) ? (message.marketCapSol >= Site.LAUNCH_MIN_MC_SOL) : false) &&
                    ((message.vSolInBondingCurve || message.vSolInBondingCurve === 0) ? (message.vSolInBondingCurve >= Site.LAUNCH_MIN_SOL_BD) : false);
                    if(valid){
                        PAO.newToken(message);
                    }
                }
            }
            else{
                // OTHER SUBSCRIBED TRANSACTIONS
                PAO.newTrade(message);
            }
        }
    });
}

process.on('exit', (code) => {
    Persistence.exit();
});

process.on('SIGINT', () => {
    Log.flow('Process > Received SIGINT.');
    process.exit(0);
});

process.on('SIGTERM', () => {
    Log.flow('Process > Received SIGTERM.');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    Log.flow('Process > Unhandled exception caught.');
    console.log(err);
    process.exit(1);
});


init(succ => {
    if (succ) {
        proceedAfterInit();
    }
    else {
        killer();
    }
});