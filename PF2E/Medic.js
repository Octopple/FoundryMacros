// Updated Medic Macro for Foundry VTT v12 (PF2E v6.8.4)

// Ensure at least one token is selected
if (canvas.tokens.controlled.length === 0) {
    ui.notifications.warn("You must select at least one token to perform medicine actions on!");
    return;
  }
  
  // Roll Modes
  const ROLL_MODES = {
    roll: "Public Roll",
    gmroll: "Private GM Roll",
    blindroll: "Blind GM Roll",
    selfroll: "Self Roll"
  };
  
  // Medicine Actions
  const MEDICINE_ACTIONS = {
    wounds: "Treat Wounds",
    disease: "Treat Disease",
    poison: "Treat Poison",
    firstaid: "Administer First Aid",
    stabilize: "Stabilize"
  };
  
  // Descriptions for each action
  const ACTION_DESCRIPTIONS = {
    wounds: "Attempt to heal damage by treating wounds. Higher DC results in increased healing.",
    disease: "Treat a disease, granting a bonus to the patient's next saving throw.",
    poison: "Treat a poison, granting a bonus to the patient's next saving throw.",
    firstaid: "Administer first aid to stop bleeding or stabilize a creature (DC 15).",
    stabilize: "Attempt to stabilize a dying creature (DC 15)."
  };
  
  // Treat Wounds DC options
  const TREAT_WOUNDS_DCS = {
    15: "Standard (DC 15, Heals 2d8)",
    20: "Expert (DC 20, Heals 2d8 + 10)",
    30: "Master (DC 30, Heals 2d8 + 30)",
    40: "Legendary (DC 40, Heals 2d8 + 50)"
  };
  
  // Treat Disease/Poison options
  const TREAT_DISEASE_POISON_DCS = {
    15: "Moderate (DC 15)",
    20: "Severe (DC 20)",
    25: "Critical (DC 25)"
  };
  
  // Fixed DC for First Aid and Stabilize
  const FIXED_DC = 15;
  
  // Create the dialog for selecting medicine actions
  new Dialog({
    title: "Medicine Actions",
    content: `
      <form>
        <div class="form-group">
          <label>Select Medicine Action:</label>
          <select id="medicine-action-selector">
            ${Object.entries(MEDICINE_ACTIONS).map(([key, value]) => `<option value="${key}">${value}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Description:</label>
          <p id="action-description">Select an action to see its description.</p>
        </div>
        <div class="form-group" id="dc-container">
          <label>Select DC:</label>
          <select id="dc-selector"></select>
        </div>
        <div class="form-group">
          <label>Roll Mode:</label>
          <select id="roll-mode-selector">
            ${Object.entries(ROLL_MODES).map(([key, value]) => `<option value="${key}">${value}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Bonus Modifier:</label>
          <input type="number" id="bonus-modifier" value="0" />
        </div>
        <div class="form-group">
          <label>Use Assurance? (Automatic Success):</label>
          <input type="checkbox" id="assurance-check" />
        </div>
      </form>
    `,
    buttons: {
      roll: {
        label: "Perform Action",
        callback: async (html) => {
          let action = html.find("#medicine-action-selector").val();
          let dc = parseInt(html.find("#dc-selector").val());
          let rollMode = html.find("#roll-mode-selector").val();
          let bonusModifier = parseInt(html.find("#bonus-modifier").val()) || 0;
          let useAssurance = html.find("#assurance-check").is(":checked");
  
          canvas.tokens.controlled.forEach((token) => {
            let actor = token.actor;
  
            if (!actor) {
              ui.notifications.warn("Selected token does not have an associated actor.");
              return;
            }
  
            // Retrieve the Medicine skill dynamically
            const skills = actor?.system?.skills;
            if (!skills) {
              ui.notifications.warn(`${actor.name} does not have skills defined.`);
              return;
            }
  
            const medicineSkill = Object.values(skills).find(skill => skill.label === "Medicine");
            if (!medicineSkill) {
              ui.notifications.warn(`${actor.name} does not have the Medicine skill.`);
              return;
            }
  
            if (useAssurance) {
              handleAssurance(actor, medicineSkill, dc, rollMode, action);
            } else {
              rollSkill(actor, medicineSkill, dc, rollMode, action, bonusModifier);
            }
          });
        }
      }
    },
    default: "roll",
    render: (html) => {
      const actionSelector = html.find("#medicine-action-selector");
      const descriptionElement = html.find("#action-description");
      const dcSelector = html.find("#dc-selector");
  
      actionSelector.change(() => {
        const selectedAction = actionSelector.val();
        descriptionElement.text(ACTION_DESCRIPTIONS[selectedAction]);
  
        let dcOptions = {};
        if (selectedAction === "wounds") {
          dcOptions = TREAT_WOUNDS_DCS;
        } else if (["disease", "poison"].includes(selectedAction)) {
          dcOptions = TREAT_DISEASE_POISON_DCS;
        } else {
          dcOptions = { 15: "Fixed DC 15" };
        }
  
        dcSelector.empty();
        Object.entries(dcOptions).forEach(([key, value]) => {
          dcSelector.append(`<option value="${key}">${value}</option>`);
        });
      });
  
      actionSelector.trigger("change");
    }
  }).render(true);
  
  function rollSkill(actor, skill, dc, rollMode, action, bonusModifier) {
    let rollFormula = `1d20 + ${skill.totalModifier} + ${bonusModifier}`;
    let roll = new Roll(rollFormula);
    roll.roll({ async: true }).then((result) => {
      const success = result.total >= dc;
      const message = `
        <h3>${MEDICINE_ACTIONS[action]}</h3>
        <b>DC:</b> ${dc} | <b>Roll:</b> ${result.result} = ${result.total}<br>
        ${success ? "Success!" : "Failure!"}
      `;
      result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: message,
        user: game.userId,
        rollMode: rollMode // Explicitly apply roll mode
      }, { rollMode: rollMode });
    });
  }
  
  function handleAssurance(actor, skill, dc, rollMode, action) {
    const assuranceValue = skill.totalModifier + 10;
    const success = assuranceValue >= dc;
    const message = `
      <h3>${MEDICINE_ACTIONS[action]} (Assurance)</h3>
      <b>DC:</b> ${dc} | <b>Result:</b> ${assuranceValue}<br>
      ${success ? "Success!" : "Failure!"}
    `;
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: message,
      user: game.userId,
      whisper: game.users.filter((user) => user.isGM).map((user) => user.id),
      rollMode: rollMode // Explicitly apply roll mode
    });
  }
  