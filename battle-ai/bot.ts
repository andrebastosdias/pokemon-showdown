import {strict as assert} from 'assert';
import {Streams} from '../lib';
import {Battle, BattleStream} from '../sim';
import {PokemonSet} from '../sim/teams';
import {LegendsTeams} from './random-battles/teams';
import {TeamValidator} from './../sim/team-validator';

interface BattleRequestTracker {
	rqid: number;
	request: string;
	/**
	 * - true = user has decided,
	 * - false = user has yet to decide,
	 * - 'cantUndo' = waiting on other user (U-turn, faint-switch) or uncancellable (trapping ability)
	 */
	isWait: 'cantUndo' | true | false;
	choice: string;
}

export class Bot {
	readonly dex: ModdedDex;
	readonly playerOptions;
	readonly slot: SideID;
	request: BattleRequestTracker;
	battle: Battle;
	requestJSON: AnyObject;
	constructor(format: string, name?: string | null, avatar?: string | null, rating?: number | null, team?: string | null) {
		this.dex = Dex.forFormat(format);
		this.playerOptions = {
			name: name || 'Bot',
			avatar: avatar || '',
			team: team || undefined,
			rating: Math.round(rating || 0),
		};
		this.slot = `p2` as SideID;
		this.request = {rqid: 0, request: '', isWait: 'cantUndo', choice: ''};

		this.battle = null!;
		this.requestJSON = null!;
	}

	_team(formatid: string): PokemonSet[] {
		return LegendsTeams.generate(formatid);
	}

	team(formatid: string): void {
		if (Dex.formats.get(formatid, true).team !== "random") {
			const pokemonSet = this._team(formatid);

			const validator = new TeamValidator(formatid);
			assert.equal(validator.validateTeam(pokemonSet), null);

			this.playerOptions.team = Teams.pack(pokemonSet);
		}
	}

	player(stream: Streams.ObjectReadWriteStream<string>): void {
		void stream.write(`>player ${this.slot} ${JSON.stringify(this.playerOptions)}`);
	}

	_choose(): string {
		return "default";
	}

	choose(stream: Streams.ObjectReadWriteStream<string>): void {
		this.battle = (stream as BattleStream).battle as Battle;
		this.requestJSON = JSON.parse(this.request.request);
		if (!this.request.isWait) {
			this.request.choice = this._choose();
			this.request.isWait = true;
			void stream.write(`>${this.slot} ${this.request.choice}`);
		}
	}
}

class PokeEnvBot extends Bot {
	readonly speedTierCoefficient: number = 0.1;
	readonly hpFractionCoefficient: number = 0.4;
	readonly switchOutMatchupThreshold: number = -2;

	_choose(): string {
		return this.chooseMove();
	}

	private estimateMatchup(source: Pokemon, target: Pokemon): number {
		let score = 0;
		let effectivesses = source.getTypes().map(
			type => this.battle.dex.getImmunity(type, target) ? Math.pow(2, this.battle.dex.getEffectiveness(type, target)) : 0
		);
		score += Math.max(...effectivesses);

		effectivesses = target.getTypes().map(
			type => this.battle.dex.getImmunity(type, source) ? Math.pow(2, this.battle.dex.getEffectiveness(type, source)) : 0
		);
		score -= Math.max(...effectivesses);

		if (source.getStat('spe') > target.getStat('spe')) {
			score += this.speedTierCoefficient;
		} else if (source.getStat('spe') < target.getStat('spe')) {
			score -= this.speedTierCoefficient;
		}

		score += (source.hp / source.maxhp) * this.hpFractionCoefficient;
		score -= (target.hp / target.maxhp) * this.hpFractionCoefficient;

		return score;
	}

