/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */

/* global describe, it, beforeEach */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-template-curly-in-string */

import { validate } from '../index'
import { expect } from 'chai'

describe('template validation', function () {
  beforeEach(function () {
    this.clientSchema = require('./fixtures/settings/client_schema.json')
  })

  it('returns no errors if templates not present', function () {
    const config = [
      {
        setting: 'setting',
        value: 'default',
        except: [
          {
            value: 'other',
            buckets: ['CMUSCVRT1']
          }
        ]
      }
    ]
    const report = validate(this.clientSchema, config)

    expect(report.errors).to.have.length(0)
    expect(report.valid).to.equal(true)
  })

  it('provides no errors on valid template', function () {
    const config = [
      {
        setting: 'setting',
        value: 'default',
        except: [
          {
            value: '${farms}.yahoo.com',
            farms: [1, 2]
          }
        ]
      }
    ]
    const report = validate(this.clientSchema, config)

    expect(report.errors).to.have.length(0)
    expect(report.valid).to.equal(true)
  })

  it('prevents templates from being defined at toplevel', function () {
    const config = [
      {
        setting: 'setting',
        value: 'https://${colo}.yahoo.com'
      }
    ]
    const report = validate(this.clientSchema, config)

    expect(report.errors).to.have.length(1)
    expect(report.valid).to.equal(false)
    expect(report.errors[0].message).to.match(/has template as toplevel value$/)
  })

  it('ensures that template variable has condition restriction', function () {
    const config = [
      {
        setting: 'setting',
        value: 'default',
        except: [
          {
            value: 'yahoo.com/${farms}/launch'
            // The validation should fail because farms: [] not defined here
          }
        ]
      }
    ]
    const report = validate(this.clientSchema, config)

    expect(report.errors).to.have.length(1)
    expect(report.valid).to.equal(false)
    expect(report.errors[0].message).to.match(
      /doesn't have condition on variable$/
    )
  })

  it('restricts templates to one variable', function () {
    const config = [
      {
        setting: 'setting',
        value: 'default',
        except: [
          {
            value: '${farms}/${buckets}',
            farms: [2]
          }
        ]
      }
    ]
    const report = validate(this.clientSchema, config)

    expect(report.errors).to.have.length(1)
    expect(report.valid).to.equal(false)
    expect(report.errors[0].message).to.match(/has more than one variable$/)
  })

  it("doesn't allow usage of reserved keywords", function () {
    const config = [
      {
        setting: 'setting',
        value: 'default',
        except: [
          {
            value: '${value}'
          }
        ]
      }
    ]
    const report = validate(this.clientSchema, config)

    expect(report.errors).to.have.length(1)
    expect(report.valid).to.equal(false)
    expect(report.errors[0].message).to.match(
      /uses reserved keyword as variable$/
    )
  })

  it('shows all errors for a given entry', function () {
    const config = [
      {
        setting: 'setting',
        value: 'bad${template}',
        except: [
          {
            value: '${setting}'
          }
        ]
      }
    ]
    const report = validate(this.clientSchema, config)

    expect(report.errors).to.have.length(3)
    expect(report.valid).to.equal(false)
  })
})
