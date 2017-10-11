"use strict";

const { SinkTask } = require("kafka-connect");
const request = require("request");

class PrometheusSinkTask extends SinkTask {

    start(properties, callback, parentConfig) {

        this.parentConfig = parentConfig;
        this.properties = properties;

        const { host, port, job } = this.properties;

        this._url = `http://${host}:${port}/metrics/job/${job}`;

        callback(null);
    }

    putRecords(records) {
      return Promise.all(records.map(record => {

        if (record.value !== null && record.value !== "null") {

          const metric = typeof record.value === "string" ? record : this._stringify(record.value);

          request({
            url: this._url,
            method: 'POST',
            body: metric
          },
          function (error, response, body) {
            if (error) {
              Promise.reject(error);
            } else {

              // If something returned, means it is an error
              const msg = body ? body.toString('utf8').trim() : "";
              if(msg) {
                return Promise.reject(msg);
              }

              Promise.resolve(body.toString('utf8'));
            }
          });

        }

      }));
    }

    put(records, callback) {

      this.putRecords(records).then(() => {
        callback(null);
      }).catch(error => {
        callback(error);
      });
    }

    _stringify(record) {

      if (typeof record !== "object" || !(record instanceof Object)) {
          throw new Error("Please provide an object as a record in the etl function");
          return;
      }

      const {metric, value, label, help} = record;
      let { type } = record;

      if (!metric || !value) {
          throw new Error("no metric and/or value");
          return;
      }

      if (typeof metric !== "string") {
        throw new Error("metric must be string");
        return;
      }

      if (typeof value !== "number") {
        throw new Error("value must be number");
        return;
      }

      if (help && typeof help !== "string") {
        throw new Error("help must be string");
        return;
      }

      if (label && typeof label !== "string") {
        throw new Error("label must be string");
        return;
      }

      if (type && typeof type !== "string") {
        throw new Error("type must be string");
        return;
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

    stop() {
        //empty (con is closed by connector)
    }
}

module.exports = PrometheusSinkTask;
