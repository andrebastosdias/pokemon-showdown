import {Species} from '../../../sim/dex-species';
import type {PRNG} from '../../../sim/prng';
import {MoveCounter, RandomGen8Teams, OldRandomBattleSpecies} from '../gen8/teams';

// // Moves that restore HP:
// const RECOVERY_MOVES = [
// 	'recover', 'roost', 'softboiled',
// ];
// Moves that boost Attack:
const PHYSICAL_SETUP = [
	'bulkup', 'swordsdance', 'victorydance',
];
// Moves which boost Special Attack:
const SPECIAL_SETUP = [
	'calmmind', 'nastyplot', 'takeheart',
];
// // Moves that shouldn't be the only STAB moves:
// const NO_STAB = [
// 	'aquajet', 'explosion', 'iceshard', 'icywind', 'machpunch', 'quickattack', 'selfdestruct', 'shadowsneak', 'snarl',
// ];
// // Hazard-setting moves
// const HAZARDS = [
// 	'spikes', 'stealthrock',
// ];

export class RandomLegendsTeams extends RandomGen8Teams {
	randomData: {[species: string]: OldRandomBattleSpecies} = require('./data.json');

	constructor(format: Format | string, prng: PRNG | PRNGSeed | null) {
		super(format, prng);
		this.moveEnforcementCheckers = {
			recovery: (movePool, moves, abilities, types, counter, species, teamDetails) => (
				['recover', 'roost', 'softboiled'].some(moveid => movePool.includes(moveid)) &&
				!['alakazam', 'gardevoir', 'lilliganthisui', 'porygonz', 'shayminsky', 'staraptor'].includes(species.id)
			),
			setup: (movePool, moves, abilities, types, counter, species, teamDetails) => (
				(
					PHYSICAL_SETUP.some(moveid => movePool.includes(moveid)) ||
					SPECIAL_SETUP.some(moveid => movePool.includes(moveid))
				) && !(
					(
						['ceaselessedge', 'spikes'].some(move => movePool.includes(move)) && !teamDetails.spikes
					) || (
						['stealthrock', 'stoneaxe'].some(move => movePool.includes(move)) && !teamDetails.stealthRock
					)
				)
			),
			Bug: (movePool, moves, abilities, types, counter) => !counter.get('Bug'),
			Dark: (movePool, moves, abilities, types, counter) => !counter.get('Dark'),
			Dragon: (movePool, moves, abilities, types, counter) => !counter.get('Dragon'),
			Electric: (movePool, moves, abilities, types, counter) => !counter.get('Electric'),
			Fairy: (movePool, moves, abilities, types, counter) => !counter.get('Fairy'),
			Fighting: (movePool, moves, abilities, types, counter) => !counter.get('Fighting'),
			Fire: (movePool, moves, abilities, types, counter) => !counter.get('Fire'),
			Flying: (movePool, moves, abilities, types, counter) => !counter.get('Flying'),
			Ghost: (movePool, moves, abilities, types, counter) => !counter.get('Ghost') && !types.has('Dark'),
			Grass: (movePool, moves, abilities, types, counter) => !counter.get('Grass'),
			Ground: (movePool, moves, abilities, types, counter, species) => !counter.get('Ground') && species.id !== 'gliscor',
			Ice: (movePool, moves, abilities, types, counter) => !counter.get('Ice'),
			Normal: (movePool, moves, abilities, types, counter, species) => !counter.get('Normal') && species.id !== 'blissey',
			Poison: (movePool, moves, abilities, types, counter) => !counter.get('Poison'),
			Psychic: (movePool, moves, abilities, types, counter) => !counter.get('Psychic'),
			Rock: (movePool, moves, abilities, types, counter) => !counter.get('Rock'),
			Steel: (movePool, moves, abilities, types, counter, species) => !counter.get('Steel') && species.id !== 'empoleon',
			Water: (movePool, moves, abilities, types, counter) => !counter.get('Water'),
		};
	}

