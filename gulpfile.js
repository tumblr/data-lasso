'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var watchify = require('watchify');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var serve = require('gulp-serve');
var gulpif = require('gulp-if');
var derequire = require('gulp-derequire');
var sassr = require('sassr');

gulp.task('default', ['start']);

/** Serve Data Lasso locally **/
gulp.task('start', ['scripts', 'serve']);
gulp.task('start:dev', ['scripts:watch', 'styles:watch', 'serve']);

/** Build assets that are distributed with the module **/
gulp.task('build', ['scripts:build']);

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

var bundle;

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
    b.transform('jstify', {engine: 'lodash'});
    b.transform('reactify', {es6: true});
    b.transform(sassr);

    bundle = function () {
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
gulp.task('styles:watch', function watchStyles () {
    gulp.watch('./src/styles/**/*.scss', function () {
        bundle();
    });
});

/**
 * ## Serve Task
 */
gulp.task('serve', serve({
    root: ['public'],
    hostname: 'localhost',
    port: 3000
}));
