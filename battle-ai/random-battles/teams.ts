import {RandomLegendsTeams} from '../../data/random-battles/gen8legends/teams';
import {OldRandomBattleSpecies} from '../../data/random-battles/gen8/teams';
import {toID} from '../../sim/dex';
import {Species} from '../../sim/dex-species';
import {Format} from '../../sim/dex-formats';
import {PRNG, PRNGSeed} from '../../sim/prng';

function scale(species: Species, min: string, max: string): number {
	const bst = species.id === 'regigigas' ? 522 : species.bst;
	const minBst = Dex.mod('gen8legends').species.get(min).bst;
	const maxBst = Dex.mod('gen8legends').species.get(max).bst;
	return Math.max(Math.ceil((bst - minBst) / (maxBst - minBst) * 100), 1);
}

function isViable(species: Species, bannedTiers: Species['tier'][]): boolean {
	return !bannedTiers.includes(species.tier) && (
		species.evos.every(evo => bannedTiers.includes(Dex.mod('gen8legends').species.get(evo).tier))
	);
}

class RandomLegendsOUTeams extends RandomLegendsTeams {
	nfeRandomData: {[species: string]: OldRandomBattleSpecies} = require('./data-nfe.json');
	lcRandomData: {[species: string]: OldRandomBattleSpecies} = require('./data-lc.json');
	randomData: {[species: string]: OldRandomBattleSpecies} = Object.assign(
		{}, this.randomData, this.nfeRandomData, this.lcRandomData,
	);

	readonly tierWeights: Partial<Record<Species['tier'], number>> = {
		OU: 10,
		UUBL: 2,
		UU: 1,
	};
	readonly customWeights: {[k: string]: number} = {};

	getLevel(): number {
		return 100;
	}

	getNature(
		set: RandomTeamsTypes.RandomSet
	): string {
		const guess = new BattleStatGuesser(this.format).guess(set);
		if (guess) {
			for (const nature of this.dex.natures.all()) {
				if (nature.plus === guess.plusStat && nature.minus === guess.minusStat) {
					return nature.name;
				}
			}
		}
		return 'Serious';
	}

	randomSet(
		species: string | Species,
		teamDetails: RandomTeamsTypes.TeamDetails = {},
	): RandomTeamsTypes.RandomSet {
		species = this.dex.species.get(species);
		const set = super.randomSet(species, teamDetails);
		set.nature = this.getNature(set);
		return set;
	}

	getPokemonWeight(species: Species): number {
		if (this.format.id === 'gen8legendsou') {
			if (species.tier === 'OU') {
				return this.customWeights[species.id] || scale(species, 'unown', 'cresselia');
			}
			return 0;
		}
		return this.customWeights[species.id] || this.tierWeights[species.tier] || 0;
	}

	getPokemonPool(
		type: string,
		pokemonToExclude: RandomTeamsTypes.RandomSet[] = [],
		isMonotype = false,
		pokemonList: string[]
	): [{[k: string]: string[]}, string[]] {
		const exclude = pokemonToExclude.map(p => toID(p.species));
		const baseSpeciesPool = [];
		for (const pokemon of pokemonList) {
			let species = this.dex.species.get(pokemon);
			if (exclude.includes(species.id)) continue;
			if (isMonotype) {
				if (!species.types.includes(type)) continue;
				if (typeof species.battleOnly === 'string') {
					species = this.dex.species.get(species.battleOnly);
					if (!species.types.includes(type)) continue;
				}
			}

			const weight = this.getPokemonWeight(species);
			for (let i = 0; i < weight; i++) baseSpeciesPool.push(pokemon);
		}
		return [{}, baseSpeciesPool];
	}

	getTypePool(): readonly string[] {
		return this.dex.types.names();
	}

