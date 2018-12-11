'use strict'
const axios = require('axios')

class Api {
  constructor (basePath) {
    this.client = axios.create({
      baseURL: process.env.VUE_APP_API_URL
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
}

export default Api
