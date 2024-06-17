'use strict';

const assert = require('./../assert');
const common = require('./../common');

let battle;
const unimportantPokemon = {species: 'magikarp', moves: ['splash']};

describe('[Legends: Arceus] Dex data', function () {
	function existenceFunction(species) {
		if (typeof species === "string") {
			species = common.mod('gen8legends').dex.species.get(species);
		}
		return species.exists && !species.isNonstandard; // && species.tier !== 'Illegal';
	}

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
	// Origin (3) + Arceus (17) + Shaymin (1) + Therian (4) +
	// Hisui (16) + Basculin (1) + Basculegion (1)
	const formes = 1 + 1 + 2 + 1 + 5 + 3 + 17 + 1 + 4 + 16 + 1 + 1;

	it(`should have ${species} species and ${formes} formes`, () => {
		const count = countPokemon(common.mod('gen8legends').dex);
		assert.equal(count.species, species);
		assert.equal(count.formes, formes);
	});

	// Hidden Power (16)
	const moves = 177 + 16;

	it(`should have ${moves} moves`, function () {
		const count = common.mod('gen8legends').dex.moves.all().filter((s) => s.exists && !s.isNonstandard).length;
		assert.equal(count, moves);
	});

	it(`should have valid Pokedex entries`, function () {
		const Pokedex = common.mod('gen8legends').dex.data.Pokedex;
		for (const pokemonid in Pokedex) {
			const entry = Pokedex[pokemonid];
			const fullEntry = common.mod('gen8legends').dex.species.get(pokemonid);
			if (!existenceFunction(fullEntry)) continue;
			if (fullEntry.gen) {
				assert(fullEntry.gen <= common.mod('gen8legends').dex.gen, `${entry.name} is from gen ${fullEntry.gen}`);
			}
			if (entry.prevo) {
				const prevoEntry = Pokedex[toID(entry.prevo)];
				assert(existenceFunction(toID(entry.prevo)), `${entry.name} has ${prevoEntry.name} listed as an prevo`);
			}
			if (entry.evos) {
				for (const evo of entry.evos) {
					const evoEntry = Pokedex[toID(evo)];
					assert(existenceFunction(toID(evo)), `${entry.name} has ${evoEntry.name} listed as an evo`);
				}
				assert(fullEntry.nfe, `${entry.name} with ${entry.evos} listed as evos, is not a NFE`);
			} else {
				assert(!fullEntry.nfe, `${entry.name} with no evos, is a NFE`);
			}
			if (entry.battleOnly) {
				const battleOnly = Array.isArray(entry.battleOnly) ? entry.battleOnly : [entry.battleOnly];
				for (const battleForme of battleOnly) {
					const battleEntry = Pokedex[toID(battleForme)];
					assert(existenceFunction(toID(battleForme)), `${entry.name} has ${battleEntry.name} listed as a battle only form`);
				}
			}
			if (entry.changesFrom) {
				const formeEntry = Pokedex[toID(entry.changesFrom)];
				assert(existenceFunction(toID(entry.changesFrom)), `${entry.name} has ${formeEntry.name} listed as a changes from form`);
			}
		}
	});
});

describe('[Legends: Arceus] Team Validator', function () {
	it('should change abilities to correct ones', function () {
		const team = [
			{species: 'cherrim', ability: 'honeygather', moves: ['rest']},
			{species: 'regigigas', ability: 'honeygather', moves: ['rest']},
			{species: 'magikarp', ability: 'honeygather', moves: ['splash']},
		];
		assert.legalTeam(team, 'gen8legendsubers');
		require('../../dist/sim/team-validator').TeamValidator.get('gen8legendsubers').validateTeam(team);
		assert.equal(team[0].ability, 'Flower Gift');
		assert.equal(team[1].ability, 'Slow Start');
		assert.equal(team[2].ability, 'No Ability');
	});

	it('should remove items', function () {
		const team = [
			{species: 'magikarp', item: 'choiceband', moves: ['splash']},
		];
		assert.legalTeam(team, 'gen8legendsubers');
		require('../../dist/sim/team-validator').TeamValidator.get('gen8legendsubers').validateTeam(team);
		assert.equal(team[0].item, "");
	});
});

describe('[Legends: Arceus] Arceus', function () {
	it(`in untyped forme should be Normal-typed`, function () {
		battle = common.createBattle({formatid: 'gen8legendsubers@@@!teampreview'}, [
			[{species: 'arceus', ability: 'noability', moves: ['rest']}],
			[unimportantPokemon],
		]);
		assert(battle.p1.pokemon[0].hasType('Normal'));
	});

	it(`in typed forme should change its type to match the forme`, function () {
		battle = common.createBattle({formatid: 'gen8legendsubers@@@!teampreview'}, [
			[{species: 'arceusfire', ability: 'noability', moves: ['rest']}],
			[unimportantPokemon],
		]);
		assert(battle.p1.active[0].hasType('Fire'));
	});
});

describe('[Legends: Arceus] Judgment', function () {
	it(`should adapt its type to the Arceus type`, function () {
		battle = common.createBattle({formatid: 'gen8legendsubers@@@!teampreview'}, [
			[{species: "arceusghost", ability: 'noability', moves: ['judgment']}],
			[{species: "spiritomb", ability: 'noability', moves: ['calmmind']}],
		]);
		assert.hurts(battle.p2.active[0], () => battle.makeChoices('move judgment', 'move calmmind'));
	});
});

describe('[Legends: Arceus] Random Battle (slow)', () => {
});