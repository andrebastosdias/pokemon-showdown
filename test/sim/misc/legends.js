'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

const options = {formatid: 'gen8legendsag'};

function existenceFunction(species) {
	assert.equal(
		species.exists && (!species.isNonstandard || ["Gigantamax", "Cap"].includes(species.isNonstandard)),
		species.exists && !species.isNonstandard && !species.tier !== 'Illegal',
		species.name
	);
	return species.exists && !species.isNonstandard && !species.tier !== 'Illegal';
}

function createBattle(options, teams, mods = []) {
	battle = common.createBattle(options, teams);
	if (!Array.isArray(mods)) mods = [mods];
	battle.onEvent('ModifyMove', battle.format, function (move) {
		move.accuracy = true;
		move.willCrit = false;
		for (const mod of mods) {
			switch (mod) {
			case 'miss': move.accuracy = 0; break;
			case 'nodamage': move.basePower = 0; break;
			case 'secondaries':
				if (move.secondaries) {
					move.secondaries.forEach(secondary => { secondary.chance = 100; });
				}
				break;
			}
		}
	});
	return battle;
}

describe('[Gen 8 Legends] Dex data', function () {
	const dex = Dex.mod('gen8legends');

	function countPokemon(dex) {
		const count = {species: 0, formes: 0};
		for (const pkmn of dex.species.all()) {
			if (!existenceFunction(pkmn)) continue;
			if (pkmn.name !== pkmn.baseSpecies) {
				count.formes++;
			} else {
				count.species++;
			}
		}

		return count;
	}

	// Sneasel (1) - Hisui (16) - Basculin (1)
	const species = 242 + 1 - (16 + 1);
	// Vulpix (1) + Ninetales (1) + Wormadam (2) + Cherrim (1) + Rotom (5) +
	// Origin (3) + Arceus (18) + Shaymin (1) + Therian (4) +
	// Hisui (16) + Basculin (1) + Basculegion (1)
	const formes = 1 + 1 + 2 + 1 + 5 + 3 + 18 + 1 + 4 + 16 + 1 + 1;

	it(`should have ${species} species and ${formes} formes`, () => {
		const count = countPokemon(dex);
		assert.equal(count.species, species);
		assert.equal(count.formes, formes);
	});

	const moves = 177;

	it(`should have ${moves} moves`, function () {
		const count = dex.moves.all().filter((s) => s.exists && !s.isNonstandard).length;
		assert.equal(count, moves);
	});

	it(`should have valid Pokedex entries`, function () {
		for (const species of dex.species.all()) {
			if (!existenceFunction(species)) continue;
			if (species.gen) {
				assert(species.gen <= dex.gen, `${species.name} is from gen ${species.gen}`);
			}
			if (species.prevo) {
				const prevo = dex.species.get(species.prevo);
				assert(existenceFunction(prevo), `${species.name} has ${prevo.name} listed as an prevo`);
			}
			if (species.evos && species.evos.length) {
				for (const evoId of species.evos) {
					const evo = dex.species.get(evoId);
					assert(existenceFunction(evo), `${species.name} has ${evo.name} listed as an evo`);
				}
				assert(species.nfe, `${species.name} with ${species.evos} listed as evos, is not a NFE`);
			} else {
				assert(!species.nfe, `${species.name} with no evos, is a NFE`);
			}
			if (species.battleOnly) {
				const battleOnly = Array.isArray(species.battleOnly) ? species.battleOnly : [species.battleOnly];
				for (const battleForme of battleOnly) {
					const battleEntry = dex.species.get(battleForme);
					assert(existenceFunction(battleEntry), `${species.name} has ${battleEntry.name} listed as a battle only form`);
				}
			}
			if (species.changesFrom) {
				const formeEntry = dex.species.get(species.changesFrom);
				assert(existenceFunction(species), `${species.name} has ${formeEntry.name} listed as a changes from form`);
			}
		}
	});

	it(`should have valid Move entries`, function () {
		for (const move of dex.moves.all()) {
			if (!move.exists || move.isNonstandard) continue;
			assert(
				(move.id === 'struggle' && move.target === 'randomNormal') || ['any', 'self'].includes(move.target),
				`${move.name} has an invalid target: ${move.target}`
			);
			if (move.multihit) {
				assert.equal(move.multihit, 1, `${move.name} has an invalid multihit value: ${move.multihit}`);
			}
		}
	});
});

