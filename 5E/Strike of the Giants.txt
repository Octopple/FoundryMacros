// Register a setting to store the last selected ability modifier choice for Storm Strike
game.settings.register("strike-of-giants", "lastAbilityMod", {
  name: "Last Ability Modifier",
  scope: "client",
  config: false,
  type: String,
  default: "strength"
});

// Strike of the Giants Macro (paladin3)
// This macro handles various effects from Strike of the Giants runes, including Hill, Frost, Fire, Cloud, Storm, and Stone.

if (canvas.tokens.controlled.length !== 1) {
  ui.notifications.warn("Please select exactly one token.");
  return;
}

// Get the selected token and actor
const token = canvas.tokens.controlled[0];
const actor = token.actor;

// Alphabetical list of Strikes
const runes = [
  { value: "cloud", name: "Cloud Strike" },
  { value: "fire", name: "Fire Strike" },
  { value: "frost", name: "Frost Strike" },
  { value: "hill", name: "Hill Strike" },
  { value: "stone", name: "Stone Strike" },
  { value: "storm", name: "Storm Strike" }
];

// Build the dialog content with strike descriptions in alphabetical order
let dialogContent = `
  <form>
    <div class="form-group">
      <label>Select Strike:</label>
      <select id="rune-type" name="rune-type">
        ${runes.map(r => `<option value="${r.value}">${r.name}</option>`).join("")}
      </select>
    </div>
    <div id="rune-description" style="margin-bottom: 10px;">
      <b>Cloud Strike:</b> Deals thunder damage and may make you invisible to the target.
    </div>
  </form>
`;

// First dialog to choose the strike
new Dialog({
  title: "Strike of the Giants",
  content: dialogContent,
  buttons: {
    next: {
      icon: "<i class='fas fa-arrow-right'></i>",
      label: "Next",
      callback: async (html) => {
        const runeType = html.find('[name="rune-type"]').val();
        const actor = token.actor;

        // Handle the strikes based on selection
        let rollFormula, runeName, damageType, flavorText, saveInfo = "";
        let proficiencyBonus, dcStr, dcCon;
        
        proficiencyBonus = actor.system.attributes.prof;

        // Save DC calculation for both Strength and Constitution
        dcStr = 8 + proficiencyBonus + actor.system.abilities.str.mod;
        dcCon = 8 + proficiencyBonus + actor.system.abilities.con.mod;

        switch (runeType) {
          case "cloud":
            runeName = "Cloud Strike";
            flavorText = "Your strike warps reality, sending thunder through the air.";
            rollFormula = `1d4[thunder]`;
            damageType = "thunder";
            saveInfo = `The target must make a Wisdom saving throw (DC ${8 + proficiencyBonus + actor.system.abilities.cha.mod}) or you become invisible to it until the start of your next turn or until you make an attack or cast a spell.`;
            break;

          case "fire":
            runeName = "Fire Strike";
            flavorText = "Your weapon flares with the heat of the forge, scorching your target.";
            rollFormula = `1d10[fire]`;
            damageType = "fire";
            saveInfo = ""; // No save effect for Fire Strike
            break;

          case "frost":
            runeName = "Frost Strike";
            flavorText = "Your weapon chills the air as it strikes, freezing your target's bones.";
            rollFormula = `1d6[cold]`;
            damageType = "cold";
            saveInfo = `The target must make a Constitution saving throw (DC ${dcCon}) or its speed is reduced to 0 until the start of your next turn.`;
            break;

          case "hill":
            runeName = "Hill Strike";
            flavorText = "The might of the hill giant surges through your weapon, crushing your target.";
            const primaryWeapon = actor.items.find(i => i.type === "weapon" && i.system.equipped);
            if (!primaryWeapon) {
              ui.notifications.warn("No primary weapon equipped.");
              return;
            }
            const weaponDamageType = primaryWeapon.system.damage.parts[0][1];  // Get the primary weapon's damage type
            rollFormula = `1d6[${weaponDamageType}]`;
            damageType = weaponDamageType;
            saveInfo = `The target must make a Strength saving throw (DC ${dcStr}) or have the prone condition.`;
            break;

          case "stone":
            runeName = "Stone Strike";
            flavorText = "The force of a mountain empowers your weapon, shattering your target's defenses.";
            rollFormula = `1d6[force]`;
            damageType = "force";
            saveInfo = `The target must make a Strength saving throw (DC ${dcStr}) or be pushed 10 feet from you in a straight line.`;
            break;

          case "storm":
            runeName = "Storm Strike";
            flavorText = "Your weapon crackles with lightning, shocking your target.";
            rollFormula = `1d6[lightning]`;
            damageType = "lightning";

            // Calculate both Strength and Constitution DCs for Storm Strike
            saveInfo = `The target must make a Constitution saving throw (DC ${dcCon}) or it has disadvantage on attack rolls until the start of your next turn. Alternatively, if using Strength, the DC is ${dcStr}.`;
            break;
        }

        // Roll the strike damage
        const roll = new Roll(rollFormula);
        await roll.evaluate({ async: true });

        // Show the dice roll if "Dice So Nice!" is enabled
        game.dice3d?.showForRoll(roll);

        // Create a chat message with the formatted results
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ token }),
          content: `
            <div class="strike-message">
              <h2>${runeName}</h2>
              <p><i>${flavorText}</i></p>
              <p><b>Damage:</b> ${roll.total} (${damageType})</p>
              ${saveInfo ? `<p><b>Effect:</b> ${saveInfo}</p>` : ""}
            </div>
            <style>
              .strike-message {
                border: 1px solid #4b8dbf;
                padding: 10px;
                border-radius: 5px;
                background-color: #f4f4e1;
                text-align: center;
              }
              .strike-message h2 {
                margin: 0;
                color: #4b8dbf;
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
  default: "next",
  render: (html) => {
    // Show strike descriptions and update based on the strike type selected
    html.find('[name="rune-type"]').change(function() {
      const runeType = this.value;
      const proficiencyBonus = token.actor.system.attributes.prof;
      const dcStr = 8 + proficiencyBonus + token.actor.system.abilities.str.mod;
      const dcCon = 8 + proficiencyBonus + token.actor.system.abilities.con.mod;

      const descriptionElement = html.find('#rune-description');

      switch (runeType) {
        case "cloud":
          descriptionElement.html(`<b>Cloud Strike:</b> Deals thunder damage and may make you invisible to the target.`);
          break;

        case "fire":
          descriptionElement.html(`<b>Fire Strike:</b> Deals fire damage.`);
          break;

        case "frost":
          descriptionElement.html(`<b>Frost Strike:</b> Deals cold damage and may reduce the target's speed to 0.`);
          break;

        case "hill":
          descriptionElement.html(`<b>Hill Strike:</b> Deals extra damage that matches the weapon type and may knock the target prone.`);
          break;

        case "stone":
          descriptionElement.html(`<b>Stone Strike:</b> Deals force damage and may push the target 10 feet away.`);
          break;

        case "storm":
          descriptionElement.html(`<b>Storm Strike:</b> Deals lightning damage and may give the target disadvantage on attack rolls.`);
          break;

        default:
          descriptionElement.html("");
          break;
      }
    });
  },
}).render(true);