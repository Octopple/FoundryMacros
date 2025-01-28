// Updated Heal Amount Macro for Foundry VTT v12 (PF2E v6.8.4)

// Ensure at least one token is selected
if (canvas.tokens.controlled.length === 0) {
    ui.notifications.warn("You must select at least one token to apply healing to!");
    return;
  }
  
  // Healing options and their roll formulas
  const HEALING_OPTIONS = {
    basic: "Basic Healing (2d8)",
    expert: "Expert Healing (2d8 + 10)",
    master: "Master Healing (2d8 + 30)",
    legendary: "Legendary Healing (2d8 + 50)"
  };
  
  // Create a dialog to select the healing roll and apply it
  new Dialog({
    title: "Healing Rolls",
    content: `
      <form>
        <div class="form-group">
          <label>Select Healing Type:</label>
          <select id="healing-selector">
            ${Object.entries(HEALING_OPTIONS).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
          </select>
        </div>
      </form>
    `,
    buttons: {
      roll: {
        label: "Apply Healing",
        callback: (html) => {
          let selectedHealing = html.find("#healing-selector").val();
  
          // Healing roll formulas
          let healingFormula;
          switch (selectedHealing) {
            case "basic":
              healingFormula = "2d8";
              break;
            case "expert":
              healingFormula = "2d8 + 10";
              break;
            case "master":
              healingFormula = "2d8 + 30";
              break;
            case "legendary":
              healingFormula = "2d8 + 50";
              break;
            default:
              ui.notifications.error("Invalid healing type selected.");
              return;
          }
  
          // Roll for each selected token
          canvas.tokens.controlled.forEach(async (token) => {
            let actor = token.actor;
  
            if (!actor) {
              ui.notifications.warn("The selected token does not have an associated actor!");
              return;
            }
  
            let healingRoll = new Roll(healingFormula);
            await healingRoll.roll({ async: true });
  
            // Format and send the chat message
            let resultMessage = `
              <h3>${HEALING_OPTIONS[selectedHealing]}</h3>
              <b>Formula:</b> ${healingFormula}<br>
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
  