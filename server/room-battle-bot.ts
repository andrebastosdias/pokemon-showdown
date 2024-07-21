import {FS, Streams} from '../lib';
import {BattleReady} from './ladders-challenges';
import {
	ChallengeType, PlayerIndex, RoomBattleOptions, RoomBattlePlayerOptions, RoomBattleStream, RoomBattleTimer,
} from './room-battle';
import {RoomGame, RoomGamePlayer} from './room-game';
import {RoomSettings} from './rooms';
import {Bot} from '../battle-ai/bot';
import {Connection} from './users';
import {CommandContext} from './chat';

type ChannelIndex = 0 | 1 | 2 | 3 | 4;

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

// time after a player disabling the timer before they can re-enable it
const LOCKDOWN_PERIOD = 30 * 60 * 1000; // 30 minutes

export class RoomBattleBotPlayer extends RoomGamePlayer<RoomBattleBot> {
	readonly slot: SideID;
	readonly channelIndex;
	request: BattleRequestTracker;
	wantsTie: boolean;
	wantsOpenTeamSheets: boolean | null;
	eliminated: boolean;
	/**
	 * Total timer.
	 *
	 * Starts at 210 per player in a ladder battle. Goes down by 5
	 * every tick. Goes up by 10 every turn (with some complications -
	 * see `nextRequest`), capped at starting time. The player loses if
	 * this reaches 0.
	 *
	 * The equivalent of "Your Time" in VGC.
	 *
	 */
	secondsLeft: number;
	/**
	 * Current turn timer.
	 *
	 * Set equal to the player's overall timer, but capped at 150
	 * seconds in a ladder battle. Goes down by 5 every tick.
	 * Tracked separately from the overall timer, and the player also
	 * loses if this reaches 0 (except in VGC where the default choice
	 * is chosen if it reaches 0).
	 */
	turnSecondsLeft: number;
	/**
	 * Disconnect timer.
	 *
	 * Starts at 60 seconds. While the player is disconnected, this
	 * will go down by 5 every tick. Tracked separately from the
	 * overall timer, and the player also loses if this reaches 0.
	 *
	 * Mostly exists so impatient players don't have to wait the full
	 * 150 seconds against a disconnected opponent.
 	*/
	dcSecondsLeft: number;
	/**
	 * Is the user actually in the room?
	 */
	active: boolean;
	/**
	 * Used to track a user's last known connection status, and display
	 * the proper message when it changes.
	 *
	 * `.active` is set right when the user joins/leaves, but `.knownActive`
	 * is only set after the timer knows about it.
	 */
	knownActive: boolean;
	invite: ID;
	/**
	 * Has the simulator received this player's team yet?
	 * Basically always yes except when creating a 4-player battle,
	 * in which case players will need to bring their own team.
	 */
	hasTeam: boolean;
	constructor(user: User | string | null, game: RoomBattleBot, num: PlayerIndex) {
		super(user, game, num);
		if (typeof user === 'string') user = null;

		this.slot = `p${num}` as SideID;
		this.channelIndex = (game.gameType === 'multi' && num > 2 ? num - 2 : num) as ChannelIndex;

		this.request = {rqid: 0, request: '', isWait: 'cantUndo', choice: ''};
		this.wantsTie = false;
		this.wantsOpenTeamSheets = null;
		this.active = !!user?.connected;
		this.eliminated = false;

		this.secondsLeft = 1;
		this.turnSecondsLeft = 1;
		this.dcSecondsLeft = 1;

		this.knownActive = true;
		this.invite = '';
		this.hasTeam = false;

		if (user) {
			user.games.add(this.game.roomid);
			user.updateSearch();
			for (const connection of user.connections) {
				if (connection.inRooms.has(game.roomid)) {
					Sockets.channelMove(connection.worker, this.game.roomid, this.channelIndex, connection.socketid);
				}
			}
		}
	}
	override destroy() {
		const user = this.getUser();
		if (user) {
			this.updateChannel(user, 0);
		}
		this.knownActive = false;
		this.active = false;
	}
	updateChannel(user: User | Connection, channel = this.channelIndex) {
		for (const connection of (user.connections || [user])) {
			Sockets.channelMove(connection.worker, this.game.roomid, channel, connection.socketid);
		}
	}
}

