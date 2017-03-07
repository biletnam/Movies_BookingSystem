var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var reload      = browserSync.reload;

gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: "./"
    });

    gulp.watch("assets/*.scss", ['sass']);
    gulp.watch("*.html").on('change', reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("assets/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("dest/"))
        .pipe(reload({stream: true}));
});

gulp.task('default', ['serve']);
