export const Rulesets: {[k: string]: ModdedFormatData} = {
	evasionmovesclause: {
		inherit: true,
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
