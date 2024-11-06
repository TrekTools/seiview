const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          VUE_APP_GRAPHQL_ENDPOINT: JSON.stringify(process.env.VUE_APP_GRAPHQL_ENDPOINT),
          VUE_APP_HASURA_ADMIN_SECRET: JSON.stringify(process.env.VUE_APP_HASURA_ADMIN_SECRET)
        }
      })
    ]
  }
})
