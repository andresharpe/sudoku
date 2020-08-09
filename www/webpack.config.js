/// ./www/webpack.config.js

if (process.env.NODE_ENV !== 'production') {
  console.log('Using dotenv...');
  require('dotenv').config();
}

const path = require("path");
const webpack = require("webpack");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = function(env,argv) {
  const isEnvDevelopment = argv.mode === 'development';
  const isEnvProduction = !isEnvDevelopment;

  return {
    entry: "./src/init.js",
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader: "babel-loader",
          options: { 
            presets: ["@babel/env"],
            plugins: ['react-hot-loader/babel'],
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.s(a|c)ss$/,
          loader: [
            isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isEnvDevelopment
              }
            }
          ]
        },
        {
          loader: require.resolve('file-loader'),
          exclude: [/\.(js|mjs|jsx|ts|tsx|sass|scss|wasm)$/, /\.html$/, /\.json$/],
          options: {
            name: 'static/media/[name].[hash:8].[ext]',
            esModule: false,
          },
        },
      ]
    },
    resolve: { 
      extensions: ["*", ".js", ".jsx",".scss"],
      alias: {
        'react-dom': '@hot-loader/react-dom'
      }
    },
    output: {
      path: isEnvProduction ? __dirname + '/dist' : undefined,
      pathinfo: isEnvDevelopment,
      publicPath: "",
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/bundle.js',
      chunkFilename: (isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js')
    },
    devServer: {
      port: 3000,
      publicPath: "http://localhost:3000/",
      hotOnly: true,
      // shows Rust compiler errors in the browser
      overlay: true,
      open: true,       
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin(
        {
          template: path.resolve(__dirname, 'public/index.html'), 
          inject: true
        }
      ),
      isEnvProduction && new FaviconsWebpackPlugin({
        logo: './src/media/logo.png',
        publicPath: process.env.PUBLIC_URL_PATH,
        outputPath: '/static/webapp',
        prefix: './static/webapp',
        favicons: {
          start_url: 
            process.env.PUBLIC_URL+
            process.env.PUBLIC_URL_PATH+
            'index.html?homescreen=1',
          background: "#000",
          theme_color: "#000",
          orientation: "portrait",
          icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            coast: true,
            favicons: true,
            firefox: true,
            windows: true,
            yandex: true
        }
        }
      }),
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      isEnvProduction && new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
      }),
      new WasmPackPlugin({
        crateDirectory: "../",
        args: "--log-level warn",
        outName: "lib",
      }),
      isEnvProduction && new WorkboxPlugin.GenerateSW({
        modifyURLPrefix: {'/': './'},
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          { 
            urlPattern: ({url}) => url.origin === 'https://sharpe.co.za', 
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sharpe-other'
            }
          },
          { 
            urlPattern: ({url}) => url.origin === 'https://fonts.googleapis.com', 
            handler: 'StaleWhileRevalidate', 
            options: {
              cacheName: 'fonts-stylesheets',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          { 
            urlPattern: ({url}) => url.origin === 'https://fonts.gstatic.com', 
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-webfonts',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      }),
    ].filter(Boolean)
  }
};