export class RoomBattleBot extends RoomGame<RoomBattleBotPlayer> {
	override readonly gameid = 'battle' as ID;
	override readonly room!: GameRoom;
	override readonly title: string;
	override readonly allowRenames: boolean;
	readonly format: string;
	/** Will exist even if the game is unrated, in case it's later forced to be rated */
	readonly ladder: string;
	readonly gameType: string | undefined;
	readonly challengeType: ChallengeType;
	/**
	 * The lower player's rating, for searching purposes.
	 * 0 for unrated battles. 1 for unknown ratings.
	 */
	readonly rated: number;
	/**
	 * userid that requested extraction -> playerids that accepted the extraction
	 */
	readonly allowExtraction: {[k: string]: Set<ID>} = {};
	readonly stream: Streams.ObjectReadWriteStream<string>;
	override readonly timer: RoomBattleTimer;
	started = false;
	active = false;
	replaySaved: boolean | 'auto' = false;
	forcedSettings: {modchat?: string | null, privacy?: string | null} = {};
	p1: RoomBattleBotPlayer = null!;
	p2: RoomBattleBotPlayer = null!;
	p3: RoomBattleBotPlayer = null!;
	p4: RoomBattleBotPlayer = null!;
	inviteOnlySetter: ID | null = null;
	logData: AnyObject | null = null;
	endType: 'forfeit' | 'forced' | 'normal' = 'normal';
	/**
	 * If the battle is ended: an array of the number of Pokemon left for each side.
	 */
	score: number[] | null = null;
	inputLog: string[] | null = null;
	turn = 0;
	rqid = 1;
	requestCount = 0;
	options: RoomBattleOptions;
	frozen?: boolean;
	dataResolvers?: [((args: string[]) => void), ((error: Error) => void)][];
	readonly bot: Bot;
	constructor(room: GameRoom, options: RoomBattleOptions, bot: Bot) {
		super(room);
		const format = Dex.formats.get(options.format, true);
		this.title = format.name;
		this.options = options;
		if (!this.title.endsWith(" Battle")) this.title += " Battle";
		this.allowRenames = options.allowRenames !== undefined ? !!options.allowRenames : (!options.rated && !options.tour);

		this.format = options.format;
		this.gameType = format.gameType;
		this.challengeType = options.challengeType || 'challenge';
		this.rated = options.rated === true ? 1 : options.rated || 0;
		this.ladder = typeof format.rated === 'string' ? toID(format.rated) : options.format;
		this.playerCap = format.playerCount - 1;

		this.bot = bot;

		this.stream = new RoomBattleStream();

		let ratedMessage = options.ratedMessage || '';
		if (this.rated) {
			ratedMessage = 'Rated battle';
		} else if (this.room.tour) {
			ratedMessage = 'Tournament battle';
		}

		this.room.battle = this;

		const battleOptions = {
			formatid: this.format,
			roomid: this.roomid,
			rated: ratedMessage,
			seed: options.seed,
		};
		if (options.inputLog) {
			void this.stream.write(options.inputLog);
		} else {
			void this.stream.write(`>start ` + JSON.stringify(battleOptions));
		}

		void this.listen();

		if (options.players.length > this.playerCap) {
			throw new Error(`${options.players.length} players passed to battle ${room.roomid} but ${this.playerCap} players expected`);
		}
		for (let i = 0; i < this.playerCap; i++) {
			const p = options.players[i];
			const player = this.addPlayer(p?.user || null, p || null);
			if (!player) throw new Error(`failed to create player ${i + 1} in ${room.roomid}`);
		}
		this.bot.player(this.stream);
		if (options.inputLog) {
			let scanIndex = 0;
			for (const player of this.players) {
				const nameIndex1 = options.inputLog.indexOf(`"name":"`, scanIndex);
				const nameIndex2 = options.inputLog.indexOf(`"`, nameIndex1 + 8);
				if (nameIndex1 < 0 || nameIndex2 < 0) break; // shouldn't happen. incomplete inputlog?
				scanIndex = nameIndex2 + 1;
				const name = options.inputLog.slice(nameIndex1 + 8, nameIndex2);
				player.name = name;
				player.hasTeam = true;
			}
		}
		this.timer = new RoomBattleTimer(this);
		if (Config.forcetimer || this.format.includes('blitz')) this.timer.start();
		this.start();
	}

