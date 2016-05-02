var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var utilities = require('gulp-util');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var htmlSync = browserSync.create("html-server");
var testSync = browserSync.create("test-server");
var del = require('del');
var lib = require('bower-files')({
  "overrides":{
    "bootstrap":{
      "main":[
        "less/bootstrap.less",
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    }
  }
});

var buildProduction = utilities.env.production;

gulp.task("minifyScripts", ["jsBrowserify"], function() {
  return gulp.src("./build/js/app.js")
    .pipe(uglify().on('error', utilities.log))
    .pipe(gulp.dest("./build/js"));
});

gulp.task('concatInterface', function() {
  return gulp.src(['js/*.js'])
    .pipe(concat('allConcat.js'))
    .pipe(gulp.dest('./tmp'));
});

gulp.task('jsBrowserify', ['concatInterface'], function() {
  return browserify({entries: ['./tmp/allConcat.js'] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('jshint', function() {
  return gulp.src(['js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('jsBower', function() {
  return gulp.src(lib.ext('js').files)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('cssBower', function() {
  return gulp.src(lib.ext('css').files)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('cssBuild', function() {
  return gulp.src('scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});

gulp.task("clean", function() {
  return del(['build', 'tmp']);
});

gulp.task('serve', function() {
  htmlSync.init({
    port: 3000,
    ui: {
      port: 3001
    },
    server:{
      baseDir: "./",
      index: "index.html"
    }
  });

  testSync.init({
    port: 4000,
    ui: {
      port: 4001
    },
    server:{
      baseDir: "./",
      index: "./spec/spec-runner.html"
    }
  });

  gulp.watch(['js/*.js', 'spec/*'], ['jsBuild']);
  gulp.watch(['bower.json'], ['bowerBuild']);
  gulp.watch(['*.html'], ['htmlBuild']);
  gulp.watch('scss/*.scss', ['cssBuild']);
});

gulp.task('jsBuild', ['jsBrowserify', 'jshint'], function() {
  htmlSync.reload();
  testSync.reload();
});

gulp.task('bowerBuild', ['bower'], function() {
  htmlSync.reload();
  testSync.reload();
});

gulp.task('htmlBuild', function() {
  htmlSync.reload();
  testSync.reload();
});

gulp.task('bower', ['jsBower', 'cssBower']);

gulp.task('build', ['clean'], function() {
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
  gulp.start('bower');
  gulp.start('cssBuild');
});

gulp.task('serveprod', function() {
  connect.server({
    root: iso-heatMap/js,
    port: process.env.PORT || 5000,
    liveload: false
  });
});