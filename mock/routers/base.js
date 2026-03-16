'use strict'

function checkError (req, res) {
  if (req.ctx.error) {
    res.code(500).send({ error: 'Internal server error' })
    return true
  }
  return false
}

module.exports = function (fastify) {
  function sendResult (res, data) {
    res.send(data)
  }

  fastify.get('/v1/decentralized_client_stats', (req, res) => {
    try {
      if (checkError(req, res)) return

      sendResult(res, req.state.decentralized_client_stats)
    } catch (e) {
      res.code(500).send({ error: e.message })
    }
  })

  fastify.get('/v1/stratum_server_info', (req, res) => {
    try {
      if (checkError(req, res)) return

      sendResult(res, req.state.stratum_server_info)
    } catch (e) {
      res.code(500).send({ error: e.message })
    }
  })

  fastify.get('/v1/current_stratum_job', (req, res) => {
    try {
      if (checkError(req, res)) return

      sendResult(res, req.state.current_stratum_job)
    } catch (e) {
      res.code(500).send({ error: e.message })
    }
  })

  fastify.get('/v1/coinbaser', (req, res) => {
    try {
      if (checkError(req, res)) return

      sendResult(res, req.state.coinbaser)
    } catch (e) {
      res.code(500).send({ error: e.message })
    }
  })

  fastify.get('/v1/thread_stats', (req, res) => {
    try {
      if (checkError(req, res)) return

      sendResult(res, req.state.thread_stats)
    } catch (e) {
      res.code(500).send({ error: e.message })
    }
  })

  fastify.get('/v1/stratum_client_list', (req, res) => {
    try {
      if (checkError(req, res)) return

      sendResult(res, req.state.stratum_client_list)
    } catch (e) {
      res.code(500).send({ error: e.message })
    }
  })
}