	checkActive() {
		const active = (this.started && !this.ended && this.players.every(p => p.active));
		Rooms.global.battleCount += (active ? 1 : 0) - (this.active ? 1 : 0);
		this.room.active = active;
		this.active = active;
		if (Rooms.global.battleCount === 0) Rooms.global.automaticKillRequest();
	}
	override choose(user: User, data: string) {
		if (this.frozen) {
			user.popup(`Your battle is currently paused, so you cannot move right now.`);
			return;
		}
		const player = this.playerTable[user.id];
		const [choice, rqid] = data.split('|', 2);
		if (!player) return;
		const request = player.request;
		if (request.isWait !== false && request.isWait !== true) {
			player.sendRoom(`|error|[Invalid choice] There's nothing to choose`);
			return;
		}
		const allPlayersWait = this.players.every(p => !!p.request.isWait);
		if (allPlayersWait || // too late
			(rqid && rqid !== '' + request.rqid)) { // WAY too late
			player.sendRoom(`|error|[Invalid choice] Sorry, too late to make a different move; the next turn has already started`);
			return;
		}
		request.isWait = true;
		request.choice = choice;

		void this.stream.write(`>${player.slot} ${choice}`);
	}
	override undo(user: User, data: string) {
		const player = this.playerTable[user.id];
		const [, rqid] = data.split('|', 2);
		if (!player) return;
		const request = player.request;
		if (request.isWait !== true) {
			player.sendRoom(`|error|[Invalid choice] There's nothing to cancel`);
			return;
		}
		const allPlayersWait = this.players.every(p => !!p.request.isWait);
		if (allPlayersWait || // too late
			(rqid && rqid !== '' + request.rqid)) { // WAY too late
			player.sendRoom(`|error|[Invalid choice] Sorry, too late to cancel; the next turn has already started`);
			return;
		}
		request.isWait = false;

		void this.stream.write(`>${player.slot} undo`);
	}
	override joinGame(user: User, slot?: SideID, playerOpts?: {team?: string}) {
		if (user.id in this.playerTable) {
			user.popup(`You have already joined this battle.`);
			return false;
		}

		const validSlots = this.players.filter(player => !player.id).map(player => player.slot);

		if (slot && !validSlots.includes(slot)) {
			user.popup(`This battle already has a user in slot ${slot}.`);
			return false;
		}

		if (!validSlots.length) {
			user.popup(`This battle already has ${this.playerCap} players.`);
			return false;
		}

		slot ??= this.players.find(player => player.invite === user.id)?.slot;
		if (!slot && validSlots.length > 1) {
			user.popup(`Which slot would you like to join into? Use something like \`/joingame ${validSlots[0]}\``);
			return false;
		}
		slot ??= validSlots[0];

		if (this[slot].invite === user.id) {
			this.room.auth.set(user.id, Users.PLAYER_SYMBOL);
		} else if (!user.can('joinbattle', null, this.room)) {
			user.popup(`You must be set as a player to join a battle you didn't start. Ask a player to use /addplayer on you to join this battle.`);
			return false;
		}

		this.setPlayerUser(this[slot], user, playerOpts);
		if (validSlots.length - 1 <= 0) {
			// all players have joined, start the battle
			// onCreateBattleRoom crashes if some users are unavailable at start of battle
			// what do we do??? no clue but I guess just exclude them from the array for now
			const users = this.players.map(player => player.getUser()).filter(Boolean) as User[];
			Rooms.global.onCreateBattleRoom(users, this.room, {rated: this.rated});
			this.started = true;
			this.room.add(`|uhtmlchange|invites|`);
		} else if (!this.started && this.invitesFull()) {
			this.sendInviteForm(true);
		}
		if (user.inRooms.has(this.roomid)) this.onConnect(user);
		this.room.update();
		return true;
	}
	override leaveGame(user: User) {
		if (!user) return false; // ...
		if (this.room.rated || this.room.tour) {
			user.popup(`Players can't be swapped out in a ${this.room.tour ? "tournament" : "rated"} battle.`);
			return false;
		}
		const player = this.playerTable[user.id];
		if (!player) {
			user.popup(`Failed to leave battle - you're not a player.`);
			return false;
		}
		Chat.runHandlers('onBattleLeave', user, this.room);

		this.updatePlayer(player, null);
		this.room.update();
		return true;
	}

	override startTimer() {
		this.timer.start();
	}

