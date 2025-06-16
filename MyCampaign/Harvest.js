// Require the player to select a token
let selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
  ui.notifications.warn("Select your PC token first!");
  return;
}

// Only include dead tokens within 20 ft radius (usually 4 squares in D&D 5e)
const radiusFeet = 20;
const gridSize = canvas.scene.grid.size;
const unitsPerGrid = canvas.scene.grid.distance; // usually 5
const maxGridDistance = radiusFeet / unitsPerGrid;

let tokens = canvas.tokens.placeables.filter(t => {
  let hasActor = !!t.actor;
  let isNotPC = t.actor?.type !== "character";
  let hp = t.actor?.system.attributes.hp?.value ?? 1;
  let hasCR = t.actor?.system.details?.cr !== undefined;
  if (!(hasActor && isNotPC && hasCR && (hp <= 0))) return false;

  // Distance calculation (center to center in grid units)
  let dx = (t.center.x - selectedToken.center.x) / gridSize;
  let dy = (t.center.y - selectedToken.center.y) / gridSize;
  let dist = Math.sqrt(dx * dx + dy * dy);
  return dist <= maxGridDistance && t.id !== selectedToken.id;
});

if (!tokens.length) {
  ui.notifications.warn("No dead monsters found within 20 feet!");
  return;
}


// Build dropdown options
let tokenOptions = tokens.map((t, i) => {
  let cr = t.actor?.system.details.cr ?? "1";
  let type = t.actor?.system.details.type?.value ?? "Unknown";
  return `<option value="${i}">${t.name}</option>`;
}).join("");

// Dialog for player to pick which token and quantity
let dialogContent = `
<form>
  <div class="form-group">
    <label>Dead Creature:</label>
    <select name="token">${tokenOptions}</select>
  </div>
  <div class="form-group">
    <label>Quantity:</label>
    <input type="number" name="qty" value="1" min="1" max="20" style="width:60px;"/>
  </div>
</form>
`;

new Dialog({
  title: "Harvest Attempt",
  content: dialogContent,
  buttons: {
    ok: {
      label: "Begin Harvest",
      callback: html => {
        let selected = Number(html.find('[name="token"]').val());
        let qty = Number(html.find('[name="qty"]').val());
        let targetToken = tokens[selected];
        let cr = Number(targetToken.actor?.system.details.cr ?? 1);
        let type = targetToken.actor?.system.details.type?.value ?? "Unknown";
        let name = targetToken.name;

        // Styled chat card for Harvest Attempt
        let chatContent = `
<h2><img src="icons/skills/melee/strike-blade-knife-blue-red.webp" width="32" height="32" style="margin-right:6px;"> Harvest Attempt</h2>
<div style="margin-bottom: 6px;">
  <span style="font-size:1.1em;">${qty}<b>×</b> ${name}</span><br>
  <span><b>DC 11</b> check using:</span>
</div>
<div style="display: flex; gap: 0.5em;">
  <button class="harvest-roll" data-skill="survival" data-qty="${qty}" data-name="${name}" data-cr="${cr}" data-type="${type}" >
    Survival
  </button>
  <button class="harvest-roll" data-skill="medicine" data-qty="${qty}" data-name="${name}" data-cr="${cr}" data-type="${type}" >
    Medicine
  </button>
  <button class="harvest-roll" data-skill="thieves" data-qty="${qty}" data-name="${name}" data-cr="${cr}" data-type="${type}" >
    Thieves' Tools
  </button>
</div>
        `;
        ChatMessage.create({content: chatContent});
      }
    }
  }
}).render(true);

