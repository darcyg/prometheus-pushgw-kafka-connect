"use strict";

const { SinkConnector } = require("kafka-connect");

const PushgatewayClient = require("./../prometheus/PushgatewayClient.js");

class PrometheusSinkConnector extends SinkConnector {

    start(properties = {}, callback) {

      this.client = new PushgatewayClient(properties.options);
      callback();
    }

    taskConfigs(maxTasks, callback) {

      callback(null, {
        maxTasks,
        client: this.client
      });
    }

    stop() {
        // empty
    }
}

module.exports = PrometheusSinkConnector;
