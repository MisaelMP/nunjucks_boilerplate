'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sassdoc = require('sassdoc');
const browserSync = require('browser-sync').create();
const nunjucksRender = require('gulp-nunjucks-render');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const siteOutput = './dist';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const input = './scss/*.scss';
const inputMain = './scss/main.scss';
const output = siteOutput + '/css';
const inputTemplates = './pages/*.njk';
const sassOptions = {
	outputStyle: 'expanded'
};
const autoprefixerOptions = {
	browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};
const sassdocOptions = {
	dest: siteOutput + '/sassdoc'
};

// -----------------------------------------------------------------------------
// Scss compilation
// -----------------------------------------------------------------------------

function scss() {
	return gulp
		.src(inputMain)
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(autoprefixer(autoprefixerOptions))
		.pipe(gulp.dest(output))
		.pipe(browserSync.stream());
};

// -----------------------------------------------------------------------------
// Javascript
// -----------------------------------------------------------------------------

function scripts() {
	return gulp.src([
			'./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
			'js/main.js'
		], {
			allowEmpty: true
		})
		.pipe(concat({
			path: 'main.js'
		}))
		.pipe(browserSync.reload({
			stream: true
		}))
		.pipe(gulp.dest(siteOutput + '/js'));
};

// -----------------------------------------------------------------------------
// Templating
// -----------------------------------------------------------------------------

function nunjucks() {
	nunjucksRender.nunjucks.configure(['./templates/']);
	// Gets .html and .nunjucks files in pages
	return gulp.src(inputTemplates)
		// Renders template with nunjucks
		.pipe(nunjucksRender())
		// output files in dist folder
		.pipe(gulp.dest(siteOutput))
};

// -----------------------------------------------------------------------------
// Imagemin
// -----------------------------------------------------------------------------

function img() {
	return gulp.src('./img/**/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(siteOutput + '/img'));
};

// -----------------------------------------------------------------------------
// Fonts
// -----------------------------------------------------------------------------

// ('fonts', function() {
//   return gulp.src(['./fonts/*'])
//   .pipe(gulp.dest(siteOutput + '/fonts/'));
// });


// -----------------------------------------------------------------------------
// Sass documentation generation
// -----------------------------------------------------------------------------

function scssdoc() {
	return gulp
		.src(input)
		.pipe(sassdoc(sassdocOptions))
		.resume();
};

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

function watch() {
	// Watch the sass input folder for change,
	// and run `sass` task when something happens
	gulp.watch(input, gulp.series(scss)).on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});

	gulp.watch('./js/*', gulp.series(scripts)).on('change', browserSync.reload);

	//Watch nunjuck templates and reload browser if change
	gulp.watch(inputTemplates, gulp.series(nunjucks)).on('change', browserSync.reload);

};

// -----------------------------------------------------------------------------
// Static server
// -----------------------------------------------------------------------------

function browserReload() {
	browserSync.init({
		server: {
			baseDir: siteOutput
		}
	});
};

// -----------------------------------------------------------------------------
// Register tasks
// -----------------------------------------------------------------------------

exports.watch = watch;
exports.broserReload = browserReload;
exports.scss = scss;
exports.scssdoc = scssdoc;
exports.scripts = scripts;
exports.nunjucks = nunjucks;
exports.img = img;

// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

exports.default = gulp.parallel(scss, nunjucks, img, scripts, watch, browserReload);
