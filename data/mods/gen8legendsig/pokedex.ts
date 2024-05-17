export const Pokedex: {[k: string]: ModdedSpeciesData} = {
	cherrimsunshine: {
		inherit: true,
		baseStats: {hp: 70, atk: 90, def: 70, spa: 87, spd: 117, spe: 85},
	},
	arceus: {
		inherit: true,
		otherFormes: ["Arceus-Bug", "Arceus-Dark", "Arceus-Dragon", "Arceus-Electric", "Arceus-Fairy", "Arceus-Fighting", "Arceus-Fire", "Arceus-Flying", "Arceus-Ghost", "Arceus-Grass", "Arceus-Ground", "Arceus-Ice", "Arceus-Poison", "Arceus-Psychic", "Arceus-Rock", "Arceus-Steel", "Arceus-Water", "Arceus-Legend"],
		formeOrder: [
			"Arceus", "Arceus-Fighting", "Arceus-Flying", "Arceus-Poison", "Arceus-Ground", "Arceus-Rock", "Arceus-Bug", "Arceus-Ghost", "Arceus-Steel",
			"Arceus-Fire", "Arceus-Water", "Arceus-Grass", "Arceus-Electric", "Arceus-Psychic", "Arceus-Ice", "Arceus-Dragon", "Arceus-Dark", "Arceus-Fairy",
			"Arceus-Legend"
		],
	},
	arceuslegend: {
		inherit: true,
		num: 493,
		name: "Arceus-Legend",
		baseSpecies: "Arceus",
		forme: "Legend",
		types: ["Normal"],
		gender: "N",
		baseStats: {hp: 120, atk: 120, def: 120, spa: 120, spd: 120, spe: 120},
		abilities: {0: "Multitype"},
		heightm: 3.2,
		weightkg: 320,
		color: "White",
		eggGroups: ["Undiscovered"],
		changesFrom: "Arceus",
	},
};
