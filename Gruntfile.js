(function () {
  'use strict';
}());
module.exports = function (grunt) {
  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    tslint: {
      options: {
        configuration: grunt.file.readJSON("tslint.json")
      },
      app: {
        files: {
          src: [
            'app/js/**/*.ts',
            'app/lib/**/*.ts'
          ]
        }
      }
    },

    watch: {
      build_ts: {
        files: [
          '<%= tslint.app.files.src %>'
        ],
        tasks: ['build_ts']
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.registerTask('build_ts', ['tslint']);

  grunt.task.run('notify_hooks');
};
