import { hitos } from './config.js';




export async function _onDramaRoll(actor){
    let template = "systems/hitos/templates/chat/roll-dialog.html";
    let dialogData = {
        formula: "",
        data: actor.system,
        config: CONFIG.hitos,
    };
    let html = await foundry.applications.handlebars.renderTemplate(template, dialogData);
    return 1
}

export async function _onInitRoll(actor) {
    let values = await _rolld10(actor.system.iniciativa); // <- Use array style
    let corduraMod = game.settings.get("hitos", "mentalHealthEnabled")
        ? Number(actor.system.estabilidadMental.mod)
        : 0;
    let resistenciaMod = Number(actor.system.resistencia.mod);

    let template = "systems/hitos/templates/chat/chat-roll.html";
    let dialogData = {
        title: game.i18n.localize("Hitos.Iniciativa"),
        total: values[2] + corduraMod + resistenciaMod,
        damage: null,
        dices: values[1],
        actor: actor.id,
        mods: Number(actor.system.iniciativa) + corduraMod + resistenciaMod,
        modsTooltip: _formatModsTooltip([
            { value: Number(actor.system.iniciativa), key: "Iniciativa" },
            { value: corduraMod, key: "EstabilidadMental" },
            { value: resistenciaMod, key: "Resistencia" }
        ]),
        config: CONFIG.hitos
    };

    let html = await foundry.applications.handlebars.renderTemplate(template, dialogData);
    ChatMessage.create({
        content: html,
        speaker: { alias: actor.name },
        rolls: [values[0]],
        rollMode: game.settings.get("core", "rollMode")
    });
}

export async function _onAttackRoll(actor, weapon) {
    let corduraMod = game.settings.get("hitos", "mentalHealthEnabled")? Number(actor.system.estabilidadMental.mod) : 0;
    let resistenciaMod = Number(actor.system.resistencia.mod);

    /* M + 1 */
    //let damage = await new Roll(weapon.damage);
    /* M */
    //let damageBase = damage.terms[0];
    /* 3 + 4 + 6 */
    let values = await _rolld10(0); // <- added 'await'

    // Defensive assignment: fallback to 0
    let diceArr = (values[1] && values[1].length >= 3) ? values[1] : [0,0,0];

    let attack = Number(values[2] ?? 0) + actor.system.atributos.ref.value + actor.system.habilidades.combate.value + resistenciaMod + corduraMod // use nullish coalescing for safety

    let lookup = {
        m: Number(diceArr[0]),
        C: Number(diceArr[1]),
        M: Number(diceArr[2]),
};
    let damageBase = eval(weapon.damage.replace("m","+"+lookup["m"]).replace("C","+"+lookup["C"]).replace("M","+"+lookup["M"]))
    //console.log(eval(damage_test))
    let criticalMod = values[1].filter(value => value==10).length
    criticalMod = criticalMod > 1 ? criticalMod : 1;
    let weaponKindBonus = Number(foundry.utils.getProperty(actor.system, `danio.${weapon.kind}`))
    //damage.terms[0] = new NumericTerm({number: Array.from(damageBase.term).map((value) => lookup[value]).reduce((sum, value) => sum += value)});
    let damageTotal = (Number(damageBase) + weaponKindBonus) * Number(criticalMod);

    let template = "systems/hitos/templates/chat/chat-roll.html";

    let dialogData = {
        title: game.i18n.localize("Hitos.Ataque") + ". " + game.i18n.localize(hitos.weaponKind[weapon.kind]),
        total: attack,
        damage: damageTotal,
        dices: values[1],
        actor: actor._id,
        weaponDamage: weapon.damage,
        weaponKindBonus: weaponKindBonus,
        data: actor.system,
        mods: actor.system.atributos.ref.value + actor.system.habilidades.combate.value + resistenciaMod + corduraMod,
        modsTooltip: _formatModsTooltip([
            {value: actor.system.atributos.ref.value, key: "REF"},
            {value: actor.system.habilidades.combate.value, key: "Combate"},
            {value: corduraMod, key: "EstabilidadMental"},
            {value: resistenciaMod, key: "Resistencia"}
        ]),
        config: CONFIG.hitos
    };
    let html = await foundry.applications.handlebars.renderTemplate(template, dialogData);
    ChatMessage.create({
        content: html,
        speaker: {alias: actor.name},
        rolls: [values[0]],
        rollMode: game.settings.get("core", "rollMode")        
    });
}

