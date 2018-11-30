<template>
    <v-container fluid>
        <v-layout row wrap>
            <v-flex size="xs12" transition="slide-x-transition">
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
                    <v-toolbar-title>Queues</v-toolbar-title>
                    <v-divider
                            class="mx-2"
                            inset
                            vertical
                    ></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="500px">
                        <v-btn slot="activator" color="primary" dark class="mb-2">New Queue</v-btn>
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container grid-list-md>
                                    <v-layout column wrap>
                                        <v-flex xs5 sm6 md4>
                                            <v-text-field v-model="editedItem.title" label="Title"></v-text-field>
                                        </v-flex>
                                        <v-flex xs5 sm6 md4>
                                            <v-text-field type="datetime-local" v-model="editedItem.datetime"
                                                          label="Start"></v-text-field>
                                        </v-flex>
                                        <v-flex xs5 sm6 md4>
                                            <v-text-field type="number" v-model="editedItem.prestart"
                                                          label="Prestart(min)"></v-text-field>
                                        </v-flex>
                                        <v-flex xs5 sm6 md4>
                                            <v-text-field v-model="editedItem.url" label="Url"></v-text-field>
                                        </v-flex>
                                        <v-flex xs5 sm6 md4>
                                            <v-text-field v-model="editedItem.places" type="number"
                                                          label="Places"></v-text-field>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                                <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
                <v-data-table
                        :headers="headers"
                        :items="queues"
                        class="elevation-1"
                        :loading="loading"
                >
                    <template slot="items" slot-scope="props">
                        <td>
                            <router-link :to="{ name: (currentQueueId ? 'Queues': 'Places'), params: { id: props.item.id }}">{{
                                props.item.title }}
                            </router-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.datetime | moment('LLL') }}</td>
                        <td class="text-xs-left">{{ props.item.prestart }}</td>
                        <td class="text-xs-left">{{ props.item.url }}</td>
                        <td class="text-xs-left">{{ props.item.places }}</td>
                        <td class="justify-center layout px-0">
                            <v-icon
                                    small
                                    class="mr-2"
                                    @click="editItem(props.item)"
                            >
                                edit
                            </v-icon>
                            <v-icon
                                    small
                                    @click="deleteItem(props.item)"
                            >
                                delete
                            </v-icon>
                        </td>
                    </template>
                    <template slot="no-data">
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import moment from 'moment'
    import Api from '../api/Api'

    const api = new Api()

    export default {
      name: 'Queues',
      data: () => ({
        currentQueueId: undefined,
        dialog: false,
        loading: false,
        snackbar: {},
        breadcrumbs: [{
          text: 'Dashboard',
          disabled: true,
          href: '/'
        }],
        headers: [
          {
            text: 'Title',
            align: 'left',
            sortable: false,
            value: 'title'
          },
                {text: 'Start', value: 'datetime', sortable: false},
                {text: 'Prestart', value: 'prestart', sortable: false},
                {text: 'Url', value: 'url', sortable: false},
                {text: 'Places', value: 'places', sortable: false},
                {text: 'Actions', value: 'name', sortable: false}
        ],
        queues: [],
        editedIndex: -1,
        editedItem: {},
        defaultItem: {}
      }),

      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'New Queue' : 'Edit Queue'
        }
      },

      watch: {
        dialog (val) {
          val || this.close()
        },
        '$route' (to, from) {
          console.log(from, to)
          this.currentQueueId = this.$route.name === 'Places' ? this.$route.params.id : undefined
        }
      },
      created () {
        this.initialize()
      },

      methods: {
          // TODO: duplicate
        showError: function (e) {
          this.snackbar = {
            value: true,
            color: 'error',
            text: e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message
          }
        },
        async initialize () {
          this.currentQueueId = this.$route.name === 'Places' ? this.$route.params.id : undefined
          this.loading = true
          try {
            let response = await api.listQueues()
            this.queues = response.data
          } catch (e) {
            this.showError(e)
          }
          this.loading = false
        },

        editItem (item) {
          this.editedIndex = this.queues.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.editedItem.datetime = moment(this.editedItem.datetime).utc().format('YYYY-MM-DDTHH:mm')
          this.dialog = true
        },

        async deleteItem (item) {
          if (confirm('Are you sure you want to delete this item?')) {
            await api.deleteQueue(item)
            let response = await api.listQueues()
            this.queues = response.data
          }
        },

        close () {
          this.dialog = false
          setTimeout(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          }, 300)
        },

        async save () {
          let copy = Object.assign({}, this.editedItem)
          if (copy.datetime) {
            copy.datetime = moment.utc(copy.datetime)
          }
          try {
            if (copy.id) {
              await api.updateQueue(copy)
            } else {
              await api.createQueue(copy)
            }
            let response = await api.listQueues()
            this.queues = response.data
          } catch (e) {
            this.showError(e)
          }
          this.close()
        }
      }
    }
</script>