	async listen() {
		let disconnected = false;
		try {
			for await (const next of this.stream) {
				if (!this.room) return; // room deleted in the middle of simulation
				this.receive(next.split('\n'));
			}
		} catch (err: any) {
			// Disconnected processes are already crashlogged when they happen;
			// also logging every battle room would overwhelm the crashlogger
			if (err.message.includes('Process disconnected')) {
				disconnected = true;
			} else {
				Monitor.crashlog(err, 'A sim stream');
			}
		}
		if (!this.ended) {
			this.room.add(`|bigerror|The simulator process crashed. We've been notified and will fix this ASAP.`);
			if (!disconnected) Monitor.crashlog(new Error(`Sim stream interrupted`), `A sim stream`);
			this.started = true;
			this.setEnded();
			this.checkActive();
		}
	}
	receive(lines: string[]) {
		for (const player of this.players) player.wantsTie = false;

		switch (lines[0]) {
		case 'requesteddata':
			lines = lines.slice(1);
			const [resolver] = this.dataResolvers!.shift()!;
			resolver(lines);
			break;

		case 'update':
			for (const line of lines.slice(1)) {
				if (line.startsWith('|turn|')) {
					this.turn = parseInt(line.slice(6));
				}
				this.room.add(line);
				if (line.startsWith(`|bigerror|You will auto-tie if `) && Config.allowrequestingties && !this.room.tour) {
					this.room.add(`|-hint|If you want to tie earlier, consider using \`/offertie\`.`);
				}
			}
			this.room.update();
			if (!this.ended) this.timer.nextRequest();
			this.checkActive();
			break;

		case 'sideupdate': {
			const slot = lines[1] as SideID;
			if (slot === this.bot.slot) {
				if (lines[2].startsWith(`|error|[Invalid choice]`)) {
					const undoFailed = lines[2].includes(`Can't undo`);
					const request = this.bot.request;
					request.isWait = undoFailed ? 'cantUndo' : false;
					request.choice = '';
				} else if (lines[2].startsWith(`|request|`)) {
					this.rqid++;
					const request = JSON.parse(lines[2].slice(9));
					request.rqid = this.rqid;
					const requestJSON = JSON.stringify(request);
					this.bot.request = {
						rqid: this.rqid,
						request: requestJSON,
						isWait: request.wait ? 'cantUndo' : false,
						choice: '',
					};
					this.requestCount++;
				}
				this.bot.choose(this.stream);
				break;
			}

			const player = this[slot];
			if (lines[2].startsWith(`|error|[Invalid choice] Can't do anything`)) {
				// ... should not happen
			} else if (lines[2].startsWith(`|error|[Invalid choice]`)) {
				const undoFailed = lines[2].includes(`Can't undo`);
				const request = this[slot].request;
				request.isWait = undoFailed ? 'cantUndo' : false;
				request.choice = '';
			} else if (lines[2].startsWith(`|request|`)) {
				this.rqid++;
				const request = JSON.parse(lines[2].slice(9));
				request.rqid = this.rqid;
				const requestJSON = JSON.stringify(request);
				this[slot].request = {
					rqid: this.rqid,
					request: requestJSON,
					isWait: request.wait ? 'cantUndo' : false,
					choice: '',
				};
				this.requestCount++;
				player?.sendRoom(`|request|${requestJSON}`);
				break;
			}
			player?.sendRoom(lines[2]);
			break;
		}

		case 'error': {
			if (process.uptime() * 1000 < LOCKDOWN_PERIOD) {
				const error = new Error();
				error.stack = lines.slice(1).join('\n');
				// lock down the server
				Rooms.global.startLockdown(error);
			}
			break;
		}

		case 'end':
			this.logData = JSON.parse(lines[1]);
			this.score = this.logData!.score;
			this.inputLog = this.logData!.inputLog;
			this.started = true;
			void this.end(this.logData!.winner);
			break;
		}
	}
	end(winnerName: unknown) {
		if (this.ended) return;
		this.setEnded();
		this.checkActive();
		this.timer.end();
		// Declare variables here in case we need them for non-rated battles logging.
		let p1score = 0.5;
		const winnerid = toID(winnerName);

		// Check if the battle was rated to update the ladder, return its response, and log the battle.
		if (winnerid === this.p1.id) {
			p1score = 1;
		} else {
			p1score = 0;
		}
		Chat.runHandlers('onBattleEnd', this, winnerid, this.players.map(p => p.id));
		if (this.room.rated && !this.options.isBestOfSubBattle) {
			void this.updateLadder(p1score, winnerid);
		} else if (Config.logchallenges) {
			void this.logBattle(p1score);
		} else if (!this.options.isBestOfSubBattle) {
			this.logData = null;
		}
		this.room.parent?.game?.onBattleWin?.(this.room, winnerid);
		// If the room's replay was hidden, don't let users join after the game is over
		if (this.room.hideReplay) {
			this.room.settings.modjoin = '%';
			this.room.setPrivate('hidden');
		}
		this.room.update();

		// so it stops showing up in the users' games list
		for (const player of this.players) {
			player.getUser()?.games.delete(this.roomid);
		}

		// If a replay was saved at any point or we were configured to autosavereplays,
		// reupload when the battle is over to overwrite the partial data (and potentially
		// reflect any changes that may have been made to the replay's hidden status).
		if (this.replaySaved || Config.autosavereplays) {
			const options = Config.autosavereplays === 'private' ? undefined : 'silent';
			return this.room.uploadReplay(undefined, undefined, options);
		}
	}
	async updateLadder(p1score: number, winnerid: ID) {}
	async logBattle(
		p1score: number, p1rating: AnyObject | null = null, p2rating: AnyObject | null = null,
		p3rating: AnyObject | null = null, p4rating: AnyObject | null = null
	) {
		if (Dex.formats.get(this.format, true).noLog) return;
		const logData = this.logData;
		if (!logData) return;
		this.logData = null; // deallocate to save space
		logData.log = this.room.getLog(-1).split('\n'); // replay log (exact damage)

		// delete some redundant data
		for (const rating of [p1rating, p2rating, p3rating, p4rating]) {
			if (rating) {
				delete rating.formatid;
				delete rating.username;
				delete rating.rpsigma;
				delete rating.sigma;
			}
		}

		logData.p1rating = p1rating;
		if (this.replaySaved) logData.replaySaved = this.replaySaved;
		if (this.playerCap > 1) {
			logData.p2rating = p2rating;
			logData.p3rating = p3rating;
			logData.p4rating = p4rating;
		}
		logData.endType = this.endType;
		if (!p1rating) logData.ladderError = true;
		const date = new Date();
		logData.timestamp = '' + date;
		logData.roomid = this.room.roomid;
		logData.format = this.room.format;

		const logsubfolder = Chat.toTimestamp(date).split(' ')[0];
		const logfolder = logsubfolder.split('-', 2).join('-');
		const tier = Dex.formats.get(this.room.format).id;
		const logpath = `logs/${logfolder}/${tier}/${logsubfolder}/`;

		await FS(logpath).mkdirp();
		await FS(`${logpath}${this.room.getReplayData().id}.log.json`).write(JSON.stringify(logData));
		// console.log(JSON.stringify(logData));
	}
	override onConnect(user: User, connection: Connection | null = null) {
		// this handles joining a battle in which a user is a participant,
		// where the user has already identified before attempting to join
		// the battle
		const player = this.playerTable[user.id];
		if (!player) return;
		player.updateChannel(connection || user);
		const request = player.request;
		if (request) {
			let data = `|request|${request.request}`;
			if (request.choice) data += `\n|sentchoice|${request.choice}`;
			(connection || user).sendTo(this.roomid, data);
		}
		if (!this.started) {
			this.sendInviteForm(connection || user);
		}
		if (!player.active) this.onJoin(user);
	}
	override onRename(user: User, oldUserid: ID, isJoining: boolean, isForceRenamed: boolean) {
		if (user.id === oldUserid) return;
		if (!this.playerTable) {
			// !! should never happen but somehow still does
			user.games.delete(this.roomid);
			return;
		}
		if (!(oldUserid in this.playerTable)) {
			if (user.id in this.playerTable) {
				// this handles a user renaming themselves into a user in the
				// battle (e.g. by using /nick)
				this.onConnect(user);
			}
			return;
		}
		if (!this.allowRenames) {
			const player = this.playerTable[oldUserid];
			if (player) {
				const message = isForceRenamed ? " lost by having an inappropriate name." : " forfeited by changing their name.";
				this.forfeitPlayer(player, message);
			}
			if (!(user.id in this.playerTable)) {
				user.games.delete(this.roomid);
			}
			return;
		}
		if (!user.named) {
			this.onLeave(user, oldUserid);
			return;
		}
		if (user.id in this.playerTable) return;
		const player = this.playerTable[oldUserid];
		if (player) {
			this.updatePlayer(player, user);
		}
		const options = {
			name: user.name,
			avatar: user.avatar,
		};
		void this.stream.write(`>player ${player.slot} ` + JSON.stringify(options));
	}
	override onJoin(user: User) {
		const player = this.playerTable[user.id];
		if (player && !player.active) {
			player.active = true;
			this.timer.checkActivity();
			this.room.add(`|player|${player.slot}|${user.name}|${user.avatar}|`);
			Chat.runHandlers('onBattleJoin', player.slot, user, this);
		}
	}
	override onLeave(user: User, oldUserid?: ID) {
		const player = this.playerTable[oldUserid || user.id];
		if (player?.active) {
			player.sendRoom(`|request|null`);
			player.active = false;
			this.timer.checkActivity();
			this.room.add(`|player|${player.slot}|`);
		}
	}

