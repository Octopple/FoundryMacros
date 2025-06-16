// Starter Currency Macro - Prompts for class and rolls starting gold with delayed chat post

const classOptions = [
    "Barbarian", "Bard", "Cleric", "Druid",
    "Fighter", "Monk", "Paladin", "Ranger",
    "Rogue", "Sorcerer", "Warlock", "Wizard"
  ];
  
  const rollTable = {
    Barbarian: "2d4 * 10",
    Bard: "5d4 * 10",
    Cleric: "5d4 * 10",
    Druid: "2d4 * 10",
    Fighter: "5d4 * 10",
    Monk: "5d4",
    Paladin: "5d4 * 10",
    Ranger: "5d4 * 10",
    Rogue: "4d4 * 10",
    Sorcerer: "3d4 * 10",
    Warlock: "4d4 * 10",
    Wizard: "4d4 * 10"
  };
  
  const optionsHtml = classOptions.map(c => `<option value="${c}">${c}</option>`).join("\n");
  
  new Dialog({
    title: "Roll Starting Currency",
    content: `
      <form>
        <div class="form-group">
          <label>Choose Class:</label>
          <select name="charClass">${optionsHtml}</select>
        </div>
      </form>
    `,
    buttons: {
      roll: {
        label: "Roll Gold",
        callback: async (html) => {
          const charClass = html.find('[name="charClass"]').val();
          const formula = rollTable[charClass];
  
          const roll = await new Roll(formula).evaluate({ async: true });
          game.dice3d?.showForRoll(roll);
  
          const displayFormula = formula.replace("*", "x");
  
          setTimeout(() => {
            ChatMessage.create({
              speaker: ChatMessage.getSpeaker(),
              content: `<h2>Starting Gold: <b>${charClass}</b></h2><p><strong>${displayFormula}</strong> = <strong>${roll.total} GP</strong></p><p>Your starting gold is <strong>${roll.total} GP.</p>`
            });
          }, 1500); // Delay for dice to finish
        }
      },
      cancel: {
        label: "Cancel"
      }
    },
    default: "roll"
  }).render(true);