// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts
/*
If you want to add custom formats, create a file in this folder named: "custom-formats.ts"

Paste the following code into the file and add your desired formats and their sections between the brackets:
--------------------------------------------------------------------------------
// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

export const Formats: FormatList = [
];
--------------------------------------------------------------------------------

If you specify a section that already exists, your format will be added to the bottom of that section.
New sections will be added to the bottom of the specified column.
The column value will be ignored for repeat sections.
*/

export const Formats: FormatList = [
	{
		section: "Legends: Z-A",
	},
	{
		section: "Legends: Arceus Singles",
	},
	{
		name: "[Gen 8 Legends] OU",

		mod: 'gen8legends',
		ruleset: ['Standard'],
		banlist: ['AG', 'Uber'],
	},
	{
		name: "[Gen 8 Legends] Ubers",

		mod: 'gen8legends',
		searchShow: false,
		ruleset: ['Standard'],
		banlist: ['AG'],
	},
	{
		name: "[Gen 8 Legends] UU",

		mod: 'gen8legends',
		searchShow: false,
		ruleset: ['[Gen 8 Legends] OU'],
		banlist: ['OU'],
	},
	{
		name: "[Gen 8 Legends] LC",

		mod: 'gen8legends',
		searchShow: false,
		ruleset: ['Little Cup', 'Standard'],
	},
	{
		section: "Legends: Arceus Doubles",
	},
	{
		name: "[Gen 8 Legends] Doubles OU",

		mod: 'gen8legends',
		gameType: 'doubles',
		searchShow: false,
		ruleset: ['Standard Doubles'],
		banlist: ['DUber'],
	},
];
