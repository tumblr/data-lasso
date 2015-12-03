'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var watchify = require('watchify');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var serve = require('gulp-serve');
var gulpif = require('gulp-if');
var derequire = require('gulp-derequire');

gulp.task('default', ['start']);

/** Serve Data Lasso locally **/
gulp.task('start', ['scripts', 'styles', 'serve']);
gulp.task('start:dev', ['scripts:watch', 'styles', 'styles:watch', 'serve']);

/** Build scripts and styles that are used in the module **/
gulp.task('build', ['scripts:build', 'styles:build']);

/**
 * ## Hash of possible output destinations
 *
 * - build: What is distributed in the module
 * - public: What is served off a locally running server
 */
var dest = {
    build: './build',
    public: './public/build'
}

/**
 * ## Scripts Tasks
 */
gulp.task('scripts', _.partial(scripts, false, dest.public));
gulp.task('scripts:watch', _.partial(scripts, true, dest.public));
gulp.task('scripts:build', _.partial(scripts, false, dest.build));

/**
 * ### Scripts task builder.
 * Prepares browserify or watchify bundle.
 *
 * @param watch - Whether to use watchify
 * @param dest - Where to build scripts to
 */
function scripts (watch, dest) {
    watch = watch || false;
    dest = dest || paths.build;

    var options = _.assign({}, watchify.args, {
        entries: ['./src/index.js'],
        standalone: 'datalasso'
    });

    if (watch) {
        options.plugin = [watchify];
        options.debug = true;
    }

    var b = browserify(options);
    b.transform('jstify', { engine: 'lodash' })

    var bundle = function () {
        return b.bundle()
            .on('error', console.error.bind(console, 'Browserify Error'))
            .pipe(source('datalasso.js'))
            .pipe(buffer())
            .pipe(gulpif(watch, sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(watch, sourcemaps.write('./')))
            .pipe(derequire())
            .pipe(gulp.dest(dest));
    }

    b.on('update', bundle);
    b.on('log', console.log);

    return bundle();
}

/**
 * ## Styles Tasks
 */
gulp.task('styles', _.partial(styles, dest.public));
gulp.task('styles:build', _.partial(styles, dest.build));
gulp.task('styles:watch', function watchStyles () {
    gulp.watch('./src/styles/**/*.scss', ['styles']);
});

/**
 * ### Styles task builder
 * @param dest - Where to build styles
 */
function styles (dest) {
    dest = dest || paths.build;

    return gulp.src('./src/styles/index.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(dest));
}

/**
 * ## Serve Task
 */
gulp.task('serve', serve({
    root: ['public'],
    hostname: 'localhost',
    port: 3000
}));
