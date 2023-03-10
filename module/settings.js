
export function registerSettings() {
    game.settings.register("hitos", "mentalHealthEnabled", {
        name: game.i18n.localize("Hitos.EnableMentalHealth"),
        hint: game.i18n.localize("Hitos.EnableMentalHealthHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
}
