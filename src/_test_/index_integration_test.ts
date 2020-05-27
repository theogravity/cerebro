/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import Cerebro from '../cerebro'

var expect = require('chai').expect
var FIXTURE_PATH = '../../test/fixtures/'

require('../../test/setup/server')

describe('Feature Flipper', function () {
  describe('integrated test cases', function () {
    describe('feature', function () {
      // takes a generated file from the build and runs it through cerebro
      it('generates the correct output for features', function () {
        var context = {
          buckets: '1'
        }
        var configuration = require(FIXTURE_PATH + 'generated/feature.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('optionA')).to.be.true
        expect(cerebroConfig.isEnabled('optionB')).to.be.false
        expect(cerebroConfig.isEnabled('optionC')).to.be.true
        expect(cerebroConfig.isEnabled('optionD')).to.be.true
      })
    })

    describe('setting', function () {
      it('generates the correct output for settings', function () {
        var context = {
          buckets: '2',
          intls: 'us'
        }
        var configuration = require(FIXTURE_PATH + 'generated/setting.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('sender')).to.equal('foo@yahoo.com')
        expect(cerebroConfig.getValue('helpUrl')).to.equal('')
        expect(cerebroConfig.getValue('dateOverride')).to.equal(1428938850)
        expect(cerebroConfig.getValue('testIds')).to.deep.equal([
          '10',
          '20',
          '30',
          '40'
        ])
        expect(cerebroConfig.getValue('alienMap')).to.deep.equal({
          1: 'hello',
          2: 'world',
          3: 'from',
          4: 'the',
          5: 'aliens'
        })
        expect(cerebroConfig.getValue('assetMap')).to.deep.equal({})
        expect(cerebroConfig.getValue('foo')).to.equal('a')
        expect(cerebroConfig.getValue('version')).to.equal('v1.0')
      })
    })
  })

  describe('isolated test cases', function () {
    context('simple features', function () {
      it('enables a feature when enabled is true', function () {
        var context = {}
        var configuration = require(FIXTURE_PATH + 'simple/enabled.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('simple')).to.be.true
      })

      it('disables a feature when enabled is false', function () {
        var context = {}
        var configuration = require(FIXTURE_PATH + 'simple/disabled.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('simple')).to.be.false
      })
    })

    context('templates', function () {
      it('inserts context value into template', function () {
        var contextEnabled = {
          partner: 'bar'
        }
        var contextDisabled = {
          partner: 'baz'
        }
        var configuration = require(FIXTURE_PATH + 'template/simple.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(contextEnabled)

        expect(cerebroConfig.getValue('template')).to.equal('https://bar.com')

        cerebroConfig = cerebro.resolveConfig(contextDisabled)
        expect(cerebroConfig.getValue('template')).to.equal('https://foo.com')
      })
    })

    context('simple settings', function () {
      it('changes the value when the entry is evaluated to true', function () {
        var context = {
          bucket: ['43225', '123']
        }
        var configuration = require(FIXTURE_PATH + 'settings/setting.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(777)
      })

      it('does not change the value when the entry is evaluated to false', function () {
        var context = {
          bucket: '14353'
        }
        var configuration = require(FIXTURE_PATH + 'settings/setting.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(42)
      })
    })

    context('multiple except blocks', function () {
      it('chooses the right value when the option is first', function () {
        var context = {
          bucket: '123'
        }
        var configuration = require(FIXTURE_PATH +
          'multiple_except_blocks/multiple_except_blocks.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(777)
      })

      it('chooses the right value when the option is second', function () {
        var context = {
          bucket: '445'
        }
        var configuration = require(FIXTURE_PATH +
          'multiple_except_blocks/multiple_except_blocks.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(888)
      })
    })

    context('when depending on a feature', function () {
      it('enables a feature when the independent feature is enabled', function () {
        var context = {}
        var configuration = require(FIXTURE_PATH + 'dependent/enabled.js')
        var options = {}
        var cerebro = new Cerebro(configuration, options)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('dependent')).to.be.true
      })

      it('does nothing when the independent feature is disabled', function () {
        var context = {}
        var configuration = require(FIXTURE_PATH + 'dependent/disabled.js')
        var options = {}
        var cerebro = new Cerebro(configuration, options)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('dependent')).to.be.false
      })
    })

    context('when the configuration is a list', function () {
      context('default list scenarios', function () {
        it('enables the feature when the context matches', function () {
          var context = {
            buckets: 'bucket1'
          }
          var configuration = require(FIXTURE_PATH + 'enums/default.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('list')).to.be.true
        })

        it('does not enable the feature when the context does not match', function () {
          var context = {
            buckets: ['bucket3']
          }
          var configuration = require(FIXTURE_PATH + 'enums/default.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('list')).to.be.false
        })
      })

      context('and it contains `all`', function () {
        it('enables the feature when the context contains a valid value', function () {
          var context = {
            buckets: ['bucket1']
          }
          var configuration = require(FIXTURE_PATH + 'enums/all.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('all')).to.be.true
        })

        it('enables the feature when the context contains a invalid value', function () {
          // this functionality is debatable, but it appears to be this way in Storm.
          var context = {
            buckets: ['bucket3']
          }
          var configuration = require(FIXTURE_PATH + 'enums/all.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('all')).to.be.true
        })

        it('disables the feature when the context contains no value', function () {
          var context = {}
          var configuration = require(FIXTURE_PATH + 'enums/all.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('all')).to.be.false
        })
      })

      context('and it contains `none`', function () {
        it('disables the feature when the context contains a valid value', function () {
          var context = {
            buckets: ['bucket1']
          }
          var configuration = require(FIXTURE_PATH + 'enums/none.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('none')).to.be.false
        })

        it('disables the feature when the context contains a invalid value', function () {
          // this functionality is debatable, but it appears to be this way in Storm.
          var context = {
            buckets: ['bucket3']
          }
          var configuration = require(FIXTURE_PATH + 'enums/none.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('none')).to.be.false
        })

        it('enables the feature when the context contains no value', function () {
          var context = {}
          var configuration = require(FIXTURE_PATH + 'enums/none.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('none')).to.be.true
        })
      })
    })

    context('when the configuration contains a range', function () {
      it('enables the feature for a number within the range', function () {
        var context = {
          bucket: 1500
        }
        var configuration = require(FIXTURE_PATH + 'range/default.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('enables the feature when the range is inclusive', function () {
        var context = {
          bucket: 2000
        }
        var configuration = require(FIXTURE_PATH + 'range/default.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('does not enable the feature when the range is exclusive', function () {
        var context = {
          bucket: 2000
        }
        var configuration = require(FIXTURE_PATH + 'range/exclusive.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('does not enable the feature for a number greater than the range', function () {
        var context = {
          bucket: 2001
        }
        var configuration = require(FIXTURE_PATH + 'range/default.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('does not enable the feature for a number less than the range', function () {
        var context = {
          bucket: 999
        }
        var configuration = require(FIXTURE_PATH + 'range/default.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('enables the feature for a number within a negative range', function () {
        var context = {
          bucket: -1500
        }
        var configuration = require(FIXTURE_PATH + 'range/negative.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('enables the feature for a number within a reverse negative range', function () {
        var context = {
          bucket: -1500
        }
        var configuration = require(FIXTURE_PATH + 'range/reverse_negative.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('disables the feature for a number outside a negative range', function () {
        var context = {
          bucket: -999
        }
        var configuration = require(FIXTURE_PATH + 'range/negative.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('enables the feature for a number outside a reverse negative range', function () {
        var context = {
          bucket: -999
        }
        var configuration = require(FIXTURE_PATH + 'range/reverse_negative.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })
    })

    xcontext('when the configuration contains a percentage', function () {
      it('enables the feature for the same person', function () {
        // TODO: Not sure how this test will look like
      })

      it('enables the feature randomly', function () {
        // TODO: Not sure how this test will look like
      })
    })

    context(
      'when there are multiple conditions in one except block',
      function () {
        it('enables the feature if all conditions are met', function () {
          var context = {
            env: 'alpha',
            bucket: 'bucket1'
          }
          var configuration = require(FIXTURE_PATH + 'combined/combined.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('combined')).to.be.true
        })

        it('does not enable the feature if all conditions are not met', function () {
          var context = {
            env: 'alpha',
            bucket: 'bucket2'
          }
          var configuration = require(FIXTURE_PATH + 'combined/combined.js')
          var cerebro = new Cerebro(configuration)
          var cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('combined')).to.be.false
        })
      }
    )

    context('overrides', function () {
      it('overrides the setting if provided', function () {
        var context = {
          bucket: ['43225', '123']
        }
        var options = {
          overrides: {
            testSetting: 888
          }
        }
        var configuration = require(FIXTURE_PATH + 'settings/setting.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context, options)

        expect(cerebroConfig.getValue('testSetting')).to.equal(888)
      })

      it('coerces the override to boolean if the setting is boolean', function () {
        var context = {}
        var options = {
          overrides: {
            simple: 0
          }
        }
        var configuration = require(FIXTURE_PATH + 'simple/enabled.js')
        var cerebro = new Cerebro(configuration)
        var cerebroConfig = cerebro.resolveConfig(context, options)

        expect(cerebroConfig.isEnabled('simple')).to.equal(false)
      })
    })

    context('custom evaluators', function () {
      beforeEach(function () {
        this.customEvaluators = {
          evaluateCondition: function (condition, testValue) {
            if (testValue.indexOf(condition) !== -1) {
              return true
            }

            return false
          }
        }
      })

      it('returns the new answer if the custom evaluator is fulfilled', function () {
        var context = {
          customCondition: 'en-US'
        }
        var options = {
          customEvaluators: this.customEvaluators
        }
        var configuration = require(FIXTURE_PATH +
          'custom_evaluator/custom_evaluator.js')
        var cerebro = new Cerebro(configuration, options)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('customEvaluator')).to.be.true
      })

      it('returns the default answer if the custom evaluator is not fulfilled', function () {
        var context = {
          customCondition: 'no'
        }
        var options = {
          customEvaluators: this.customEvaluators
        }
        var configuration = require(FIXTURE_PATH +
          'custom_evaluator/custom_evaluator.js')
        var cerebro = new Cerebro(configuration, options)
        var cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('customEvaluator')).to.be.false
      })
    })
  })
})
