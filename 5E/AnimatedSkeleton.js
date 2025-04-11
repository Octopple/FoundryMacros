// Animate Skeleton Macro (undead1)
// This macro allows a player to choose a dead target token from a list, announces the animation in chat with fancy flavor text, and makes the selected corpse name bold, purple, and larger.

const deadTokens = canvas.tokens.placeables.filter(token => token.actor.system.attributes.hp.value === 0);
if (deadTokens.length === 0) {
  return ui.notifications.warn("No dead tokens found.");
}

const flavorTexts = [
  "Pluu's incantation reverberates through the air, causing the lifeless body to twitch violently before rising.",
  "Dark energy swirls around the corpse as Pluu's necromantic power breathes unholy life into it.",
  "With a sinister grin, Pluu channels his power, and the corpse stirs, rising as an undead servant.",
  "Pluu's eyes glow with dark magic as he gestures, compelling the corpse to stand once more."
];

let dialogContent = `
<form>
  <div class="form-group">
    <label>Select a dead target:</label>
    <select id="target-token" name="target-token">
      ${deadTokens.map(token => `<option value="${token.id}">${token.name} (CR ${token.actor.system.details.cr})</option>`).join("")}
    </select>
  </div>
  <div class="form-group">
    <label>Cast at spell level:</label>
    <select id="spell-level" name="spell-level">
      ${[3, 4, 5, 6, 7, 8, 9].map(level => `<option value="${level}">${level} (Max CR ${level - 2})</option>`).join("")}
    </select>
  </div>
  <p>Note: 3rd level spell can animate CR 1 or lower. Each level above increases the maximum CR by 1.</p>
</form>`;

new Dialog({
  title: "Animate Skeleton",
  content: dialogContent,
  buttons: {
    animate: {
      icon: "<i class='fas fa-bone'></i>",
      label: "Animate",
      callback: (html) => {
        const tokenId = html.find('[name="target-token"]').val();
        const spellLevel = parseInt(html.find('[name="spell-level"]').val());
        const target = canvas.tokens.get(tokenId);
        const actor = target.actor;
        const maxCR = spellLevel - 2; // 3rd level spell can animate CR 1 or lower, upcasting increases max CR

        // Check if the target is a construct or plant
        const creatureType = actor.system.details.type.value.toLowerCase();
        if (creatureType === "construct" || creatureType === "plant") {
          return ui.notifications.warn(`Cannot animate constructs or plants.`);
        }

        if (actor.system.details.cr > maxCR) {
          return ui.notifications.warn(`Cannot animate targets with CR above ${maxCR}.`);
        }

        const flavorText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

        // Chat announcement with fancy flavor text
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ alias: "Pluu" }),
          content: `
            <h2>Animated Skeleton</h2>
            <p style="font-size: 1.2em; color: purple; font-weight: bold;">${actor.name}</p>
            <p><i>${flavorText}</i></p>
            <p>${actor.name} has been raised as a skeleton.</p>
          `
        });

        ui.notifications.info(`The skeleton ${actor.name} has been animated.`);
      }
    },
    cancel: {
      icon: "<i class='fas fa-times'></i>",
      label: "Cancel"
    }
  },
  default: "animate"
}).render(true);
