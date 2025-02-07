import {Utils} from "../../../lib/utils";

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

function getDefaultActionTime(pokemon: Pokemon): number {
	const speed = pokemon.getStat('spe', false, false);
	if (speed <= 15) return 14;
	else if (speed <= 31) return 13;
	else if (speed <= 55) return 12;
	else if (speed <= 88) return 11;
	else if (speed <= 129) return 10;
	else if (speed <= 181) return 9;
	else if (speed <= 242) return 8;
	else if (speed <= 316) return 7;
	else if (speed <= 401) return 6;
	else return 5;
}

function getActionTimeModifier(move: ActiveMove): number {
	switch (move.id) {
	case 'chloroblast': case 'darkvoid': case 'gigaimpact': case 'hyperbeam': case 'mountaingale': case 'roaroftime':
		return 5;
	case 'shadowforce':
		return 3;
	case 'bulkup': case 'calmmind': case 'shelter': case 'takeheart': case 'victorydance':
		return -2;
	case 'acidarmor': case 'baby-dolleyes': case 'doublehit': case 'focusenergy': case 'irondefense': case 'nastyplot':
	case 'powershift': case 'swordsdance':
		return -3;
	case 'aquajet': case 'bulletpunch': case 'esperwing': case 'iceshard': case 'machpunch': case 'quickattack':
	case 'shadowsneak': case 'wavecrash':
		return -4;
	default:
		return 0;
	}
}

function getActionTimeModifierTarget(move: ActiveMove): number {
	if ([
		'airslash', 'astonish', 'bite', 'bubble', 'bulldoze', 'crushgrip', 'extrasensory', 'fairywind', 'firefang',
		'icefang', 'iciclecrash', 'icywind', 'ironhead', 'mountaingale', 'rockslide', 'thunderfang', 'triplearrows',
		'twister', 'zenheadbutt',
	].includes(move.id)) {
		return 3;
	}
	return 0;
}

function compareActionTime(a: Pokemon, b: Pokemon) {
	return -(b.m.actionTime - a.m.actionTime) ||
		(b.speed - a.speed) ||
		0;
}

