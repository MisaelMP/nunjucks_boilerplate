'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
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

// function scripts() {
// 	return gulp.src([
// 			'./js/**/*.js'
// 		], {
// 			allowEmpty: true
// 		})
// 		.pipe(concat({
// 			path: 'main.js'
// 		}))
// 		.pipe(gulp.dest(siteOutput + '/js'))
// 		.pipe(rename({
// 			extname: '.min.js'
// 		}))
// 		.pipe(babel({
// 			presets: ['@babel/preset-env']
// 		}))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}))
// 		.pipe(gulp.dest(siteOutput + '/js'));
// };

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
// bundle
// -----------------------------------------------------------------------------

function bundle() {
	return browserify('./js/main.js')
		.transform(babelify, {
			presets: ['@babel/preset-env']
		})
		.bundle()
		//Pass desired output filename to vinyl-source-stream
		.pipe(source('main.bundle.js'))
		.pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
		.pipe(uglify())
		// Start piping stream to tasks!
		.pipe(gulp.dest(siteOutput + '/js'));
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

	gulp.watch('./js/*', gulp.series(bundle)).on('change', browserSync.reload);

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
// exports.scripts = scripts;
exports.nunjucks = nunjucks;
exports.img = img;

// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

exports.default = gulp.parallel(scss, nunjucks, img,bundle, watch, browserReload);
