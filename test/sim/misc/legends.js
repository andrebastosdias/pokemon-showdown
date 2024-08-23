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
			if (move.id === 'struggle') {
				assert.equal(move.target, 'randomNormal');
			} else {
				assert(move.target in ['any', 'self'], `${move.name} has an invalid target ${move.target}`);
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
		];
		assert.legalTeam(team, formatID);
		assert.equal(team[0].ability, 'Flower Gift');
		assert.equal(team[1].ability, 'Slow Start');
		assert.equal(team[2].ability, 'No Ability');
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
		battle = common.createBattle({formatid: 'gen8legendstriples'});
		battle.setPlayer('p1', {team: [
			{species: "Pineco", ability: 'sturdy', moves: ['selfdestruct']},
			{species: "Geodude", ability: 'sturdy', moves: ['selfdestruct']},
			{species: "Gastly", ability: 'levitate', moves: ['lick']},
			{species: "Forretress", ability: 'levitate', moves: ['spikes']},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Skarmory", ability: 'sturdy', moves: ['roost']},
			{species: "Aggron", ability: 'sturdy', moves: ['irondefense']},
			{species: "Golem", ability: 'sturdy', moves: ['defensecurl']},
		]});

		const validChoices = ['move 1', 'switch 4'];

		for (const action of validChoices) {
			const choiceString = `move 1, ${action}, move 1 1`;
			assert(battle.choose('p1', choiceString), `Choice '${choiceString}' should be valid`);
			battle.p1.clearChoice();
		}

		const badChoices = ['pass', 'shift'];
		for (const badChoice of badChoices) {
			const choiceString = `${badChoice}, move 1, move 1 1`;
			assert.throws(() => battle.choose('p1', choiceString));
		}
	});
});

describe('[Gen 8 Legends] Arceus', function () {
	it(`in untyped forme should be Normal-typed`, function () {
		battle = common.createBattle(options, [
			[{species: 'Arceus', ability: 'noability', moves: ['rest']}],
			[{species: 'Magikarp', ability: 'noability', moves: ['splash']}],
		]);
		assert(battle.p1.pokemon[0].hasType('Normal'));
	});

	it(`in typed forme should change its type to match the forme`, function () {
		battle = common.createBattle(options, [
			[{species: 'Arceus-Fire', ability: 'noability', moves: ['rest']}],
			[{species: 'Magikarp', ability: 'noability', moves: ['splash']}],
		]);
		assert(battle.p1.active[0].hasType('Fire'));
	});

	it(`should be Normal-typed if it is Arceus-Legend`, function () {
		battle = common.createBattle(options, [
			[{species: 'Arceus-Legend', ability: 'noability', moves: ['rest']}],
			[{species: 'Magikarp', ability: 'noability', moves: ['splash']}],
		]);
		assert(battle.p1.active[0].hasType('Normal'));
	});
});

describe('[Gen 8 Legends] Judgment', function () {
	it(`should adapt its type to the Arceus type`, function () {
		battle = common.createBattle(options, [
			[{species: "Arceus-Ghost", ability: 'noability', moves: ['judgment']}],
			[{species: "Spiritomb", ability: 'noability', moves: ['calmmind']}],
		]);
		assert.hurts(battle.p2.active[0], () => battle.makeChoices());
	});

	it(`should adapt its type to the opponent's type if used by Arceus-Legend`, function () {
		battle = common.createBattle(options, [
			[{species: "Arceus-Legend", ability: 'noability', moves: ['judgment']}],
			[
				{species: "Palkia", ability: 'noability', moves: ['bulkup']},
				{species: "Giratina", ability: 'noability', moves: ['calmmind']},
			],
		]);
		assert(battle.p1.active[0].hasType('Normal'));

		battle.makeChoices('move judgment', 'move bulkup');
		assert.species(battle.p1.active[0], 'Arceus-Dragon');
		assert(battle.p1.active[0].hasType('Dragon'));

		battle.makeChoices('move judgment', 'switch giratina');
		assert.species(battle.p1.active[0], 'Arceus-Dark');
		assert(battle.p1.active[0].hasType('Dark'));
	});
});

describe('[Gen 8 Legends] Hidden Power', function () {
	it(`should adapt its type to be super effective against the opponent's type`, function () {
		battle = common.createBattle(options, [
			[{species: "unown", ability: 'noability', moves: ['hiddenpower']}],
			[{species: "spiritomb", ability: 'noability', moves: ['calmmind']}],
		]);
		assert.hurts(battle.p2.active[0], () => battle.makeChoices());
	});
});