	randomTeam() {
		const seed = this.prng.seed;
		const ruleTable = this.dex.formats.getRuleTable(this.format);
		const pokemon: RandomTeamsTypes.RandomSet[] = [];

		// For Monotype
		const isMonotype = !!this.forceMonotype || ruleTable.has('sametypeclause');
		const typePool = this.getTypePool();
		const type = this.forceMonotype || this.sample(typePool);

		const baseFormes: {[k: string]: number} = {};

		const typeCount: {[k: string]: number} = {};
		const typeComboCount: {[k: string]: number} = {};
		const typeWeaknesses: {[k: string]: number} = {};
		const typeDoubleWeaknesses: {[k: string]: number} = {};
		const teamDetails: RandomTeamsTypes.TeamDetails = {};

		const pokemonList = [];
		for (const poke of Object.keys(this.randomData)) {
			if (this.randomData[poke]?.moves) {
				pokemonList.push(poke);
			}
		}

		const speciesPool = this.getPokemonPool(type, pokemon, isMonotype, pokemonList)[1];
		while (speciesPool.length && pokemon.length < this.maxTeamSize) {
			const baseSpecies: string = this.sampleNoReplace(speciesPool);
			const species = this.dex.species.get(baseSpecies);
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

			// Track what the team has
			if (set.moves.includes('spikes') || set.moves.includes('ceaselessedge')) teamDetails.spikes = (teamDetails.spikes || 0) + 1;
			if (set.moves.includes('stealthrock') || set.moves.includes('stoneaxe')) teamDetails.stealthRock = 1;
		}
		if (pokemon.length < this.maxTeamSize && pokemon.length < 12) { // large teams sometimes cannot be built
			throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
		}

		this.prng.shuffle(pokemon);
		return pokemon;
	}
}

class RandomLegendsUbersTeams extends RandomLegendsOUTeams {
	readonly tierWeights: Partial<Record<Species['tier'], number>> = {
		Uber: 30,
		OU: 1,
	};
	readonly customWeights: {[k: string]: number} = {
		'arceusfairy': 10 * 17,
		'dialga': 30 * 2 / 10,
		'dialgaorigin': 30 * 2 * 9 / 10,
		'giratina': 30 * 2 / 5,
		'giratinaorigin': 30 * 2 * 4 / 5,
		'palkia': 30 * 2 / 10,
		'palkiaorigin': 30 * 2 * 9 / 10,
	};
}

class RandomLegendsUUTeams extends RandomLegendsOUTeams {
	readonly tierWeights: Partial<Record<Species['tier'], number>> = {
		UU: 1,
	};
	readonly customWeights: {[k: string]: number} = {};

	getPokemonWeight(species: Species): number {
		if (!isViable(species, ['AG', 'Uber', 'OU', 'UUBL'])) return 0;

		return this.customWeights[species.id] || scale(species, 'kricketot', 'cresselia');
	}
}

class RandomLegendsLCTeams extends RandomLegendsOUTeams {
	readonly tierWeights: Partial<Record<Species['tier'], number>> = {
		'LC': 1,
	};
	readonly customWeights: {[k: string]: number} = {
		// banned LC
		'scyther': 0,
		'sneasel': 0,
		'sneaselhisui': 0,

		// LC from other tiers
	};

	getLevel(): number {
		return 5;
	}

	getPokemonWeight(species: Species): number {
		if (
			(species.prevo && this.dex.species.get(species.prevo).gen <= this.gen) || !species.nfe
		) return 0;

		return this.customWeights[species.id] || scale(species, 'kricketot', 'scyther');
	}
}

class RandomLegendsMonotypeTeams extends RandomLegendsOUTeams {
	readonly typeWeights: Record<TypeInfo['name'], number> = {
		'Bug': 1,
		'Dark': 1,
		'Dragon': 0, // there are only 2 not-banned fully-evolved dragon-type Pokemon (Garchomp and Goodra)
		'Electric': 1,
		'Fairy': 1,
		'Fighting': 1,
		'Fire': 1,
		'Flying': 1,
		'Ghost': 1,
		'Grass': 1,
		'Ground': 1,
		'Ice': 1,
		'Normal': 1,
		'Poison': 1,
		'Psychic': 1,
		'Rock': 1,
		'Steel': 1,
		'Water': 1,
	};

	getPokemonWeight(species: Species): number {
		if (!isViable(species, ['AG', 'Uber'])) return 0;

		return this.customWeights[species.id] || (
			species.tier === 'OU' ? scale(species, 'unown', 'cresselia') * 10 : scale(species, 'kricketot', 'cresselia')
		);
	}

	getTypePool(): string[] {
		const typePool = [];
		for (const type of this.dex.types.names()) {
			const weight = this.typeWeights[type];
			for (let i = 0; i < weight; i++) typePool.push(type);
		}
		return typePool;
	}
}

class BattleStatGuesser {
	format: Format;
	dex: ModdedDex;
	moveCount: {[move: string]: number} = {};
	hasMove: {[moveid: string]: 1} = {};

	constructor(format: Format | string) {
		format = Dex.formats.get(format);
		this.format = format;
		this.dex = Dex.forFormat(format);
	}

	guess(set: RandomTeamsTypes.RandomSet): {plusStat: StatID, minusStat: StatID} | null {
		const role = this.guessRole(set);
		const comboEVs = this.guessEVs(set, role);
		return comboEVs;
	}

