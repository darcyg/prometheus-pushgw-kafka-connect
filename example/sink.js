const { runSinkConnector, ConverterFactory } = require("./../index.js");
const config = require("./../config/default.js");

console.log("******************");
console.log("Produce to kafka topic just like in config, with the following schema:");
console.log({metric: "STRING - required", value: "NUMBER - required", label: "STRING", type: 'ENUM - ("untyped", "gauge", "counter")', help: "STRING"});
console.log("The consumed schema can be different, just need to adjust to that schema in ETL function");
console.log("******************");
console.log("Example:");
console.log({metric: "pi_metric", value: 3.14159});
console.log("******************");
console.log("Waiting for message to be consumed...");

const etl = (message, callback) => {

  console.log("consumed message:");
  console.log(message);

  let record;

  try {

    record = {
      metric: message.metric,
      value: message.value,
      label: message.label,
      type: message.type,
      help: message.help
    }

  } catch(err) {
    console.log("No message");
  }

  if (record) {
    return callback(null, record);
  }
  else {
    callback(new Error("unknown message.type"));
  }

}

const converter = ConverterFactory.createSinkSchemaConverter(null,etl);

runSinkConnector(config, [converter], console.log.bind(console)).then(sink => {

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