export async function _onStatusRoll(actor, status) {
    let statValue, statLabel;
    // For atributos, get value from actor.system.atributos
if (actor.system.atributos && status in actor.system.atributos) {
  statValue = actor.system.atributos[status]?.value ?? 0;
  statLabel = actor.system.atributos[status]?.label ?? status;
} else {
  // For standard statuses like aguante, enterza, etc.
  statValue = foundry.utils.getProperty(actor.system, `${status}.value`);
  statLabel = foundry.utils.getProperty(actor.system, `${status}.label`) ?? status;
}
    let values = await _rolld10(statValue); // Use array, not destructuring
    let template = "systems/hitos/templates/chat/chat-roll.html";
    let dialogData = {
        title: game.i18n.localize(statLabel),
        total: values[2],
        damage: null,
        dices: values[1],
        actor: actor.id,
        mods: Number(statValue),
        modsTooltip: _formatModsTooltip([
            {value: Number(statValue), key: statLabel.replace("Hitos.", "")}
        ]),
        config: CONFIG.hitos
    };
    let html = await foundry.applications.handlebars.renderTemplate(template, dialogData);
    ChatMessage.create({
        content: html,
        speaker: {alias: actor.name},
        rolls: [values[0]], // <<< USE ARRAY STYLE
        rollMode: game.settings.get("core", "rollMode")
    });
}

export async function _onCheckRoll(actor, valor, habilidadNombre) {
    console.log(valor, habilidadNombre)
    let corduraMod = game.settings.get("hitos", "mentalHealthEnabled")? Number(actor.system.estabilidadMental.mod) : 0;
    let resistenciaMod = Number(actor.system.resistencia.mod);
    let template = "systems/hitos/templates/chat/roll-dialog.html";
    
    // ------- NEW CODE: build atributosOptions -------
    const atributosOptions = Object.entries(actor.system.atributos).map(([key, atributo]) => ({
      value: atributo.value,
      label: game.i18n.localize(atributo.label)
    }));
    // ----------------------------------------------
    let dialogData = {
        formula: "",
        atributosOptions,
        selectedAtributo: atributosOptions[0]?.value,
        config: CONFIG.hitos,
    };
    console.log(dialogData)
    let html = await foundry.applications.handlebars.renderTemplate(template, dialogData);
    return new Promise((resolve) => {
        new Dialog({
            title: "Tirada",
            content: html,
            buttons: {
                normal: {
                    label: game.i18n.localize("Hitos.Roll.Tirar"),
                    callback: async (html) => {
                        let values = await _rolld10(valor);
                        let total =
                            Number(html[0].querySelectorAll("option:checked")[0].value) +
                            Number(html[0].querySelectorAll(".bonus")[0].value) +
                            corduraMod +
                            resistenciaMod +
                            values[2];
                        let template = "systems/hitos/templates/chat/chat-roll.html";
                        dialogData = {
                            title: game.i18n.localize(habilidadNombre),
                            total: total,
                            damage: null,
                            atributo: game.i18n.localize(html[0].querySelectorAll("option:checked")[0].label),
                            dices: values[1],
                            actor: actor._id,
                            mods: Number(valor) + Number(html[0].querySelectorAll("option:checked")[0].value) + Number(html[0].querySelectorAll(".bonus")[0].value) + resistenciaMod + corduraMod,
                            modsTooltip: _formatModsTooltip([
                                {value: Number(valor), key: habilidadNombre.replace("Hitos.", "")},
                                {value: Number(html[0].querySelectorAll("option:checked")[0].value), key: html[0].querySelectorAll("option:checked")[0].label.replace("Hitos.", "").substring(0, 3)},
                                {value: Number(html[0].querySelectorAll(".bonus")[0].value), key: "Roll.Modificador"},
                                {value: corduraMod, key: "EstabilidadMental"},
                                {value: resistenciaMod, key: "Resistencia"}
                            ]),
                            config: CONFIG.hitos,
                        };
                        html = await foundry.applications.handlebars.renderTemplate(template, dialogData);
                        ChatMessage.create({
                            content: html,
                            speaker: {alias: actor.name},
                            rolls: [values[0]],
                            rollMode: game.settings.get("core", "rollMode")                            
                        });
                    },
                },
            },
            default: "normal",
            close: () => resolve(null),
        }).render(true);
    });
}

export async function _rolld10(valor) {
    let d10Roll = await new Roll("1d10+1d10+1d10").evaluate();
    let results = d10Roll.dice.map(die => die.results.map(r => r.result)).flat();
    let d10s = results.sort((a, b) => a - b);
    if (d10s.length < 3) {
        console.error("Error: Expected 3 dice, got", d10s.length, d10s);
        return [d10Roll, d10s, null];
    }
    let result = Number(d10s[1]) + Number(valor);
    return [d10Roll, d10s, result];
}

export function _formatModsTooltip(data) {
    return data.filter(({value}) => value !== 0).map(({value, key}) => {
        return game.i18n.localize("Hitos." + key) + ": " + value;
    });
}
