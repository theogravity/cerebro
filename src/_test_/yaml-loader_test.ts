/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { loadConfig } from '../yaml-loader'
import { join } from 'path'

const expect = require('chai').expect

describe('./yaml-loader.ts', function () {
  describe('load config', function () {
    it('should load a yaml file and resolve the config', () => {
      const config = loadConfig(join(__dirname, '..', '..', 'example.yaml'))
      expect(config.getRawConfig()).to.eql({
        a_number: 1,
        an_array: ['apples', 'oranges'],
        an_object: {
          sampleKey: 1234,
          sampleKey2: 12345.6
        },
        database: 'test-database',
        password: 'my-password',
        username: {
          test: 'object'
        },
        a_null: null
      })
    })
  })
})
