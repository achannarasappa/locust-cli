# locust-cli

Distributed serverless web crawling/web scraping with support for js execution, proxying, and autoscaling

## Quick Start

1. Generate a job definition
    ```sh
    locust generate my-job.js
    ```
1. Start the job
    ```sh
    locust run --bootstrap my-job.js
    ```