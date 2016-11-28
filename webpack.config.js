"use strict";

const path = require('path');
const webpack = require('webpack');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const HtmlPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

const paths = {
    src: {
    	root: path.join(__dirname, 'src/'),
        images: 'img/',
        scripts: 'js/',
        styles: 'scss/',
        fonts: 'fonts/'
    },
    dist: {
    	root: path.join(__dirname, 'webroot/'),
        images: 'img/',
        scripts: 'js/',
        styles: 'css/',
        fonts: 'fonts/'
    }
};

const environmentVariables = {
    local: [
        {
            search: '{{envPath}}',
            replace: ''
        }
    ],
    dev: [
        {
            search: '{{envPath}}',
            replace: ''
        }
    ],
    qa: [
        {
            search: '{{envPath}}',
            replace: 'https://qa.example.com'
        }
    ],
    uat: [
        {
            search: '{{envPath}}',
            replace: 'https://uat.example.com'
        }
    ],
    prod: [
        {
            search: '{{envPath}}',
            replace: 'https://example.com'
        }
    ]
};

const sassLoaders = [
	'css?sourceMap',
	'postcss?sourceMap',
	'sass?sourceMap'
];

let environment = 'local';
let args = JSON.parse(process.env.npm_config_argv).original;
let task = args[1].toLowerCase();
// --port=1337
let port = !Number.isNaN(Number.parseInt(process.env.npm_config_port)) ? parseInt(process.env.npm_config_port) : 8080;
// --no-reload
let reload = args.indexOf('--no-reload') > -1 ? false : true;

['prod', 'uat', 'qa', 'dev'].forEach((v) => {
	if (args.indexOf(`--${v}`) > -1) {
		environment = v;
	}
});

let webpackConfig = {
	debug: false,
	devtool: false,
	entry: {
		main: [
			path.join(paths.src.root, paths.src.scripts, 'main.js'),
			path.join(paths.src.root, paths.src.styles, 'main.scss')
		]
	},
	output: {
		path: paths.dist.root,
		filename: path.join(paths.dist.scripts, '[name].js'),
		publicPath: '/'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: path.join(paths.src.root, paths.src.scripts),
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.scss$/,
				include: path.join(paths.src.root, paths.src.styles),
                loader: ExtractTextPlugin.extract(sassLoaders.join('!'))
			},
			{
				test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
				include: [
					path.join(paths.src.root, paths.src.images)
				],
				loader: 'file',
				query: {
					limit: 10240,
					name: path.join(paths.src.images, '[name].[ext]')
				}
			},
			{
				test: /\.woff$|\.woff2?$|\.ttf$|\.eot$/,
				include: [
					path.join(paths.src.root, paths.src.fonts)
				],
				loader: 'file',
				query: {
					limit: 10240,
					name: path.join(paths.src.fonts, '[name].[ext]')
				}
			},
			{
				test: /\.js$|\.scss$/,
				include: [
					path.join(paths.src.root, paths.src.scripts),
					path.join(paths.src.root, paths.src.styles)
				],
				loader: 'string-replace',
				query: {
					multiple: environmentVariables[environment]
				}
			}
		]
	},
	postcss: function () {
        return [precss, autoprefixer({browsers: ['last 3 versions']})];
    },
	plugins: [
        new CleanPlugin(paths.dist.root),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(environment)
			}
		}),
		new ExtractTextPlugin(path.join(paths.dist.styles, 'main.css'), {
			allChunks: true
		}),
		new HtmlPlugin({
			template: path.join(paths.src.root, 'index.html')
		}),
		new CopyPlugin([
			{context: paths.src.root, from: path.join(paths.src.images, '**/*'), to: paths.dist.root},
			{context: paths.src.root, from: path.join(paths.src.fonts, '**/*'), to: paths.dist.root}
		])
	]
};

if (environment === 'local' || environment === 'dev') {
	// Allow easier debugging of loaders
	webpackConfig.debug = true;
	// http://webpack.github.io/docs/configuration.html#devtool
	webpackConfig.devtool = 'source-map';
}

if (task === 'watch') {
	if (reload) {
		webpackConfig.entry.main.unshift(`webpack-dev-server/client?http://localhost:${port}`);
		webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
	}
	webpackConfig.devServer = {
		contentBase: paths.dist.root,
		outputPath: paths.dist.root,
		port: port,
		inline: reload,
		progress: true,
		hot: reload,
		stats: {
			colors: true
		}
	};
} else {
	if (!(environment === 'local' || environment === 'dev')) {
		webpackConfig.plugins.push(
			// Looks for similar chunks and files and merges them for better caching by the user
			new webpack.optimize.DedupePlugin(),

			// Optimizes chunks and modules by how much they are used in your app
			new webpack.optimize.OccurenceOrderPlugin(),

			// Prevents Webpack from creating chunks that would be too small to be worth loading separately
			new webpack.optimize.MinChunkSizePlugin({
				minChunkSize: 51200, // ~50kb
			}),

			// Minify all the Javascript code of the final bundle
			new webpack.optimize.UglifyJsPlugin({
				mangle: true,
				compress: {
					warnings: false, // Suppress uglification warnings
				}
			})
		);
	}
}

module.exports = webpackConfig;