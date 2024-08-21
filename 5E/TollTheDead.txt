// Toll the Dead Macro (undead2)
// This macro rolls damage for the Toll the Dead spell and displays the results with fancy formatting, flavor text, a delay, and animated dice rolls.

const flavorTexts = [
  "The plasmoid's gelatinous form trembles, emitting a haunting, resonant toll.",
  "A deep, reverberating chime echoes from within the slime, spreading dread.",
  "The amorphous mass quivers, creating a bone-chilling, ghostly knell.",
  "Waves of eerie sound pulse from the plasmoid's core, heralding impending doom.",
  "A chilling toll rings out as the slime ripples, each sound carrying a promise of death."
];

let dialogContent = `
  <form>
    <div class="form-group">
      <label>Character Level:</label>
      <select id="char-level" name="char-level">
        <option value="5">5th Level</option>
        <option value="11">11th Level</option>
        <option value="17">17th Level</option>
      </select>
    </div>
    <div class="form-group">
      <label>Is the target damaged?</label>
      <select id="is-damaged" name="is-damaged">
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </div>
    <div class="form-group">
      <p id="dice-info">Damage Dice: 2d8</p>
    </div>
  </form>
`;

const updateDiceInfo = (html) => {
  const level = parseInt(html.find('[name="char-level"]').val());
  const isDamaged = html.find('[name="is-damaged"]').val() === "yes";
  let dice = "2d8";
  if (level >= 5) dice = isDamaged ? `2d12` : `2d8`;
  if (level >= 11) dice = isDamaged ? `3d12` : `3d8`;
  if (level >= 17) dice = isDamaged ? `4d12` : `4d8`;
  html.find('#dice-info').text(`Damage Dice: ${dice}`);
};

const spellLevelDialog = new Dialog({
  title: "Toll the Dead",
  content: dialogContent,
  buttons: {
    roll: {
      icon: "<i class='fas fa-bell'></i>",
      label: "Cast",
      callback: async (html) => {
        const level = parseInt(html.find('[name="char-level"]').val());
        const isDamaged = html.find('[name="is-damaged"]').val() === "yes";
        let dice = "2d8";
        if (level >= 5) dice = isDamaged ? `2d12` : `2d8`;
        if (level >= 11) dice = isDamaged ? `3d12` : `3d8`;
        if (level >= 17) dice = isDamaged ? `4d12` : `4d8`;
        const damageRoll = new Roll(dice);
        await damageRoll.evaluate({async: true});

        // Display dice animation
        if (game.dice3d) {
          await game.dice3d.showForRoll(damageRoll);
        }

        // Select random flavor text
        const flavorText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

        // Create the chat message after a delay
        setTimeout(() => {
          const rollParts = damageRoll.terms[0].results.map(result => result.result).join(' + ');
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `
              <div class="toll-the-dead">
                <h2>Toll the Dead</h2>
                <p class="flavor-text"><i>${flavorText}</i></p>
                <div class="damage-roll">
                  <b>Damage:</b> 
                  <span class="damage">${rollParts} = ${damageRoll.total}</span>
                </div>
              </div>
              <style>
                .toll-the-dead {
                  font-family: 'Arial', sans-serif;
                  border: 2px solid #555555;
                  background: #e6e6e6;
                  padding: 10px;
                  border-radius: 10px;
                  box-shadow: 0 0 10px #555555;
                }
                .toll-the-dead h2 {
                  color: #555555;
                  text-align: center;
                  margin: 0;
                }
                .flavor-text {
                  text-align: center;
                  color: #555;
                  margin: 10px 0;
                  font-style: italic;
                }
                .damage-roll {
                  font-size: 1.2em;
                  text-align: center;
                  margin-top: 10px;
                }
                .damage {
                  color: #ff4500;
                }
              </style>
            `
          });
        }, 1000);  // 1 second delay before showing the chat message
      }
    },
    cancel: {
      icon: "<i class='fas fa-times'></i>",
      label: "Cancel"
    }
  },
  default: "roll",
  render: (html) => {
    html.find('[name="char-level"], [name="is-damaged"]').on('change', () => updateDiceInfo(html));
    // Set the default character level to 5th
    html.find('[name="char-level"]').val("5");
    updateDiceInfo(html);
  },
  close: () => {}
});

spellLevelDialog.render(true);
