const { Worker } = require("worker_threads");
import cluster from "cluster";
const { resolve } = require("path");
const {
  workerData: { write, hash },
} = require("worker_threads");

let workers = [];

// function runService(workerData) {
//   return new Promise((resolve, reject) => {
//     const worker = new Worker('./find.js', { workerData });
//     worker.on('message', resolve);
//     worker.on('error', reject);
//     worker.on('exit', (code) => {
//       if (code !== 0)
//         reject(new Error(`Worker stopped with exit code ${code}`))
//     })
//   })
// }

// async function run() {
//   const result = await runService('world')
//   console.log(result);
// }

// run().catch(err => console.error(err))

const numCPUs = require("os").cpus().length;
console.log(numCPUs);
