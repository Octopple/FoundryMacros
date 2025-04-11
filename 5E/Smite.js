// Paladin Smite Macro (paladin10)
// This macro handles various Paladin smite spells, including Divine Smite, Searing Smite, Thunderous Smite, Wrathful Smite, and Branding Smite.

if (canvas.tokens.controlled.length !== 1) {
  ui.notifications.warn("Please select exactly one token.");
  return;
}

// Get the selected token and actor
const token = canvas.tokens.controlled[0];
const actor = token.actor;

// Ensure the selected token has valid melee weapon attacks
if (!actor || !actor.items.some(i => i.type === 'weapon')) {
  ui.notifications.warn("Selected token has no valid melee weapon attacks.");
  return;
}

// Calculate the spell save DC for the Paladin
const proficiencyBonus = actor.system.attributes.prof;
const abilityMod = actor.system.abilities.cha.mod;  // Assuming Charisma is the spellcasting ability
const spellSaveDC = 8 + proficiencyBonus + abilityMod;

// Build the dialog content with smite descriptions
let dialogContent = `
  <form>
    <div class="form-group">
      <label>Select Smite Type:</label>
      <select id="smite-type" name="smite-type">
        <option value="divine">Divine Smite</option>
        <option value="searing">Searing Smite</option>
        <option value="thunderous">Thunderous Smite</option>
        <option value="wrathful">Wrathful Smite</option>
        <option value="branding">Branding Smite</option>
      </select>
    </div>
    <div id="smite-description" style="margin-bottom: 10px;">
      <b>Divine Smite:</b> Deals radiant damage on a melee weapon hit. 2d8 base + 1d8 per spell level above 1st. Extra 1d8 vs undead/fiends.
    </div>
    <div class="form-group">
      <label>Select Spell Slot Level:</label>
      <select id="spell-slot-level" name="spell-slot-level">
        <option value="1">1st Level</option>
        <option value="2">2nd Level</option>
        <option value="3">3rd Level</option>
        <option value="4">4th Level</option>
        <option value="5">5th Level</option>
      </select>
    </div>
    <div class="form-group">
      <label>Is target undead or fiend?</label>
      <input type="checkbox" id="undead-fiend" name="undead-fiend">
    </div>
  </form>
`;

new Dialog({
  title: "Paladin Smite",
  content: dialogContent,
  buttons: {
    smite: {
      icon: "<i class='fas fa-hammer'></i>",
      label: "Smite!",
      callback: async (html) => {
        const smiteType = html.find('[name="smite-type"]').val();
        const spellSlotLevel = parseInt(html.find('[name="spell-slot-level"]').val());
        const isUndeadOrFiend = html.find('[name="undead-fiend"]').is(':checked');

        let rollFormula, smiteName, damageType, flavorText, saveInfo = "";

        switch (smiteType) {
          case "divine":
            smiteName = "Divine Smite";
            flavorText = "The divine power surges through your weapon, striking with radiant force.";
            let smiteDice = 2 + (spellSlotLevel - 1);  // 2d8 +1d8 per spell level
            if (isUndeadOrFiend) smiteDice += 1;
            rollFormula = `${smiteDice}d8[radiant]`;
            damageType = "radiant";
            break;

          case "searing":
            smiteName = "Searing Smite";
            flavorText = "Flames erupt from your weapon, searing your target with burning fury.";
            rollFormula = `${spellSlotLevel}d6[fire]`;
            damageType = "fire";
            break;

          case "thunderous":
            smiteName = "Thunderous Smite";
            flavorText = "A thunderous roar echoes as your weapon strikes, shaking the very ground.";
            rollFormula = `${spellSlotLevel}d6[thunder]`;
            damageType = "thunder";
            saveInfo = `The target must make a Strength saving throw (DC ${spellSaveDC}) or be knocked prone.`;
            break;

          case "wrathful":
            smiteName = "Wrathful Smite";
            flavorText = "Your weapon strikes with psychic force, filling your target with dread.";
            rollFormula = `1d6[psychic]`;  // Wrathful Smite always does 1d6 psychic
            damageType = "psychic";
            saveInfo = `The target must make a Wisdom saving throw (DC ${spellSaveDC}) or become frightened.`;
            break;

          case "branding":
            smiteName = "Branding Smite";
            flavorText = "Your weapon flares with radiance, marking your foe with glowing energy.";
            rollFormula = `${spellSlotLevel}d6[radiant]`;
            damageType = "radiant";
            saveInfo = `The target becomes visible if invisible and cannot become invisible for the duration.`;
            break;

          default:
            ui.notifications.error("Invalid smite type selected.");
            return;
        }

        // Roll the smite damage
        const roll = new Roll(rollFormula);
        await roll.evaluate({ async: true });

        // Show the dice roll if "Dice So Nice!" is enabled
        game.dice3d?.showForRoll(roll);

        // Create a chat message with the formatted results
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ token }),
          content: `
            <div class="smite-message">
              <h2>${smiteName}</h2>
              <p><i>${flavorText}</i></p>
              <p><b>Spell Slot Level:</b> ${spellSlotLevel}th-level</p>
              <p><b>Damage:</b> ${roll.total} (${damageType})</p>
              ${saveInfo ? `<p><b>Effect:</b> ${saveInfo}</p>` : ""}
            </div>
            <style>
              .smite-message {
                border: 1px solid #8b4513;
                padding: 10px;
                border-radius: 5px;
                background-color: #f4f4e1;
                text-align: center;
              }
              .smite-message h2 {
                margin: 0;
                color: #8b4513;
              }
            </style>
          `,
        });
      }
    },
    cancel: {
      icon: "<i class='fas fa-times'></i>",
      label: "Cancel"
    }
  },
  default: "smite",
  render: (html) => {
    // Show smite descriptions and update based on the smite type selected
    html.find('[name="smite-type"]').change(function() {
      const smiteType = this.value;
      const descriptionElement = html.find('#smite-description');

      switch (smiteType) {
        case "divine":
          descriptionElement.html(`<b>Divine Smite:</b> Deals radiant damage on a melee weapon hit. 2d8 base + 1d8 per spell level above 1st. Extra 1d8 vs undead/fiends.`);
          break;

        case "searing":
          descriptionElement.html(`<b>Searing Smite:</b> Deals fire damage on a melee weapon hit. Adds fire damage equal to spell level in d6s.`);
          break;

        case "thunderous":
          descriptionElement.html(`<b>Thunderous Smite:</b> Deals thunder damage on a melee weapon hit. Adds thunder damage equal to spell level in d6s. Knocks target prone if failed save.`);
          break;

        case "wrathful":
          descriptionElement.html(`<b>Wrathful Smite:</b> Deals 1d6 psychic damage on a melee weapon hit. Frightens the target if failed save.`);
          break;

        case "branding":
          descriptionElement.html(`<b>Branding Smite:</b> Deals radiant damage and reveals invisible targets, preventing them from becoming invisible again.`);
          break;

        default:
          descriptionElement.html("");
          break;
      }
    });
  },
}).render(true);