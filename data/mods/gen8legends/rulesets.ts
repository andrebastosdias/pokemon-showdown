import { Utils } from "../../../lib";

export const Rulesets: {[k: string]: ModdedFormatData} = {
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Formes', 'EV Limit = 0', 'Obtainable Misc'],
		onValidateSet(set) {
			const species = this.dex.species.get(set.species);
			let item = this.dex.items.get(Utils.getString(set.item));
			if (item.id) {
				set.item = '';
			}
			set.ability = species.abilities['0'];
		},
	},
	// teampreview: {
	// 	inherit: true,
	// 	onTeamPreview() {
	// 		this.add('clearpoke');
	// 		for (const pokemon of this.getAllPokemon()) {
	// 			this.add('poke', pokemon.side.id, pokemon.details, '');
	// 		}
	// 		this.makeRequest('teampreview');
	// 	},
	// },
};
