/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { CerebroConfig } from '../cerebro-config'
import { expect } from "chai";

describe('typescript', function () {
  describe('CerebroConfig', function () {
    const config = {
      a: 1,
      b: '2',
      c: {
        d:3
      },
      e: true
    }

    const conf = new CerebroConfig({
      answers: config,
      labels: {},
      labelResolved: {}
    })

    const a: number = conf.getRawValue('a');
    const b: string = conf.getValue('b');
    const c: Record<string, any> = conf.getValue('c');
    const e: boolean = conf.isEnabled('e');

    expect(a).to.be.equal(1);
    expect(b).to.be.equal('2');
    expect(c).to.be.deep.equal({d: 3});
    expect(e).to.be.true;
  })
})
