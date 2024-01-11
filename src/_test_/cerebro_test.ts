/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { Cerebro } from '../cerebro'
import { Evaluator } from '../evaluator' // stub purposes

import { expect } from 'chai'
import './server'

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
        let cerebro = new Cerebro(this.config, this.options)

        this.sandbox.stub(Evaluator, 'evaluate').returns({})

        expect(cerebro._config).to.deep.equal(this.config)
        expect(cerebro._customEvaluators).to.deep.equal(
          this.options.customEvaluators
        )
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

      it('listens to the poller if provided', function() {
        const poller = {
          on: this.sandbox.stub(),
          start: this.sandbox.stub()
        };

        this.options.poller = poller;
        const config = [
          {
            setting: 'answer',
            value: 0
          }
        ];

        const cerebro = new Cerebro(config, this.options);

        expect(poller.on).to.have.been.calledWith('update');
        expect(poller.start).to.have.been.calledOnce;

        expect(cerebro.resolveConfig({}).getValue('answer')).to.equal(0);

        poller.on.firstCall.args[1]([
          {
            setting: 'answer',
            value: 42
          }
        ]);

        expect(cerebro.resolveConfig({}).getValue('answer')).to.equal(42);
      });
    })

    describe('#resolveConfig', function () {
      it('returns labels when defined', function () {
        const labelEntries = this.labels
        const config = this.config.map(function (e) {
          const setting = Object.keys(e)[0]
          const value = e[setting]
          const labels = labelEntries[setting] || []

          return { setting, value, labels }
        })
        const resolved = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.value })
        }, {})
        const expectedLabels = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.labels })
        }, {})
        const options = {}
        const cerebro = new Cerebro(config, options)
        const actualConfig = cerebro.resolveConfig({})

        // @ts-expect-error
        expect(actualConfig._resolved).to.deep.equal(resolved)
        // @ts-expect-error
        expect(actualConfig._labels).to.deep.equal(expectedLabels)
      })

      it('returns no labels when not defined', function () {
        const labelEntries = {}
        const config = this.config.map(function (e) {
          const setting = Object.keys(e)[0]
          const value = e[setting]
          const labels = labelEntries[setting] || []

          return { setting, value, labels }
        })
        const resolved = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.value })
        }, {})
        const labels = config.reduce(function (s, e) {
          return Object.assign({}, { [e.setting]: e.labels })
        }, {})
        const options = {}
        const cerebro = new Cerebro(config, options)
        const actualConfig = cerebro.resolveConfig({})

        // @ts-expect-error
        expect(actualConfig._resolved).to.deep.equal(resolved)
        // @ts-expect-error
        expect(actualConfig._labels).to.deep.equal(labels)
      })
    })

    describe('#rehydrate', function () {
      it('returns a new usable instance of CerebroConfig', function () {
        let cerebroConfig = Cerebro.rehydrate(
          JSON.stringify({ _resolved: { a: 5 } })
        )

        expect(cerebroConfig.getValue('a')).to.equal(5)
      })

      it('throws an error when the JSON is invalid', function () {
        expect(function () {
          Cerebro.rehydrate('djdaf')
        }).to.throw(SyntaxError)
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
        asArray: [1, 2],
        f: null,
        g: undefined,
        h: ''
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

    describe('#getAssertValue', function () {
      it('returns state value', function () {
        expect(this.cerebroConfig.getAssertValue('a')).to.equal(111)
      })

      it('throws an error if the setting is a boolean', function () {
        expect(
          function () {
            this.cerebroConfig.getAssertValue('b')
          }.bind(this)
        ).to.throw(/Please use #isEnabled instead./)
      })

      it('throws an error if the setting is null', function () {
        expect(
          function () {
            this.cerebroConfig.getAssertValue('f')
          }.bind(this)
        ).to.throw(/from getAssertValue/)
      })

      it('throws an error if the setting is undefined', function () {
        expect(
          function () {
            this.cerebroConfig.getAssertValue('g')
          }.bind(this)
        ).to.throw(/from getAssertValue/)
      })

      it('throws an error if the setting is an empty string', function () {
        expect(
          function () {
            this.cerebroConfig.getAssertValue('h')
          }.bind(this)
        ).to.throw(/from getAssertValue/)
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

    describe('#getRawValue', function () {
      it('returns feature value', function () {
        expect(this.cerebroConfig.getRawValue('e')).to.equal('test')
      })
    })

    describe('#getRawConfig', function () {
      it('returns the same config used in constructor', function () {
        let actualConfig = this.cerebroConfig.getRawConfig()

        expect(actualConfig).to.deep.equal(this.rawConfig)
      })
    })

    describe('#getLabels', function () {
      it('returns labeled config used in constructor', function () {
        let actualConfig = this.cerebroConfig.getLabels()

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
