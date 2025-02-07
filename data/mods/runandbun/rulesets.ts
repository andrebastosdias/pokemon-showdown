import {TeamValidator} from "../../../sim/team-validator";

export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Abilities', 'Obtainable Formes', 'EV Limit = 0', 'Obtainable Misc', 'Sketch Post-Gen 7 Moves'],
		onChangeSet(set) {
			set.evs = TeamValidator.fillStats(null, 0);
		},
	},
	obtainableabilities: {
		inherit: true,
		onValidateSet(set) {
			const species = this.dex.species.get(set.species || set.name);
			const ability = this.toID(set.ability);
			if (species.num >= 387 && species.num <= 395) {
				if (ability !== this.toID(species.abilities['H'])) {
					return [`${species.name} must have its Hidden Ability.`];
				}
			} else {
				if (ability !== this.toID(species.abilities['0']) && ability !== this.toID(species.abilities['1'])) {
					return [`${species.name} cannot have its Hidden Ability.`];
				}
			}
		},
	},
};
