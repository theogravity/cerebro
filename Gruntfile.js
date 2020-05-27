module.exports = function (grunt) {
  grunt.initConfig({
    benchmark: {
      all: {
        src: 'test/performance/runner.js',
        dest: 'tmp/perf_results.json'
      }
    },
    append_benchmarks: {
      options: {
        src: 'tmp/perf_results.json',
        dest: 'test/performance/test_timeseries.json'
      }
    },
    git_commit: {
      benchmarks: {
        options: {
          message: 'Committing benchmark timeseries'
        },
        src: ['test/performance/test_timeseries.json']
      }
    },
    mocha_istanbul: {
      src: ['**/_test_/**/*_test.js', '**/_test_/**/*_test.ts'],
      options: {
        excludes: [
          '**/_test_/**/*_test.js',
          '**/_test_/**/*_test.ts'
        ]
      }
    },
    eslint: {
      target: ['src']
    }
  })

  grunt.loadNpmTasks('grunt-benchmark')
  grunt.loadNpmTasks('grunt-mocha-istanbul')
  grunt.loadNpmTasks('grunt-eslint')

  require('./grunt_tasks/bench')(grunt)

  grunt.registerTask('bench', ['benchmark'])

  grunt.registerTask('bench_ci', ['bench', 'append_benchmarks', 'git_commit'])

  grunt.registerTask('test', ['eslint', 'mocha_istanbul', 'bench'])

  grunt.registerTask('test:ci', ['eslint', 'mocha_istanbul'])
}
