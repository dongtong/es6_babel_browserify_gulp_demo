'use strict';

var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var path = require('path');
var glob = require('glob');
var del = require('del');
var connect = require('gulp-connect');
var open = require('gulp-open');
var uglify = require('gulp-uglify');


function getIPAdress(){
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces){
          var iface = interfaces[devName];
          for(var i=0;i<iface.length;i++){
               var alias = iface[i];
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                     return alias.address;
               }
          }
    }
}

var config = {
    port: 8000,
    devBaseUrl: 'http://' + getIPAdress(),
    paths: {
        html: './src/*.html',
        dist: './dist'
    }
};

//启动connect服务
gulp.task('connect', function() {
    connect.server({
        root: [__dirname],
        port: config.port,
        base: config.devBaseUrl,
        livereload: true
    });
});

//打开浏览器
gulp.task('open', function() {
     gulp.src('./dist/index.html')
         .pipe(open({app: 'chrome', uri: config.devBaseUrl + ':' + config.port + '/dist/index.html' }));
});

function buildLibs() {
    gulp.src('src/javascripts/libs/*.js')
        .pipe(gulp.dest('./dist/javascripts'))
        .pipe(connect.reload());
}

//构建业务
gulp.task('build', function() {
    browserify({
        entries: './src/javascripts/app.js'
    })
    .transform(babelify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/javascripts'));

    buildLibs();
});

//拷贝HTML
gulp.task('html', function() {
    gulp.src('src/*.html')
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

//拷贝CSS
gulp.task('css', function() {
    gulp.src('src/stylesheets/**')
        .pipe(gulp.dest('./dist/stylesheets'))
        .pipe(connect.reload());
});

//拷贝Image
gulp.task('image', function() {
    gulp.src('src/images/**')
        .pipe(gulp.dest('./dist/images'))
        .pipe(connect.reload());
});

//拷贝静态文件到发布目录
gulp.task('copy', function () {
    gulp.src('src/*.html')
        .pipe(gulp.dest('./dist'));

    gulp.src('src/stylesheets/**')
        .pipe(gulp.dest('./dist/stylesheets'));

    gulp.src('src/images/**')
        .pipe(gulp.dest('./dist/images'));
});

gulp.task('compress', function() {
  return gulp.src('dist/javascripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));//TODO
});

//观察文件变化
gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['build', 'compress']);
    gulp.watch('src/**/*.css', ['css']);
    gulp.watch('src/**/*.png', ['image']);
    gulp.watch('src/*.html', ['html']);
});


gulp.task('default',  ['copy', 'build', 'compress', 'connect','watch', 'open']);
