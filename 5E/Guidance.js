// Guidance Macro (undead21)
// This macro rolls a selected token's ability or skill check with the Guidance spell bonus and includes visual rolls from Dice So Nice.

let selectedTokens = canvas.tokens.controlled;

if (selectedTokens.length === 0) {
  ui.notifications.warn("Please select a token.");
  return;
}

const abilities = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma"
};

const skills = {
  acr: "Acrobatics (Dex)",
  ani: "Animal Handling (Wis)",
  arc: "Arcana (Int)",
  ath: "Athletics (Str)",
  dec: "Deception (Cha)",
  his: "History (Int)",
  ins: "Insight (Wis)",
  itm: "Intimidation (Cha)",
  inv: "Investigation (Int)",
  med: "Medicine (Wis)",
  nat: "Nature (Int)",
  prc: "Perception (Wis)",
  prf: "Performance (Cha)",
  per: "Persuasion (Cha)",
  rel: "Religion (Int)",
  sle: "Sleight of Hand (Dex)",
  ste: "Stealth (Dex)",
  sur: "Survival (Wis)"
};

const abilityOptions = Object.entries(abilities).map(([key, value]) => `<option value="ability-${key}">${value}</option>`).join("");
const skillOptions = Object.entries(skills).map(([key, value]) => `<option value="skill-${key}">${value}</option>`).join("");

const guidanceDialog = new Dialog({
  title: "Guidance Ability/Skill Check",
  content: `
    <form>
      <div class="form-group">
        <label>Choose Ability or Skill Check:</label>
        <select id="check" name="check">
          <optgroup label="Ability Checks">
            ${abilityOptions}
          </optgroup>
          <optgroup label="Skill Checks">
            ${skillOptions}
          </optgroup>
        </select>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="advantage" name="advantage"/> Advantage
        </label>
        <label>
          <input type="checkbox" id="disadvantage" name="disadvantage"/> Disadvantage
        </label>
      </div>
    </form>
  `,
  buttons: {
    roll: {
      icon: "<i class='fas fa-dice-d20'></i>",
      label: "Roll",
      callback: async (html) => {
        const check = html.find('[name="check"]').val();
        const hasAdvantage = html.find('[name="advantage"]').is(':checked');
        const hasDisadvantage = html.find('[name="disadvantage"]').is(':checked');
        const token = selectedTokens[0];
        const actor = token.actor;

        let rollFormula, rollLabel;
        if (check.startsWith("ability-")) {
          const ability = check.replace("ability-", "");
          const abilityMod = actor.system.abilities[ability].mod;
          rollFormula = `1d20 + ${abilityMod}`;
          rollLabel = abilities[ability];
        } else {
          const skill = check.replace("skill-", "");
          const skillData = actor.system.skills[skill];
          const skillMod = skillData.total;
          rollFormula = `1d20 + ${skillMod}`;
          rollLabel = skills[skill];
        }

        let mainRoll;
        if (hasAdvantage) {
          mainRoll = new Roll(`2d20kh + ${rollFormula.split('+')[1]}`);
        } else if (hasDisadvantage) {
          mainRoll = new Roll(`2d20kl + ${rollFormula.split('+')[1]}`);
        } else {
          mainRoll = new Roll(rollFormula);
        }

        const guidanceRoll = new Roll('1d4');

        const [mainRollResult, guidanceRollResult] = await Promise.all([
          mainRoll.evaluate({async: true}),
          guidanceRoll.evaluate({async: true})
        ]);

        if (game.dice3d) {
          await Promise.all([
            game.dice3d.showForRoll(mainRoll),
            game.dice3d.showForRoll(guidanceRoll)
          ]);
        }

        const totalRoll = mainRollResult.total + guidanceRollResult.total;
        
        // Extract roll results for advantage/disadvantage
        let rollDetails = "";
        if (hasAdvantage || hasDisadvantage) {
          const rolls = mainRollResult.terms[0].results.map(r => r.result);
          const [firstRoll, secondRoll] = rolls;
          if (hasAdvantage) {
            rollDetails = `<p>Advantage: <span style="color: green; font-weight: bold;">${firstRoll}</span> vs ${secondRoll}</p>`;
            if (secondRoll > firstRoll) {
              rollDetails = `<p>Advantage: ${firstRoll} vs <span style="color: green; font-weight: bold;">${secondRoll}</span></p>`;
            }
          } else if (hasDisadvantage) {
            rollDetails = `<p>Disadvantage: ${firstRoll} vs <span style="color: red; font-weight: bold;">${secondRoll}</span></p>`;
            if (firstRoll < secondRoll) {
              rollDetails = `<p>Disadvantage: <span style="color: red; font-weight: bold;">${firstRoll}</span> vs ${secondRoll}</p>`;
            }
          }
        }

        // Post chat card after rolls are complete
        setTimeout(() => {
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({token: token}),
            content: `
              <div class="guidance-roll">
                <h2>${rollLabel} Check with Guidance</h2>
                ${rollDetails}
                <p><b>Ability/Skill Roll:</b> ${mainRollResult.result} = ${mainRollResult.total}</p>
                <p><b>Guidance Roll:</b> ${guidanceRollResult.result} = ${guidanceRollResult.total}</p>
                <p><b>Total Roll:</b> ${mainRollResult.total} (Ability/Skill) + ${guidanceRollResult.total} (Guidance) = ${totalRoll}</p>
              </div>
              <style>
                .guidance-roll {
                  font-family: 'Arial', sans-serif;
                  border: 2px solid #000;
                  background: #f9f9f9;
                  padding: 10px;
                  border-radius: 10px;
                }
                .guidance-roll h2 {
                  color: #000;
                  text-align: center;
                  margin: 0;
                }
                .guidance-roll p {
                  font-size: 1.2em;
                  margin: 5px 0;
                }
              </style>
            `
          });
        }, 1500); // 1.5 seconds delay
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

guidanceDialog.render(true);
