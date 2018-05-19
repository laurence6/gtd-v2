var gulp = require('gulp');

var dest = 'dist';

gulp.task('html', function() {
    var htmlmin = require('gulp-htmlmin');

    return gulp.src('*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(dest));
});

gulp.task('styles', function() {
    var postcss = require('gulp-postcss');
    var autoprefixer = require('autoprefixer');
    var cssnano = require('cssnano');

    return gulp.src('*.css')
        .pipe(postcss([ autoprefixer({ browsers: 'cover 99.5%' }), cssnano() ]))
        .pipe(gulp.dest(dest));
});

gulp.task('scripts', function() {
    var babel = require('gulp-babel');

    return gulp.src([ 'gtd.js', 'sw.js', 'idb.js' ])
        .pipe(babel({
            presets: [ [ 'env', { targets: { browsers: 'cover 99.5%' } } ], 'minify' ],
            minified: true,
            comments: false,
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('scripts-min', function() {
    var babel = require('gulp-babel');
    var rename = require('gulp-rename');

    return gulp.src([ 'vue.min.js' ])
        .pipe(babel({
            minified: true,
            comments: false,
        }))
        .pipe(rename(function(path) {
            path.basename = path.basename.replace('.min', '');
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('default', [ 'html', 'styles', 'scripts', 'scripts-min' ])
