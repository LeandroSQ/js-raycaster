/* eslint-env node */
const { src, dest, series, parallel, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const del = require("del");
const htmlMinify = require("gulp-htmlmin");
const sourcemaps = require("gulp-sourcemaps");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const babelify = require("babelify");
const minifyCSS = require("gulp-clean-css");
const cssAutoPrefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");

// Options
const browserSyncOptions = {
	browser: false,
	server: {
		baseDir: "./dist",
		port: 3000
	}
};

const htmlOptions = {
	collapseWhitespace: true,
	removeComments: true,
	removeRedundantAttributes: true
};

const babelOptions = {
	babelrc: true
};

const cssOptions = {

};

// Tasks
function reload() {
	return browserSync.reload({ stream: true });
}

function handleHtml() {
	return src("src/**/*.html")
		.pipe(htmlMinify(htmlOptions))
		.pipe(dest("./dist"))
		.pipe(reload());
}

function watchHtml() {
	return watch("src/**/*.html", handleHtml);
}

function handleJs() {

	return browserify("./src/script/main.js", { debug: true })
		.transform(babelify, babelOptions)
		.bundle()
		.pipe(source("bundle.js"))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write("./"))
		.pipe(dest("./dist/script"))
		.pipe(reload());
}

function watchJs() {
	return watch("src/**/*.js", handleJs);
}

function handleAssets() {
	return src(["./src/image/**.*", "./src/audio/**.*", "./src/font/**.*"], { base: "./src" })
		.pipe(dest("./dist"))
		.pipe(reload());
}

function watchAssets() {
	return watch(["src/image/**.*", "src/audio/**.*", "src/font/**.*"], handleAssets);
}

function handleCSS() {
	return src("./src/style/**.*")
		.pipe(sourcemaps.init())
		.pipe(minifyCSS(cssOptions))
		.pipe(cssAutoPrefixer())
		.pipe(concat("style.min.css"))
		.pipe(sourcemaps.write("./"))
		.pipe(dest("./dist/style"))
		.pipe(reload());
}

function watchCSS() {
	return watch("./src/style/**.*", handleCSS);
}

function clean() {
	return del("dist");
}

function initialize() {
	return browserSync.init(browserSyncOptions);
}

// Export tasks
module.exports.assets = handleAssets;
module.exports.html = handleHtml;
module.exports.js = handleJs;
module.exports.css = handleCSS;
module.exports.clean = clean;
module.exports.default = series(clean, parallel(handleAssets, handleCSS, handleHtml, handleJs));
module.exports.build = module.exports.default;
module.exports.dev = series(module.exports.default, parallel(watchAssets, watchCSS, watchHtml, watchJs, initialize));