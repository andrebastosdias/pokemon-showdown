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
		onStart(target) {
			this.add('-start', target, 'splinters');
			this.effectState.damage = 20;
		},
		onEnd(target) {
			this.add('-end', target, 'splinters');
		},
		onResidualOrder: 5,
		onResidualSubOrder: 1,
		onResidual(target) {
			this.damage(this.effectState.damage, target);
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
		onModifyAccuracy(accuracy, target, source, move) {
			return this.chainModify(0.66);
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
			target.storedStats.atk = newatk;
			target.storedStats.def = newdef;
		},
		onRestart(target) {
			this.add('-start', target, 'stanceswap');
			this.effectState.duration = 5;
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, 'stanceswap');
			const newatk = pokemon.storedStats.def;
			const newdef = pokemon.storedStats.atk;
			pokemon.storedStats.atk = newatk;
			pokemon.storedStats.def = newdef;
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
