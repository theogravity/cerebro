/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* global describe, it */
/* eslint-disable no-unused-expressions */
import { isTemplate } from '../helpers'

const expect = require('chai').expect

describe('validator helpers', function () {
  describe('#isTemplate', function () {
    // this test ensures that nothing screwy happens with statefulness of regex
    it('always returns the same thing', function () {
      const template = '${var}'
      const nonTemplate = '${var$2}'

      expect(isTemplate(template)).to.equal(true)
      expect(isTemplate(template)).to.equal(true)

      expect(isTemplate(nonTemplate)).to.equal(false)
      expect(isTemplate(nonTemplate)).to.equal(false)
      expect(isTemplate(nonTemplate)).to.equal(false)
    })

    it('accepts only template strings', function () {
      expect(isTemplate('https://${var}.com')).to.equal(true)
      expect(isTemplate('${var}')).to.equal(true)
      expect(isTemplate('${VAr}')).to.equal(true)
      expect(isTemplate('${vA}${vB}')).to.equal(true)

      expect(isTemplate(null)).to.equal(false)
      expect(isTemplate(undefined)).to.equal(false)
      expect(isTemplate({ not: 'string' })).to.equal(false)
      expect(isTemplate('no_vars')).to.equal(false)
      expect(isTemplate('${}')).to.equal(false)
      expect(isTemplate('${v_a}')).to.equal(false)
    })
  })
})
