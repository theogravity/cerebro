/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

var Cerebro = require('../../../src/cerebro')
var configuration = require('../../fixtures/multiple_except_blocks/multiple_except_blocks.js')
var cerebro = new Cerebro(configuration)

/**
 * A performance test that multiple except blocks in one setting
 */
module.exports = function () {
  var context = {
    farm: '123'
  }
  var cerebroConfig = cerebro.resolveConfig(context)

  cerebroConfig.getValue('testSetting')
}
