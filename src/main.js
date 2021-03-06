// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import moment from 'moment'
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)
Vue.use(Vuetify, { theme: {
  primary: '#ee44aa',
  secondary: '#424242',
  accent: '#82B1FF',
  error: '#FF5252',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FFC107'
}})
Vue.config.productionTip = false

Vue.filter('moment', function (value, format) {
  return moment(value).utc().format(format)
})
Vue.filter('truncate', function (text, stop, clamp) {
  return text ? text.slice(0, stop) + (stop < text.length ? clamp || '...' : '') : text
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
