#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const { runSinkConnector } = require("./../index.js");
const pjson = require("./../package.json");
const loadConfig = require("./../config/loadConfig.js");

program
    .version(pjson.version)
    .option("-c, --config [string]", "Path to Config (optional)")
    .option("-k, --kafka [string]", "Zookeeper Connection String")
    .option("-g, --group [string]", "Kafka ConsumerGroup Id")
    .option("-t, --topic [string]", "Kafka Topic to read from")
    .option("-h, --pg_host [string]", "Pushgateway Host")
    .parse(process.argv);

const config = loadConfig(program.config);

if (program.kafka) {
    config.kafka.zkConStr = program.kafka;
}

if (program.name) {
    config.kafka.clientName = program.name;
}

if (program.topic) {
    config.topic = program.topic;
}

if (program.db_host) {
    config.connector.options.host = program.pg_host;
}

runSinkConnector(config, [], console.log.bind(console)).then(sink => {

    const exit = (isExit = false) => {
        sink.stop();
        if (!isExit) {
            process.exit();
        }
    };

    process.on("SIGINT", () => {
        exit(false);
    });

    process.on("exit", () => {
        exit(true);
    });
});
