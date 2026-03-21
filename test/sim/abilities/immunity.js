'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Immunity', () => {
	afterEach(() => {
		battle.destroy();
	});

	describe('[Gen 3]', () => {
		it.skip(`should be delayed until the next action if the ability was Trace'd after an insta switch`, () => {
			battle = common.gen(3).createBattle([[
				{ species: 'Wynaut', moves: ['toxic'] },
				{ species: 'Snorlax', ability: 'immunity', moves: ['sleeptalk', 'tackle'] },
			], [
				{ species: 'Gardevoir', ability: 'trace', moves: ['sleeptalk'] },
				{ species: 'Zubat', level: 1, moves: ['sleeptalk'] },
			]]);
			const gardevoir = battle.p2.active[0];
			battle.makeChoices();
			assert.equal(gardevoir.status, 'tox');
			battle.makeChoices('switch 2', 'switch 2');
			battle.makeChoices('move tackle', 'move sleeptalk');
			battle.makeChoices();
			assert.equal(gardevoir.status, 'tox');
			battle.makeChoices('move sleeptalk', 'move sleeptalk');
			assert.equal(gardevoir.status, '');
		});
	});
});
