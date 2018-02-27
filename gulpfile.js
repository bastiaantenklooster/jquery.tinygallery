const gulp = require('gulp');

const fs = require('fs');

const declare = require('gulp-declare');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const dirs = {
    style_src: 'dist/style/',
    style_dest: 'dist/style/',
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


gulp.task('scss', function () {
    return scss(dirs.style_src, 'style.scss');
});

gulp.task('default', ['scss'], function () {
    gulp.watch([
        dirs.style_src + '*.scss',
        dirs.style_src + '**/_*.scss'
    ], ['scss']);
});
