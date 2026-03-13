'use strict'
const crypto = require('crypto')

function generateClientStats () {
  let stat = {}
  const acceptedShares = Math.round(randomNumber(100, 2000000))
  const rejectedShares = Math.round(randomNumber(100, 2000000))

  stat = {
    acceptedShares,
    acceptedSharesDiff: acceptedShares * 2,
    rejectedShares,
    rejectedSharesDiff: rejectedShares * 2,
    ready: Math.random() < 0.5,
    poolHost: 'datum-beta1.mine.ocean.xyz',
    poolTag: 'DATUM Gateway',
    MinerTag: 'DATUM User',
    poolMinDiff: Math.round(randomNumber(16384, 1048576)),
    poolPubKey: 'f21f2f0ef0aa1970468f22bad9bb7f4535146f8e4a8f646bebc93da3d89b1406f40d032f09a417d94dc068055df654937922d2c89522e3e8f6f0e649de473003',
    uptime: Math.round(randomNumber(0, 1000000))
  }

  return stat
}

function stratumServerInfo () {
  let stratum = {}
  const thread = Math.round(randomNumber(1, 1024))
  const connections = thread * Math.round(randomNumber(1, 3))

  stratum = {
    activeThread: thread,
    totalConnections: connections,
    totalWorkSubscriptions: connections - Math.round(randomNumber(1, 3)),
    estimatedHashrate: Math.round(randomNumber(1, 50000000))
  }

  return stratum
}

function currentStratumJob () {
  let job = {}

  job = {
    block_height: Math.round(randomNumber(900000, 940000)),
    block_value: Math.round(randomNumber(312500000, 400000000)),
    previous_block: randomNumber().toString(16).substring(2).padEnd(64, '0'),
    block_target: randomNumber().toString(16).substring(2).padEnd(64, '0'),
    witness_commitment: randomNumber().toString(16).substring(2).padEnd(64, '0'),
    block_difficulty: randomNumber(1, 100000000000),
    block_version: {
      int: 536870912,
      hex: 20000000
    },
    bits: '1701f303',
    time: {
      current: Math.floor(Date.now() / 1000),
      minimum: Math.floor(Date.now() / 1000) - 100000
    },
    limits: {
      size: 4000000,
      weight: 4000000,
      sigops: 80000
    },
    size: Math.round(randomNumber(1, 4000000)),
    weight: Math.round(randomNumber(1, 400000)),
    sigops: Math.round(randomNumber(1, 80000))
  }

  return job
}

function coinbaser () {
  const coinbase = {}
  const numberOfOutputs = Math.round(randomNumber(1, 50))

  Object.assign(coinbase, { OP_RETURN: 0 })

  for (let i = numberOfOutputs; i > 0; i--) {
    Object.assign(coinbase, { [randomBc1Address()]: Math.round(randomNumber(1, i)) })
  }

  return coinbase
}

function threadStats () {
  const thread = {}
  const numberOfThread = Math.round(randomNumber(1, 20))

  for (let i = 0; i < numberOfThread; i++) {
    const connectionCount = Math.round(randomNumber(1, 30))

    Object.assign(thread, {
      [i]: {
        connection_count: connectionCount,
        subscription_count: connectionCount - Math.round(randomNumber(0, 3)),
        approx_hashrate: randomNumber(1, 50)
      }
    })
  }

  return thread
}

function stratumClientList () {
  const clientList = {}
  const acceptedShares = Math.round(randomNumber(100, 2000000))
  const rejectedShares = Math.round(randomNumber(100, 2000000))
  const numberOfClient = Math.round(randomNumber(1, 20))

  for (let i = 0; i < numberOfClient; i++) {
    const numberOfThread = Math.round(randomNumber(1, 20))

    Object.assign(clientList, { [i]: {} })
    for (let j = 0; j < numberOfThread; j++) {
      Object.assign(clientList[i], {
        [j]: {
          remote_host: '::ffff:192.168.1.' + Math.round(randomNumber(1, 254)).toString(),
          auth_username: randomBc1Address() + '.S' + Math.round(randomNumber(19, 21)).toString(),
          subscribed: Math.random() < 0.5,
          sid: generateRandomString(),
          sid_time: randomNumber(1, 1000000),
          vdiff: 131072,
          accepted_diff: acceptedShares * 2,
          accepted_count: acceptedShares,
          rejected_diff: rejectedShares * 2,
          rejected_count: rejectedShares,
          rejected_percentage: randomNumber(0, 1),
          hash_rate: Math.round(randomNumber(1, 50000000)),
          hash_rate_age: Math.round(randomNumber(1, 50000000)),
          coinbase: randomCoinbaseFingerprint(),
          useragent: ''
        }
      })
    }
  }

  return clientList
}

function randomFloat () {
  return crypto.randomBytes(6).readUIntBE(0, 6) / 2 ** 48
}

function randomNumber (min = 0, max = 1) {
  const number = randomFloat() * (max - min) + min
  return parseFloat(number.toFixed(2))
}

function randomBc1Address () {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let addr = 'bc1'
  for (let i = 0; i < 39; i++) {
    addr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return addr
}

function generateRandomString () {
  let result = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * 8))
  }
  return result
}

function randomCoinbaseFingerprint () {
  const coinbaseList = ['Blank', 'Tiny', 'Default', 'Respect', 'Yuge', 'Antmain2']

  return coinbaseList[Math.round(randomNumber(0, 5))]
}

module.exports = {
  generateClientStats,
  stratumServerInfo,
  currentStratumJob,
  coinbaser,
  threadStats,
  stratumClientList,
  randomNumber
}
