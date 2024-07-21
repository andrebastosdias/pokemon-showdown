'use strict';

const assert = require('./../assert');
const common = require('./../common');
const {testSet, testHasSTAB, testAlwaysHasMove} = require('../random-battles/tools');

let battle;

function existenceFunction(species) {
	assert.equal(
		species.exists && (!species.isNonstandard || ["Gigantamax", "Cap"].includes(species.isNonstandard)),
		species.exists && !species.isNonstandard && !species.tier != 'Illegal',
		species.name
	)
	return species.exists && !species.isNonstandard && !species.tier != 'Illegal';
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
	// Origin (3) + Arceus (17) + Shaymin (1) + Therian (4) +
	// Hisui (16) + Basculin (1) + Basculegion (1)
	const formes = 1 + 1 + 2 + 1 + 5 + 3 + 17 + 1 + 4 + 16 + 1 + 1;

	it(`should have ${species} species and ${formes} formes`, () => {
		const count = countPokemon(dex);
		assert.equal(count.species, species);
		assert.equal(count.formes, formes);
	});

	// Hidden Power (16)
	const moves = 177 + 16;

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
});

describe('[Gen 8 Legends] Team Validator', function () {
	const formatID = 'gen8legendsubers';
	const validator = require('../../dist/sim/team-validator').TeamValidator.get(formatID);

	it('should change abilities to correct ones', function () {
		const team = [
			{species: 'cherrim', ability: 'honeygather', moves: ['rest']},
			{species: 'regigigas', ability: 'honeygather', moves: ['rest']},
			{species: 'magikarp', ability: 'honeygather', moves: ['splash']},
		];
		assert.legalTeam(team, formatID);
		validator.validateTeam(team);
		assert.equal(team[0].ability, 'Flower Gift');
		assert.equal(team[1].ability, 'Slow Start');
		assert.equal(team[2].ability, 'No Ability');
	});

	it('should remove items', function () {
		const team = [
			{species: 'magikarp', ability: 'noability', item: 'choiceband', moves: ['splash']},
		];
		assert.legalTeam(team, formatID);
		validator.validateTeam(team);
		assert.equal(team[0].item, '');
	});
});

describe('[Gen 8 Legends] Arceus', function () {
	const options = {formatid: 'gen8legendsubers@@@!teampreview'};

	it(`in untyped forme should be Normal-typed`, function () {
		battle = common.createBattle(options, [
			[{species: 'arceus', ability: 'noability', moves: ['rest']}],
			[{species: 'magikarp', ability: 'noability', moves: ['splash']}],
		]);
		assert(battle.p1.pokemon[0].hasType('Normal'));
	});

	it(`in typed forme should change its type to match the forme`, function () {
		battle = common.createBattle(options, [
			[{species: 'arceusfire', ability: 'noability', moves: ['rest']}],
			[{species: 'magikarp', ability: 'noability', moves: ['splash']}],
		]);
		assert(battle.p1.active[0].hasType('Fire'));
	});
});

describe('[Gen 8 Legends] Judgment', function () {
	const options = {formatid: 'gen8legendsubers@@@!teampreview'};

	it(`should adapt its type to the Arceus type`, function () {
		battle = common.createBattle(options, [
			[{species: "arceusghost", ability: 'noability', moves: ['judgment']}],
			[{species: "spiritomb", ability: 'noability', moves: ['calmmind']}],
		]);
		assert.hurts(battle.p2.active[0], () => battle.makeChoices('move judgment', 'move calmmind'));
	});
});