	guessRole(set: RandomTeamsTypes.RandomSet): string | null {
		if (!set) return null;
		if (!set.moves) return null;

		const moveCount = {
			'Physical': 0,
			'Special': 0,
			'PhysicalAttack': 0,
			'SpecialAttack': 0,
			'PhysicalSetup': 0,
			'SpecialSetup': 0,
			'Support': 0,
			'Setup': 0,
			'Restoration': 0,
			'Offense': 0,
			'Stall': 0,
			'SpecialStall': 0,
			'PhysicalStall': 0,
			'Fast': 0,
			'Ultrafast': 0,
			'bulk': 0,
			'specialBulk': 0,
			'physicalBulk': 0,
		};

		const hasMove: {[moveid: string]: 1} = {};

		const species = this.dex.species.get(set.species || set.name);
		if (!species.exists) return null;
		const stats = species.baseStats;

		for (let i = 0, len = set.moves.length; i < len; i++) {
			const move = this.dex.moves.get(set.moves[i]);
			hasMove[move.id] = 1;
			if (move.category === 'Status') {
				if (move.heal) {
					moveCount['Restoration']++;
					moveCount['Stall']++;
				} else if (move.target === 'self') {
					if (['bulkup', 'swordsdance', 'victorydance'].includes(move.id)) {
						moveCount['PhysicalSetup']++;
					} else if (['calmmind', 'nastyplot', 'takeheart'].includes(move.id)) {
						moveCount['SpecialSetup']++;
					}
					moveCount['Setup']++;
				}
			} else {
				moveCount[move.category]++;
				moveCount['Offense']++;
			}
		}
		moveCount['PhysicalAttack'] = moveCount['Physical'];
		moveCount['Physical'] += moveCount['PhysicalSetup'];
		moveCount['SpecialAttack'] = moveCount['Special'];
		moveCount['Special'] += moveCount['SpecialSetup'];

		if (hasMove['esperwing'] || hasMove['victorydance'] || species.id === 'electrodehisui') moveCount['Ultrafast'] = 1;

		let isFast = (stats.spe >= 80);
		let physicalBulk = (stats.hp + 75) * (stats.def + 87);
		let specialBulk = (stats.hp + 75) * (stats.spd + 87);

		if (hasMove['acidarmor'] || hasMove['irondefense'] || hasMove['shelter']) {
			physicalBulk *= 1.6;
			moveCount['PhysicalStall']++;
		} else if (hasMove['bulkup'] || hasMove['victorydance']) {
			physicalBulk *= 1.3;
			moveCount['PhysicalStall']++;
		}

		if (hasMove['calmmind'] || hasMove['takeheart']) {
			specialBulk *= 1.3;
			moveCount['SpecialStall']++;
		}

		if (moveCount['Restoration']) {
			physicalBulk *= 1.5;
			specialBulk *= 1.5;
		} else if (hasMove['rest']) {
			physicalBulk *= 1.4;
			specialBulk *= 1.4;
		}
		if (hasMove['thunderwave']) {
			physicalBulk *= 1.1;
			specialBulk *= 1.1;
		}
		if (hasMove['drainpunch']) {
			physicalBulk *= 1.15;
			specialBulk *= 1.15;
		}

		const bulk = physicalBulk + specialBulk;
		if (bulk < 46000 && stats.spe >= 70) isFast = true;
		moveCount['bulk'] = bulk;
		moveCount['physicalBulk'] = physicalBulk;
		moveCount['specialBulk'] = specialBulk;

		if (hasMove['esperwing'] || hasMove['victorydance']) {
			isFast = true;
		}
		moveCount['Fast'] = isFast ? 1 : 0;

		this.moveCount = moveCount;
		this.hasMove = hasMove;

		switch (species.baseSpecies) {
		case 'Magikarp':
			return null;
		case 'Unown':
			return 'Fast Special Sweeper';
		case 'Cascoon': case 'Kricketot': case 'Silcoon': case 'Wurmple':
			return 'Bulky Physical Sweeper';
		case 'Burmy':
			return 'Bulky Special Sweeper';
		}

		if (moveCount['PhysicalStall'] && moveCount['Restoration']) {
			if (stats.spe > 110) return 'Fast Bulky Support';
			return 'Specially Defensive';
		}
		if (moveCount['SpecialStall'] && moveCount['Restoration']) {
			if (stats.spe > 110) return 'Fast Bulky Support';
			return 'Physically Defensive';
		}

		let offenseBias: 'Physical' | 'Special' = 'Physical';
		if (stats.spa > stats.atk && moveCount['Special'] > 1) offenseBias = 'Special';
		else if (stats.atk > stats.spa && moveCount['Physical'] > 1) offenseBias = 'Physical';
		else if (moveCount['Special'] > moveCount['Physical']) offenseBias = 'Special';

		if (moveCount['Stall'] + moveCount['Support'] / 2 <= 2 && bulk < 135000 && moveCount[offenseBias] >= 1.5) {
			if (isFast) {
				if (bulk > 80000 && stats.spe <= 100 && !moveCount['Ultrafast']) return 'Bulky ' + offenseBias + ' Sweeper';
				return 'Fast ' + offenseBias + ' Sweeper';
			} else {
				if (moveCount[offenseBias] >= 3 || moveCount['Stall'] <= 0) {
					return 'Bulky ' + offenseBias + ' Sweeper';
				}
			}
		}

		if (isFast) {
			if (stats.spe > 100 || bulk < 55000 || moveCount['Ultrafast']) {
				return 'Fast Bulky Support';
			}
		}
		if (moveCount['SpecialStall']) return 'Physically Defensive';
		if (moveCount['PhysicalStall']) return 'Specially Defensive';
		if (specialBulk >= physicalBulk) return 'Specially Defensive';
		return 'Physically Defensive';
	}

