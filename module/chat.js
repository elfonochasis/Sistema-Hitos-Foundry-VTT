export function addChatListeners(html){
    html.on('click','.drama-roll',onDramaRoll)
};

function sumDuplicate(arr){
    const map = arr.reduce((acc, val) => {
       if(acc.has(val)){
          acc.set(val, acc.get(val) + 1);
       }else{
          acc.set(val, 1);
       };
       return acc;
    }, new Map());
    return Array.from(map, el => el[0] * el[1]);
 };

function negDuplicate(arr){
    const map = arr.reduce((acc, val) => {
       if(acc.has(val)){
          acc.set(val, acc.get(val) + 1);
       }else{
          acc.set(val, 1);
       };
       return acc;
    }, new Map());
    return Array.from(map, el => el[1]>1?(el[0]*-1):el[0]);
 };

function calculateDamage(weaponDamage, weaponKindBonus, diceValues){

    //let corduraMod = Number(actor.system.estabilidadMental.mod);
    //let resistenciaMod = Number(actor.system.resistencia.mod);

    console.log(weaponDamage, weaponKindBonus, diceValues)
    let lookup = {
        m: Number(diceValues[0]),
        C: Number(diceValues[1]),
        M: Number(diceValues[2]),
    };

    let damageBase = eval(weaponDamage.replace("m","+"+lookup["m"]).replace("C","+"+lookup["C"]).replace("M","+"+lookup["M"]))
    let criticalMod = diceValues.filter(value => value==10).length
    criticalMod = criticalMod > 1 ? criticalMod : 1;
    let damageTotal = (Number(damageBase) + Number(weaponKindBonus)) * Number(criticalMod);
    //let attack = Number(lookup["C"]) + actor.system.atributos.ref.value + actor.system.habilidades.combate.value + resistenciaMod + corduraMod
    console.log(damageTotal)
    return damageTotal
}

async function onDramaRoll(event){
    console.log(event)
    let mods = Number(event.currentTarget.dataset.mods);
    let modsTooltip = event.currentTarget.dataset.modstooltip.split(",");
    let dicesOld = event.currentTarget.dataset.roll.split(",");
    let actor = game.actors.get(event.currentTarget.dataset.actor);
    let weaponDamage = event.currentTarget.dataset.weapondamage;
    let weaponKindBonus = event.currentTarget.dataset.weaponkindbonus;
    let template = "systems/hitos/templates/chat/roll-drama.html";
    let dialogData = {
        formula: "",
        data: actor.system,
        dices: dicesOld,
        config: CONFIG.hitos,
    };

    let html = await renderTemplate(template, dialogData);
    return new Promise((resolve) => {
        new Dialog({
            title: "Tirada",
            content: html,
            buttons: {
                normal: {
                    label: game.i18n.localize("Hitos.Roll.Tirar"),
                    callback: async (html) => {
                        let selectedDices = html[0].querySelectorAll('.check-dice:checked');
                        let afectar = html[0].querySelectorAll('.check-affect:checked')[0].value;
                        let dicesNew = [];
                        let result = 0;
                        selectedDices.forEach(dice => {dicesNew.push(Number(dice.value))});
                        let newRoll = await new Roll((3 - Number(dicesNew.length)) + "d10").roll({async: true});
                        newRoll.terms[0].results.forEach(result => {dicesNew.push(result.result)})
                        if(afectar === "1"){
                            result = Math.max(...sumDuplicate(dicesNew)) + mods
                        }
                        else{
                            result = Math.min(...negDuplicate(dicesNew)) + mods
                        }
                        let damage = calculateDamage(weaponDamage,weaponKindBonus, dicesNew.sort((a, b) => a - b))
                        let template = "systems/hitos/templates/chat/chat-drama.html";
                        dialogData = {
                            title: game.i18n.localize("Drama"),
                            total: result,
                            damage: damage,
                            dicesOld: dicesOld,
                            dices: dicesNew.sort((a, b) => a - b),
                            actor: actor.id,
                            mods: mods,
                            modsTooltip: modsTooltip,
                            weaponDamage: weaponDamage,
                            weaponKindBonus: weaponKindBonus,
                            data: actor.system,
                            config: CONFIG.hitos,
                        };
                        html = await renderTemplate(template, dialogData);
                        ChatMessage.create({
                            content: html,
                            speaker: {alias: actor.name},
                            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                            rollMode: game.settings.get("core", "rollMode"),
                            roll: newRoll
                        });
                    },
                },
            },
            default: "normal",
            close: () => resolve(null),
        }).render(true);
    });

    //let actor = game.actors.get(card.dataset.ownerId);
    //console.log(actor)
}
