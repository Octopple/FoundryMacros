// Custom Multiattack Macro (undead9) (Working v11)
// This macro allows a token to perform multiple attacks and manually calculates attack and damage rolls.

if (canvas.tokens.controlled.length !== 1) {
  ui.notifications.warn("Please select exactly one token.");
  return;
}

const selectedToken = canvas.tokens.controlled[0];
const actor = selectedToken.actor;

// Get the list of weapon items from the actor
const weaponItems = actor.items.filter(i => i.type === "weapon");
if (weaponItems.length === 0) {
  ui.notifications.warn("This token has no valid weapons available.");
  return;
}

// Build the dialog content
const dialogContent = `
  <form>
    <div class="form-group">
      <label>Choose Weapon:</label>
      <select id="weapon-choice" name="weapon-choice">
        ${weaponItems.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Number of Attacks:</label>
      <input type="number" id="attack-count" name="attack-count" value="2" min="1" max="10" autofocus>
    </div>
    <div class="form-group">
      <label>Weapon Modifier:</label>
      <select id="weapon-modifier" name="weapon-modifier">
        ${[0, 1, 2, 3, 4, 5].map(val => `<option value="${val}" ${val === 2 ? "selected" : ""}>+${val}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Roll with:</label>
      <select id="adv-disadv" name="adv-disadv">
        <option value="normal">Normal</option>
        <option value="advantage">Advantage</option>
        <option value="disadvantage">Disadvantage</option>
      </select>
    </div>
  </form>
`;

new Dialog({
  title: "Multiattack",
  content: dialogContent,
  buttons: {
    roll: {
      icon: "<i class='fas fa-dice'></i>",
      label: "Roll Attacks",
      callback: async (html) => {
        const weaponId = html.find('[name="weapon-choice"]').val();
        const attackCount = parseInt(html.find('[name="attack-count"]').val());
        const weaponModifier = parseInt(html.find('[name="weapon-modifier"]').val());
        const rollMode = html.find('[name="adv-disadv"]').val();
        const weapon = actor.items.get(weaponId);

        if (!weapon) {
          ui.notifications.error("The selected weapon is invalid.");
          return;
        }

        const proficiencyBonus = actor.system.attributes.prof || 0;
        const totalBonus = proficiencyBonus;  // Excluding ability modifier
        const damageParts = weapon.system.damage.parts;

        let messageContent = `<b>${selectedToken.name}</b> performs <b>${attackCount}</b> ${weapon.name} attacks!<br><br>`;

        for (let i = 0; i < attackCount; i++) {
          messageContent += `<h2>Attack ${i + 1}</h2>`;
          
          let attackRollFormula = rollMode === "advantage" ? "2d20kh" :
                                  rollMode === "disadvantage" ? "2d20kl" : "1d20";
          let attackRoll = new Roll(attackRollFormula);
          await attackRoll.evaluate({async: true});
          game.dice3d?.showForRoll(attackRoll); // Removed await to reduce delay

          let keptRoll = rollMode === "advantage" ? Math.max(...attackRoll.terms[0].results.map(r => r.result)) :
                          rollMode === "disadvantage" ? Math.min(...attackRoll.terms[0].results.map(r => r.result)) : 
                          attackRoll.total;
          let isCritical = keptRoll === 20;

          let rollDisplay = rollMode !== "normal" ? ` (${attackRoll.terms[0].results.map(r => r.result).join(' vs ')})` : "";
          let rollColor = rollMode === "advantage" ? "color:green;" : rollMode === "disadvantage" ? "color:red;" : "";
          messageContent += `<b>${rollMode.charAt(0).toUpperCase() + rollMode.slice(1)} Roll:</b> <span style="${rollColor}">${keptRoll}</span>${rollDisplay}<br>`;

          let attackTotal = keptRoll + totalBonus + weaponModifier;
          let attackRollDisplay = `${keptRoll}${totalBonus !== 0 ? ` + ${totalBonus}` : ""}${weaponModifier !== 0 ? ` + ${weaponModifier}` : ""}`;
          messageContent += `&nbsp;&nbsp;&nbsp;&nbsp;<b>Total Attack Roll:</b> ${attackRollDisplay} = ${attackTotal}<br>`;

          for (let part of damageParts) {
            let damageFormula = isCritical ? `${part[0]} + ${part[0]}` : part[0];
            let damageRoll = new Roll(damageFormula);
            await damageRoll.evaluate({async: true});
            game.dice3d?.showForRoll(damageRoll); // Removed await to reduce delay

            let damageTotal = damageRoll.total + weaponModifier;

            let rolledDice = damageRoll.terms
              .filter(term => term instanceof Die)
              .map(term => term.results.map(r => r.result).join(' + '))
              .join(' + ');

            let damageRollDisplay = rolledDice;
            if (weaponModifier !== 0) damageRollDisplay += ` + ${weaponModifier}`;
            messageContent += `&nbsp;&nbsp;&nbsp;&nbsp;<b>Damage ${part[1]}:</b> (${damageRollDisplay}) = ${damageTotal} <b>(${part[1]})</b><br>`;
          }

          messageContent += `<br>`;
        }

        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ token: selectedToken.document }),
          content: messageContent
        });
      }
    },
    cancel: {
      icon: "<i class='fas fa-times'></i>",
      label: "Cancel"
    }
  },
  default: "roll",
  close: () => {}
}).render(true);
