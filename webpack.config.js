"use strict";

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const HtmlPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

// Paths of your project
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

// Exclude these files from copying from the `src/` folder to the build folder
const excludeFiles = [];
// Exclude these folders from copying from the `src/` folder to the build folder
const excludeFolders = [
	paths.src.scripts.replace('/', ''), // Scripts - this is automatically created with the combined JS file
	paths.src.styles.replace('/', '')  // Styles - this is automatically created with the combined CSS file
];

// Environment varaibles that you can use in .html, .scss and .js. Useful if using a CDN.
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

// Style loaders. If you wanted to change to LESS you would change it here
const styleLoaders = [
	'css?sourceMap',
	'postcss?sourceMap',
	'sass?sourceMap'
];

// Get CLI arguments
let args = JSON.parse(process.env.npm_config_argv).original;
let task = args[1].toLowerCase();

// Work out environment
let environment = 'local';
['prod', 'uat', 'qa', 'dev'].forEach((v) => {
	if (args.indexOf(`--${v}`) > -1) {
		environment = v;
	}
});

// Set task flags
// --port=1337
let port = !Number.isNaN(Number.parseInt(process.env.npm_config_port)) ? parseInt(process.env.npm_config_port) : 8080;
// --no-reload
let reload = args.indexOf('--no-reload') > -1 ? false : true;
// --no-minify
let minify = args.indexOf('--no-minify') > -1 ? false : true;
// 	--no-uglify
let uglify = args.indexOf('--no-uglify') > -1 ? false : true;
// --no-inject
let inject = args.indexOf('--no-inject') > -1 ? false : true;
// --no-optimize
let optimize = args.indexOf('--no-optimize') > -1 ? false : true;
// --sourcemaps
let sourcemaps = args.indexOf('--sourcemaps') > -1 ? true : false;

// Set dev environment flags
if (environment === 'local' || environment === 'dev') {
	// --minify
	minify = args.indexOf('--minify') > -1 ? true : false;
	// --uglify
	uglify = args.indexOf('--uglify') > -1 ? true : false;
	// --optimize
	optimize = args.indexOf('--optimize') > -1 ? true : false;
	// --no-sourcemaps
	sourcemaps = args.indexOf('--no-sourcemaps') > -1 ? false : true;
}

// Get files and folders in `src/` folder
const files = {
	folders: [],
	html: [],
	other: []
};

const rootFiles = fs.readdirSync(paths.src.root);

rootFiles.forEach(file => {
	let stats = fs.statSync(path.join(paths.src.root, file));
	if (stats.isFile()) {
		if (file.toLowerCase().indexOf('.htm') > -1) {
			files.html.push(file);
		} else {
			files.other.push(file);
		}
	} else if (stats.isDirectory()) {
		files.folders.push(file);
	}
});

// Webpack config
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
                loader: ExtractTextPlugin.extract(styleLoaders.join('!'))
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
			// Add any extension that isn't .js/.css here that you want replace to work
			{
				test: /\.htm$|\.html$/,
				loader: 'raw'
			},
			{
				test: /\.htm$|\.html$|\.js$|\.scss$/,
				include: [
					paths.src.root
				],
				exclude: [
					path.join(paths.src.root, paths.src.images),
					path.join(paths.src.root, paths.src.fonts)
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
		})
	]
};

// Add HTML files
if (files.html.length) {
	files.html.forEach(file => {
		webpackConfig.plugins.push(new HtmlPlugin({
			template: path.join(paths.src.root, file),
			filename: file,
			hash: true,
			inject: inject,
			minify: (!minify ? false : {
				caseSensitive: true,
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true
			})
		}));
	});
}

// Copy files from root
if (files.other.length) {
	files.other.forEach(file => {
		if (excludeFiles.indexOf(file) === -1) { 
			webpackConfig.plugins.push(new CopyPlugin([
				{context: paths.src.root, from: file, to: paths.dist.root}
			]));
		}
	});
}

// Copy folders
if (files.folders.length) {
	files.folders.forEach(file => {
		if (excludeFolders.indexOf(file) === -1) { 
			webpackConfig.plugins.push(new CopyPlugin([
				{context: paths.src.root, from: path.join(file, '/**/*'), to: paths.dist.root}
			]));
		}
	});
}

if (sourcemaps) {
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
		inline: reload, // Inject code for Automatic refresh
		progress: true,
		hot: reload, // Automatic refresh on updates
		stats: {
			colors: true
		}
	};
} else {
	if (optimize) {
		webpackConfig.plugins.push(
			// Looks for similar chunks and files and merges them for better caching by the user
			new webpack.optimize.DedupePlugin(),

			// Optimizes chunks and modules by how much they are used in your app
			new webpack.optimize.OccurenceOrderPlugin(),

			// Prevents Webpack from creating chunks that would be too small to be worth loading separately
			new webpack.optimize.MinChunkSizePlugin({
				minChunkSize: 51200, // ~50kb
			})
		);
	}
	// Minify / uglify JS
	if (minify || uglify) {
		webpackConfig.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				mangle: uglify,
				compress: !minify ? false : {
					warnings: false, // Suppress uglification warnings
				},
				beautify: !minify ? true : false // Hack to get around minified code if minify is false but uglify is true
			})
		);
	}
}

module.exports = webpackConfig;