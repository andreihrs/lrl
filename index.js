const { Worker } = require("worker_threads");

const workerData = {
  write: { fileName: "Part1.csv", filePath: "./" },
  hash: Math.random(),
};
new Worker("./workers.js", { workerData });
