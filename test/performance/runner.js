module.exports = {
  name: 'Cerebro',
  tests: {
    simple: require('./cases/simple'),
    'simple with override': require('./cases/simple_override'),
    enum: require('./cases/enum'),
    range: require('./cases/range'),
    'custom evaluator': require('./cases/custom_evaluator'),
    'cross setting dependencies': require('./cases/cross_setting'),
    'multiple dimensions': require('./cases/multiple_dimensions'),
    'multiple except blocks': require('./cases/multiple_except_blocks'),
    'random percentage': require('./cases/random_percentage'),
    'fixed percentage': require('./cases/fixed_percentage'),
    template: require('./cases/template'),
    huge: require('./cases/huge')
  }
}
