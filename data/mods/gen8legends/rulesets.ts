export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {
	standard: {
		inherit: true,
		ruleset: [
			'Obtainable', 'Species Clause', 'Nickname Clause', 'Endless Battle Clause', 'HP Percentage Mod', 'Cancel Mod',
		],
	},
	standarddoubles: {
		inherit: true,
		ruleset: [
			'Obtainable', 'Species Clause', 'Nickname Clause', 'Endless Battle Clause', 'HP Percentage Mod', 'Cancel Mod',
		],
	},
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Formes', 'EV Limit = 0', 'Obtainable Misc'],
		onChangeSet(set) {
			set.item = '';
			set.ability = this.dex.species.get(set.species).abilities['0'];
			set.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
		},
	},
	evasionmovesclause: {
		inherit: true,
		desc: "Bans moves that obscure the user",
		banlist: ['Lunar Blessing', 'Mud Bomb', 'Mud-Slap', 'Octazooka', 'Shadow Force', 'Shelter'],
	},
	teampreview: {
		inherit: true,
		onTeamPreview() {
			this.add('clearpoke');
			for (const pokemon of this.getAllPokemon()) {
				this.add('poke', pokemon.side.id, pokemon.details, '');
			}
			this.makeRequest('teampreview');
		},
	},
};
