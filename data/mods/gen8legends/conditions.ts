export const Conditions: {[id: string]: ModdedConditionData} = {
	arceus: {
		name: 'Arceus',
		onTypePriority: 1,
		onType(types, pokemon) {
			if (pokemon.ability !== 'multitype') return types;
			let type: string | undefined = 'Normal';
			if (pokemon.species.baseSpecies === 'Arceus') {
				type = pokemon.species.types[0];
			}
			return [type];
		},
	},
};
