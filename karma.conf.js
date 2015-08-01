module.exports = function (config) {
  config.set({

    basePath: "./",

    frameworks: [
      "jasmine",
      "systemjs"
    ],

    systemjs: {
      config: {
        paths: {
          systemjs: "app/bower_components/system.js/dist/system.src.js",
          typescript: "node_modules/typescript/bin/typescript.js"
        },
        transpiler: "typescript"
      },
      testFileSuffix: ".spec.ts"
    },

    files: [
      {pattern: "app/**/*", served: true, included: false},
      {pattern: "test_fixtures/**/*", served: true, included: false},
      {pattern: "node_modules/karma-read-json/karma-read-json.js", served: true, included: false},
      "app/bower_components/angular/angular.js",
      "app/bower_components/angular-route/angular-route.js",
      "node_modules/angular-mocks/angular-mocks.js"
    ]
  });
};
