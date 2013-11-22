module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc : {
            server: {
                src: ['./README.md', './app.js', './models/**/*.js', './services/**/*.js'],
                options: {
                    destination: 'jsdoc/',
                    template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure: "jsdoc.conf.json",
                    private: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['jsdoc']);
};