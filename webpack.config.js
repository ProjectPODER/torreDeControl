var BowerWebpackPlugin = require("bower-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

/* includes bourbon neat paths */
var sassPaths = require("bourbon-neat").includePaths.map(function(sassPath) {
  return "includePaths[]=" + sassPath;
}).join("&");

module.exports = {
	entry: './src/main.js',
	output: {
		path: 'dist',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				query: {
					plugins: ['transform-decorators-legacy' ],
					presets: ['es2015', 'react', 'stage-0']
				}
			},
			{
				test: /\.scss$/,
				loader: 'style-loader!css-loader!sass-loader?' + sassPaths /* sassPaths adds bourbon neat paths */
			}
		]
	},
	plugins: [
		new BowerWebpackPlugin(),
		new HtmlWebpackPlugin ({
	      inject: true,
	      template: 'index.html'
	    })
	]
};