export const Scripts: ModdedBattleScriptsData = {
	gen: 9,
	inherit: 'gen9',
	init() {
		this.modData('Abilities', 'noability').isNonstandard = null;
		for (const i in this.data.Pokedex) {
			this.modData('Pokedex', i).abilities = { 0: 'No Ability' };
		}
		this.modData('Pokedex', 'aegislash').abilities = { 0: 'Stance Change' };
		this.modData('Pokedex', 'zygarde').abilities = { 0: 'Power Construct' };
		this.modData('Pokedex', 'zygarde10').abilities = { 0: 'Power Construct' };
		this.modData('Pokedex', 'zygardecomplete').abilities = { 0: 'Power Construct' };
		this.modData('Pokedex', 'zygardemega').abilities = { 0: 'Power Construct' };
		this.modData('Pokedex', 'mimikyu').abilities = { 0: 'Disguise' };
		this.modData('Pokedex', 'morpeko').abilities = { 0: 'Hunger Switch' };
		this.modData('Pokedex', 'tatsugiri').abilities = { 0: 'Commander' };
	},
};
