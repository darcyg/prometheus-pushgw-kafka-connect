"use strict";

const Promise = require("bluebird");
const request = require("request");
const debug = require("debug")("nkc:prom:pushgatewayclient");

const UTF8 = "utf8";

class PushgatewayClient {

    constructor(properties = {}){

        const { proto, host, port, job } = properties;
        this._url = `${proto || "http"}://${host}:${port}/metrics/job/${job}`;
    }

    _convertRecordToBody(record){ //throws
        return typeof record.value === "string" ? record : this._stringify(record.value);
    }

    _requestPromise(options = {}, expectedStatusCode = 202){
        return new Promise((resolve, reject) => {

            request(options, (error, response, body) => {

                if (error) {
                  return reject(error);
                }

                debug("request done", options.url, expectedStatusCode, response.statusCode);

                body = body ? body.toString(UTF8).trim() : "";
                if(response.statusCode !== expectedStatusCode){
                    return reject(new Error(body));
                }

                resolve({
                    status: response.statusCode,
                    header: response.headers,
                    body
                });
            });
        });
    }

    _stringify(record) { //throws

        if (typeof record !== "object" || !(record instanceof Object)) {
            throw new Error("Please provide an object as a record in the etl function");
        }

        const {metric, value, label, help} = record;
        let { type } = record;

        if (!metric || !value) {
            throw new Error("no metric and/or value");
        }

        if (typeof metric !== "string") {
            throw new Error("metric must be string");
        }

        if (typeof value !== "number") {
            throw new Error("value must be number");
        }

        if (help && typeof help !== "string") {
            throw new Error("help must be string");
        }

        if (label && typeof label !== "string") {
            throw new Error("label must be string");
        }

        if (type && typeof type !== "string") {
            throw new Error("type must be string");
        }

        if (type && type.indexOf("gauge") === -1 && type.indexOf("counter") === -1) {
            // Fallback to falsy which is untyped
            type = null;
        }

        const _label = label ? `{label="${label}"}` : "";
        let stringRecord = "";
        stringRecord += type ? `# TYPE ${metric} ${type}\n` : "";
        stringRecord += help ? `# HELP ${metric} ${help}\n` : "";
        stringRecord += `${metric}${_label} ${value}\n`;

        return stringRecord;
    }

    postRecord(record){

        let options;

        try {
          options = {
            url: this._url,
            method: "POST",
            body: this._convertRecordToBody(record) //can throw -> reject
          };
        } catch(err) {
          return Promise.reject(err); //If it throws an error, it will act as reject
        }

        return this._requestPromise(options, 202);
    }
}

module.exports = PushgatewayClient;
