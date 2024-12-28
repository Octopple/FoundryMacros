// Eldritch Blast Macro with Level Dropdown and Invocation Modifiers
// Displays roll results underneath each beam's details.

if (!actor) {
  ui.notifications.warn("You must have an actor selected to use this macro.");
  return;
}

// Retrieve saved settings or set defaults
const flagKey = "eldritchBlastSettings";
let settings = actor.getFlag("world", flagKey) || {
  level: 5, // Default level
  agonizingBlast: true,
  repellingBlast: false,
  graspOfHadar: false,
  lanceOfLethargy: false
};

// Show a dialog for customization
new Dialog({
  title: "Eldritch Blast Customization",
  content: `
    <form>
      <div class="form-group">
        <label>Warlock Level:</label>
        <select id="level" name="level">
          <option value="1" ${settings.level === 1 ? "selected" : ""}>Level 1</option>
          <option value="5" ${settings.level === 5 ? "selected" : ""}>Level 5</option>
          <option value="11" ${settings.level === 11 ? "selected" : ""}>Level 11</option>
          <option value="17" ${settings.level === 17 ? "selected" : ""}>Level 17</option>
        </select>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="agonizingBlast" name="agonizingBlast" ${settings.agonizingBlast ? "checked" : ""}/> Agonizing Blast (Charisma Modifier)</label>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="repellingBlast" name="repellingBlast" ${settings.repellingBlast ? "checked" : ""}/> Repelling Blast (Push 10 feet)</label>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="graspOfHadar" name="graspOfHadar" ${settings.graspOfHadar ? "checked" : ""}/> Grasp of Hadar (Pull 10 feet)</label>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="lanceOfLethargy" name="lanceOfLethargy" ${settings.lanceOfLethargy ? "checked" : ""}/> Lance of Lethargy (Reduce Speed by 10 feet)</label>
      </div>
    </form>
  `,
  buttons: {
    roll: {
      icon: "<i class='fas fa-dice'></i>",
      label: "Roll",
      callback: async (html) => {
        // Get updated settings from the form
        const level = parseInt(html.find("#level").val());
        const agonizingBlast = html.find("#agonizingBlast").is(":checked");
        const repellingBlast = html.find("#repellingBlast").is(":checked");
        const graspOfHadar = html.find("#graspOfHadar").is(":checked");
        const lanceOfLethargy = html.find("#lanceOfLethargy").is(":checked");

        // Save settings for next time
        await actor.setFlag("world", flagKey, { level, agonizingBlast, repellingBlast, graspOfHadar, lanceOfLethargy });

        // Determine number of beams
        const numBeams = level >= 17 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1; // Adjusted to roll only once at level 1
        const charismaMod = actor.system.abilities.cha.mod; // Charisma modifier
        const damageDice = "1d10"; // Eldritch Blast base damage

        // Roll and process each beam
        let messageContent = `<h2>Eldritch Blast</h2>`;
        for (let i = 1; i <= numBeams; i++) {
          // Roll for attack
          const attackRoll = await (new Roll("1d20 + @mod", { mod: actor.system.attributes.prof + charismaMod })).evaluate({ async: true });
          const damageRoll = await (new Roll(`${damageDice} + ${agonizingBlast ? "@chaMod" : "0"}`, { chaMod: charismaMod })).evaluate({ async: true });

          // Show rolls with Dice So Nice!
          game.dice3d?.showForRoll(attackRoll);
          game.dice3d?.showForRoll(damageRoll);

          // Add beam information to the chat message
          messageContent += `
            <h3>Beam ${i}</h3>
            <b>Attack Roll:</b> ${attackRoll.total} <span style="color: gray;">(1d20 + ${charismaMod} + Proficiency)</span><br>
            <b>Damage:</b> ${damageRoll.total} Force <span style="color: gray;">(${damageDice}${agonizingBlast ? ` + ${charismaMod}` : ""})</span><br>
            ${repellingBlast ? "<b>Effect:</b> The target is pushed back 10 feet.<br>" : ""}
            ${graspOfHadar ? "<b>Effect:</b> The target is pulled 10 feet closer.<br>" : ""}
            ${lanceOfLethargy ? "<b>Effect:</b> The target's speed is reduced by 10 feet.<br>" : ""}
            <div style="margin: 10px 0; padding: 5px; border: 1px dashed #ccc; background: #f9f9f9;">
              <b>Roll Results:</b><br>
              Attack Roll: ${attackRoll.result}<br>
              Damage Roll: ${damageRoll.result}
            </div>
          `;
        }

        // Output the results in chat
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker(),
          content: `
            <div class="eldritch-blast">
              ${messageContent}
            </div>
            <style>
              .eldritch-blast h2 {
                color: #8b0000;
                text-align: center;
                margin: 0;
              }
              .eldritch-blast h3 {
                color: #4b0082;
                margin-bottom: 5px;
              }
              .eldritch-blast {
                border: 1px solid #8b0000;
                padding: 10px;
                border-radius: 5px;
                background-color: #f4f4e1;
              }
            </style>
          `
        });
      }
    },
    cancel: {
      icon: "<i class='fas fa-times'></i>",
      label: "Cancel"
    }
  },
  default: "roll"
}).render(true);