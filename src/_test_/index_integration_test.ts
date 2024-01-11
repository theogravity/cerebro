/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { Cerebro } from '../cerebro'
import { expect } from 'chai'
import './server'

const FIXTURE_PATH = '../../test/fixtures/'

describe('Feature Flipper', function () {
  describe('integrated test cases', function () {
    describe('feature', function () {
      // takes a generated file from the build and runs it through cerebro
      it('generates the correct output for features', function () {
        const context = {
          buckets: '1'
        }
        const configuration = require(FIXTURE_PATH + 'generated/feature.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('optionA')).to.be.true
        expect(cerebroConfig.isEnabled('optionB')).to.be.false
        expect(cerebroConfig.isEnabled('optionC')).to.be.true
        expect(cerebroConfig.isEnabled('optionD')).to.be.true
      })
    })

    describe('setting', function () {
      it('generates the correct output for settings', function () {
        const context = {
          buckets: '2',
          intls: 'us'
        }
        const configuration = require(FIXTURE_PATH + 'generated/setting.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

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
        const context = {}
        const configuration = require(FIXTURE_PATH + 'simple/enabled.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('simple')).to.be.true
      })

      it('disables a feature when enabled is false', function () {
        const context = {}
        const configuration = require(FIXTURE_PATH + 'simple/disabled.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('simple')).to.be.false
      })
    })

    context('templates', function () {
      it('inserts context value into template', function () {
        const contextEnabled = {
          partner: 'bar'
        }
        const contextDisabled = {
          partner: 'baz'
        }
        const configuration = require(FIXTURE_PATH + 'template/simple.js')
        const cerebro = new Cerebro(configuration)
        let cerebroConfig = cerebro.resolveConfig(contextEnabled)

        expect(cerebroConfig.getValue('template')).to.equal('https://bar.com')

        cerebroConfig = cerebro.resolveConfig(contextDisabled)
        expect(cerebroConfig.getValue('template')).to.equal('https://foo.com')
      })
    })

    context('simple settings', function () {
      it('changes the value when the entry is evaluated to true', function () {
        const context = {
          bucket: ['43225', '123']
        }
        const configuration = require(FIXTURE_PATH + 'settings/setting.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(777)
      })

      it('does not change the value when the entry is evaluated to false', function () {
        const context = {
          bucket: '14353'
        }
        const configuration = require(FIXTURE_PATH + 'settings/setting.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(42)
      })
    })

    context('multiple except blocks', function () {
      it('chooses the right value when the option is first', function () {
        const context = {
          bucket: '123'
        }
        const configuration = require(FIXTURE_PATH +
          'multiple_except_blocks/multiple_except_blocks.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(777)
      })

      it('chooses the right value when the option is second', function () {
        const context = {
          bucket: '445'
        }
        const configuration = require(FIXTURE_PATH +
          'multiple_except_blocks/multiple_except_blocks.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.getValue('testSetting')).to.equal(888)
      })
    })

    context('when depending on a feature', function () {
      it('enables a feature when the independent feature is enabled', function () {
        const context = {}
        const configuration = require(FIXTURE_PATH + 'dependent/enabled.js')
        const options = {}
        const cerebro = new Cerebro(configuration, options)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('dependent')).to.be.true
      })

      it('does nothing when the independent feature is disabled', function () {
        const context = {}
        const configuration = require(FIXTURE_PATH + 'dependent/disabled.js')
        const options = {}
        const cerebro = new Cerebro(configuration, options)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('dependent')).to.be.false
      })
    })

    context('when the configuration is a list', function () {
      context('default list scenarios', function () {
        it('enables the feature when the context matches', function () {
          const context = {
            buckets: 'bucket1'
          }
          const configuration = require(FIXTURE_PATH + 'enums/default.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('list')).to.be.true
        })

        it('does not enable the feature when the context does not match', function () {
          const context = {
            buckets: ['bucket3']
          }
          const configuration = require(FIXTURE_PATH + 'enums/default.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('list')).to.be.false
        })
      })

      context('and it contains `all`', function () {
        it('enables the feature when the context contains a valid value', function () {
          const context = {
            buckets: ['bucket1']
          }
          const configuration = require(FIXTURE_PATH + 'enums/all.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('all')).to.be.true
        })

        it('enables the feature when the context contains a invalid value', function () {
          // this functionality is debatable, but it appears to be this way in Storm.
          const context = {
            buckets: ['bucket3']
          }
          const configuration = require(FIXTURE_PATH + 'enums/all.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('all')).to.be.true
        })

        it('disables the feature when the context contains no value', function () {
          const context = {}
          const configuration = require(FIXTURE_PATH + 'enums/all.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('all')).to.be.false
        })
      })

      context('and it contains `none`', function () {
        it('disables the feature when the context contains a valid value', function () {
          const context = {
            buckets: ['bucket1']
          }
          const configuration = require(FIXTURE_PATH + 'enums/none.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('none')).to.be.false
        })

        it('disables the feature when the context contains a invalid value', function () {
          // this functionality is debatable, but it appears to be this way in Storm.
          const context = {
            buckets: ['bucket3']
          }
          const configuration = require(FIXTURE_PATH + 'enums/none.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('none')).to.be.false
        })

        it('enables the feature when the context contains no value', function () {
          const context = {}
          const configuration = require(FIXTURE_PATH + 'enums/none.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('none')).to.be.true
        })
      })
    })

    context('when the configuration contains a range', function () {
      it('enables the feature for a number within the range', function () {
        const context = {
          bucket: 1500
        }
        const configuration = require(FIXTURE_PATH + 'range/default.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('enables the feature when the range is inclusive', function () {
        const context = {
          bucket: 2000
        }
        const configuration = require(FIXTURE_PATH + 'range/default.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('does not enable the feature when the range is exclusive', function () {
        const context = {
          bucket: 2000
        }
        const configuration = require(FIXTURE_PATH + 'range/exclusive.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('does not enable the feature for a number greater than the range', function () {
        const context = {
          bucket: 2001
        }
        const configuration = require(FIXTURE_PATH + 'range/default.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('does not enable the feature for a number less than the range', function () {
        const context = {
          bucket: 999
        }
        const configuration = require(FIXTURE_PATH + 'range/default.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('enables the feature for a number within a negative range', function () {
        const context = {
          bucket: -1500
        }
        const configuration = require(FIXTURE_PATH + 'range/negative.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('enables the feature for a number within a reverse negative range', function () {
        const context = {
          bucket: -1500
        }
        const configuration = require(FIXTURE_PATH + 'range/reverse_negative.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.true
      })

      it('disables the feature for a number outside a negative range', function () {
        const context = {
          bucket: -999
        }
        const configuration = require(FIXTURE_PATH + 'range/negative.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('range')).to.be.false
      })

      it('enables the feature for a number outside a reverse negative range', function () {
        const context = {
          bucket: -999
        }
        const configuration = require(FIXTURE_PATH + 'range/reverse_negative.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context)

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
          const context = {
            env: 'alpha',
            bucket: 'bucket1'
          }
          const configuration = require(FIXTURE_PATH + 'combined/combined.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('combined')).to.be.true
        })

        it('does not enable the feature if all conditions are not met', function () {
          const context = {
            env: 'alpha',
            bucket: 'bucket2'
          }
          const configuration = require(FIXTURE_PATH + 'combined/combined.js')
          const cerebro = new Cerebro(configuration)
          const cerebroConfig = cerebro.resolveConfig(context)

          expect(cerebroConfig.isEnabled('combined')).to.be.false
        })
      }
    )

    context('overrides', function () {
      it('overrides the setting if provided', function () {
        const context = {
          bucket: ['43225', '123']
        }
        const options = {
          overrides: {
            testSetting: 888
          }
        }
        const configuration = require(FIXTURE_PATH + 'settings/setting.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context, options)

        expect(cerebroConfig.getValue('testSetting')).to.equal(888)
      })

      it('coerces the override to boolean if the setting is boolean', function () {
        const context = {}
        const options = {
          overrides: {
            simple: 0
          }
        }
        const configuration = require(FIXTURE_PATH + 'simple/enabled.js')
        const cerebro = new Cerebro(configuration)
        const cerebroConfig = cerebro.resolveConfig(context, options)

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
        const context = {
          customCondition: 'en-US'
        }
        const options = {
          customEvaluators: this.customEvaluators
        }
        const configuration = require(FIXTURE_PATH +
          'custom_evaluator/custom_evaluator.js')
        const cerebro = new Cerebro(configuration, options)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('customEvaluator')).to.be.true
      })

      it('returns the default answer if the custom evaluator is not fulfilled', function () {
        const context = {
          customCondition: 'no'
        }
        const options = {
          customEvaluators: this.customEvaluators
        }
        const configuration = require(FIXTURE_PATH +
          'custom_evaluator/custom_evaluator.js')
        const cerebro = new Cerebro(configuration, options)
        const cerebroConfig = cerebro.resolveConfig(context)

        expect(cerebroConfig.isEnabled('customEvaluator')).to.be.false
      })
    })
  })
})
