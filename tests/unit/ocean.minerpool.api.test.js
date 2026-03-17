'use strict'

const test = require('brittle')
const { OceanMinerPoolApi } = require('../../workers/lib/ocean.minerpool.api')

test('OceanMinerPoolApi: should create instance with http client', (t) => {
  const mockHttp = {
    get: async () => ({ body: { result: {} } })
  }

  const api = new OceanMinerPoolApi(mockHttp)
  t.ok(api)
  t.ok(api._http === mockHttp)
})

test('OceanMinerPoolApi: getDecentralizedClientStats should call correct endpoint', async (t) => {
  let calledPath = null

  const mockHttp = {
    get: async (path) => {
      calledPath = path
      return { body: { acceptedShares: 1000 } }
    }
  }

  const api = new OceanMinerPoolApi(mockHttp)
  const result = await api.getDecentralizedClientStats()

  t.is(calledPath, '/v1/decentralized_client_stats')
  t.ok(result)
  t.ok(result.acceptedShares, 1000)
})

test('OceanMinerPoolApi: getStratumServerInfo should call correct endpoint', async (t) => {
  let calledPath = null

  const mockHttp = {
    get: async (path) => {
      calledPath = path
      return { body: { activeThread: 10 } }
    }
  }

  const api = new OceanMinerPoolApi(mockHttp)
  const result = await api.getStratumServerInfo()

  t.is(calledPath, '/v1/stratum_server_info')
  t.ok(result)
  t.is(result.activeThread, 10)
})

test('OceanMinerPoolApi: getCurrentStratumJob should call correct endpoint', async (t) => {
  let calledPath = null

  const mockHttp = {
    get: async (path) => {
      calledPath = path
      return { body: { block_height: 900000 } }
    }
  }

  const api = new OceanMinerPoolApi(mockHttp)
  const result = await api.getCurrentStratumJob()

  t.is(calledPath, '/v1/current_stratum_job')
  t.ok(result)
  t.is(result.block_height, 900000)
})

test('OceanMinerPoolApi: getCoinbaser should call correct endpoint', async (t) => {
  let calledPath = null

  const mockHttp = {
    get: async (path) => {
      calledPath = path
      return { body: { OP_RETURN: 0 } }
    }
  }

  const api = new OceanMinerPoolApi(mockHttp)
  const result = await api.getCoinbaser()

  t.is(calledPath, '/v1/coinbaser')
  t.ok(result)
  t.is(result.OP_RETURN, 0)
})

test('OceanMinerPoolApi: getThreadStats should call correct endpoint', async (t) => {
  let calledPath = null

  const mockHttp = {
    get: async (path) => {
      calledPath = path
      return { body: { 0: { connection_count: 5 } } }
    }
  }

  const api = new OceanMinerPoolApi(mockHttp)
  const result = await api.getThreadStats()

  t.is(calledPath, '/v1/thread_stats')
  t.ok(result)
  t.ok(result[0])
  t.is(result[0].connection_count, 5)
})

test('OceanMinerPoolApi: getStratumList should call correct endpoint', async (t) => {
  let calledPath = null

  const mockHttp = {
    get: async (path) => {
      calledPath = path
      return { body: { 0: { 0: { remote_host: '::ffff:192.168.1.1' } } } }
    }
  }

  const api = new OceanMinerPoolApi(mockHttp)
  const result = await api.getStratumList()

  t.is(calledPath, '/v1/stratum_client_list')
  t.ok(result)
  t.ok(result[0])
  t.ok(result[0][0])
  t.is(result[0][0].remote_host, '::ffff:192.168.1.1')
})

test('OceanMinerPoolApi: getConfiguration should call correct endpoint', async (t) => {
  let calledPath = null

  const mockHttp = {
    get: async (path) => {
      calledPath = path
      return { body: { coinbase_tag_secondary: 'DATUM User' } }
    }
  }

  const api = new OceanMinerPoolApi(mockHttp)
  const result = await api.getConfiguration()

  t.is(calledPath, '/v1/configuration')
  t.ok(result)
  t.is(result.coinbase_tag_secondary, 'DATUM User')
})
