import Vue from 'vue'
import Router from 'vue-router'
import Queues from '@/components/Queues'
import Places from '@/components/Places'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Queues
    },
    {
      path: '/queues',
      name: 'Queues',
      component: Queues
    },
    {
      path: '/queue/:id/places',
      name: 'Places',
      component: Places
    }
  ]
})