// ---- Register chat card listener if not already done ----
if (!window.harvestListenerSet) {
  window.harvestListenerSet = true;
  Hooks.on('renderChatMessage', (message, html, data) => {
    html.find('.harvest-roll').off('click').on('click', async function() {
      let skill = this.dataset.skill;
      let qty = Number(this.dataset.qty);
      let name = this.dataset.name;
      let cr = Number(this.dataset.cr);
      let type = this.dataset.type;
      let actor = canvas.tokens.controlled[0]?.actor;
      if (!actor) {
        ui.notifications.warn("Select a token to harvest (your PC)!");
        return;
      }

      // Roll logic
      let roll, result;
      if (skill === "survival") roll = await actor.rollSkill("sur");
      if (skill === "medicine") roll = await actor.rollSkill("med");
      if (skill === "thieves") roll = await actor.rollTool("thieves");
      result = roll.total ?? roll._total ?? roll[0]?.total;

      // Custom Tiers
      let tier, color, tierFlavor, partMin, partMax, partFixed;
      if (result >= 19) {
        tier = "Exceptional"; color = "#a259c4"; tierFlavor = "Pristine yield. Rare specimens preserved.";
        partMin = 3; partMax = 5;
      } else if (result >= 15) {
        tier = "Clean"; color = "#299cd4"; tierFlavor = "Surgical precision. All valuable material recovered.";
        partMin = 2; partMax = 4;
      } else if (result >= 11) {
        tier = "Standard"; color = "#28a745"; tierFlavor = "Average work. Usable parts acquired.";
        partMin = 1; partMax = 3;
      } else if (result >= 5) {
        tier = "Partial"; color = "#e67e22"; tierFlavor = "You salvage a few ragged parts, but much is spoiled.";
        partMin = 1; partMax = 2;
      } else {
        tier = "Botched"; color = "#c0392b"; tierFlavor = "You destroy nearly everything—only scraps remain.";
        partMin = 0; partMax = 0; partFixed = 0;
      }

      // Mana Core logic
      function getManaCoreByCR(cr) {
        if (cr >= 10) return "Radiant Mana Core";
        if (cr >= 7) return "Greater Mana Core";
        if (cr >= 4) return "Stable Mana Core";
        if (cr >= 2) return "Minor Mana Core";
        return "Cracked Mana Core";
      }
      function getLowerManaCore(core) {
        if (core === "Radiant Mana Core") return "Greater Mana Core";
        if (core === "Greater Mana Core") return "Stable Mana Core";
        if (core === "Stable Mana Core") return "Minor Mana Core";
        if (core === "Minor Mana Core") return "Cracked Mana Core";
        return "Cracked Mana Core";
      }
      const coreValues = {
        "Radiant Mana Core": 400,
        "Greater Mana Core": 200,
        "Stable Mana Core": 100,
        "Minor Mana Core": 35,
        "Cracked Mana Core": 12
      };
      let manaCore = getManaCoreByCR(cr);
      let lowerCore = getLowerManaCore(manaCore);
      let manaCoreType = (result >= 11) ? manaCore : lowerCore;
      let manaCoreValue = coreValues[manaCoreType] * qty;

      // Monster Parts yield by tier (random per corpse per qty)
      let partsArray = [];
      let totalParts = 0;
      if (partFixed !== undefined) {
        totalParts = partFixed * qty;
        for (let i = 0; i < qty; i++) partsArray.push(partFixed);
      } else if (partMin !== undefined && partMax !== undefined && partMax > 0) {
        for (let i = 0; i < qty; i++) {
          let n = Math.floor(Math.random() * (partMax - partMin + 1)) + partMin;
          partsArray.push(n);
          totalParts += n;
        }
      }

      // === Roll on the RollTable for each part ===
      let rolltableResults = [];
      if (totalParts > 0) {
        // Load the table from its UUID
        let table = await fromUuid("Compendium.world.harvest.RollTable.WizzGOBjKRBEotfk");
        if (!table) {
          rolltableResults.push("Could not find parts table!");
        } else {
          for (let i = 0; i < totalParts; i++) {
            let r = await table.roll();
            // Use either the result's text, or getText if available
            let partText = r.results[0]?.text ?? r.results[0]?.getChatText() ?? "(No result)";
            rolltableResults.push(partText);
          }
        }
      }
      let partsList = "None";
      if (rolltableResults.length > 0) {
        // Count duplicates
        let counts = {};
        for (let part of rolltableResults) {
          counts[part] = (counts[part] || 0) + 1;
        }
        partsList = `<ul>${
          Object.entries(counts)
            .map(([part, n]) => `<li>${part}${n > 1 ? ` ×${n}` : ""}</li>`)
            .join("")
        }</ul>`;
      }

      // Result formatting
      let resultMsg = `
        <h2>Harvesting Result</h2>
        <b>Harvesting: ${name}</b>
      <div>
        <b>Check:</b> ${result} &rarr; <b style="color:${color};">${tier}</b>
        <br><i style="color:${color};">${tierFlavor}</i>
        <br><br>
        <b>Mana Core:</b> ${qty} × <b>${manaCoreType.replace("Mana Core","Core")}</b>
        <br>
        <b>Parts (${totalParts}):</b> ${partsList}
      </div>
            `;
      ChatMessage.create({content: resultMsg});
    });
  });
}