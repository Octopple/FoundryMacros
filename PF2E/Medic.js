// Ensure at least one token is selected
if (canvas.tokens.controlled.length === 0) {
    ui.notifications.warn("You must select at least one token to perform medicine actions on!");
    return;
}

// Roll Modes
const rollModes = {
    "roll": "Public Roll",
    "gmroll": "Private GM Roll",
    "blindroll": "Blind GM Roll",
    "selfroll": "Self Roll"
};

// Medicine Actions
const medicineActions = {
    "wounds": "Treat Wounds",
    "disease": "Treat Disease",
    "poison": "Treat Poison",
    "firstaid": "Administer First Aid",
    "stabilize": "Stabilize"
};

// Descriptions for each action
const actionDescriptions = {
    "wounds": "Attempt to heal damage by treating wounds. Higher DC results in increased healing.",
    "disease": "Treat a disease, granting a bonus to the patient's next saving throw.",
    "poison": "Treat a poison, granting a bonus to the patient's next saving throw.",
    "firstaid": "Administer first aid to stop bleeding or stabilize a creature (DC 15).",
    "stabilize": "Attempt to stabilize a dying creature (DC 15)."
};

// Outcome descriptions for each action
const outcomeDescriptions = {
    "wounds": {
        success: "The patient heals based on the selected DC.",
        failure: "The treatment fails, and the patient does not heal."
    },
    "disease": {
        success: "The patient gains a +2 circumstance bonus to their next saving throw against the disease.",
        failure: "The treatment fails, providing no benefit."
    },
    "poison": {
        success: "The patient gains a +2 circumstance bonus to their next saving throw against the poison.",
        failure: "The treatment fails, providing no benefit."
    },
    "firstaid": {
        success: "The patient is stabilized or bleeding is stopped.",
        failure: "The treatment fails, and the patient's condition does not improve."
    },
    "stabilize": {
        success: "The patient is stabilized, preventing them from slipping closer to death.",
        failure: "The treatment fails, and the patient remains at risk."
    }
};

// Treat Wounds DC options
const treatWoundsDCs = {
    "15": "Standard (DC 15, Heals 2d8)",
    "20": "Expert (DC 20, Heals 2d8 + 10)",
    "30": "Master (DC 30, Heals 2d8 + 30)",
    "40": "Legendary (DC 40, Heals 2d8 + 50)"
};

// Treat Disease/Poison options
const treatDiseasePoisonDCs = {
    "15": "Moderate (DC 15)",
    "20": "Severe (DC 20)",
    "25": "Critical (DC 25)"
};

// Fixed DC for First Aid and Stabilize (15)
const firstAidDC = 15;

