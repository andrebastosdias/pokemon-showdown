import {Utils} from "../../../lib";

export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Formes', 'EV Limit = 0', 'Obtainable Misc'],
		onChangeSet(set) {
			const species = this.dex.species.get(set.species);
			const item = this.dex.items.get(Utils.getString(set.item));
			if (item.id) {
				set.item = '';
			}
			set.ability = species.abilities['0'];
		},
	},
};