describe('[Gen 8 Legends] Team Validator', function () {
	const formatID = 'gen8legendsag';

	it('should change abilities to correct ones', function () {
		const team = [
			{species: 'cherrim', ability: 'honeygather', moves: ['rest']},
			{species: 'regigigas', ability: 'honeygather', moves: ['rest']},
			{species: 'magikarp', ability: 'honeygather', moves: ['splash']},
			{species: 'cherrim', moves: ['rest']},
			{species: 'regigigas', moves: ['rest']},
			{species: 'magikarp', moves: ['splash']},
		];
		assert.legalTeam(team, formatID);
		assert.equal(team[0].ability, 'Flower Gift');
		assert.equal(team[1].ability, 'Slow Start');
		assert.equal(team[2].ability, 'No Ability');
		assert.equal(team[3].ability, 'Flower Gift');
		assert.equal(team[4].ability, 'Slow Start');
		assert.equal(team[5].ability, 'No Ability');
	});

	it('should remove items', function () {
		const team = [
			{species: 'magikarp', item: 'choiceband', moves: ['splash']},
		];
		assert.legalTeam(team, formatID);
		assert.equal(team[0].item, '');
	});

	it('should clear EVs', function () {
		const team = [
			{species: 'magikarp', evs: {hp: 252, atk: 252, def: 252, spa: 252, spd: 252, spe: 252}, moves: ['splash']},
		];
		assert.legalTeam(team, formatID);
		assert.deepEqual(team[0].evs, {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0});
	});
});

describe('[Gen 8 Legends] Choice parser', function () {
	it('should reject `shift` requests', function () {
		battle = createBattle({formatid: 'gen8legendstriples'});
		battle.setPlayer('p1', {team: [
			{species: "Burmy", moves: ['strugglebug']},
			{species: "Geodude", moves: ['tackle']},
			{species: "Gastly", moves: ['astonish']},
			{species: "Phione", moves: ['bubble']},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Burmy", moves: ['strugglebug']},
			{species: "Geodude", moves: ['tackle']},
			{species: "Gastly", moves: ['astonish']},
		]});

		const validChoices = ['move 1 1', 'switch 4'];

		for (const action of validChoices) {
			const choiceString = `${action}, move 1 1, move 1 1`;
			assert(battle.choose('p1', choiceString), `Choice '${choiceString}' should be valid`);
			battle.p1.clearChoice();
		}

		const badChoices = ['pass', 'shift'];
		for (const badChoice of badChoices) {
			const choiceString = `${badChoice}, move 1 1, move 1 1`;
			assert.throws(() => battle.choose('p1', choiceString));
		}
	});
});

describe('[Gen 8 Legends] Arceus', function () {
	it(`in untyped forme should be Normal-typed`, function () {
		battle = createBattle(options, [
			[{species: 'Arceus', moves: ['rest']}],
			[{species: 'Magikarp', moves: ['splash']}],
		]);
		assert(battle.p1.pokemon[0].hasType('Normal'));
	});

	it(`in typed forme should change its type to match the forme`, function () {
		battle = createBattle(options, [
			[{species: 'Arceus-Fire', moves: ['rest']}],
			[{species: 'Magikarp', moves: ['splash']}],
		]);
		assert(battle.p1.active[0].hasType('Fire'));
	});

	it(`should be Normal-typed if it is Arceus-Legend`, function () {
		battle = createBattle(options, [
			[{species: 'Arceus-Legend', moves: ['rest']}],
			[{species: 'Magikarp', moves: ['splash']}],
		]);
		assert(battle.p1.active[0].hasType('Normal'));
	});
});

