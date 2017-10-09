"use strict";

const path = require("path");

const config = {
    kafka: {
        //zkConStr: "localhost:2181/",
        kafkaHost: "localhost:9092",
        logger: null,
        groupId: "kc-sequelize-group",
        clientName: "kc-sequelize-client",
        workerPerPartition: 1,
        options: {
            sessionTimeout: 8000,
            protocol: ["roundrobin"],
            fromOffset: "earliest", //latest
            fetchMaxBytes: 1024 * 100,
            fetchMinBytes: 1,
            fetchMaxWaitMs: 10,
            heartbeatInterval: 250,
            retryMinTimeout: 250,
            autoCommit: true,
            autoCommitIntervalMs: 1000,
            requireAcks: 1,
            //ackTimeoutMs: 100,
            //partitionerType: 3
        }
    },
    topic: "feierabend",
    partitions: 1,
    maxTasks: 1,
    pollInterval: 250,
    produceKeyed: true,
    produceCompressionType: 0,
    connector: {
        options: {
            host: "localhost",
            port: 9091,
            job: "pushgateway_job",
            logging: () => {}
        },
    },
    http: {
        port: 3149,
        middlewares: []
    },
    enableMetrics: true
};

module.exports = config;
