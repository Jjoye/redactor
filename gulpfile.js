var argv = require('yargs').argv;
var gulp = require('gulp');
var remoteSrc = require('gulp-remote-src');
var request = require('request').defaults({jar: true});
var prompt = require('prompt');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var runSequence = require('run-sequence');
var fs = require('fs');


var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'uglify-save-license']
});

gulp.task('optimize', function() {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

   gulp.src('src/**')
    .pipe(jsFilter)
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(gulp.dest('dist/'));
});

gulp.task('downloadLangs', function() {

  var langs = ["sq", "ar", "es_ar", "az", "by", "ba", "pt_br", "bg", "ca", "zh_cn", "zh_tw", "hr", "cs", "da", "nl", "eo", "fi", "fr", "ge", "de", "el", "hu", "he", "id", "it", "ja", "ko", "lv", "lt", "mk", "no_NB", "fa", "pl", "pt_pt", "ro", "ru", "sr-cir", "sr-lat", "sk", "sl", "es", "sv", "th", "tr", "ua", "vi"];

  remoteSrc(langs, {
    base: 'http://imperavi.com/webdownload/redactor/lang/?lang=',
  })
  .pipe($.rename(function (path) {
    path.dirname += "/langs";
    path.basename = path.basename.substring(6);
    path.extname = ".js";
  }))
  .pipe(gulp.dest('./src/langs'));

});

gulp.task('downloadPlugins', function() {

  var plugins = ['table', 'video', 'fullscreen', 'imagemanager', 'filemanager', 'clips', 'definedlinks', 'fontsize', 'fontfamily', 'fontcolor', 'textdirection', 'limiter', 'counter', 'textexpander'];
  var filter = $.filter(['**', '!__MACOSX', '!__MACOSX/**']);
  var jsFilter = $.filter('**/*.js');

  remoteSrc(plugins, {
    base: 'http://imperavi.com/webdownload/redactor/plugin/?plugin=',
  })
  .pipe($.decompress({ strip: 0, mode: '755'}))
  .pipe(filter)
  .pipe(gulp.dest('./src/plugins'));

});

gulp.task('updateBowerJson', function(cb) {
  var jsonfile = require('jsonfile');

  var fs = require('fs');

  function get_line(filename, line_no, callback) {
    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.split("\n");

    if(+line_no > lines.length){
      throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);
  }

  var regexp = /(\d+)\.(\d+)\.(\d+)/;
  var file = 'bower.json';

  get_line('./src/redactor.js', 1, function(err, line){
    var version = regexp.exec(line)[0];
    jsonfile.readFile(file, function(err, obj) {
      obj.version = version;
      jsonfile.writeFile(file, obj, {spaces: 4}, function (err) {
        cb();
      });
    });
  });

});

// define tasks here
gulp.task('default', function(callback) {
  runSequence(
    'optimize',
    'updateBowerJson',
  callback);
  // run tasks here
  // set up watch handlers here
});
