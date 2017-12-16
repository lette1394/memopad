var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: [
        'babel-polyfill',
        './src/index.js',
        './src/style.css'
    ],

    output: {
        path: __dirname + '/public/',
				filename: 'bundle.js',
				publicPath: '/uploads'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel?' + JSON.stringify({
                    cacheDirectory: true,
										presets: ['es2015', 'react']					
                })],
                exclude: /node_modules/ 
            },
            {
                test: /\.css$/,
                loader: 'style!css-loader'
						},
						{
							test: /\.(jpg|png|svg)$/,
							loader: 'file',
							include: '/uploads'
						}
        ]
    },

    resolve: {
        root: path.resolve('./src')
    },

    plugins:[
        new webpack.DefinePlugin({
          'process.env':{
            'NODE_ENV': JSON.stringify('production')
          }
        }),
        new webpack.optimize.UglifyJsPlugin({
          compress:{
            warnings: true
          }
				})
    ]

};
