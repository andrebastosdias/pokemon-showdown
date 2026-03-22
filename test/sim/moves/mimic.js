'use strict';

const assert = require('../../assert');
const common = require('../../common');

let battle;

describe('Mimic', () => {
	afterEach(() => battle.destroy());

	describe('[Gen 2]', () => {
		it(`should mimic moves called by other moves`, () => {
			battle = common.gen(2).createBattle([
				[{ species: "Terrakion", moves: ['metronome', 'transform'] }],
				[{ species: "Entei", moves: ['mimic', 'mimic'] }],
			]);
			battle.makeChoices();
			assert(!['mimic', 'transform'].includes(battle.p2.active[0].moves[0]));
			battle.makeChoices('move transform', 'move mimic');
			assert.equal(battle.p2.active[0].moves[1], 'mimic');
		});
	});
});