// Create the dialog for choosing the medicine action, providing descriptions, and performing the roll
new Dialog({
    title: "Medicine Actions",
    content: `
        <form>
            <div class="form-group">
                <label>Select Medicine Action:</label>
                <select id="medicine-action-selector">
                    ${Object.entries(medicineActions).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
                </select>
            </div>
            <div class="form-group" id="description-container">
                <p id="action-description">Select an action to see its description.</p>
            </div>
            <div class="form-group" id="dc-container">
                <label>Select DC:</label>
                <select id="dc-selector"></select>
            </div>
            <div class="form-group">
                <label>Select Roll Mode:</label>
                <select id="roll-mode-selector">
                    ${Object.entries(rollModes).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Use Assurance? (Skip Roll, Automatic Success):</label>
                <input type="checkbox" id="assurance-check">
            </div>
        </form>
    `,
    buttons: {
        roll: {
            label: "Perform Action",
            callback: (html) => {
                let medicineAction = html.find("#medicine-action-selector").val();
                let selectedDC = parseInt(html.find("#dc-selector").val());
                let rollMode = html.find("#roll-mode-selector").val();
                let useAssurance = html.find("#assurance-check").is(":checked");

                // Roll for each selected token
                canvas.tokens.controlled.forEach(token => {
                    let actor = token.actor;
                    if (!actor) {
                        ui.notifications.warn("The selected token does not have an associated actor!");
                        return;
                    }

                    // Get the Medicine skill
                    let medicineSkill = actor.system.skills.med;
                    if (!medicineSkill) {
                        ui.notifications.warn(`${actor.name} does not have the Medicine skill.`);
                        return;
                    }

                    // Handle Action Logic
                    if (medicineAction === "wounds") {
                        handleTreatWounds(actor, medicineSkill, selectedDC, rollMode, useAssurance);
                    } else if (medicineAction === "disease" || medicineAction === "poison") {
                        handleTreatDiseasePoison(actor, medicineSkill, selectedDC, rollMode, medicineAction, useAssurance);
                    } else if (medicineAction === "firstaid") {
                        handleFirstAid(actor, medicineSkill, rollMode, useAssurance);
                    } else if (medicineAction === "stabilize") {
                        handleStabilize(actor, medicineSkill, rollMode, useAssurance);
                    }
                });

                // Helper function to handle Treat Wounds logic
                function handleTreatWounds(actor, skill, dc, rollMode, assurance) {
                    if (assurance) {
                        handleAssurance(actor, skill, dc, rollMode, `Treat Wounds`);
                    } else {
                        rollSkill(actor, skill, dc, rollMode, `Treat Wounds`, calculateHealing(dc));
                    }
                }

                // Helper function to handle Treat Disease/Poison logic
                function handleTreatDiseasePoison(actor, skill, dc, rollMode, treatmentType, assurance) {
                    if (assurance) {
                        handleAssurance(actor, skill, dc, rollMode, `Treat ${treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1)}`);
                    } else {
                        rollSkill(actor, skill, dc, rollMode, `Treat ${treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1)}`);
                    }
                }

                // Helper function for Administer First Aid
                function handleFirstAid(actor, skill, rollMode, assurance) {
                    const dc = firstAidDC;
                    if (assurance) {
                        handleAssurance(actor, skill, dc, rollMode, `Administer First Aid`);
                    } else {
                        rollSkill(actor, skill, dc, rollMode, `Administer First Aid`);
                    }
                }

                // Helper function for Stabilize
                function handleStabilize(actor, skill, rollMode, assurance) {
                    const dc = firstAidDC;  // Stabilize also uses DC 15
                    if (assurance) {
                        handleAssurance(actor, skill, dc, rollMode, `Stabilize`);
                    } else {
                        rollSkill(actor, skill, dc, rollMode, `Stabilize`);
                    }
                }

                // Helper function for rolling the skill check with outcome descriptions
                function rollSkill(actor, skill, dc, rollMode, flavor, healing) {
                    let roll = new Roll("1d20 + @mod", { mod: skill.totalModifier });
                    roll.roll().then(r => {
                        let success = r.total >= dc;
                        let resultMessage = `
                            <h3>${flavor}</h3>
                            <b>DC:</b> ${dc} | <b>Roll:</b> ${r.result} = ${r.total}<br>
                            ${success ? outcomeDescriptions[medicineAction].success : outcomeDescriptions[medicineAction].failure}
                        `;
                        r.toMessage({
                            speaker: ChatMessage.getSpeaker({ token: token }),
                            flavor: resultMessage,
                            user: game.userId,
                            rollMode: rollMode
                        });
                        if (success && healing) {
                            healing.toMessage({
                                speaker: ChatMessage.getSpeaker({ token: token }),
                                flavor: `Healing: ${healing.result}`,
                                user: game.userId,
                                rollMode: rollMode
                            });
                        }
                    });
                }

                // Helper function for Assurance (no roll) with outcome descriptions
                function handleAssurance(actor, skill, dc, rollMode, flavor) {
                    let resultMessage = `
                        <h3>${flavor}</h3>
                        <b>DC:</b> ${dc} | <b>Modifier:</b> ${skill.totalModifier}<br>
                        ${skill.totalModifier >= dc ? outcomeDescriptions[medicineAction].success : outcomeDescriptions[medicineAction].failure}
                    `;
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ token: token }),
                        flavor: resultMessage,
                        whisper: game.users.filter(user => user.isGM).map(user => user.id),
                        user: game.userId,
                        rollMode: rollMode
                    });
                }

                // Helper function to calculate healing for Treat Wounds
                function calculateHealing(dc) {
                    let healingFormula = "2d8";  // Default healing
                    if (dc === 20) healingFormula = "2d8 + 10";
                    if (dc === 30) healingFormula = "2d8 + 30";
                    if (dc === 40) healingFormula = "2d8 + 50";
                    return new Roll(healingFormula).roll();
                }
            }
        }
    },
    default: "roll",
    render: (html) => {
        const medicineActionSelector = html.find("#medicine-action-selector");
        const descriptionContainer = html.find("#action-description");
        const dcSelector = html.find("#dc-selector");

        // Function to update DC options based on medicine action
        function updateDCOptions() {
            let selectedAction = medicineActionSelector.val();
            let dcOptions;
            let description = actionDescriptions[selectedAction];

            // Update the description text
            descriptionContainer.text(description);

            if (selectedAction === "wounds") {
                dcOptions = treatWoundsDCs;
            } else if (selectedAction === "disease" || selectedAction === "poison") {
                dcOptions = treatDiseasePoisonDCs;
            } else {
                // Administer First Aid and Stabilize use a fixed DC of 15
                dcOptions = { "15": "Fixed DC 15" };
            }

            dcSelector.empty();
            Object.entries(dcOptions).forEach(([key, value]) => {
                dcSelector.append(`<option value="${key}">${value}</option>`);
            });
        }

        // Update the DC options and description when the medicine action is changed
        medicineActionSelector.change(updateDCOptions);

        // Initialize with the first set of DC options and description
        updateDCOptions();
    }
}).render(true);