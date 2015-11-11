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

gulp.task('start', ['scripts', 'styles', 'serve']);
gulp.task('start:dev', ['scripts:watch', 'styles:watch', 'serve']);

/**
 * ## Scripts Tasks
 */
gulp.task('scripts', _.partial(scripts, false));
gulp.task('scripts:watch', _.partial(scripts, true));

/**
 * ### Scripts task builder.
 * Prepares browserify or watchify bundle.
 *
 * @param watch - Whether to use watchify
 */
function scripts(watch) {
    watch = watch || false;

    var options = _.assign({}, watchify.args, {
        entries: ['./src/index.js']
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
            .pipe(gulp.dest('./public/build'));
    }

    b.on('update', bundle);
    b.on('log', console.log);

    return bundle();
}

/**
 * ## Styles Tasks
 */
gulp.task('styles', function styles () {
    gulp.src('./src/styles/index.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/build'));
});

gulp.task('styles:watch', function watchStyles () {
    gulp.watch('./src/styles/**/*.scss', ['styles']);
});

/**
 * ## Serve Task
 */
gulp.task('serve', serve({
    root: ['public'],
    hostname: 'localhost',
    port: 3000
}));
