/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */
import {
  ICerebroConfig,
  ICerebroConfigEntry,
  ICerebroConfigOptions,
  ICerebroContext,
  ICerebroOptions
} from './interfaces'

import { Evaluator } from './evaluator'
import { CerebroConfig } from './cerebro-config'

/**
 * @param {Array} config - array containing setting entries
 * @param {Object} [Optional] options Object containing customEvaluators
 *      @param {Object} customEvaluators object containing the custom evaluation methods
 */
export class Cerebro {
  _config: any
  _customEvaluators: any

  constructor (config: ICerebroConfigEntry[], options?: ICerebroOptions) {
    if (!config) {
      throw new Error('`config` is required')
    }

    this._config = this._preprocess(config)
    this._customEvaluators = options && options.customEvaluators

    this._validateCustomEvaluators()
  }

  /**
   * Builds a config based on provided context
   * @param  {Object} context
   * @param  {Object} [options]
   * @param  {Object} [options.overrides] - contains the list of overrides {setting: 'value'}
   * @return {CerebroConfig}
   */
  resolveConfig (
    context: ICerebroContext,
    options?: ICerebroConfigOptions
  ): ICerebroConfig {
    if (!context) {
      throw new Error('`context` is required')
    }

    options = options || {}

    return new CerebroConfig(this._build(context, options.overrides))
  }

  /**
   * Parses the dehydrated object for use on the client.
   * Intended to be used on the client.
   * The input of this function is expected to be the output of dehydrate().
   *
   * @param {JSON} dehydratedObject The output of #dehydrate()
   * @return {CerebroConfig} A usable instance of CerebroConfig
   */
  static rehydrate (dehydratedObject): ICerebroConfig {
    // if the dehydratedObject is not valid, JSON parse will fail and throw an error
    const rehydratedObj = JSON.parse(dehydratedObject)

    const { _resolved, _labels } = rehydratedObj
    const builtObject = {
      answers: _resolved,
      labels: _labels
    }

    return new CerebroConfig(builtObject)
  }

  private _preprocess (config) {
    // should maybe deep copy the config?
    return config.map(function (c) {
      return Evaluator.prepareEntry(c)
    })
  }

  private _build (context, overrides) {
    const answers = {}
    const labels = {}
    let answer

    this._config.forEach(function (entry) {
      answer = Evaluator.evaluate(
        entry,
        context,
        overrides,
        answers,
        this._customEvaluators
      )

      if (answer.key) {
        if (!answers.hasOwnProperty(answer.key)) {
          answers[answer.key] = answer.value
          labels[answer.key] = entry.labels || []
        }
      }
    }, this)

    return {
      answers,
      labels
    }
  }

  /**
   * Verifies that custom evalutors are functions and come wrapped in an object.
   * Throws an error if the custom evaluator is not in the right format.
   *
   * @private
   * @param {Object} customEvaluators The object to be evaluated
   */
  _validateCustomEvaluators () {
    const customEvaluators = this._customEvaluators
    let key

    // since customEvaluators is optional, do nothing if it is null or undefined
    if (customEvaluators === null || typeof customEvaluators === 'undefined') {
      return
    }

    // check if customEvaluators is an object or not
    if (customEvaluators !== Object(customEvaluators)) {
      throw new TypeError(
        "customEvaluators should be an object, instead it's a " +
          typeof customEvaluators
      )
    }

    // make sure that each property in customEvaluators contains a function
    for (key in customEvaluators) {
      if (customEvaluators.hasOwnProperty(key)) {
        if (typeof customEvaluators[key] !== 'function') {
          throw new TypeError(
            'Property ' + key + ' is not a function in customEvaluators'
          )
        }
      }
    }
  }
}
