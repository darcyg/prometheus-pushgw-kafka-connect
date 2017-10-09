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

          this.parentConfig.emit("model-upsert", record.key.toString());

          const metric = typeof record.value === "string" ? record : this._stringify(record.value);

          request({
            url: this._url,
            method: 'POST',
            body: metric
          }, function (error, response, body) {
            if (error) {
              Promise.reject(error);
            } else {
              Promise.resolve(body.toString('utf8'));
            }
          });

        }

        //if record.value is null, we will use the key to delete the field
        this.parentConfig.emit("model-delete", record.key.toString());
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

      const {metric, value, label, type, help} = record;

      if (!metric || !value) {
          throw new Error("Invalid ETL function, please provide the transformation for metric and value");
          return;
      }

      if (typeof metric !== "string") {
        throw new Error("Please provide a string metric name");
        return;
      }

      if (typeof value !== "number") {
        throw new Error("Please provide a number as a value");
        return;
      }

      if (help && typeof help !== "string") {
        throw new Error("Please provide strings as help");
        return;
      }

      if (label && typeof label !== "string") {
        throw new Error("Please provide strings as label");
        return;
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
