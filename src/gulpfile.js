const gulp = require('gulp')
// const { exec } = require('child_process')
const header = require('gulp-header')
// const iconfont = require('gulp-iconfont')
const less = require('gulp-less')
// const cleanCSS = require('gulp-clean-css')
// const uglify = require('gulp-uglify')
// const concat = require('gulp-concat')
const rename = require('gulp-rename')
// const babel = require('gulp-babel')
const compiler = require('webpack');
const webpack = require('webpack-stream')
// const replace = require('gulp-replace')
// const replace = require('gulp-string-replace')
const refresh = require('gulp-refresh')
const plumber = require('gulp-plumber');
// const fail = require('gulp-fail');
// const gulpIf = require('gulp-if');
const del = require('del')
const comments = {
	
}

let tasks = {
	// clean(cb){
		// return del([
			// '../css/main.css',
			// '../js/main.js',
		// ]);
	// },
	
	less(cb){
		return gulp
			.src(['src/less/*.less'])
			.pipe(plumber())
			.pipe(less())
			.pipe(gulp.dest('../css/'))
			.pipe(refresh())
	},
	
	build(cb){
		return gulp.src(['src/**/*.js', '!src/**/_ignore/**/*'])
			.pipe(plumber())
			// .pipe(babel())
			.pipe(webpack({
				mode: 'development',
				experiments: {
					asset: true,
					// topLevelAwait: true
				},
				output: {
					filename: 'main.js',
				},
				
				module: {
					rules: [
						{
							type: 'asset/source',
							test: /.+\.weight/,
						},
					],
				},
			}, compiler))
			.pipe(header(`document.write('<script async src=\\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1\\"></' + 'script>'); `))
			.pipe(gulp.dest('../js/'))
			.pipe(refresh())
			// .pipe(uglify({
				// warnings: false,
				// sourceMap: false
			// }))
			// .pipe(rename({ suffix: '.min' }))
			// .pipe(gulp.dest('dist/'))
	},
	
	refresh(cb){
		return gulp.src('../index.html')
			.pipe(refresh())
	},

	watch(cb){
		refresh.listen();
		
		gulp.watch(['src/**/*.js', '!src/**/_ignore/**/*'], tasks.build);
		gulp.watch(['src/less/**/*.less'], tasks.less);
		gulp.watch(['../index.html'], tasks.refresh);
	}
}

exports.default	= gulp.series(tasks.build, tasks.less);

// exports.clean		= tasks.clean;
exports.build		= tasks.build;
exports.less		= tasks.less;
exports.watch	= tasks.watch;
