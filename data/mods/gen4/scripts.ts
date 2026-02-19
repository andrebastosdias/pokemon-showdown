export const Scripts: ModdedBattleScriptsData = {
	inherit: 'gen5',
	gen: 4,

	actions: {
		inherit: true,
		runSwitch(pokemon) {
			this.battle.runEvent('EntryHazard', pokemon);

			this.battle.runEvent('SwitchIn', pokemon);

			if (this.battle.gen <= 2) {
				// pokemon.lastMove is reset for all Pokemon on the field after a switch. This affects Mirror Move.
				for (const poke of this.battle.getAllActive()) poke.lastMove = null;
				if (!pokemon.side.faintedThisTurn && pokemon.draggedIn !== this.battle.turn) {
					this.battle.runEvent('AfterSwitchInSelf', pokemon);
				}
			}
			if (!pokemon.hp) return false;
			pokemon.isStarted = true;
			if (!pokemon.fainted) {
				this.battle.singleEvent('Start', pokemon.getAbility(), pokemon.abilityState, pokemon);
				this.battle.singleEvent('Start', pokemon.getItem(), pokemon.itemState, pokemon);
			}
			if (this.battle.gen === 4) {
				for (const foeActive of pokemon.foes()) {
					foeActive.removeVolatile('substitutebroken');
				}
			}
			pokemon.draggedIn = null;
			return true;
		},
		modifyDamage(baseDamage, pokemon, target, move, suppressMessages = false) {
			// DPP divides modifiers into several mathematically important stages
			// The modifiers run earlier than other generations are called with ModifyDamagePhase1 and ModifyDamagePhase2

			if (!move.type) move.type = '???';
			const type = move.type;

			// Burn
			if (pokemon.status === 'brn' && baseDamage && move.category === 'Physical' && !pokemon.hasAbility('guts')) {
				baseDamage = this.battle.modify(baseDamage, 0.5);
			}

			// Other modifiers (Reflect/Light Screen/etc)
			baseDamage = this.battle.runEvent('ModifyDamagePhase1', pokemon, target, move, baseDamage);

			// Double battle multi-hit
			if (move.spreadHit) {
				const spreadModifier = move.spreadModifier || (this.battle.gameType === 'freeforall' ? 0.5 : 0.75);
				this.battle.debug(`Spread modifier: ${spreadModifier}`);
				baseDamage = this.battle.modify(baseDamage, spreadModifier);
			}

			// Weather
			baseDamage = this.battle.runEvent('WeatherModifyDamage', pokemon, target, move, baseDamage);

			baseDamage += 2;

			const isCrit = target.getMoveHitData(move).crit;
			if (isCrit) {
				baseDamage = this.battle.modify(baseDamage, move.critModifier || 2);
			}

			// Mod 2 (Damage is floored after all multipliers are in)
			baseDamage = Math.floor(this.battle.runEvent('ModifyDamagePhase2', pokemon, target, move, baseDamage));

			// this is not a modifier
			baseDamage = this.battle.randomizer(baseDamage);

			// STAB
			// The "???" type never gets STAB
			// Not even if you Roost in Gen 4 and somehow manage to use
			// Struggle in the same turn.
			// (On second thought, it might be easier to get a MissingNo.)
			if (type !== '???') {
				let stab: number | [number, number] = 1;
				if (move.forceSTAB || pokemon.hasType(type)) {
					stab = 1.5;
				}
				stab = this.battle.runEvent('ModifySTAB', pokemon, target, move, stab);
				baseDamage = this.battle.modify(baseDamage, stab);
			}
			// types
			let typeMod = target.runEffectiveness(move);
			typeMod = this.battle.clampIntRange(typeMod, -6, 6);
			target.getMoveHitData(move).typeMod = typeMod;
			if (typeMod > 0) {
				if (!suppressMessages) this.battle.add('-supereffective', target);

				for (let i = 0; i < typeMod; i++) {
					baseDamage *= 2;
				}
			}
			if (typeMod < 0) {
				if (!suppressMessages) this.battle.add('-resisted', target);

				for (let i = 0; i > typeMod; i--) {
					baseDamage = Math.floor(baseDamage / 2);
				}
			}

			if (isCrit && !suppressMessages) this.battle.add('-crit', target);

			// Final modifier.
			baseDamage = this.battle.runEvent('ModifyDamage', pokemon, target, move, baseDamage);

			if (!Math.floor(baseDamage)) {
				return 1;
			}

			return Math.floor(baseDamage);
		},
		spreadMoveHitSteps(targets: Pokemon[], pokemon: Pokemon, move: ActiveMove,
			moveSteps: ((targets: Pokemon[], pokemon: Pokemon, move: ActiveMove) => (number | boolean | "" | undefined)[] | undefined)[],
		) {
			// in Gen 4, moves hit and apply effects one target at a time in speed order
			const targetsEntries: [number, Pokemon, boolean][] = targets.map((target, index) => [index, target, true]);
			this.battle.speedSort(targetsEntries, (a, b) => this.battle.comparePriority(a[1], b[1]));
			let atLeastOneFailure = false;
			for (let i = 0; i < targetsEntries.length; i++) {
				// spread moves hit for 100% of the damage if there is only one target left and all the other targets have fainted
				// if the move hits all adjacent Pokemon, the threshold is 2 targets counting the user
				if (move.spreadHit && (
					(move.target === 'allAdjacent' && targets.concat(pokemon).filter(t => t && !t.fainted).length <= 2) ||
					targets.filter(t => t && !t.fainted).length <= 1
				)) {
					move.spreadModifier = 1;
				}
				const [_, target] = targetsEntries[i];
				for (const step of moveSteps) {
					const hitResults: (number | boolean | "" | undefined)[] | undefined = step.call(this, [target], pokemon, move);
					if (!hitResults) continue;
					if (hitResults.length !== 1) throw new Error(`Expected single target for step ${step.name} in spread move ${move.name}`);
					const failed = !(hitResults[0] || hitResults[0] === 0);
					if (failed) targetsEntries[i][2] = false;
					atLeastOneFailure = atLeastOneFailure || hitResults[0] === false;
					if (move.smartTarget && atLeastOneFailure) move.smartTarget = false;
					if (failed) break;
				}
			}

			targets = targetsEntries.filter(entry => entry[2]).sort((a, b) => a[0] - b[0]).map(entry => entry[1]);

			move.hitTargets = targets;
			const moveResult = !!targets.length;
			if (!moveResult && !atLeastOneFailure) pokemon.moveThisTurnResult = null;
			const hitSlot = targets.map(p => p.getSlot());
			if (move.spreadHit) this.battle.attrLastMove('[spread] ' + hitSlot.join(','));
			return moveResult;
		},
		calcRecoilDamage(damageDealt, move) {
			return this.battle.clampIntRange(Math.floor(damageDealt * move.recoil![0] / move.recoil![1]), 1);
		},
	},
};