	win(user: User) {
		if (!user) {
			this.tie();
			return true;
		}
		const player = this.playerTable[user.id];
		if (!player) return false;
		void this.stream.write(`>forcewin ${player.slot}`);
	}
	tie() {
		void this.stream.write(`>forcetie`);
	}
	tiebreak() {
		void this.stream.write(`>tiebreak`);
	}
	override forfeit(user: User | string, message = '') {
		if (typeof user !== 'string') user = user.id;
		else user = toID(user);

		if (!(user in this.playerTable)) return false;
		return this.forfeitPlayer(this.playerTable[user], message);
	}

	forfeitPlayer(player: RoomBattleBotPlayer, message = '') {
		if (this.ended || !this.started || player.eliminated) return false;

		player.eliminated = true;
		this.room.add(`|-message|${player.name}${message || ' forfeited.'}`);
		this.endType = 'forfeit';
		if (this.playerCap > 1) {
			player.sendRoom(`|request|null`);
			this.setPlayerUser(player, null);
		}
		void this.stream.write(`>forcelose ${player.slot}`);
		return true;
	}

	/**
	 * playerOpts should be empty only if importing an inputlog
	 * (so the player isn't recreated)
	 */
	override addPlayer(user: User | string | null, playerOpts?: RoomBattlePlayerOptions | null) {
		const player = super.addPlayer(user);
		if (typeof user === 'string') user = null;
		if (!player) return null;
		const slot = player.slot;
		this[slot] = player;

		if (playerOpts) {
			const options = {
				name: player.name,
				avatar: user ? '' + user.avatar : '',
				team: playerOpts.team || undefined,
				rating: Math.round(playerOpts.rating || 0),
			};
			void this.stream.write(`>player ${slot} ${JSON.stringify(options)}`);
			player.hasTeam = true;
		}

		if (user) {
			this.room.auth.set(player.id, Users.PLAYER_SYMBOL);
		}
		if (user?.inRooms.has(this.roomid)) this.onConnect(user);
		return player;
	}