/* describe('[Gen 8 Legends] Random Battle (slow)', () => {
	const options = {format: 'gen8legendsrandombattle'};
	const dataJSON = require(`../../dist/data/random-battles/gen8legends/data.json`);
	const dex = Dex.forFormat(options.format);
	const generator = Teams.getGenerator(options.format);

	generator.randomSet("probopass", {});
	exit();

	it('All fully-evolved Pokémon should be obtainable', () => {
		let counter = 0;
		for (const species of dex.species.all()) {
			if (!existenceFunction(species)) continue;
			if (species.nfe) continue;
			if (species.battleOnly) continue;
			const data = dataJSON[species.id];
			assert(!!data,
				`${species.name} does not have random data`
			)
			assert(!!data.moves && (data.moves.length >= 4 || species.id === "unown"),
				`${species.name} only has the following moves: ${data.moves}`
			)
			counter += 1;
		}
		assert.equal(Object.keys(dataJSON).length, counter);
	});

	it('All moves should be in the learnset', () => {
		for (const pokemon of Object.keys(dataJSON)) {
			const species = dex.species.get(pokemon);
			const data = dataJSON[pokemon];
			const learnset = dex.species.getMovePool(species.id);
			for (let moveid of data.moves) {
				if (moveid.startsWith("hiddenpower")) moveid = 'hiddenpower';
				assert(learnset.has(moveid), `Move key "${moveid}" is not learned by ${species.name}`);
			}
		}
	});

	it('All moves on all sets should be obtainable', () => {
		const rounds = 500;
		for (const pokemon of Object.keys(dataJSON)) {
			const species = dex.species.get(pokemon);
			const data = dataJSON[pokemon];
			const remainingMoves = new Set(data.moves);
			for (let i = 0; i < rounds; i++) {
				const set = generator.randomSet(species, {});
				for (const move of set.moves) remainingMoves.delete(move);
				if (!remainingMoves.size) break;
			}
			assert.false(remainingMoves.size,
				`The following moves on ${species.name} are unused: ${[...remainingMoves].join(', ')}`
			);
		}
	});

	it('should enforce all STAB on all sets', function() {
		// this.timeout(60000);
		for (const pokemon of Object.keys(dataJSON)) {
			if (["blissey", "empoleon", "gliscor", "unown", "wyrdeer"].includes(pokemon)) continue;
			const species = dex.species.get(pokemon);
			const data = dataJSON[pokemon];
			const mandatoryStabs = data.moves
				.filter(move => dex.moves.get(move).category !== 'Status')
				.map(move => dex.moves.get(move).type)
				.filter(type => species.types.includes(type));

			testSet(pokemon, options, set => {
				const setTypes = new Set(set.moves
					.filter(move => dex.moves.get(move).category !== 'Status')
					.map(move => dex.moves.get(move).type));
				assert(
					mandatoryStabs.every(type => setTypes.has(type)),
					`${species.name} should have all STAB move (generated moveset: ${set.moves})`
				);
			});
		}
	});

	it('should enforce STAB on Empoleon, and Wyrdeer', () => {
		for (const pkmn of ['empoleon', 'wyrdeer']) {
			testHasSTAB(pkmn, options);
		}
	});

	it('Arceus should always have Judgment', () => testAlwaysHasMove('arceus', options, 'judgment'));

	it('Parasect should always have Spore', () => testAlwaysHasMove('parasect', options, 'spore'));

	it('Kleavor should always have Stone Axe', () => testAlwaysHasMove('kleavor', options, 'stoneaxe'));

	it('Samurott-Hisui should always have Ceaseless Edge', () => testAlwaysHasMove('samurotthisui', options, 'ceaselessedge'));

	describe('should give Spikes unless it has setup', () => {
		for (const pokemon of Object.keys(dataJSON)) {
			const species = dex.species.get(pokemon);
			const data = dataJSON[pokemon];
			if (data.moves.includes("spikes"))
			
			it(`${species.name} should always have Spikes`, () => {
				testSet(pokemon, options, set => {
					if (set.moves.some(move => Dex.moves.get(move).boosts)) return; // Setup
					assert(
						set.moves.includes('spikes'),
						`${pokemon} should always generate Spikes (generated moveset: ${set.moves})`
					);
				});
			});
		}
	});

	describe('should enforce Stealth Rock', () => {
		for (const pokemon of Object.keys(dataJSON)) {
			const species = dex.species.get(pokemon);
			const data = dataJSON[pokemon];
			if (data.moves.includes("stealthrock"))
			
			it(`${species.name} should always have Stealth Rock`, () => {
				testAlwaysHasMove(pokemon, options, 'stealthrock');
			});
		}
	});
	
	describe('should enforce recovery moves', () => {
		for (const pokemon of Object.keys(dataJSON)) {
			const species = dex.species.get(pokemon);
			const data = dataJSON[pokemon];
			const recoveryMoves = data.moves.filter(move => dex.moves.get(move).heal);
			if (!recoveryMoves.length) continue;
			if (['alakazam', 'gardevoir', 'lilliganthisui', 'porygonz', 'shayminsky', 'staraptor'].includes(pokemon)) continue;
			
			// it(`${species.name} should always have ${dex.moves.get(recoveryMoves[0]).name}`, () => {
			// 	testAlwaysHasMove(pokemon, options, recoveryMoves[0]);
			// });
		}
	});

	describe('should enforce Thunder Wave', () => {
		for (const pokemon of Object.keys(dataJSON)) {
			const species = dex.species.get(pokemon);
			const data = dataJSON[pokemon];
			if (data.moves.includes("thunderwave"))
			
			it(`${species.name} should always have Thunder Wave`, () => {
				testAlwaysHasMove(pokemon, options, 'thunderwave');
			});
		}
	});
}); */
