var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    uglify = require('gulp-uglify'),
    size = require('gulp-size'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify');

/*****
 * JSHint task, lints the lib and test *.js files.
 *****/
gulp.task('jshint', function () {
    return gulp.src(['./{src,test}/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/*****
 * Test task, runs mocha against unit test files.
 *****/
gulp.task('test', function () {
    return gulp.src('./test/unit/**/*.test.js', { read: false })
        .pipe(mocha({
            ui: 'bdd',
            reporter: 'spec'
        }));
});

/*****
 * Build task, runs mocha against unit test files.
 *****/
gulp.task('build:dev', function () {
    return browserify({ entries: './src/index.js', standalone: 'snes', debug: true })
        .bundle()
        .pipe(source('snes.js'))
        .pipe(buffer())
        .pipe(size({ title: 'snes.js' }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build:dist', function () {
    return browserify({ entries: './src/index.js', standalone: 'snes' })
        .bundle()
        .pipe(source('snes.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(size({ title: 'snes.min.js' }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['build:dev', 'build:dist']);

/*****
 * Default task, runs jshint and test tasks.
 *****/
gulp.task('default', ['jshint', 'test']);
