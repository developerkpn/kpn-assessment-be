import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOTAL_JOBS = 10;
const MAX_WORKERS = Math.min(os.cpus().length, TOTAL_JOBS);

let completedJobs = 0;

function logStatus(prefix: string) {
  console.log(`${prefix} | completed: ${completedJobs} | remaining: ${TOTAL_JOBS - completedJobs}`);
}

// Function to split jobs into chunks for each worker
function chunkJobs(totalJobs: number, workers: number): number[][] {
  const chunkSize = Math.floor(totalJobs / workers);
  const remainder = totalJobs % workers;
  const chunks: number[][] = [];
  let start = 0;

  for (let i = 0; i < workers; i++) {
    const end = start + chunkSize + (i === workers - 1 ? remainder : 0);
    chunks.push(Array.from({ length: end - start }, (_, idx) => start + idx));
    start = end;
  }
  return chunks;
}

const jobChunks = chunkJobs(TOTAL_JOBS, MAX_WORKERS);

function jobCompleted() {
  console.log("Job Completed");
}

// Spawn workers with their assigned chunk
jobChunks.forEach((jobs, workerIdx) => {
  const worker = new Worker(path.resolve(__dirname, "../workers/example_worker.tsx"), {
    execArgv: ["--loader", "ts-node/esm"],
    workerData: { jobs }, // pass array of jobs to worker
  });

  console.log(`🧵 Worker ${workerIdx} started with jobs: [${jobs.join(", ")}]`);

  worker.on("message", (msg) => {
    console.log(msg);
    completedJobs++;
    logStatus("📉 Progress");
    if (completedJobs == TOTAL_JOBS) {
      jobCompleted();
    }
  });

  worker.on("error", (err) => {
    console.error(`❌ Worker ${workerIdx} error:`, err);
    completedJobs += jobs.length; // count all jobs for this worker as failed
    logStatus("⚠️ After error");
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.warn(`⚠️ Worker ${workerIdx} exited with code ${code}`);
    }
  });
});
