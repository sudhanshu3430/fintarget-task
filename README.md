
# Overview

This repository contains a Node.js application built with Express.js that provides a RESTful API for managing user tasks. The application includes a rate-limiting mechanism, task logging, and support for clustering to handle concurrent requests efficiently.

## Features

- Rate Limiting: Each user can submit up to 20 tasks per minute and 1 task per second.
- Task Logging: Completed tasks are logged to a file for tracking.
- Task Queueing: Requests that exceed the rate limit are queued and processed later.
- Clustering: The application uses Node.js clustering to take advantage of multi-core systems.


## Prerequisites

- Node.js: Ensure you have Node.js installed. You can download it from nodejs.org.
- MongoDB: You need a MongoDB database. Make sure to set up a MongoDB instance and obtain the connection string.
## Installation

Clone the repository

```bash
  git clone <repository-url>
  cd <repository-directory>
```

Install Dependencies:

```bash
  npm install
```

Set Up MongoDB Connection:

```bash
  const mongoose = require('mongoose');

mongoose.connect('your_mongodb_connection_string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

```




    
## Running the application

```bash
  node index.js
```
## API Endpoints

***POST /task***
- Description: Submit a task for processing.
- Request Body:
- user_id: (string) The ID of the user submitting the task (required).
**Responses:**
- 202 Accepted: Task has been queued and processed immediately.
- 400 Bad Request: Missing user_id.
- 429 Too Many Requests: Rate limit exceeded; the request will be processed later.
## Logging
- Task Logs: Completed tasks are logged in ***task_log.txt***.
- Rate Limit Logs: Rate limit exceedances are logged in ***rate_limit_log.txt***.
## ScreenShots
![1 task per second](https://github.com/user-attachments/assets/ee37d57d-574c-4364-907b-f711025aa0ba)
![rate-limit-exceed-screenshot](https://github.com/user-attachments/assets/8ab01466-3cdf-4d12-80a9-ff2adaeef369)
