module.exports = function (config) {
    config.set({
        basePath: '../',

        frameworks: ['jasmine'],

        files: [
            'app/lib/angular/angular.js',
            'app/lib/angular/angular-*.js',
            'app/lib/github/*.js',
            'app/lib/*.js',
            'test/lib/angular/angular-mocks.js',
            'app/js/**/*.js',
            'test/unit/**/*.js'
        ],

        autoWatch: true,

        browsers: ['Chrome', 'Firefox'],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite     : 'unit'
        }
    });
};
