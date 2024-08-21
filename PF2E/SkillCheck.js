// Ensure at least one token is selected
if (canvas.tokens.controlled.length === 0) {
  ui.notifications.warn("You must select at least one token to roll for!");
  return;
}

// List of available skills with their system keys
let skills = {
  "acr": "Acrobatics",
  "arc": "Arcana",
  "ath": "Athletics",
  "cra": "Crafting",
  "dec": "Deception",
  "dip": "Diplomacy",
  "itm": "Intimidation",
  "med": "Medicine",
  "nat": "Nature",
  "occ": "Occultism",
  "prf": "Performance",
  "rel": "Religion",
  "soc": "Society",
  "ste": "Stealth",
  "sur": "Survival",
  "thi": "Thievery"
};

// Roll Modes
const rollModes = {
  "roll": "Public Roll",
  "gmroll": "Private GM Roll",
  "blindroll": "Blind GM Roll",
  "selfroll": "Self Roll"
};

// Fortune/Misfortune Options
const fortuneOptions = {
  "normal": "Normal",
  "fortune": "Fortune",
  "misfortune": "Misfortune"
};

// Proficiency Levels Mapping
const proficiencyLevels = {
  0: "Untrained",
  1: "Trained",
  2: "Expert",
  3: "Master",
  4: "Legendary"
};

// Create a dialog to select a skill, display modifier, proficiency, roll mode, and fortune/misfortune
new Dialog({
  title: "Skill Check",
  content: `
    <form>
      <div class="form-group">
        <label>Select a skill:</label>
        <select id="skill-selector">
          ${Object.entries(skills).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Modifier:</label>
        <p id="skill-modifier-text">Select a skill to see modifier</p>
      </div>
      <div class="form-group">
        <label>Proficiency Level:</label>
        <p id="proficiency-level-text">Select a skill to see proficiency</p>
      </div>
      <div class="form-group">
        <label>Select Roll Mode:</label>
        <select id="roll-mode-selector">
          ${Object.entries(rollModes).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Fortune/Misfortune:</label>
        <select id="fortune-selector">
          ${Object.entries(fortuneOptions).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
        </select>
      </div>
    </form>
  `,
  buttons: {
    roll: {
      label: "Roll",
      callback: (html) => {
        // Get the selected skill, roll mode, and fortune/misfortune
        let selectedSkillKey = html.find("#skill-selector").val();
        let selectedSkillName = skills[selectedSkillKey];
        let rollMode = html.find("#roll-mode-selector").val();
        let fortuneOption = html.find("#fortune-selector").val();

        // Roll for each selected token
        canvas.tokens.controlled.forEach(token => {
          let actor = token.actor;

          if (!actor) {
            ui.notifications.warn("The selected token does not have an associated actor!");
            return;
          }

          // Check if the actor has the selected skill
          let skill = actor.system.skills[selectedSkillKey];
          if (!skill) {
            ui.notifications.warn(`${actor.name} does not have the ${selectedSkillName} skill.`);
            return;
          }

          // Create Roll logic for Fortune/Misfortune
          let roll;
          if (fortuneOption === "normal") {
            roll = new Roll("1d20 + @mod", { mod: skill.totalModifier });
          } else if (fortuneOption === "fortune") {
            roll = new Roll("2d20kh + @mod", { mod: skill.totalModifier });  // Keep the highest roll (Fortune)
          } else if (fortuneOption === "misfortune") {
            roll = new Roll("2d20kl + @mod", { mod: skill.totalModifier });  // Keep the lowest roll (Misfortune)
          }

          // Send the roll to chat with the selected roll mode
          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: token }),
            flavor: `Skill Check: ${selectedSkillName} (${fortuneOptions[fortuneOption]})`,
            user: game.userId,
            rollMode: rollMode // This sets the correct roll mode
          }, {
            rollMode: rollMode  // Ensure the correct roll mode is passed to the chat
          });
        });
      }
    }
  },
  default: "roll",
  render: (html) => {
    // Update the modifier and proficiency level when a skill is selected
    let skillSelector = html.find("#skill-selector");
    let skillModifierText = html.find("#skill-modifier-text");
    let proficiencyLevelText = html.find("#proficiency-level-text");

    function updateSkillInfo() {
      let selectedSkillKey = skillSelector.val();
      canvas.tokens.controlled.forEach(token => {
        let actor = token.actor;
        let skill = actor?.system.skills[selectedSkillKey];
        if (skill) {
          let modifier = skill.totalModifier >= 0 ? `+${skill.totalModifier}` : `${skill.totalModifier}`;
          skillModifierText.text(`${modifier}`);

          // Display proficiency level using the custom proficiencyLevels mapping
          const proficiencyLevel = proficiencyLevels[skill.rank] || "Untrained";
          proficiencyLevelText.text(`${proficiencyLevel}`);
        } else {
          skillModifierText.text("Select a skill to see modifier");
          proficiencyLevelText.text("Select a skill to see proficiency");
        }
      });
    }

    // Update the skill info when the dropdown changes
    skillSelector.change(updateSkillInfo);

    // Initialize with the first skill's modifier
    updateSkillInfo();
  }
}).render(true);