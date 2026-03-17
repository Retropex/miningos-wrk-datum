'use strict'

const { setTimeout: sleep } = require('timers/promises')
const DigestClient = require('digest-fetch').default

class OceanMinerPoolApi {
  constructor (http) {
    this._http = http
  }

  async _request (apiPath, auth) {
    // waiting between calls due to api rate limits
    await sleep(1000)
    let resp
    if (auth) {
      const client = new DigestClient(auth.user, auth.password, { algorithm: 'SHA-256' })
      const url = apiPath.includes('://') ? apiPath : `${this._http.baseUrl}/${apiPath.replace(/^\//, '')}`
      const response = await client.fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      resp = await response.json()
    } else {
      const { body } = await this._http.get(apiPath, { encoding: 'json' })
      resp = body
    }
    return resp
  }

  async getDecentralizedClientStats () {
    return this._request('/v1/decentralized_client_stats')
  }

  async getStratumServerInfo () {
    return this._request('/v1/stratum_server_info')
  }

  async getCurrentStratumJob () {
    return this._request('/v1/current_stratum_job')
  }

  async getCoinbaser () {
    return await this._request('/v1/coinbaser')
  }

  async getThreadStats () {
    return await this._request('/v1/thread_stats')
  }

  async getStratumList (auth) {
    return await this._request('/v1/stratum_client_list', auth)
  }

  async getConfiguration (auth) {
    return await this._request('/v1/configuration', auth)
  }
}

module.exports = {
  OceanMinerPoolApi
}
