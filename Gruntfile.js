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
      micro: {
        files: {
          'promiz.micro.min.js': ['promiz.micro.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);

};