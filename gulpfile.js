'use strict';

let gulp, sass;
try {
  gulp = require('gulp');
  sass = require('gulp-sass');
} catch (e) {
  console.log('gulp failed because a require call failed with the error:');
  console.log(e.message);
  console.log('it is likely that running `npm install` will fix it.');
  process.exit(1);
}

gulp.task('sass', function() {
  return gulp.src('./scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./css'));
});

gulp.task('watch', ['sass'], function() {
  gulp.watch('./scss/*.scss', ['sass']);
});

gulp.task('all', ['sass']);

gulp.task('default', ['all']);
