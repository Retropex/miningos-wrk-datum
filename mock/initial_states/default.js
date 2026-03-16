'use strict'

const { generateClientStats, stratumServerInfo, currentStratumJob, coinbaser, threadStats, stratumClientList, configuration } = require('./utils')

module.exports = function (CTX) {
  const state = {
    decentralized_client_stats: generateClientStats(),
    stratum_server_info: stratumServerInfo(),
    current_stratum_job: currentStratumJob(),
    coinbaser: coinbaser(),
    thread_stats: threadStats(),
    stratum_client_list: stratumClientList(),
    configuration: configuration()
  }

  const initialState = JSON.parse(JSON.stringify(state))

  function cleanup () {
    Object.assign(state, initialState)
    return state
  }

  return { state, cleanup }
}
