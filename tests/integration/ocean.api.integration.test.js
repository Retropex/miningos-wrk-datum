'use strict'

const test = require('brittle')
const { createServer } = require('../../mock/server')
const { OceanMinerPoolApi } = require('../../workers/lib/ocean.minerpool.api')
const { setTimeout: sleep } = require('timers/promises')

// Mock HTTP client that wraps fetch or http
class MockHttpClient {
  constructor (baseUrl) {
    this.baseUrl = baseUrl
  }

  async get (path, options = {}) {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const body = await response.json()
    // Server now returns { result: ... }, so we wrap it as { body: { result: ... } }
    // to match what bfx-facs-http returns
    return { body }
  }
}

let mockServer = null
let apiClient = null
let httpClient = null
const TEST_PORT = 8001
const TEST_HOST = '127.0.0.1'
const TEST_BASE_URL = `http://${TEST_HOST}:${TEST_PORT}`

// Helper function to wait for server to be ready
async function waitForServer (url, maxRetries = 20, delay = 200) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${url}/v1/ping`)
      if (response.ok) {
        return true
      }
    } catch (e) {
      // Server not ready yet
    }
    await sleep(delay)
  }
  throw new Error('Server failed to start')
}

// Initialize server once
async function ensureServer () {
  if (!mockServer) {
    mockServer = createServer({
      port: TEST_PORT,
      host: TEST_HOST,
      delay: 0,
      error: false
    })

    // Wait for server to be ready
    await waitForServer(TEST_BASE_URL, 20, 300)

    // Create HTTP client and API client
    httpClient = new MockHttpClient(TEST_BASE_URL)
    apiClient = new OceanMinerPoolApi(httpClient)
  }
  return { mockServer, apiClient, httpClient }
}

// Setup hook - runs before all tests
test('setup: start mock server', { hook: true }, async (t) => {
  await ensureServer()

  // Verify server is actually running
  const checkResponse = await fetch(`${TEST_BASE_URL}/v1/ping`)
  t.is(await checkResponse.text(), 'PONG', 'Server should respond to ping')

  // Teardown - stop server after all tests
  t.teardown(async () => {
    if (mockServer) {
      try {
        // Close the server and wait for it to fully close
        if (mockServer.app && mockServer.app.server) {
          await mockServer.stop()
          // Give the server a moment to fully close all connections
          await sleep(200)
        }
      } catch (e) {
        // Ignore errors during teardown, but try to force close
        try {
          if (mockServer.app && mockServer.app.server) {
            mockServer.app.server.close()
          }
        } catch (e2) {
          // Ignore
        }
      }
      mockServer = null
      apiClient = null
      httpClient = null
    }
  })

  t.pass('Mock server started and verified')
})

test('integration: should connect to mock server', async (t) => {
  await ensureServer()
  const response = await fetch(`${TEST_BASE_URL}/v1/ping`)
  const text = await response.text()
  t.is(text, 'PONG')
})

test('integration: getDecentralizedClientStats should fetch datum stats', async (t) => {
  await ensureServer()
  const result = await apiClient.getDecentralizedClientStats()

  t.ok(result)
  t.ok(typeof result.acceptedShares === 'number')
  t.ok(typeof result.acceptedSharesDiff === 'number')
  t.ok(typeof result.rejectedShares === 'number')
  t.ok(typeof result.rejectedSharesDiff === 'number')
  t.ok(typeof result.ready === 'boolean')
  t.ok(typeof result.poolHost === 'string')
  t.ok(typeof result.poolTag === 'string')
  t.ok(typeof result.MinerTag === 'string')
  t.ok(typeof result.poolMinDiff === 'number')
  t.ok(typeof result.poolPubKey === 'string')
  t.ok(typeof result.uptime === 'number')
})

test('integration: getStratumServerInfo should fetch stratum server infos', async (t) => {
  await ensureServer()
  const result = await apiClient.getStratumServerInfo()

  t.ok(result)
  t.ok(typeof result.activeThread === 'number')
  t.ok(typeof result.totalConnections === 'number')
  t.ok(typeof result.totalWorkSubscriptions === 'number')
  t.ok(typeof result.estimatedHashrate === 'number')
})

test('integration: getCurrentStratumJob should fetch stratum job data', async (t) => {
  await ensureServer()
  const result = await apiClient.getCurrentStratumJob()

  t.ok(result)
  t.ok(typeof result.block_height === 'number')
  t.ok(typeof result.block_value === 'number')
  t.ok(typeof result.previous_block === 'string')
  t.ok(typeof result.block_target === 'string')
  t.ok(typeof result.witness_commitment === 'string')
  t.ok(typeof result.block_difficulty === 'number')
  t.ok(typeof result.block_version.int === 'number')
  t.ok(typeof result.block_version.hex === 'string')
  t.ok(typeof result.bits === 'string')
  t.ok(typeof result.time.current === 'number')
  t.ok(typeof result.time.minimum === 'number')
  t.ok(typeof result.limits.size === 'number')
  t.ok(typeof result.limits.weight === 'number')
  t.ok(typeof result.limits.sigops === 'number')
  t.ok(typeof result.size === 'number')
  t.ok(typeof result.weight === 'number')
  t.ok(typeof result.sigops === 'number')
  t.ok(typeof result.tx_count === 'number')
})

test('integration: getCoinbaser should fetch the coinbase outputs', async (t) => {
  await ensureServer()
  const result = await apiClient.getCoinbaser()

  t.ok(result)
  Object.keys(result).forEach(key => {
    t.ok(typeof result[key] === 'number')
  })
})

test('integration: getThreadStats should fetch thread data', async (t) => {
  await ensureServer()
  const result = await apiClient.getThreadStats()

  t.ok(result)
  Object.keys(result).forEach(key => {
    t.ok(typeof result[key].connection_count === 'number')
    t.ok(typeof result[key].subscription_count === 'number')
    t.ok(typeof result[key].approx_hashrate === 'number')
  })
})

test('integration: getStratumList should fetch the list of all stratum worker', async (t) => {
  await ensureServer()
  const result = await apiClient.getStratumList()

  t.ok(result)
  Object.keys(result).forEach(key => {
    Object.keys(result[key]).forEach(subKey => {
      const element = result[key][subKey]

      t.ok(typeof element.remote_host === 'string')
      t.ok(typeof element.auth_username === 'string')
      t.ok(typeof element.subscribed === 'boolean')
      t.ok(typeof element.sid === 'string')
      t.ok(typeof element.sid_time === 'number')
      t.ok(typeof element.vdiff === 'number')
      t.ok(typeof element.accepted_diff === 'number')
      t.ok(typeof element.accepted_count === 'number')
      t.ok(typeof element.rejected_diff === 'number')
      t.ok(typeof element.rejected_count === 'number')
      t.ok(typeof element.rejected_percentage === 'number')
      t.ok(typeof element.hash_rate === 'number')
      t.ok(typeof element.hash_rate_age === 'number')
      t.ok(typeof element.coinbase === 'string')
      t.ok(typeof element.useragent === 'string')
    })
  })
})

test('integration: getConfiguration should fetch the configuration of datum', async (t) => {
  await ensureServer()
  const result = await apiClient.getConfiguration()

  t.ok(result)
  t.ok(typeof result.pool_address === 'string')
  t.ok(typeof result.miner_username_behavior.pool_pass_workers === 'boolean')
  t.ok(typeof result.miner_username_behavior.pool_pass_full_users === 'boolean')
  t.ok(typeof result.coinbase_tag_secondary === 'string')
  t.ok(typeof result.coinbase_unique_id === 'number')
  t.ok(typeof result.reward_sharing === 'string')
  t.ok(typeof result.pool.host === 'string')
  t.ok(typeof result.pool.port === 'number')
  t.ok(typeof result.pool.pubkey === 'string')
  t.ok(typeof result.fingerprint_miners === 'boolean')
  t.ok(typeof result.always_pay_self === 'boolean')
  t.ok(typeof result.work_update_seconds === 'number')
  t.ok(typeof result.rpcurl === 'string')
  t.ok(typeof result.rpcuser === 'string')
  t.ok(typeof result.rpcpassword === 'string')
})

// Final cleanup hook to ensure server is closed
test('teardown: stop mock server', { hook: true }, async (t) => {
  if (mockServer) {
    try {
      if (mockServer.app && mockServer.app.server) {
        // Set a timeout to force close if it takes too long
        const stopPromise = mockServer.stop()
        const timeoutPromise = sleep(1000).then(() => {
          // Force close if still open
          if (mockServer && mockServer.app && mockServer.app.server) {
            try {
              mockServer.app.server.close(() => {})
            } catch (e) {
              // Ignore
            }
          }
        })
        await Promise.race([stopPromise, timeoutPromise])
      }
    } catch (e) {
      // Ignore errors, but try to force close
      try {
        if (mockServer && mockServer.app && mockServer.app.server) {
          mockServer.app.server.close(() => {})
        }
      } catch (e2) {
        // Ignore
      }
    }
    mockServer = null
    apiClient = null
    httpClient = null
  }
  t.pass('Mock server cleaned up')
})
