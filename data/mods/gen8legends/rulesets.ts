export const Rulesets: {[k: string]: ModdedFormatData} = {
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Formes', 'EV Limit = 0', 'Obtainable Misc'],
		onValidateSet(set) {
			const species = this.dex.species.get(set.species);
			const ability = this.dex.abilities.get(set.ability);
			const item = this.dex.items.get(set.item);

			if (item.id) {
				set.item = '';
			}

			// Cherrim, Regigigas, Arceus
			if (![421, 486, 493].includes(species.num)) {
				set.ability = 'No Ability';
			}

			if (!Object.values(species.abilities).includes(ability.name)) {
				return [`${set.species} can't have ${set.ability}.`];
			}

			if (species.baseSpecies === "Enamorus" && set.shiny) {
				return [`${set.species} must not be shiny.`]
			}
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
