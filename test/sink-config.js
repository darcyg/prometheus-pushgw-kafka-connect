"use strict";

const path = require("path");
//const Logger = require("log4bro");

const config = {

    /*
    kafka: {
        //zkConStr: "localhost:2181/",
        kafkaHost: "localhost:9092",
        logger: new Logger(),
        groupId: "kc-prometheus-test",
        clientName: "kc-prometheus-test-name",
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
            requireAcks: 0,
            //ackTimeoutMs: 100,
            //partitionerType: 3
        }
    }, */

    kafka: {
        noptions: {
            "metadata.broker.list": "localhost:9092",
            "group.id": "n-test-group",
            "enable.auto.commit": false,
            "debug": "all",
            "event_cb": true
        },
        tconf: {
            "auto.offset.reset": "earliest"
        }
    },

    topic: "pc_test_topic",
    partitions: 1,
    maxTasks: 1,
    pollInterval: 2000,
    produceKeyed: true,
    produceCompressionType: 0,
    awaitRetry: 2000,
    maxRetries: 3,
    connector: {
        options: {
            host: "localhost",
            port: 9091,
            job: "pushgateway_job",
            logging: () => {}
        },
        database: null,
        user: null,
        password: null,
        maxPollCount: 50,
        table: "accounts_import",
        incrementingColumnName: "id"
    },
    http: {
        port: 3149,
        middlewares: []
    },
    enableMetrics: false
};

module.exports = config;
