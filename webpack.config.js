const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const { EsbuildPlugin } = require('esbuild-loader')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');


const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_PROD = process.env.NODE_ENV === 'production';
const devPort = 3003;

const findRootPath = (path) => {
  const file = 'wp-config.php';
  console.log(path);
  //'/wp-content/themes/vyp-theme/dist/'

  const splitted = path.split('/');
  const foundIndex = splitted.findIndex((item, index) => {
    if (item.length === 0) {
    	return false;
    }
    const partialPath = splitted.slice(0, index + 1).join('/');
    return fs.existsSync(`${partialPath}/${file}`)
  })

  return '/' + splitted.slice(foundIndex + 1, splitted.length).join('/') + '/';
}

const publicPath = findRootPath(path.resolve(__dirname, 'dist'));

console.log('MODE', {IS_DEV, IS_PROD, publicPath})
const config = {
  mode: IS_DEV ? 'development': 'production',
  entry: {
    main: ['./src/main.js' ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: IS_DEV ? publicPath: '',
  },
  devtool: IS_DEV ? 'source-map' : false,
  resolve: {

  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'esbuild-loader',
            options:  {
              target: 'es2015',
            }
          },
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
                sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          }
        ],
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource'
      }
    ]
  },
  optimization: {
    minimize: false,
    minimizer: [
    ],
  },
  
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].css'}),
    new CleanWebpackPlugin({
      verbose: false,
      protectWebpackAssets: false
    }),
    new webpack.DefinePlugin({
      PRODUCTION: IS_PROD,
      DEV: IS_DEV,
    })
  ]
};


if (IS_PROD) {
  config.plugins.push(new BundleAnalyzerPlugin({analyzerMode : 'static', defaultSizes: 'parsed', openAnalyzer: false}))
  config.plugins.push(new webpack.ProgressPlugin());
  config.output.environment = {
    arrowFunction: false,
    bigIntLiteral: false,
    const: false,
    destructuring: false,
    dynamicImport: false,
    forOf: false,
    module: false
  };

  config.optimization = {
    minimize: true,
    minimizer: [
      new EsbuildPlugin({
        target: 'es2015',
        css: true
      })
    ]
  };
}

if (IS_DEV) {
  config.devServer = {
    hot: true,
    liveReload: false,
    port: devPort,
    allowedHosts: "all",
    headers: { "Access-Control-Allow-Origin": "*" },
    devMiddleware: {
      writeToDisk: true,
    },
    historyApiFallback: true,
    compress: true,
    webSocketServer: 'ws',
    client: {
      overlay: true,
      progress: false,
      reconnect: true,
      webSocketTransport: 'ws',
    },
  };
}

module.exports = config;