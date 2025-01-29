// Ensure at least one token is selected
if (!canvas.tokens.controlled.length) {
    return ui.notifications.warn("You must select at least one token.");
}

// Open a dialog to input effect details
new Dialog({
    title: "Modify Max HP",
    content: `
        <form>
            <div class="form-group">
                <label for="effectIcon">Effect Icon:</label>
                <div style="display: flex;">
                    <input type="text" id="effectIcon" value="icons/magic/life/heart-cross-blue.webp" style="flex-grow: 1;" />
                    <button type="button" id="filePicker" style="margin-left: 5px;">📁</button>
                </div>
            </div>
            <div class="form-group">
                <label for="effectName">Effect Name:</label>
                <input type="text" id="effectName" value="Max HP Modifier" />
            </div>
            <div class="form-group">
                <label for="durationValue">Duration:</label>
                <div style="display: flex;">
                    <input type="number" id="durationValue" step="1" min="1" value="10" style="flex-grow: 1;" />
                    <select id="durationType" style="margin-left: 5px;">
                        <option value="turns">Turns</option>
                        <option value="rounds">Rounds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="permanent" selected>Permanent</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="hpChange">HP Modifier (+/-):</label>
                <input type="number" id="hpChange" step="1" />
            </div>
        </form>
        <script>
            document.getElementById("filePicker").addEventListener("click", function() {
                new FilePicker({
                    type: "image",
                    current: "icons/",
                    callback: function(path) {
                        document.getElementById("effectIcon").value = path;
                    }
                }).render(true);
            });

            document.getElementById("durationType").addEventListener("change", function() {
                let durationInput = document.getElementById("durationValue");
                if (this.value === "permanent") {
                    durationInput.disabled = true;
                    durationInput.value = "";
                } else {
                    durationInput.disabled = false;
                    durationInput.value = "10"; // Default duration when re-enabled
                }
            });
        </script>
    `,
    buttons: {
        apply: {
            label: "Apply",
            callback: async (html) => {
                let effectIcon = html.find("#effectIcon").val() || "icons/magic/life/heart-cross-blue.webp";
                let effectName = html.find("#effectName").val() || "Max HP Modifier";
                let durationType = html.find("#durationType").val();
                let durationValue = parseInt(html.find("#durationValue").val());
                let hpChange = parseInt(html.find("#hpChange").val());

                if (isNaN(hpChange) || hpChange === 0) {
                    return ui.notifications.warn("Enter a valid non-zero HP modifier.");
                }

                // Define duration object
                let duration = {};
                if (durationType !== "permanent" && !isNaN(durationValue) && durationValue > 0) {
                    duration[durationType] = durationValue;
                }

                for (let token of canvas.tokens.controlled) {
                    let actor = token.actor;
                    if (!actor) continue;

                    // Define the max HP modification effect
                    let hpEffect = {
                        label: effectName,
                        icon: effectIcon, // Custom icon input
                        changes: [
                            {
                                key: "system.attributes.hp.max",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: hpChange,
                                priority: 20
                            }
                        ],
                        duration: duration,
                        flags: { "dnd5e": { effectType: "bonus" } }
                    };

                    // Apply the effect to the actor
                    await actor.createEmbeddedDocuments("ActiveEffect", [hpEffect]);
                }

                ui.notifications.info(`Applied "${effectName}" for ${durationType !== "permanent" ? durationValue + " " + durationType : "Permanent"} with HP change of ${hpChange}.`);
            }
        },
        cancel: { label: "Cancel" }
    },
    default: "apply"
}).render(true);