// Skill Check Macro for Foundry VTT v12 (PF2E v6.8.4)

// Ensure at least one token is selected
if (canvas.tokens.controlled.length === 0) {
  ui.notifications.warn("You must select at least one token to roll for!");
  return;
}

// Get the first selected token
let token = canvas.tokens.controlled[0];
let actor = token.actor;

if (!actor) {
  ui.notifications.warn("The selected token does not have an associated actor!");
  return;
}

// Dynamically load available skills from the actor
let skills = actor.system.skills;
if (!skills) {
  ui.notifications.warn("This actor does not have any skills!");
  return;
}

// Create a skill list for the dropdown
let skillOptions = Object.entries(skills).map(([key, skill]) => ({
  key: key,
  label: game.i18n.localize(skill.label || skill.name) || key, // Localize or use fallback
  modifier: skill.totalModifier,
  proficiency: skill.rank
}));

// Roll Modes
const ROLL_MODES = {
  roll: "Public Roll",
  gmroll: "Private GM Roll",
  blindroll: "Blind GM Roll",
  selfroll: "Self Roll"
};

// Fortune/Misfortune Options
const FORTUNE_OPTIONS = {
  normal: "Normal",
  fortune: "Fortune",
  misfortune: "Misfortune"
};

// Proficiency Levels Mapping
const PROFICIENCY_LEVELS = ["Untrained", "Trained", "Expert", "Master", "Legendary"];

// Create the skill selection dialog
new Dialog({
  title: "Skill Check",
  content: `
    <form>
      <div class="form-group">
        <label>Select Skill:</label>
        <select id="skill-selector">
          ${skillOptions.map(skill => `<option value="${skill.key}">${skill.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Modifier:</label>
        <p id="skill-modifier-text">Select a skill to view its modifier.</p>
      </div>
      <div class="form-group">
        <label>Proficiency Level:</label>
        <p id="proficiency-level-text">Select a skill to view proficiency level.</p>
      </div>
      <div class="form-group">
        <label>Bonus Modifier:</label>
        <input type="number" id="bonus-modifier" value="0" />
      </div>
      <div class="form-group">
        <label>Roll Mode:</label>
        <select id="roll-mode-selector">
          ${Object.entries(ROLL_MODES).map(([key, value]) => `<option value="${key}">${value}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Fortune/Misfortune:</label>
        <select id="fortune-selector">
          ${Object.entries(FORTUNE_OPTIONS).map(([key, value]) => `<option value="${key}">${value}</option>`).join("")}
        </select>
      </div>
    </form>
  `,
  buttons: {
    roll: {
      label: "Roll",
      callback: async (html) => {
        // Get user selections
        let selectedSkillKey = html.find("#skill-selector").val();
        let rollMode = html.find("#roll-mode-selector").val();
        let fortuneOption = html.find("#fortune-selector").val();
        let bonusModifier = parseInt(html.find("#bonus-modifier").val()) || 0;

        // Get the selected skill data
        let skill = skills[selectedSkillKey];
        if (!skill) {
          ui.notifications.warn("This actor does not have the selected skill!");
          return;
        }

        // Determine the roll formula based on Fortune/Misfortune
        let rollFormula = "1d20";
        if (fortuneOption === "fortune") rollFormula = "2d20kh1";
        if (fortuneOption === "misfortune") rollFormula = "2d20kl1";
        rollFormula += ` + ${skill.totalModifier} + ${bonusModifier}`;

        // Create and evaluate the roll
        let roll = new Roll(rollFormula);
        await roll.roll({ async: true });

        // Ensure the roll is evaluated
        if (!roll._evaluated) {
          roll = await roll.evaluate({ async: true });
        }

        // Send the roll to chat with the selected roll mode
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token: token }),
          flavor: `
            <h3>Skill Check: ${skill.label}</h3>
            <b>Proficiency:</b> ${PROFICIENCY_LEVELS[skill.rank]}<br>
            <b>Modifier:</b> ${skill.totalModifier >= 0 ? `+${skill.totalModifier}` : skill.totalModifier}<br>
            <b>Bonus:</b> ${bonusModifier >= 0 ? `+${bonusModifier}` : bonusModifier}<br>
            <b>Fortune:</b> ${FORTUNE_OPTIONS[fortuneOption]}<br>
            <b>Result:</b> ${roll.total}
          `,
          user: game.userId,
          rollMode: rollMode // Explicitly apply the roll mode
        }, { rollMode: rollMode }); // Ensure rollMode overrides defaults
      }
    }
  },
  default: "roll",
  render: (html) => {
    // Update skill modifier and proficiency dynamically
    let skillSelector = html.find("#skill-selector");
    let skillModifierText = html.find("#skill-modifier-text");
    let proficiencyLevelText = html.find("#proficiency-level-text");

    skillSelector.change(() => {
      let selectedSkillKey = skillSelector.val();
      let skill = skills[selectedSkillKey];
      if (skill) {
        let modifier = skill.totalModifier >= 0 ? `+${skill.totalModifier}` : `${skill.totalModifier}`;
        skillModifierText.text(`${modifier}`);
        proficiencyLevelText.text(`${PROFICIENCY_LEVELS[skill.rank]}`);
      } else {
        skillModifierText.text("Select a skill to see modifier");
        proficiencyLevelText.text("Select a skill to see proficiency");
      }
    });

    // Initialize with the first skill's values
    skillSelector.trigger("change");
  }
}).render(true);