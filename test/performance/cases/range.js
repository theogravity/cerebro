/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

var Cerebro = require('../../../build/cerebro').Cerebro
var configuration = require('../../fixtures/range/default')
var cerebro = new Cerebro(configuration)

/**
 * A performance test that evaluates one except block with an enum
 */
module.exports = function () {
  var context = {
    bucket: 1500
  }
  var cerebroConfig = cerebro.resolveConfig(context)

  cerebroConfig.isEnabled('range')
}
