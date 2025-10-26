export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {
	standard: {
		inherit: true,
		ruleset: [
			'Obtainable', 'Species Clause', 'Nickname Clause', 'Endless Battle Clause', 'HP Percentage Mod', 'Cancel Mod',
		],
	},
	flatrules: {
		inherit: true,
		effectType: 'ValidatorRule',
		name: 'Flat Rules',
		ruleset: ['Obtainable', 'Species Clause', 'Nickname Clause', 'Item Clause = 1', 'Adjust Level = 50', 'Max Team Size = 3', 'Cancel Mod'],
		banlist: ['Mythical', 'Restricted Legendary'],
	},
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Formes', 'EV Limit = Auto', 'Obtainable Misc'],
		onChangeSet(set) {
			set.ability = this.dex.species.get(set.species).abilities['0'];
		},
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
