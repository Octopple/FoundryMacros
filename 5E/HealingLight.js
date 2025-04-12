// Warlock Celestial: Healing Light
// Bonus action heal using pool of d6s equal to 1 + warlock level, with manual reset option

if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn("Please select your warlock token.");
    return;
  }
  
  const warlock = canvas.tokens.controlled[0].actor;
  const warlockLevel = warlock.items.find(i => i.type === "class" && i.name.toLowerCase() === "warlock")?.system.levels || 0;
  const charismaMod = warlock.system.abilities.cha.mod;
  const maxDice = Math.max(1, charismaMod);
  const poolMax = 1 + warlockLevel;
  const poolKey = "healingLightPool";
  
  // Detect if a long rest occurred (use flag time as marker)
  const lastReset = warlock.getFlag("world", "healingLightLastReset") || 0;
  const lastRest = warlock.system.details?.rest?.long ?? 0;
  
  if (lastRest > lastReset) {
    await warlock.setFlag("world", poolKey, poolMax);
    await warlock.setFlag("world", "healingLightLastReset", lastRest);
  }
  
  // Initialize pool if needed
  let pool = warlock.getFlag("world", poolKey);
  if (pool === undefined) {
    pool = poolMax;
    await warlock.setFlag("world", poolKey, pool);
    await warlock.setFlag("world", "healingLightLastReset", lastRest);
  }
  
  new Dialog({
    title: "Healing Light",
    content: `
      <p><em>Healing Light is a <strong>BONUS ACTION</strong>.</em></p>
      <p><strong>Max Pool:</strong> ${pool}/${poolMax} of d6s</p>
      <form>
        <div class="form-group">
          <label>Dice to Spend (1 to ${Math.min(pool, maxDice)}):</label>
          <input type="number" id="dice-count" name="dice-count" value="1" min="1" max="${Math.min(pool, maxDice)}"/>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="self-target" checked> Target self (uncheck to heal another)</label>
        </div>
      </form>
    `,
    buttons: {
      heal: {
        label: "Roll Healing",
        callback: async (html) => {
          const diceCount = parseInt(html.find('[name="dice-count"]').val());
          const isSelf = html.find('#self-target').is(":checked");
  
          if (isNaN(diceCount) || diceCount < 1 || diceCount > Math.min(pool, maxDice)) {
            ui.notifications.error("Invalid number of dice selected.");
            return;
          }
  
          const roll = await new Roll(`${diceCount}d6`).evaluate({ async: true });
          game.dice3d?.showForRoll(roll);
  
          await warlock.setFlag("world", poolKey, pool - diceCount);
  
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: warlock }),
            content: `
              <h2><img src="icons/magic/life/cross-area-circle-green-white.webp" width="24" style="vertical-align:middle; margin-right: 4px;"/> Healing Light</h2>
              <em><b>${warlock.name}</b> uses <b>Healing Light</b></em><br>
              <strong>Rolled:</strong> ${diceCount}d6 = <strong>${roll.total} HP</strong><br>
              ${isSelf ? `Healing <b>SELF</b>.` : `Choose a target within 60 feet to heal manually.`}`
          });
        }
      },
      reset: {
        label: "Reset Pool",
        callback: async () => {
          await warlock.setFlag("world", poolKey, poolMax);
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: warlock }),
            content: `<b>${warlock.name}'s</b> <b>Healing Light</b> pool has been reset to <strong>${poolMax}</strong> from Long Rest.`
          });
        }
      },
      cancel: {
        label: "Cancel"
      }
    },
    default: "heal"
  }).render(true);
  