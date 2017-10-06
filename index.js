"use strict";

const PrometheusSinkConfig = require("./lib/PrometheusSinkConfig.js");

const PrometheusSinkConnector = require("./lib/sink/PrometheusSinkConnector.js");

const PrometheusSinkTask = require("./lib/sink/PrometheusSinkTask.js");

const JsonConverter = require("./lib/utils/JsonConverter.js");
const ConverterFactory = require("./lib/utils/ConverterFactory.js");

const runSinkConnector = (properties, converters = [], onError = null) => {

    const config = new PrometheusSinkConfig(properties,
        PrometheusSinkConnector,
        PrometheusSinkTask, [JsonConverter].concat(converters));

    if (onError) {
        config.on("error", onError);
    }

    return config.run().then(() => {
        return config;
    });
};

module.exports = {
    runSinkConnector,
    ConverterFactory
};