describe('[Gen 8 Legends] Moves', function () {
	describe('Judgment', function () {
		it(`should adapt its type to the Arceus type`, function () {
			battle = createBattle(options, [
				[{species: "Arceus-Ghost", moves: ['judgment']}],
				[{species: "Spiritomb", moves: ['calmmind']}],
			]);
			assert.hurts(battle.p2.active[0], () => battle.makeChoices());
		});

		it(`should adapt its type and Arceus-Legend's type to be super effective against the opponent's type`, function () {
			battle = createBattle(options, [
				[{species: "Arceus-Legend", moves: ['judgment']}],
				[
					{species: "Palkia", moves: ['bulkup']},
					{species: "Giratina", moves: ['calmmind']},
				],
			]);
			const arceus = battle.p1.active[0];
			assert(arceus.hasType('Normal'));

			battle.makeChoices();
			assert.species(arceus, 'Arceus-Dragon');
			assert(arceus.hasType('Dragon'));

			battle.makeChoices('move judgment', 'switch giratina');
			assert.species(arceus, 'Arceus-Dark');
			assert(arceus.hasType('Dark'));
		});

		it(`should adapt its type and Arceus-Legend's type if the move misses`, function () {
			battle = createBattle(options, [
				[{species: "Arceus-Legend", moves: ['judgment']}],
				[{species: "Magikarp", moves: ['splash']}],
			], 'miss');
			const arceus = battle.p1.active[0];
			const magikarp = battle.p2.active[0];

			assert(arceus.hasType('Normal'));
			battle.makeChoices();
			assert.equal(magikarp.hp, magikarp.maxhp);
			assert.species(arceus, 'Arceus-Grass');
			assert(arceus.hasType('Grass'));
		});
	});

	describe('Hidden Power', function () {
		it(`should adapt its type to be super effective against the opponent's type`, function () {
			battle = createBattle(options, [
				[{species: "unown", moves: ['hiddenpower']}],
				[{species: "spiritomb", moves: ['calmmind']}],
			]);
			assert.hurts(battle.p2.active[0], () => battle.makeChoices());
		});
	});
});

describe('[Gen 8 Legends] Abilities', function () {
	describe(`Slow Start`, function () {
		// a bit redundant, but it's a good test to have
		it(`should delay activation on switch-in`, function () {
			battle = createBattle([[
				{species: 'Cyndaquil', moves: ['rest']},
				{species: 'Regigigas', ability: 'slowstart', moves: ['rest']},
			], [
				{species: 'Rowlet', moves: ['rest']},
			]]);
			battle.makeChoices('switch 2', 'auto');
			for (let i = 0; i < 4; i++) { battle.makeChoices(); }
			let log = battle.getDebugLog();
			let slowStartEnd = log.indexOf('|-end|p1a: Regigigas|Slow Start');
			assert.false(slowStartEnd > -1, 'Slow Start should remain in effect after 4 active turns.');

			battle.makeChoices();
			log = battle.getDebugLog();
			slowStartEnd = log.indexOf('|-end|p1a: Regigigas|Slow Start');
			assert(slowStartEnd > -1, 'Slow Start should not be in effect after 5 active turns.');
		});
	});

	describe(`Flower Gift`, function () {
		it(`should trigger without a weather condition`, function () {
			battle = createBattle(options, [
				[{species: "Cherrim", ability: 'flowergift', moves: ['tackle']}],
				[{species: "Magikarp", moves: ['splash']}],
			]);
			assert.species(battle.p1.active[0], 'Cherrim-Sunshine');
			assert(battle.log.some(line => line.startsWith('|-formechange')));
		});

		it(`should not boost Attack and Special Defense stats`, function () {
			battle = createBattle(options, [
				[{species: "Cherrim", ability: 'flowergift', moves: ['tackle']}],
				[{species: "Magikarp", moves: ['splash']}],
			]);
			const cherrim = battle.p1.active[0];
			assert.equal(cherrim.getStat('atk'), 315);
			assert.equal(cherrim.getStat('spd'), 382);
		});
	});
});

