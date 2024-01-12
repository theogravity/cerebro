/**
 * Copyright 2017 Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in project root for terms.
 */
import type {
  ICerebroConfig,
  ICerebroConfigEntry,
  ICerebroConfigOptions,
  ICerebroContext,
  ICerebroOptions
} from './interfaces'

import { Evaluator } from './evaluator'
import { CerebroConfig } from './cerebro-config'

/**
 * Cerebro is the main class that creates the configuration.
 * It takes a configuration object and returns a CerebroConfig object
 * that represents the settings store.
 *
 * @class Cerebro
 * @constructor
 * @param {Array} config List of configuration objects
 * @param {Object} [options]
 * @param {Object} [options.customEvaluators] - contains the list of custom evaluators {evaluator: function}
 * @param {Object} [options.poller] - contains the poller instance
 */
export class Cerebro<Flags extends Record<string, any> = Record<string, any>> {
  _config: any
  _customEvaluators: any

  constructor (config: ICerebroConfigEntry[], options?: ICerebroOptions) {
    this._config = this._preprocess(config)
    this._customEvaluators = options?.customEvaluators

    this._validateCustomEvaluators()

    const poller = options && options.poller;

    if (poller) {
      poller.on('update', config => {
        this._handleConfigUpdate(config);
      });
      poller.start();
    }
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
    options: ICerebroConfigOptions = {}
  ): ICerebroConfig<Flags> {
    return new CerebroConfig<Flags>(this._build(context, options.overrides))
  }

  /**
   * Parses the dehydrated object for use on the client.
   * Intended to be used on the client.
   * The input of this function is expected to be the output of dehydrate().
   *
   * @param {JSON} dehydratedObject The output of #dehydrate()
   * @return {CerebroConfig} A usable instance of CerebroConfig
   */
  static rehydrate<Flags extends Record<string, any> = Record<string, any>>(dehydratedObject: string): ICerebroConfig {
    // if the dehydratedObject is not valid, JSON parse will fail and throw an error
    const rehydratedObj = JSON.parse(dehydratedObject)

    const { _resolved, _labels, _labelResolved } = rehydratedObj
    const builtObject = {
      answers: _resolved,
      labels: _labels,
      labelResolved: _labelResolved
    }

    return new CerebroConfig<Flags>(builtObject)
  }

  private _handleConfigUpdate (config) {
    this._config = this._preprocess(config);
  }

  private _preprocess (config) {
    // should maybe deep copy the config?
    return config.map(function (c) {
      return Evaluator.prepareEntry(c)
    })
  }

  private _build (context: ICerebroContext, overrides: Record<string, any>) {
    const answers = {}
    const labels: Record<string, string[]> = {}
    const labelResolved = {}

    let answer: { key: string, value: any }

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

          labels[answer.key].forEach(label => {
            if (!labelResolved[label]) {
              labelResolved[label] = {}
            }

            labelResolved[label][answer.key] = answer.value
          })
        }
      }
    }, this)

    return {
      answers,
      labels,
      labelResolved
    }
  }

  /**
   * Verifies that custom evalutors are functions and come wrapped in an object.
   * Throws an error if the custom evaluator is not in the right format.
   *
   * @private
   * @param {Object} customEvaluators The object to be evaluated
   */
  private _validateCustomEvaluators () {
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
