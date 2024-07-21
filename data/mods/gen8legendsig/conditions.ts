export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {
	raindance: {
		inherit: true,
		onWeatherModifyDamage(damage, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(0.75);
			}
		},
	},
	sunnyday: {
		inherit: true,
		onWeatherModifyDamage() {},
		onModifySpe(spe, pokemon) {
			if (pokemon.hasType('Grass') && this.field.isWeather('sunnyday')) {
				return this.modify(spe, [4, 3]);
			}
		},
	},
	snow: {
		inherit: true,
		onModifyDef() {},
		onModifySpe(spe, pokemon) {
			if (pokemon.hasType('Ice') && this.field.isWeather('snow')) {
				return this.modify(spe, [4, 3]);
			}
		},
	},
};
