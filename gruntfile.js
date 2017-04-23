module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: './dist/js/main.browserified.js',
                dest: './dist/js/main.min.js'
            }
        },
        cssmin: {
            target: {
                files: {
                  './dist/css/main.min.css': ['./src/css/normalize.css', './src/css/main.css', './src/css/custom.css']
                }
            }
        },
        jshint: {
            all: ['./src/js/*.js'],
            options : {
              jshintrc : './.jshintrc'
            }
        },
        csslint: {
            strict: {
                src: ['./src/css/custom.css']
            },
        },
        browserify: {
            dist: {
                options: {
                    transform: [['babelify', {presets: ['es2015'], plugins: ['es6-promise']}]]
                },
                files: {
                    "./dist/js/main.browserified.js": ["./src/js/main.js"]
                }
            }
        }
    });

    grunt.registerTask('default', ['browserify', 'uglify', 'cssmin']);
    grunt.registerTask('hint', ['jshint', 'csslint']);

};