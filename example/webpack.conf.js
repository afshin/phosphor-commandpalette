module.exports = {
  entry: './build/index.js',
  output: {
    filename: './build/bundle.js'
  },
  bail: true,
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
}