	checkPrivacySettings(options: RoomBattleOptions & Partial<RoomSettings>) {
		let inviteOnly = false;
		const privacySetter = new Set<ID>([]);
		for (const p of options.players) {
			if (p.user) {
				if (p.inviteOnly) {
					inviteOnly = true;
					privacySetter.add(p.user.id);
				} else if (p.hidden) {
					privacySetter.add(p.user.id);
				}
				this.checkForcedUserSettings(p.user);
			}
		}

		if (privacySetter.size) {
			const room = this.room;
			if (this.forcedSettings.privacy) {
				room.setPrivate(false);
				room.settings.modjoin = null;
				room.add(`|raw|<div class="broadcast-blue"><strong>This battle is required to be public due to a player having a name starting with '${this.forcedSettings.privacy}'.</div>`);
			} else if (!options.tour || (room.tour?.allowModjoin)) {
				room.setPrivate('hidden');
				if (inviteOnly) room.settings.modjoin = '%';
				room.privacySetter = privacySetter;
				if (inviteOnly) {
					room.settings.modjoin = '%';
					room.add(`|raw|<div class="broadcast-red"><strong>This battle is invite-only!</strong><br />Users must be invited with <code>/invite</code> (or be staff) to join</div>`);
				}
			}
		}
	}

	checkForcedUserSettings(user: User) {
		this.forcedSettings = {
			modchat: this.forcedSettings.modchat || RoomBattleBot.battleForcedSetting(user, 'modchat'),
			privacy: this.forcedSettings.privacy || RoomBattleBot.battleForcedSetting(user, 'privacy'),
		};
		if (
			this.players.some(p => p.getUser()?.battleSettings.special) ||
			(this.rated && this.forcedSettings.modchat)
		) {
			this.room.settings.modchat = '\u2606';
		}
	}

	static battleForcedSetting(user: User, key: 'modchat' | 'privacy') {
		if (Config.forcedpublicprefixes) {
			for (const prefix of Config.forcedpublicprefixes) {
				Chat.plugins['username-prefixes']?.prefixManager.addPrefix(prefix, 'privacy');
			}
			delete Config.forcedpublicprefixes;
		}
		if (!Config.forcedprefixes) return null;
		for (const {type, prefix} of Config.forcedprefixes) {
			if (user.id.startsWith(toID(prefix)) && type === key) return prefix;
		}
		return null;
	}

	makePlayer(user: User) {
		const num = (this.players.length + 1) as PlayerIndex;
		return new RoomBattleBotPlayer(user, this, num);
	}