describe('[Gen 8 Legends] stats', function () {
	it(`are correct (IVs larger than 10 should be treated as 10)`, function () {
		battle = common.createBattle(options, [
			[{
				species: "gliscor", ability: 'noability', moves: ['hiddenpower'], level: 100, nature: 'adamant',
				ivs: {hp: 6, atk: 31, def: 9, spa: 3, spd: 1, spe: 11},
			}],
			[{
				species: "spiritomb", ability: 'noability', moves: ['calmmind'], level: 67, nature: 'naive',
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

describe('[Gen 8 Legends] statuses', function () {
	it('should be able to overwriten by other statuses', function () {
		battle = common.createBattle(options, [
			[{species: 'tangrowth', ability: 'noguard', moves: ['sleeppowder', 'stunspore', 'poisonpowder']}],
			[{species: 'spiritomb', ability: 'noability', moves: ['calmmind']}],
		]);
		battle.makeChoices('move sleeppowder', 'move calmmind');
		assert.equal(battle.p2.active[0].status, 'slp');
		battle.makeChoices('move stunspore', 'move calmmind');
		assert.equal(battle.p2.active[0].status, 'par');
		battle.makeChoices('move poisonpowder', 'move calmmind');
		assert.equal(battle.p2.active[0].status, 'psn');
	});

	describe('Burn', function () {
		it('should inflict 1/12 of max HP at the end of the turn, rounded down', function () {
			battle = common.createBattle(options, [
				[{species: 'Sableye', ability: 'prankster', moves: ['willowisp']}],
				[{species: 'magikarp', ability: 'noguard', moves: ['splash']}],
			]);
			const target = battle.p2.active[0];
			assert.hurtsBy(target, Math.floor(target.maxhp / 12), () => battle.makeChoices());
			assert.equal(target.status, 'brn');
		});

		it(`should halve damage from Physical attacks`, function () {
			battle = common.createBattle(options, [
				[{species: 'Weavile', ability: 'noguard', moves: ['icepunch']}],
				[{species: 'Jolteon', ability: 'noability', moves: ['willowisp']}],
			]);
			battle.makeChoices();
			const sableye = battle.p2.active[0];
			const damage = sableye.maxhp - sableye.hp;
			assert.bounded(damage, [55, 65]);
		});
	});

	describe('Paralysis', function () {
		it(`should reduce speed to 50% of its original value`, function () {
			battle = common.createBattle(options, [[
				{species: 'Vaporeon', moves: ['sleeptalk']},
			], [
				{species: 'Jolteon', moves: ['glare']},
			]]);

			const vaporeon = battle.p1.active[0];
			const speed = vaporeon.getStat('spe');
			battle.makeChoices();
			assert.equal(vaporeon.status, 'par');
			assert.equal(vaporeon.getStat('spe'), battle.modify(speed, 0.5));
		});
	});

	describe('Poison', function () {
		it('should inflict 1/6 of max HP at the end of the turn, rounded down', function () {
			battle = common.createBattle(options, [
				[{species: 'Machamp', ability: 'noguard', moves: ['bulkup']}],
				[{species: 'Sableye', ability: 'prankster', moves: ['poisongas']}],
			]);
			const target = battle.p1.active[0];
			assert.hurtsBy(target, Math.floor(target.maxhp / 6), () => battle.makeChoices());
		});
	});

	describe('Frostbite', function () {
		it('should inflict 1/12 of max HP at the end of the turn, rounded down', function () {
			battle = common.createBattle(options, [
				[{species: 'Darkrai', ability: 'noability', moves: ['icebeam']}],
				[{species: 'Heatran', ability: 'noability', moves: ['sleeptalk']}],
			]);
			battle.onEvent('ModifyMove', battle.format, function (move) {
				move.damageCallback = () => 0;
				if (move.secondaries) {
					this.debug('Freeze test: Guaranteeing secondary');
					for (const secondary of move.secondaries) {
						secondary.chance = 100;
					}
				}
			});
			const target = battle.p2.active[0];
			assert.hurtsBy(target, Math.floor(target.maxhp / 12), () => battle.makeChoices());
		});

		it(`should halve damage from Special attacks`, function () {
			battle = common.createBattle(options, [
				[{species: 'Alakazam', ability: 'noability', moves: ['dazzlinggleam']}],
				[{species: 'Darkrai', ability: 'noability', moves: ['icebeam']}],
			]);
			battle.onEvent('ModifyMove', battle.format, function (move) {
				if (move.secondaries) {
					this.debug('Freeze test: Guaranteeing secondary');
					for (const secondary of move.secondaries) {
						secondary.chance = 100;
					}
				}
			});
			battle.makeChoices();
			const darkrai = battle.p2.active[0];
			const damage = darkrai.maxhp - darkrai.hp;
			assert.bounded(damage, [74, 88]);
		});

		it('should cause an afflicted Shaymin-Sky to revert to its base forme', function () {
			battle = common.createBattle(options, [
				[{species: 'Darkrai', ability: 'noability', moves: ['icebeam']}],
				[{species: 'Shaymin-Sky', ability: 'noability', moves: ['recover']}],
			]);
			battle.onEvent('ModifyMove', battle.format, function (move) {
				if (move.secondaries) {
					this.debug('Freeze test: Guaranteeing secondary');
					for (const secondary of move.secondaries) {
						secondary.chance = 100;
					}
				}
			});
			battle.makeChoices();
			assert.equal(battle.p2.active[0].status, 'frz');
			assert.equal(battle.p2.active[0].species.name, 'Shaymin');
		});
	});

	describe('Drowsy', function () {
		it(`should increase damage taken from attacks by 33%`, function () {
			battle = common.createBattle(options, [
				[{species: 'Darkrai', ability: 'noability', moves: ['rest']}],
				[{species: 'Gengar', ability: 'noability', moves: ['shadowball']}],
			]);
			const darkrai = battle.p1.active[0];
			darkrai.damage(1);
			battle.makeChoices();
			const damage = darkrai.maxhp - darkrai.hp;
			assert.bounded(damage, [61, 73]);
		});
	});
});
