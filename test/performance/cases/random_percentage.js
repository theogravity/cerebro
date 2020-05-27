/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

var Cerebro = require('../../../build/cerebro').Cerebro
var configuration = require('../../fixtures/percentage/random.js')
var cerebro = new Cerebro(configuration)

/**
 * A performance test that evaluates random percentages.
 */
module.exports = function () {
  var context = {}
  var cerebroConfig = cerebro.resolveConfig(context)

  cerebroConfig.isEnabled('random')
}
