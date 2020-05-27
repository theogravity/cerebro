/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { getOverridesFromEnv } from '../env-loader'
const expect = require('chai').expect

const yamlData = require('./fixtures/yaml-data.json')

after(function () {
  // reset the username
  process.env.username = 'test'
})

describe('./env-loader.ts', function () {
  describe('environment variable overrides', function () {
    it('does not set an override for an undefined yaml key', function () {
      process.env.not_in_yaml = 'test'

      const overrides = getOverridesFromEnv(yamlData)
      expect(overrides.not_in_yaml).to.equal(undefined)
    })

    it('sets an override for an defined yaml key', function () {
      process.env.username = 'test'

      const overrides = getOverridesFromEnv(yamlData)
      expect(overrides.username).to.equal('test')
    })

    it('handles arrays', function () {
      process.env.username = '["test", "test2"]'

      const overrides = getOverridesFromEnv(yamlData)
      expect(overrides.username[1]).to.equal('test2')
    })

    it('handles objects', function () {
      process.env.username = '{ "test": "object" }'

      const overrides = getOverridesFromEnv(yamlData)
      expect(overrides.username.test).to.equal('object')
    })
  })
})
