/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

var Cerebro = require('../../../build/cerebro').Cerebro
var configuration = require('../../fixtures/custom_evaluator/custom_evaluator.js')
var cerebro = new Cerebro(configuration, {
  customEvaluator: function (configValue, contextValue) {
    return configValue.some(function (c) {
      return contextValue.indexOf(c) !== -1
    })
  }
})

/**
 * A performance test that tests custom evaluators
 */
module.exports = function () {
  var context = {
    customCondition: 'en-US'
  }
  var cerebroConfig = cerebro.resolveConfig(context)

  cerebroConfig.isEnabled('dependent')
}
