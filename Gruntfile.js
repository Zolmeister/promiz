module.exports = function (grunt) {

  grunt.initConfig({
    uglify: {
      options: {
        report: 'gzip'
      },
      promiz: {
        files: {
          'promiz.min.js': ['promiz.js']
        }
      },
      mithril: {
        files: {
          'promiz.mithril.min.js': ['promiz.mithril.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);

};
