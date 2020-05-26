const path = require('path');

module.exports = {
  entry: {
    mocha: "./src/test/main.test.ts",
    quicktest: "./src/test/00-quick-test.ts",
    index: "./src/lib/index.ts"
  },
  mode: "development",
  watch: true,
  target: "node",
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './build'
  },
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  },

  output: {
    path: path.resolve(__dirname),
    filename: './build/[name].js'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },

  node: {
    fs: "empty"
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  }
};