	private shouldSwitchOut(source: Pokemon, target: Pokemon): boolean {
		if (source.side.pokemon.filter(x => !x.fainted && !x.isActive).some(
			switches => this.estimateMatchup(switches, target) > 0
		)) {
			if (source.boosts['def'] <= -3 || source.boosts['spd'] <= -3) {
				return true;
			}
			if (source.boosts['atk'] <= -3 && source.storedStats['atk'] >= source.storedStats['spa']) {
				return true;
			}
			if (source.boosts['spa'] <= -3 && source.storedStats['atk'] <= source.storedStats['spa']) {
				return true;
			}
			if (this.estimateMatchup(source, target) < this.switchOutMatchupThreshold) {
				return true;
			}
		}
		return false;
	}

	private mergeBoosts(move: Move): Partial<BoostsTable> {
		const boostsList: Partial<BoostsTable>[] = [
			move.target === 'self' ? move.boosts || {} : {},
			move.selfBoost?.boosts || {},
			move.self?.boosts || {},
			move.secondary?.chance === 100 ? move.secondary?.self?.boosts || {} : {},
		];

		const mergedBoosts: Partial<BoostsTable> = {};

		for (const boosts of boostsList) {
			// loop through boosts
			for (const key in boosts) {
				mergedBoosts[key as BoostID] = (mergedBoosts[key as BoostID] || 0) + (boosts[key as BoostID] || 0);
			}
		}

		return mergedBoosts;
	}

	private chooseMove(): string {
		const source = this.battle.getSide(this.slot).active[0];
		const target = this.battle.getSide(this.slot).foe.active[0];

		const switches = this.battle.getSide(this.slot).pokemon.filter(x => !x.fainted && !x.isActive);
		if (!source || source.fainted) {
			let bestSwitch;
			if (!target) {
				const opponentTeam = this.battle.getSide(this.slot).foe.pokemon.filter(x => !x.fainted);
				bestSwitch = switches.reduce(
					(a, b) => Math.min(...opponentTeam.map(x => this.estimateMatchup(a, x))) > Math.min(...opponentTeam.map(x => this.estimateMatchup(b, x))) ? a : b
				);
			} else {
				bestSwitch = switches.reduce(
					(a, b) => this.estimateMatchup(a, target) > this.estimateMatchup(b, target) ? a : b
				);
			}
			if (this.requestJSON.teamPreview) {
				return "team " + (bestSwitch.position + 1);
			}
			return "switch " + bestSwitch.name;
		}

		const moves = source.getMoves().filter(x => !x.disabled && (x.pp as number) > 0).map(x => this.dex.moves.get(x.id));

		if (moves.length && (!this.shouldSwitchOut(source, target) || !switches.length)) {
			const numberOpponentRemainingMons = source.side.foe.pokemon.filter(x => !x.fainted).length;

			for (const move of moves) {
				if (
					numberOpponentRemainingMons >= 3 && ['stealthrock', 'stoneaxe'].includes(move.id) &&
					!target.side.getSideCondition('stealthrock')
				) {
					return "move " + move.id;
				}

				if (
					numberOpponentRemainingMons >= 3 && ['spikes', 'ceaselessedge'].includes(move.id) &&
					!target.side.getSideCondition('spikes')
				) {
					return "move " + move.id;
				}
			}

			if (target.hp === target.maxhp && this.estimateMatchup(source, target) > 0) {
				for (const move of moves) {
					const boosts = this.mergeBoosts(move);
					if (
						Object.values(boosts).reduce((a, b) => a + b, 0) >= 2 &&
						Object.keys(boosts).filter(x => (boosts[x as BoostID] as number) > 0).some(x => source.boosts[x as BoostID] < 6)
					) {
						return "move " + move.id;
					}
				}
			}

			const maxDamageMove = moves.reduce((a, b) => {
				const damageA = this.battle.actions.getDamage(source, target, a.id) || 0;
				const damageB = this.battle.actions.getDamage(source, target, b.id) || 0;
				return damageA > damageB ? a : b;
			});
			return "move " + maxDamageMove.id;
		}

		if (!switches.length) {
			const bestSwitch = switches.reduce(
				(a, b) => this.estimateMatchup(a, target) > this.estimateMatchup(b, target) ? a : b
			);
			return "switch " + bestSwitch.name;
		}

		return super._choose();
	}
}

export default PokeEnvBot;
