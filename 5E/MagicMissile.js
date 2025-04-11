// Magic Missile Macro (undead7)
// This macro rolls damage for each Magic Missile dart and displays the results individually with a fancy format, flavor text, and a delay.

const flavorTexts = [
  "The slime extends a pseudopod, lashing out at its target.",
  "A glob of the plasmoid's body launches forward, splattering on impact.",
  "The amorphous mass reshapes and hurls a blob of acidic goo.",
  "Tendrils of the slime whip through the air, striking their mark.",
  "The plasmoid's body ripples as it projects a viscous glob at its foe."
];

const spellLevelDialog = new Dialog({
  title: "Magic Missile Spell Level",
  content: `
    <form>
      <div class="form-group">
        <label>Spell Level:</label>
        <select id="spell-level" name="spell-level">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </select>
      </div>
    </form>
  `,
  buttons: {
    roll: {
      icon: "<i class='fas fa-magic'></i>",
      label: "Cast",
      callback: async (html) => {
        const level = parseInt(html.find('[name="spell-level"]').val());
        if (isNaN(level) || level < 1) {
          ui.notifications.error("Spell level must be at least 1.");
          return;
        }

        const numMissiles = 3 + (level - 1);
        const damageRoll = new Roll(`${numMissiles}d4 + ${numMissiles}`);
        await damageRoll.evaluate({async: true});

        // Display dice animation
        if (game.dice3d) {
          await game.dice3d.showForRoll(damageRoll);
        }

        let damageResults = damageRoll.terms[0].results.map(result => result.result);
        let individualDartsHtml = damageResults.map((result, i) => `<div class="dart"><b>Dart ${i + 1}:</b> <span class="damage">${result} + 1 = ${result + 1}</span></div>`).join('');

        // Select random flavor text
        const flavorText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

        // Display total damage in chat with fancy formatting after a delay
        const totalDamage = damageResults.reduce((a, b) => a + b, 0) + numMissiles;
        setTimeout(() => {
          ChatMessage.create({
            content: `
              <div class="magic-missile">
                <h2>Magic Missile</h2>
                <p class="flavor-text"><i>${flavorText}</i></p>
                <div class="darts">${individualDartsHtml}</div>
                <div class="total-damage"><b>Total Damage:</b> <span class="damage"><b>${totalDamage}</b></span></div>
              </div>
              <style>
                .magic-missile {
                  font-family: 'Arial', sans-serif;
                  border: 2px solid #8b00ff;
                  background: #e0b3ff;
                  padding: 10px;
                  border-radius: 10px;
                  box-shadow: 0 0 10px #8b00ff;
                }
                .magic-missile h2 {
                  color: #8b00ff;
                  text-align: center;
                  margin: 0;
                }
                .flavor-text {
                  text-align: center;
                  color: #555;
                  margin: 10px 0;
                  font-style: italic;
                }
                .darts {
                  margin-top: 10px;
                  margin-bottom: 10px;
                }
                .dart {
                  font-size: 1.2em;
                  margin: 5px 0;
                }
                .damage {
                  color: #ff4500;
                }
                .total-damage {
                  font-size: 1.5em;
                  text-align: center;
                  margin-top: 10px;
                }
              </style>
            `,
            speaker: ChatMessage.getSpeaker(),
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
  close: () => {}
});

spellLevelDialog.render(true);