	override setPlayerUser(player: RoomBattleBotPlayer, user: User | null, playerOpts?: {team?: string}) {
		if (user === null && this.room.auth.get(player.id) === Users.PLAYER_SYMBOL) {
			this.room.auth.set(player.id, '+');
		}
		super.setPlayerUser(player, user);

		player.invite = '';
		const slot = player.slot;
		if (user) {
			player.active = user.inRooms.has(this.roomid);
			player.knownActive = true;
			const options = {
				name: player.name,
				avatar: user.avatar,
				team: playerOpts?.team,
			};
			void this.stream.write(`>player ${slot} ` + JSON.stringify(options));
			if (playerOpts) player.hasTeam = true;

			this.room.add(`|player|${slot}|${player.name}|${user.avatar}|`);
			Chat.runHandlers('onBattleJoin', slot as string, user, this);
		} else {
			player.active = false;
			player.knownActive = false;
			const options = {
				name: '',
			};
			void this.stream.write(`>player ${slot} ` + JSON.stringify(options));

			this.room.add(`|player|${slot}|`);
		}
	}

	start() {
		this.room.title = `${this.p1.name} vs. ${this.bot.playerOptions.name}`;
		this.room.send(`|title|${this.room.title}`);
		const suspectTest = Chat.plugins['suspect-tests']?.suspectTests[this.format];
		if (suspectTest) {
			const format = Dex.formats.get(this.format);
			this.room.add(
				`|html|<div class="broadcast-blue"><strong>${format.name} is currently suspecting ${suspectTest.suspect}! ` +
				`For information on how to participate check out the <a href="${suspectTest.url}">suspect thread</a>.</strong></div>`
			).update();
		}

		// run onCreateBattleRoom handlers

		if (this.options.inputLog && this.players.every(player => player.hasTeam)) {
			// already started
			this.started = true;
		}
		const delayStart = this.options.delayedStart || !!this.options.inputLog;
		const users = this.players.map(player => {
			const user = player.getUser();
			if (!user && !delayStart) {
				throw new Error(`User ${player.id} not found on ${this.roomid} battle creation`);
			}
			return user;
		});
		if (!delayStart) {
			Rooms.global.onCreateBattleRoom(users as User[], this.room, {rated: this.rated});
			this.started = true;
		} else if (delayStart === 'multi') {
			this.room.add(`|uhtml|invites|<div class="broadcast broadcast-blue"><strong>This is a 4-player challenge battle</strong><br />The players will need to add more players before the battle can start.</div>`);
		}
	}

	invitesFull() {
		return this.players.every(player => player.id || player.invite);
	}
	/** true = send to every player; falsy = send to no one */
	sendInviteForm(connection: Connection | User | null | boolean) {
		if (connection === true) {
			for (const player of this.players) this.sendInviteForm(player.getUser());
			return;
		}
		if (!connection) return;

		const playerForms = this.players.map(player => (
			player.id ? (
				`<form><label>Player ${player.num}: <strong>${player.name}</strong></label></form>`
			) : player.invite ? (
				`<form data-submitsend="/msgroom ${this.roomid},/uninvitebattle ${player.invite}"><label>Player ${player.num}: <strong>${player.invite}</strong> (invited) <button>Uninvite</button></label></form>`
			) : (
				`<form data-submitsend="/msgroom ${this.roomid},/invitebattle {username}, p${player.num}"><label>Player ${player.num}: <input name="username" class="textbox" placeholder="Username" /></label> <button class="button">Add Player</button></form>`
			)
		));
		if (this.gameType === 'multi') {
			[playerForms[1], playerForms[2]] = [playerForms[2], playerForms[1]];
			playerForms.splice(2, 0, '&mdash; vs &mdash;');
		}
		connection.sendTo(
			this.room,
			`|uhtmlchange|invites|<div class="broadcast broadcast-blue"><strong>This battle needs more players to start</strong><br /><br />${playerForms.join(``)}</div>`
		);
	}

	override destroy() {
		if (!this.ended) {
			this.setEnded();
			this.room.parent?.game?.onBattleWin?.(this.room, '');
		}
		for (const player of this.players) {
			player.destroy();
		}
		this.playerTable = {};
		this.players = [];
		this.p1 = null!;
		this.p2 = null!;
		this.p3 = null!;
		this.p4 = null!;

		void this.stream.destroy();
		if (this.active) {
			Rooms.global.battleCount += -1;
			this.active = false;
		}

		(this as any).room = null;
		if (this.dataResolvers) {
			for (const [, reject] of this.dataResolvers) {
				// reject the promise, make whatever function called it return undefined
				reject(new Error('Battle was destroyed.'));
			}
		}
	}
	async getTeam(user: User | string) {
		// toID extracts user.id
		const id = toID(user);
		const player = this.playerTable[id];
		if (!player) return;
		return this.getPlayerTeam(player);
	}
	async getPlayerTeam(player: RoomBattleBotPlayer) {
		void this.stream.write(`>requestteam ${player.slot}`);
		const teamDataPromise = new Promise<string[]>((resolve, reject) => {
			if (!this.dataResolvers) this.dataResolvers = [];
			this.dataResolvers.push([resolve, reject]);
		});
		const resultStrings = await teamDataPromise;
		if (!resultStrings) return;
		const result = Teams.unpack(resultStrings[0]);
		return result;
	}
	override onChatMessage(message: string, user: User) {
		const parts = message.split('\n');
		for (const line of parts) {
			void this.stream.write(`>chat-inputlogonly ${user.getIdentity(this.room)}|${line}`);
		}
	}
	async getLog(): Promise<string[] | void> {
		if (!this.logData) this.logData = {};
		void this.stream.write('>requestlog');
		const logPromise = new Promise<string[]>((resolve, reject) => {
			if (!this.dataResolvers) this.dataResolvers = [];
			this.dataResolvers.push([resolve, reject]);
		});
		const result = await logPromise;
		return result;
	}
}