	shouldCullMove(
		move: Move,
		types: Set<string>,
		moves: Set<string>,
		abilities: Set<string>,
		counter: MoveCounter,
		movePool: string[],
		teamDetails: RandomTeamsTypes.TeamDetails,
		species: Species,
	): {cull: boolean, isSetup?: boolean} {
		if (movePool.includes('judgment')) {
			return {cull: true};
		}

		if (movePool.includes('ceaselessedge')) {
			return {cull: true};
		}
		if (movePool.includes('stoneaxe')) {
			return {cull: true};
		}

		if (movePool.includes('spikes') && !teamDetails.spikes) {
			return {cull: true};
		}
		if (movePool.includes('stealthrock') && !teamDetails.stealthRock) {
			return {cull: true};
		}

		if (movePool.includes('spore')) {
			return {cull: true};
		}
		if (movePool.includes('thunderwave')) {
			return {cull: true};
		}

		switch (move.id) {
		// Set up once and only if we have the moves for it
		case 'bulkup': case 'swordsdance': case 'victorydance':
			return {
				cull: (
					counter.setupType !== 'Physical' ||
					counter.get('physicalsetup') > 1 ||
					counter.get('Physical') + counter.get('physicalpool') < 2
				),
				isSetup: true,
			};
		case 'calmmind': case 'nastyplot': case 'takeheart':
			return {
				cull: (
					counter.setupType !== 'Special' ||
					counter.get('specialsetup') > 1 ||
					counter.get('Special') + counter.get('specialpool') < 2
				),
				isSetup: true,
			};

		// Bad after setup
		case 'teleport':
			return {cull: !!counter.setupType};
		case 'spikes':
			return {cull: !!counter.setupType || (!!teamDetails.spikes && teamDetails.spikes > 1)};
		case 'stealthrock':
			return {cull: !!counter.setupType || !!teamDetails.stealthRock};

		case 'hex':
			return {cull: !moves.has('hypnosis') && !moves.has('thunderwave')};

		// Bit redundant to have both
		case 'airslash':
			return {cull: moves.has('hurricane')};
		case 'bittermalice': case 'infernalparade':
			return {cull: moves.has('shadowball')};
		case 'bulletpunch':
			return {cull: moves.has('machpunch')};
		case 'dazzlinggleam':
			return {cull: moves.has('moonblast')};
		case 'dragonpulse':
			return {cull: moves.has('dracometeor')};
		case 'drainingkiss':
			return {cull: moves.has('dazzlinggleam') || moves.has('moonblast')};
		case 'drainpunch':
			return {cull: moves.has('closecombat')};
		case 'firepunch': case 'flamethrower':
			return {cull: moves.has('fireblast') || moves.has('flareblitz')};
		case 'icebeam':
			return {cull: moves.has('blizzard')};
		case 'leafblade':
			return {cull: moves.has('woodhammer')};
		case 'megahorn':
			return {cull: moves.has('leechlife')};
		case 'mysticalpower':
			return {cull: moves.has('psychic')};
		case 'shadowball':
			return {cull: moves.has('darkpulse') || moves.has('hex')};
		case 'shadowclaw':
			return {cull: moves.has('nightslash')};
		case 'sleeppowder':
			return {cull: moves.has('spore')};
		case 'snarl':
			return {cull: moves.has('darkpulse')};
		case 'stunspore':
			return {cull: moves.has('sleeppowder') || moves.has('spore')};
		case 'poisonpowder':
			return {cull: moves.has('sleeppowder') || moves.has('spore') || moves.has('stunspore')};
		case 'rockslide':
			return {cull: moves.has('stoneedge')};
		case 'thunder':
			return {cull: moves.has('thunderbolt')};
		case 'xscissor':
			return {cull: moves.has('leechlife') || moves.has('megahorn')};
		}

		// This move doesn't satisfy our setup requirements:
		if (
			(move.category === 'Physical' && counter.setupType === 'Special') ||
			(move.category === 'Special' && counter.setupType === 'Physical')
		) {
			// Reject STABs last in case the setup type changes later on
			if (!types.has(move.type) || counter.get('stab') > 1 || counter.get(move.category) < 2) return {cull: true};
		}

		return {cull: false};
	}

	getLevel(species: Species): number {
		// level set by rules
		if (this.adjustLevel) return this.adjustLevel;

		const tierScale: Partial<Record<Species['tier'], number>> = {
			Uber: 76,
			OU: 80,
			UUBL: 81,
			UU: 82,
			RUBL: 83,
			RU: 84,
			NUBL: 85,
			NU: 86,
			PUBL: 87,
			PU: 88, "(PU)": 88, NFE: 88,
		};
		const customScale: {[k: string]: number} = {
			unown: 100,
		};
		return customScale[species.id] || tierScale[species.tier] || 80;
	}