describe('[Gen 8 Legends] stats', function () {
	it(`are correctly calculated (IVs larger than 10 should be treated as 10)`, function () {
		battle = createBattle(options, [
			[{
				species: "gliscor", moves: ['poisonsting'], level: 100, nature: 'adamant',
				ivs: {hp: 6, atk: 31, def: 9, spa: 3, spd: 1, spe: 11},
			}],
			[{
				species: "spiritomb", moves: ['calmmind'], level: 67, nature: 'naive',
			}],
		]);
		const gliscor = battle.p1.active[0];
		assert.equal(gliscor.maxhp, 321);
		assert.equal(gliscor.getStat('atk'), 346);
		assert.equal(gliscor.getStat('def'), 362);
		assert.equal(gliscor.getStat('spa'), 132);
		assert.equal(gliscor.getStat('spd'), 197);
		assert.equal(gliscor.getStat('spe'), 327);

		const spiritomb = battle.p2.active[0];
		assert.equal(spiritomb.maxhp, 248);
		assert.equal(spiritomb.getStat('atk'), 266);
		assert.equal(spiritomb.getStat('def'), 299);
		assert.equal(spiritomb.getStat('spa'), 266);
		assert.equal(spiritomb.getStat('spd'), 282);
		assert.equal(spiritomb.getStat('spe'), 145);
	});
});

describe('[Gen 8 Legends] residuals', function () {
	it('should not trigger if the Pokemon did not move', function () {
		battle = createBattle(options, [
			[{species: 'Heatran', moves: ['magmastorm']}],
			[
				{species: 'Arceus', moves: ['recover']},
				{species: 'Magikarp', moves: ['splash']},
			],
		], 'nodamage');
		battle.makeChoices('move magmastorm', 'switch 2');
		const magikarp = battle.p2.active[0];
		assert.equal(magikarp.hp, magikarp.maxhp);
		assert.equal(magikarp.status, 'brn');
	});

	it('should trigger in the turn they end', function () {
		battle = createBattle(options, [
			[{species: 'Heatran', moves: ['irondefense', 'magmastorm']}],
			[{species: 'Magikarp', moves: ['splash']}],
		], 'nodamage');
		const magikarp = battle.p2.active[0];
		// 3 turns of burn damage
		assert.hurts(magikarp, () => battle.makeChoices('move magmastorm', 'move splash'));
		assert.equal(magikarp.status, 'brn');
		assert.hurts(magikarp, () => battle.makeChoices());
		assert.equal(magikarp.status, 'brn');
		assert.hurts(magikarp, () => battle.makeChoices());
		assert.equal(magikarp.status, '');
		// Make sure the message is sent
		assert(battle.log.some(line => line.startsWith('|-curestatus') && line.endsWith('|[msg]')));
	});
});

