// Ensure at least one token is selected
if (!canvas.tokens.controlled.length) {
    return ui.notifications.warn("You must select at least one token.");
}

// Get selected tokens and their effects
let tokens = canvas.tokens.controlled;
let effectMap = new Map();

tokens.forEach(token => {
    let actor = token.actor;
    if (!actor) return;
    
    let tempEffects = actor.effects.filter(e => e.flags.core?.statusId || e.flags.dnd5e);
    
    tempEffects.forEach(effect => {
        if (!effectMap.has(effect.id)) {
            effectMap.set(effect.id, { name: effect.name, effect, token });
        }
    });
});

// If no temporary effects are found, notify and exit
if (effectMap.size === 0) {
    return ui.notifications.info("No temporary effects found on selected tokens.");
}

// Create selection dialog
let effectOptions = Array.from(effectMap.values())
    .map(e => `<option value="${e.effect.id}">${e.name} (Token: ${e.token.name})</option>`)
    .join("");

new Dialog({
    title: "Remove Temporary Effects",
    content: `
        <form>
            <div class="form-group">
                <label for="effects">Select effects to remove:</label>
                <select id="effects" name="effects" multiple style="width:100%">
                    ${effectOptions}
                </select>
            </div>
        </form>
    `,
    buttons: {
        removeSelected: {
            label: "Remove Selected",
            callback: async (html) => {
                let selectedEffects = Array.from(html.find("#effects").val());
                if (selectedEffects.length === 0) return ui.notifications.warn("No effects selected.");

                for (let effectId of selectedEffects) {
                    let effectData = effectMap.get(effectId);
                    if (effectData) {
                        await effectData.token.actor.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
                    }
                }
                ui.notifications.info(`Removed ${selectedEffects.length} effect(s).`);
            }
        },
        removeAll: {
            label: "Remove All",
            callback: async () => {
                for (let effectData of effectMap.values()) {
                    await effectData.token.actor.deleteEmbeddedDocuments("ActiveEffect", [effectData.effect.id]);
                }
                ui.notifications.info(`Removed all temporary effects from selected tokens.`);
            }
        },
        cancel: {
            label: "Cancel"
        }
    },
    default: "removeSelected"
}).render(true);
