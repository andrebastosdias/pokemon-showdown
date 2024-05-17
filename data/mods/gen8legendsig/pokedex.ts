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
};