export const Scripts: ModdedBattleScriptsData = {
	gen: 8,
	inherit: 'gen8',
	init() {
		this.modData('Abilities', 'noability').isNonstandard = null;
		for (const i in this.data.Pokedex) {
			this.modData('Pokedex', i).abilities = {0: 'No Ability'};
			delete this.modData('Pokedex', i).requiredItem;
			delete this.modData('Pokedex', i).requiredItems;
		}
		for (const i in this.data.Moves) {
			const moveData = this.modData('Moves', i);
			moveData.noPPBoosts = true;
			if (['normal', 'allAdjacentFoes', 'allAdjacent', 'adjacentFoe'].includes(moveData.target)) {
				moveData.target = 'any';
			} else if (['allies', 'adjacentAllyOrSelf'].includes(moveData.target)) {
				moveData.target = 'self';
			}
		}
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
	/**
	 * Only run onResidual events for Pokemon that tried to use a move, if any.
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
				if (!active || active.volatiles['commanding']) continue;
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

			if (!(handler.effectHolder as Pokemon).fainted && handler.end && handler.state && handler.state.duration) {
				handler.state.duration--;
				if (!handler.state.duration) {
					const endCallArgs = handler.endCallArgs || [handler.effectHolder, effect.id];
					handler.end.call(...endCallArgs as [any, ...any[]]);
				}
			}

			this.faintMessages();
			if (this.ended) return;
		}
	},
	/**
	 * Get new acting Pokemon.
	 */
	endTurn() {
		const allActive = this.getAllActive();
		allActive.forEach(pokemon => {
			delete pokemon.volatiles['commanding'];
		});
		this.speedSort(allActive, compareActionTime);
		const actingPokemon = allActive[0];
		actingPokemon.volatiles['commanding'] = this.initEffectState({id: 'commanding', name: 'Commanding', target: actingPokemon});
		const actingTime = actingPokemon.m.actionTime;
		allActive.forEach(pokemon => pokemon.m.actionTime -= actingTime);
		actingPokemon.m.actionTime = getDefaultActionTime(actingPokemon);

		this.constructor.prototype.endTurn.call(this);
	},
	/**
	 * Set players that do not act to wait.
	 */
	getRequests(type) {
		// default to no request
		const requests: AnyObject[] = Array(this.sides.length).fill(null);

		switch (type) {
		case 'switch':
			for (let i = 0; i < this.sides.length; i++) {
				const side = this.sides[i];
				if (!side.pokemonLeft) continue;
				const switchTable = side.active.map(pokemon => !!pokemon?.switchFlag);
				if (switchTable.some(Boolean)) {
					requests[i] = {forceSwitch: switchTable, side: side.getRequestData()};
				}
			}
			break;

		case 'teampreview':
			for (let i = 0; i < this.sides.length; i++) {
				const side = this.sides[i];
				const maxChosenTeamSize = this.ruleTable.pickedTeamSize || undefined;
				requests[i] = {teamPreview: true, maxChosenTeamSize, side: side.getRequestData()};
			}
			break;

		default:
			for (let i = 0; i < this.sides.length; i++) {
				const side = this.sides[i];
				if (!side.pokemonLeft) continue;
				if (side.active.every(pokemon => pokemon.volatiles['commanding'])) continue;
				const activeData = side.active.map(pokemon => pokemon?.getMoveRequestData());
				requests[i] = {active: activeData, side: side.getRequestData()};
				if (side.allySide) {
					requests[i].ally = side.allySide.getRequestData(true);
				}
			}
			break;
		}

		const multipleRequestsExist = requests.filter(Boolean).length >= 2;
		for (let i = 0; i < this.sides.length; i++) {
			if (requests[i]) {
				if (!this.supportCancel || !multipleRequestsExist) requests[i].noCancel = true;
			} else {
				requests[i] = {wait: true, side: this.sides[i].getRequestData()};
			}
		}

		return requests;
	},
	actions: {
		inherit: true,
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
			typeMod = this.battle.clampIntRange(typeMod, -2, 2);
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
			if (pokemon.getVolatile('fixated') && pokemon.volatiles['fixated'].move === move.id) {
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
		/**
		 * Add new Pokemon to action time queue. Remove switch out Pokemon if there was one.
		 */
		switchIn(pokemon, pos, sourceEffect, isDrag) {
			if (!pokemon || pokemon.isActive) {
				this.battle.hint("A switch failed because the Pokémon trying to switch in is already in.");
				return false;
			}

			const side = pokemon.side;
			if (pos >= side.active.length) {
				throw new Error(`Invalid switch position ${pos} / ${side.active.length}`);
			}
			const oldActive = side.active[pos];
			const unfaintedActive = oldActive?.hp ? oldActive : null;
			if (unfaintedActive) {
				oldActive.beingCalledBack = true;
				let switchCopyFlag: 'copyvolatile' | 'shedtail' | boolean = false;
				if (sourceEffect && typeof (sourceEffect as Move).selfSwitch === 'string') {
					switchCopyFlag = (sourceEffect as Move).selfSwitch!;
				}
				if (!oldActive.skipBeforeSwitchOutEventFlag && !isDrag) {
					this.battle.runEvent('BeforeSwitchOut', oldActive);
					if (this.battle.gen >= 5) {
						this.battle.eachEvent('Update');
					}
				}
				oldActive.skipBeforeSwitchOutEventFlag = false;
				if (!this.battle.runEvent('SwitchOut', oldActive)) {
					// Warning: DO NOT interrupt a switch-out if you just want to trap a pokemon.
					// To trap a pokemon and prevent it from switching out, (e.g. Mean Look, Magnet Pull)
					// use the 'trapped' flag instead.

					// Note: Nothing in the real games can interrupt a switch-out (except Pursuit KOing,
					// which is handled elsewhere); this is just for custom formats.
					return false;
				}
				if (!oldActive.hp) {
					// a pokemon fainted from Pursuit before it could switch
					return 'pursuitfaint';
				}

				// will definitely switch out at this point

				oldActive.illusion = null;
				this.battle.singleEvent('End', oldActive.getAbility(), oldActive.abilityState, oldActive);

				// if a pokemon is forced out by Whirlwind/etc or Eject Button/Pack, it can't use its chosen move
				this.battle.queue.cancelAction(oldActive);

				let newMove = null;
				if (this.battle.gen === 4 && sourceEffect) {
					newMove = oldActive.lastMove;
				}
				if (switchCopyFlag) {
					pokemon.copyVolatileFrom(oldActive, switchCopyFlag);
				}
				if (newMove) pokemon.lastMove = newMove;
				oldActive.clearVolatile();
			}
			if (oldActive) {
				oldActive.isActive = false;
				oldActive.isStarted = false;
				oldActive.usedItemThisTurn = false;
				oldActive.statsRaisedThisTurn = false;
				oldActive.statsLoweredThisTurn = false;
				oldActive.position = pokemon.position;
				pokemon.m.actionTime = oldActive.m.actionTime;
				oldActive.m.actionTime = 0;
				pokemon.position = pos;
				side.pokemon[pokemon.position] = pokemon;
				side.pokemon[oldActive.position] = oldActive;
			}
			pokemon.isActive = true;
			side.active[pos] = pokemon;
			pokemon.activeTurns = 0;
			pokemon.activeMoveActions = 0;
			for (const moveSlot of pokemon.moveSlots) {
				moveSlot.used = false;
			}
			this.battle.runEvent('BeforeSwitchIn', pokemon);
			if (sourceEffect) {
				this.battle.add(isDrag ? 'drag' : 'switch', pokemon, pokemon.getFullDetails, '[from] ' + sourceEffect);
			} else {
				this.battle.add(isDrag ? 'drag' : 'switch', pokemon, pokemon.getFullDetails);
			}
			pokemon.abilityOrder = this.battle.abilityOrder++;
			if (isDrag && this.battle.gen === 2) pokemon.draggedIn = this.battle.turn;
			pokemon.previouslySwitchedIn++;

			if (isDrag && this.battle.gen >= 5) {
				// runSwitch happens immediately so that Mold Breaker can make hazards bypass Clear Body and Levitate
				this.battle.singleEvent('PreStart', pokemon.getAbility(), pokemon.abilityState, pokemon);
				this.runSwitch(pokemon);
			} else {
				this.battle.queue.insertChoice({choice: 'runUnnerve', pokemon});
				this.battle.queue.insertChoice({choice: 'runSwitch', pokemon});
			}

			return true;
		},
		/**
		 * Update action time of the acting Pokémon.
		 */
		runMove(moveOrMoveName, pokemon, targetLoc, options) {
			pokemon.activeMoveActions++;
			const zMove = options?.zMove;
			const maxMove = options?.maxMove;
			const externalMove = options?.externalMove;
			const originalTarget = options?.originalTarget;
			let sourceEffect = options?.sourceEffect;
			let target = this.battle.getTarget(pokemon, maxMove || zMove || moveOrMoveName, targetLoc, originalTarget);
			let baseMove = this.dex.getActiveMove(moveOrMoveName);
			const priority = baseMove.priority;
			const pranksterBoosted = baseMove.pranksterBoosted;
			if (baseMove.id !== 'struggle' && !zMove && !maxMove && !externalMove) {
				const changedMove = this.battle.runEvent('OverrideAction', pokemon, target, baseMove);
				if (changedMove && changedMove !== true) {
					baseMove = this.dex.getActiveMove(changedMove);
					baseMove.priority = priority;
					if (pranksterBoosted) baseMove.pranksterBoosted = pranksterBoosted;
					target = this.battle.getRandomTarget(pokemon, baseMove);
				}
			}
			let move = baseMove;
			if (zMove) {
				move = this.getActiveZMove(baseMove, pokemon);
			} else if (maxMove) {
				move = this.getActiveMaxMove(baseMove, pokemon);
			}

			move.isExternal = externalMove;

			this.battle.setActiveMove(move, pokemon, target);

			pokemon.m.actionTime += getActionTimeModifier(move);

			/* if (pokemon.moveThisTurn) {
				// THIS IS PURELY A SANITY CHECK
				// DO NOT TAKE ADVANTAGE OF THIS TO PREVENT A POKEMON FROM MOVING;
				// USE this.queue.cancelMove INSTEAD
				this.battle.debug('' + pokemon.id + ' INCONSISTENT STATE, ALREADY MOVED: ' + pokemon.moveThisTurn);
				this.battle.clearActiveMove(true);
				return;
			} */
			const willTryMove = this.battle.runEvent('BeforeMove', pokemon, target, move);
			if (!willTryMove) {
				this.battle.runEvent('MoveAborted', pokemon, target, move);
				this.battle.clearActiveMove(true);
				// The event 'BeforeMove' could have returned false or null
				// false indicates that this counts as a move failing for the purpose of calculating Stomping Tantrum's base power
				// null indicates the opposite, as the Pokemon didn't have an option to choose anything
				pokemon.moveThisTurnResult = willTryMove;
				return;
			}

			// Used exclusively for a hint later
			if (move.flags['cantusetwice'] && pokemon.lastMove?.id === move.id) {
				pokemon.addVolatile(move.id);
			}

			if (move.beforeMoveCallback) {
				if (move.beforeMoveCallback.call(this.battle, pokemon, target, move)) {
					this.battle.clearActiveMove(true);
					pokemon.moveThisTurnResult = false;
					return;
				}
			}
			pokemon.lastDamage = 0;
			let lockedMove;
			if (!externalMove) {
				lockedMove = this.battle.runEvent('LockMove', pokemon);
				if (lockedMove === true) lockedMove = false;
				if (!lockedMove) {
					if (!pokemon.deductPP(baseMove, null, target) && (move.id !== 'struggle')) {
						this.battle.add('cant', pokemon, 'nopp', move);
						this.battle.clearActiveMove(true);
						pokemon.moveThisTurnResult = false;
						return;
					}
				} else {
					sourceEffect = this.dex.conditions.get('lockedmove');
				}
				pokemon.moveUsed(move, targetLoc);
			}

			// Dancer Petal Dance hack
			// TODO: implement properly
			const noLock = externalMove && !pokemon.volatiles['lockedmove'];

			if (zMove) {
				if (pokemon.illusion) {
					this.battle.singleEvent('End', this.dex.abilities.get('Illusion'), pokemon.abilityState, pokemon);
				}
				this.battle.add('-zpower', pokemon);
				pokemon.side.zMoveUsed = true;
			}

			const oldActiveMove = move;

			const moveDidSomething = this.useMove(baseMove, pokemon, {target, sourceEffect, zMove, maxMove});
			this.battle.lastSuccessfulMoveThisTurn = moveDidSomething ? this.battle.activeMove && this.battle.activeMove.id : null;
			if (this.battle.activeMove) move = this.battle.activeMove;
			this.battle.singleEvent('AfterMove', move, null, pokemon, target, move);
			this.battle.runEvent('AfterMove', pokemon, target, move);
			if (move.flags['cantusetwice'] && pokemon.removeVolatile(move.id)) {
				this.battle.add('-hint', `Some effects can force a Pokemon to use ${move.name} again in a row.`);
			}

			if (pokemon.moveThisTurnResult && target) target.m.actionTime += getActionTimeModifierTarget(move);

			// Dancer's activation order is completely different from any other event, so it's handled separately
			if (move.flags['dance'] && moveDidSomething && !move.isExternal) {
				const dancers = [];
				for (const currentPoke of this.battle.getAllActive()) {
					if (pokemon === currentPoke) continue;
					if (currentPoke.hasAbility('dancer') && !currentPoke.isSemiInvulnerable()) {
						dancers.push(currentPoke);
					}
				}
				// Dancer activates in order of lowest speed stat to highest
				// Note that the speed stat used is after any volatile replacements like Speed Swap,
				// but before any multipliers like Agility or Choice Scarf
				// Ties go to whichever Pokemon has had the ability for the least amount of time
				dancers.sort(
					(a, b) => -(b.storedStats['spe'] - a.storedStats['spe']) || b.abilityOrder - a.abilityOrder
				);
				const targetOf1stDance = this.battle.activeTarget!;
				for (const dancer of dancers) {
					if (this.battle.faintMessages()) break;
					if (dancer.fainted) continue;
					this.battle.add('-activate', dancer, 'ability: Dancer');
					const dancersTarget = !targetOf1stDance.isAlly(dancer) && pokemon.isAlly(dancer) ?
						targetOf1stDance :
						pokemon;
					const dancersTargetLoc = dancer.getLocOf(dancersTarget);
					this.runMove(move.id, dancer, dancersTargetLoc, {sourceEffect: this.dex.abilities.get('dancer'), externalMove: true});
				}
			}
			if (noLock && pokemon.volatiles['lockedmove']) delete pokemon.volatiles['lockedmove'];
			this.battle.faintMessages();
			this.battle.checkWin();

			if (this.battle.gen <= 4) {
				// In gen 4, the outermost move is considered the last move for Copycat
				this.battle.activeMove = oldActiveMove;
			}
		},
		/**
		 * Implement Self-Destruct and Steel Beam recoil like Chloroblast.
		 */
		hitStepMoveHitLoop(targets, pokemon, move) {
			let damage: (number | boolean | undefined)[] = [];
			for (const i of targets.keys()) {
				damage[i] = 0;
			}
			move.totalDamage = 0;
			pokemon.lastDamage = 0;
			let targetHits = move.multihit || 1;
			if (Array.isArray(targetHits)) {
				// yes, it's hardcoded... meh
				if (targetHits[0] === 2 && targetHits[1] === 5) {
					if (this.battle.gen >= 5) {
						// 35-35-15-15 out of 100 for 2-3-4-5 hits
						targetHits = this.battle.sample([2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
						if (targetHits < 4 && pokemon.hasItem('loadeddice')) {
							targetHits = 5 - this.battle.random(2);
						}
					} else {
						targetHits = this.battle.sample([2, 2, 2, 3, 3, 3, 4, 5]);
					}
				} else {
					targetHits = this.battle.random(targetHits[0], targetHits[1] + 1);
				}
			}
			if (targetHits === 10 && pokemon.hasItem('loadeddice')) targetHits -= this.battle.random(7);
			targetHits = Math.floor(targetHits);
			let nullDamage = true;
			let moveDamage: (number | boolean | undefined)[] = [];
			// There is no need to recursively check the ´sleepUsable´ flag as Sleep Talk can only be used while asleep.
			const isSleepUsable = move.sleepUsable || this.dex.moves.get(move.sourceEffect).sleepUsable;

			let targetsCopy: (Pokemon | false | null)[] = targets.slice(0);
			let hit: number;
			for (hit = 1; hit <= targetHits; hit++) {
				if (damage.includes(false)) break;
				if (hit > 1 && pokemon.status === 'slp' && (!isSleepUsable || this.battle.gen === 4)) break;
				if (targets.every(target => !target?.hp)) break;
				move.hit = hit;
				if (move.smartTarget && targets.length > 1) {
					targetsCopy = [targets[hit - 1]];
					damage = [damage[hit - 1]];
				} else {
					targetsCopy = targets.slice(0);
				}
				const target = targetsCopy[0]; // some relevant-to-single-target-moves-only things are hardcoded
				if (target && typeof move.smartTarget === 'boolean') {
					if (hit > 1) {
						this.battle.addMove('-anim', pokemon, move.name, target);
					} else {
						this.battle.retargetLastMove(target);
					}
				}

				// like this (Triple Kick)
				if (target && move.multiaccuracy && hit > 1) {
					let accuracy = move.accuracy;
					const boostTable = [1, 4 / 3, 5 / 3, 2, 7 / 3, 8 / 3, 3];
					if (accuracy !== true) {
						if (!move.ignoreAccuracy) {
							const boosts = this.battle.runEvent('ModifyBoost', pokemon, null, null, {...pokemon.boosts});
							const boost = this.battle.clampIntRange(boosts['accuracy'], -6, 6);
							if (boost > 0) {
								accuracy *= boostTable[boost];
							} else {
								accuracy /= boostTable[-boost];
							}
						}
						if (!move.ignoreEvasion) {
							const boosts = this.battle.runEvent('ModifyBoost', target, null, null, {...target.boosts});
							const boost = this.battle.clampIntRange(boosts['evasion'], -6, 6);
							if (boost > 0) {
								accuracy /= boostTable[boost];
							} else if (boost < 0) {
								accuracy *= boostTable[-boost];
							}
						}
					}
					accuracy = this.battle.runEvent('ModifyAccuracy', target, pokemon, move, accuracy);
					if (!move.alwaysHit) {
						accuracy = this.battle.runEvent('Accuracy', target, pokemon, move, accuracy);
						if (accuracy !== true && !this.battle.randomChance(accuracy, 100)) break;
					}
				}

				const moveData = move;
				if (!moveData.flags) moveData.flags = {};

				let moveDamageThisHit;
				// Modifies targetsCopy (which is why it's a copy)
				[moveDamageThisHit, targetsCopy] = this.spreadMoveHit(targetsCopy, pokemon, move, moveData);
				// When Dragon Darts targets two different pokemon, targetsCopy is a length 1 array each hit
				// so spreadMoveHit returns a length 1 damage array
				if (move.smartTarget) {
					moveDamage.push(...moveDamageThisHit);
				} else {
					moveDamage = moveDamageThisHit;
				}

				if (!moveDamage.some(val => val !== false)) break;
				nullDamage = false;

				for (const [i, md] of moveDamage.entries()) {
					if (move.smartTarget && i !== hit - 1) continue;
					// Damage from each hit is individually counted for the
					// purposes of Counter, Metal Burst, and Mirror Coat.
					damage[i] = md === true || !md ? 0 : md;
					// Total damage dealt is accumulated for the purposes of recoil (Parental Bond).
					move.totalDamage += damage[i] as number;
				}
				if (move.mindBlownRecoil) {
					const hpBeforeRecoil = pokemon.hp;
					this.battle.damage(Math.round(pokemon.maxhp / 2), pokemon, pokemon, this.dex.conditions.get(move.id), true);
					move.mindBlownRecoil = false;
					if (pokemon.hp <= pokemon.maxhp / 2 && hpBeforeRecoil > pokemon.maxhp / 2) {
						this.battle.runEvent('EmergencyExit', pokemon, pokemon);
					}
				}
				this.battle.eachEvent('Update');
				if (!pokemon.hp && targets.length === 1) {
					hit++; // report the correct number of hits for multihit moves
					break;
				}
			}
			// hit is 1 higher than the actual hit count
			if (hit === 1) return damage.fill(false);
			if (nullDamage) damage.fill(false);
			this.battle.faintMessages(false, false, !pokemon.hp);
			if (move.multihit && typeof move.smartTarget !== 'boolean') {
				this.battle.add('-hitcount', targets[0], hit - 1);
			}

			if ((move.recoil || ['chloroblast', 'selfdestruct', 'steelbeam'].includes(move.id)) && move.totalDamage) {
				const hpBeforeRecoil = pokemon.hp;
				this.battle.damage(this.calcRecoilDamage(move.totalDamage, move, pokemon), pokemon, pokemon, 'recoil');
				if (pokemon.hp <= pokemon.maxhp / 2 && hpBeforeRecoil > pokemon.maxhp / 2) {
					this.battle.runEvent('EmergencyExit', pokemon, pokemon);
				}
			}

			if (move.struggleRecoil) {
				const hpBeforeRecoil = pokemon.hp;
				let recoilDamage;
				if (this.dex.gen >= 5) {
					recoilDamage = this.battle.clampIntRange(Math.round(pokemon.baseMaxhp / 4), 1);
				} else {
					recoilDamage = this.battle.clampIntRange(this.battle.trunc(pokemon.maxhp / 4), 1);
				}
				this.battle.directDamage(recoilDamage, pokemon, pokemon, {id: 'strugglerecoil'} as Condition);
				if (pokemon.hp <= pokemon.maxhp / 2 && hpBeforeRecoil > pokemon.maxhp / 2) {
					this.battle.runEvent('EmergencyExit', pokemon, pokemon);
				}
			}

			// smartTarget messes up targetsCopy, but smartTarget should in theory ensure that targets will never fail, anyway
			if (move.smartTarget) {
				targetsCopy = targets.slice(0);
			}

			for (const [i, target] of targetsCopy.entries()) {
				if (target && pokemon !== target) {
					target.gotAttacked(move, moveDamage[i] as number | false | undefined, pokemon);
					if (typeof moveDamage[i] === 'number') {
						target.timesAttacked += move.smartTarget ? 1 : hit - 1;
					}
				}
			}

			if (move.ohko && !targets[0].hp) this.battle.add('-ohko');

			if (!damage.some(val => !!val || val === 0)) return damage;

			this.battle.eachEvent('Update');

			this.afterMoveSecondaryEvent(targetsCopy.filter(val => !!val) as Pokemon[], pokemon, move);

			if (!move.negateSecondary && !(move.hasSheerForce && pokemon.hasAbility('sheerforce'))) {
				for (const [i, d] of damage.entries()) {
					// There are no multihit spread moves, so it's safe to use move.totalDamage for multihit moves
					// The previous check was for `move.multihit`, but that fails for Dragon Darts
					const curDamage = targets.length === 1 ? move.totalDamage : d;
					if (typeof curDamage === 'number' && targets[i].hp) {
						const targetHPBeforeDamage = (targets[i].hurtThisTurn || 0) + curDamage;
						if (targets[i].hp <= targets[i].maxhp / 2 && targetHPBeforeDamage > targets[i].maxhp / 2) {
							this.battle.runEvent('EmergencyExit', targets[i], pokemon);
						}
					}
				}
			}

			return damage;
		},
		/**
		 * Implement Self-Destruct and Steel Beam recoil like Chloroblast.
		 */
		calcRecoilDamage(damageDealt, move, pokemon) {
			if (['chloroblast', 'steelbeam'].includes(move.id)) return Math.round(pokemon.maxhp / 2);
			if (move.id === 'selfdestruct') return Math.round(pokemon.maxhp * 0.8);
			return this.battle.clampIntRange(Math.round(damageDealt * move.recoil![0] / move.recoil![1]), 1);
		},
	},
	side: {
		inherit: true,
		canDynamaxNow() {
			return false;
		},
		chooseShift() {
			return this.emitChoiceError(`Can't shift: You don't need to shift in Legends: Arceus, you can hit any foe`);
		},
	},
	pokemon: {
		inherit: true,
		/**
		 * Hidden Power has no type.
		 */
		getMoves(lockedMove, restrictData) {
			if (lockedMove) {
				lockedMove = toID(lockedMove);
				this.trapped = true;
				if (lockedMove === 'recharge') {
					return [{
						move: 'Recharge',
						id: 'recharge',
					}];
				}
				for (const moveSlot of this.moveSlots) {
					if (moveSlot.id !== lockedMove) continue;
					return [{
						move: moveSlot.move,
						id: moveSlot.id,
					}];
				}
				// does this happen?
				return [{
					move: this.battle.dex.moves.get(lockedMove).name,
					id: lockedMove,
				}];
			}
			const moves = [];
			let hasValidMove = false;
			for (const moveSlot of this.moveSlots) {
				let moveName = moveSlot.move;
				if (moveSlot.id === 'hiddenpower') {
					moveName = 'Hidden Power';
				} else if (moveSlot.id === 'return' || moveSlot.id === 'frustration') {
					const basePowerCallback = this.battle.dex.moves.get(moveSlot.id).basePowerCallback as (pokemon: Pokemon) => number;
					moveName += ' ' + basePowerCallback(this);
				}
				let target = moveSlot.target;
				switch (moveSlot.id) {
				case 'curse':
					if (!this.hasType('Ghost')) {
						target = this.battle.dex.moves.get('curse').nonGhostTarget;
					}
					break;
				case 'pollenpuff':
					// Heal Block only prevents Pollen Puff from targeting an ally when the user has Heal Block
					if (this.volatiles['healblock']) {
						target = 'adjacentFoe';
					}
					break;
				case 'terastarstorm':
					if (this.species.name === 'Terapagos-Stellar') {
						target = 'allAdjacentFoes';
					}
					break;
				}
				let disabled = moveSlot.disabled;
				if (this.volatiles['dynamax']) {
					// if each of a Pokemon's base moves are disabled by one of these effects, it will Struggle
					const canCauseStruggle = ['Encore', 'Disable', 'Taunt', 'Assault Vest', 'Belch', 'Stuff Cheeks'];
					disabled = this.maxMoveDisabled(moveSlot.id) || disabled && canCauseStruggle.includes(moveSlot.disabledSource!);
				} else if (
					(moveSlot.pp <= 0 && !this.volatiles['partialtrappinglock']) || disabled &&
					this.side.active.length >= 2 && this.battle.actions.targetTypeChoices(target!)
				) {
					disabled = true;
				}

				if (!disabled) {
					hasValidMove = true;
				} else if (disabled === 'hidden' && restrictData) {
					disabled = false;
				}

				moves.push({
					move: moveName,
					id: moveSlot.id,
					pp: moveSlot.pp,
					maxpp: moveSlot.maxpp,
					target,
					disabled,
				});
			}
			return hasValidMove ? moves : [];
		},
		/**
		 * Hidden Power has no type.
		 */
		getSwitchRequestData(forAlly?: boolean) {
			const entry: AnyObject = {
				ident: this.fullname,
				details: this.details,
				condition: this.getHealth().secret,
				active: (this.position < this.side.active.length),
				stats: {
					atk: this.baseStoredStats['atk'],
					def: this.baseStoredStats['def'],
					spa: this.baseStoredStats['spa'],
					spd: this.baseStoredStats['spd'],
					spe: this.baseStoredStats['spe'],
				},
				moves: this[forAlly ? 'baseMoves' : 'moves'].map(move => {
					if (move === 'frustration' || move === 'return') {
						const basePowerCallback = this.battle.dex.moves.get(move).basePowerCallback as (pokemon: Pokemon) => number;
						return move + basePowerCallback(this);
					}
					return move;
				}),
				baseAbility: this.baseAbility,
				item: this.item,
				pokeball: this.pokeball,
			};
			if (this.battle.gen > 6) entry.ability = this.ability;
			if (this.battle.gen >= 9) {
				entry.commanding = !!this.volatiles['commanding'] && !this.fainted;
				entry.reviving = this.isActive && !!this.side.slotConditions[this.position]['revivalblessing'];
			}
			if (this.battle.gen === 9) {
				entry.teraType = this.teraType;
				entry.terastallized = this.terastallized || '';
			}
			return entry;
		},
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
			if (status.id === 'tox') {
				status = this.battle.dex.conditions.get('psn');
			}
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

			if (this.volatiles[status.id] && status.onRestart) {
				return this.battle.singleEvent('Restart', status, this.volatiles[status.id], this, source, sourceEffect);
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
};
