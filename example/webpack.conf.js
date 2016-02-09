module.exports = {
  entry: './index.js',
  output: {
    filename: './bundle.js'
  },
  bail: true,
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
}
