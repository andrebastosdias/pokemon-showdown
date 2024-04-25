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
			this.modData('Moves', i).noPPBoosts = true;
		}
	},
	side: {
		canDynamaxNow() {
			return false;
		},
	},
};
