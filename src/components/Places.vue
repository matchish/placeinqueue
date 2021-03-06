<style scoped>
    tr td:last-child{
        width:1% !important;
        white-space:nowrap;
    }
    thead th:last-child{
        width:1% !important;
        white-space:nowrap;
    }
    tr td:first-child{
        width:1% !important;
        white-space:nowrap;
    }
    thead th:first-child{
        width:1% !important;
        white-space:nowrap;
    }
    tr td:nth-child(2){
        width:5% !important;
        white-space:nowrap;
    }
    thead th:nth-child(2){
        width:5% !important;
        white-space:nowrap;
    }
</style>

<template>
    <v-container fluid>
        <v-layout row wrap>
            <v-flex xs12 transition="slide-x-transition">
                <v-breadcrumbs :items="breadcrumbs" divider=">"></v-breadcrumbs>
                <v-snackbar
                        v-model="snackbar.value"
                        :color="snackbar.color"
                        :multi-line="'multi-line'"
                        :timeout="4000"
                        :top="true"
                        :right="true"
                >
                    {{ snackbar.text }}
                    <v-btn
                            dark
                            flat
                            @click="snackbar = false"
                    >
                        Close
                    </v-btn>
                </v-snackbar>
                <v-toolbar flat color="white">
                    <v-toolbar-title>Places</v-toolbar-title>
                    <v-divider
                            class="mx-2"
                            inset
                            vertical
                    ></v-divider>
                </v-toolbar>
                <v-data-table
                        :headers="headers"
                        :items="places"
                        :loading="true"
                        class="elevation-1"
                >
                    <v-progress-linear v-if="loading" height="2" slot="progress" indeterminate></v-progress-linear>
                    <v-progress-linear v-if="!loading" height="2" slot="progress" value="0"></v-progress-linear>
                    <template slot="items" slot-scope="props">
                        <tr>
                            <td class="justify-center">
                                <v-icon
                                        v-bind:color="props.item.used ? 'success' : ''"
                                        small
                                >
                                    check_circle
                                </v-icon>
                            </td>
                            <td class="justify-center">
                                <v-icon
                                        v-bind:color="online(props.item) ? 'success' : ''"
                                        small
                                >
                                    offline_bolt
                                </v-icon>
                                &nbsp;
                                {{ props.item.status }}
                            </td>
                            <td class="text-xs-left">{{ props.item.number_in_queue !== null ? props.item.number_in_queue : 'none' }}</td>
                            <td class="text-xs-left">
                                <span v-if="!props.item.url">none</span>
                                <a v-if="props.item.url" target="_blank" :href="props.item.url">{{props.item.remote_id}}</a>
                            </td>
                            <td class="text-xs-left">

                                <v-dialog :disabled="!props.item.screenshot">
                                    <v-btn v-bind:color="!!props.item.screenshot ? 'primary' : 'grey'" flat icon slot="activator">
                                        <v-icon
                                                middle
                                        >
                                            image
                                        </v-icon>
                                    </v-btn>

                                    <v-carousel
                                            height="100%"
                                    >
                                        <v-carousel-item
                                                v-for="(item,i) in [props.item.screenshot]"
                                                :key="i"
                                                :src="props.item.screenshot"
                                        ></v-carousel-item>
                                    </v-carousel>

                                </v-dialog>
                            </td>
                            <td class="justify-center">
                                <v-btn flat icon slot="activator">
                                    <v-icon
                                            small
                                            @click="onClickCopy(props.item)"
                                    >
                                        content_copy
                                    </v-icon>
                                </v-btn>
                                <v-btn flat icon
                                       :disabled="props.item.action == 'screenshot'"
                                       slot="activator">
                                    <v-icon
                                            v-if="props.item.action != 'screenshot'"
                                            small
                                            @click="setAction(props.item, 'screenshot')"
                                    >
                                        camera_alt
                                    </v-icon>
                                    <v-progress-circular
                                            size="20"
                                            width="2"
                                            v-if="props.item.action == 'screenshot'"
                                            indeterminate color="grey lighten-2"></v-progress-circular>
                                </v-btn>
                                <v-btn flat icon
                                       :disabled="props.item.action == 'restart'"
                                       slot="activator">
                                    <v-icon
                                            v-if="props.item.action != 'restart'"
                                            small
                                            @click="setAction(props.item, 'restart')"
                                    >
                                        loop
                                    </v-icon>
                                    <v-progress-circular
                                            size="20"
                                            width="2"
                                            v-if="props.item.action == 'restart'"
                                            indeterminate color="grey lighten-2"></v-progress-circular>
                                </v-btn>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import Api from '../api/Api'
    import moment from 'moment'
    const api = new Api()

    export default {
      name: 'Places',
      data: () => ({
        breadcrumbs: [{
          text: 'Dashboard',
          disabled: true,
          to: {name: 'Dashboard'}
        }, {
          text: 'Queues',
          disabled: false,
          to: {name: 'Queues'}
        }],
        snackbar: {},
        loading: true,
        headers: [
                {text: 'Used', value: 'used', sortable: false},
                {text: 'Online', value: 'heartbeat_at', sortable: false},
          {
            text: 'Number in queue',
            align: 'left',
            sortable: false,
            value: 'number_in_queue'
          },
                {text: 'Url', value: 'url', sortable: false},
                {text: 'Image', value: 'screenshot', sortable: false},
                {text: 'Actions', value: 'used', sortable: false}

        ],
        places: []
      }),

      created () {
        this.initialize()
      },

      beforeDestroy () {
        clearInterval(this.updateListInterval)
      },

      methods: {
        initialize () {
          const updateList = async () => {
            try {
              this.loading = true
              let response = await api.listPlaces(this.$route.params.id)
              this.places = response.data
            } catch (e) {
              this.showError(e)
            } finally {
              this.loading = false
            }
          }
          updateList()
          this.updateListInterval = setInterval(updateList, 5000)
        },
        showError: function (e) {
          this.snackbar = {
            value: true,
            color: 'error',
            text: e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message
          }
        },
        async toggleUsed (item) {
          this.loading = true
          let copy = {...item, used: !item.used}
          try {
            await api.updatePlace(copy)
            let response = await api.listPlaces(this.$route.params.id)
            this.places = response.data
          } catch (e) {
            this.showError(e)
          } finally {
            this.loading = false
          }
        },
        async setAction (item, action) {
          let copy = {...item, action: action}
          try {
            await api.updatePlace(copy)
          } catch (e) {
            this.showError(e)
          }
        },
        copyUrl: function (item) {
          this.$copyText(item.url)
        },
        onClickCopy: function (item) {
          this.copyUrl(item)
          this.toggleUsed(item)
        },
        online: function (item) {
          if (!item.heartbeat_at) {
            return false
          }
            // TODO magic constant
          const minuteAgo = moment().subtract(1, 'minutes')
          return minuteAgo.isBefore(moment(item.heartbeat_at))
        }
      }

    }
</script>