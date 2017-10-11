"use strict";

const assert = require("assert");
const { SourceRecord } = require("kafka-connect");
const uuid = require("uuid");
const { NProducer } = require("sinek");

const { runSourceConnector, runSinkConnector, ConverterFactory } = require("./../../index.js");
const sinkProperties = require("./../sink-config.js");
const PrometheusSinkTask = require("./../../lib/sink/PrometheusSinkTask");

describe("Connector Unit", function() {

    const task = new PrometheusSinkTask();

    describe("Correct value", function() {

        it("should return only string for the metric and value", function(done) {
          const expected = "pi 3.14159\n";
          let record;
          assert.doesNotThrow(() => {
             record = task._stringify({metric: "pi", value: 3.14159});
             assert.deepEqual(record, expected);
             done();
           });
        });

        it("should return complete string", function(done) {
          const expected = "# TYPE pi gauge\n# HELP pi Math constant.\npi{label=\"math\"} 3.14159\n";
          let record;
          assert.doesNotThrow(() => {
             record = task._stringify({
               metric: "pi",
               value: 3.14159,
               label: "math",
               type: "gauge",
               help: "Math constant."
             });
             assert.deepEqual(record, expected);
             done();
           });
        });

        it("should return string with type 'untyped'", function(done) {
          const expected = "pi 3.14159\n";
          let record;
          assert.doesNotThrow(() => {
             record = task._stringify({metric: "pi", value: 3.14159, type: "any"});
             assert.deepEqual(record, expected);
             done();
           });
        });

    });

    describe("Errornous value", function() {

        it("should fail when there's no metric or value", function(done) {
          assert.throws(() => { task._stringify({"wrong": "payload"}) });
          done();
        });

        it("should fail on non string metric", function(done) {
          assert.throws(() => { task._stringify({"metric": 123, "value": 123}) });
          done();
        });

        it("should fail on non number value", function(done) {
          assert.throws(() => { task._stringify({"metric": "foo", "value": "bar"}) });
          done();
        });

        it("should fail on non string label", function(done) {
          assert.throws(() => { task._stringify({"metric": "foo", "value": "123", "label": 123}) });
          done();
        });

        it("should fail on non string type", function(done) {
          assert.throws(() => { task._stringify({"metric": "foo", "value": "123", "type": 123}) });
          done();
        });

        it("should fail on non string help", function(done) {
          assert.throws(() => { task._stringify({"metric": "foo", "value": "123", "help": 123}) });
          done();
        });

    });

});
