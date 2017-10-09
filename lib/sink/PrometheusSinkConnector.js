"use strict";

const { SinkConnector } = require("kafka-connect");
const request = require("request");

class PrometheusSinkConnector extends SinkConnector {

    start(properties = {}, callback) {

      this.properties = properties;
      callback();
    }

    taskConfigs(maxTasks, callback) {

      try {

        const taskConfig = {
          maxTasks,
          host: this.properties.options.host,
          port: this.properties.options.port,
          job: this.properties.options.job,
        };
        callback(null, taskConfig);

      } catch(e) {
        return callback(new Error("Please provide options field in config"),null);
      }

    }

    stop() {
        // empty
    }
}

module.exports = PrometheusSinkConnector;