describe('[Gen 8 Legends] statuses', function () {
	it('should overwrite old statuses', function () {
		battle = createBattle(options, [
			[{species: 'Tangrowth', moves: ['sleeppowder', 'stunspore', 'poisonpowder']}],
			[{species: 'Magikarp', moves: ['splash']}],
		]);
		const magikarp = battle.p2.active[0];
		battle.makeChoices('move sleeppowder', 'move splash');
		assert.equal(magikarp.status, 'slp');
		battle.makeChoices('move stunspore', 'move splash');
		assert.equal(magikarp.status, 'par');
		battle.makeChoices('move poisonpowder', 'move splash');
		assert.equal(magikarp.status, 'psn');
	});

	it('should reset their duration upon reapplication', function () {
		battle = createBattle(options, [
			[{species: 'Raichu', moves: ['calmmind', 'thunderwave']}],
			[{species: 'Magikarp', moves: ['splash']}],
		]);
		const magikarp = battle.p2.active[0];
		battle.makeChoices('move thunderwave', 'move splash');
		assert.equal(magikarp.status, 'par');
		assert.equal(magikarp.statusState.duration, 4);
		battle.makeChoices();
		assert.equal(magikarp.status, 'par');
		assert.equal(magikarp.statusState.duration, 3);
		battle.makeChoices('move thunderwave', 'move splash');
		assert.equal(magikarp.status, 'par');
		assert.equal(magikarp.statusState.duration, 4);
	});

	describe('Burn', function () {
		it('should inflict 1/12 of max HP at the end of the turn, rounded down', function () {
			battle = createBattle(options, [
				[{species: 'Heatran', moves: ['magmastorm']}],
				[{species: 'Magikarp', moves: ['splash']}],
			], 'nodamage');
			const target = battle.p2.active[0];
			assert.hurtsBy(target, Math.floor(target.maxhp / 12), () => battle.makeChoices());
		});

		it(`should halve damage from Physical attacks`, function () {
			battle = createBattle(options, [
				[{species: 'Avalugg-Hisui', moves: ['iceshard']}],
				[{species: 'Heatran', moves: ['magmastorm']}],
			]);
			battle.makeChoices();
			const heatran = battle.p2.active[0];
			const damage = heatran.maxhp - heatran.hp;
			assert.bounded(damage, [8, 9]);
		});
	});

	describe('Poison', function () {
		it('should inflict 1/6 of max HP at the end of the turn, rounded down', function () {
			battle = createBattle(options, [
				[{species: 'Machamp', moves: ['bulkup']}],
				[{species: 'Gengar', moves: ['poisongas']}],
			]);
			const target = battle.p1.active[0];
			assert.hurtsBy(target, Math.floor(target.maxhp / 6), () => battle.makeChoices());
		});
	});

	describe('Frostbite', function () {
		it('should inflict 1/12 of max HP at the end of the turn, rounded down', function () {
			battle = createBattle(options, [
				[{species: 'Darkrai', moves: ['icebeam']}],
				[{species: 'Heatran', moves: ['irondefense']}],
			], ['nodamage', 'secondaries']);
			const target = battle.p2.active[0];
			assert.hurtsBy(target, Math.floor(target.maxhp / 12), () => battle.makeChoices());
		});

		it(`should halve damage from Special attacks`, function () {
			battle = createBattle(options, [
				[{species: 'Probopass', moves: ['thunderbolt']}],
				[{species: 'Mantine', moves: ['icebeam']}],
			], 'secondaries');
			battle.makeChoices();
			const mantine = battle.p2.active[0];
			const damage = mantine.maxhp - mantine.hp;
			assert.bounded(damage, [63, 76]);
		});
	});

	describe('Drowsy', function () {
		it(`should increase damage taken from attacks by 33%`, function () {
			battle = createBattle(options, [
				[{species: 'Darkrai', moves: ['rest']}],
				[{species: 'Gengar', moves: ['shadowball']}],
			]);
			const darkrai = battle.p1.active[0];
			darkrai.damage(1);
			battle.makeChoices();
			const damage = darkrai.maxhp - darkrai.hp;
			assert.bounded(damage, [61, 73]);
		});

		describe('should end if hit by', () => {
			for (const move of ['Spark', 'Volt Tackle', 'Wild Charge']) {
				it(`${move}`, function () {
					battle = createBattle(options, [
						[{species: 'Darkrai', moves: ['calmmind', 'darkvoid']}],
						[{species: 'Raichu', moves: ['calmmind', move]}],
					]);
					const raichu = battle.p2.active[0];
					battle.makeChoices('move darkvoid', 'move calmmind');
					assert.equal(raichu.status, 'slp');
					battle.makeChoices('move calmmind', 'move 2');
					assert.equal(raichu.status, '');
				});
			}
		});
	});
});

