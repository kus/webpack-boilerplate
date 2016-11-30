Webpack Boilerplate
===================

This project is meant to be used as a starting point for front-end projects using [webpack](https://webpack.github.io/) as a build tool in the same way you would use Gulp.

**Why build another webpack boilerplate when there are so many out there?**

When I was starting out looking into [webpack](https://webpack.github.io/) I came across several "boilerplates" and tutorials but none of them had the functionality that I wanted that I had with Gulp. So I set out to use [webpack](https://webpack.github.io/) as a build tool and replace Gulp but not forcing me to `require` assets like images, CSS etc.

Features
--------

 * Live reload with [webpack dev server](https://webpack.github.io/docs/webpack-dev-server.html) _(optional)_
 * SASS
 * ES6 transpilation with [Babel](http://babeljs.io)
 * Combine, minify & uglify CSS/JS for production
 * Don't need to `require` CSS in your entry JS file
 * Don't need to `require` assets (images, svgs etc) you just reference them as you would normally `/img/benji.jpg`
 * Autoprefix CSS with [Autoprefixer](https://github.com/postcss/autoprefixer)
 * Environment variables
 * Output one JS and one CSS File
 * Build option to compile out webroot with all assets for deployment
 * Automatically copy over files and folders in `src` folder to `webroot` for deployment

Getting Started
---------------

Clone the repository and install dependencies with `npm`.
```bash
$ git clone https://github.com/kus/webpack-boilerplate.git
$ cd webpack-boilerplate
$ npm install
```

How to use
----------

Work out of the `src/` folder. When you build it will output the compiled files to `webroot/` ready for deployment. It is setup to automatically copy over all files and folders in `src/` if you want to ignore any you need to edit the `webpack.config.js` and add them to the ignore list.

Running
-------

For day-to-day development it will spin up a local server on port `8080` and compile and serve your files. The files will be stored into memory, so you won't actually see them on your disk. It will watch the `src/` directory for changes and automatically recompile when there are changes. It will have "live reload" on by default so when it does detect updates it will refresh the page.

```bash
npm run watch
```

### Options
    --no-reload              Turn off Automatic Refresh and Hot Module Replacement and
                             also remove their dependencies from the javascript output
    --port=1337              Set the port for the dev web server
    --dev/qa/uat/prod        Will set the environment and run specific tasks for
                             different environments

Building
--------

Compiling and saving to disk. Files will be stored in `webroot/` including all assets for deployment. If you build for local (default environment) or dev (`--dev` flag) environments it will create source maps and not minify or uglify the CSS/JS. If you build for QA (`--qa`), UAT (`--uat`) or Production (`--prod`) it will optimize, minify and uglify your CSS and JS and output no source maps. There are options you can set from the CLI to change the default behaviour for each environment.

```bash
npm run build
```

Build and rebuild for any changes. Essentially `watch` and write files to disk.

```bash
npm run build:watch
```

### Options
    --dev/qa/uat/prod        Will set the environment and run specific tasks for
                             different environments
    --no-inject              Don't inject the JS and CSS reference to the file in
                             the HTML
    
    Local/Dev:
    --minify                 Minify JS
    --uglify                 Uglify JS
    --optimize               Optimize chunks
    --no-sourcemaps          Don't create source maps
    
    QA/UAT/Production:
    --no-minify              Don't minify JS
    --no-uglify              Don't uglify JS
    --no-optimize            Don't optimize chunks
    --sourcemaps             Create source maps

Contributing
--------------

Find some improvements for this boilerplate? Help others and make a [Pull request](https://github.com/kus/webpack-boilerplate/pulls) and spread the love!

License
-------

MIT © [Blake Kus](http://kus.io)