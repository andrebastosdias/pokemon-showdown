import {strict as assert} from 'assert';
import {Streams} from '../lib';
import {BattleStream} from '../sim';
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
	battle?: Battle;
	requestJSON?: AnyObject;
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

	_choose() : string {
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
	override _choose(): string {
		return super._choose();
	}
}

class RadicalRedBot extends Bot {
	override _choose(): string {
		return super._choose();
	}
}

export default Bot;
