'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

const formatID = 'gen8legendsubers';
const options = { formatid: formatID };

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
	battle.onEvent('ModifyMove', battle.format, move => {
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

function makeChoices(battle, pokemonToAct, input) {
	battle.getAllActive().forEach(pokemon => delete pokemon.m.acting);
	pokemonToAct.m.acting = true;
	battle.makeRequest('move');
	if (input) {
		pokemonToAct.side.choose(input);
	} else {
		pokemonToAct.side.autoChoose();
	}
	battle.commitChoices();
}

describe('[Gen 8 Legends] Dex data', () => {
	const dex = Dex.mod('gen8legends');

	const moves = 177;

	it(`should have ${moves} moves`, () => {
		const count = dex.moves.all().filter(s => s.exists && !s.isNonstandard).length;
		assert.equal(count, moves);
	});

	it(`should have valid Pokedex entries`, () => {
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

	it(`should have valid Move entries`, () => {
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

describe('[Gen 8 Legends] Team Validator', () => {
	it('should change abilities to correct ones', () => {
		const team = [
			{ species: 'cherrim', ability: 'honeygather', moves: ['rest'] },
			{ species: 'regigigas', moves: ['rest'] },
			{ species: 'magikarp', ability: 'honeygather', moves: ['splash'] },
		];
		assert.legalTeam(team, formatID);
		// assert.equal(team[0].ability, 'Flower Gift');
		// assert.equal(team[1].ability, 'Slow Start');
		assert.equal(team[2].ability, 'No Ability');
	});

	it('should remove items', () => {
		const team = [
			{ species: 'magikarp', item: 'choiceband', moves: ['splash'] },
		];
		assert.legalTeam(team, formatID);
		assert.equal(team[0].item, '');
	});

	it('should clear EVs', () => {
		const team = [
			{ species: 'magikarp', evs: { hp: 252, atk: 252, def: 252, spa: 252, spd: 252, spe: 252 }, moves: ['splash'] },
		];
		assert.legalTeam(team, formatID);
		assert.deepEqual(team[0].evs, { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
	});
});

describe('[Gen 8 Legends] Choice parser', () => {
	it('should reject `shift` requests', () => {
		battle = createBattle({ formatid: 'gen8legendstriples' });
		battle.setPlayer('p1', { team: [
			{ species: "Manaphy", moves: ['bubble'] },
			{ species: "Burmy", moves: ['strugglebug'] },
			{ species: "Geodude", moves: ['tackle'] },
			{ species: "Phione", moves: ['bubble'] },
		] });
		battle.setPlayer('p2', { team: [
			{ species: "Burmy", moves: ['strugglebug'] },
			{ species: "Geodude", moves: ['tackle'] },
			{ species: "Gastly", moves: ['astonish'] },
		] });
		assert(battle.p1.active[0].m.acting);
		assert.throws(() => battle.p1.choose('shift'));
	});

	it(`should skip non-acting Pokemon actions`, () => {
		battle = createBattle({ formatid: 'gen8legendsdoubles' }, [
			[
				{ species: 'Heatran', moves: ['magmastorm'] },
				{ species: 'Arceus', moves: ['quickattack'] },
			],
			[
				{ species: 'Geodude', moves: ['tackle'] },
				{ species: 'Regigigas', moves: ['crushgrip'] },
			],
		]);
		assert(battle.p1.active[1].m.acting);
		for (const choice of ['move 1 1, move 1 1', 'pass, pass']) {
			assert.cantMove(() => battle.p1.choose(choice));
		}
		for (const choice of ['move 1 1, move 1 1', 'move 1 1, pass', 'pass, move 1 1', 'pass, pass']) {
			assert.cantMove(() => battle.p2.choose(choice));
		}
		battle.p1.choose('move 1 1');
		assert.hurts(battle.p2.active[0], () => battle.commitChoices());
	});
});

describe('[Gen 8 Legends] Choice extensions', () => {
	it('should disallow non-acting Pokemon on move requests', () => {
		battle = createBattle({ formatid: 'gen8legendstriples' });
		battle.setPlayer('p1', { team: [
			{ species: "Burmy", moves: ['strugglebug'] },
			{ species: "Geodude", moves: ['tackle'] },
			{ species: "Manaphy", moves: ['bubble'] },
			{ species: "Phione", moves: ['bubble'] },
		] });
		battle.setPlayer('p2', { team: [
			{ species: "Burmy", moves: ['strugglebug'] },
			{ species: "Geodude", moves: ['tackle'] },
			{ species: "Gastly", moves: ['astonish'] },
		] });
		assert.false(battle.p1.activeRequest.wait);
		for (const pokemon of battle.p1.activeRequest.side.pokemon) {
			assert.notEqual(pokemon.commanding, pokemon.details === "Manaphy");
		}
		assert(battle.p2.activeRequest.wait);
		for (const pokemon of battle.p2.activeRequest.side.pokemon) {
			assert(pokemon.commanding);
		}
	});
});

describe('[Gen 8 Legends] Arceus', () => {
	it(`in untyped forme should be Normal-typed`, () => {
		battle = createBattle(options, [
			[{ species: 'Arceus', moves: ['rest'] }],
			[{ species: 'Magikarp', moves: ['splash'] }],
		]);
		assert(battle.p1.pokemon[0].hasType('Normal'));
	});

	it(`in typed forme should change its type to match the forme`, () => {
		battle = createBattle(options, [
			[{ species: 'Arceus-Fire', moves: ['rest'] }],
			[{ species: 'Magikarp', moves: ['splash'] }],
		]);
		assert(battle.p1.active[0].hasType('Fire'));
	});

	it(`should be Normal-typed if it is Arceus-Legend`, () => {
		battle = createBattle(options, [
			[{ species: 'Arceus-Legend', moves: ['rest'] }],
			[{ species: 'Magikarp', moves: ['splash'] }],
		]);
		assert(battle.p1.active[0].hasType('Normal'));
	});
});

describe('[Gen 8 Legends] Moves', () => {
	describe('Judgment', () => {
		it(`should adapt its type to the Arceus type`, () => {
			battle = createBattle(options, [
				[{ species: "Arceus-Ghost", moves: ['judgment'] }],
				[{ species: "Spiritomb", moves: ['calmmind'] }],
			]);
			assert.hurts(battle.p2.active[0], () => makeChoices(battle, battle.p1.active[0]));
		});

		it(`should adapt Arceus-Legend's type to be super effective against the opponent's type`, () => {
			battle = createBattle(options, [
				[{ species: "Arceus-Legend", moves: ['judgment'] }],
				[
					{ species: "Palkia", moves: ['bulkup'] },
					{ species: "Giratina", moves: ['calmmind'] },
				],
			]);
			const arceus = battle.p1.active[0];
			assert(arceus.hasType('Normal'));

			makeChoices(battle, arceus);
			assert.species(arceus, 'Arceus-Dragon');
			assert(arceus.hasType('Dragon'));

			makeChoices(battle, battle.p2.active[0], 'switch 2');
			makeChoices(battle, arceus);
			assert.species(arceus, 'Arceus-Dark');
			assert(arceus.hasType('Dark'));
		});

		it(`should adapt Arceus-Legend's type if the move misses`, () => {
			battle = createBattle(options, [
				[{ species: "Arceus-Legend", moves: ['judgment'] }],
				[{ species: "Magikarp", moves: ['splash'] }],
			], 'miss');
			const arceus = battle.p1.active[0];
			const magikarp = battle.p2.active[0];
			assert(arceus.hasType('Normal'));
			makeChoices(battle, arceus);
			assert.equal(magikarp.hp, magikarp.maxhp);
			assert.species(arceus, 'Arceus-Grass');
			assert(arceus.hasType('Grass'));
		});

		it(`should not adapt Arceus-Legend's type if the move fails due to paralysis`, () => {
			battle = createBattle(options, [
				[{ species: "Arceus-Legend", moves: ['judgment'] }],
				[{ species: "Luxray", moves: ['thunderwave'] }],
			], 'miss');
			const arceus = battle.p1.active[0];
			const luxray = battle.p2.active[0];
			battle.onEvent('BeforeMove', battle.format, () => false);
			makeChoices(battle, arceus);
			assert.equal(luxray.hp, luxray.maxhp);
			assert.species(arceus, 'Arceus-Legend');
			assert(arceus.hasType('Normal'));
		});
	});

	describe('Hidden Power', () => {
		it(`should adapt its type to be super effective against the opponent's type`, () => {
			battle = createBattle(options, [
				[{ species: "unown", moves: ['hiddenpower'] }],
				[{ species: "spiritomb", moves: ['calmmind'] }],
			]);
			const spiritomb = battle.p2.active[0];
			makeChoices(battle, battle.p1.active[0]);
			const damage = spiritomb.maxhp - spiritomb.hp;
			assert.bounded(damage, [76, 90]);
		});
	});
});

describe('[Gen 8 Legends] Abilities', () => {
	describe(`Slow Start`, () => {
		// a bit redundant, but it's a good test to have
		it(`should delay activation on switch-in`, () => {
			battle = createBattle(options, [[
				{ species: 'Cyndaquil', moves: ['rest'] },
				{ species: 'Regigigas', ability: 'slowstart', moves: ['rest'] },
			], [
				{ species: 'Rowlet', moves: ['rest'] },
			]]);
			makeChoices(battle, battle.p1.active[0], 'switch 2');
			for (let i = 0; i < 4; i++) { makeChoices(battle, battle.p1.active[0]); }
			let log = battle.getDebugLog();
			let slowStartEnd = log.indexOf('|-end|p1a: Regigigas|Slow Start');
			assert.false(slowStartEnd > -1, 'Slow Start should remain in effect after 4 active turns.');

			makeChoices(battle, battle.p1.active[0]);
			log = battle.getDebugLog();
			slowStartEnd = log.indexOf('|-end|p1a: Regigigas|Slow Start');
			assert(slowStartEnd > -1, 'Slow Start should not be in effect after 5 active turns.');
		});
	});

	describe(`Flower Gift`, () => {
		it(`should trigger without a weather condition`, () => {
			battle = createBattle(options, [
				[{ species: "Cherrim", ability: 'flowergift', moves: ['tackle'] }],
				[{ species: "Magikarp", moves: ['splash'] }],
			]);
			assert.species(battle.p1.active[0], 'Cherrim-Sunshine');
			assert(battle.log.some(line => line.startsWith('|-formechange')));
		});

		it(`should not boost Attack and Special Defense stats`, () => {
			battle = createBattle(options, [
				[{ species: "Cherrim", ability: 'flowergift', moves: ['tackle'] }],
				[{ species: "Magikarp", moves: ['splash'] }],
			]);
			const cherrim = battle.p1.active[0];
			assert.equal(cherrim.boosts.atk, 0);
			assert.equal(cherrim.boosts.spd, 0);
			assert.equal(cherrim.getStat('atk'), 315);
			assert.equal(cherrim.getStat('spd'), 382);
		});
	});
});

describe('[Gen 8 Legends] stats', () => {
	it(`are correctly calculated (IVs larger than 10 should be treated as 10)`, () => {
		battle = createBattle(options, [
			[{
				species: "gliscor", moves: ['poisonsting'], level: 100, nature: 'adamant',
				ivs: { hp: 6, atk: 31, def: 9, spa: 3, spd: 1, spe: 11 },
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

describe('[Gen 8 Legends] residuals', () => {
	it('should not trigger if the Pokemon did not move', () => {
		battle = createBattle(options, [
			[{ species: 'Heatran', moves: ['magmastorm'] }],
			[
				{ species: 'Arceus', moves: ['recover'] },
				{ species: 'Magikarp', moves: ['splash'] },
			],
		], 'nodamage');
		const arceus = battle.p2.active[0];
		makeChoices(battle, battle.p1.active[0]);
		assert.equal(arceus.status, 'brn');
		makeChoices(battle, arceus, 'switch 2');
		makeChoices(battle, battle.p2.active[0], 'switch 2');
		assert.equal(arceus.status, 'brn');
		assert.equal(arceus.hp, arceus.maxhp);
	});

	it('should trigger in the turn they end', () => {
		battle = createBattle(options, [
			[{ species: 'Heatran', moves: ['magmastorm'] }],
			[{ species: 'Magikarp', moves: ['splash'] }],
		], 'nodamage');
		const magikarp = battle.p2.active[0];
		makeChoices(battle, battle.p1.active[0]);
		// 3 turns of burn damage
		for (let i = 0; i < 3; i++) {
			assert.equal(magikarp.status, 'brn');
			assert.hurts(magikarp, () => makeChoices(battle, magikarp));
		}
		assert.equal(magikarp.status, '');
		// Make sure the message is sent
		assert(battle.log.some(line => line.startsWith('|-curestatus') && line.endsWith('|[msg]')));
	});
});

describe('[Gen 8 Legends] statuses', () => {
	it('should overwrite old statuses', () => {
		battle = createBattle(options, [
			[{ species: 'Tangrowth', moves: ['sleeppowder', 'stunspore', 'poisonpowder'] }],
			[{ species: 'Magikarp', moves: ['splash'] }],
		]);
		const tangrowth = battle.p1.active[0];
		const magikarp = battle.p2.active[0];
		makeChoices(battle, tangrowth, 'move sleeppowder');
		assert.equal(magikarp.status, 'slp');
		makeChoices(battle, tangrowth, 'move stunspore');
		assert.equal(magikarp.status, 'par');
		makeChoices(battle, tangrowth, 'move poisonpowder');
		assert.equal(magikarp.status, 'psn');
	});

	it('should reset their duration upon reapplication', () => {
		battle = createBattle(options, [
			[{ species: 'Raichu', moves: ['thunderwave'] }],
			[{ species: 'Magikarp', moves: ['splash'] }],
		]);
		const raichu = battle.p1.active[0];
		const magikarp = battle.p2.active[0];
		makeChoices(battle, raichu);
		assert.equal(magikarp.status, 'par');
		assert.equal(magikarp.statusState.duration, 5);
		makeChoices(battle, magikarp);
		assert.equal(magikarp.status, 'par');
		assert.equal(magikarp.statusState.duration, 4);
		makeChoices(battle, raichu);
		assert.equal(magikarp.status, 'par');
		assert.equal(magikarp.statusState.duration, 5);
	});

	describe('Burn', () => {
		it('should inflict 1/12 of max HP at the end of the turn, rounded down', () => {
			battle = createBattle(options, [
				[{ species: 'Heatran', moves: ['magmastorm'] }],
				[{ species: 'Magikarp', moves: ['splash'] }],
			], 'nodamage');
			const heatran = battle.p1.active[0];
			const magikarp = battle.p2.active[0];
			makeChoices(battle, heatran);
			assert.hurtsBy(magikarp, Math.floor(magikarp.maxhp / 12), () => makeChoices(battle, magikarp));
		});

		it(`should halve damage from Physical attacks`, () => {
			battle = createBattle(options, [
				[{ species: 'Avalugg-Hisui', moves: ['iceshard'] }],
				[{ species: 'Heatran', moves: ['magmastorm'] }],
			]);
			const avalugg = battle.p1.active[0];
			const heatran = battle.p2.active[0];
			makeChoices(battle, heatran);
			makeChoices(battle, avalugg);
			const damage = heatran.maxhp - heatran.hp;
			assert.bounded(damage, [8, 9]);
		});
	});

	describe('Poison', () => {
		it('should inflict 1/6 of max HP at the end of the turn, rounded down', () => {
			battle = createBattle(options, [
				[{ species: 'Machamp', moves: ['bulkup'] }],
				[{ species: 'Gengar', moves: ['poisongas'] }],
			]);
			const machamp = battle.p1.active[0];
			const gengar = battle.p2.active[0];
			makeChoices(battle, gengar);
			assert.hurtsBy(machamp, Math.floor(machamp.maxhp / 6), () => makeChoices(battle, machamp));
		});
	});

	describe('Frostbite', () => {
		it('should inflict 1/12 of max HP at the end of the turn, rounded down', () => {
			battle = createBattle(options, [
				[{ species: 'Darkrai', moves: ['icebeam'] }],
				[{ species: 'Heatran', moves: ['irondefense'] }],
			], ['nodamage', 'secondaries']);
			const darkrai = battle.p1.active[0];
			const heatran = battle.p2.active[0];
			makeChoices(battle, darkrai);
			assert.hurtsBy(heatran, Math.floor(heatran.maxhp / 12), () => makeChoices(battle, heatran));
		});

		it(`should halve damage from Special attacks`, () => {
			battle = createBattle(options, [
				[{ species: 'Probopass', moves: ['thunderbolt'] }],
				[{ species: 'Mantine', moves: ['icebeam'] }],
			], 'secondaries');
			const probopass = battle.p1.active[0];
			const mantine = battle.p2.active[0];
			makeChoices(battle, mantine);
			makeChoices(battle, probopass);
			const damage = mantine.maxhp - mantine.hp;
			assert.bounded(damage, [63, 76]);
		});
	});

	describe('Drowsy', () => {
		it(`should increase damage taken from attacks by 33%`, () => {
			battle = createBattle(options, [
				[{ species: 'Darkrai', moves: ['rest'] }],
				[{ species: 'Gengar', moves: ['shadowball'] }],
			]);
			const darkrai = battle.p1.active[0];
			const gengar = battle.p2.active[0];
			darkrai.damage(1);
			makeChoices(battle, darkrai);
			makeChoices(battle, gengar);
			const damage = darkrai.maxhp - darkrai.hp;
			assert.bounded(damage, [61, 73]);
		});

		describe('should end if hit by', () => {
			for (const move of ['Spark', 'Volt Tackle', 'Wild Charge']) {
				it(`${move}`, () => {
					battle = createBattle(options, [
						[{ species: 'Darkrai', moves: ['darkvoid'] }],
						[{ species: 'Raichu', moves: [move] }],
					]);
					const darkrai = battle.p1.active[0];
					const raichu = battle.p2.active[0];
					makeChoices(battle, darkrai);
					assert.equal(raichu.status, 'slp');
					makeChoices(battle, raichu);
					assert.equal(raichu.status, '');
				});
			}
		});
	});
});

describe('[Gen 8 Legends] volatile statuses', () => {
	it('should reset their duration upon reapplication', () => {
		battle = createBattle(options, [
			[{ species: 'Kleavor', moves: ['stoneaxe'] }],
			[{ species: 'Arceus', moves: ['calmmind'] }],
		]);
		const kleavor = battle.p1.active[0];
		const arceus = battle.p2.active[0];
		makeChoices(battle, kleavor);
		assert.equal(arceus.volatiles['splinters'].duration, 3);
		makeChoices(battle, arceus);
		assert.equal(arceus.volatiles['splinters'].duration, 2);
		makeChoices(battle, kleavor);
		assert.equal(arceus.volatiles['splinters'].duration, 3);
	});

	describe('focus energy', () => {});

	describe('fixated', () => {
		it(`should increase damage by the same move by 50%`, () => {
			battle = createBattle(options, [
				[{ species: 'Garchomp', moves: ['outrage'] }],
				[{ species: 'Arceus', moves: ['quickattack'] }],
			]);
			const garchomp = battle.p1.active[0];
			const arceus = battle.p2.active[0];
			let hp = arceus.hp;
			makeChoices(battle, garchomp);
			assert.bounded(hp - arceus.hp, [86, 103]);
			hp = arceus.hp;
			makeChoices(battle, garchomp);
			assert.bounded(hp - arceus.hp, [129, 154]);
		});

		it('should not increase damage from other moves', () => {
			battle = createBattle(options, [
				[{ species: 'Garchomp', moves: ['outrage', 'ragingfury'] }],
				[{ species: 'Arceus', moves: ['quickattack'] }],
			]);
			const garchomp = battle.p1.active[0];
			const arceus = battle.p2.active[0];
			let hp = arceus.hp;
			makeChoices(battle, garchomp);
			assert.bounded(hp - arceus.hp, [86, 103]);
			hp = arceus.hp;
			makeChoices(battle, garchomp, 'move ragingfury');
			assert.bounded(hp - arceus.hp, [69, 82]);
			hp = arceus.hp;
			makeChoices(battle, garchomp, 'move ragingfury');
			assert.bounded(hp - arceus.hp, [103, 124]); // was [103, 123] before
		});

		it(`should increase damage taken from attacks by 33%`, () => {
			battle = createBattle(options, [
				[{ species: 'Garchomp', moves: ['outrage'] }],
				[{ species: 'Arceus', moves: ['judgment'] }],
			]);
			const garchomp = battle.p1.active[0];
			const arceus = battle.p2.active[0];
			let hp = garchomp.hp;
			makeChoices(battle, arceus);
			assert.bounded(hp - garchomp.hp, [120, 141]);
			makeChoices(battle, garchomp);
			hp = garchomp.hp;
			makeChoices(battle, arceus);
			assert.bounded(hp - garchomp.hp, [159, 187]);
		});
	});

	describe('splinters', () => {
		it(`damage should ignore statuses and volatiles`, () => {
			battle = createBattle(options, [
				[{ species: 'Graveler', moves: ['stealthrock'], level: 34, ivs: { atk: 0 } }],
				[{ species: 'Arceus', moves: ['judgment'], level: 75, ivs: { hp: 0, def: 3 } }],
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

			makeChoices(battle, graveler);
			assert.hurtsBy(arceus, 12, () => makeChoices(battle, arceus));
		});

		it(`damage should change if Arceus-Legend's type changes`, () => {
			battle = createBattle(options, [
				[{ species: 'Kleavor', moves: ['stealthrock'] }],
				[{ species: 'Arceus-Legend', moves: ['judgment', 'calmmind'] }],
			], 'nodamage');
			const arceus = battle.p2.active[0];
			makeChoices(battle, battle.p1.active[0]);
			assert.hurtsBy(arceus, 23, () => makeChoices(battle, arceus, 'move calmmind'));
			assert.hurtsBy(arceus, 11, () => makeChoices(battle, arceus));
			assert.species(arceus, 'Arceus-Steel');
		});
	});

	describe('obscured', () => {});

	describe('primed', () => {
		it(`should increase damage by 50%`, () => {
			battle = createBattle(options, [
				[{ species: 'Ambipom', moves: ['doublehit', 'swift'] }],
				[{ species: 'Arceus', moves: ['quickattack'] }],
			]);
			const ambipom = battle.p1.active[0];
			const arceus = battle.p2.active[0];

			makeChoices(battle, ambipom);
			makeChoices(battle, ambipom, 'move swift');
			const damage = arceus.maxhp - arceus.hp;
			assert.bounded(damage, [79, 94]);
		});
	});

	describe('stanceswap', () => {
		it('should not reswap if the user uses Power Shift again', () => {
			battle = createBattle(options, [
				[{ species: 'Avalugg-Hisui', moves: ['powershift'] }],
				[{ species: 'Magikarp', moves: ['splash'] }],
			]);
			const avalugg = battle.p1.active[0];
			assert.equal(avalugg.getStat('atk'), 407);
			assert.equal(avalugg.getStat('def'), 544);
			assert.equal(avalugg.getStat('spa'), 166);
			assert.equal(avalugg.getStat('spd'), 172);

			makeChoices(battle, avalugg);
			assert.equal(avalugg.getStat('atk'), 544);
			assert.equal(avalugg.getStat('def'), 407);
			assert.equal(avalugg.getStat('spa'), 172);
			assert.equal(avalugg.getStat('spd'), 166);

			makeChoices(battle, avalugg);
			assert.equal(avalugg.getStat('atk'), 544);
			assert.equal(avalugg.getStat('def'), 407);
			assert.equal(avalugg.getStat('spa'), 172);
			assert.equal(avalugg.getStat('spd'), 166);
		});
	});

	describe('powerboost', () => {});
});

describe('[Gen 8 Legends] Action time queue', () => {
	// TODO
});
