var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    concat     = require('gulp-concat'),
    uglify     = require('gulp-uglify'),
    minifycss  = require('gulp-minify-css'),
    ngAnnotate = require('gulp-ng-annotate');

gulp.task('default', function() {


});


/*

gulp.task('build-css', function() {

    var css_files = [
        'client/assets/css/bootstrap/css/bootstrap.css',

    ];

    return gulp.src(css_files)
        .pipe(concat('bundle.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('client/assets/css'))
});
*/

gulp.task('build-js', function() {

    var js_files = [
        'assets/js/app.js',
        'assets/js/lib/controllers/game.js',
        'assets/js/lib/controllers/battle.js',
        'assets/js/lib/controllers/blueprint.js',
        'assets/js/lib/controllers/cargo.js',
        'assets/js/lib/controllers/colony.js',
        'assets/js/lib/controllers/faction.js',
        'assets/js/lib/controllers/galaxy.js',
        'assets/js/lib/controllers/industry.js',
        'assets/js/lib/controllers/input.js',
        'assets/js/lib/controllers/item.js',
        'assets/js/lib/controllers/module.js',
        'assets/js/lib/controllers/pirate.js',
        'assets/js/lib/controllers/pop.js',
        'assets/js/lib/controllers/quick.js',
        'assets/js/lib/controllers/random.js',
        'assets/js/lib/controllers/resources.js',
        'assets/js/lib/controllers/screen.js',
        'assets/js/lib/controllers/ship.js',
        'assets/js/lib/controllers/shipyard.js',
        'assets/js/lib/controllers/tactical.js',
        'assets/js/lib/controllers/persistence.js',
        'assets/js/lib/controllers/persistence.js',
        'assets/js/lib/controllers/upgrades.js',
        'assets/js/lib/controllers/weapons.js',
        'assets/js/lib/controllers/markers.js',
        'assets/js/lib/controllers/ai.js',
        'assets/js/lib/controllers/events.js',
        'assets/js/lib/controllers/audio.js',
        'assets/js/lib/controllers/character.js',
        'assets/js/lib/controllers/colony_lite.js',
        'assets/js/lib/controllers/private_industry.js',
        'assets/js/lib/controllers/migration.js',

    ];

    return gulp.src(js_files)
        .pipe(concat('ultraspace.min.js'))
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('assets/js'))
});

