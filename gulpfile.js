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
const sass = require("gulp-sass")(require("sass"));
const typescript = require("gulp-typescript");
const tsify = require("tsify");
const concat = require("gulp-concat");

// Options
const browserSyncOptions = {
	browser: false,
	ui: false,
	host: "0.0.0.0",
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
	babelrc: true,
	extensions: [".ts"]
};

const cssOptions = {
	outputStyle: "compressed",
	sourceComments: false,
	sourceMap: false
};

const tsOptions = typescript.createProject("tsconfig.json", { noResolve: true });

// Tasks
function reload() {
	return browserSync.reload({ stream: true });
}

function handleHTML() {
	return src("src/views/*.html")
		.pipe(htmlMinify(htmlOptions))
		.pipe(dest("./dist"))
		.pipe(reload());
}

function watchHTML() {
	return watch("src/views/*.html", handleHTML);
}

function handleTS() {
	return browserify("./src/scripts/main.ts", { debug: false })
		.plugin(tsify)
		.transform(babelify, babelOptions)
		.bundle()
		.on("error", function (e) {
			console.error(e);
			this.emit("end");
		})
		.pipe(source("bundle.js"))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write("./"))
		.pipe(dest("./dist"))
		.pipe(reload());
}

function watchTS() {
	return watch("src/**/*.ts", handleTS);
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
	return src("./src/styles/**.scss")
		.pipe(sourcemaps.init())
		.pipe(sass(cssOptions).on("error", sass.logError))
		.pipe(concat("style.css"))
		.pipe(sourcemaps.write("./"))
		.pipe(dest("./dist"))
		.pipe(reload());
}

function watchCSS() {
	return watch("./src/styles/**.scss", handleCSS);
}

function clean() {
	return del("dist");
}

function initialize() {
	return browserSync.init(browserSyncOptions);
}

// Export tasks
module.exports.assets = handleAssets;
module.exports.html = handleHTML;
module.exports.ts = handleTS;
module.exports.css = handleCSS;
module.exports.clean = clean;
module.exports.default = series(clean, parallel(handleAssets, handleCSS, handleHTML, handleTS));
module.exports.build = module.exports.default;
module.exports.dev = series(module.exports.default, parallel(watchAssets, watchCSS, watchHTML, watchTS, initialize));