var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var ejs = require('gulp-ejs');

var browserSync = require('browser-sync').create();

// var reload = browserSync.reload;

gulp.task('sass', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sass({
    outputStyle: 'expanded',
    includePaths: ['.'],
    indentType: 'tab',
    indentWidth: '1'
  }).on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['> 5%', 'IE 8', 'ios 8', 'android 4.2'],
    cascade: false
  }))
  .pipe(sourcemaps.write('./src/maps'))
    .pipe(gulp.dest('./htdocs/assets/css'))
});

gulp.task("ejs", function() {
	gulp.src(["./src/ejs/**/*.ejs", '!' + "./src/ejs/**/_*.ejs", "./src/ejs/**/**/*.ejs"])
	   .pipe(ejs({}, {}, {"ext": ".html"}))
	   .pipe(gulp.dest("./htdocs"))

});


gulp.task('serve', ['sass', 'ejs'], function () {

  browserSync.init({
    server: './htdocs',
	port: 5000
  });

  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('./src/ejs/**/*.ejs', ['ejs']);
  gulp.watch('./src/ejs/**/**/*.ejs', ['ejs']);
  gulp.watch('./htdocs/**/*.html').on('change', browserSync.reload);

});

gulp.task('default', ['serve']);