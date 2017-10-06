"use strict";

const { SinkConnector } = require("kafka-connect");
const request = require("request");

class PrometheusSinkConnector extends SinkConnector {

    start(properties, callback) {

        this.properties = properties;
        callback();

        //TODO: DO Magic
        // this.request = request();
    }

    taskConfigs(maxTasks, callback) {

        const taskConfig = {
            maxTasks,
            prometheus: this.prometheus,
            table: this.properties.table,
            incrementingColumnName: this.properties.incrementingColumnName
        };

        callback(null, taskConfig);
    }

    stop() {
        // this.prometheus.close();
    }
}

module.exports = PrometheusSinkConnector;
