const axios = require("axios");
const { Res } = require("./res");
const Site = require("./../env");
const Log = require("./log");
const DEF_ERROR = "INTERFACE"

/**
 * Makes GET requests.
 * @param {string} url - full url. 
 * @param {Function} callback - callback function with a Res parameter.
 * @param {any} headers - optional HTTP headers object.
 */
const get = (url, callback, headers = {}) => {
    axios.get(url, {
        timeout: Site.HTTP_TIMEOUT,
        headers,
    }).then(res => {
        if (res.status == 200) {
            callback(new Res(true, res.data));
        }
        else {
            Log.dev(err);
            callback(new Res(false, DEF_ERROR));
        }
    }).catch(error => {
        Log.dev(error);
        try {
            if (error.response.data) {
                callback(new Res(false, error.response.data));
            }
            else {
                callback(new Res(false, DEF_ERROR));
            }
        }
        catch (err) {
            callback(new Res(false, DEF_ERROR));
        }
    });
}

/**
 * Makes POST requests.
 * @param {string} url - full url.
 * @param {any} body - request body.
 * @param {Function} callback - callback function with a Res parameter.
 * @param {any} headers - optional HTTP headers object.
 */
const post = (url, body, callback, headers = {}) => {
    axios.post(url, body, {
        timeout: Site.HTTP_TIMEOUT,
        headers,
    }).then(res => {
        if (res.status == 200) {
            callback(new Res(true, res.data));
        }
        else {
            Log.dev(err);
            callback(new Res(false, DEF_ERROR));
        }
    }).catch(error => {
        Log.dev(error);
        try {
            if (error.response.data) {
                callback(new Res(false, error.response.data));
            }
            else {
                callback(new Res(false, DEF_ERROR));
            }
        }
        catch (err) {
            callback(new Res(false, DEF_ERROR));
        }
    });
}

module.exports = { get };