var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-cssnano');
var rename = require('gulp-rename');
var sh = require('shelljs');
// var jade = require('ionic-gulp-jade');
var jade = require('gulp-jade');
var clean = require('gulp-rimraf');
var watch = require('gulp-watch');
var prettify = require('gulp-html-prettify');

var paths = {
  jadeIndex: ['./views/*.jade'],
  jadePartials: ['./views/partials/*.jade'],
  jadeTemplates: ['./views/templates/*.jade'],
  routes: ['.routes/*.js'],
  scripts: ['./public/javascripts/**/*.js'],
  // styles: ['./public/stylesheets/*.css', '!./public/*'],
  styles: ['./public/stylesheets/*.css'],
  images: ['./public/stylesheets/images/*.png',
    './public/stylesheets/images/*.jpg',
    './public/stylesheets/images/*.gif', '!./public/*']
};

handleError = function(err) {
  console.log("handleError function called")
  console.log(err.toString());
  this.emit('end');
};

gulp.task('serve:before', ['default']);

gulp.task('clean', [], function() {
  console.log("Clean all files in www/js folder");

  return gulp.src("www/js/*", { read: false }).pipe(clean());
});

gulp.task('default', ['jadendx', 'jadetmplt', 'jadeptn', 'jscopy', 'nodejscopy', 'csscopy', 'imgcopy', 'watch']);

// gulp.task('jadendxionic', jadeBuild);
//
// gulp.task('jadendxionic', function(){
//     console.log("return jadeBuild");
//     return jadeBuild({
//         src: paths.jadeIndex,
//         dest: 'www'
//     });
// });

gulp.task('jadendx', function (done) {
    var YOUR_LOCALS;
    YOUR_LOCALS = {};
    console.log("Grab changed Jade Index/Layout files from ");
    console.log(paths.jadeIndex);
    //return
        gulp.src(paths.jadeIndex)
            .pipe(jade({pretty: true}))
            .pipe(gulp.dest('./www')).on('end', done);
});

gulp.task('jadetmplt', function (done) {
    var YOUR_LOCALS;
    YOUR_LOCALS = {};
    console.log("Grab Jade Template files from ");
    console.log(paths.jadeTemplates);
    gulp.src(paths.jadeTemplates).pipe(jade ({
        pretty : true
        // cwd: './',
        // locals: YOUR_LOCALS
    }).on('error', handleError)).pipe(gulp.dest('./www/templates')).on('end', done);
});

gulp.task('jadeptn', function (done) {
    var YOUR_LOCALS;
    YOUR_LOCALS = {};
    console.log("Grab Jade Partial files from ");
    console.log(paths.jadePartials);
    gulp.src(paths.jadePartials).pipe(jade ({
        pretty : true,
        cwd: './',
        locals: YOUR_LOCALS
    }).on('error', handleError)).pipe(gulp.dest('www/partials')).on('end', done);
});

gulp.task('jscopy', function () {
    console.log("task jscopy");
    gulp.src(paths.scripts, {
        // cwd: './'
    }).on('error', handleError).pipe(gulp.dest('www/js'));
});

gulp.task('nodejscopy', function () {
    return gulp.src(paths.routes, {
        cwd: './'
    }).on('error', handleError).pipe(gulp.dest('www/'));
});

gulp.task('csscopy', function (done) {
    console.log('task csscopy from');
    console.log(paths.styles);
    gulp.src(paths.styles, {
        // cwd: './'
    }).on('error', handleError).pipe(gulp.dest('./www/css')).on('end', done);
});

gulp.task('imgcopy', function () {
    gulp.src(paths.images, {
        cwd: './'
    }).on('error', handleError).pipe(gulp.dest('www/css/images'));
});


gulp.task('watch', function () {
    // gulp.watch(paths.jade, ['jadendx', 'jadetmplt', 'jadeptn']);
    gulp.watch(paths.jadeIndex, ['jadendx']);
    gulp.watch(paths.jadeTemplates, ['jadetmplt']);
    gulp.watch(paths.jadePartials, ['jadeptn']);
    gulp.watch(paths.scripts, ['jscopy']);
    gulp.watch(paths.scripts, ['nodejscopy']);
    gulp.watch(paths.styles, ['csscopy']);
    gulp.watch(paths.images, ['imgcopy']);
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
