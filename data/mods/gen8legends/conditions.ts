export const Conditions: {[id: string]: ModdedConditionData} = {
	arceus: {
		inherit: true,
		onType(types, pokemon) {
			if (pokemon.species.baseSpecies !== 'Arceus') return types;
			return [pokemon.species.types[0]];
		},
	},
	regigigas: {
		name: "Regigigas",
		onStart(pokemon) {
			pokemon.addVolatile('slowstart');
		},
	},
	slowstart: {
		name: "Slow Start",
		duration: 5,
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onStart(target) {
			this.add('-start', target, 'Slow Start');
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			return this.chainModify(0.5);
		},
		onModifySpe(spe, pokemon) {
			return this.chainModify(0.5);
		},
		onEnd(target) {
			this.add('-end', target, 'Slow Start');
		},
	},
	cherrim: {
		name: 'Cherrim',
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (!pokemon.isActive || pokemon.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (!pokemon.hp) return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				if (pokemon.species.id !== 'cherrimsunshine') {
					pokemon.formeChange('Cherrim-Sunshine', this.effect, false, '[msg]');
				}
			} else {
				if (pokemon.species.id === 'cherrimsunshine') {
					pokemon.formeChange('Cherrim', this.effect, false, '[msg]');
				}
			}
		},
		onAllyModifyAtkPriority: 3,
		onAllyModifyAtk(atk, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onAllyModifySpDPriority: 4,
		onAllyModifySpD(spd, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
	}
};
