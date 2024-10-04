const express = require('express');
const { Task } = require('./src/db/index');
const fs = require('fs');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const cluster = require('cluster');
const os = require('os');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Rate limiter for each user (1 task per second, 20 tasks per minute)
const rateLimiter = new RateLimiterMemory({
  points: 20, // 20 tasks
  duration: 60, // per 60 seconds
});

// Log completed tasks to a file
async function logTask(user_id) {
  const logEntry = `${user_id}-task completed at-${new Date().toISOString()}\n`;
  fs.appendFileSync('task_log.txt', logEntry);
}

// Simulated task processing
async function task(user_id) {
  await logTask(user_id);
  const newTask = new Task({ user_id, completedAt: new Date() });
  await newTask.save();
}

// Queue to hold pending requests
const pendingRequests = {};

// Middleware to process tasks
app.post('/task', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).send('user_id is required');
  }

  // Initialize the queue for the user if it doesn't exist
  if (!pendingRequests[user_id]) {
    pendingRequests[user_id] = [];
  }

  // Attempt to consume a token for the user
  try {
    await rateLimiter.consume(user_id); // Consume 1 token
    // If successful, process the task immediately
    await processTask(user_id);
    res.status(202).send('Task queued and processed immediately');
  } catch (rejRes) {
    const logEntry = `${user_id} - Rate limit exceeded at ${new Date().toISOString()}\n`;
    fs.appendFileSync('rate_limit_log.txt', logEntry); // Log rate limit exceedance
    // If rate limit is exceeded, add the request to the queue
    pendingRequests[user_id].push(Date.now());
    res.status(429).send('Too many requests. This request will be processed later.');
    processPendingRequests(user_id); // Process pending requests
  }
});

// Process the task immediately
async function processTask(user_id) {
  await task(user_id);
}

// Process pending requests
async function processPendingRequests(user_id) {
  const interval = 1000; // 1 second delay for processing pending tasks

  // If there are pending requests, process them one by one
  while (pendingRequests[user_id].length > 0) {
    // Wait for the interval before processing the next request
    await new Promise(resolve => setTimeout(resolve, interval));

    // Remove the first pending request and process it
    pendingRequests[user_id].shift(); // Remove the request from the queue
    try {
      await rateLimiter.consume(user_id); // Attempt to consume a token
      await processTask(user_id); // Process the task
    } catch {
      // If rate limit is still exceeded, break out of the loop
      break;
    }
  }

  // Clean up if no more pending requests
  if (pendingRequests[user_id].length === 0) {
    delete pendingRequests[user_id];
  }
}

// Cluster setup
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
