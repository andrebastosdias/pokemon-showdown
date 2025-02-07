export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	attract: {
		inherit: true,
		desc: "Causes the target to become infatuated, making it unable to attack 50% of the time. The effect ends when either the user or the target is no longer active. Pokemon with the Oblivious Ability or protected by the Aroma Veil Ability are immune.",
		shortDesc: "The target gets infatuated.",
		condition: {
			noCopy: true, // doesn't get copied by Baton Pass
			onStart(pokemon, source, effect) {
				if (!this.runEvent('Attract', pokemon, source)) {
					this.debug('Attract event failed');
					return false;
				}

				if (effect.name === 'Cute Charm') {
					this.add('-start', pokemon, 'Attract', '[from] ability: Cute Charm', '[of] ' + source);
				} else if (effect.name === 'Destiny Knot') {
					this.add('-start', pokemon, 'Attract', '[from] item: Destiny Knot', '[of] ' + source);
				} else {
					this.add('-start', pokemon, 'Attract');
				}
			},
			onUpdate(pokemon) {
				if (this.effectState.source && !this.effectState.source.isActive && pokemon.volatiles['attract']) {
					this.debug('Removing Attract volatile on ' + pokemon);
					pokemon.removeVolatile('attract');
				}
			},
			onBeforeMovePriority: 2,
			onBeforeMove(pokemon, target, move) {
				this.add('-activate', pokemon, 'move: Attract', '[of] ' + this.effectState.source);
				if (this.randomChance(1, 2)) {
					this.add('cant', pokemon, 'Attract');
					return false;
				}
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Attract', '[silent]');
			},
		},
		onTryImmunity: true,
	},
	covet: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		onAfterHit() {},
		type: "Fairy",
	},
	darkvoid: {
		inherit: true,
		desc: "Causes the target to fall asleep.",
		shortDesc: "Causes the foe(s) to fall asleep.",
		accuracy: 80,
		onTry() {},
	},
	defendorder: {
		inherit: true,
		desc: "The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Burning Bulwark, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Silk Trap, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",
		shortDesc: "Prevents moves from affecting the user this turn.",
		priority: 4,
		flags: {noassist: 1, failcopycat: 1},
		stallingMove: true,
		volatileStatus: 'protect',
		onPrepareHit(pokemon) {
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
		},
		boosts: null,
	},
	defog: {
		inherit: true,
		desc: "Lowers the target's evasiveness by 1 stage. If this move is successful and whether or not the target's evasiveness was affected, the effects of Reflect, Light Screen, Aurora Veil, Safeguard, Mist, Spikes, Toxic Spikes, Stealth Rock, and Sticky Web end for the target's side, and the effects of Spikes, Toxic Spikes, Stealth Rock, and Sticky Web end for the user's side. Ignores a target's substitute, although a substitute will still block the lowering of evasiveness.",
		shortDesc: "-1 evasion; clears user and target side's hazards.",
		onHit(target, source, move) {
			let success = false;
			if (!target.volatiles['substitute'] || move.infiltrates) success = !!this.boost({evasion: -1});
			const removeTarget = [
				'reflect', 'lightscreen', 'auroraveil', 'safeguard', 'mist', 'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge',
			];
			const removeAll = [
				'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge',
			];
			for (const targetCondition of removeTarget) {
				if (target.side.removeSideCondition(targetCondition)) {
					if (!removeAll.includes(targetCondition)) continue;
					this.add('-sideend', target.side, this.dex.conditions.get(targetCondition).name, '[from] move: Defog', '[of] ' + source);
					success = true;
				}
			}
			for (const sideCondition of removeAll) {
				if (source.side.removeSideCondition(sideCondition)) {
					this.add('-sideend', source.side, this.dex.conditions.get(sideCondition).name, '[from] move: Defog', '[of] ' + source);
					success = true;
				}
			}
			return success;
		},
	},
	destinybond: {
		inherit: true,
		desc: "Until the user's next turn, if an opposing Pokemon's attack knocks the user out, that Pokemon faints as well, unless the attack was Doom Desire or Future Sight.",
		onPrepareHit(pokemon) {
			pokemon.removeVolatile('destinybond');
		},
	},
	electricterrain: {
		inherit: true,
		desc: "For 5 turns, the terrain becomes Electric Terrain. During the effect, the power of Electric-type attacks made by grounded Pokemon is multiplied by 1.3 and grounded Pokemon cannot fall asleep; Pokemon already asleep do not wake up. Grounded Pokemon cannot become affected by Yawn or fall asleep from its effect. Camouflage transforms the user into an Electric type, Nature Power becomes Thunderbolt, and Secret Power has a 30% chance to cause paralysis. Fails if the current terrain is Electric Terrain.",
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onSetStatus(status, target, source, effect) {
				if (status.id === 'slp' && target.isGrounded() && !target.isSemiInvulnerable()) {
					if (effect.id === 'yawn' || (effect.effectType === 'Move' && !effect.secondaries)) {
						this.add('-activate', target, 'move: Electric Terrain');
					}
					return false;
				}
			},
			onTryAddVolatile(status, target) {
				if (!target.isGrounded() || target.isSemiInvulnerable()) return;
				if (status.id === 'yawn') {
					this.add('-activate', target, 'move: Electric Terrain');
					return null;
				}
			},
			onBasePower(basePower, attacker, defender, move) {
				if (move.type === 'Electric' && attacker.isGrounded() && !attacker.isSemiInvulnerable()) {
					this.debug('electric terrain boost');
					return this.chainModify(1.5);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect && effect.effectType === 'Ability') {
					this.effectState.duration = 0;
					this.add('-fieldstart', 'move: Electric Terrain', '[from] ability: ' + effect, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Electric Terrain');
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Electric Terrain');
			},
		},
	},
	explosion: {
		inherit: true,
		desc: "The user faints after using this move, even if this move fails for having no target. The target's Defense is halved during damage calculation. This move is prevented from executing if any active Pokemon has the Damp Ability.",
		shortDesc: "Target's Def halved during damage. User faints.",
	},
	grassyterrain: {
		inherit: true,
		desc: "For 5 turns, the terrain becomes Grassy Terrain. During the effect, the power of Grass-type attacks used by grounded Pokemon is multiplied by 1.5, the power of Bulldoze, Earthquake, and Magnitude used against grounded Pokemon is multiplied by 0.5, and grounded Pokemon have 1/16 of their maximum HP, rounded down, restored at the end of each turn, including the last turn. Camouflage transforms the user into a Grass type, Nature Power becomes Energy Ball, and Secret Power has a 30% chance to cause sleep. Fails if the current terrain is Grassy Terrain.",
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onBasePower(basePower, attacker, defender, move) {
				const weakenedMoves = ['earthquake', 'bulldoze', 'magnitude'];
				if (weakenedMoves.includes(move.id) && defender.isGrounded() && !defender.isSemiInvulnerable()) {
					this.debug('move weakened by grassy terrain');
					return this.chainModify(0.5);
				}
				if (move.type === 'Grass' && attacker.isGrounded()) {
					this.debug('grassy terrain boost');
					return this.chainModify(1.5);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect && effect.effectType === 'Ability') {
					this.effectState.duration = 0;
					this.add('-fieldstart', 'move: Grassy Terrain', '[from] ability: ' + effect, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Grassy Terrain');
				}
			},
			onResidualOrder: 5,
			onResidualSubOrder: 2,
			onResidual(pokemon) {
				if (pokemon.isGrounded() && !pokemon.isSemiInvulnerable()) {
					this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
				} else {
					this.debug(`Pokemon semi-invuln or not grounded; Grassy Terrain skipped`);
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Grassy Terrain');
			},
		},
	},
	mistyexplosion: {
		inherit: true,
		desc: "If the current terrain is Misty Terrain and the user is grounded, this move's power is multiplied by 1.5. The user faints after using this move, even if this move fails for having no target. The target's Defense is halved during damage calculation. This move is prevented from executing if any active Pokemon has the Damp Ability.",
		shortDesc: "Target's Def halved during damage. User faints. User on Misty Terrain: 1.5x power.",
		basePower: 200,
	},
	mistyterrain: {
		inherit: true,
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onSetStatus(status, target, source, effect) {
				if (!target.isGrounded() || target.isSemiInvulnerable()) return;
				if (effect && ((effect as Move).status || effect.id === 'yawn')) {
					this.add('-activate', target, 'move: Misty Terrain');
				}
				return false;
			},
			onTryAddVolatile(status, target, source, effect) {
				if (!target.isGrounded() || target.isSemiInvulnerable()) return;
				if (status.id === 'confusion') {
					if (effect.effectType === 'Move' && !effect.secondaries) this.add('-activate', target, 'move: Misty Terrain');
					return null;
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, attacker, defender, move) {
				if (move.type === 'Dragon' && defender.isGrounded() && !defender.isSemiInvulnerable()) {
					this.debug('misty terrain weaken');
					return this.chainModify(0.5);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.effectState.duration = 0;
					this.add('-fieldstart', 'move: Misty Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Misty Terrain');
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'Misty Terrain');
			},
		},
	},
	psychicterrain: {
		inherit: true,
		desc: "For 5 turns, the terrain becomes Psychic Terrain. During the effect, the power of Psychic-type attacks made by grounded Pokemon is multiplied by 1.5 and grounded Pokemon cannot be hit by moves with priority greater than 0, unless the target is an ally. Camouflage transforms the user into a Psychic type, Nature Power becomes Psychic, and Secret Power has a 30% chance to lower the target's Speed by 1 stage. Fails if the current terrain is Psychic Terrain.",
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onTryHitPriority: 4,
			onTryHit(target, source, effect) {
				if (effect && (effect.priority <= 0.1 || effect.target === 'self')) {
					return;
				}
				if (target.isSemiInvulnerable() || target.isAlly(source)) return;
				if (!target.isGrounded()) {
					const baseMove = this.dex.moves.get(effect.id);
					if (baseMove.priority > 0) {
						this.hint("Psychic Terrain doesn't affect Pokémon immune to Ground.");
					}
					return;
				}
				this.add('-activate', target, 'move: Psychic Terrain');
				return null;
			},
			onBasePower(basePower, attacker, defender, move) {
				if (move.type === 'Psychic' && attacker.isGrounded() && !attacker.isSemiInvulnerable()) {
					this.debug('psychic terrain boost');
					return this.chainModify(1.5);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect && effect.effectType === 'Ability') {
					this.effectState.duration = 0;
					this.add('-fieldstart', 'move: Psychic Terrain', '[from] ability: ' + effect, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Psychic Terrain');
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Psychic Terrain');
			},
		},
	},
	selfdestruct: {
		inherit: true,
		desc: "The user faints after using this move, even if this move fails for having no target. The target's Defense is halved during damage calculation. This move is prevented from executing if any active Pokemon has the Damp Ability.",
		shortDesc: "Target's Def halved during damage. User faints.",
	},
	thief: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		onAfterHit() {},
	},
	thunderwave: {
		inherit: true,
		desc: "Paralyzes the target. This move does not ignore type immunity. If an Electric-type Pokemon uses this move, the target cannot avoid the attack, even if the target is in the middle of a two-turn move.",
		shortDesc: "Paralyzes the target. Electric types can't miss.",
	},
};
