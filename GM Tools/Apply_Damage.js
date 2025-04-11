// Apply Damage to Selected Token
// Prompts for a damage amount and type, applies it to the selected token.

if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn("Please select exactly one token.");
    return;
  }
  
  const token = canvas.tokens.controlled[0];
  const actor = token.actor;
  
  new Dialog({
    title: "Apply Damage",
    content: `
      <form>
        <div class="form-group">
          <label>Damage Amount:</label>
          <input type="number" id="dmg-amount" name="dmg-amount" value="0" min="0" step="1"/>
        </div>
        <div class="form-group">
          <label>Damage Type:</label>
          <select id="dmg-type" name="dmg-type">
            <option value="bludgeoning">Bludgeoning</option>
            <option value="piercing">Piercing</option>
            <option value="slashing">Slashing</option>
            <option value="fire">Fire</option>
            <option value="cold">Cold</option>
            <option value="acid">Acid</option>
            <option value="poison">Poison</option>
            <option value="necrotic">Necrotic</option>
            <option value="radiant">Radiant</option>
            <option value="psychic">Psychic</option>
            <option value="force">Force</option>
            <option value="thunder">Thunder</option>
            <option value="lightning">Lightning</option>
          </select>
        </div>
      </form>
    `,
    buttons: {
      apply: {
        label: "Apply",
        callback: async (html) => {
          const baseAmount = parseInt(html.find('[name="dmg-amount"]').val());
          const type = html.find('[name="dmg-type"]').val();
  
          if (isNaN(baseAmount) || baseAmount <= 0) {
            ui.notifications.error("Please enter a valid damage amount.");
            return;
          }
  
          let finalDamage = baseAmount;
          const damageType = type.toLowerCase();
          let notes = "";
  
          const traitList = (trait) => {
            if (!trait) return [];
            if (Array.isArray(trait)) return trait.map(t => t.toLowerCase());
            if (Array.isArray(trait.value)) return trait.value.map(t => t.toLowerCase());
            return [];
          };
  
          const resistances = traitList(actor.system.traits.dr);
          const immunities = traitList(actor.system.traits.di);
          const vulnerabilities = traitList(actor.system.traits.dv);
  
          if (immunities.includes(damageType)) {
            finalDamage = 0;
            notes = "(immune)";
          } else {
            if (resistances.includes(damageType)) {
              finalDamage = Math.floor(finalDamage / 2);
              notes += "(resisted) ";
            }
            if (vulnerabilities.includes(damageType)) {
              finalDamage *= 2;
              notes += "(vulnerable)";
            }
          }
  
          const hpPath = "system.attributes.hp.value";
          const currentHP = getProperty(actor, hpPath);
  
          if (typeof currentHP !== "number") {
            ui.notifications.error("Could not determine current HP.");
            return;
          }
  
          const newHP = Math.max(currentHP - finalDamage, 0);
  
          await actor.update({ [hpPath]: newHP });
  
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ token: token }),
            content: `<b>${token.name}</b> takes <b>${finalDamage}</b> ${type} damage ${notes.trim()}.<br>HP: ${currentHP} → ${newHP}`
          });
        }
      },
      cancel: {
        label: "Cancel"
      }
    },
    default: "apply"
  }).render(true);