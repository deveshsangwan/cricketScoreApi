const gulp          = require('gulp');
const ts            = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
    const tsResult = tsProject.src()
    .pipe(tsProject())
    .on("error",()=>{/*handle the error here*/});
    return tsResult.js.pipe(gulp.dest('app/src'));
});

gulp.task('watch',  gulp.series(['scripts', () => {
    gulp.watch('app/ts_src/**/*.ts', gulp.series(['scripts']));
}]));

gulp.task('default', gulp.series(['watch']));