import VueGtag from 'vue-gtag-next'

export const analytics = {
  install(app) {
    app.use(VueGtag, {
      property: {
        id: 'G-NQLTJY5B7B' // Replace with your GA4 Measurement ID
      }
    })
  }
} 