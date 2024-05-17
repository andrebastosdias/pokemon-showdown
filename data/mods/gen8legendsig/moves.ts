export const Moves: {[k: string]: ModdedMoveData} = {
    hiddenpower: {
        inherit: true,
        basePower: 50,
        onModifyType(move, pokemon, target) {
            const all_types = this.dex.types.all().map(x => x.name);
            const best_types = getAllMaxValues(all_types, x => getTypeEffectiveness(this, x, target));
            move.type = this.sample(best_types);
        },
    },
    hiddenpowerbug: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerdark: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerdragon: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerelectric: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerfighting: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerfire: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerflying: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerghost: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowergrass: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerground: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerice: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerpoison: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerpsychic: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerrock: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowersteel: {
        inherit: true,
        isNonstandard: "Past",
    },
    hiddenpowerwater: {
        inherit: true,
        isNonstandard: "Past",
    },
    judgment: {
        inherit: true,
        pp: 5,
        onModifyType(move, pokemon, target) {
            if (pokemon.species.baseSpecies !== 'Arceus') return;
            if (pokemon.baseSpecies.id !== 'arceuslegend') {
                move.type = pokemon.species.types[0];
                return;
            }

            const all_types = this.dex.types.all().map(x => x.name);
            var best_types = getAllMaxValues(all_types, x => getTypeEffectiveness(this, x, target));
            best_types = getAllMaxValues(all_types, x => getTypeEffectiveness(this, target.types[0], x), true);
            if (target.types.length > 1) {
                best_types = getAllMaxValues(all_types, x => getTypeEffectiveness(this, target.types[1], x), true);
            }
            const newType = this.sample(best_types);

            if (newType !== pokemon.species.types[0]) {
                pokemon.formeChange('Arceus-' + newType, this.effect, false, '[msg]');
            }
            move.type = newType;
        },
    },
};

function getTypeEffectiveness(
    battle: Battle,
    source: {type: string} | string,
    target: {getTypes: () => string[]} | {types: string[]} | string[] | string
) {
    return battle.dex.getImmunity(source, target) ? battle.dex.getEffectiveness(source, target) : -3;
}

function getAllMaxValues<T> (arr: T[], fn: (item: T) => number, min: boolean = false) {
    if (arr.length === 0) return [];

    let maxVal = fn(arr[0]);
    for (let i = 1; i < arr.length; i++) {
        const val = fn(arr[i]);
        if (min) {
            if (val < maxVal) {
                maxVal = val;
            }
        } else {
            if (val > maxVal) {
                maxVal = val;
            }
        }
    }

    return arr.filter(item => fn(item) === maxVal);
}
