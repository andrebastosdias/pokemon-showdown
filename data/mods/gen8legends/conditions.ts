export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {
	brn: {
		inherit: true,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 12);
		},
	},
	par: {
		inherit: true,
		onBeforeMove(pokemon) {
			if (this.randomChance(1, 3)) {
				this.add('cant', pokemon, 'par');
				return false;
			}
		},
	},
	slp: {
		inherit: true,
		onStart(target) {
			this.add('-status', target, 'slp');
		},
		onBeforeMovePriority: 1,
		// implemented here to match Burn's defrost
		onBeforeMove(pokemon, target, move) {
			if (['spark', 'volttackle', 'wildcharge'].includes(move.id)) return;
			if (this.randomChance(1, 3)) {
				this.add('cant', pokemon, 'slp');
				return false;
			}
		},
		onModifyMove(move, pokemon) {
			if (['spark', 'volttackle', 'wildcharge'].includes(move.id)) {
				this.add('-curestatus', pokemon, 'slp', '[from] move: ' + move);
				pokemon.clearStatus();
			}
		},
	},
	frz: {
		inherit: true,
		onResidualOrder: 10,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 12);
		},
		onBeforeMove() {},
		onModifyMove() {},
		onAfterMoveSecondary() {},
		onDamagingHit() {},
	},
	psn: {
		inherit: true,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 6);
		},
	},
	arceus: {
		inherit: true,
		onType: undefined,
	},
	cherrim: {
		name: "Cherrim",
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (!pokemon.isActive || pokemon.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (!pokemon.hp) return;
			if (['', 'sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				if (pokemon.species.id !== 'cherrimsunshine') {
					pokemon.formeChange('Cherrim-Sunshine', this.effect, false, '0', '[msg]');
				}
			} else {
				if (pokemon.species.id === 'cherrimsunshine') {
					pokemon.formeChange('Cherrim', this.effect, false, '0', '[msg]');
				}
			}
		},
	},
	regigigas: {
		name: "Regigigas",
		duration: 5,
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onStart(target) {
			this.add('-start', target, 'Slow Start');
		},
		onResidual(pokemon) {
			if (!pokemon.activeTurns) {
				this.effectState.duration += 1;
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk() {
			return this.chainModify(0.5);
		},
		onModifySpe() {
			return this.chainModify(0.5);
		},
		onEnd(target) {
			this.add('-end', target, 'Slow Start');
		},
	},
	fixated: {
		name: 'fixated',
		duration: 2,
		onStart(target, source, sourceEffect) {
			this.add('-start', target, 'fixated', '[from] move: ' + sourceEffect.name);
			this.effectState.move = sourceEffect.id;
		},
		onEnd(target) {
			this.add('-end', target, 'fixated');
		},
	},
	splinters: {
		name: 'splinters',
		onStart(target, source, sourceEffect) {
			this.add('-start', target, 'splinters');
			this.effectState.type = (sourceEffect as ActiveMove).type;

			const basePower = 25;
			const level = source.level;
			const attack = source.calculateStat('atk', source.boosts.atk);
			const defense = target.calculateStat('def', target.boosts.def);
			const tr = this.trunc;
			this.effectState.baseDamage = tr(tr((100 + attack + 15 * level) * basePower / (50 + defense)) / 5);
		},
		onEnd(target) {
			this.add('-end', target, 'splinters');
		},
		onResidualOrder: 13,
		onResidual(target) {
			const tr = this.trunc;
			// damage is recalculated every time because of Arceus-Legend's type changes
			if (!this.dex.getImmunity(this.effectState.type, target)) {
				// this only happens if Arceus-Legend is hit by spikes and then changes to a Flying type
				this.damage(0, target);
				return;
			}
			let typeMod = this.dex.getEffectiveness(this.effectState.type, target);
			typeMod = this.clampIntRange(typeMod, -2, 2);
			let typeModMultiplier = 1;
			if (typeMod === 1) typeModMultiplier = 2;
			else if (typeMod === 2) typeModMultiplier = 2.5;
			else if (typeMod === -1) typeModMultiplier = 0.5;
			else if (typeMod === -2) typeModMultiplier = 0.4;
			let damage = tr(this.effectState.baseDamage * typeModMultiplier);
			if (!damage) damage = 1;
			this.damage(tr(damage, 16), target);
		},
	},
	obscured: {
		name: 'obscured',
		onStart(target) {
			this.add('-start', target, 'obscured');
		},
		onEnd(target) {
			this.add('-end', target, 'obscured');
		},
		onModifyAccuracy() {
			return this.chainModify(0.66); // TODO: check if the multiplier is correct
		},
	},
	primed: {
		name: 'primed',
		onStart(target) {
			this.add('-start', target, 'primed');
		},
		onEnd(target) {
			this.add('-end', target, 'primed');
		},
	},
	stanceswap: {
		name: 'stanceswap',
		onStart(target) {
			this.add('-start', target, 'stanceswap');
			const newatk = target.storedStats.def;
			const newdef = target.storedStats.atk;
			const newspa = target.storedStats.spd;
			const newspd = target.storedStats.spa;
			target.storedStats.atk = newatk;
			target.storedStats.def = newdef;
			target.storedStats.spa = newspa;
			target.storedStats.spd = newspd;
		},
		onRestart(target) {
			this.add('-start', target, 'stanceswap');
			this.effectState.duration = 5;
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, 'stanceswap');
			const newatk = pokemon.storedStats.def;
			const newdef = pokemon.storedStats.atk;
			const newspa = pokemon.storedStats.spd;
			const newspd = pokemon.storedStats.spa;
			pokemon.storedStats.atk = newatk;
			pokemon.storedStats.def = newdef;
			pokemon.storedStats.spa = newspa;
			pokemon.storedStats.spd = newspd;
		},
	},
	powerboost: {
		name: 'powerboost',
		onStart(target) {
			this.add('-start', target, 'powerboost');
		},
		onEnd(target) {
			this.add('-end', target, 'powerboost');
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'powerdrop') {
				target.removeVolatile('powerboost');
				return null;
			}
		},
	},
	powerdrop: {
		name: 'powerdrop',
		onStart(target) {
			this.add('-start', target, 'powerdrop');
		},
		onEnd(target) {
			this.add('-end', target, 'powerdrop');
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'powerboost') {
				target.removeVolatile('powerdrop');
				return null;
			}
		},
	},
	guardboost: {
		name: 'guardboost',
		onStart(target) {
			this.add('-start', target, 'guardboost');
		},
		onEnd(target) {
			this.add('-end', target, 'guardboost');
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'guarddrop') {
				target.removeVolatile('guardboost');
				return null;
			}
		},
	},
	guarddrop: {
		name: 'guarddrop',
		onStart(target) {
			this.add('-start', target, 'guarddrop');
		},
		onEnd(target) {
			this.add('-end', target, 'guarddrop');
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'guardboost') {
				target.removeVolatile('guarddrop');
				return null;
			}
		},
	},
};