describe('[Gen 8 Legends] volatile statuses', function () {
	it('should reset their duration upon reapplication', function () {
		battle = createBattle(options, [
			[{species: 'Kleavor', moves: ['calmmind', 'stoneaxe']}],
			[{species: 'Arceus', moves: ['calmmind']}],
		]);
		const magikarp = battle.p2.active[0];
		battle.makeChoices('move stoneaxe', 'move calmmind');
		assert.equal(magikarp.volatiles['splinters'].duration, 2);
		battle.makeChoices();
		assert.equal(magikarp.volatiles['splinters'].duration, 1);
		battle.makeChoices('move stoneaxe', 'move calmmind');
		assert.equal(magikarp.volatiles['splinters'].duration, 2);
	});

	describe('focus energy', function () {});

	describe('fixated', function () {
		it(`should increase damage by the same move by 50%`, function () {
			battle = createBattle(options, [
				[{species: 'Garchomp', moves: ['outrage']}],
				[{species: 'Arceus', moves: ['quickattack']}],
			]);
			const target = battle.p2.active[0];
			let hp = target.hp;
			battle.makeChoices();
			assert.bounded(hp - target.hp, [86, 103]);
			hp = target.hp;
			battle.makeChoices();
			assert.bounded(hp - target.hp, [129, 154]);
		});

		it('should not increase damage from other moves', function () {
			battle = createBattle(options, [
				[{species: 'Garchomp', moves: ['outrage', 'ragingfury']}],
				[{species: 'Arceus', moves: ['quickattack']}],
			]);
			const target = battle.p2.active[0];
			let hp = target.hp;
			battle.makeChoices();
			assert.bounded(hp - target.hp, [86, 103]);
			hp = target.hp;
			battle.makeChoices('move ragingfury', 'move quickattack');
			assert.bounded(hp - target.hp, [69, 82]);
			hp = target.hp;
			battle.makeChoices('move ragingfury', 'move quickattack');
			assert.bounded(hp - target.hp, [103, 123]);
		});

		it(`should increase damage taken from attacks by 33%`, function () {
			battle = createBattle(options, [
				[{species: 'Garchomp', moves: ['outrage']}],
				[{species: 'Arceus', moves: ['judgment']}],
			]);
			const target = battle.p1.active[0];
			let hp = target.hp;
			battle.makeChoices();
			assert.bounded(hp - target.hp, [120, 141]);
			hp = target.hp;
			battle.makeChoices();
			assert.bounded(hp - target.hp, [159, 187]);
		});
	});

	describe('splinters', function () {
		it(`damage should ignore statuses and volatiles`, function () {
			battle = createBattle(options, [
				[{species: 'Graveler', moves: ['stealthrock'], level: 34, ivs: {atk: 0}}],
				[{species: 'Arceus', moves: ['judgment'], level: 75, ivs: {hp: 0, def: 3}}],
			], 'nodamage');
			const graveler = battle.p1.active[0];
			graveler.status = 'brn';
			graveler.volatiles['fixated'] = {};
			graveler.volatiles['primed'] = {};
			graveler.volatiles['powerboost'] = {};

			const arceus = battle.p2.active[0];
			arceus.status = 'slp';
			arceus.volatiles['fixated'] = {};
			arceus.volatiles['guarddrop'] = {};

			assert.hurtsBy(arceus, 12, () => battle.makeChoices());
		});

		it(`damage should change if Arceus-Legend's type changes`, function () {
			battle = createBattle(options, [
				[{species: 'Kleavor', moves: ['stealthrock', 'calmmind']}],
				[{species: 'Arceus-Legend', moves: ['judgment', 'calmmind']}],
			], 'nodamage');
			const arceus = battle.p2.active[0];
			assert.hurtsBy(arceus, 23, () => battle.makeChoices('move stealthrock', 'move calmmind'));
			assert.hurtsBy(arceus, 11, () => battle.makeChoices('move calmmind', 'move judgment'));
			assert.species(arceus, 'Arceus-Steel');
		});
	});

	describe('obscured', function () {});

	describe('primed', function () {
		it(`should increase damage by 50%`, function () {
			battle = createBattle(options, [
				[{species: 'Ambipom', moves: ['doublehit', 'swift']}],
				[{species: 'Arceus', moves: ['quickattack']}],
			]);
			battle.makeChoices();
			battle.makeChoices('move swift', 'move quickattack');
			const arceus = battle.p2.active[0];
			const damage = arceus.maxhp - arceus.hp;
			assert.bounded(damage, [79, 94]);
		});
	});

	describe('stanceswap', function () {
		it('should not reswap if the user uses Power Shift again', function () {
			battle = createBattle(options, [
				[{species: 'Avalugg-Hisui', moves: ['powershift']}],
				[{species: 'Magikarp', moves: ['splash']}],
			]);
			const avalugg = battle.p1.active[0];
			assert.equal(avalugg.getStat('atk'), 407);
			assert.equal(avalugg.getStat('def'), 544);
			assert.equal(avalugg.getStat('spa'), 166);
			assert.equal(avalugg.getStat('spd'), 172);

			battle.makeChoices();
			assert.equal(avalugg.getStat('atk'), 544);
			assert.equal(avalugg.getStat('def'), 407);
			assert.equal(avalugg.getStat('spa'), 172);
			assert.equal(avalugg.getStat('spd'), 166);

			battle.makeChoices();
			assert.equal(avalugg.getStat('atk'), 544);
			assert.equal(avalugg.getStat('def'), 407);
			assert.equal(avalugg.getStat('spa'), 172);
			assert.equal(avalugg.getStat('spd'), 166);
		});
	});
});
