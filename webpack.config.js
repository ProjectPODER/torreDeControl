var path = require("path");
var BowerWebpackPlugin = require("bower-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HandlebarsPlugin = require("handlebars-webpack-plugin");
var WatchIgnorePlugin = require('watch-ignore-webpack-plugin')
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
				loader: 'style-loader!css-loader!sass-loader?' + sassPaths /* sassPaths adds bourbon neat paths */
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader?'
			}
		]
	},
	plugins: [
		new BowerWebpackPlugin(),
		new HandlebarsPlugin({
            // path to main hbs template
            entry: path.join(process.cwd(), "index.hbs"),
            // filepath to result
            output: path.join(process.cwd(), "index.html"),
            // data passed to main hbs template: `main-template(data)`
            // data: require("./app/data/project.json"),

            // globbed path to partials, where folder/filename is unique
            partials: [
                path.join(process.cwd(), "templates", "*.hbs")
            ],

            // // register custom helpers. May be either a function or a glob-pattern
            // helpers: {
            //     nameOfHbsHelper: Function.prototype,
            //     projectHelpers: path.join(process.cwd(), "app", "helpers", "*.helper.js")
            // },

            // hooks
            onBeforeSetup: function (Handlebars) {},
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data) {},
            onBeforeSave: function (Handlebars, resultHtml) {},
            onDone: function (Handlebars) {}
        }),
        new HandlebarsPlugin({
            // path to main hbs template
            entry: path.join(process.cwd(), "contratos.hbs"),
            // filepath to result
            output: path.join(process.cwd(), "contratos.html"),
            // data passed to main hbs template: `main-template(data)`
            // data: require("./app/data/project.json"),

            // globbed path to partials, where folder/filename is unique
            partials: [
                path.join(process.cwd(), "templates", "*.hbs")
            ],

            // // register custom helpers. May be either a function or a glob-pattern
            // helpers: {
            //     nameOfHbsHelper: Function.prototype,
            //     projectHelpers: path.join(process.cwd(), "app", "helpers", "*.helper.js")
            // },

            // hooks
            onBeforeSetup: function (Handlebars) {},
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data) {},
            onBeforeSave: function (Handlebars, resultHtml) {},
            onDone: function (Handlebars) {}
        }),
        new HandlebarsPlugin({
            // path to main hbs template
            entry: path.join(process.cwd(), "investigacion.hbs"),
            // filepath to result
            output: path.join(process.cwd(), "investigacion.html"),
            // data passed to main hbs template: `main-template(data)`
            // data: require("./app/data/project.json"),

            // globbed path to partials, where folder/filename is unique
            partials: [
                path.join(process.cwd(), "templates", "*.hbs")
            ],

            // // register custom helpers. May be either a function or a glob-pattern
            // helpers: {
            //     nameOfHbsHelper: Function.prototype,
            //     projectHelpers: path.join(process.cwd(), "app", "helpers", "*.helper.js")
            // },

            // hooks
            onBeforeSetup: function (Handlebars) {},
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data) {},
            onBeforeSave: function (Handlebars, resultHtml) {},
            onDone: function (Handlebars) {}
        }),
        new HandlebarsPlugin({
            // path to main hbs template
            entry: path.join(process.cwd(), "metodologia.hbs"),
            // filepath to result
            output: path.join(process.cwd(), "metodologia.html"),
            // data passed to main hbs template: `main-template(data)`
            // data: require("./app/data/project.json"),

            // globbed path to partials, where folder/filename is unique
            

            // // register custom helpers. May be either a function or a glob-pattern
            // helpers: {
            //     nameOfHbsHelper: Function.prototype,
            //     projectHelpers: path.join(process.cwd(), "app", "helpers", "*.helper.js")
            // },

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
	    new WatchIgnorePlugin([
            path.resolve(__dirname, 'index.html'),
            path.resolve(__dirname, 'contratos.html'),
            path.resolve(__dirname, 'investigacion.html'),
            path.resolve(__dirname, 'metodologia.html'),
        ]),
        // new webpack.optimize.UglifyJsPlugin({
        //   compress: { warnings: false }
        // })
	]
};