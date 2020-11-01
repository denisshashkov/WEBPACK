const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const FileLoader = require('file-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');


const isDev = process.env.NODE_ENV === 'development';
console.log('IS DEV', isDev);

const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }
  if(isProd) {
    config.minimizer = [
      new CssMinimizerWebpackPlugin(),
      //new TerserPlugin()
    ]
  }
  return config
}

const fileName = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoader = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true
      },
    },
    'css-loader',
  ]
  if(extra) {
    loaders.push(extra)
  }
  return loaders
}

const babelOptions= preset => {
 const opts = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties']
 }

 if(preset) {
   opts.presets.push(preset)
 }

 return opts
}

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: babelOptions()
  }]
  if(isDev) {
    loaders.push('eslint-loader')
  }
  return loaders 
}



module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill','./index.js'],
    
  },
  output: {
    filename: fileName('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  optimization: optimization(),
  devServer: {
    port: 8080,
    hot: isDev
  },
  devtool: isDev ? 'source-map' : '',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from:path.resolve(__dirname, 'src/favicon.ico'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: fileName('css')
    }),
    
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use:cssLoader()
      },
      {
        test: /\.s[ac]ss$/,
        use:cssLoader('sass-loader')
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      }
    ]
  }
}