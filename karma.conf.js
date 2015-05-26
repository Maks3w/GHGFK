module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.min.js',
            'app/bower_components/lodash/lodash.js',
            'app/bower_components/restangular/dist/restangular.js',
            'app/lib/github/*.js',
            'app/js/**/*.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'test/unit/**/*.js'
        ],

        autoWatch: true,

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite     : 'unit'
        }
    });
};
