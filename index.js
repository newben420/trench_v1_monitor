const init = require("./lib/init_function");
const killer = require("./lib/kill_process");
const Log = require("./lib/log");
const Persistence = require("./lib/persistence");
const WebSocket = require('ws');
const JSP = require("./lib/json_safe_parse");
const Site = require("./env");
const Blacklist = require("./engine/blacklist");

/**
 * This is called if initialization is successful, to continue setting up.
 */
const proceedAfterInit = () => {
    const ws = new WebSocket(Site.WS_URL);
    ws.on('open', () => {
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
        if(keys.length === 1 && keys[0] === 'message'){
            Log.flow(`WebSocket > Message > ${message.message}`, 4);
        }
        else{
            if(message.txType == "create"){
                if(!Blacklist.check(message.traderPublicKey)){
                    // Creator of this token is not blacklisted.
                    console.log(message);
                }
                
            }
        }
    });

    setInterval(() => {
        Blacklist.add(Date.now().toString());
    }, 1000);
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