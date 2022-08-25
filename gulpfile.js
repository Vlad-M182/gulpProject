const projectFolder = require('path').basename(__dirname);
const sourceFolder = '#src';

const path = {
	build: {
		html: projectFolder + '/',
		css: projectFolder + '/css/',
		js: projectFolder + '/js/',
		img: projectFolder + '/images/',
		fonts: projectFolder + '/fonts/',
		video: projectFolder + '/video/',
		audio: projectFolder + '/audio/',
	},
	src: {
		html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
		scss: sourceFolder + '/scss/style.scss',
		ts: sourceFolder + '/ts/script.ts',
		img: sourceFolder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
		video: sourceFolder + '/video/**/*.{mp4,webm,ogg}',
		audio: sourceFolder + '/audio/**/*.{mp3,ogg}',
		fonts: sourceFolder + '/fonts/*.ttf',
	},
	temp: {
		html: sourceFolder + '/#temp/',
		css: sourceFolder + '/#temp/css/',
		js: sourceFolder + '/#temp/js/',
		img: sourceFolder + '/#temp/images/',
		video: sourceFolder + '/#temp/video/',
		audio: sourceFolder + '/#temp/audio/',
		fonts: sourceFolder + '/#temp/fonts/',
	},
	watch: {
		html: sourceFolder + '/*.html',
		scss: sourceFolder + '/scss/**/*.scss',
		ts: sourceFolder + '/ts/**/*.ts',
		img: sourceFolder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
		video: sourceFolder + '/video/**/*.{mp4,webm,ogg}',
		audio: sourceFolder + '/audio/**/*.{mp3,ogg}',
	},
	clean: './' + sourceFolder + '/#temp',
};

//підключаєм gulp і його функції
const { src, dest, watch, parallel, series } = require('gulp'),
	gulp = require('gulp'),
	//перезагрузка браузера
	browsersync = require('browser-sync').create(),
	//перейменування файлів
	rename = require('gulp-rename'),
	//вставити один файл в інший
	fileinclude = require('gulp-file-include'),
	//препроцесор sass
	scss = require('gulp-sass')(require('sass')),
	//автопрефіксер для css
	autoprefixer = require('gulp-autoprefixer'),
	//мініфікація css
	clean_css = require('gulp-clean-css'),
	//згрупувати всі @media
	group_media = require('gulp-group-css-media-queries'),
	//ковертувати картинки у webp
	webp = require('gulp-webp'),
	//зжати всі картинки
	imagemin = require('gulp-imagemin'),
	//створити файл з svg sprite
	svgSprites = require('gulp-svg-sprite'),
	//видалити файли або папки
	del = require('del'),
	//конвертувати ttf у woff
	ttf2woff = require('gulp-ttf2woff'),
	//конвертувати ttf у woff2
	ttf2woff2 = require('gulp-ttf2woff2'),
	// створити карти для скриптів
	sourcemaps = require('gulp-sourcemaps'),
	// бандлер для js
	rollup = require('gulp-better-rollup'),
	// плагін для мініфікування js
	{ terser } = require('rollup-plugin-terser'),
	// плагін для конвертування ts y js
	rollupTypescript = require('@rollup/plugin-typescript');

/* <Working part> */
function browserSync() {
	browsersync.init({
		server: {
			baseDir: './' + sourceFolder + '/#temp',
		},
		port: 3000,
		notify: true,
	});
}

function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.temp.html))
		.pipe(browsersync.stream());
}

function css() {
	return src(path.src.scss)
		.pipe(
			scss({
				outputStyle: 'expanded',
			})
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: true,
			})
		)
		.pipe(dest(path.temp.css))
		.pipe(browsersync.stream());
}

function script() {
	return src(path.src.ts)
		.pipe(sourcemaps.init())
		.pipe(
			rollup(
				{
					plugins: [rollupTypescript()],
				},
				{
					file: 'script.js',
					format: 'es',
				}
			)
		)
		.pipe(sourcemaps.write())
		.pipe(dest(path.temp.js))
		.pipe(browsersync.stream());
}

function images() {
	return src(path.src.img).pipe(dest(path.temp.img));
}

function video_audio() {
	return src(path.src.video)
		.pipe(dest(path.temp.video))
		.pipe(src(path.src.audio))
		.pipe(dest(path.temp.audio))
		.pipe(browsersync.stream());
}

function fonts() {
	return src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.temp.fonts))
		.pipe(src(path.src.fonts))
		.pipe(ttf2woff2())
		.pipe(dest(path.temp.fonts));
}

gulp.task('svgSprites', () => {
	return src('#src/images/**/*.svg')
		.pipe(
			svgSprites({
				mode: {
					stack: {
						sprite: '../icons/icons.svg',
					},
				},
				shape: {
					id: {
						generator: function (name) {
							return name.slice(
								name.lastIndexOf('\u005C') + 1,
								name.indexOf('.')
							);
						},
					},
				},
			})
		)
		.pipe(dest(sourceFolder + '/images'));
});

function watchFiles() {
	watch([path.watch.html], html);
	watch([path.watch.scss], css);
	watch([path.watch.ts], script);
	watch([path.watch.img], images);
	watch([path.watch.video, path.watch.audio], video_audio);
}

function clean() {
	return del(path.clean);
}

/* ============ </Working part> */

/* <Building project part> */

function htmlBuild() {
	return src(path.src.html).pipe(fileinclude()).pipe(dest(path.build.html));
}

function cssBuild() {
	return src(path.src.scss)
		.pipe(
			scss({
				outputStyle: 'expanded',
			})
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: true,
			})
		)
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(
			rename({
				extname: '.min.css',
			})
		)
		.pipe(dest(path.build.css));
}

function jsBuild() {
	return src(path.src.ts)
		.pipe(sourcemaps.init())
		.pipe(
			rollup(
				{
					plugins: [rollupTypescript()],
				},
				[
					{
						file: 'script.js',
						format: 'es',
					},
					{
						file: 'script.min.js',
						format: 'es',
						plugins: [terser()],
					},
				]
			)
		)
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.js));
}

function imgBuild() {
	returnsrc(sourceFolder + '/images/**/*.{jpg,png,webp}')
		.pipe(
			webp({
				quality: 70,
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(sourceFolder + '/images/**/*.{svg,gif,ico}'))
		.pipe(dest(path.build.img))
		.pipe(src(sourceFolder + '/images/**/*.{jpg,png,svg,gif}'))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3,
			})
		)
		.pipe(dest(path.build.img));
}

function video_audioBuild() {
	return src(path.src.video + '/*')
		.pipe(dest(path.build.video))
		.pipe(src(path.src.audio + '/*'))
		.pipe(dest(path.build.audio));
}

function fontsBuild() {
	return src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts))
		.pipe(src(path.src.fonts))
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
}

/* ============ </Building project part> */

let buildProject = series(
	clean,
	htmlBuild,
	cssBuild,
	jsBuild,
	imgBuild,
	video_audioBuild,
	fontsBuild
);
let work = series(
	clean,
	parallel(script, css, html, images, video_audio, fonts)
);
let watching = parallel(work, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.script = script;
exports.images = images;
exports.video_audio = video_audio;
exports.fonts = fonts;
exports.work = work;
exports.buildProject = buildProject;
exports.watching = watching;
exports.default = watching;
