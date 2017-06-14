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
  images: {
    get src () { return `${paths.src}assets/images/**/*.*`; },
    get dist () { return `${paths.dist}assets/images/`; }
  },
  sass: {
    get src () { return `${paths.src}sass/*.sass`; },
    get dist () { return `${paths.src}css/`; }
  }
};

const server = browserSync.create();

const reload = (done) => {
  server.reload();
  done();
}

const serve = (done) => {
  server.init({
    server: { baseDir: paths.dist },
    ui: false,
    open: false,
    reloadOnRestart: true,
    notify: false
  });
  done();
}

const clean = () => del([paths.dist, paths.src + 'css']);

const images = () => {
  return gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dist))
};

const css = () => {
  return gulp.src(paths.sass.src)
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: err.plugin.toUpperCase(),
          message: err.message
        }
      })
    }))
    .pipe(sass({
      // outputStyle: 'compressed'
    }))
    .pipe(gulp.dest(paths.sass.dist))
}

const build = () => {
  return gulp.src(paths.src + '*.pug')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
           title: err.plugin.toUpperCase(),
           message: err.message
        }
      })
    }))
    // .pipe(pug({pretty: true}))
    .pipe(pug())
    .pipe(mjml())
    .pipe(gulp.dest(paths.dist))
};

const watch = () => {
  gulp.watch(paths.src, {
    ignored: paths.src + 'css/'
  }, gulp.series(css, build, reload));
  gulp.watch(paths.images.src, gulp.series(images, reload));
}

export const dist = gulp.series(clean, css, build, images);
const dev = gulp.series(clean, css, build, images, serve, watch);

export default dev;
