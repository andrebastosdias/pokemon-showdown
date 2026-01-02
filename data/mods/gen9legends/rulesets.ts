export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {
	flatrules: {
		inherit: true,
		effectType: 'ValidatorRule',
		name: 'Flat Rules',
		ruleset: [
			'Obtainable', 'Species Clause', 'Nickname Clause', 'Item Clause = 1', 'Adjust Level = 50', 'Min Team Size = 3', 'Max Team Size = 3',
		],
		banlist: ['Restricted Legendary', 'Diancie'],
	},
	obtainable: {
		inherit: true,
		ruleset: ['Obtainable Moves', 'Obtainable Formes', 'EV Limit = Auto', 'Obtainable Misc'],
		onChangeSet(set) {
			set.ability = this.dex.species.get(set.species).abilities['0'];
		},
		onValidateTeam(team) {
			const itemTable = new this.dex.Multiset<string>();
			for (const set of team) {
				const item = this.dex.items.get(set.item);
				if (!item.exists || !item.megaStone) continue;
				itemTable.add(item.id);
			}
			for (const [itemid, num] of itemTable) {
				if (num <= 1) continue;
				return [
					`You are limited to 1 of each Mega Stone.`,
					`(You have more than 1 ${this.dex.items.get(itemid).name})`,
				];
			}
		},
	},
	teampreview: {
		inherit: true,
		onTeamPreview() {
			this.add('clearpoke');
			for (const pokemon of this.getAllPokemon()) {
				this.add('poke', pokemon.side.id, pokemon.details, '');
			}
			this.makeRequest('teampreview');
		},
	},
};
