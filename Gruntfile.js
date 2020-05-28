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
    }
  })

  grunt.loadNpmTasks('grunt-benchmark')

  require('./grunt_tasks/bench')(grunt)

  grunt.registerTask('bench', ['benchmark'])

  grunt.registerTask('bench_ci', ['bench', 'append_benchmarks', 'git_commit'])
}
