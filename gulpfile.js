var browserify = require('browserify');
var gulp = require('gulp');
var babelify = require("babelify");
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');
var uglify     = require('gulp-uglify');
var rename     = require('gulp-rename');

gulp.task('compile', function () {
    return gulp.src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/'))
});

gulp.task('browserify', function () {
    var stream = browserify({
        builtins: ['_process', 'buffer'],
        entries: 'src/scorocode.js',
        standalone: 'Scorocode'
    })
        .ignore('_process')
        .transform("babelify", {presets: ["es2015"]})
        .bundle();

    return stream.pipe(source('scorocode.js'))
        .pipe(gulp.dest('./lib/browser/'));
});

gulp.task('minify', function() {
    return gulp.src('lib/browser/scorocode.js')
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('lib/browser/'))
});

gulp.task('default', ['compile', 'browserify', 'minify']);