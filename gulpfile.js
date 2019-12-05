"use strict";

// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const child = require("child_process");
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const include = require("gulp-include");
const logger = require("gulp-logger");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const siteRoot = '_deploy';

const src = {
  scss: "./app/_assets/stylesheets/**/*.scss",
  cssDest: "_deploy/stylesheets/",
  js: "./app/_assets/javascripts/mn_application.js",
  jsDest: "./_deploy/javascripts/"
}

// BrowserSync Reload
function browserSyncReload() {
  browsersync.reload();
  // done();
}

// Clean assets
function clean() {
  return del([
    siteRoot + "/images/",
    siteRoot + '/javascripts/',
    siteRoot + '/stylesheets/'
  ]);
}

function jekyllBuild() {
  return child.spawn('jekyll', ['build']);
};

function jekyllWatch() {
  return child.spawn('jekyll', [
    'serve',
    '--watch',
    '--incremental',
    '--drafts'
  ]);
};

// Optimize Images - only used during build
function images() {
  return gulp
    .src("./app/_assets/images/**/*")
    .pipe(newer(siteRoot + "/images"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(siteRoot + "/images/"));
}

// Copy Images - used for watch task so it doesn't take forever
function imagesCopy() {
  return gulp
    .src("./app/_assets/images/**/*")
    .pipe(gulp.dest(siteRoot + "/images/"));
}

// CSS task
function scss() {
  return gulp
    .src(src.scss)
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      onError: serve.notify
    }))
    .pipe(rename({ basename: "application" }))
    .pipe(gulp.dest(src.cssDest))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(plumber.stop())
    .pipe(gulp.dest(src.cssDest))
    .pipe(browsersync.stream())
}

// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(src.js)
      .pipe(plumber())
      // don't use webpack now
      // .pipe(webpackstream(webpackconfig, webpack))
      .pipe(include())
        .on('error', console.log)
      .pipe(rename({ basename: "application" }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(src.jsDest))
      .pipe(browsersync.stream())
  );
}

// BrowserSync
function serve() {
  browsersync.init({
    files: [siteRoot + '/**'],
    port: 4000,
    logLevel: "debug",
    notify: true,
    server: {
      baseDir: siteRoot
    }
  });
  gulp.watch('./app/_assets/javascripts/**/*.js', scripts);
  gulp.watch('./app/_assets/stylesheets/**/*.scss', scss);
  gulp.watch('./app/_assets/images/**/*', imagesCopy);
  gulp.watch(["./app/**/*.html"]).on('change', browserSyncReload);
  // gulp.watch(["./app/**/*.md"]).on('change', browserSyncReload);
}


// define complex tasks
// const js = gulp.series(scripts);
// const build = gulp.series(clean, gulp.parallel(jekyllBuild, scripts, scss, images));
const build = gulp.series(clean, gulp.parallel(jekyllBuild, scss));
const html = gulp.parallel(jekyllBuild);
const watch = gulp.parallel(jekyllWatch, scss, serve);

// export tasks
exports.images = images;
exports.scss = scss;
// exports.js = js;
exports.jekyllBuild = jekyllBuild;
exports.jekyllWatch = jekyllWatch;
exports.clean = clean;
exports.build = build;
exports.html = html;
exports.watch = watch;
exports.default = watch;
