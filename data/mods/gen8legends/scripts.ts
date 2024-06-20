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
		for (const i in this.data.FormatsData) {
			if (['Gigantamax', 'CAP'].includes(this.modData('FormatsData', i).isNonstandard)) {
				this.modData('FormatsData', i).isNonstandard = 'Past';
			}
		}
	},
	side: {
		canDynamaxNow() {
			return false;
		},
	},
};
