import {TeamValidator} from '../../../sim/team-validator';

export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Abilities', 'Obtainable Formes', 'EV Limit = 0', 'Obtainable Misc', 'Sketch Post-Gen 7 Moves'],
		onChangeSet(set) {
			set.evs = TeamValidator.fillStats(null, 0);
		},
	},
};
