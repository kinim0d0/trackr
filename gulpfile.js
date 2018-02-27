var gulp = require("gulp");
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var es6transpiler = require('gulp-es6-transpiler');
var nodemon = require('gulp-nodemon');

gulp.task('styles', function () {
	return gulp.src(['assets/scss/*.scss', 'assets/scss/*/*.scss'])
		.pipe(sass().on('error', sass.logError))
		.pipe(concat("main.min.css"))
		.pipe(gulp.dest('assets/public/css'));
});

gulp.task('scripts', function () {
	return gulp.src(['assets/js/*.js', 'assets/js/*/*.js'])
		.pipe(concat("main.min.js"))
		.pipe(es6transpiler({
			"globals": {
				"$": true
			}
		}))
		.pipe(gulp.dest('assets/public/js'));
});

gulp.task('default', ['styles', 'scripts', 'external-scripts', 'external-styles', 'watch'], function() {
	var options = {
		script: 'app.js',
		delayTime: 1
	}
	return nodemon(options)
		.on("restart", function(err) {
			console.log("Restarting Server");
		})
})

gulp.task('external-scripts', function () {
	return gulp.src([
		'bower_components/jquery/dist/jquery.min.js',
		'bower_components/jquery-ui/jquery-ui.js',
		'bower_components/bootstrap/dist/js/bootstrap.min.js',
		'bower_components/bootstrap-datetimepicker.js',
		'bower_components/caret/jquery.caret.js',
		'bower_components/simplePagination.js/jquery.simplePagination.js',
		'bower_components/socket.io-1.2.0.js',
	])
	.pipe(concat("externals.min.js"))
	.pipe(gulp.dest('assets/public/js'));
});

gulp.task('external-styles', function () {
	return gulp.src([
		'bower_components/bootstrap/dist/css/bootstrap.min.css',
		'bower_components/jquery-tag-editor/jquery.tag-editor.css',
		'bower_components/simplePagination.js/simplePagination.css',
	])
	.pipe(concat("externals.min.css"))
	.pipe(gulp.dest('assets/public/css'));
});

gulp.task('watch', function() {
    gulp.watch(['assets/scss/*.scss', 'assets/scss/*/*.scss'], ['styles']);
    gulp.watch(['assets/js/*/*.js', 'assets/js/*.js'], ['scripts']);
});