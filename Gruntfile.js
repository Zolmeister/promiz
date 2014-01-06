module.exports = function(grunt) {

  grunt.initConfig({
    'closure-compiler': {
      promiz: {
        noreport: true,
        closurePath: 'closure-compiler',
        js: 'promiz.js',
        jsOutputFile: 'promiz.min.js',
        maxBuffer: Infinity,
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS'
        }
      },
      micro: {
        noreport: true,
        closurePath: 'closure-compiler',
        js: 'promiz.micro.js',
        jsOutputFile: 'promiz.micro.min.js',
        maxBuffer: Infinity,
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-closure-compiler');

  grunt.registerTask('default', ['closure-compiler']);

};