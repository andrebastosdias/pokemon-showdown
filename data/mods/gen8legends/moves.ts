export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	absorb: {
		inherit: true,
		basePower: 30,
		desc: "The user recovers 1/2 the HP lost by the target, rounded half up. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded half down.",
		shortDesc: "User recovers 50% of the damage dealt.",
		pp: 20,
	},
	accelerock: {
		inherit: true,
		isNonstandard: "Past",
	},
	acid: {
		inherit: true,
		isNonstandard: "Past",
	},
	acidarmor: {
		inherit: true,
		desc: "Raises the user's Defense by 2 stages.",
		shortDesc: "Raises the user's Defense by 2.",
		volatileStatus: 'guardboost',
		boosts: null,
	},
	acidspray: {
		inherit: true,
		desc: "Has a 100% chance to lower the target's Special Defense by 2 stages.",
		shortDesc: "100% chance to lower the target's Sp. Def by 2.",
		secondary: {
			chance: 50,
			volatileStatus: 'guarddrop',
		},
	},
	acrobatics: {
		inherit: true,
		isNonstandard: "Past",
	},
	acupressure: {
		inherit: true,
		isNonstandard: "Past",
	},
	aeroblast: {
		inherit: true,
		isNonstandard: "Past",
	},
	afteryou: {
		inherit: true,
		isNonstandard: "Past",
	},
	agility: {
		inherit: true,
		isNonstandard: "Past",
	},
	aircutter: {
		inherit: true,
		desc: "Has a higher chance for a critical hit.",
		shortDesc: "High critical hit ratio. Hits adjacent foes.",
		pp: 15,
	},
	airslash: {
		inherit: true,
		desc: "Has a 30% chance to make the target flinch.",
		shortDesc: "30% chance to make the target flinch.",
		pp: 10,
		secondary: null,
	},
	allyswitch: {
		inherit: true,
		isNonstandard: "Past",
	},
	amnesia: {
		inherit: true,
		isNonstandard: "Past",
	},
	anchorshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	ancientpower: {
		inherit: true,
		desc: "Has a 10% chance to raise the user's Attack, Defense, Special Attack, Special Defense, and Speed by 1 stage.",
		shortDesc: "10% chance to raise all stats by 1 (not acc/eva).",
		pp: 15,
		secondary: {
			chance: 20,
			self: {
				onHit(target, source, move) {
					source.addVolatile('powerboost', source, move);
					source.addVolatile('guardboost', source, move);
				},
			},
		},
	},
	appleacid: {
		inherit: true,
		isNonstandard: "Past",
	},
	aquajet: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "Usually goes first.",
		priority: 0,
	},
	aquaring: {
		inherit: true,
		isNonstandard: "Past",
	},
	aquatail: {
		inherit: true,
		basePower: 85,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
	},
	armthrust: {
		inherit: true,
		isNonstandard: "Past",
	},
	aromatherapy: {
		inherit: true,
		isNonstandard: "Past",
	},
	aromaticmist: {
		inherit: true,
		isNonstandard: "Past",
	},
	assurance: {
		inherit: true,
		isNonstandard: "Past",
	},
	astonish: {
		inherit: true,
		desc: "Has a 30% chance to make the target flinch.",
		shortDesc: "30% chance to make the target flinch.",
		pp: 25,
		secondary: null,
	},
	astralbarrage: {
		inherit: true,
		isNonstandard: "Past",
	},
	attackorder: {
		inherit: true,
		isNonstandard: "Past",
	},
	attract: {
		inherit: true,
		isNonstandard: "Past",
	},
	aurasphere: {
		inherit: true,
		desc: "This move does not check accuracy.",
		shortDesc: "This move does not check accuracy.",
		pp: 10,
	},
	aurawheel: {
		inherit: true,
		isNonstandard: "Past",
	},
	aurorabeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	auroraveil: {
		inherit: true,
		isNonstandard: "Past",
	},
	autotomize: {
		inherit: true,
		isNonstandard: "Past",
	},
	avalanche: {
		inherit: true,
		isNonstandard: "Past",
	},
	babydolleyes: {
		inherit: true,
		desc: "Lowers the target's Attack by 1 stage.",
		shortDesc: "Lowers the target's Attack by 1.",
		pp: 20,
		priority: 0,
		boosts: null,
		volatileStatus: 'powerdrop',
	},
	banefulbunker: {
		inherit: true,
		isNonstandard: "Past",
	},
	barbbarrage: {
		inherit: true,
		basePowerCallback(pokemon, target, move) {
			if (target.status) return move.basePower * 2;
			return move.basePower;
		},
		desc: "Has a 50% chance to poison the target. Power doubles if the target is already poisoned.",
		shortDesc: "50% psn. 2x power if target already poisoned.",
		isNonstandard: null,
		pp: 15,
		onBasePower() {},
		secondary: {
			chance: 30,
			status: 'psn',
		},
		gen: 8,
	},
	batonpass: {
		inherit: true,
		isNonstandard: "Past",
	},
	beatup: {
		inherit: true,
		isNonstandard: "Past",
	},
	behemothbash: {
		inherit: true,
		isNonstandard: "Past",
	},
	behemothblade: {
		inherit: true,
		isNonstandard: "Past",
	},
	belch: {
		inherit: true,
		isNonstandard: "Past",
	},
	bellydrum: {
		inherit: true,
		isNonstandard: "Past",
	},
	bind: {
		inherit: true,
		isNonstandard: "Past",
	},
	bite: {
		inherit: true,
		desc: "Has a 30% chance to make the target flinch.",
		shortDesc: "30% chance to make the target flinch.",
		pp: 20,
		secondary: null,
	},
	bittermalice: {
		inherit: true,
		basePower: 60,
		basePowerCallback(pokemon, target, move) {
			if (target.status) return move.basePower * 2;
			return move.basePower;
		},
		desc: "Has a 100% chance to lower the target's Attack by 1 stage.",
		shortDesc: "100% chance to lower the target's Attack by 1.",
		isNonstandard: null,
		pp: 15,
		secondary: {
			chance: 30,
			status: 'frz',
		},
		gen: 8,
	},
	blastburn: {
		inherit: true,
		isNonstandard: "Past",
	},
	blazekick: {
		inherit: true,
		isNonstandard: "Past",
	},
	bleakwindstorm: {
		inherit: true,
		basePower: 95,
		desc: "Has a 30% chance to lower the target's Speed by 1 stage. If the weather is Primordial Sea or Rain Dance, this move does not check accuracy. If this move is used against a Pokemon holding Utility Umbrella, this move's accuracy remains at 80%.",
		shortDesc: "30% to lower foe(s) Speed by 1. Rain: can't miss.",
		isNonstandard: null,
		pp: 5,
		secondary: {
			chance: 30,
			status: 'frz',
		},
		gen: 8,
	},
	blizzard: {
		inherit: true,
		accuracy: 75,
		basePower: 100,
		desc: "Has a 10% chance to freeze the target. If the weather is Hail, this move does not check accuracy.",
		shortDesc: "10% chance to freeze foe(s). Can't miss in Hail.",
		secondary: {
			chance: 30,
			status: 'frz',
		},
	},
	block: {
		inherit: true,
		isNonstandard: "Past",
	},
	blueflare: {
		inherit: true,
		isNonstandard: "Past",
	},
	bodypress: {
		inherit: true,
		isNonstandard: "Past",
	},
	bodyslam: {
		inherit: true,
		isNonstandard: "Past",
	},
	boltbeak: {
		inherit: true,
		isNonstandard: "Past",
	},
	boltstrike: {
		inherit: true,
		isNonstandard: "Past",
	},
	bonemerang: {
		inherit: true,
		isNonstandard: "Past",
	},
	bonerush: {
		inherit: true,
		isNonstandard: "Past",
	},
	boomburst: {
		inherit: true,
		isNonstandard: "Past",
	},
	bounce: {
		inherit: true,
		isNonstandard: "Past",
	},
	branchpoke: {
		inherit: true,
		isNonstandard: "Past",
	},
	bravebird: {
		inherit: true,
		basePower: 100,
		desc: "If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 33% recoil.",
		pp: 5,
	},
	breakingswipe: {
		inherit: true,
		isNonstandard: "Past",
	},
	brickbreak: {
		inherit: true,
		isNonstandard: "Past",
	},
	brine: {
		inherit: true,
		isNonstandard: "Past",
	},
	brutalswing: {
		inherit: true,
		isNonstandard: "Past",
	},
	bubble: {
		inherit: true,
		desc: "Has a 10% chance to lower the target's Speed by 1 stage.",
		shortDesc: "10% chance to lower the foe(s) Speed by 1.",
		isNonstandard: null,
		pp: 25,
		secondary: null,
	},
	bubblebeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	bugbite: {
		inherit: true,
		isNonstandard: "Past",
	},
	bugbuzz: {
		inherit: true,
		basePower: 80,
		desc: "Has a 10% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "10% chance to lower the target's Sp. Def by 1.",
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	bulkup: {
		inherit: true,
		desc: "Raises the user's Attack and Defense by 1 stage.",
		shortDesc: "Raises the user's Attack and Defense by 1.",
		pp: 10,
		onHit(target, source, move) {
			source.addVolatile('powerboost', source, move);
			source.addVolatile('guardboost', source, move);
		},
		boosts: null,
	},
	bulldoze: {
		inherit: true,
		desc: "Has a 100% chance to lower the target's Speed by 1 stage.",
		shortDesc: "100% chance lower adjacent Pkmn Speed by 1.",
		secondary: null,
	},
	bulletpunch: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "Usually goes first.",
		pp: 20,
		priority: 0,
	},
	bulletseed: {
		inherit: true,
		isNonstandard: "Past",
	},
	burningjealousy: {
		inherit: true,
		isNonstandard: "Past",
	},
	burnup: {
		inherit: true,
		isNonstandard: "Past",
	},
	calmmind: {
		inherit: true,
		desc: "Raises the user's Special Attack and Special Defense by 1 stage.",
		shortDesc: "Raises the user's Sp. Atk and Sp. Def by 1.",
		pp: 10,
		onHit(target, source, move) {
			source.addVolatile('powerboost', source, move);
			source.addVolatile('guardboost', source, move);
		},
		boosts: null,
	},
	ceaselessedge: {
		inherit: true,
		desc: "If this move is successful, it sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. A maximum of three layers may be set, and opponents lose 1/8 of their maximum HP with one layer, 1/6 of their maximum HP with two layers, and 1/4 of their maximum HP with three layers, all rounded down. Can be removed from the opposing side if any opposing Pokemon uses Mortal Spin, Rapid Spin, or Defog successfully, or is hit by Defog.",
		shortDesc: "Sets a layer of Spikes on the opposing side.",
		isNonstandard: null,
		critRatio: 2,
		onAfterHit() {},
		onAfterSubDamage() {},
		secondary: {
			chance: 100,
			volatileStatus: 'splinters',
		},
		gen: 8,
	},
	celebrate: {
		inherit: true,
		isNonstandard: "Past",
	},
	charge: {
		inherit: true,
		isNonstandard: "Past",
	},
	chargebeam: {
		inherit: true,
		desc: "Has a 70% chance to raise the user's Special Attack by 1 stage.",
		shortDesc: "70% chance to raise the user's Sp. Atk by 1.",
		pp: 15,
		secondary: {
			chance: 50,
			self: {
				volatileStatus: 'powerboost',
			},
		},
	},
	charm: {
		inherit: true,
		isNonstandard: "Past",
	},
	chloroblast: {
		inherit: true,
		basePower: 120,
		desc: "If this move is successful, the user loses 1/2 of its maximum HP, rounded up, unless the user has the Magic Guard Ability.",
		shortDesc: "User loses 50% max HP.",
		isNonstandard: null,
		gen: 8,
	},
	circlethrow: {
		inherit: true,
		isNonstandard: "Past",
	},
	clangingscales: {
		inherit: true,
		isNonstandard: "Past",
	},
	clangoroussoul: {
		inherit: true,
		isNonstandard: "Past",
	},
	clearsmog: {
		inherit: true,
		isNonstandard: "Past",
	},
	closecombat: {
		inherit: true,
		basePower: 100,
		desc: "Lowers the user's Defense and Special Defense by 1 stage.",
		shortDesc: "Lowers the user's Defense and Sp. Def by 1.",
		self: {
			volatileStatus: 'guarddrop',
		},
	},
	coaching: {
		inherit: true,
		isNonstandard: "Past",
	},
	coil: {
		inherit: true,
		isNonstandard: "Past",
	},
	confide: {
		inherit: true,
		isNonstandard: "Past",
	},
	confuseray: {
		inherit: true,
		isNonstandard: "Past",
	},
	confusion: {
		inherit: true,
		desc: "Has a 10% chance to confuse the target.",
		shortDesc: "10% chance to confuse the target.",
		pp: 20,
		secondary: null,
	},
	conversion: {
		inherit: true,
		isNonstandard: "Past",
	},
	conversion2: {
		inherit: true,
		isNonstandard: "Past",
	},
	copycat: {
		inherit: true,
		isNonstandard: "Past",
	},
	coreenforcer: {
		inherit: true,
		isNonstandard: "Past",
	},
	corrosivegas: {
		inherit: true,
		isNonstandard: "Past",
	},
	cosmicpower: {
		inherit: true,
		isNonstandard: "Past",
	},
	cottonguard: {
		inherit: true,
		isNonstandard: "Past",
	},
	cottonspore: {
		inherit: true,
		isNonstandard: "Past",
	},
	counter: {
		inherit: true,
		isNonstandard: "Past",
	},
	courtchange: {
		inherit: true,
		isNonstandard: "Past",
	},
	covet: {
		inherit: true,
		isNonstandard: "Past",
	},
	crabhammer: {
		inherit: true,
		isNonstandard: "Past",
	},
	craftyshield: {
		inherit: true,
		isNonstandard: "Past",
	},
	crosschop: {
		inherit: true,
		isNonstandard: "Past",
	},
	crosspoison: {
		inherit: true,
		desc: "Has a 10% chance to poison the target and a higher chance for a critical hit.",
		shortDesc: "High critical hit ratio. 10% chance to poison.",
		pp: 15,
		secondary: {
			chance: 20,
			status: 'psn',
		},
	},
	crunch: {
		inherit: true,
		desc: "Has a 20% chance to lower the target's Defense by 1 stage.",
		shortDesc: "20% chance to lower the target's Defense by 1.",
		pp: 10,
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	crushclaw: {
		inherit: true,
		isNonstandard: "Past",
	},
	crushgrip: {
		inherit: true,
		basePower: 100,
		desc: "Power is equal to 120 * (target's current HP / target's maximum HP), rounded half down, but not less than 1.",
		shortDesc: "More power the more HP the target has left.",
	},
	curse: {
		inherit: true,
		isNonstandard: "Past",
	},
	cut: {
		inherit: true,
		isNonstandard: "Past",
	},
	darkestlariat: {
		inherit: true,
		isNonstandard: "Past",
	},
	darkpulse: {
		inherit: true,
		accuracy: true,
		desc: "Has a 20% chance to make the target flinch.",
		shortDesc: "20% chance to make the target flinch.",
		pp: 10,
		secondary: null,
	},
	darkvoid: {
		inherit: true,
		accuracy: 90,
		desc: "Causes the target to fall asleep. This move cannot be used successfully unless the user's current form, while considering Transform, is Darkrai.",
		shortDesc: "Darkrai: Causes the foe(s) to fall asleep.",
		isNonstandard: null,
		onTry() {},
		volatileStatus: 'guarddrop',
	},
	dazzlinggleam: {
		inherit: true,
		basePower: 75,
		desc: "No additional effect.",
		shortDesc: "No additional effect. Hits adjacent foes.",
	},
	decorate: {
		inherit: true,
		isNonstandard: "Past",
	},
	defendorder: {
		inherit: true,
		isNonstandard: "Past",
	},
	defensecurl: {
		inherit: true,
		isNonstandard: "Past",
	},
	defog: {
		inherit: true,
		isNonstandard: "Past",
	},
	destinybond: {
		inherit: true,
		isNonstandard: "Past",
	},
	detect: {
		inherit: true,
		isNonstandard: "Past",
	},
	diamondstorm: {
		inherit: true,
		isNonstandard: "Past",
	},
	dig: {
		inherit: true,
		isNonstandard: "Past",
	},
	direclaw: {
		inherit: true,
		basePower: 60,
		desc: "Has a 50% chance to cause the target to either fall asleep, become poisoned, or become paralyzed.",
		shortDesc: "50% chance to sleep, poison, or paralyze target.",
		isNonstandard: null,
		critRatio: 2,
		gen: 8,
	},
	disable: {
		inherit: true,
		isNonstandard: "Past",
	},
	disarmingvoice: {
		inherit: true,
		isNonstandard: "Past",
	},
	discharge: {
		inherit: true,
		isNonstandard: "Past",
	},
	dive: {
		inherit: true,
		isNonstandard: "Past",
	},
	doomdesire: {
		inherit: true,
		isNonstandard: "Past",
	},
	doubleedge: {
		inherit: true,
		basePower: 100,
		desc: "If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 33% recoil.",
		pp: 5,
	},
	doublehit: {
		inherit: true,
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Hits twice. If the first hit breaks the target's substitute, it will take damage for the second hit.",
		shortDesc: "Hits 2 times in one turn.",
		multihit: 1,
		volatileStatus: 'primed',
		target: "self",
	},
	doubleironbash: {
		inherit: true,
		isNonstandard: "Past",
	},
	doublekick: {
		inherit: true,
		isNonstandard: "Past",
	},
	doubleteam: {
		inherit: true,
		isNonstandard: "Past",
	},
	dracometeor: {
		inherit: true,
		basePower: 110,
		desc: "Lowers the user's Special Attack by 2 stages.",
		shortDesc: "Lowers the user's Sp. Atk by 2.",
		self: {
			volatileStatus: 'powerdrop',
		},
	},
	dragonascent: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragonbreath: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragonclaw: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 10,
		critRatio: 2,
	},
	dragondance: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragondarts: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragonenergy: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragonhammer: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragonpulse: {
		inherit: true,
		accuracy: true,
		basePower: 80,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
	},
	dragonrush: {
		inherit: true,
		isNonstandard: "Past",
	},
	dragontail: {
		inherit: true,
		isNonstandard: "Past",
	},
	drainingkiss: {
		inherit: true,
		desc: "The user recovers 3/4 the HP lost by the target, rounded half up. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded half down.",
		shortDesc: "User recovers 75% of the damage dealt.",
		pp: 15,
	},
	dreameater: {
		inherit: true,
		isNonstandard: "Past",
	},
	drillpeck: {
		inherit: true,
		isNonstandard: "Past",
	},
	drillrun: {
		inherit: true,
		isNonstandard: "Past",
	},
	drumbeating: {
		inherit: true,
		isNonstandard: "Past",
	},
	dualchop: {
		inherit: true,
		isNonstandard: "Past",
	},
	dualwingbeat: {
		inherit: true,
		isNonstandard: "Past",
	},
	dynamaxcannon: {
		inherit: true,
		isNonstandard: "Past",
	},
	dynamicpunch: {
		inherit: true,
		isNonstandard: "Past",
	},
	earthpower: {
		inherit: true,
		basePower: 80,
		desc: "Has a 10% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "10% chance to lower the target's Sp. Def by 1.",
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	earthquake: {
		inherit: true,
		isNonstandard: "Past",
	},
	echoedvoice: {
		inherit: true,
		isNonstandard: "Past",
	},
	eerieimpulse: {
		inherit: true,
		isNonstandard: "Past",
	},
	eeriespell: {
		inherit: true,
		isNonstandard: "Past",
	},
	electricterrain: {
		inherit: true,
		isNonstandard: "Past",
	},
	electrify: {
		inherit: true,
		isNonstandard: "Past",
	},
	electroball: {
		inherit: true,
		isNonstandard: "Past",
	},
	electroweb: {
		inherit: true,
		isNonstandard: "Past",
	},
	ember: {
		inherit: true,
		desc: "Has a 10% chance to burn the target.",
		shortDesc: "10% chance to burn the target.",
		secondary: {
			chance: 30,
			status: 'brn',
		},
	},
	encore: {
		inherit: true,
		isNonstandard: "Past",
	},
	endeavor: {
		inherit: true,
		isNonstandard: "Past",
	},
	endure: {
		inherit: true,
		isNonstandard: "Past",
	},
	energyball: {
		inherit: true,
		basePower: 80,
		desc: "Has a 10% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "10% chance to lower the target's Sp. Def by 1.",
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	entrainment: {
		inherit: true,
		isNonstandard: "Past",
	},
	eruption: {
		inherit: true,
		isNonstandard: "Past",
	},
	esperwing: {
		inherit: true,
		accuracy: 90,
		basePower: 75,
		desc: "Has a 100% chance to raise the user's Speed by 1 stage and a higher chance for a critical hit.",
		shortDesc: "100% chance to raise user Speed by 1. High crit.",
		isNonstandard: null,
		secondary: null,
		gen: 8,
	},
	eternabeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	expandingforce: {
		inherit: true,
		isNonstandard: "Past",
	},
	explosion: {
		inherit: true,
		isNonstandard: "Past",
	},
	extrasensory: {
		inherit: true,
		basePower: 70,
		desc: "Has a 10% chance to make the target flinch.",
		shortDesc: "10% chance to make the target flinch.",
		pp: 15,
		secondary: null,
	},
	extremespeed: {
		inherit: true,
		isNonstandard: "Past",
	},
	facade: {
		inherit: true,
		isNonstandard: "Past",
	},
	fairylock: {
		inherit: true,
		isNonstandard: "Past",
	},
	fairywind: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 25,
	},
	fakeout: {
		inherit: true,
		isNonstandard: "Past",
	},
	faketears: {
		inherit: true,
		isNonstandard: "Past",
	},
	falsesurrender: {
		inherit: true,
		isNonstandard: "Past",
	},
	falseswipe: {
		inherit: true,
		desc: "Leaves the target with at least 1 HP.",
		shortDesc: "Always leaves the target with at least 1 HP.",
		pp: 30,
	},
	featherdance: {
		inherit: true,
		isNonstandard: "Past",
	},
	feint: {
		inherit: true,
		isNonstandard: "Past",
	},
	fellstinger: {
		inherit: true,
		isNonstandard: "Past",
	},
	fierydance: {
		inherit: true,
		isNonstandard: "Past",
	},
	fierywrath: {
		inherit: true,
		isNonstandard: "Past",
	},
	finalgambit: {
		inherit: true,
		isNonstandard: "Past",
	},
	fireblast: {
		inherit: true,
		basePower: 100,
		desc: "Has a 10% chance to burn the target.",
		shortDesc: "10% chance to burn the target.",
		secondary: {
			chance: 20,
			status: 'brn',
		},
	},
	firefang: {
		inherit: true,
		desc: "Has a 10% chance to burn the target and a 10% chance to make it flinch.",
		shortDesc: "10% chance to burn. 10% chance to flinch.",
		secondary: {
			chance: 20,
			status: 'brn',
		},
		secondaries: null,
	},
	firelash: {
		inherit: true,
		isNonstandard: "Past",
	},
	firepledge: {
		inherit: true,
		isNonstandard: "Past",
	},
	firepunch: {
		inherit: true,
		desc: "Has a 10% chance to burn the target.",
		shortDesc: "10% chance to burn the target.",
		pp: 10,
		secondary: {
			chance: 30,
			status: 'brn',
		},
	},
	firespin: {
		inherit: true,
		isNonstandard: "Past",
	},
	firstimpression: {
		inherit: true,
		isNonstandard: "Past",
	},
	fishiousrend: {
		inherit: true,
		isNonstandard: "Past",
	},
	fissure: {
		inherit: true,
		isNonstandard: "Past",
	},
	flail: {
		inherit: true,
		isNonstandard: "Past",
	},
	flamecharge: {
		inherit: true,
		isNonstandard: "Past",
	},
	flamethrower: {
		inherit: true,
		basePower: 80,
		desc: "Has a 10% chance to burn the target.",
		shortDesc: "10% chance to burn the target.",
		pp: 10,
		secondary: {
			chance: 20,
			status: 'brn',
		},
	},
	flamewheel: {
		inherit: true,
		desc: "Has a 10% chance to burn the target.",
		shortDesc: "10% chance to burn the target. Thaws user.",
		pp: 20,
		secondary: {
			chance: 30,
			status: 'brn',
		},
	},
	flareblitz: {
		inherit: true,
		basePower: 100,
		desc: "Has a 10% chance to burn the target. If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 33% recoil. 10% chance to burn. Thaws user.",
		pp: 5,
		secondary: {
			chance: 20,
			status: 'brn',
		},
	},
	flashcannon: {
		inherit: true,
		desc: "Has a 10% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "10% chance to lower the target's Sp. Def by 1.",
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	flatter: {
		inherit: true,
		isNonstandard: "Past",
	},
	fleurcannon: {
		inherit: true,
		isNonstandard: "Past",
	},
	fling: {
		inherit: true,
		isNonstandard: "Past",
	},
	flipturn: {
		inherit: true,
		isNonstandard: "Past",
	},
	floralhealing: {
		inherit: true,
		isNonstandard: "Past",
	},
	flowershield: {
		inherit: true,
		isNonstandard: "Past",
	},
	fly: {
		inherit: true,
		isNonstandard: "Past",
	},
	flyingpress: {
		inherit: true,
		isNonstandard: "Past",
	},
	focusblast: {
		inherit: true,
		isNonstandard: "Past",
	},
	focusenergy: {
		inherit: true,
		desc: "Raises the user's chance for a critical hit by 2 stages. Fails if the user already has the effect. Baton Pass can be used to transfer this effect to an ally.",
		shortDesc: "Raises the user's critical hit ratio by 2.",
		pp: 20,
		condition: {
			onStart(target) {
				this.add('-start', target, 'focusenergy');
			},
			onEnd(target) {
				this.add('-end', target, 'focusenergy');
			},
			onModifyCritRatio(critRatio) {
				return critRatio + 2;
			},
		},
	},
	focuspunch: {
		inherit: true,
		isNonstandard: "Past",
	},
	followme: {
		inherit: true,
		isNonstandard: "Past",
	},
	forcepalm: {
		inherit: true,
		isNonstandard: "Past",
	},
	forestscurse: {
		inherit: true,
		isNonstandard: "Past",
	},
	foulplay: {
		inherit: true,
		isNonstandard: "Past",
	},
	freezedry: {
		inherit: true,
		isNonstandard: "Past",
	},
	freezeshock: {
		inherit: true,
		isNonstandard: "Past",
	},
	freezingglare: {
		inherit: true,
		isNonstandard: "Past",
	},
	frenzyplant: {
		inherit: true,
		isNonstandard: "Past",
	},
	frostbreath: {
		inherit: true,
		isNonstandard: "Past",
	},
	furyattack: {
		inherit: true,
		isNonstandard: "Past",
	},
	furycutter: {
		inherit: true,
		isNonstandard: "Past",
	},
	furyswipes: {
		inherit: true,
		isNonstandard: "Past",
	},
	fusionbolt: {
		inherit: true,
		isNonstandard: "Past",
	},
	fusionflare: {
		inherit: true,
		isNonstandard: "Past",
	},
	futuresight: {
		inherit: true,
		isNonstandard: "Past",
	},
	gastroacid: {
		inherit: true,
		isNonstandard: "Past",
	},
	geargrind: {
		inherit: true,
		isNonstandard: "Past",
	},
	gearup: {
		inherit: true,
		isNonstandard: "Past",
	},
	geomancy: {
		inherit: true,
		isNonstandard: "Past",
	},
	gigadrain: {
		inherit: true,
		isNonstandard: "Past",
	},
	gigaimpact: {
		inherit: true,
		basePower: 120,
		desc: "If this move is successful, the user must recharge on the following turn and cannot select a move.",
		shortDesc: "User cannot move next turn.",
	},
	glaciallance: {
		inherit: true,
		isNonstandard: "Past",
	},
	glaciate: {
		inherit: true,
		isNonstandard: "Past",
	},
	glare: {
		inherit: true,
		isNonstandard: "Past",
	},
	grassknot: {
		inherit: true,
		isNonstandard: "Past",
	},
	grasspledge: {
		inherit: true,
		isNonstandard: "Past",
	},
	grassyglide: {
		inherit: true,
		isNonstandard: "Past",
	},
	grassyterrain: {
		inherit: true,
		isNonstandard: "Past",
	},
	gravapple: {
		inherit: true,
		isNonstandard: "Past",
	},
	gravity: {
		inherit: true,
		isNonstandard: "Past",
	},
	growl: {
		inherit: true,
		isNonstandard: "Past",
	},
	growth: {
		inherit: true,
		isNonstandard: "Past",
	},
	grudge: {
		inherit: true,
		isNonstandard: "Past",
	},
	guardsplit: {
		inherit: true,
		isNonstandard: "Past",
	},
	guardswap: {
		inherit: true,
		isNonstandard: "Past",
	},
	guillotine: {
		inherit: true,
		isNonstandard: "Past",
	},
	gunkshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	gust: {
		inherit: true,
		desc: "Power doubles if the target is using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop.",
		shortDesc: "Power doubles during Bounce, Fly, and Sky Drop.",
		pp: 25,
	},
	gyroball: {
		inherit: true,
		isNonstandard: "Past",
	},
	hail: {
		inherit: true,
		isNonstandard: "Past",
	},
	hammerarm: {
		inherit: true,
		isNonstandard: "Past",
	},
	happyhour: {
		inherit: true,
		isNonstandard: "Past",
	},
	harden: {
		inherit: true,
		isNonstandard: "Past",
	},
	haze: {
		inherit: true,
		isNonstandard: "Past",
	},
	headbutt: {
		inherit: true,
		isNonstandard: "Past",
	},
	headcharge: {
		inherit: true,
		isNonstandard: "Past",
	},
	headlongrush: {
		inherit: true,
		basePower: 100,
		desc: "Lowers the user's Defense and Special Defense by 1 stage.",
		shortDesc: "Lowers the user's Defense and Sp. Def by 1.",
		isNonstandard: null,
		self: {
			volatileStatus: 'guarddrop',
		},
		gen: 8,
	},
	headsmash: {
		inherit: true,
		basePower: 120,
		desc: "If the target lost HP, the user takes recoil damage equal to 1/2 the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 1/2 recoil.",
	},
	healbell: {
		inherit: true,
		isNonstandard: "Past",
	},
	healingwish: {
		inherit: true,
		isNonstandard: "Past",
	},
	healpulse: {
		inherit: true,
		isNonstandard: "Past",
	},
	heatcrash: {
		inherit: true,
		isNonstandard: "Past",
	},
	heatwave: {
		inherit: true,
		isNonstandard: "Past",
	},
	heavyslam: {
		inherit: true,
		isNonstandard: "Past",
	},
	helpinghand: {
		inherit: true,
		isNonstandard: "Past",
	},
	hex: {
		inherit: true,
		desc: "Power doubles if the target has a non-volatile status condition.",
		shortDesc: "Power doubles if the target has a status ailment.",
		pp: 15,
	},
	hiddenpower: {
		inherit: true,
		basePower: 50,
		desc: "This move's type depends on the user's individual values (IVs), and can be any type but Fairy and Normal.",
		shortDesc: "Varies in type based on the user's IVs.",
		isNonstandard: null,
		onModifyType(move, pokemon, target) {
			let bestTypes = this.dex.types.names();
			bestTypes = getAllMaxValues(bestTypes, x => getTypeEffectiveness(this, x, target));
			move.type = this.sample(bestTypes);
		},
	},
	highhorsepower: {
		inherit: true,
		basePower: 85,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
	},
	highjumpkick: {
		inherit: true,
		isNonstandard: "Past",
	},
	holdback: {
		inherit: true,
		isNonstandard: "Past",
	},
	holdhands: {
		inherit: true,
		isNonstandard: "Past",
	},
	honeclaws: {
		inherit: true,
		isNonstandard: "Past",
	},
	hornattack: {
		inherit: true,
		isNonstandard: "Past",
	},
	horndrill: {
		inherit: true,
		isNonstandard: "Past",
	},
	hornleech: {
		inherit: true,
		isNonstandard: "Past",
	},
	howl: {
		inherit: true,
		isNonstandard: "Past",
	},
	hurricane: {
		inherit: true,
		accuracy: 75,
		basePower: 100,
		desc: "Has a 30% chance to confuse the target. This move can hit a target using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop. If the weather is Primordial Sea or Rain Dance, this move does not check accuracy. If the weather is Desolate Land or Sunny Day, this move's accuracy is 50%. If this move is used against a Pokemon holding Utility Umbrella, this move's accuracy remains at 70%.",
		shortDesc: "30% chance to confuse target. Can't miss in rain.",
		pp: 5,
		secondary: null,
	},
	hydrocannon: {
		inherit: true,
		isNonstandard: "Past",
	},
	hydropump: {
		inherit: true,
		accuracy: 85,
		basePower: 100,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
	},
	hyperbeam: {
		inherit: true,
		basePower: 120,
		desc: "If this move is successful, the user must recharge on the following turn and cannot select a move.",
		shortDesc: "User cannot move next turn.",
		self: null,
	},
	hypervoice: {
		inherit: true,
		isNonstandard: "Past",
	},
	hypnosis: {
		inherit: true,
		accuracy: 70,
		desc: "Causes the target to fall asleep.",
		shortDesc: "Causes the target to fall asleep.",
	},
	iceball: {
		inherit: true,
		basePower: 40,
		basePowerCallback: undefined,
		desc: "If this move is successful, the user is locked into this move and cannot make another move until it misses, 5 turns have passed, or the attack cannot be used. Power doubles with each successful hit of this move and doubles again if Defense Curl was used previously by the user. If this move is called by Sleep Talk, the move is used for one turn.",
		shortDesc: "Power doubles with each hit. Repeats for 5 turns.",
		isNonstandard: null,
		self: {
			volatileStatus: 'fixated',
		},
		onModifyMove() {},
		onAfterMove() {},
		condition: {},
	},
	icebeam: {
		inherit: true,
		basePower: 80,
		desc: "Has a 10% chance to freeze the target.",
		shortDesc: "10% chance to freeze the target.",
		secondary: {
			chance: 20,
			status: 'frz',
		},
	},
	iceburn: {
		inherit: true,
		isNonstandard: "Past",
	},
	icefang: {
		inherit: true,
		desc: "Has a 10% chance to freeze the target and a 10% chance to make it flinch.",
		shortDesc: "10% chance to freeze. 10% chance to flinch.",
		secondary: {
			chance: 20,
			status: 'frz',
		},
		secondaries: null,
	},
	icepunch: {
		inherit: true,
		desc: "Has a 10% chance to freeze the target.",
		shortDesc: "10% chance to freeze the target.",
		pp: 10,
		secondary: {
			chance: 30,
			status: 'frz',
		},
	},
	iceshard: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "Usually goes first.",
		pp: 20,
		priority: 0,
	},
	iciclecrash: {
		inherit: true,
		basePower: 80,
		desc: "Has a 30% chance to make the target flinch.",
		shortDesc: "30% chance to make the target flinch.",
		secondary: null,
	},
	iciclespear: {
		inherit: true,
		isNonstandard: "Past",
	},
	icywind: {
		inherit: true,
		basePower: 60,
		desc: "Has a 100% chance to lower the target's Speed by 1 stage.",
		shortDesc: "100% chance to lower the foe(s) Speed by 1.",
		pp: 20,
		secondary: null,
	},
	imprison: {
		inherit: true,
		isNonstandard: "Past",
	},
	incinerate: {
		inherit: true,
		isNonstandard: "Past",
	},
	infernalparade: {
		inherit: true,
		desc: "Has a 30% chance to burn the target. Power doubles if the target has a non-volatile status condition.",
		shortDesc: "30% burn. 2x power if target is already statused.",
		isNonstandard: null,
		gen: 8,
	},
	inferno: {
		inherit: true,
		isNonstandard: "Past",
	},
	infestation: {
		inherit: true,
		isNonstandard: "Past",
	},
	ingrain: {
		inherit: true,
		isNonstandard: "Past",
	},
	instruct: {
		inherit: true,
		isNonstandard: "Past",
	},
	irondefense: {
		inherit: true,
		desc: "Raises the user's Defense by 2 stages.",
		shortDesc: "Raises the user's Defense by 2.",
		pp: 20,
		volatileStatus: 'guardboost',
		boosts: null,
	},
	ironhead: {
		inherit: true,
		desc: "Has a 30% chance to make the target flinch.",
		shortDesc: "30% chance to make the target flinch.",
		pp: 10,
		secondary: null,
	},
	irontail: {
		inherit: true,
		desc: "Has a 30% chance to lower the target's Defense by 1 stage.",
		shortDesc: "30% chance to lower the target's Defense by 1.",
		pp: 5,
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	jawlock: {
		inherit: true,
		isNonstandard: "Past",
	},
	judgment: {
		inherit: true,
		desc: "This move's type depends on the user's held Plate.",
		shortDesc: "Type varies based on the held Plate.",
		isNonstandard: null,
		pp: 5,
		onModifyType(move, pokemon, target) {
			if (pokemon.species.baseSpecies !== 'Arceus') return;
			if (pokemon.baseSpecies.id !== 'arceuslegend') {
				move.type = pokemon.species.types[0];
				return;
			}

			let bestTypes = this.dex.types.names();
			bestTypes = getAllMaxValues(bestTypes, x => getTypeEffectiveness(this, x, target));
			for (const type of target.getTypes()) {
				bestTypes = getAllMaxValues(bestTypes, x => getTypeEffectiveness(this, type, x), true);
			}
			const newType = this.sample(bestTypes);
			if (newType !== pokemon.species.types.join()) {
				pokemon.formeChange('Arceus-' + newType, this.effect, false, '[msg]');
			}
			move.type = newType;
		},
	},
	junglehealing: {
		inherit: true,
		isNonstandard: "Past",
	},
	kinesis: {
		inherit: true,
		isNonstandard: "Past",
	},
	kingsshield: {
		inherit: true,
		isNonstandard: "Past",
	},
	knockoff: {
		inherit: true,
		isNonstandard: "Past",
	},
	landswrath: {
		inherit: true,
		isNonstandard: "Past",
	},
	laserfocus: {
		inherit: true,
		isNonstandard: "Past",
	},
	lashout: {
		inherit: true,
		isNonstandard: "Past",
	},
	lastresort: {
		inherit: true,
		isNonstandard: "Past",
	},
	lavaplume: {
		inherit: true,
		isNonstandard: "Past",
	},
	leafage: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 25,
	},
	leafblade: {
		inherit: true,
		basePower: 85,
		desc: "Has a higher chance for a critical hit.",
		shortDesc: "High critical hit ratio.",
		pp: 10,
	},
	leafstorm: {
		inherit: true,
		basePower: 110,
		desc: "Lowers the user's Special Attack by 2 stages.",
		shortDesc: "Lowers the user's Sp. Atk by 2.",
		self: {
			volatileStatus: 'powerdrop',
		},
	},
	leaftornado: {
		inherit: true,
		isNonstandard: "Past",
	},
	leechlife: {
		inherit: true,
		basePower: 75,
		desc: "The user recovers 1/2 the HP lost by the target, rounded half up. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded half down.",
		shortDesc: "User recovers 50% of the damage dealt.",
	},
	leechseed: {
		inherit: true,
		isNonstandard: "Past",
	},
	leer: {
		inherit: true,
		isNonstandard: "Past",
	},
	lick: {
		inherit: true,
		isNonstandard: "Past",
	},
	lifedew: {
		inherit: true,
		isNonstandard: "Past",
	},
	lightscreen: {
		inherit: true,
		isNonstandard: "Past",
	},
	liquidation: {
		inherit: true,
		basePower: 80,
		desc: "Has a 20% chance to lower the target's Defense by 1 stage.",
		shortDesc: "20% chance to lower the target's Defense by 1.",
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	lockon: {
		inherit: true,
		isNonstandard: "Past",
	},
	lovelykiss: {
		inherit: true,
		isNonstandard: "Past",
	},
	lowkick: {
		inherit: true,
		isNonstandard: "Past",
	},
	lowsweep: {
		inherit: true,
		isNonstandard: "Past",
	},
	lunarblessing: {
		inherit: true,
		desc: "Each Pokemon on the user's side restores 1/4 of its maximum HP, rounded half up, and has its status condition cured.",
		shortDesc: "User and allies: healed 1/4 max HP, status cured.",
		isNonstandard: null,
		pp: 10,
		onHit(target, source, move) {
			let success = !!this.heal(this.modify(source.maxhp, 0.5));
			success = !!source.addVolatile('obscured', source, move) || success;
			return source.cureStatus() || success;
		},
		gen: 8,
	},
	lunardance: {
		inherit: true,
		isNonstandard: "Past",
	},
	lunge: {
		inherit: true,
		isNonstandard: "Past",
	},
	lusterpurge: {
		inherit: true,
		isNonstandard: "Past",
	},
	machpunch: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "Usually goes first.",
		pp: 20,
		priority: 0,
	},
	magiccoat: {
		inherit: true,
		isNonstandard: "Past",
	},
	magicpowder: {
		inherit: true,
		isNonstandard: "Past",
	},
	magicroom: {
		inherit: true,
		isNonstandard: "Past",
	},
	magmastorm: {
		inherit: true,
		basePower: 90,
		desc: "Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",
		shortDesc: "Traps and damages the target for 4-5 turns.",
		volatileStatus: undefined,
		secondary: {
			chance: 100,
			status: 'brn',
		},
	},
	magneticflux: {
		inherit: true,
		isNonstandard: "Past",
	},
	magnetrise: {
		inherit: true,
		isNonstandard: "Past",
	},
	matblock: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxairstream: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxdarkness: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxflare: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxflutterby: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxgeyser: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxguard: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxhailstorm: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxknuckle: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxlightning: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxmindstorm: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxooze: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxovergrowth: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxphantasm: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxquake: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxrockfall: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxstarfall: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxsteelspike: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxstrike: {
		inherit: true,
		isNonstandard: "Past",
	},
	maxwyrmwind: {
		inherit: true,
		isNonstandard: "Past",
	},
	meanlook: {
		inherit: true,
		isNonstandard: "Past",
	},
	megadrain: {
		inherit: true,
		isNonstandard: "Past",
	},
	megahorn: {
		inherit: true,
		basePower: 100,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 5,
	},
	megakick: {
		inherit: true,
		isNonstandard: "Past",
	},
	megapunch: {
		inherit: true,
		isNonstandard: "Past",
	},
	memento: {
		inherit: true,
		isNonstandard: "Past",
	},
	metalburst: {
		inherit: true,
		isNonstandard: "Past",
	},
	metalclaw: {
		inherit: true,
		isNonstandard: "Past",
	},
	metalsound: {
		inherit: true,
		isNonstandard: "Past",
	},
	meteorassault: {
		inherit: true,
		isNonstandard: "Past",
	},
	meteorbeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	meteormash: {
		inherit: true,
		isNonstandard: "Past",
	},
	metronome: {
		inherit: true,
		isNonstandard: "Past",
	},
	milkdrink: {
		inherit: true,
		isNonstandard: "Past",
	},
	mimic: {
		inherit: true,
		desc: "While the user remains active, this move is replaced by the last move used by the target. The copied move has the maximum PP for that move. Fails if the target has not made a move, if the user already knows the move, or if the move is Mimic, or Struggle.",
	},
	mindblown: {
		inherit: true,
		isNonstandard: "Past",
	},
	mindreader: {
		inherit: true,
		isNonstandard: "Past",
	},
	minimize: {
		inherit: true,
		isNonstandard: "Past",
	},
	mirrorcoat: {
		inherit: true,
		isNonstandard: "Past",
	},
	mist: {
		inherit: true,
		isNonstandard: "Past",
	},
	mistball: {
		inherit: true,
		isNonstandard: "Past",
	},
	mistyexplosion: {
		inherit: true,
		isNonstandard: "Past",
	},
	mistyterrain: {
		inherit: true,
		isNonstandard: "Past",
	},
	moonblast: {
		inherit: true,
		basePower: 85,
		desc: "Has a 30% chance to lower the target's Special Attack by 1 stage.",
		shortDesc: "30% chance to lower the target's Sp. Atk by 1.",
		pp: 10,
		secondary: {
			chance: 20,
			volatileStatus: 'powerdrop',
		},
	},
	moongeistbeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	moonlight: {
		inherit: true,
		isNonstandard: "Past",
	},
	morningsun: {
		inherit: true,
		isNonstandard: "Past",
	},
	mountaingale: {
		inherit: true,
		desc: "Has a 30% chance to make the target flinch.",
		shortDesc: "30% chance to make the target flinch.",
		isNonstandard: null,
		pp: 5,
		secondary: null,
		gen: 8,
	},
	mudbomb: {
		inherit: true,
		desc: "Has a 30% chance to lower the target's accuracy by 1 stage.",
		shortDesc: "30% chance to lower the target's accuracy by 1.",
		isNonstandard: null,
		pp: 15,
		self: {
			volatileStatus: 'obscured',
		},
		secondary: null,
	},
	muddywater: {
		inherit: true,
		isNonstandard: "Past",
	},
	mudshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	mudslap: {
		inherit: true,
		basePower: 30,
		desc: "Has a 100% chance to lower the target's accuracy by 1 stage.",
		shortDesc: "100% chance to lower the target's accuracy by 1.",
		pp: 20,
		self: {
			volatileStatus: 'obscured',
		},
		secondary: null,
	},
	multiattack: {
		inherit: true,
		isNonstandard: "Past",
	},
	mysticalfire: {
		inherit: true,
		basePower: 70,
		desc: "Has a 100% chance to lower the target's Special Attack by 1 stage.",
		shortDesc: "100% chance to lower the target's Sp. Atk by 1.",
		secondary: {
			chance: 100,
			volatileStatus: 'powerdrop',
		},
	},
	mysticalpower: {
		inherit: true,
		desc: "Has a 100% chance to raise the user's Special Attack by 1 stage.",
		shortDesc: "100% chance to raise the user's Sp. Atk by 1.",
		isNonstandard: null,
		self: {
			onHit(target, source, move) {
				if (
					source.getStat('atk', false, true) + source.getStat('spa', false, true) >=
					source.getStat('def', false, true) + source.getStat('spd', false, true)
				) {
					source.addVolatile('powerboost', source, move);
				} else {
					source.addVolatile('guardboost', source, move);
				}
			},
		},
		secondary: null,
		gen: 8,
	},
	nastyplot: {
		inherit: true,
		desc: "Raises the user's Special Attack by 2 stages.",
		shortDesc: "Raises the user's Sp. Atk by 2.",
		volatileStatus: 'powerboost',
		boosts: null,
	},
	naturepower: {
		inherit: true,
		isNonstandard: "Past",
	},
	naturesmadness: {
		inherit: true,
		isNonstandard: "Past",
	},
	nightdaze: {
		inherit: true,
		isNonstandard: "Past",
	},
	nightshade: {
		inherit: true,
		isNonstandard: "Past",
	},
	nobleroar: {
		inherit: true,
		isNonstandard: "Past",
	},
	noretreat: {
		inherit: true,
		isNonstandard: "Past",
	},
	nuzzle: {
		inherit: true,
		isNonstandard: "Past",
	},
	oblivionwing: {
		inherit: true,
		isNonstandard: "Past",
	},
	obstruct: {
		inherit: true,
		isNonstandard: "Past",
	},
	octazooka: {
		inherit: true,
		desc: "Has a 50% chance to lower the target's accuracy by 1 stage.",
		shortDesc: "50% chance to lower the target's accuracy by 1.",
		pp: 15,
		self: {
			volatileStatus: 'obscured',
		},
		secondary: null,
	},
	octolock: {
		inherit: true,
		isNonstandard: "Past",
	},
	ominouswind: {
		inherit: true,
		desc: "Has a 10% chance to raise the user's Attack, Defense, Special Attack, Special Defense, and Speed by 1 stage.",
		shortDesc: "10% chance to raise all stats by 1 (not acc/eva).",
		isNonstandard: null,
		pp: 15,
		secondary: {
			chance: 20,
			self: {
				onHit(target, source, move) {
					source.addVolatile('powerboost', source, move);
					source.addVolatile('guardboost', source, move);
				},
			},
		},
	},
	originpulse: {
		inherit: true,
		isNonstandard: "Past",
	},
	outrage: {
		inherit: true,
		accuracy: 85,
		basePower: 90,
		desc: "The user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target on the first turn of the effect or the second turn of a three-turn effect, the effect ends without causing confusion. If this move is called by Sleep Talk and the user is asleep, the move is used for one turn and does not confuse the user.",
		shortDesc: "Lasts 2-3 turns. Confuses the user afterwards.",
		self: {
			volatileStatus: 'fixated',
		},
		onAfterMove() {},
		target: "any",
	},
	overdrive: {
		inherit: true,
		isNonstandard: "Past",
	},
	overheat: {
		inherit: true,
		basePower: 110,
		desc: "Lowers the user's Special Attack by 2 stages.",
		shortDesc: "Lowers the user's Sp. Atk by 2.",
		self: {
			volatileStatus: 'powerdrop',
		},
	},
	painsplit: {
		inherit: true,
		isNonstandard: "Past",
	},
	paraboliccharge: {
		inherit: true,
		isNonstandard: "Past",
	},
	partingshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	payback: {
		inherit: true,
		isNonstandard: "Past",
	},
	payday: {
		inherit: true,
		isNonstandard: "Past",
	},
	peck: {
		inherit: true,
		isNonstandard: "Past",
	},
	perishsong: {
		inherit: true,
		isNonstandard: "Past",
	},
	petalblizzard: {
		inherit: true,
		isNonstandard: "Past",
	},
	petaldance: {
		inherit: true,
		accuracy: 85,
		basePower: 90,
		desc: "The user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target on the first turn of the effect or the second turn of a three-turn effect, the effect ends without causing confusion. If this move is called by Sleep Talk and the user is asleep, the move is used for one turn and does not confuse the user.",
		shortDesc: "Lasts 2-3 turns. Confuses the user afterwards.",
		self: {
			volatileStatus: 'fixated',
		},
		onAfterMove() {},
		target: "any",
	},
	phantomforce: {
		inherit: true,
		isNonstandard: "Past",
	},
	photongeyser: {
		inherit: true,
		isNonstandard: "Past",
	},
	pinmissile: {
		inherit: true,
		accuracy: 100,
		basePower: 40,
		desc: "Hits two to five times. Has a 35% chance to hit two or three times and a 15% chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times.",
		shortDesc: "Hits 2-5 times in one turn.",
		multihit: 1,
		secondary: {
			chance: 100,
			volatileStatus: 'splinters',
		},
	},
	plasmafists: {
		inherit: true,
		isNonstandard: "Past",
	},
	playnice: {
		inherit: true,
		isNonstandard: "Past",
	},
	playrough: {
		inherit: true,
		basePower: 85,
		desc: "Has a 10% chance to lower the target's Attack by 1 stage.",
		shortDesc: "10% chance to lower the target's Attack by 1.",
		secondary: {
			chance: 20,
			volatileStatus: 'powerdrop',
		},
	},
	pluck: {
		inherit: true,
		isNonstandard: "Past",
	},
	poisonfang: {
		inherit: true,
		isNonstandard: "Past",
	},
	poisongas: {
		inherit: true,
		desc: "Poisons the target.",
		shortDesc: "Poisons the foe(s).",
		pp: 20,
	},
	poisonjab: {
		inherit: true,
		desc: "Has a 30% chance to poison the target.",
		shortDesc: "30% chance to poison the target.",
		pp: 10,
	},
	poisonpowder: {
		inherit: true,
		accuracy: 80,
		desc: "Poisons the target.",
		shortDesc: "Poisons the target.",
		pp: 20,
	},
	poisonsting: {
		inherit: true,
		basePower: 30,
		desc: "Has a 30% chance to poison the target.",
		shortDesc: "30% chance to poison the target.",
		pp: 20,
		secondary: {
			chance: 50,
			status: 'psn',
		},
	},
	poisontail: {
		inherit: true,
		isNonstandard: "Past",
	},
	pollenpuff: {
		inherit: true,
		isNonstandard: "Past",
	},
	poltergeist: {
		inherit: true,
		isNonstandard: "Past",
	},
	pound: {
		inherit: true,
		isNonstandard: "Past",
	},
	powdersnow: {
		inherit: true,
		desc: "Has a 10% chance to freeze the target.",
		shortDesc: "10% chance to freeze the foe(s).",
		secondary: {
			chance: 30,
			status: 'frz',
		},
	},
	powergem: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 10,
	},
	powershift: {
		inherit: true,
		desc: "The user swaps its Attack and Defense stats, and stat stage changes remain on their respective stats. This move can be used again to swap the stats back. If the user uses Baton Pass, the replacement will have its Attack and Defense stats swapped if the effect is active. If the user has its stats recalculated by changing forme while its stats are swapped, this effect is ignored but is still active for the purposes of Baton Pass.",
		shortDesc: "Switches user's Attack and Defense stats.",
		isNonstandard: null,
		volatileStatus: 'stanceswap',
		condition: {},
		gen: 8,
	},
	powersplit: {
		inherit: true,
		isNonstandard: "Past",
	},
	powerswap: {
		inherit: true,
		isNonstandard: "Past",
	},
	powertrick: {
		inherit: true,
		isNonstandard: "Past",
	},
	powertrip: {
		inherit: true,
		isNonstandard: "Past",
	},
	poweruppunch: {
		inherit: true,
		isNonstandard: "Past",
	},
	powerwhip: {
		inherit: true,
		isNonstandard: "Past",
	},
	precipiceblades: {
		inherit: true,
		isNonstandard: "Past",
	},
	present: {
		inherit: true,
		isNonstandard: "Past",
	},
	prismaticlaser: {
		inherit: true,
		isNonstandard: "Past",
	},
	protect: {
		inherit: true,
		isNonstandard: "Past",
	},
	psybeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	psychic: {
		inherit: true,
		basePower: 80,
		desc: "Has a 10% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "10% chance to lower the target's Sp. Def by 1.",
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	psychicfangs: {
		inherit: true,
		isNonstandard: "Past",
	},
	psychicterrain: {
		inherit: true,
		isNonstandard: "Past",
	},
	psychocut: {
		inherit: true,
		desc: "Has a higher chance for a critical hit.",
		shortDesc: "High critical hit ratio.",
		pp: 15,
	},
	psychoshift: {
		inherit: true,
		isNonstandard: "Past",
	},
	psychup: {
		inherit: true,
		isNonstandard: "Past",
	},
	psyshieldbash: {
		inherit: true,
		desc: "Has a 100% chance to raise the user's Defense by 1 stage.",
		shortDesc: "100% chance to raise the user's Defense by 1.",
		isNonstandard: null,
		secondary: {
			chance: 100,
			self: {
				volatileStatus: 'guardboost',
			},
		},
		gen: 8,
	},
	psyshock: {
		inherit: true,
		isNonstandard: "Past",
	},
	psystrike: {
		inherit: true,
		isNonstandard: "Past",
	},
	purify: {
		inherit: true,
		isNonstandard: "Past",
	},
	pyroball: {
		inherit: true,
		isNonstandard: "Past",
	},
	quash: {
		inherit: true,
		isNonstandard: "Past",
	},
	quickattack: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "Usually goes first.",
		pp: 20,
		priority: 0,
	},
	quickguard: {
		inherit: true,
		isNonstandard: "Past",
	},
	quiverdance: {
		inherit: true,
		isNonstandard: "Past",
	},
	ragepowder: {
		inherit: true,
		isNonstandard: "Past",
	},
	ragingfury: {
		inherit: true,
		accuracy: 85,
		basePower: 90,
		desc: "The user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target on the first turn of the effect or the second turn of a three-turn effect, the effect ends without causing confusion. If this move is called by Sleep Talk and the user is asleep, the move is used for one turn and does not confuse the user.",
		shortDesc: "Lasts 2-3 turns. Confuses the user afterwards.",
		isNonstandard: null,
		self: {
			volatileStatus: 'fixated',
		},
		onAfterMove() {},
		target: "any",
		gen: 8,
	},
	raindance: {
		inherit: true,
		isNonstandard: "Past",
	},
	rapidspin: {
		inherit: true,
		isNonstandard: "Past",
	},
	razorleaf: {
		inherit: true,
		isNonstandard: "Past",
	},
	razorshell: {
		inherit: true,
		isNonstandard: "Past",
	},
	recycle: {
		inherit: true,
		isNonstandard: "Past",
	},
	reflect: {
		inherit: true,
		isNonstandard: "Past",
	},
	reflecttype: {
		inherit: true,
		isNonstandard: "Past",
	},
	rest: {
		inherit: true,
		desc: "The user falls asleep for the next four turns and restores all of its HP, curing itself of any non-volatile status condition in the process. Fails if the user has full HP.",
		shortDesc: "User sleeps 4 turns and restores HP and status.",
		onTry(source) {
			if (source.hp === source.maxhp) {
				this.add('-fail', source, 'heal');
				return null;
			}
		},
		onHit(target, source, move) {
			const result = target.setStatus('slp', source, move);
			if (!result) return result;
			this.heal(this.modify(target.maxhp, 0.75)); // Aesthetic only as the healing happens after you fall asleep in-game
		},
	},
	retaliate: {
		inherit: true,
		isNonstandard: "Past",
	},
	revenge: {
		inherit: true,
		isNonstandard: "Past",
	},
	reversal: {
		inherit: true,
		isNonstandard: "Past",
	},
	risingvoltage: {
		inherit: true,
		isNonstandard: "Past",
	},
	roar: {
		inherit: true,
		isNonstandard: "Past",
	},
	roaroftime: {
		inherit: true,
		basePower: 120,
		basePowerCallback(pokemon) {
			if (pokemon.species.id === 'dialgaorigin') {
				return 140;
			}
			return 120;
		},
		desc: "If this move is successful, the user must recharge on the following turn and cannot select a move.",
		shortDesc: "User cannot move next turn.",
		onModifyMove(move, pokemon) {
			if (pokemon.species.id === 'dialgaorigin') {
				move.accuracy = 75;
			}
		},
		self: null,
	},
	rockblast: {
		inherit: true,
		isNonstandard: "Past",
	},
	rockpolish: {
		inherit: true,
		isNonstandard: "Past",
	},
	rockslide: {
		inherit: true,
		desc: "Has a 30% chance to make the target flinch.",
		shortDesc: "30% chance to make the foe(s) flinch.",
		secondary: null,
	},
	rocksmash: {
		inherit: true,
		desc: "Has a 50% chance to lower the target's Defense by 1 stage.",
		shortDesc: "50% chance to lower the target's Defense by 1.",
		pp: 20,
		secondary: {
			chance: 50,
			volatileStatus: 'guarddrop',
		},
	},
	rockthrow: {
		inherit: true,
		isNonstandard: "Past",
	},
	rocktomb: {
		inherit: true,
		isNonstandard: "Past",
	},
	rockwrecker: {
		inherit: true,
		isNonstandard: "Past",
	},
	roleplay: {
		inherit: true,
		isNonstandard: "Past",
	},
	rollout: {
		inherit: true,
		basePower: 40,
		basePowerCallback: undefined,
		desc: "If this move is successful, the user is locked into this move and cannot make another move until it misses, 5 turns have passed, or the attack cannot be used. Power doubles with each successful hit of this move and doubles again if Defense Curl was used previously by the user. If this move is called by Sleep Talk, the move is used for one turn.",
		shortDesc: "Power doubles with each hit. Repeats for 5 turns.",
		self: {
			volatileStatus: 'fixated',
		},
		onModifyMove() {},
		onAfterMove() {},
		condition: {},
	},
	round: {
		inherit: true,
		isNonstandard: "Past",
	},
	sacredfire: {
		inherit: true,
		isNonstandard: "Past",
	},
	sacredsword: {
		inherit: true,
		isNonstandard: "Past",
	},
	safeguard: {
		inherit: true,
		isNonstandard: "Past",
	},
	sandattack: {
		inherit: true,
		isNonstandard: "Past",
	},
	sandsearstorm: {
		inherit: true,
		basePower: 95,
		desc: "Has a 20% chance to burn the target. If the weather is Primordial Sea or Rain Dance, this move does not check accuracy. If this move is used against a Pokemon holding Utility Umbrella, this move's accuracy remains at 80%.",
		shortDesc: "20% chance to burn foe(s). Can't miss in rain.",
		isNonstandard: null,
		pp: 5,
		secondary: {
			chance: 30,
			status: 'brn',
		},
		gen: 8,
	},
	sandstorm: {
		inherit: true,
		isNonstandard: "Past",
	},
	sandtomb: {
		inherit: true,
		isNonstandard: "Past",
	},
	scald: {
		inherit: true,
		isNonstandard: "Past",
	},
	scaleshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	scaryface: {
		inherit: true,
		isNonstandard: "Past",
	},
	scorchingsands: {
		inherit: true,
		isNonstandard: "Past",
	},
	scratch: {
		inherit: true,
		isNonstandard: "Past",
	},
	screech: {
		inherit: true,
		isNonstandard: "Past",
	},
	searingshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	secretsword: {
		inherit: true,
		isNonstandard: "Past",
	},
	seedbomb: {
		inherit: true,
		isNonstandard: "Past",
	},
	seedflare: {
		inherit: true,
		basePower: 100,
		desc: "Has a 40% chance to lower the target's Special Defense by 2 stages.",
		shortDesc: "40% chance to lower the target's Sp. Def by 2.",
		isNonstandard: null,
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	seismictoss: {
		inherit: true,
		isNonstandard: "Past",
	},
	selfdestruct: {
		inherit: true,
		basePower: 150,
		desc: "The user faints after using this move, even if this move fails for having no target. This move is prevented from executing if any active Pokemon has the Damp Ability.",
		shortDesc: "Hits adjacent Pokemon. The user faints.",
		selfdestruct: false,
		// Recoil implemented in battle-actions.ts
	},
	shadowball: {
		inherit: true,
		desc: "Has a 20% chance to lower the target's Special Defense by 1 stage.",
		shortDesc: "20% chance to lower the target's Sp. Def by 1.",
		pp: 10,
		secondary: {
			chance: 20,
			volatileStatus: 'guarddrop',
		},
	},
	shadowbone: {
		inherit: true,
		isNonstandard: "Past",
	},
	shadowforce: {
		inherit: true,
		basePower: 100,
		basePowerCallback(pokemon) {
			if (pokemon.species.id === 'giratinaorigin') {
				return 120;
			}
			return 100;
		},
		desc: "If this move is successful, it breaks through the target's Baneful Bunker, Detect, King's Shield, Protect, or Spiky Shield for this turn, allowing other Pokemon to attack the target normally. If the target's side is protected by Crafty Shield, Mat Block, Quick Guard, or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the target's side normally. This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks. If the user is holding a Power Herb, the move completes in one turn.",
		shortDesc: "Disappears turn 1. Hits turn 2. Breaks protection.",
		self: {
			volatileStatus: 'obscured',
		},
		onModifyMove(move, pokemon) {
			if (pokemon.species.id === 'giratinaorigin') {
				move.accuracy = 80;
			}
		},
		onTryMove() {},
		condition: {},
	},
	shadowpunch: {
		inherit: true,
		isNonstandard: "Past",
	},
	shadowsneak: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "Usually goes first.",
		pp: 20,
		priority: 0,
	},
	sheercold: {
		inherit: true,
		isNonstandard: "Past",
	},
	shellsidearm: {
		inherit: true,
		isNonstandard: "Past",
	},
	shellsmash: {
		inherit: true,
		isNonstandard: "Past",
	},
	shelltrap: {
		inherit: true,
		isNonstandard: "Past",
	},
	shelter: {
		inherit: true,
		desc: "Raises the user's Defense by 2 stages.",
		shortDesc: "Raises the user's Defense by 2.",
		isNonstandard: null,
		boosts: null,
		onHit(target, source, move) {
			target.addVolatile('guardboost', source, move);
			target.addVolatile('obscured', source, move);
		},
		gen: 8,
	},
	shiftgear: {
		inherit: true,
		isNonstandard: "Past",
	},
	shockwave: {
		inherit: true,
		isNonstandard: "Past",
	},
	shoreup: {
		inherit: true,
		isNonstandard: "Past",
	},
	silverwind: {
		inherit: true,
		desc: "Has a 10% chance to raise the user's Attack, Defense, Special Attack, Special Defense, and Speed by 1 stage.",
		shortDesc: "10% chance to raise all stats by 1 (not acc/eva).",
		isNonstandard: null,
		pp: 15,
		secondary: {
			chance: 20,
			self: {
				onHit(target, source, move) {
					source.addVolatile('powerboost', source, move);
					source.addVolatile('guardboost', source, move);
				},
			},
		},
	},
	simplebeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	sing: {
		inherit: true,
		isNonstandard: "Past",
	},
	skillswap: {
		inherit: true,
		isNonstandard: "Past",
	},
	skittersmack: {
		inherit: true,
		isNonstandard: "Past",
	},
	skullbash: {
		inherit: true,
		isNonstandard: "Past",
	},
	skyattack: {
		inherit: true,
		isNonstandard: "Past",
	},
	slackoff: {
		inherit: true,
		isNonstandard: "Past",
	},
	slam: {
		inherit: true,
		isNonstandard: "Past",
	},
	slash: {
		inherit: true,
		desc: "Has a higher chance for a critical hit.",
		shortDesc: "High critical hit ratio.",
		pp: 15,
	},
	sleeppowder: {
		inherit: true,
		accuracy: 80,
		desc: "Causes the target to fall asleep.",
		shortDesc: "Causes the target to fall asleep.",
		pp: 20,
	},
	sleeptalk: {
		inherit: true,
		isNonstandard: "Past",
	},
	sludge: {
		inherit: true,
		isNonstandard: "Past",
	},
	sludgebomb: {
		inherit: true,
		basePower: 80,
		desc: "Has a 30% chance to poison the target.",
		shortDesc: "30% chance to poison the target.",
	},
	sludgewave: {
		inherit: true,
		isNonstandard: "Past",
	},
	smackdown: {
		inherit: true,
		isNonstandard: "Past",
	},
	smartstrike: {
		inherit: true,
		isNonstandard: "Past",
	},
	smog: {
		inherit: true,
		isNonstandard: "Past",
	},
	smokescreen: {
		inherit: true,
		isNonstandard: "Past",
	},
	snaptrap: {
		inherit: true,
		isNonstandard: "Past",
	},
	snarl: {
		inherit: true,
		accuracy: 100,
		basePower: 60,
		desc: "Has a 100% chance to lower the target's Special Attack by 1 stage.",
		shortDesc: "100% chance to lower the foe(s) Sp. Atk by 1.",
		secondary: {
			chance: 100,
			volatileStatus: 'powerdrop',
		},
	},
	snipeshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	snore: {
		inherit: true,
		isNonstandard: "Past",
	},
	soak: {
		inherit: true,
		isNonstandard: "Past",
	},
	solarbeam: {
		inherit: true,
		isNonstandard: "Past",
	},
	solarblade: {
		inherit: true,
		isNonstandard: "Past",
	},
	spacialrend: {
		inherit: true,
		basePower: 90,
		basePowerCallback(pokemon) {
			if (pokemon.species.id === 'palkiaorigin') {
				return 80;
			}
			return 90;
		},
		desc: "Has a higher chance for a critical hit.",
		shortDesc: "High critical hit ratio.",
		onModifyMove(move, pokemon) {
			if (pokemon.species.id === 'palkiaorigin') {
				move.accuracy = 85;
				move.critRatio = 3;
			}
		},
	},
	sparklingaria: {
		inherit: true,
		isNonstandard: "Past",
	},
	spectralthief: {
		inherit: true,
		isNonstandard: "Past",
	},
	speedswap: {
		inherit: true,
		isNonstandard: "Past",
	},
	spikes: {
		inherit: true,
		accuracy: 100,
		basePower: 40,
		category: "Physical",
		desc: "Sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Can be used up to three times before failing. Opponents lose 1/8 of their maximum HP with one layer, 1/6 of their maximum HP with two layers, and 1/4 of their maximum HP with three layers, all rounded down. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin or Defog successfully, or is hit by Defog.",
		shortDesc: "Hurts grounded foes on switch-in. Max 3 layers.",
		sideCondition: undefined,
		condition: {},
		secondary: {
			chance: 100,
			volatileStatus: 'splinters',
		},
		target: "any",
	},
	spikyshield: {
		inherit: true,
		isNonstandard: "Past",
	},
	spiritbreak: {
		inherit: true,
		isNonstandard: "Past",
	},
	spiritshackle: {
		inherit: true,
		isNonstandard: "Past",
	},
	spite: {
		inherit: true,
		isNonstandard: "Past",
	},
	spitup: {
		inherit: true,
		isNonstandard: "Past",
	},
	spore: {
		inherit: true,
		desc: "Causes the target to fall asleep.",
		shortDesc: "Causes the target to fall asleep.",
		pp: 10,
	},
	springtidestorm: {
		inherit: true,
		basePower: 95,
		desc: "Has a 30% chance to lower the target's Attack by 1 stage.",
		shortDesc: "30% chance to lower the foe(s) Attack by 1.",
		isNonstandard: null,
		secondary: {
			chance: 30,
			onHit(target, source, move) {
				if (source.species.id === 'enamorustherian') {
					target.addVolatile('powerdrop', source, move);
					target.addVolatile('guarddrop', source, move);
				} else {
					source.addVolatile('powerboost', source, move);
					source.addVolatile('guardboost', source, move);
				}
			},
		},
		gen: 8,
	},
	stealthrock: {
		inherit: true,
		accuracy: 100,
		basePower: 40,
		category: "Physical",
		desc: "Sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in. Fails if the effect is already active on the opposing side. Foes lose 1/32, 1/16, 1/8, 1/4, or 1/2 of their maximum HP, rounded down, based on their weakness to the Rock type; 0.25x, 0.5x, neutral, 2x, or 4x, respectively. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin or Defog successfully, or is hit by Defog.",
		shortDesc: "Hurts foes on switch-in. Factors Rock weakness.",
		sideCondition: undefined,
		condition: {},
		secondary: {
			chance: 100,
			volatileStatus: 'splinters',
		},
		target: "any",
	},
	steameruption: {
		inherit: true,
		isNonstandard: "Past",
	},
	steelbeam: {
		inherit: true,
		basePower: 120,
		desc: "Whether or not this move is successful and even if it would cause fainting, the user loses 1/2 of its maximum HP, rounded up, unless the user has the Magic Guard Ability.",
		shortDesc: "User loses 50% max HP.",
		mindBlownRecoil: false,
		onAfterMove() {},
		// Recoil implemented in battle-actions.ts
	},
	steelroller: {
		inherit: true,
		isNonstandard: "Past",
	},
	steelwing: {
		inherit: true,
		isNonstandard: "Past",
	},
	stickyweb: {
		inherit: true,
		isNonstandard: "Past",
	},
	stockpile: {
		inherit: true,
		isNonstandard: "Past",
	},
	stomp: {
		inherit: true,
		isNonstandard: "Past",
	},
	stompingtantrum: {
		inherit: true,
		isNonstandard: "Past",
	},
	stoneaxe: {
		inherit: true,
		desc: "If this move is successful, it sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in. Foes lose 1/32, 1/16, 1/8, 1/4, or 1/2 of their maximum HP, rounded down, based on their weakness to the Rock type; 0.25x, 0.5x, neutral, 2x, or 4x, respectively. Can be removed from the opposing side if any opposing Pokemon uses Mortal Spin, Rapid Spin, or Defog successfully, or is hit by Defog.",
		shortDesc: "Sets Stealth Rock on the target's side.",
		isNonstandard: null,
		critRatio: 2,
		onAfterHit() {},
		onAfterSubDamage() {},
		secondary: {
			chance: 100,
			volatileStatus: 'splinters',
		},
		gen: 8,
	},
	storedpower: {
		inherit: true,
		isNonstandard: "Past",
	},
	stormthrow: {
		inherit: true,
		isNonstandard: "Past",
	},
	strangesteam: {
		inherit: true,
		isNonstandard: "Past",
	},
	strength: {
		inherit: true,
		isNonstandard: "Past",
	},
	strengthsap: {
		inherit: true,
		isNonstandard: "Past",
	},
	stringshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	strugglebug: {
		inherit: true,
		basePower: 40,
		desc: "Has a 100% chance to lower the target's Special Attack by 1 stage.",
		shortDesc: "100% chance to lower the foe(s) Sp. Atk by 1.",
		secondary: {
			chance: 100,
			volatileStatus: 'powerdrop',
		},
	},
	stuffcheeks: {
		inherit: true,
		isNonstandard: "Past",
	},
	stunspore: {
		inherit: true,
		accuracy: 80,
		desc: "Paralyzes the target.",
		shortDesc: "Paralyzes the target.",
		pp: 20,
	},
	submission: {
		inherit: true,
		isNonstandard: "Past",
	},
	substitute: {
		inherit: true,
		isNonstandard: "Past",
	},
	suckerpunch: {
		inherit: true,
		isNonstandard: "Past",
	},
	sunnyday: {
		inherit: true,
		isNonstandard: "Past",
	},
	sunsteelstrike: {
		inherit: true,
		isNonstandard: "Past",
	},
	superfang: {
		inherit: true,
		isNonstandard: "Past",
	},
	superpower: {
		inherit: true,
		isNonstandard: "Past",
	},
	supersonic: {
		inherit: true,
		isNonstandard: "Past",
	},
	surf: {
		inherit: true,
		isNonstandard: "Past",
	},
	surgingstrikes: {
		inherit: true,
		isNonstandard: "Past",
	},
	swagger: {
		inherit: true,
		isNonstandard: "Past",
	},
	swallow: {
		inherit: true,
		isNonstandard: "Past",
	},
	sweetkiss: {
		inherit: true,
		isNonstandard: "Past",
	},
	sweetscent: {
		inherit: true,
		isNonstandard: "Past",
	},
	switcheroo: {
		inherit: true,
		isNonstandard: "Past",
	},
	swordsdance: {
		inherit: true,
		desc: "Raises the user's Attack by 2 stages.",
		shortDesc: "Raises the user's Attack by 2.",
		volatileStatus: 'powerboost',
		boosts: null,
	},
	synthesis: {
		inherit: true,
		isNonstandard: "Past",
	},
	tackle: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 30,
	},
	tailslap: {
		inherit: true,
		isNonstandard: "Past",
	},
	tailwhip: {
		inherit: true,
		isNonstandard: "Past",
	},
	tailwind: {
		inherit: true,
		isNonstandard: "Past",
	},
	takedown: {
		inherit: true,
		isNonstandard: "Past",
	},
	takeheart: {
		inherit: true,
		desc: "The user cures its non-volatile status condition. Raises the user's Special Attack and Special Defense by 1 stage.",
		shortDesc: "Cures user's status, raises Sp. Atk, Sp. Def by 1.",
		isNonstandard: null,
		pp: 10,
		onHit(target, source, move) {
			let success = !!source.addVolatile('powerboost', source, move);
			success = !!source.addVolatile('guardboost', source, move) || success;
			return source.cureStatus() || success;
		},
		gen: 8,
	},
	tarshot: {
		inherit: true,
		isNonstandard: "Past",
	},
	taunt: {
		inherit: true,
		isNonstandard: "Past",
	},
	tearfullook: {
		inherit: true,
		isNonstandard: "Past",
	},
	teatime: {
		inherit: true,
		isNonstandard: "Past",
	},
	technoblast: {
		inherit: true,
		isNonstandard: "Past",
	},
	teeterdance: {
		inherit: true,
		isNonstandard: "Past",
	},
	teleport: {
		inherit: true,
		desc: "If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members.",
		shortDesc: "User switches out.",
		priority: 0,
	},
	terrainpulse: {
		inherit: true,
		isNonstandard: "Past",
	},
	thief: {
		inherit: true,
		isNonstandard: "Past",
	},
	thousandarrows: {
		inherit: true,
		isNonstandard: "Past",
	},
	thousandwaves: {
		inherit: true,
		isNonstandard: "Past",
	},
	thrash: {
		inherit: true,
		isNonstandard: "Past",
	},
	throatchop: {
		inherit: true,
		isNonstandard: "Past",
	},
	thunder: {
		inherit: true,
		accuracy: 75,
		basePower: 100,
		desc: "Has a 30% chance to paralyze the target. This move can hit a target using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop. If the weather is Primordial Sea or Rain Dance, this move does not check accuracy. If the weather is Desolate Land or Sunny Day, this move's accuracy is 50%. If this move is used against a Pokemon holding Utility Umbrella, this move's accuracy remains at 70%.",
		shortDesc: "30% chance to paralyze. Can't miss in rain.",
		pp: 5,
	},
	thunderbolt: {
		inherit: true,
		basePower: 80,
		desc: "Has a 10% chance to paralyze the target.",
		shortDesc: "10% chance to paralyze the target.",
		pp: 10,
		secondary: {
			chance: 20,
			status: 'par',
		},
	},
	thundercage: {
		inherit: true,
		isNonstandard: "Past",
	},
	thunderfang: {
		inherit: true,
		desc: "Has a 10% chance to paralyze the target and a 10% chance to make it flinch.",
		shortDesc: "10% chance to paralyze. 10% chance to flinch.",
		secondary: {
			chance: 20,
			status: 'par',
		},
		secondaries: null,
	},
	thunderouskick: {
		inherit: true,
		isNonstandard: "Past",
	},
	thunderpunch: {
		inherit: true,
		desc: "Has a 10% chance to paralyze the target.",
		shortDesc: "10% chance to paralyze the target.",
		pp: 10,
		secondary: {
			chance: 30,
			status: 'par',
		},
	},
	thundershock: {
		inherit: true,
		desc: "Has a 10% chance to paralyze the target.",
		shortDesc: "10% chance to paralyze the target.",
		pp: 25,
		secondary: {
			chance: 30,
			status: 'par',
		},
	},
	tickle: {
		inherit: true,
		isNonstandard: "Past",
	},
	topsyturvy: {
		inherit: true,
		isNonstandard: "Past",
	},
	torment: {
		inherit: true,
		isNonstandard: "Past",
	},
	toxic: {
		inherit: true,
		isNonstandard: "Past",
	},
	toxicspikes: {
		inherit: true,
		isNonstandard: "Past",
	},
	transform: {
		inherit: true,
		isNonstandard: "Past",
	},
	triattack: {
		inherit: true,
		desc: "Has a 20% chance to either burn, freeze, or paralyze the target.",
		shortDesc: "20% chance to paralyze or burn or freeze target.",
		secondary: {
			chance: 30,
			onHit(target, source) {
				const result = this.random(3);
				if (result === 0) {
					target.trySetStatus('brn', source);
				} else if (result === 1) {
					target.trySetStatus('par', source);
				} else {
					target.trySetStatus('frz', source);
				}
			},
		},
	},
	trick: {
		inherit: true,
		isNonstandard: "Past",
	},
	trickortreat: {
		inherit: true,
		isNonstandard: "Past",
	},
	trickroom: {
		inherit: true,
		isNonstandard: "Past",
	},
	triplearrows: {
		inherit: true,
		basePower: 50,
		desc: "Has a 50% chance to lower the target's Defense by 1 stage, a 30% chance to make it flinch, and a higher chance for a critical hit.",
		shortDesc: "High crit. Target: 50% -1 Defense, 30% flinch.",
		isNonstandard: null,
		pp: 15,
		critRatio: 1,
		self: {
			volatileStatus: 'focusenergy',
		},
		secondary: {
			chance: 100,
			volatileStatus: 'guarddrop',
		},
		secondaries: null,
		gen: 8,
	},
	tripleaxel: {
		inherit: true,
		isNonstandard: "Past",
	},
	triplekick: {
		inherit: true,
		isNonstandard: "Past",
	},
	tropkick: {
		inherit: true,
		isNonstandard: "Past",
	},
	twister: {
		inherit: true,
		desc: "Has a 20% chance to make the target flinch. Power doubles if the target is using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop.",
		shortDesc: "20% chance to make the foe(s) flinch.",
		pp: 25,
		secondary: null,
	},
	uproar: {
		inherit: true,
		isNonstandard: "Past",
	},
	uturn: {
		inherit: true,
		isNonstandard: "Past",
	},
	vacuumwave: {
		inherit: true,
		isNonstandard: "Past",
	},
	vcreate: {
		inherit: true,
		isNonstandard: "Past",
	},
	venomdrench: {
		inherit: true,
		isNonstandard: "Past",
	},
	venoshock: {
		inherit: true,
		basePowerCallback(pokemon, target, move) {
			if (target.status) return move.basePower * 2;
			return move.basePower;
		},
		desc: "Power doubles if the target is poisoned.",
		shortDesc: "Power doubles if the target is poisoned.",
		pp: 15,
		onBasePower() {},
	},
	victorydance: {
		inherit: true,
		desc: "Raises the user's Attack, Defense, and Speed by 1 stage.",
		shortDesc: "Raises the user's Attack, Defense, Speed by 1.",
		isNonstandard: null,
		boosts: null,
		onHit(target, source, move) {
			source.addVolatile('powerboost', source, move);
			source.addVolatile('guardboost', source, move);
			source.addVolatile('primed', source, move);
		},
		gen: 8,
	},
	vinewhip: {
		inherit: true,
		isNonstandard: "Past",
	},
	visegrip: {
		inherit: true,
		isNonstandard: "Past",
	},
	vitalthrow: {
		inherit: true,
		isNonstandard: "Past",
	},
	voltswitch: {
		inherit: true,
		isNonstandard: "Past",
	},
	volttackle: {
		inherit: true,
		desc: "Has a 10% chance to paralyze the target. If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 33% recoil. 10% chance to paralyze target.",
		pp: 5,
		secondary: {
			chance: 30,
			status: 'par',
		},
	},
	waterfall: {
		inherit: true,
		isNonstandard: "Past",
	},
	watergun: {
		inherit: true,
		isNonstandard: "Past",
	},
	waterpledge: {
		inherit: true,
		isNonstandard: "Past",
	},
	waterpulse: {
		inherit: true,
		accuracy: true,
		desc: "Has a 20% chance to confuse the target.",
		shortDesc: "20% chance to confuse the target.",
		secondary: null,
	},
	watershuriken: {
		inherit: true,
		isNonstandard: "Past",
	},
	waterspout: {
		inherit: true,
		isNonstandard: "Past",
	},
	wavecrash: {
		inherit: true,
		basePower: 75,
		desc: "If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 33% recoil.",
		isNonstandard: null,
		gen: 8,
	},
	weatherball: {
		inherit: true,
		isNonstandard: "Past",
	},
	whirlpool: {
		inherit: true,
		isNonstandard: "Past",
	},
	whirlwind: {
		inherit: true,
		isNonstandard: "Past",
	},
	wickedblow: {
		inherit: true,
		isNonstandard: "Past",
	},
	wideguard: {
		inherit: true,
		isNonstandard: "Past",
	},
	wildboltstorm: {
		inherit: true,
		basePower: 95,
		desc: "Has a 20% chance to paralyze the target. If the weather is Primordial Sea or Rain Dance, this move does not check accuracy. If this move is used against a Pokemon holding Utility Umbrella, this move's accuracy remains at 80%.",
		shortDesc: "20% chance to paralyze foe(s). Rain: can't miss.",
		isNonstandard: null,
		pp: 5,
		secondary: {
			chance: 30,
			status: 'par',
		},
		gen: 8,
	},
	wildcharge: {
		inherit: true,
		basePower: 85,
		desc: "If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 1/4 recoil.",
		pp: 10,
		secondary: {
			chance: 20,
			status: 'par',
		},
	},
	willowisp: {
		inherit: true,
		isNonstandard: "Past",
	},
	wingattack: {
		inherit: true,
		isNonstandard: "Past",
	},
	wish: {
		inherit: true,
		isNonstandard: "Past",
	},
	withdraw: {
		inherit: true,
		isNonstandard: "Past",
	},
	wonderroom: {
		inherit: true,
		isNonstandard: "Past",
	},
	woodhammer: {
		inherit: true,
		basePower: 100,
		desc: "If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
		shortDesc: "Has 33% recoil.",
		pp: 5,
	},
	workup: {
		inherit: true,
		isNonstandard: "Past",
	},
	worryseed: {
		inherit: true,
		isNonstandard: "Past",
	},
	wrap: {
		inherit: true,
		isNonstandard: "Past",
	},
	xscissor: {
		inherit: true,
		desc: "No additional effect.",
		shortDesc: "No additional effect.",
		pp: 10,
		critRatio: 2,
	},
	yawn: {
		inherit: true,
		isNonstandard: "Past",
	},
	zapcannon: {
		inherit: true,
		isNonstandard: "Past",
	},
	zenheadbutt: {
		inherit: true,
		desc: "Has a 20% chance to make the target flinch.",
		shortDesc: "20% chance to make the target flinch.",
		pp: 10,
		secondary: null,
	},
	zingzap: {
		inherit: true,
		isNonstandard: "Past",
	},
};

function getTypeEffectiveness(
	battle: Battle,
	source: {type: string} | string,
	target: {getTypes: () => string[]} | {types: string[]} | string[] | string
) {
	return battle.dex.getImmunity(source, target) ? battle.dex.getEffectiveness(source, target) : -100;
}

function getAllMaxValues<T>(arr: readonly T[], fn: (item: T) => number, inverse = false) {
	if (arr.length === 0) return [];
	const maxVal = (inverse ? Math.min : Math.max)(...arr.map(item => fn(item)));
	return arr.filter(item => fn(item) === maxVal);
}
