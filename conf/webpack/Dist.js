'use strict';

/**
 * Dist configuration. Used to build the
 * final output when running npm run dist.
 */
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackBaseConfig = require('./Base');

class WebpackDistConfig extends WebpackBaseConfig {

  constructor() {
    super();
    this.config = {
      cache: false,
      devtool: 'source-map',
      entry: [
        './index.js'
      ],
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new CopyPlugin({
          patterns: [
            { from: `${this.srcPathAbsolute}/manifest.webmanifest` },
            { from: `${this.srcPathAbsolute}/serviceWorker.js` }
          ]
        })
      ]
    };

    // Deactivate hot-reloading if we run dist build on the dev server
    this.config.devServer.hot = false;

    this.config.output.publicPath = 'https://reminders-uploads.s3-eu-west-1.amazonaws.com/assets/resonators-client/';
  }

  /**
   * Get the environment name
   * @return {String} The current environment
   */
  get env() {
    return 'dist';
  }
}

module.exports = WebpackDistConfig;
