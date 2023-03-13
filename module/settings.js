
export function registerSettings() {
    game.settings.register("hitos", "mentalHealthEnabled", {
        name: game.i18n.localize("Hitos.EnableMentalHealth"),
        hint: game.i18n.localize("Hitos.EnableMentalHealthHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register("hitos", "gameModule", {
        name: game.i18n.localize("Hitos.EnableMentalHealth"),
        hint: game.i18n.localize("Hitos.EnableMentalHealthHint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: String,
        choices: {
            "cultos": game.i18n.localize("Hitos.CultosInnombrables"),
            "lcdt": game.i18n.localize("Hitos.LasCorrientesDelTiempo"),
            "core": game.i18n.localize("Hitos.Core")
        },
        default: "cultos",
    });
}
