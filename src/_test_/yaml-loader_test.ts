/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { loadStaticConfig, getDynamicConfigBuilder } from '../yaml-loader'
import { join } from 'path'
import { expect } from 'chai'

describe('./yaml-loader.ts', function () {
  describe('load static config', function () {
    it('should load a yaml file and resolve the config', () => {
      const config = loadStaticConfig(
        join(__dirname, '..', '..', 'example.yaml'),
        {
          environment: 'alpha'
        }
      )

      expect(config.getRawConfig()).to.eql({
        username: 'my-username',
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

    it('should load a yaml file and resolve the config with overrides', () => {
      const config = loadStaticConfig(
        join(__dirname, '..', '..', 'example.yaml'),
        {
          environment: 'alpha'
        },
        {
          password: 'blah'
        }
      )

      expect(config.getRawConfig().password).to.equal('blah')
    })
  })

  describe('build dynamic config', function () {
    it('should load a yaml file and return a config builder', () => {
      const configBuilder = getDynamicConfigBuilder(
        join(__dirname, '..', '..', 'example.yaml')
      )

      const config = configBuilder({
        environment: 'alpha',
        userBirthdayYear: 2001
      })

      expect(config.getRawConfig()).to.eql({
        username: 'my-username',
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
        is_your_birthday_inc: true,
        is_your_birthday_exc: true,
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