	guessEVs(set: RandomTeamsTypes.RandomSet, role: string | null): {plusStat: StatID, minusStat: StatID} | null {
		if (!set) return null;
		if (role === null) return null;
		const species = this.dex.species.get(set.species || set.name);
		const stats = species.baseStats;

		const moveCount = this.moveCount;

		let plusStat: StatID;
		let minusStat: StatID;

		const statChart: {[role: string]: [StatID, StatID]} = {
			'Fast Physical Sweeper': ['spe', 'atk'],
			'Fast Special Sweeper': ['spe', 'spa'],
			'Bulky Physical Sweeper': ['atk', 'hp'],
			'Bulky Special Sweeper': ['spa', 'hp'],
			'Fast Bulky Support': ['spe', 'hp'],
			'Physically Defensive': ['def', 'hp'],
			'Specially Defensive': ['spd', 'hp'],
		};

		plusStat = statChart[role][0];
		if (role === 'Fast Bulky Support') moveCount['Ultrafast'] = 0;
		if (plusStat === 'spe' && moveCount['Ultrafast']) {
			if (statChart[role][1] === 'atk' || statChart[role][1] === 'spa') {
				plusStat = statChart[role][1];
			} else if (moveCount['Physical'] >= 3) {
				plusStat = 'atk';
			} else if (stats.spd > stats.def) {
				plusStat = 'spd';
			} else {
				plusStat = 'def';
			}
		}

		if (!moveCount['PhysicalAttack']) {
			minusStat = 'atk';
		} else if (moveCount['SpecialAttack'] < 1) {
			if (moveCount['SpecialAttack'] < moveCount['PhysicalAttack']) {
				minusStat = 'spa';
			} else {
				minusStat = 'atk';
			}
		} else if (moveCount['PhysicalAttack'] < 1) {
			minusStat = 'atk';
		} else if (stats.def > stats.spe && stats.spd > stats.spe) {
			minusStat = 'spe';
		} else if (stats.def > stats.spd) {
			minusStat = 'spd';
		} else {
			minusStat = 'def';
		}

		if (plusStat === minusStat) {
			minusStat = (plusStat === 'spe' ? 'spd' : 'spe');
		}

		return {plusStat, minusStat};
	}
}

export const LegendsTeams = new class LegendsTeams {
	getGenerator(format: Format | string, seed: PRNG | PRNGSeed | null = null) {
		let TeamGenerator;
		switch (toID(format)) {
		case 'gen8legendsou':
			TeamGenerator = RandomLegendsOUTeams;
			break;
		case 'gen8legendsubers':
			TeamGenerator = RandomLegendsUbersTeams;
			break;
		case 'gen8legendsuu':
			TeamGenerator = RandomLegendsUUTeams;
			break;
		case 'gen8legendslc':
			TeamGenerator = RandomLegendsLCTeams;
			break;
		case 'gen8legendsmonotype':
			TeamGenerator = RandomLegendsMonotypeTeams;
			break;
		}

		return new (TeamGenerator as typeof RandomLegendsTeams)(format, seed);
	}

	generate(format: Format | string, options: PlayerOptions | null = null): PokemonSet[] {
		return this.getGenerator(format, options?.seed).getTeam(options);
	}
}();

export default LegendsTeams;
