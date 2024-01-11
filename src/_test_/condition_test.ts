/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { Condition } from '../condition'
import { expect } from 'chai'
import './server'

describe('./condition.ts', function () {
  describe('general', function () {
    it('throws an error when an unrecognized condition value is passed in', function () {
      const conditionValue = null
      const contextValue = []

      expect(function () {
        Condition.evaluate(conditionValue, contextValue)
      }).to.throw(/Unknown type of context field/)
    })
  })

  describe('custom evaluator check', function () {
    beforeEach(function () {
      this.customEvaluators = {
        evaluateCondition: function (condition, testValue) {
          if (testValue.indexOf(condition) !== -1) {
            return true
          }

          return false
        }
      }

      this.condition = {
        evaluator: 'evaluateCondition',
        dimensionValue: 'en'
      }
    })

    it('does not identify all objects as custom evaluators', function () {
      const condition = {}
      const testValue = {}

      expect(() => {
        Condition.evaluate(condition, testValue, this.customEvaluators)
      }).to.throw(/Unknown type of context field/)
    })

    it('returns true when the custom evaluator passes', function () {
      const testValue = 'en-us'

      expect(
        Condition.evaluate(this.condition, testValue, this.customEvaluators)
      ).to.be.true
    })

    it('returns false when the custom evaluator does not pass', function () {
      const testValue = 'no'

      expect(
        Condition.evaluate(this.condition, testValue, this.customEvaluators)
      ).to.be.false
    })

    it('returns true when the custom evaluator returns a value that evaluates to true', function () {
      const testValue = 'en-us'

      this.customEvaluators = {
        evaluateCondition: function (condition, tv) {
          if (tv.indexOf(condition) !== -1) {
            return 'asdfasdf'
          }

          return null
        }
      }

      expect(
        Condition.evaluate(this.condition, testValue, this.customEvaluators)
      ).to.be.true
    })

    it('returns false when the custom evaluator returns a value that evaluates to false', function () {
      const testValue = 'no'

      this.customEvaluators = {
        evaluateCondition: function (condition, tv) {
          if (tv.indexOf(condition) !== -1) {
            return 'asdfasdf'
          }

          return null
        }
      }

      expect(
        Condition.evaluate(this.condition, testValue, this.customEvaluators)
      ).to.be.false
    })

    it('returns false when the custom evaluator given does not exist', function () {
      const testValue = 'en-us'

      this.customEvaluators = {}

      expect(
        Condition.evaluate(this.condition, testValue, this.customEvaluators)
      ).to.be.false
    })
  })

  describe('enum check', function () {
    context('single value', function () {
      it('returns true when the value is inside the condition', function () {
        const conditionValue = ['111', '222']
        const contextValue = '222'

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when the value is not inside the condition', function () {
        const conditionValue = ['111', '222']
        const contextValue = '333'

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })
    })

    context('array value', function () {
      it('returns true when the array contains a value that is inside the condition', function () {
        const conditionValue = ['111', '222']
        const contextValue = ['000', '111']

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when the array does not have a value that is inside the condition', function () {
        const conditionValue = ['111', '222']
        const contextValue = ['333', '444']

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })
    })

    context('all', function () {
      it('returns true when the value is defined', function () {
        const conditionValue = ['all']
        const contextValue = '222'

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when the value is undefined', function () {
        const conditionValue = ['all']

        expect(Condition.evaluate(conditionValue, undefined)).to.be.false
      })
    })

    context('none', function () {
      it('returns true when the value is undefined', function () {
        const conditionValue = ['none']

        expect(Condition.evaluate(conditionValue, undefined)).to.be.true
      })

      it('returns false when the value is defined', function () {
        const conditionValue = ['none']
        const contextValue = '222'

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })
    })

    context('range value', function () {
      it('returns true when the value is inside the range', function () {
        const conditionValue = ['1200..1205']
        const contextValue = 1201

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when the value is outside the range', function () {
        const conditionValue = ['1200..1205']
        let contextValue = 1206

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false

        contextValue = 1199
        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })

      it('returns true when the range max value is inclusive', function () {
        const conditionValue = ['1200..1205']
        const contextValue = 1205

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when the range max value is exclusive', function () {
        const conditionValue = ['1200...1205']
        const contextValue = 1205

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })

      it('returns true when there are multiple values and the value is inside the range', function () {
        const conditionValue = [9323, 9326, '1200..1205', 3000]
        let contextValue = 1201

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true

        contextValue = 3000
        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when there are multiple values and the value is outside the range', function () {
        const conditionValue = [9323, 9326, '1200..1205', 3000]
        const contextValue = 3001

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })

      it('returns true when the value is negative and inside the range', function () {
        const conditionValue = ['-1205..-1200']
        const contextValue = -1201

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when the value is negative and inside the range', function () {
        const conditionValue = ['-1205..-1200']
        const contextValue = -1206

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })

      it('returns true when the value is inside the reverse range', function () {
        const conditionValue = ['1205..1200']
        const contextValue = 1201

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns true when the value is negative and inside the reverse range', function () {
        const conditionValue = ['-1200..-1205']
        const contextValue = -1201

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns true when the reverse range min value is inclusive', function () {
        const conditionValue = ['1205..1200']
        const contextValue = 1200

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.true
      })

      it('returns false when the reverse range min value is exclusive', function () {
        const conditionValue = ['1205...1200']
        const contextValue = 1200

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })

      it('returns false when the min and max are the same and the range is exclusive', function () {
        const conditionValue = ['1200...1200']
        const contextValue = 1200

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })

      it('returns false when the context input types is incorrect', function () {
        const conditionValue = ['1205...1200']
        let contextValue: any = [1200]

        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false

        contextValue = ['1199']
        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false

        contextValue = undefined
        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false

        contextValue = null
        expect(Condition.evaluate(conditionValue, contextValue)).to.be.false
      })

      it('throws an exception when the condition input is the wrong type', function () {
        const conditionValue = 1200
        const contextValue = 1200

        expect(function () {
          // @ts-expect-error
          Condition._checkRange(conditionValue, contextValue)
        }).to.throw(/Expected a string type of element for range check: 1200/)
      })

      it('throws an exception when the context input is the wrong type', function () {
        const conditionValue = '1205..1200'
        const contextValue = '1200'

        expect(function () {
          // @ts-expect-error
          Condition._checkRange(conditionValue, contextValue)
        }).to.throw(
          /Expected a numerical type of context value for range check: 120/
        )
      })
    })
  })

  describe('primitives', function () {
    it('compares strings, numbers, and booleans', function () {
      expect(Condition.evaluate(true, true)).to.be.true
      expect(Condition.evaluate(true, false)).to.be.false

      expect(Condition.evaluate('hello', 'hello')).to.be.true
      expect(Condition.evaluate('hello', 'world')).to.be.false

      expect(Condition.evaluate(1, 1)).to.be.true
      expect(Condition.evaluate(1, 2)).to.be.false
    })

    it('does not get called with an object', function () {
      expect(function () {
        Condition.evaluate({}, true)
      }).to.throw(/Unknown type of context field/)
    })

    it('does not get called with an array', function () {
      const primitiveSpy = this.sandbox.spy(Condition, '_checkPrimitive')

      Condition.evaluate([], true)

      expect(primitiveSpy).to.not.be.called
    })
  })
})
