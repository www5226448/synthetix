'use strict';

const { artifacts } = require('@nomiclabs/buidler');
const { smockit } = require('@eth-optimism/smock');
const { toBytes32 } = require('../..');

module.exports = {
	whenMockedToAllowChecks(cb) {
		describe(`when mocked to allow invocation checks`, () => {
			beforeEach(async () => {
				this.mocks.Synthetix.smocked.synthsByAddress.will.return.with(toBytes32());
			});
			cb();
		});
	},
	whenMockedWithExchangeRatesValidity({ valid = true }, cb) {
		describe(`when mocked with valid exchange rates`, () => {
			beforeEach(async () => {
				this.mocks.ExchangeRates.smocked.anyRateIsInvalid.will.return.with(!valid);
			});
			cb();
		});
	},
	whenMockedWithNoPriorExchangesToSettle(cb) {
		describe(`when mocked with no prior exchanges to settle`, () => {
			beforeEach(async () => {
				this.mocks.ExchangeState.smocked.getMaxTimestamp.will.return.with('0');
				this.mocks.ExchangeState.smocked.getLengthOfEntries.will.return.with('0');
			});
			cb();
		});
	},
	whenMockedWithUintSystemSetting({ setting, value }, cb) {
		describe(`when SystemSetting.${setting} is mocked to ${value}`, () => {
			beforeEach(async () => {
				this.mocks.FlexibleStorage.smocked.getUIntValue.will.return.with((contract, record) =>
					contract === toBytes32('SystemSettings') && record === toBytes32(setting) ? value : '0'
				);
			});
			cb();
		});
	},
	whenMockedEffectiveRateAsEqual(cb) {
		describe(`when mocked with exchange rates giving an effective value of 1:1`, () => {
			beforeEach(async () => {
				this.mocks.ExchangeRates.smocked.effectiveValueAndRates.will.return.with(
					(srcKey, amount, destKey) => [amount, (1e18).toString(), (1e18).toString()]
				);
			});
			cb();
		});
	},
	whenMockedLastNRates(cb) {
		describe(`when mocked 1e18 as last n rates`, () => {
			beforeEach(async () => {
				this.mocks.ExchangeRates.smocked.ratesAndUpdatedTimeForCurrencyLastNRounds.will.return.with(
					[[], []]
				);
			});
			cb();
		});
	},
	whenMockedASynthToIssueAmdBurn(cb) {
		describe(`when mocked a synth to burn`, () => {
			beforeEach(async () => {
				// create and share the one synth for all Issuer.synths() calls
				this.synth = await smockit(artifacts.require('ISynth').abi);
				this.synth.smocked.burn.will.return();
				this.synth.smocked.issue.will.return();
				this.mocks.Issuer.smocked.synths.will.return.with(currencyKey => {
					// but when currency
					this.synth.smocked.currencyKey.will.return.with(currencyKey);
					return this.synth.address;
				});
			});
			cb();
		});
	},
	whenMockedExchangeStatePersistance(cb) {
		describe(`when mocking exchange state persistance`, () => {
			beforeEach(async () => {
				this.mocks.ExchangeRates.smocked.getCurrentRoundId.will.return.with('0');
				this.mocks.ExchangeState.smocked.appendExchangeEntry.will.return();
			});
			cb();
		});
	},
};