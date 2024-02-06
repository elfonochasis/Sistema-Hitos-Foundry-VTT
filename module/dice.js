import { hitos } from './config.js';




export async function _onDramaRoll(actor){
    let template = "systems/hitos/templates/chat/roll-dialog.html";
    let dialogData = {
        formula: "",
        data: actor.system,
        config: CONFIG.hitos,
    };
    let html = await renderTemplate(template, dialogData);
    return 1
}


export async function _onInitRoll(actor) {
    let values = _rolld10(actor.system.iniciativa);
    let corduraMod = game.settings.get("hitos", "mentalHealthEnabled")? Number(actor.system.estabilidadMental.mod) : 0;
    let resistenciaMod = Number(actor.system.resistencia.mod);
    let template = "systems/hitos/templates/chat/chat-roll.html";

    let dialogData = {
        title: game.i18n.localize("Hitos.Iniciativa"),
        total: values[2] + corduraMod + resistenciaMod,
        damage: null,
        dices: values[1],
        actor: actor._id,
        mods: Number(actor.system.iniciativa) + corduraMod + resistenciaMod,
        modsTooltip: _formatModsTooltip([
            {value: actor.system.iniciativa, key: "Iniciativa"},
            {value: corduraMod, key: "EstabilidadMental"},
            {value: resistenciaMod, key: "Resistencia"}
        ]),
        data: actor.system,
        config: CONFIG.hitos,
    };
    let html = await renderTemplate(template, dialogData);
    ChatMessage.create({
        content: html,
        speaker: {alias: actor.name},
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        roll: values[0]
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
    let values = _rolld10(0);

    let attack = Number(values[2]) + actor.system.atributos.ref.value + actor.system.habilidades.combate.value + resistenciaMod + corduraMod

    let lookup = {
        m: Number(values[1][0]),
        C: Number(values[1][1]),
        M: Number(values[1][2]),
    };
    let damageBase = eval(weapon.damage.replace("m","+"+lookup["m"]).replace("C","+"+lookup["C"]).replace("M","+"+lookup["M"]))
    //console.log(eval(damage_test))
    let criticalMod = values[1].filter(value => value==10).length
    criticalMod = criticalMod > 1 ? criticalMod : 1;
    let weaponKindBonus = Number(getProperty(actor.system, `danio.${weapon.kind}`))
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
    let html = await renderTemplate(template, dialogData);
    ChatMessage.create({
        content: html,
        speaker: {alias: actor.name},
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        roll: values[0]
    });
}

export async function _onStatusRoll(actor, status) {
    let values = _rolld10(getProperty(actor.system, `${status}.value`));
    let statusLabel = getProperty(actor.system, `${status}.label`)
    let template = "systems/hitos/templates/chat/chat-roll.html";

    let dialogData = {
        title: game.i18n.localize(statusLabel),
        total: values[2],
        damage: null,
        dices: values[1],
        actor: actor._id,
        mods: Number(getProperty(actor.system, `${status}.value`)),
        modsTooltip: _formatModsTooltip([
            {value: Number(getProperty(actor.system, `${status}.value`)), key: statusLabel.replace("Hitos.","")}
        ]),
        data: actor.system,
        config: CONFIG.hitos,
    };
    let html = await renderTemplate(template, dialogData);
    ChatMessage.create({
        content: html,
        speaker: {alias: actor.name},
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        roll: values[0]
    });
}

export async function _onCheckRoll(actor, valor, habilidadNombre) {
    console.log(valor, habilidadNombre)
    let corduraMod = game.settings.get("hitos", "mentalHealthEnabled")? Number(actor.system.estabilidadMental.mod) : 0;
    let resistenciaMod = Number(actor.system.resistencia.mod);
    let template = "systems/hitos/templates/chat/roll-dialog.html";
    let dialogData = {
        formula: "",
        data: actor.system,
        config: CONFIG.hitos,
    };
    console.log(dialogData)
    let html = await renderTemplate(template, dialogData);
    return new Promise((resolve) => {
        new Dialog({
            title: "Tirada",
            content: html,
            buttons: {
                normal: {
                    label: game.i18n.localize("Hitos.Roll.Tirar"),
                    callback: async (html) => {
                        let values = _rolld10(valor);
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
                            data: actor.system,
                            config: CONFIG.hitos,
                        };
                        html = await renderTemplate(template, dialogData);
                        ChatMessage.create({
                            content: html,
                            speaker: {alias: actor.name},
                            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                            rollMode: game.settings.get("core", "rollMode"),
                            roll: values[0]
                        });
                    },
                },
            },
            default: "normal",
            close: () => resolve(null),
        }).render(true);
    });
}

function _rolld10(valor) {
    let d10Roll = new Roll("1d10+1d10+1d10").roll({async: false});
    let d10s = d10Roll.result.split(" + ").sort((a, b) => a - b);
    let result = Number(d10s[1]) + Number(valor);
    return [d10Roll, d10s, result];
}

function _formatModsTooltip(data) {
    return data.filter(({value}) => value !== 0).map(({value, key}) => {
        return game.i18n.localize("Hitos." + key) + ": " + value;
    });
}
