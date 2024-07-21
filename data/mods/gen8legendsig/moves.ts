import {Battle} from "../../../sim";

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	hiddenpower: {
		inherit: true,
		basePower: 50,
		onModifyType(move, pokemon, target) {
			const all_types = this.dex.types.names(); // TODO .filter(x => x !== "Fairy");
			const best_types = getAllMaxValues(all_types, x => getTypeEffectiveness(this, x, target));
			move.type = this.sample(best_types);
		},
	},
	hiddenpowerbug: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerdark: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerdragon: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerelectric: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerfighting: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerfire: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerflying: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerghost: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowergrass: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerground: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerice: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerpoison: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerpsychic: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerrock: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowersteel: {
		inherit: true,
		isNonstandard: "Past",
	},
	hiddenpowerwater: {
		inherit: true,
		isNonstandard: "Past",
	},
	judgment: {
		inherit: true,
		pp: 5,
		onModifyType(move, pokemon, target) {
			if (pokemon.species.baseSpecies !== 'Arceus') return;
			if (pokemon.species.id !== 'arceuslegend') {
				move.type = pokemon.species.types[0];
				return;
			}

			const all_types = this.dex.types.names();
			let best_types = getAllMaxValues(all_types, x => getTypeEffectiveness(this, x, target));
			for (const type of target.getTypes()) {
				best_types = getAllMaxValues(best_types, x => getTypeEffectiveness(this, type, x), true);
			}
			const newType = this.sample(best_types);
			if (newType !== pokemon.species.types.join()) {
				pokemon.formeChange('Arceus-' + newType, this.effect, false, '[msg]');
			}
			move.type = newType;
		},
	},
};

function getTypeEffectiveness(
	battle: Battle,
	source: {type: string} | string,
	target: {getTypes: () => string[]} | {types: string[]} | string[] | string
) {
	return battle.dex.getImmunity(source, target) ? battle.dex.getEffectiveness(source, target) : -100;
}

function getAllMaxValues<T>(arr: readonly T[], fn: (item: T) => number, min = false) {
	if (arr.length === 0) return [];
	const maxVal = (min ? Math.min : Math.max)(...arr.map(item => fn(item)));
	return arr.filter(item => fn(item) === maxVal);
}
