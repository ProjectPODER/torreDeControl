var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var BowerWebpackPlugin = require("bower-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HandlebarsPlugin = require("handlebars-webpack-plugin");
var WatchIgnorePlugin = require('watch-ignore-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');


/* includes bourbon neat paths */
var sassPaths = require("bourbon-neat").includePaths.map(function(sassPath) {
  return "includePaths[]=" + sassPath;
}).join("&");

module.exports = {
	entry: './src/main.js',
	output: {
		path: 'dist',
		filename: 'bundle.js',
        sourceMapFilename: "bundle.js.map",
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
				loader: ExtractTextPlugin.extract('style-loader', '!css-loader!sass-loader?' + sassPaths) /* sassPaths adds bourbon neat paths */
			},
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', '!css-loader')
            },
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'file-loader?name=[path][name].[ext]?[hash]',
            }
		]
	},
	plugins: [
		new BowerWebpackPlugin(),
		new HandlebarsPlugin({
            entry: path.join(process.cwd(), "index.hbs"),
            output: path.join(process.cwd(), "index.html"),
            partials: [
                path.join(process.cwd(), "templates", "*.hbs")
            ],

            // hooks
            onBeforeSetup: function (Handlebars) {},
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data) {},
            onBeforeSave: function (Handlebars, resultHtml) {},
            onDone: function (Handlebars) {}
        }),
        new HandlebarsPlugin({
            entry: path.join(process.cwd(), "contratos.hbs"),
            output: path.join(process.cwd(), "contratos.html"),
            partials: [
                path.join(process.cwd(), "templates", "*.hbs")
            ],

            // hooks
            onBeforeSetup: function (Handlebars) {},
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data) {},
            onBeforeSave: function (Handlebars, resultHtml) {},
            onDone: function (Handlebars) {}
        }),
        new HandlebarsPlugin({
            entry: path.join(process.cwd(), "investigacion.hbs"),
            output: path.join(process.cwd(), "investigacion.html"),
            partials: [
                path.join(process.cwd(), "templates", "*.hbs")
            ],

            // hooks
            onBeforeSetup: function (Handlebars) {},
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data) {},
            onBeforeSave: function (Handlebars, resultHtml) {},
            onDone: function (Handlebars) {}
        }),
        new HandlebarsPlugin({
            entry: path.join(process.cwd(), "sobre_el_proyecto.hbs"),
            output: path.join(process.cwd(), "sobre_el_proyecto.html"),

            // hooks
            partials: [
                path.join(process.cwd(), "templates", "*.hbs")
            ],
            onBeforeSetup: function (Handlebars) {},
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data) {},
            onBeforeSave: function (Handlebars, resultHtml) {},
            onDone: function (Handlebars) {}
        }),
		new HtmlWebpackPlugin ({
	      inject: true,
	      template: 'index.html'
	    }),
	    new HtmlWebpackPlugin({  // Also generate a test.html
	      filename: 'contratos.html',
	      template: 'contratos.html'
	    }),
	    new HtmlWebpackPlugin({  // Also generate a test.html
	      filename: 'investigacion.html',
	      template: 'investigacion.html'
	    }),
	    new HtmlWebpackPlugin({  // Also generate a test.html
          filename: 'sobre_el_proyecto.html',
          template: 'sobre_el_proyecto.html'
	    }),
        new HtmlWebpackPlugin({  // Also generate a test.html
          filename: 'iframe-prensa.html',
          template: 'iframe-prensa.html'
        }),
	    new ExtractTextPlugin("[name].css"),
        new CopyWebpackPlugin([
            { from: 'favicons', to: 'favicons' },
            { from: 'data', to: 'data' },
            { from: 'mailserver', to: 'mailserver' },
        ]),
        new webpack.optimize.UglifyJsPlugin({
          compress: { warnings: false }
        })
	]
};
