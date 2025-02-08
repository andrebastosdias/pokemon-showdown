export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	absolite: {
		inherit: true,
		isNonstandard: null,
	},
	absorbbulb: {
		inherit: true,
		isNonstandard: "Past",
	},
	adamantorb: {
		inherit: true,
		isNonstandard: "Past",
	},
	adrenalineorb: {
		inherit: true,
		isNonstandard: "Past",
	},
	aguavberry: {
		inherit: true,
		shortDesc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpD Nature. Single use.",
		onEat(pokemon) {
			this.heal(pokemon.baseMaxhp / 2);
			if (pokemon.getNature().minus === 'spd') {
				pokemon.addVolatile('confusion');
			}
		},
	},
	aerodactylite: {
		inherit: true,
		isNonstandard: null,
	},
	aggronite: {
		inherit: true,
		isNonstandard: null,
	},
	airballoon: {
		inherit: true,
		isNonstandard: "Past",
	},
	alakazite: {
		inherit: true,
		isNonstandard: null,
	},
	altarianite: {
		inherit: true,
		isNonstandard: null,
	},
	ampharosite: {
		inherit: true,
		isNonstandard: null,
	},
	audinite: {
		inherit: true,
		isNonstandard: null,
	},
	banettite: {
		inherit: true,
		isNonstandard: null,
	},
	beedrillite: {
		inherit: true,
		isNonstandard: null,
	},
	belueberry: {
		inherit: true,
		isNonstandard: null,
	},
	berryjuice: {
		inherit: true,
		isNonstandard: "Past",
	},
	berrysweet: {
		inherit: true,
		isNonstandard: "Past",
	},
	bignugget: {
		inherit: true,
		isNonstandard: "Past",
	},
	bigroot: {
		inherit: true,
		isNonstandard: "Past",
	},
	bindingband: {
		inherit: true,
		isNonstandard: "Past",
	},
	blacksludge: {
		inherit: true,
		isNonstandard: "Past",
	},
	blastoisinite: {
		inherit: true,
		isNonstandard: null,
	},
	blunderpolicy: {
		inherit: true,
		isNonstandard: "Past",
	},
	bottlecap: {
		inherit: true,
		isNonstandard: "Past",
	},
	brightpowder: {
		inherit: true,
		isNonstandard: "Past",
	},
	buggem: {
		inherit: true,
		isNonstandard: null,
	},
	bugmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	burndrive: {
		inherit: true,
		isNonstandard: "Past",
	},
	cameruptite: {
		inherit: true,
		isNonstandard: null,
	},
	cellbattery: {
		inherit: true,
		isNonstandard: "Past",
	},
	charizarditex: {
		inherit: true,
		isNonstandard: null,
	},
	chilldrive: {
		inherit: true,
		isNonstandard: "Past",
	},
	chippedpot: {
		inherit: true,
		isNonstandard: "Past",
	},
	cloversweet: {
		inherit: true,
		isNonstandard: "Past",
	},
	cornnberry: {
		inherit: true,
		isNonstandard: null,
	},
	crackedpot: {
		inherit: true,
		isNonstandard: "Past",
	},
	damprock: {
		inherit: true,
		isNonstandard: "Past",
	},
	darkgem: {
		inherit: true,
		isNonstandard: null,
	},
	darkmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	deepseascale: {
		inherit: true,
		isNonstandard: "Past",
	},
	deepseatooth: {
		inherit: true,
		isNonstandard: "Past",
	},
	destinyknot: {
		inherit: true,
		isNonstandard: "Past",
	},
	dousedrive: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragongem: {
		inherit: true,
		isNonstandard: null,
	},
	dragonmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	durinberry: {
		inherit: true,
		isNonstandard: null,
	},
	electricgem: {
		inherit: true,
		isNonstandard: null,
	},
	electricmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	enigmaberry: {
		inherit: true,
		isNonstandard: "Past",
	},
	eviolite: {
		inherit: true,
		isNonstandard: "Past",
	},
	fairygem: {
		inherit: true,
		isNonstandard: null,
	},
	fairymemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	fightinggem: {
		inherit: true,
		isNonstandard: null,
	},
	fightingmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	figyberry: {
		inherit: true,
		shortDesc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -Atk Nature. Single use.",
		onEat(pokemon) {
			this.heal(pokemon.baseMaxhp / 2);
			if (pokemon.getNature().minus === 'atk') {
				pokemon.addVolatile('confusion');
			}
		},
	},
	firegem: {
		inherit: true,
		isNonstandard: null,
	},
	firememory: {
		inherit: true,
		isNonstandard: "Past",
	},
	floatstone: {
		inherit: true,
		isNonstandard: "Past",
	},
	flowersweet: {
		inherit: true,
		isNonstandard: "Past",
	},
	flyinggem: {
		inherit: true,
		isNonstandard: null,
	},
	flyingmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	focusband: {
		inherit: true,
		isNonstandard: "Past",
	},
	fossilizedbird: {
		inherit: true,
		isNonstandard: "Past",
	},
	fossilizeddino: {
		inherit: true,
		isNonstandard: "Past",
	},
	fossilizeddrake: {
		inherit: true,
		isNonstandard: "Past",
	},
	fossilizedfish: {
		inherit: true,
		isNonstandard: "Past",
	},
	fullincense: {
		inherit: true,
		isNonstandard: "Past",
	},
	galaricacuff: {
		inherit: true,
		isNonstandard: "Past",
	},
	galaricawreath: {
		inherit: true,
		isNonstandard: "Past",
	},
	galladite: {
		inherit: true,
		isNonstandard: null,
	},
	garchompite: {
		inherit: true,
		isNonstandard: null,
	},
	gardevoirite: {
		inherit: true,
		isNonstandard: null,
	},
	gengarite: {
		inherit: true,
		isNonstandard: null,
	},
	ghostgem: {
		inherit: true,
		isNonstandard: null,
	},
	ghostmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	glalitite: {
		inherit: true,
		isNonstandard: null,
	},
	goldbottlecap: {
		inherit: true,
		isNonstandard: "Past",
	},
	grassgem: {
		inherit: true,
		isNonstandard: null,
	},
	grassmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	grepaberry: {
		inherit: true,
		isNonstandard: "Past",
	},
	gripclaw: {
		inherit: true,
		isNonstandard: "Past",
	},
	griseousorb: {
		inherit: true,
		isNonstandard: "Past",
	},
	groundgem: {
		inherit: true,
		isNonstandard: null,
	},
	groundmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	gyaradosite: {
		inherit: true,
		isNonstandard: null,
	},
	heatrock: {
		inherit: true,
		isNonstandard: "Past",
	},
	heracronite: {
		inherit: true,
		isNonstandard: null,
	},
	houndoominite: {
		inherit: true,
		isNonstandard: null,
	},
	iapapaberry: {
		inherit: true,
		shortDesc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -Def Nature. Single use.",
		onEat(pokemon) {
			this.heal(pokemon.baseMaxhp / 2);
			if (pokemon.getNature().minus === 'def') {
				pokemon.addVolatile('confusion');
			}
		},
	},
	icegem: {
		inherit: true,
		isNonstandard: null,
	},
	icememory: {
		inherit: true,
		isNonstandard: "Past",
	},
	icyrock: {
		inherit: true,
		isNonstandard: "Past",
	},
	keeberry: {
		inherit: true,
		isNonstandard: "Past",
	},
	laxincense: {
		inherit: true,
		isNonstandard: "Past",
	},
	leek: {
		inherit: true,
		isNonstandard: "Past",
	},
	lightball: {
		inherit: true,
		isNonstandard: "Past",
	},
	lightclay: {
		inherit: true,
		isNonstandard: "Past",
	},
	lopunnite: {
		inherit: true,
		isNonstandard: null,
	},
	lovesweet: {
		inherit: true,
		isNonstandard: "Past",
	},
	luminousmoss: {
		inherit: true,
		isNonstandard: "Past",
	},
	lustrousorb: {
		inherit: true,
		isNonstandard: "Past",
	},
	machobrace: {
		inherit: true,
		isNonstandard: "Past",
	},
	magoberry: {
		inherit: true,
		shortDesc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -Spe Nature. Single use.",
		onEat(pokemon) {
			this.heal(pokemon.baseMaxhp / 2);
			if (pokemon.getNature().minus === 'spe') {
				pokemon.addVolatile('confusion');
			}
		},
	},
	manectite: {
		inherit: true,
		isNonstandard: null,
	},
	marangaberry: {
		inherit: true,
		isNonstandard: "Past",
	},
	mawilite: {
		inherit: true,
		isNonstandard: null,
	},
	medichamite: {
		inherit: true,
		isNonstandard: null,
	},
	metalpowder: {
		inherit: true,
		isNonstandard: "Past",
	},
	oddincense: {
		inherit: true,
		isNonstandard: "Past",
	},
	ovalstone: {
		inherit: true,
		isNonstandard: "Past",
	},
	pidgeotite: {
		inherit: true,
		isNonstandard: null,
	},
	pinapberry: {
		inherit: true,
		isNonstandard: null,
	},
	pinsirite: {
		inherit: true,
		isNonstandard: null,
	},
	poisongem: {
		inherit: true,
		isNonstandard: null,
	},
	poisonmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	poweranklet: {
		inherit: true,
		isNonstandard: "Past",
	},
	powerband: {
		inherit: true,
		isNonstandard: "Past",
	},
	powerbelt: {
		inherit: true,
		isNonstandard: "Past",
	},
	powerbracer: {
		inherit: true,
		isNonstandard: "Past",
	},
	powerlens: {
		inherit: true,
		isNonstandard: "Past",
	},
	powerweight: {
		inherit: true,
		isNonstandard: "Past",
	},
	psychicgem: {
		inherit: true,
		isNonstandard: null,
	},
	psychicmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	quickclaw: {
		inherit: true,
		isNonstandard: "Past",
	},
	quickpowder: {
		inherit: true,
		isNonstandard: "Past",
	},
	rarebone: {
		inherit: true,
		isNonstandard: "Past",
	},
	razorfang: {
		inherit: true,
		isNonstandard: null,
	},
	reapercloth: {
		inherit: true,
		isNonstandard: "Past",
	},
	ribbonsweet: {
		inherit: true,
		isNonstandard: "Past",
	},
	ringtarget: {
		inherit: true,
		isNonstandard: "Past",
	},
	rockgem: {
		inherit: true,
		isNonstandard: null,
	},
	rockincense: {
		inherit: true,
		isNonstandard: "Past",
	},
	rockmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	roseincense: {
		inherit: true,
		isNonstandard: "Past",
	},
	rustedshield: {
		inherit: true,
		isNonstandard: "Past",
	},
	rustedsword: {
		inherit: true,
		isNonstandard: "Past",
	},
	sachet: {
		inherit: true,
		isNonstandard: "Past",
	},
	safetygoggles: {
		inherit: true,
		isNonstandard: "Past",
	},
	scizorite: {
		inherit: true,
		isNonstandard: null,
	},
	scopelens: {
		inherit: true,
		isNonstandard: "Past",
	},
	seaincense: {
		inherit: true,
		isNonstandard: "Past",
	},
	sharpedonite: {
		inherit: true,
		isNonstandard: null,
	},
	shockdrive: {
		inherit: true,
		isNonstandard: "Past",
	},
	slowbronite: {
		inherit: true,
		isNonstandard: null,
	},
	smoothrock: {
		inherit: true,
		isNonstandard: "Past",
	},
	snowball: {
		inherit: true,
		isNonstandard: "Past",
	},
	souldew: {
		inherit: true,
		shortDesc: "If held by a Latias or a Latios, its Sp. Atk and Sp. Def are 1.5x.",
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, pokemon) {
			if (pokemon.baseSpecies.num === 380 || pokemon.baseSpecies.num === 381) {
				return this.chainModify(1.5);
			}
		},
		onModifySpDPriority: 2,
		onModifySpD(spd, pokemon) {
			if (pokemon.baseSpecies.num === 380 || pokemon.baseSpecies.num === 381) {
				return this.chainModify(1.5);
			}
		},
	},
	starsweet: {
		inherit: true,
		isNonstandard: "Past",
	},
	steelgem: {
		inherit: true,
		isNonstandard: null,
	},
	steelixite: {
		inherit: true,
		isNonstandard: null,
	},
	steelmemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	strawberrysweet: {
		inherit: true,
		isNonstandard: "Past",
	},
	swampertite: {
		inherit: true,
		isNonstandard: null,
	},
	sweetapple: {
		inherit: true,
		isNonstandard: "Past",
	},
	tamatoberry: {
		inherit: true,
		isNonstandard: "Past",
	},
	tartapple: {
		inherit: true,
		isNonstandard: "Past",
	},
	terrainextender: {
		inherit: true,
		isNonstandard: "Past",
	},
	thickclub: {
		inherit: true,
		isNonstandard: "Past",
	},
	throatspray: {
		inherit: true,
		isNonstandard: "Past",
	},
	toxicorb: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr00: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr01: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr02: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr03: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr04: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr05: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr06: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr07: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr08: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr09: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr10: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr11: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr12: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr13: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr14: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr15: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr16: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr17: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr18: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr19: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr20: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr21: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr22: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr23: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr24: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr25: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr26: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr27: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr28: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr29: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr30: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr31: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr32: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr33: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr34: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr35: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr36: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr37: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr38: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr39: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr40: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr41: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr42: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr43: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr44: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr45: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr46: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr47: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr48: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr49: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr50: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr51: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr52: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr53: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr54: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr55: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr56: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr57: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr58: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr59: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr60: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr61: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr62: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr63: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr64: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr65: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr66: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr67: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr68: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr69: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr70: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr71: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr72: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr73: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr74: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr75: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr76: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr77: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr78: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr79: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr80: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr81: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr82: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr83: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr84: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr85: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr86: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr87: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr88: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr89: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr90: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr91: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr92: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr93: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr94: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr95: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr96: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr97: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr98: {
		inherit: true,
		isNonstandard: "Past",
	},
	tr99: {
		inherit: true,
		isNonstandard: "Past",
	},
	utilityumbrella: {
		inherit: true,
		isNonstandard: "Past",
	},
	venusaurite: {
		inherit: true,
		isNonstandard: null,
	},
	watergem: {
		inherit: true,
		isNonstandard: null,
	},
	watermemory: {
		inherit: true,
		isNonstandard: "Past",
	},
	watmelberry: {
		inherit: true,
		isNonstandard: null,
	},
	waveincense: {
		inherit: true,
		isNonstandard: "Past",
	},
	weaknesspolicy: {
		inherit: true,
		isNonstandard: "Past",
	},
	whippeddream: {
		inherit: true,
		isNonstandard: "Past",
	},
	wikiberry: {
		inherit: true,
		shortDesc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpA Nature. Single use.",
		onEat(pokemon) {
			this.heal(pokemon.baseMaxhp / 2);
			if (pokemon.getNature().minus === 'spa') {
				pokemon.addVolatile('confusion');
			}
		},
	},
};
