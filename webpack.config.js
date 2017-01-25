
const webpack = require( 'webpack' ),
    plugins = [

      // public reqire( xxx )
      new webpack.ProvidePlugin({
        React    : 'react',
        ReactDOM : 'react-dom'
      }),

      // chunk files
      new webpack.optimize.CommonsChunkPlugin({
        names     : [ 'vendors', 'common' ],
        minChunks : Infinity
      }),

      // defined environment variable
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify( 'production' ) // or development
      }),
    ],

    // conditions environment
    isProduction = function () {
      return process.env.NODE_ENV === 'production';
    },

    // only when environment variable is 'production' call
    deploy = ( function () {
      var CopyWebpackPlugin  = require( 'copy-webpack-plugin'  ),
          CleanWebpackPlugin = require( 'clean-webpack-plugin' );

      // environment verify
      if ( isProduction() ) {

        // delete publish folder
        plugins.push(
          new CleanWebpackPlugin([ 'publish' ], {
            verbose: true,
            dry    : false,
          })
        );

        // copy files
        plugins.push(
          new CopyWebpackPlugin([
            { from : "src/manifest.json" , to :'../' },
            { from : "src/website_list.json" , to :'../' },
            { context: 'src/assets/images/', from : "*" , to :'../assets/images' }
          ])
        );

        // call uglifyjs plugin
        plugins.push(
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              sequences: true,
              dead_code: true,
              conditionals: true,
              booleans: true,
              unused: true,
              if_return: true,
              join_vars: true,
              drop_console: true
            },
            mangle: {
              except: [ '$', 'exports', 'require' ]
            },
            output: {
              comments: false
            }
          })
        );

      }
    })(),

    // webpack config
    config = {
      entry: {
        vendors : [
          './node_modules/react/dist/react.min.js',
          './node_modules/react-dom/dist/react-dom.min.js',

          './src/vender/pangu.min.js',
          './src/vender/mousetrap.min.js',
          './src/vender/progressbar.min.js',

          './src/vender/notify/notify.js'
        ],
        common : [
          'babel-polyfill',
          './src/service/storage.js',
          './src/vender/jquery-2.1.1.min.js',
        ],
        contentscripts : './src/contentscripts.js',
        background     : './src/background.js',
      },

      output: {
        path     :  isProduction() ? './publish/bundle' : './src/bundle',
        filename : '[name].js'
      },

      devServer: {
        inline: true,
        port  : 7777
      },

      plugins: plugins,

      module: {
        loaders: [{
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
              presets: [ 'es2015', 'stage-0', 'react' ]
            }
        },
        { test: /\.css$/,       loader: 'style!css'      },
        { test: /\.(png|jpg|gif)$/, loader: 'url?limit=12288' },
        {
          test  : require.resolve( './src/vender/jquery-2.1.1.min.js' ),
          loader: 'expose?jQuery!expose?$'
        },
        {
          test  : require.resolve( './src/vender/mousetrap.min.js' ),
          loader: 'expose?Mousetrap'
        }
        ]
      },

      resolve: {
        alias : {
          jquery     : __dirname + '/src/vender/jquery-2.1.1.min.js',
          mousetrap  : __dirname + '/src/vender/mousetrap.min.js',
          pangu      : __dirname + '/src/vender/pangu.min.js',
          progressbar: __dirname + '/src/vender/progressbar.min.js',

          notify     : __dirname + '/src/vender/notify/notify.js',

          util       : __dirname + '/src/service/util.js',
          storage    : __dirname + '/src/service/storage.js',
          local      : __dirname + '/src/service/local.js',
          site       : __dirname + '/src/service/site.js',

          focus      : __dirname + '/src/focus/focus.js',
          controlbar : __dirname + '/src/focus/controlbar.js',
          foucsetting: __dirname + '/src/focus/setting.js',

          read       : __dirname + '/src/read/read.jsx',
          readctlbar : __dirname + '/src/read/controlbar.jsx',
          readsetting: __dirname + '/src/read/setting.js',
          readschedule: __dirname + '/src/read/component/progressbar.jsx',
          readfooter : __dirname + '/src/read/component/footer.jsx',

          dialog     : __dirname + '/src/option/dialog.jsx',
          focusopt   : __dirname + '/src/option/focus.jsx',
          readopt    : __dirname + '/src/option/read.jsx',

          theme1     : '../assets/css/theme1.css',
          theme2     : '../assets/css/theme2.css',

        }
      }

};

module.exports = config;