	randomSet(
		species: string | Species,
		teamDetails: RandomTeamsTypes.TeamDetails = {},
	): RandomTeamsTypes.RandomSet {
		species = this.dex.species.get(species);
		const forme = this.getForme(species);

		const data = this.randomData[species.id];

		const movePool: string[] = [...(data.moves || this.dex.species.getMovePool(species.id))];
		const rejectedPool = [];

		const types = new Set(species.types);

		const moves = new Set<string>();
		let counter: MoveCounter;
		// This is just for Unown
		let hasHiddenPower = false;

		do {
			// Choose next 4 moves from learnset/viable moves and add them to moves list:
			const pool = (movePool.length ? movePool : rejectedPool);
			while (moves.size < this.maxMoveCount && pool.length) {
				const moveid = this.sampleNoReplace(pool);
				if (moveid.startsWith('hiddenpower')) {
					if (hasHiddenPower) continue;
					hasHiddenPower = true;
				}
				moves.add(moveid);
			}

			counter = this.queryMoves(moves, species.types, new Set(), movePool);
			const runEnforcementChecker = (checkerName: string) => {
				if (!this.moveEnforcementCheckers[checkerName]) return false;
				return this.moveEnforcementCheckers[checkerName](
					movePool, moves, new Set(), types, counter, species as Species, teamDetails
				);
			};

			// Iterate through the moves again, this time to cull them:
			for (const moveid of moves) {
				const move = this.dex.moves.get(moveid);
				let {cull, isSetup} = this.shouldCullMove(move, types, moves, new Set(), counter, movePool, teamDetails, species);

				if (
					!isSetup &&
					counter.setupType &&
					move.category !== counter.setupType &&
					counter.get(counter.setupType) < 2 && (
						// Reject Status moves only if there is nothing else to reject
						move.category !== 'Status' || (
							counter.get(counter.setupType) + counter.get('Status') > 3 &&
							counter.get('physicalsetup') + counter.get('specialsetup') < 2
						)
					)
				) {
					cull = true;
				}

				const moveIsRejectable = !move.damage && (move.category !== 'Status' || !move.flags.heal) && (
					move.category === 'Status' ||
					!types.has(move.type) ||
					move.selfSwitch ||
					move.basePower && move.basePower < 40 && !move.multihit
				);

				// Pokemon should have moves that benefit their Type, as well as moves required by its forme
				if (moveIsRejectable && !cull && !isSetup && counter.get('physicalsetup') + counter.get('specialsetup') < 2 && (
					!counter.setupType ||
					(move.category !== counter.setupType && move.category !== 'Status') ||
					(counter.get(counter.setupType) + counter.get('Status') > 3 && !counter.get('hazards'))
				)) {
					if (
						(!counter.get('stab') && counter.get('physicalpool') + counter.get('specialpool') > 0) ||
						runEnforcementChecker('recovery') || runEnforcementChecker('setup')
					) {
						cull = true;
					} else {
						for (const type of types) {
							if (runEnforcementChecker(type)) {
								cull = true;
							}
						}
					}
				}

				// Remove rejected moves from the move list
				if (cull && movePool.length) {
					if (moveid.startsWith('hiddenpower')) hasHiddenPower = false;
					if (move.category !== 'Status' && !move.damage) rejectedPool.push(moveid);
					moves.delete(moveid);
					break;
				}
				if (cull && rejectedPool.length) {
					if (moveid.startsWith('hiddenpower')) hasHiddenPower = false;
					moves.delete(moveid);
					break;
				}
			}
		} while (moves.size < this.maxMoveCount && (movePool.length || rejectedPool.length));

		const level: number = this.getLevel(species);

		const ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
		// Minimize confusion damage
		if (!counter.get('Physical')) ivs.atk = 0;

		return {
			name: species.baseSpecies,
			species: forme,
			gender: species.gender,
			shiny: this.randomChance(1, 1024),
			level,
			moves: Array.from(moves),
			ability: species.abilities['0'],
			evs: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0},
			ivs,
			item: '',
		};
	}

	randomTeam() {
		this.enforceNoDirectCustomBanlistChanges();

		const seed = this.prng.seed;
		const ruleTable = this.dex.formats.getRuleTable(this.format);
		const pokemon: RandomTeamsTypes.RandomSet[] = [];

		// For Monotype
		const isMonotype = !!this.forceMonotype || ruleTable.has('sametypeclause');
		const typePool = this.dex.types.names();
		const type = this.forceMonotype || this.sample(typePool);

		const baseFormes: {[k: string]: number} = {};

		const typeCount: {[k: string]: number} = {};
		const typeComboCount: {[k: string]: number} = {};
		const typeWeaknesses: {[k: string]: number} = {};
		const typeDoubleWeaknesses: {[k: string]: number} = {};
		const teamDetails: RandomTeamsTypes.TeamDetails = {};
		let numMaxLevelPokemon = 0;

		const pokemonList = [];
		for (const poke of Object.keys(this.randomData)) {
			if (this.randomData[poke]?.moves) {
				pokemonList.push(poke);
			}
		}

		const [pokemonPool, baseSpeciesPool] = this.getPokemonPool(type, pokemon, isMonotype, pokemonList);
		while (baseSpeciesPool.length && pokemon.length < this.maxTeamSize) {
			const baseSpecies = this.sampleNoReplace(baseSpeciesPool);
			const species = this.dex.species.get(this.sample(pokemonPool[baseSpecies]));
			if (!species.exists) continue;

			// Limit to one of each species (Species Clause)
			if (baseFormes[species.baseSpecies]) continue;

			const types = species.types;
			const typeCombo = types.slice().sort().join();
			// Dynamically scale limits for different team sizes. The default and minimum value is 1.
			const limitFactor = Math.round(this.maxTeamSize / 6) || 1;

			if (!isMonotype && !this.forceMonotype) {
				let skip = false;

				// Limit two of any type
				for (const typeName of types) {
					if (typeCount[typeName] >= 2 * limitFactor) {
						skip = true;
						break;
					}
				}
				if (skip) continue;

				// Limit three weak to any type, and one double weak to any type
				for (const typeName of this.dex.types.names()) {
					// it's weak to the type
					if (this.dex.getEffectiveness(typeName, species) > 0) {
						if (!typeWeaknesses[typeName]) typeWeaknesses[typeName] = 0;
						if (typeWeaknesses[typeName] >= 3 * limitFactor) {
							skip = true;
							break;
						}
					}
					if (this.dex.getEffectiveness(typeName, species) > 1) {
						if (!typeDoubleWeaknesses[typeName]) typeDoubleWeaknesses[typeName] = 0;
						if (typeDoubleWeaknesses[typeName] >= 1 * limitFactor) {
							skip = true;
							break;
						}
					}
				}
				if (skip) continue;

				// Limit one level 100 Pokemon
				if (!this.adjustLevel && numMaxLevelPokemon >= limitFactor && this.getLevel(species) === 100) continue;
			}

			// Limit three of any type combination in Monotype
			if (!this.forceMonotype && isMonotype && (typeComboCount[typeCombo] >= 3 * limitFactor)) continue;

			const set = this.randomSet(species, teamDetails);

			// Okay, the set passes, add it to our team
			pokemon.push(set);
			// Don't bother tracking details for the last Pokemon
			if (pokemon.length === this.maxTeamSize) break;

			// Now that our Pokemon has passed all checks, we can increment our counters
			baseFormes[species.baseSpecies] = 1;

			// Increment type counters
			for (const typeName of types) {
				if (typeName in typeCount) {
					typeCount[typeName]++;
				} else {
					typeCount[typeName] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Increment weakness counter
			for (const typeName of this.dex.types.names()) {
				// it's weak to the type
				if (this.dex.getEffectiveness(typeName, species) > 0) {
					typeWeaknesses[typeName]++;
				}
				if (this.dex.getEffectiveness(typeName, species) > 1) {
					typeDoubleWeaknesses[typeName]++;
				}
			}

			// Increment level 100 counter
			if (set.level === 100) numMaxLevelPokemon++;

			// Track what the team has
			if (set.moves.includes('spikes') || set.moves.includes('ceaselessedge')) {
				teamDetails.spikes = (teamDetails.spikes || 0) + 1;
			}
			if (set.moves.includes('stealthrock') || set.moves.includes('stoneaxe')) {
				teamDetails.stealthRock = 1;
			}
		}
		if (pokemon.length < this.maxTeamSize && pokemon.length < 12) { // large teams sometimes cannot be built
			throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
		}

		return pokemon;
	}
}

export default RandomLegendsTeams;
