'use strict'

const async = require('async')
const TetherWrkBase = require('tether-wrk-base/workers/base.wrk.tether')
const { DatumApi } = require('./lib/datum.minerpool.api')
const gLibUtilBase = require('lib-js-util-base')

class WrkMinerDatum extends TetherWrkBase {
  constructor (conf, ctx) {
    super(conf, ctx)

    if (!ctx.rack) {
      throw new Error('ERR_PROC_RACK_UNDEFINED')
    }

    this.prefix = `${this.wtype}-${ctx.rack}`
    this.init()
    this.start()

    this.data = {
      statsData: {},
      workersData: { ts: 0, workers: [] },
      yearlyBalances: {}
    }
  }

  init () {
    super.init()

    this.loadConf('datum', 'datum')

    this.setInitFacs([
      ['fac', 'bfx-facs-scheduler', '0', 'datum', {}, -10],
      ['fac', 'hp-svc-facs-store', 's1', 's1', {
        storePrimaryKey: this.ctx.storePrimaryKey,
        storeDir: `store/${this.ctx.rack}-db`
      }, 0],
      ['fac', 'bfx-facs-http', '0', '0', {
        baseUrl: this.conf.datum.apiUrl,
        timeout: 30 * 1000
      }, 0]
    ])
  }

  _start (cb) {
    async.series([
      (next) => { super._start(next) },
      async () => {
        this.net_r0.rpcServer.respond('getWrkExtData', async (req) => {
          return await this.net_r0.handleReply('getWrkExtData', req)
        })
        this.DatumApi = new DatumApi(this.http_0)
      }
    ], cb)
  }

  _logErr (msg, err) {
    console.error(new Date().toISOString(), msg, err)
  }

  auth () {
    const authConf = {
      user: this.conf.datum.user,
      password: this.conf.datum.password
    }

    return authConf
  }

  async getDatumStats () {
    let datumStats

    try {
      datumStats = await this.DatumApi.getDecentralizedClientStats()
    } catch (e) {
      this._logErr('ERR_DATUM_STATS_FETCH', e)
    }

    if (!datumStats) {
      return { error: 'Datum stats unavailable' }
    }

    return datumStats
  }

  async getStratumInfo () {
    let stratumInfo

    try {
      stratumInfo = await this.DatumApi.getStratumServerInfo()
    } catch (e) {
      this._logErr('ERR_STRATUM_INFO_FETCH', e)
    }

    if (!stratumInfo) {
      return { error: 'Stratum info unavailable' }
    }

    return stratumInfo
  }

  async getStratumJob () {
    let stratumJob

    try {
      stratumJob = await this.DatumApi.getCurrentStratumJob()
    } catch (e) {
      this._logErr('ERR_STRATUM_JOB_FETCH', e)
    }

    if (!stratumJob) {
      return { error: 'Stratum Job unavailable' }
    }

    return stratumJob
  }

  async getThreadStats () {
    let threadStats

    try {
      threadStats = await this.DatumApi.getThreadStats()
    } catch (e) {
      this._logErr('ERR_THREAD_STATS_FETCH', e)
    }

    if (!threadStats) {
      return { error: 'Thread stats unavailable' }
    }

    return threadStats
  }

  async getStratumList () {
    let stratumList

    try {
      stratumList = await this.DatumApi.getStratumList(this.auth())
    } catch (e) {
      this._logErr('ERR_STRATUM_LIST_FETCH', e)
    }

    if (!stratumList) {
      return { error: 'Stratum list unavailable' }
    }

    return stratumList
  }

  async getCoinbaser () {
    let coinbaser

    try {
      coinbaser = await this.DatumApi.getCoinbaser()
    } catch (e) {
      this._logErr('ERR_COINBASER_FETCH', e)
    }

    if (!coinbaser) {
      return { error: 'Coinbaser unavailable' }
    }

    return coinbaser
  }

  async getConfiguration () {
    let configuration

    try {
      configuration = await this.DatumApi.getConfiguration(this.auth())
    } catch (e) {
      this._logErr('ERR_CONFIGURATION_FETCH', e)
    }

    if (!configuration) {
      return { error: 'Configuration unavailable' }
    }

    return configuration
  }

  async getWrkExtData (req) {
    const { query } = req
    if (!query) throw new Error('ERR_QUERY_INVALID')

    const { key } = query
    if (!key) throw new Error('ERR_KEY_INVALID')

    let data
    switch (key) {
      case 'datum-stats':
        data = await this.getDatumStats()
        break
      case 'stratum-info':
        data = await this.getStratumInfo()
        break
      case 'stratum-job':
        data = await this.getStratumJob()
        break
      case 'thread-stats':
        data = await this.getThreadStats()
        break
      case 'stratum-list':
        data = await this.getStratumList()
        break
      case 'coinbaser':
        data = await this.getCoinbaser()
        break
      case 'configuration':
        data = await this.getConfiguration()
        break
      default:
        data = this.data[key]
        break
    }

    if (!gLibUtilBase.isEmpty(query.fields)) return this._projection(data, query.fields)
    return data
  }
}

module.exports = WrkMinerDatum
