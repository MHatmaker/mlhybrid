var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var jade = require('gulp-jade');
var clean = require('gulp-rimraf');

var paths = {
  sass: ['./scss/**/*.scss'],
  jadeIndex: ['./www/views/*.jade'],
  jadePartials: ['./www/views/partials/*.jade'],
  jadeTemplates: ['./www/views/templates/*.jade']
};

handleError = function(err) {
  console.log("handleError function called")
  console.log(err.toString());
  this.emit('end');
};

gulp.task('clean', [], function() {
  console.log("Clean all files in www/js folder");

  return gulp.src("www/js/*", { read: false }).pipe(clean());
});

gulp.task('default', ['jadeNdx', 'jadeTmplt', 'jadePrt', 'jscopy', 'csscopy', 'sass']);

gulp.task('jadeNdx', function (done) {
    var YOUR_LOCALS;
    YOUR_LOCALS = {};
    console.log("Grab Jade Index file from ");
    console.log(paths.jadeIndex);
    gulp.src(paths.jadeIndex).pipe(jade ({
        locals: YOUR_LOCALS
    }).on('error', handleError)).pipe(gulp.dest('www')).on('end', done);
});

gulp.task('jadeTmplt', function (done) {
    var YOUR_LOCALS;
    YOUR_LOCALS = {};
    console.log("Grab Jade Template files from ");
    console.log(paths.jadeTemplates);
    gulp.src(paths.jadeTemplates).pipe(jade ({
        locals: YOUR_LOCALS
    }).on('error', handleError)).pipe(gulp.dest('www/templates')).on('end', done);
});

gulp.task('jadePrt', function (done) {
    var YOUR_LOCALS;
    YOUR_LOCALS = {};
    console.log("Grab Jade Template files from ");
    console.log(paths.jadePartials);
    gulp.src(paths.jadeTemplates).pipe(jade ({
        locals: YOUR_LOCALS
    }).on('error', handleError)).pipe(gulp.dest('www/partials')).on('end', done);
});

gulp.task('jscopy', function () {
    return gulp.src(['./**/*'], {
        base: 'www/public/javascripts'
    }).pipe(gulp.dest('www/js'));
});

gulp.task('csscopy', function () {
    return gulp.src(['www/public/stylesheets/**/*'], {
        base: 'www/public/stylesheets'
    }).pipe(gulp.dest('www/css'));
});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.jade, ['jadeNdx', 'jadeTmplt', 'jadePrt', 'jscopy', 'csscopy', 'sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
