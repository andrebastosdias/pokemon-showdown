export const Scripts: ModdedBattleScriptsData = {
	gen: 8,
	inherit: 'gen8',
	init() {
		this.modData('Abilities', 'noability').isNonstandard = null;
		for (const i in this.data.Pokedex) {
			// Cherrim, Regigigas, Arceus
			if (![421, 486, 493].includes(this.modData('Pokedex', i).num)) {
				this.modData('Pokedex', i).abilities = {0: 'No Ability'};
			}
			delete this.modData('Pokedex', i).requiredItem;
			delete this.modData('Pokedex', i).requiredItems;
		}
		for (const i in this.data.Moves) {
			this.modData('Moves', i).noPPBoosts = true;
		}

		// FIXME: avoid Zygarde-Complete and Necrozma-Ultra bug
		for (const i in this.data.FormatsData) {
			const formatData = this.modData('FormatsData', i);
			if (formatData.isNonstandard !== null) {
				formatData.tier = formatData.doublesTier = formatData.natDexTier = 'Illegal';
			}
		}
	},
	side: {
		canDynamaxNow() {
			return false;
		},
	},
};
