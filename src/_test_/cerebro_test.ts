/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { Cerebro } from '../cerebro'
import { Evaluator } from '../evaluator' // stub purposes

const expect = require('chai').expect

require('../../test/setup/server')

describe('./cerebro.ts', function () {
  beforeEach(function () {
    this.config = [{ a: 1 }]
    this.labels = { a: ['s'], b: ['c'], c: ['s', 'c'] }
    this.context = { b: 2 }
    this.overrides = { c: 3 }
    this.options = {
      customEvaluators: function () {}
    }
    this.dehydratedObject = { d: 4 }
  })

  describe('Cerebro', function () {
    describe('constructor', function () {
      it('initializes the object with all parameters set', function () {
        var cerebro = new Cerebro(this.config, this.options)

        this.sandbox.stub(Evaluator, 'evaluate').returns({})

        expect(cerebro._config).to.deep.equal(this.config)
        expect(cerebro._customEvaluators).to.deep.equal(
          this.options.customEvaluators
        )
      })

      it('throws an error if config is not passed in', function () {
        expect(function () {
          // @ts-expect-error
          return new Cerebro()
        }).to.throw(/`config` is required/)
      })

      it('throws an error if custom evaluators is not an object', function () {
        this.options.customEvaluators = true
        expect(
          function () {
            return new Cerebro(this.config, this.options)
          }.bind(this)
        ).to.throw(/customEvaluators should be an object/)
      })

      it('throws an error if custom evaluators do not have functions as values', function () {
        this.options.customEvaluators = {
          notAFunction: 'blah'
        }
        expect(
          function () {
            return new Cerebro(this.config, this.options)
          }.bind(this)
        ).to.throw(/is not a function in customEvaluators/)
      })
    })

    describe('#resolveConfig', function () {
      it('returns labels when defined', function () {
        var labelEntries = this.labels
        var config = this.config.map(function (e) {
          var setting = Object.keys(e)[0]
          var value = e[setting]
          var labels = labelEntries[setting] || []

          return { setting, value, labels }
        })
        var resolved = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.value })
        }, {})
        var expectedLabels = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.labels })
        }, {})
        var options = {}
        var cerebro = new Cerebro(config, options)
        var actualConfig = cerebro.resolveConfig({})

        // @ts-expect-error
        expect(actualConfig._resolved).to.deep.equal(resolved)
        // @ts-expect-error
        expect(actualConfig._labels).to.deep.equal(expectedLabels)
      })

      it('returns no labels when not defined', function () {
        var labelEntries = {}
        var config = this.config.map(function (e) {
          var setting = Object.keys(e)[0]
          var value = e[setting]
          var labels = labelEntries[setting] || []

          return { setting, value, labels }
        })
        var resolved = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.value })
        }, {})
        var labels = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.labels })
        }, {})
        var options = {}
        var cerebro = new Cerebro(config, options)
        var actualConfig = cerebro.resolveConfig({})

        // @ts-expect-error
        expect(actualConfig._resolved).to.deep.equal(resolved)
        // @ts-expect-error
        expect(actualConfig._labels).to.deep.equal(labels)
      })

      it('throws an error if context is not passed', function () {
        var cerebro = new Cerebro(this.config)

        expect(function () {
          // @ts-expect-error
          cerebro.resolveConfig()
        }).to.throw(/`context` is required/)
      })
    })

    describe('#rehydrate', function () {
      it('returns a new usable instance of CerebroConfig', function () {
        var cerebroConfig = Cerebro.rehydrate(
          JSON.stringify({ _resolved: { a: 5 } })
        )

        expect(cerebroConfig.getValue('a')).to.equal(5)
      })

      it('throws an error when the JSON is invalid', function () {
        expect(function () {
          Cerebro.rehydrate('djdaf')
        }).to.throw(SyntaxError)
      })

      it('throws an error when no JSON provided', function () {
        expect(function () {
          // @ts-expect-error
          Cerebro.rehydrate()
        }).to.throw(Error)

        expect(function () {
          Cerebro.rehydrate(null)
        }).to.throw(Error)

        expect(function () {
          Cerebro.rehydrate('{}')
        }).to.throw(Error)
      })
    })
  })

  describe('CerebroConfig', function () {
    let rawConfig
    let labelResolved

    beforeEach(function () {
      const cerebro = new Cerebro([])
      const labels = { a: ['s'], b: ['c'], c: ['s', 'c'] }
      labelResolved = { s: { a: 111 } }

      rawConfig = {
        a: 111,
        b: true,
        c: { multilevel: [1, 2] },
        d: 12.3,
        e: 'test',
        asArray: [1, 2]
      }

      this.sandbox.stub(Cerebro.prototype, '_build').callsFake(function () {
        return { answers: rawConfig, labels, labelResolved: labelResolved }
      })
      this.rawConfig = rawConfig
      this.labels = labels
      this.cerebroConfig = cerebro.resolveConfig({})
    })

    describe('#getValue', function () {
      it('does not evaluate if setting is not present', function () {
        expect(this.cerebroConfig.getValue('non_existing_feature')).to.be.null
      })

      it('returns state value', function () {
        expect(this.cerebroConfig.getValue('a')).to.equal(111)
      })

      it('throws an error if the setting is a boolean', function () {
        expect(
          function () {
            this.cerebroConfig.getValue('b')
          }.bind(this)
        ).to.throw(/Please use #isEnabled instead./)
      })
    })

    describe('#isEnabled', function () {
      it('does not evaluate if feature is not present', function () {
        expect(this.cerebroConfig.isEnabled('non_existing_feature')).to.be.null
      })

      it('returns feature value', function () {
        expect(this.cerebroConfig.isEnabled('b')).to.equal(true)
      })

      it('throws an error if the setting is not a boolean', function () {
        expect(
          function () {
            this.cerebroConfig.isEnabled('a')
          }.bind(this)
        ).to.throw(/Please use #getValue instead./)
      })
    })

    describe('#getInt', function () {
      it('does not evaluate if feature is not present', function () {
        expect(this.cerebroConfig.getInt('non_existing_feature')).to.be.null
      })

      it('does not evaluate if feature is not a number', function () {
        expect(this.cerebroConfig.getInt('b')).to.be.null
      })

      it('returns feature value', function () {
        expect(this.cerebroConfig.getInt('a')).to.equal(111)
      })
    })

    describe('#getFloat', function () {
      it('does not evaluate if feature is not present', function () {
        expect(this.cerebroConfig.getFloat('non_existing_feature')).to.be.null
      })

      it('does not evaluate if feature is not a number', function () {
        expect(this.cerebroConfig.getFloat('b')).to.be.null
      })

      it('returns feature value', function () {
        expect(this.cerebroConfig.getFloat('d')).to.equal(12.3)
      })
    })

    describe('#getArray', function () {
      it('does not evaluate if feature is not present', function () {
        expect(this.cerebroConfig.getArray('non_existing_feature')).to.be.null
      })

      it('does not evaluate if feature is not an array', function () {
        expect(this.cerebroConfig.getArray('d')).to.be.null
      })

      it('returns feature value', function () {
        expect(this.cerebroConfig.getArray('asArray')).to.equal(
          rawConfig.asArray
        )
      })
    })

    describe('#getObject', function () {
      it('does not evaluate if feature is not present', function () {
        expect(this.cerebroConfig.getObject('non_existing_feature')).to.be.null
      })

      it('does not evaluate if feature is not an object', function () {
        expect(this.cerebroConfig.getObject('b')).to.be.null
      })

      it('returns feature value', function () {
        expect(this.cerebroConfig.getObject('c')).to.equal(rawConfig.c)
      })
    })

    describe('#getString', function () {
      it('does not evaluate if feature is not present', function () {
        expect(this.cerebroConfig.getString('non_existing_feature')).to.be.null
      })

      it('does not evaluate if feature is not a string', function () {
        expect(this.cerebroConfig.getString('b')).to.be.null
      })

      it('returns feature value', function () {
        expect(this.cerebroConfig.getString('e')).to.equal('test')
      })
    })

    describe('#getRawValue', function () {
      it('returns feature value', function () {
        expect(this.cerebroConfig.getRawValue('e')).to.equal('test')
      })
    })

    describe('#getRawConfig', function () {
      it('returns the same config used in constructor', function () {
        var actualConfig = this.cerebroConfig.getRawConfig()

        expect(actualConfig).to.deep.equal(this.rawConfig)
      })
    })

    describe('#getLabels', function () {
      it('returns labeled config used in constructor', function () {
        var actualConfig = this.cerebroConfig.getLabels()

        expect(actualConfig).to.deep.equal(this.labels)
      })
    })

    describe('#getConfigForLabel', function () {
      it('returns a config for a defined label', function () {
        expect(this.cerebroConfig.getConfigForLabel('s')).to.eql(
          labelResolved.s
        )
      })

      it('returns null for an undefined label', function () {
        expect(this.cerebroConfig.getConfigForLabel('undef_label')).to.eql(null)
      })
    })

    describe('#dehydrate', function () {
      it('returns a JSON string', function () {
        const json = this.cerebroConfig.dehydrate()

        expect(json).to.equal(
          JSON.stringify({
            _resolved: this.rawConfig,
            _labels: this.labels,
            _labelResolved: labelResolved
          })
        )
      })
    })
  })
})
