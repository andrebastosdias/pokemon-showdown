export const Scripts: ModdedBattleScriptsData = {
	gen: 8,
	inherit: 'gen8',
	init() {
		this.modData('Abilities', 'noability').isNonstandard = null;
		for (const i in this.data.Pokedex) {
			// Cherrim, Regigigas
			if (![421, 486].includes(this.modData('Pokedex', i).num)) {
				this.modData('Pokedex', i).abilities = {0: 'No Ability'};
			}
			delete this.modData('Pokedex', i).requiredItem;
			delete this.modData('Pokedex', i).requiredItems;
		}
		for (const i in this.data.Moves) {
			this.modData('Moves', i).noPPBoosts = true;
		}
		// sanity check
		for (const i in this.data.FormatsData) {
			if (['Gigantamax', 'CAP'].includes(this.modData('FormatsData', i).isNonstandard)) {
				this.modData('FormatsData', i).isNonstandard = 'Past';
			}
		}
	},
	/**
	 * Struggle should be able to hit any foe.
	 */
	getRandomTarget(pokemon, move) {
		move = this.dex.moves.get(move);
		if (['self', 'all', 'allySide', 'allyTeam', 'adjacentAllyOrSelf'].includes(move.target)) {
			return pokemon;
		} else if (move.target === 'adjacentAlly') {
			if (this.gameType === 'singles') return null;
			const allies = pokemon.allies();
			return allies.length ? this.sample(allies) : null;
		}
		if (this.gameType === 'singles') return pokemon.side.foe.active[0];

		return pokemon.side.randomFoe() || pokemon.side.foe.active[0];
	},
	/**
	 * Only run onResidual events for the Pokemon that moved, if any.
	 * Run onResidual events before checking its duration.
	 */
	residualEvent(eventid, relayVar) {
		const callbackName = `on${eventid}`;
		let handlers = this.findBattleEventHandlers(callbackName, 'duration');
		handlers = handlers.concat(this.findFieldEventHandlers(this.field, `onField${eventid}`, 'duration'));
		for (const side of this.sides) {
			if (side.n < 2 || !side.allySide) {
				handlers = handlers.concat(this.findSideEventHandlers(side, `onSide${eventid}`, 'duration'));
			}
			for (const active of side.active) {
				if (!active || active.moveThisTurnResult === undefined) continue;
				handlers = handlers.concat(this.findPokemonEventHandlers(active, callbackName, 'duration'));
				handlers = handlers.concat(this.findSideEventHandlers(side, callbackName, undefined, active));
				handlers = handlers.concat(this.findFieldEventHandlers(this.field, callbackName, undefined, active));
			}
		}
		this.speedSort(handlers);
		while (handlers.length) {
			const handler = handlers[0];
			handlers.shift();
			const effect = handler.effect;
			if ((handler.effectHolder as Pokemon).fainted) continue;

			let handlerEventid = eventid;
			if ((handler.effectHolder as Side).sideConditions) handlerEventid = `Side${eventid}`;
			if ((handler.effectHolder as Field).pseudoWeather) handlerEventid = `Field${eventid}`;
			if (handler.callback) {
				this.singleEvent(handlerEventid, effect, handler.state, handler.effectHolder, null, null, relayVar, handler.callback);
			}

			if (!(handler.effectHolder as Pokemon).fainted) {
				if (handler.end && handler.state && handler.state.duration) {
					handler.state.duration--;
					if (!handler.state.duration) {
						const endCallArgs = handler.endCallArgs || [handler.effectHolder, effect.id];
						handler.end.call(...endCallArgs as [any, ...any[]]);
					}
				}
			}

			this.faintMessages();
			if (this.ended) return;
		}
	},
	actions: {
		getDamage(source, target, move, suppressMessages) {
			if (typeof move === 'string') move = this.dex.getActiveMove(move);

			if (typeof move === 'number') {
				const basePower = move;
				move = new Dex.Move({
					basePower,
					type: '???',
					category: 'Physical',
					willCrit: false,
				}) as ActiveMove;
				move.hit = 0;
			}

			if (!move.ignoreImmunity || (move.ignoreImmunity !== true && !move.ignoreImmunity[move.type])) {
				if (!target.runImmunity(move.type, !suppressMessages)) {
					return false;
				}
			}

			if (move.ohko) return target.maxhp;
			if (move.damageCallback) return move.damageCallback.call(this.battle, source, target);
			if (move.damage === 'level') {
				return source.level;
			} else if (move.damage) {
				return move.damage;
			}

			const category = this.battle.getCategory(move);

			let basePower: number | false | null = move.basePower;
			if (move.basePowerCallback) {
				basePower = move.basePowerCallback.call(this.battle, source, target, move);
			}
			if (!basePower) return basePower === 0 ? undefined : basePower;
			basePower = this.battle.clampIntRange(basePower, 1);

			let critMult;
			let critRatio = this.battle.runEvent('ModifyCritRatio', source, target, move, move.critRatio || 0);
			if (this.battle.gen <= 5) {
				critRatio = this.battle.clampIntRange(critRatio, 0, 5);
				critMult = [0, 16, 8, 4, 3, 2];
			} else {
				critRatio = this.battle.clampIntRange(critRatio, 0, 4);
				if (this.battle.gen === 6) {
					critMult = [0, 16, 8, 2, 1];
				} else {
					critMult = [0, 24, 8, 2, 1];
				}
			}

			const moveHit = target.getMoveHitData(move);
			moveHit.crit = move.willCrit || false;
			if (move.willCrit === undefined) {
				if (critRatio) {
					moveHit.crit = this.battle.randomChance(1, critMult[critRatio]);
				}
			}

			if (moveHit.crit) {
				moveHit.crit = this.battle.runEvent('CriticalHit', target, null, move);
			}

			// happens after crit calculation
			basePower = this.battle.runEvent('BasePower', source, target, move, basePower, true);

			if (!basePower) return 0;
			basePower = this.battle.clampIntRange(basePower, 1);
			// Hacked Max Moves have 0 base power, even if you Dynamax
			if ((!source.volatiles['dynamax'] && move.isMax) || (move.isMax && this.dex.moves.get(move.baseMove).isMax)) {
				basePower = 0;
			}

			if (
				basePower < 60 && source.getTypes(true).includes(move.type) && source.terastallized && move.priority <= 0 &&
				// Hard move.basePower check for moves like Dragon Energy that have variable BP
				!move.multihit && !((move.basePower === 0 || move.basePower === 150) && move.basePowerCallback)
			) {
				basePower = 60;
			}

			const level = source.level;

			const attacker = move.overrideOffensivePokemon === 'target' ? target : source;
			const defender = move.overrideDefensivePokemon === 'source' ? source : target;

			const isPhysical = move.category === 'Physical';
			let attackStat: StatIDExceptHP = move.overrideOffensiveStat || (isPhysical ? 'atk' : 'spa');
			const defenseStat: StatIDExceptHP = move.overrideDefensiveStat || (isPhysical ? 'def' : 'spd');

			const statTable = {atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe'};

			let atkBoosts = attacker.boosts[attackStat];
			let defBoosts = defender.boosts[defenseStat];

			let ignoreNegativeOffensive = !!move.ignoreNegativeOffensive;
			let ignorePositiveDefensive = !!move.ignorePositiveDefensive;

			if (moveHit.crit) {
				ignoreNegativeOffensive = true;
				ignorePositiveDefensive = true;
			}
			const ignoreOffensive = !!(move.ignoreOffensive || (ignoreNegativeOffensive && atkBoosts < 0));
			const ignoreDefensive = !!(move.ignoreDefensive || (ignorePositiveDefensive && defBoosts > 0));

			if (ignoreOffensive) {
				this.battle.debug('Negating (sp)atk boost/penalty.');
				atkBoosts = 0;
			}
			if (ignoreDefensive) {
				this.battle.debug('Negating (sp)def boost/penalty.');
				defBoosts = 0;
			}

			let attack = attacker.calculateStat(attackStat, atkBoosts, 1, source);
			let defense = defender.calculateStat(defenseStat, defBoosts, 1, target);

			attackStat = (category === 'Physical' ? 'atk' : 'spa');

			// Apply Stat Modifiers
			attack = this.battle.runEvent('Modify' + statTable[attackStat], source, target, move, attack);
			defense = this.battle.runEvent('Modify' + statTable[defenseStat], target, source, move, defense);

			if (this.battle.gen <= 4 && ['explosion', 'selfdestruct'].includes(move.id) && defenseStat === 'def') {
				defense = this.battle.clampIntRange(Math.floor(defense / 2), 1);
			}

			const tr = this.battle.trunc;

			// int(int(((100 + A) + 15 * L) * B / (50 + D)) / 5);
			const baseDamage = tr(tr((100 + attack + 15 * level) * basePower / (50 + defense)) / 5);

			// Calculate damage modifiers separately (order differs between generations)
			return this.modifyDamage(baseDamage, source, target, move, suppressMessages);
		},
		modifyDamage(baseDamage, pokemon, target, move, suppressMessages) {
			const tr = this.battle.trunc;
			if (!move.type) move.type = '???';
			const type = move.type;

			if (move.spreadHit) {
				// multi-target modifier (doubles only)
				const spreadModifier = move.spreadModifier || (this.battle.gameType === 'freeforall' ? 0.5 : 0.75);
				this.battle.debug('Spread modifier: ' + spreadModifier);
				baseDamage = this.battle.modify(baseDamage, spreadModifier);
			} else if (move.multihitType === 'parentalbond' && move.hit > 1) {
				// Parental Bond modifier
				const bondModifier = this.battle.gen > 6 ? 0.25 : 0.5;
				this.battle.debug(`Parental Bond modifier: ${bondModifier}`);
				baseDamage = this.battle.modify(baseDamage, bondModifier);
			}

			const powerBoost = !!pokemon.getVolatile('powerboost');
			const powerDrop = !!pokemon.getVolatile('powerdrop');
			const guardBoost = !!target.getVolatile('guardboost');
			const guardDrop = !!target.getVolatile('guarddrop');
			if (!((powerBoost && guardBoost) || (powerDrop && guardDrop))) {
				if (powerBoost) baseDamage = baseDamage * 1.5;
				if (powerDrop) baseDamage = baseDamage * 0.66;
				if (guardBoost) baseDamage = baseDamage * 0.66;
				if (guardDrop) baseDamage = baseDamage * 1.5;
				baseDamage = tr(baseDamage);
			}

			// weather modifier
			baseDamage = this.battle.runEvent('WeatherModifyDamage', pokemon, target, move, baseDamage);

			// crit - not a modifier
			const isCrit = target.getMoveHitData(move).crit;
			if (isCrit) {
				baseDamage = tr(baseDamage * (move.critModifier || (this.battle.gen >= 6 ? 1.5 : 2)));
			}

			// random factor - also not a modifier
			baseDamage = this.battle.randomizer(baseDamage);

			// STAB
			// The "???" type never gets STAB
			// Not even if you Roost in Gen 4 and somehow manage to use
			// Struggle in the same turn.
			// (On second thought, it might be easier to get a MissingNo.)
			if (type !== '???') {
				let stab: number | [number, number] = 1;

				const isSTAB = move.forceSTAB || pokemon.hasType(type) || pokemon.getTypes(false, true).includes(type);
				if (isSTAB) {
					stab = 1.25;
				}
				stab = this.battle.runEvent('ModifySTAB', pokemon, target, move, stab);
				baseDamage = this.battle.modify(baseDamage, stab);
			}

			// types
			let typeMod = target.runEffectiveness(move);
			typeMod = this.battle.clampIntRange(typeMod, -6, 6);
			target.getMoveHitData(move).typeMod = typeMod;
			let typeModMultiplier = 1;
			if (typeMod > 0) {
				if (!suppressMessages) this.battle.add('-supereffective', target);
				if (typeMod === 1) typeModMultiplier = 2;
				if (typeMod === 2) typeModMultiplier = 2.5;
			}
			if (typeMod < 0) {
				if (!suppressMessages) this.battle.add('-resisted', target);
				if (typeMod === -1) typeModMultiplier = 0.5;
				if (typeMod === -2) typeModMultiplier = 0.4;
			}
			baseDamage = tr(baseDamage * typeModMultiplier);

			if (isCrit && !suppressMessages) this.battle.add('-crit', target);

			if ((pokemon.status === 'brn' && move.category === 'Physical') ||
				(pokemon.status === 'frz' && move.category === 'Special')) {
				baseDamage = tr(baseDamage / 2);
			}
			if (target.status === 'slp') {
				baseDamage = tr(baseDamage * 1.33);
			}
			if (pokemon.getVolatile('fixated')) {
				baseDamage = tr(baseDamage * 1.5);
			}
			if (target.getVolatile('fixated')) {
				baseDamage = tr(baseDamage * 1.33);
			}
			if (pokemon.getVolatile('primed')) {
				baseDamage = tr(baseDamage * 1.5);
			}

			// Generation 5, but nothing later, sets damage to 1 before the final damage modifiers
			if (this.battle.gen === 5 && !baseDamage) baseDamage = 1;

			// Final modifier. Modifiers that modify damage after min damage check, such as Life Orb.
			baseDamage = this.battle.runEvent('ModifyDamage', pokemon, target, move, baseDamage);

			if (move.isZOrMaxPowered && target.getMoveHitData(move).zBrokeProtect) {
				baseDamage = this.battle.modify(baseDamage, 0.25);
				this.battle.add('-zbroken', target);
			}

			// Generation 6-7 moves the check for minimum 1 damage after the final modifier...
			if (this.battle.gen !== 5 && !baseDamage) return 1;

			// ...but 16-bit truncation happens even later, and can truncate to 0
			return tr(baseDamage, 16);
		},
	},
	side: {
		canDynamaxNow() {
			return false;
		},
		/**
		 * Any Pokemon can be hit any other Pokemon. There is no need for shifting.
		 */
		chooseShift() {
			return this.emitChoiceError(`Can't shift: You don't need to shift in Legends: Arceus, you can hit any foe`);
		},
	},
	pokemon: {
		/**
		 * Always override the status.
		 */
		trySetStatus(status, source, sourceEffect) {
			return this.setStatus(status, source, sourceEffect);
		},
		/**
		 * Always override the status.
		 * Set the duration to the default duration of the move.
		 */
		setStatus(status, source, sourceEffect, ignoreImmunities) {
			if (!this.hp) return false;
			status = this.battle.dex.conditions.get(status);
			if (this.battle.event) {
				if (!source) source = this.battle.event.source;
				if (!sourceEffect) sourceEffect = this.battle.effect;
			}
			if (!source) source = this;

			if (!ignoreImmunities && status.id &&
					!(source?.hasAbility('corrosion') && ['tox', 'psn'].includes(status.id))) {
				// the game currently never ignores immunities
				if (!this.runStatusImmunity(status.id === 'tox' ? 'psn' : status.id)) {
					this.battle.debug('immune to status');
					if ((sourceEffect as Move)?.status) {
						this.battle.add('-immune', this);
					}
					return false;
				}
			}
			const prevStatus = this.status;
			const prevStatusState = this.statusState;
			if (status.id) {
				const result: boolean = this.battle.runEvent('SetStatus', this, source, sourceEffect, status);
				if (!result) {
					this.battle.debug('set status [' + status.id + '] interrupted');
					return result;
				}
			}

			this.status = status.id;
			this.statusState = {id: status.id, target: this};
			if (source) this.statusState.source = source;
			this.statusState.duration = durationCallback(sourceEffect as ActiveMove);
			if (status.duration) this.statusState.duration = status.duration;
			if (status.durationCallback) {
				this.statusState.duration = status.durationCallback.call(this.battle, this, source, sourceEffect);
			}

			if (status.id && !this.battle.singleEvent('Start', status, this.statusState, this, source, sourceEffect)) {
				this.battle.debug('status start [' + status.id + '] interrupted');
				// cancel the setstatus
				this.status = prevStatus;
				this.statusState = prevStatusState;
				return false;
			}
			if (status.id && !this.battle.runEvent('AfterSetStatus', this, source, sourceEffect, status)) {
				return false;
			}
			return true;
		},
		/**
		 * If the volatile does not have an onRestart event, override it.
		 * Set the duration to the default duration of the move.
		 */
		addVolatile(status, source, sourceEffect, linkedStatus) {
			let result;
			status = this.battle.dex.conditions.get(status);
			if (!this.hp && !status.affectsFainted) return false;
			if (linkedStatus && source && !source.hp) return false;
			if (this.battle.event) {
				if (!source) source = this.battle.event.source;
				if (!sourceEffect) sourceEffect = this.battle.effect;
			}
			if (!source) source = this;

			if (this.volatiles[status.id]) {
				if (status.onRestart) {
					return this.battle.singleEvent('Restart', status, this.volatiles[status.id], this, source, sourceEffect);
				}
			}
			if (!this.runStatusImmunity(status.id)) {
				this.battle.debug('immune to volatile status');
				if ((sourceEffect as Move)?.status) {
					this.battle.add('-immune', this);
				}
				return false;
			}
			result = this.battle.runEvent('TryAddVolatile', this, source, sourceEffect, status);
			if (!result) {
				this.battle.debug('add volatile [' + status.id + '] interrupted');
				return result;
			}
			this.volatiles[status.id] = {id: status.id, name: status.name, target: this};
			if (source) {
				this.volatiles[status.id].source = source;
				this.volatiles[status.id].sourceSlot = source.getSlot();
			}
			if (sourceEffect) this.volatiles[status.id].sourceEffect = sourceEffect;
			this.volatiles[status.id].duration = durationCallback(sourceEffect as ActiveMove);
			if (status.duration) this.volatiles[status.id].duration = status.duration;
			if (status.durationCallback) {
				this.volatiles[status.id].duration = status.durationCallback.call(this.battle, this, source, sourceEffect);
			}
			result = this.battle.singleEvent('Start', status, this.volatiles[status.id], this, source, sourceEffect);
			if (!result) {
				// cancel
				delete this.volatiles[status.id];
				return result;
			}
			if (linkedStatus && source) {
				if (!source.volatiles[linkedStatus.toString()]) {
					source.addVolatile(linkedStatus, this, sourceEffect);
					source.volatiles[linkedStatus.toString()].linkedPokemon = [this];
					source.volatiles[linkedStatus.toString()].linkedStatus = status;
				} else {
					source.volatiles[linkedStatus.toString()].linkedPokemon.push(this);
				}
				this.volatiles[status.toString()].linkedPokemon = [source];
				this.volatiles[status.toString()].linkedStatus = linkedStatus;
			}
			return true;
		},
	},
	spreadModify(baseStats, set) {
		const modStats: StatsTable = {hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10};
		let statName: StatID;
		for (statName in modStats) {
			const stat = baseStats[statName];
			if (statName === 'hp') {
				modStats[statName] = Math.floor((set.level / 100 + 1) * stat + set.level);
			} else {
				modStats[statName] = Math.floor((set.level / 50 + 1) * stat / 1.5);
			}
		}
		const stats = this.natureModify(modStats, set);

		const multipliers = [0, 2, 3, 4, 7, 8, 9, 14, 15, 16, 25];
		let stat: StatID;
		for (stat in stats) {
			const effortLevel = Math.min(set.ivs[stat], 10);
			const effortLevelBonus = Math.round((Math.sqrt(baseStats[stat]) * multipliers[effortLevel] + set.level) / 2.5);
			stats[stat] += effortLevelBonus;
		}
		return stats;
	},
	natureModify(stats, set) {
		const nature = this.dex.natures.get(set.nature);
		if (nature.plus) stats[nature.plus] = Math.floor(stats[nature.plus] * 1.1);
		if (nature.minus) stats[nature.minus] = Math.floor(stats[nature.minus] * 0.9);
		return stats;
	},
};

function durationCallback(move: ActiveMove): number {
	switch (move.id) {
	case 'darkvoid':
		return 3;
	case 'bulkup': case 'calmmind': case 'lunarblessing': case 'takeheart': case 'victorydance':
	case 'rest': case 'shelter':
		return 4;
	case 'poisonsting':
		return 5;
	default:
		return move.category === 'Status' ? 5 : 3;
	}
}
