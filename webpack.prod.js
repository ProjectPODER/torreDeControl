var BowerWebpackPlugin = require("bower-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

/* includes bourbon neat paths */
var sassPaths = require("bourbon-neat").includePaths.map(function(sassPath) {
  return "includePaths[]=" + sassPath;
}).join("&");

module.exports = {
	entry: './src/main.js',
	output: {
		path: 'dist',
		filename: 'main.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract('style-loader', '!css-loader!sass-loader?' + sassPaths) /* sassPaths adds bourbon neat paths */
			}
		]
	},
	plugins: [
		new BowerWebpackPlugin(),
		new ExtractTextPlugin("[name].css"),
		new HtmlWebpackPlugin ({
	      inject: true,
	      template: 'index.html'
	    })

	]
};