/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

var Cerebro = require('../../../build/cerebro').Cerebro
var configuration = require('../../fixtures/combined/huge.js')
var cerebro = new Cerebro(configuration)

/**
 * A performance test that tests a rather large but realistic config file
 */
module.exports = function () {
  var context = {
    settingA: '123',
    percentageSeed: 2,
    langs: 'en-US',
    partners: 'somePartner',
    intls: 'us',
    stages: 'pilot'
  }
  var cerebroConfig = cerebro.resolveConfig(context)

  cerebroConfig.isEnabled('SplunkLog_critical')
}
