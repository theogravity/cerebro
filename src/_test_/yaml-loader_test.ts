/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { loadStaticConfig } from '../yaml-loader'
import { join } from 'path'

const expect = require('chai').expect

describe('./yaml-loader.ts', function () {
  describe('load config', function () {
    it('should load a yaml file and resolve the config', () => {
      const config = loadStaticConfig(
        join(__dirname, '..', '..', 'example.yaml'),
        {
          environment: 'alpha'
        }
      )

      expect(config.getRawConfig()).to.eql({
        username: {
          test: 'object'
        },
        password: 'my-password',
        database: 'test-database',
        bucket_test: 100,
        a_number: 1,
        an_array: ['apples', 'oranges'],
        an_object: {
          sampleKey: 1234,
          sampleKey2: 12345.6
        },
        a_null: null,
        noneFlag: false,
        allFlag: true,
        is_your_birthday_inc: false,
        is_your_birthday_exc: false,
        independent: true,
        dependent: true,
        foo: true,
        bar: true,
        andOfFooAndBar: true,
        andOfFooOrBar: true
      })
    })
  })
})
