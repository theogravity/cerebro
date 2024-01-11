/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { Condition } from '../condition'
import { Evaluator } from '../evaluator'
import { expect } from 'chai'

import './server'

describe('evaluator.ts', function () {
  describe('#prepareEntry', function () {
    it('precompiles templates', function () {
      const entry = {
        setting: 'setting',
        value: 3,
        except: [
          {
            // eslint-disable-next-line
            value: 'farm/${farm}',
            farm: ['123']
          },
          {
            // eslint-disable-next-line
            value: 'colo/${colo}',
            colo: ['all']
          }
        ]
      }

      const prepared = Evaluator.prepareEntry(entry)

      expect(prepared.except[0]).to.have.property('_compiledTemplate')
      expect(prepared.except[0]._compiledTemplate({ farm: '123' })).to.equal(
        'farm/123'
      )
      expect(prepared.except[1]).to.have.property('_compiledTemplate')
      expect(prepared.except[1]._compiledTemplate({ colo: 'gq1' })).to.equal(
        'colo/gq1'
      )
    })
  })

  describe('cross setting dependencies', function () {
    beforeEach(function () {
      this.settingName = 'testSettingB'

      this.answers = {
        testSettingA: false
      }

      this.entry = {
        setting: this.settingName,
        value: 3,
        except: [
          {
            setting: 'testSettingA',
            value: 45
          }
        ]
      }
    })

    it('returns the default answer if the setting is disabled', function () {
      const answer = Evaluator.evaluate(this.entry, {}, {}, this.answers)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.equal(3)
    })

    it('returns the except answer if the setting is enabled', function () {
      let answer

      this.answers.testSettingA = true

      answer = Evaluator.evaluate(this.entry, {}, {}, this.answers)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.equal(45)
    })
  })

  describe('overrides', function () {
    beforeEach(function () {
      this.settingName = 'testSetting'
      this.entry = {
        setting: this.settingName,
        value: 3,
        except: [
          {
            farm: ['1234'],
            value: 45
          }
        ]
      }
    })

    it('overrides the setting if overrides are provided', function () {
      const context = {
        farm: '1234'
      }
      const overrides = {
        testSetting: 54
      }
      let answer

      this.sandbox.stub(Condition, 'evaluate').returns(false)

      answer = Evaluator.evaluate(this.entry, context, overrides)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.equal(54)
    })

    it('coerces a value to boolean if the original setting is boolean', function () {
      const entry = {
        setting: this.settingName,
        value: true,
        except: [
          {
            farm: ['1234'],
            value: false
          }
        ]
      }
      const overrides = {
        testSetting: 0
      }
      let answer

      this.sandbox.stub(Condition, 'evaluate').returns(true)

      answer = Evaluator.evaluate(entry, context, overrides)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.equal(false)
    })

    it('overrides the original setting', function () {
      const entry = {
        setting: this.settingName,
        value: 'abcd',
        except: [
          {
            farm: ['1234'],
            value: 'defg'
          }
        ]
      }
      const overrides = {
        testSetting: 'higj'
      }
      let answer

      this.sandbox.stub(Condition, 'evaluate').returns(false)

      answer = Evaluator.evaluate(entry, context, overrides)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.equal('higj')
    })
  })

  describe('multiple conditions', function () {
    beforeEach(function () {
      this.settingName = 'testFeature'
      this.entry = {
        setting: this.settingName,
        value: true,
        except: [
          {
            value: false,
            farm: ['111', '222'],
            option: ['a', 'b']
          }
        ]
      }
    })

    it('returns the default answer if all conditions are not fulfilled', function () {
      let context = {
        farm: '111',
        option: 'c'
      }
      const overrides = {}
      let answer

      this.sandbox.stub(Condition, 'evaluate').returns(false)

      answer = Evaluator.evaluate(this.entry, context, overrides)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.be.true
    })

    it('returns the `except` answer if all conditions are fulfilled', function () {
      const context = {
        farm: '111',
        option: 'b'
      }
      const overrides = {}
      let answer

      this.sandbox.stub(Condition, 'evaluate').returns(true)

      answer = Evaluator.evaluate(this.entry, context, overrides)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.be.false
    })
  })

  describe('field existence', function () {
    beforeEach(function () {
      this.settingName = 'testSetting'
      this.entry = {
        setting: this.settingName,
        value: true,
        except: [
          {
            value: false,
            options: ['a', 'b']
          }
        ]
      }
    })

    it('returns the default answer if the context does not contain the value for a condition', function () {
      const context = {}
      const overrides = {}
      let answer

      this.sandbox.stub(Condition, 'evaluate').returns(false)

      answer = Evaluator.evaluate(this.entry, context, overrides)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.be.true
    })

    it('returns the default answer if the except block is undefined', function () {
      const context = {}
      const overrides = {}
      let answer

      delete this.entry.except

      this.sandbox.stub(Condition, 'evaluate').returns(true)

      answer = Evaluator.evaluate(this.entry, context, overrides)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.be.true
    })
  })

  describe('answers', function () {
    it('returns `value` when setting is passed', function () {
      const settingName = 'testSetting'
      const settingEntry = {
        setting: settingName,
        value: 'default',
        except: [
          {
            value: 'testSetting',
            // this normally wouldn't exist, but just to make sure that our program
            // picks the right one, we'll do this
            enabled: false,
            option: ['a', 'b']
          }
        ]
      }
      const context = {
        option: 'b'
      }
      const overrides = {}
      let answer

      this.sandbox.stub(Condition, 'evaluate').returns(true)

      answer = Evaluator.evaluate(settingEntry, context, overrides)

      expect(answer.key).to.equal(settingName)
      expect(answer.value).to.equal('testSetting')
    })
  })

  describe('percentage', function () {
    beforeEach(function () {
      this.settingName = 'testSetting'
      this.settingEntry = {
        setting: this.settingName,
        value: 'default',
        except: [
          {
            value: 'testSetting',
            percentage: 20
          }
        ]
      }
    })

    it('passes a string seed and calls the range condition with the correct values', function () {
      const context = {
        percentageSeed: '87625364383'
      }
      const answer = Evaluator.evaluate(this.settingEntry, context)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.equal('testSetting')
    })

    it('passes a number seed and calls the range condition with the correct values', function () {
      const context = {
        percentageSeed: 87625364383
      }
      const answer = Evaluator.evaluate(this.settingEntry, context)

      expect(answer.key).to.equal(this.settingName)
      expect(answer.value).to.equal('testSetting')
    })

    it('throws an error if percentageSeed is not set in the context', function () {
      let _this = this
      let conditionStub = this.sandbox.stub(Condition, 'evaluate').returns(true)

      expect(function () {
        Evaluator.evaluate(_this.settingEntry, {})
      }).to.throw(/The property `percentageSeed` must be set in the/)
      expect(conditionStub.calledOnce).to.be.false
    })
  })

  describe('random percentage', function () {
    it('calls the range condition with the correct values', function () {
      const settingName = 'testSetting'
      const settingEntry = {
        setting: settingName,
        value: 'default',
        except: [
          {
            value: 'testSetting',
            randomPercentage: 20
          }
        ]
      }
      let answer

      this.sandbox.stub(Math, 'random').returns(0.19)
      answer = Evaluator.evaluate(settingEntry, {})
      expect(answer.key).to.equal(settingName)
      expect(answer.value).to.equal('testSetting')
    })
  })
})
