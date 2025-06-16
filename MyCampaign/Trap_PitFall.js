// Trap: Pitfall - Immediate Damage Roll

const damageFormula = "2d6";
const trapName = "Pitfall";
const trapIcon = "icons/environment/traps/spike-skull-white-brown.webp";

const roll = await new Roll(damageFormula).evaluate({ async: true });

ChatMessage.create({
  speaker: { alias: "Trap" },
  content: `
    <h2><img src="${trapIcon}" width="24" style="vertical-align:middle; margin-right:0.5em;">Trap Triggered: ${trapName}</h2>
    <p>Each affected creature takes <strong>${damageFormula}</strong> bludgeoning damage.</p>
    `
});

await roll.toMessage({
  speaker: ChatMessage.getSpeaker(),
  flavor: `${trapName} Damage`
});