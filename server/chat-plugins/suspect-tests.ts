import {FS} from '../../lib/fs';

const SUSPECTS_FILE = 'config/suspects.json';

interface SuspectTest {
	tier: string;
	suspect: string;
	date: string;
	url: string;
}

interface SuspectsFile {
	whitelist: string[];
	suspects: {[format: string]: SuspectTest};
}

export let suspectTests: SuspectsFile = JSON.parse(FS(SUSPECTS_FILE).readIfExistsSync() || "{}");

function saveSuspectTests() {
	FS(SUSPECTS_FILE).writeUpdate(() => JSON.stringify(suspectTests));
}

const defaults: SuspectsFile = {
	whitelist: [],
	suspects: {},
};

if (!suspectTests.whitelist && !suspectTests.suspects) {
	const suspects = {...suspectTests} as unknown as {[format: string]: SuspectTest};
	suspectTests = {...defaults, suspects};
	saveSuspectTests();
}

function checkPermissions(context: Chat.CommandContext) {
	const user = context.user;
	if (suspectTests.whitelist?.includes(user.id)) return true;
	context.checkCan('gdeclare');
}

export const commands: Chat.ChatCommands = {
	suspect: 'suspects',
	suspects: {
		''(target, room, user) {
			const suspects = suspectTests.suspects;
			if (!Object.keys(suspects).length) {
				throw new Chat.ErrorMessage("There are no suspect tests running.");
			}
			if (!this.runBroadcast()) return;

			let buffer = '<strong>Suspect tests currently running:</strong>';
			for (const i of Object.keys(suspects)) {
				const test = suspects[i];
				buffer += '<br />';
				buffer += `${test.tier}: <a href="${test.url}">${test.suspect}</a> (${test.date})`;
			}
			return this.sendReplyBox(buffer);
		},

		edit: 'add',
		add(target, room, user) {
			checkPermissions(this);

			const [tier, suspect, date, url] = target.split(',');
			if (!(tier && suspect && date && url)) {
				return this.parse('/help suspects');
			}

			const format = Dex.formats.get(tier);
			if (!format.exists) throw new Chat.ErrorMessage(`"${tier}" is not a valid tier.`);

			const suspectString = suspect.trim();

			const [month, day] = date.trim().split(date.includes('-') ? '-' : '/');
			const isValidDate = /[0-1]?[0-9]/.test(month) && /[0-3]?[0-9]/.test(day);
			if (!isValidDate) throw new Chat.ErrorMessage("Dates must be in the format MM/DD.");
			const dateActual = `${month}/${day}`;

			const urlActual = url.trim();
			if (!/^https:\/\/www\.smogon\.com\/forums\/(threads|posts)\//.test(urlActual)) {
				throw new Chat.ErrorMessage("Suspect test URLs must be Smogon threads or posts.");
			}

			this.privateGlobalModAction(`${user.name} ${suspectTests.suspects[format.id] ? "edited the" : "added a"} ${format.name} suspect test.`);
			this.globalModlog('SUSPECTTEST', null, `${suspectTests.suspects[format.id] ? "edited" : "added"} ${format.name}`);

			suspectTests.suspects[format.id] = {
				tier: format.name,
				suspect: suspectString,
				date: dateActual,
				url: urlActual,
			};
			saveSuspectTests();
			this.sendReply(`Added a suspect test notice for ${suspectString} in ${format.name}.`);
		},

		end: 'remove',
		delete: 'remove',
		remove(target, room, user) {
			checkPermissions(this);

			const format = toID(target);
			const test = suspectTests.suspects[format];
			if (!test) return this.errorReply(`There is no suspect test for '${target}'. Check spelling?`);

			this.privateGlobalModAction(`${user.name} removed the ${test.tier} suspect test.`);
			this.globalModlog('SUSPECTTEST', null, `removed ${test.tier}`);

			delete suspectTests.suspects[format];
			saveSuspectTests();
			this.sendReply(`Removed a suspect test notice for ${test.suspect} in ${test.tier}.`);
		},

		whitelist(target, room, user) {
			this.checkCan('gdeclare');

			const userid = toID(target);

			if (!userid || userid.length > 18) {
				return this.parse(`/help suspects`);
			}

			if (suspectTests.whitelist.includes(userid)) {
				throw new Chat.ErrorMessage(`${userid} is already whitelisted to add suspect tests.`);
			}

			this.privateGlobalModAction(`${user.name} whitelisted ${userid} to add suspect tests.`);
			this.globalModlog('SUSPECTTEST', null, `whitelisted ${userid}`);

			suspectTests.whitelist.push(userid);
			saveSuspectTests();
		},

		unwhitelist(target, room, user) {
			this.checkCan('gdeclare');

			const userid = toID(target);

			if (!userid || userid.length > 18) {
				return this.parse(`/help suspects`);
			}

			const index = suspectTests.whitelist.indexOf(userid);

			if (index < 0) {
				throw new Chat.ErrorMessage(`${userid} is not whitelisted to add suspect tests.`);
			}

			this.privateGlobalModAction(`${user.name} unwhitelisted ${userid} from adding suspect tests.`);
			this.globalModlog('SUSPECTTEST', null, `unwhitelisted ${userid}`);

			suspectTests.whitelist.splice(index, 1);
			saveSuspectTests();
		},

		help() {
			return this.parse('/help suspects');
		},
	},

	suspectshelp() {
		this.sendReplyBox(
			`Commands to manage suspect tests:<br />` +
			`<code>/suspects</code>: displays currently running suspect tests.<br />` +
			`<code>/suspects add [tier], [suspect], [date], [link]</code>: adds a suspect test. Date in the format MM/DD. Requires: &<br />` +
			`<code>/suspects remove [tier]</code>: deletes a suspect test. Requires: &<br />` +
			`<code>/suspects whitelist [username]</code>: allows [username] to add suspect tests. Requires: &<br />` +
			`<code>/suspects unwhitelist [username]</code>: disallows [username] from adding suspect tests. Requires: &`
		);
	},
};
