export const Rulesets: {[k: string]: ModdedFormatData} = {
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
