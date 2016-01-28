module.exports = {
  entry: './index.ts',
  output: {
    filename: './build/bundle.js'
  },
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  bail: true,
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
}
