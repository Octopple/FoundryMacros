// Detect Intentions Macro
// Rolls Insight for the selected player character
// If the roll is 15 or higher, reveals the target’s intentions (placeholder)

const selected = canvas.tokens.controlled[0];
const target = Array.from(game.user.targets)[0];

if (!selected || !selected.actor) {
  ui.notifications.warn("Select your character.");
  return;
}
if (!target || !target.actor) {
  ui.notifications.warn("Target an enemy to read their intentions.");
  return;
}

const actor = selected.actor;
const skill = actor.system.skills.ins;

if (!skill) {
  ui.notifications.error("Selected actor does not have an Insight skill.");
  return;
}

const roll = await new Roll(`1d20 + ${skill.mod}`).evaluate({ async: true });
game.dice3d?.showForRoll(roll);

const total = roll.total;

let message = `<h3>Detect Intentions</h3>
<b>${actor.name}</b> focuses on <b>${target.name}</b><br>
Insight Roll <b>(DC 15)</b>: <strong>${roll.result} = ${total}</strong><br>`;

if (total >= 15) {
  message += `<br><i>You decipher their immediate intention.</i><br>`;
} else {
  message += `<br><i>You fail to read their intent.</i>`;
}

ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ token: selected }),
  content: message
});