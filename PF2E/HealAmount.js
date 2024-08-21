// Ensure at least one token is selected
if (canvas.tokens.controlled.length === 0) {
    ui.notifications.warn("You must select at least one token to apply healing to!");
    return;
}

// Healing options and their roll formulas
const healingOptions = {
    "basic": "Basic Healing (2d8)",
    "expert": "Expert Healing (2d8 + 10)",
    "master": "Master Healing (2d8 + 30)",
    "legendary": "Legendary Healing (2d8 + 50)"
};

// Create a dialog to select the healing roll and apply it
new Dialog({
    title: "Healing Rolls",
    content: `
        <form>
            <div class="form-group">
                <label>Select Healing Type:</label>
                <select id="healing-selector">
                    ${Object.entries(healingOptions).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
                </select>
            </div>
        </form>
    `,
    buttons: {
        roll: {
            label: "Apply Healing",
            callback: (html) => {
                let selectedHealing = html.find("#healing-selector").val();

                // Roll for each selected token
                canvas.tokens.controlled.forEach(token => {
                    let actor = token.actor;

                    if (!actor) {
                        ui.notifications.warn("The selected token does not have an associated actor!");
                        return;
                    }

                    // Healing roll formulas
                    let healingRoll;
                    if (selectedHealing === "basic") {
                        healingRoll = new Roll("2d8");
                    } else if (selectedHealing === "expert") {
                        healingRoll = new Roll("2d8 + 10");
                    } else if (selectedHealing === "master") {
                        healingRoll = new Roll("2d8 + 30");
                    } else if (selectedHealing === "legendary") {
                        healingRoll = new Roll("2d8 + 50");
                    }

                    // Evaluate the healing roll
                    healingRoll.evaluate({async: false});
                    
                    // Format and send the chat message
                    let resultMessage = `
                        <h3>${healingOptions[selectedHealing]}</h3>
                        <b>Roll:</b> ${healingRoll.result} = ${healingRoll.total}<br>
                        <b>Healing:</b> The patient heals for ${healingRoll.total} hit points.
                    `;
                    healingRoll.toMessage({
                        speaker: ChatMessage.getSpeaker({ token: token }),
                        flavor: resultMessage,
                        user: game.userId
                    });
                });
            }
        }
    },
    default: "roll"
}).render(true);