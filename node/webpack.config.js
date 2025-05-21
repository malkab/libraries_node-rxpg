// Doc version: 2021-07-19

// Webpack 5

const path = require("path");

module.exports = {

  entry: {
    mocha: "./test/main.test.ts",
    quicktest: "./test/00-quick-test.ts",
    index: "./src/index.ts"
  },

  mode: "development",

  watchOptions: {
    poll: true,
    aggregateTimeout: 300,
    ignored: /node_modules/
  },

  target: "node",
  devtool: "inline-source-map",

  devServer: {
    contentBase: "./build"
  },

  // These are functions that filters warnings based on the source module and
  // the warning's message
  ignoreWarnings: [

    (warning, compilation) =>
      (warning.module.resource).indexOf("chokidar") > -1,

    (warning, compilation) =>
      (warning.module.resource).indexOf("mocha") > -1 &&
        (warning.message).indexOf("the request of a dependency") > -1,

    (warning, compilation) =>
      (warning.message).indexOf("the request of a dependency") > -1,

    (warning, compilation) =>
      (warning.message).indexOf("Critical dependency: require function is used in a way in which dependencies cannot be statically extracted") > -1,

  ],

  output: {
    path: path.resolve(__dirname),
    filename: "./build/[name].js"
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
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

  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  }

}
