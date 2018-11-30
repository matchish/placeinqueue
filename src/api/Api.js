'use strict'
const axios = require('axios')
const config = require('../../config')

class Api {
  constructor (basePath) {
    this.client = axios.create({
      baseURL: config.api.baseUrl
    })
  }

  listQueues () {
    return this.client.get('queues')
  }

  createQueue (queue) {
    return this.client.post('queues', queue)
  }

  updateQueue (queue) {
    return this.client.post(`queue/${queue.id}`, queue)
  }

  deleteQueue (queue) {
    return this.client.delete(`queue/${queue.id}`)
  }

  listPlaces (queueId) {
    return this.client.get(`queue/${queueId}/places`)
  }

  updatePlace (place) {
    return this.client.post(`place/${place.id}`, place)
  }

  heartbeat (place) {
    return this.client.post(`place/${place.id}/heartbeat`, {datetime: new Date()})
  }
}

export default Api
