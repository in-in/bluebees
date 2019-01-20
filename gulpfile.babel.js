import gulp from 'gulp';
import del from 'del';
import browserSync from 'browser-sync';
import pug from 'gulp-pug';
import sass from 'gulp-sass';
import mjml from 'gulp-mjml';
import notify from 'gulp-notify';
import imagemin from 'gulp-imagemin';
import plumber from 'gulp-plumber';

const paths = {
  dist: 'dist/',
  src: 'src/',
  tmp: 'tmp/',
  images: {
    get src() {
      return `${paths.src}assets/images/**/*.*`;
    },
    get dist() {
      return `${paths.dist}assets/images/`;
    }
  },
  styles: {
    get src() {
      return `${paths.src}styles/*.sass`;
    },
    get dist() {
      return `${paths.tmp}/styles`;
    }
  }
};

const server = browserSync.create();

const serve = done => {
  server.init({
    https: true,
    notify: false,
    open: false,
    reloadOnRestart: true,
    server: { baseDir: paths.dist },
    ui: false
  });
  done();
};

const reload = done => {
  server.reload();
  done();
};

const clean = () => del([paths.dist, paths.tmp]);

const images = () => {
  return gulp
    .src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dist));
};

const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: err.plugin.toUpperCase(),
            message: err.message
          };
        })
      })
    )
    .pipe(
      sass({
        outputStyle: 'compressed'
      })
    )
    .pipe(gulp.dest(paths.styles.dist));
};

const build = () => {
  return (
    gulp
      .src(paths.src + '*.pug')
      .pipe(
        plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: err.plugin.toUpperCase(),
              message: err.message
            };
          })
        })
      )
      // .pipe(pug({ pretty: true }))
      .pipe(pug())
      .pipe(mjml())
      .pipe(gulp.dest(paths.dist))
  );
};

const watch = () => {
  gulp.watch(paths.src, gulp.series(styles, build, reload));
  gulp.watch(paths.images.src, gulp.series(images, reload));
};

export const dev = gulp.series(clean, styles, build, images, serve, watch);
export const dist = gulp.series(clean, styles, build, images);
