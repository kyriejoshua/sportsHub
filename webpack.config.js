const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const routerPrefix = '/react-router'

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.(js|jsx)$/,
        use: [{
          loader: 'babel-loader',
          // 该选项必须添加
          query: {
            presets: ['es2015', 'stage-0', 'react']
          }
        }]
      }, {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app/'), // https://webpack.js.org/configuration/resolve/
    },
    extensions: ['.js', 'jsx', '.css', '.json']
  },

  // /home 页面无法访问的原因其实是 webpack-dev-server 如何定位文件的原理
  // webpack-dev-sever 如何定位文件呢
  // webpack-dev-sever 是静态资源服务器，他会通过你的 output 配置去读取文件，通过'/'分割以文件查找的模式匹配文件。
  // 这样自然就产生问题了，因为你配置的路由并不是实际存在的文件，根据文件查找的方式是找不到的，只会 404。
  // https://webpack.docschina.org/configuration/dev-server/#devserver-historyapifallback
  // /home 页面无法访问的解决办法
  // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html。通过传入以下启用：`historyApiFallback: true`
  // 加入后，可以看到 webpack-dev-server 启动后的 log 中有一行 `404s will fallback to /index.html`
  // 意味着原本会进入 /home 目录下查找，但在设置后路径会执行 index.html
  devServer: {
    historyApiFallback: true,
  },
  devtool: "source-map",
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        prefix: JSON.stringify(routerPrefix)
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html'
    })
  ]
}
