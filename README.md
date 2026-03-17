# miningos-wrk-datum

DATUM worker - MiningOS worker implementation for integrating with datum gateway API.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Starting the Worker](#starting-the-worker)
6. [API Endpoints Used](#api-endpoints-used)
7. [Development](#development)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

## Overview

This worker connects to the datum gateway API to collect and monitor mining statistics, including:
- Datum gateway real time status
- Worker status and statistics
- Datum gateway configuration
- Stratum job info
- Coinbase outputs

## Prerequisites

- Node.js >= 20.0
- Datum gateway with this [PR](https://github.com/OCEAN-xyz/datum_gateway/pull/179)

## Installation

1. Clone the repository:
```bash
tbd
```

2. Install dependencies:
```bash
npm install
```

3. Setup configuration files:
```bash
bash setup-config.sh
```

## Configuration

### Base Configuration (config/datum.json)

Configure the datum gateway API endpoint:

Development/Staging:
json
{
  "apiUrl": "http://127.0.0.1:8000"
}

Production:
json
{
  "apiUrl": "http://127.0.0.1:7152",
  "user": "<Your password>",
  "password": "<Your password>"
}

## Starting the Worker

### Production Mode
```bash
DEBUG="*" node worker.js --wtype wrk-minerpool-rack-datum --env production --rack rack-1
```

### Development Mode
```bash
DEBUG="*" node worker.js --wtype wrk-minerpool-rack-datum --env development --rack rack-1
```

### Mock Server (Development)
```bash
DEBUG="*" node mock/server.js
```

## Development

### Running Tests
```bash
npm run lint        # Check code style
npm run lint:fix    # Fix code style issues
npm run test    
```

## Troubleshooting

### Common Issues

1. **Registration fails**
   - Ensure username is valid for production
   - Check network connectivity to API endpoint
   - Verify configuration file syntax

2. **No statistics collected**
   - Confirm worker is running (`DEBUG="*"` shows activity)
   - Check API endpoint configuration
   - Verify thing registration was successful

3. **Rate limit errors**
   - Worker implements 1-second delays between requests
   - Multiple workers may need staggered start times

4. **Missing configuration**
   - Run `setup-config.sh` to create config files
   - Check all required fields are populated

## Contributing

Contributions are welcome and appreciated!
Whether you’re fixing a bug, adding a feature, improving documentation, or suggesting an idea, here’s how you can help:

### How to Contribute

1. **Fork** the repository.
2. **Create a new branch** for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit them with a clear message.
4. **Push** to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** describing what you changed and why.

### Guidelines

* Follow the existing code style and structure.
* Keep PRs focused—one feature or fix per pull request.
* Provide screenshots or examples if your change affects the UI/UX.
* Update documentation/tests as needed.
