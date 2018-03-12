const gulp = require('gulp');

const fs = require('fs');

const declare = require('gulp-declare');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const minify = require('gulp-minify');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const babel = require('gulp-babel');

const dirs = {
    style_src: './dist/style/',
    style_dest: './dist/style/',
    script_src: './dist/'
};

function scss(dir, file) {
    return gulp.src(dir + file)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer(
            ['last 2 versions', '> 5%', 'Firefox ESR']
        ))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.style_dest));
}

function es6(dir, file) {
    gulp.src(dir + file)
        .pipe(babel())
        .pipe(minify({
            preserveComments: 'some',
            ext: {
                min: '.min.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest(dirs.script_src));
}

gulp.task('es6', function () {
    return es6(dirs.script_src, 'tinyslides.jquery.js');
});

gulp.task('scss', function () {
    return scss(dirs.style_src, 'style.scss');
});

gulp.task('default', ['scss', 'es6'], function () {
    gulp.watch([
        dirs.style_src + '*.scss',
        dirs.style_src + '**/_*.scss'
    ], ['scss']);

    gulp.watch(dirs.script_src + '*.js', ['es6']);
});
