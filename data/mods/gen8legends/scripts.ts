export const Scripts: ModdedBattleScriptsData = {
	gen: 8,
	inherit: 'gen8',
	init() {
		this.modData('Abilities', 'noability').isNonstandard = null;
		for (const i in this.data.Abilities) {
			if (![0, 112, 121, 122].includes(this.modData('Abilities', i).num)) {
				this.modData('Abilities', i).isNonstandard = "Past";
			}
		}

		for (const i in this.data.Pokedex) {
			if (![421, 486, 493].includes(this.modData('Pokedex', i).num)) {
				this.modData('Pokedex', i).abilities = {0: 'No Ability'};
			}
		}

		for (const i in this.data.Items) {
			this.modData('Items', i).isNonstandard = "Past";
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