export async function challbot(
	commandContext: CommandContext, target: string, room: Room | null, user: User, connection: Connection
) {
	const ladder = Ladders(target);

	const ready = await ladder.prepBattle(connection, 'challenge');
	if (!ready) return false;

	const bot = new (require('../battle-ai/bot').default as typeof Bot)(ladder.formatid);
	bot.team(ladder.formatid);

	const gameRoom = match(ready, bot);
	if (!gameRoom) return false;

	commandContext.pmTarget = connection.user || commandContext.pmTarget;
	const user1Identity = user.getIdentity();
	const user2Identity = 'Bot';
	user.send(`|pm|${user1Identity}|${user2Identity}|/challenge ${ladder.formatid}|${ladder.formatid}|||`);
	user.send(`|pm|${user1Identity}|${user2Identity}|/log ${user.name} wants to battle!`);
	user.send(`|pm|${user2Identity}|${user1Identity}|/challenge`);
	user.send(`|pm|${user2Identity}|${user1Identity}|/nonotify ${user2Identity} accepted the challenge, starting &laquo;<a href="/${gameRoom.roomid}">${gameRoom.roomid}</a>&raquo;`);

	return true;
}

function match(ready: BattleReady, bot: Bot) {
	const formatid = ready.formatid;
	const user = Users.get(ready.userid);
	if (!user) {
		return;
	}
	const player = {
		user,
		team: ready.settings.team,
		rating: ready.rating,
		hidden: ready.settings.hidden,
		inviteOnly: ready.settings.inviteOnly,
	};
	return createBattle({
		format: formatid,
		players: [player],
		rated: ready.rating,
		challengeType: ready.challengeType,
		delayedStart: false,
	}, bot);
}

function createBattle(options: RoomBattleOptions & Partial<RoomSettings>, bot: Bot) {
	const players = options.players.map(player => player.user);
	const format = Dex.formats.get(options.format);
	const playerCount = format.playerCount - 1;
	if (players.length > playerCount) {
		throw new Error(`${players.length} players were provided, but the format is a ${playerCount}-player format.`);
	}
	if (new Set(players).size < players.length) {
		throw new Error(`Players can't battle themselves`);
	}

	const p1Special = players.length ? players[0].battleSettings.special : undefined;
	let mismatch = `"${p1Special}"`;
	for (const user of players) {
		if (user.battleSettings.special !== p1Special) {
			mismatch += ` vs. "${user.battleSettings.special}"`;
		}
		user.battleSettings.special = undefined;
	}

	if (mismatch !== `"${p1Special}"`) {
		for (const user of players) {
			user.popup(`Your special battle settings don't match: ${mismatch}`);
		}
		return null;
	} else if (p1Special) {
		options.ratedMessage = p1Special;
	}

	// options.rated is a number representing the lowest player rating, for searching purposes
	// options.rated < 0 or falsy means "unrated", and will be converted to 0 here
	// options.rated === true is converted to 1 (used in tests sometimes)
	options.rated = Math.max(+options.rated! || 0, 0);
	const p1 = players[0];
	const p1name = p1 ? p1.name : "Player 1";
	const roomTitle = options.title || `${p1name} vs. ${bot.playerOptions.name}`;
	let roomid = options.roomid;
	roomid ||= Rooms.global.prepBattleRoom(options.format);
	options.isPersonal = true;
	const room = Rooms.createGameRoom(roomid, roomTitle, options);
	const game = new RoomBattleBot(room, options, bot);
	room.game = game;
	if (options.isBestOfSubBattle && room.parent) {
		room.setPrivate(room.parent.settings.isPrivate || false);
	} else {
		game.checkPrivacySettings(options);
	}

	for (const p of players) {
		if (p) {
			p.joinRoom(room);
			Monitor.countBattle(p.latestIp, p.name);
		}
	}

	return room;
}
