/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

var Cerebro = require('../../../src/cerebro')
var configuration = require('../../fixtures/template/simple.js')
var partnerValue = configuration[0].except[0].partner
var cerebro = new Cerebro(configuration)

/**
 * A simple performance test with one boolean setting and one non-boolean setting
 */
module.exports = function () {
  var context = {
    // ensure that the template value is used with exact partner condition
    partner: partnerValue
  }
  var cerebroConfig = cerebro.resolveConfig(context)

  cerebroConfig.getValue('template')
}
