// Enemy Attack Announcement Macro
// Displays a system message announcing enemy intent based on conditions
// Used to show enemy AI transparency for players

const token = canvas.tokens.controlled[0];
if (!token || !token.actor) {
  ui.notifications.warn("Please select an enemy token.");
  return;
}

const baseActions = [
  "Attack",
  "Attack closest enemy",
  "Attack with ranged weapon",
  "Attack caster",
  "Move towards",
  "Move away",
  "Heal, if possible"
];

const statusFilters = [
  { key: "frightened", label: "Frightened" },
  { key: "alone", label: "Alone (no nearby allies)" },
  { key: "wounded", label: "Wounded (under half HP)" }
];

const rollModes = [
  { value: "roll", label: "Public Roll" },
  { value: "gmroll", label: "GM Only" },
  { value: "blindroll", label: "Blind Roll" },
  { value: "selfroll", label: "Self Only" }
];

const dialogContent = `
  <form>
    <p><strong>Choose applicable conditions to modify behavior:</strong></p>
    ${statusFilters.map(s => `<div class="form-group">
      <label><input type="checkbox" name="${s.key}"> ${s.label}</label>
    </div>`).join("")}
    <div class="form-group">
      <label><strong>Override behavior (optional):</strong></label>
      <select name="manual-action">
        <option value="">-- Randomize based on context --</option>
        ${baseActions.map(a => `<option value="${a}">${a}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label><strong>Roll Mode:</strong></label>
      <select name="roll-mode">
        ${rollModes.map(r => `<option value="${r.value}" ${r.value === "selfroll" ? "selected" : ""}>${r.label}</option>`).join("")}
      </select>
    </div>
  </form>
`;

new Dialog({
  title: "Enemy Behavior Declaration",
  content: dialogContent,
  buttons: {
    confirm: {
      label: "Announce",
      callback: (html) => {
        const selected = {};
        statusFilters.forEach(s => {
          selected[s.key] = html.find(`[name='${s.key}']`).is(":checked");
        });

        const manualChoice = html.find('[name="manual-action"]').val();
        const rollMode = html.find('[name="roll-mode"]').val() || "selfroll";

        let actions = [...baseActions];

        if (!manualChoice) {
          if (selected.frightened) {
            actions = ["Retreat", "Avoid enemy", "Move away"];
          } else if (selected.alone) {
            actions = ["Regroup", "Retreat", "Defend position"];
          } else if (selected.wounded) {
            actions = ["Heal", "Withdraw", "Last stand"];
          }
        }

        const action = manualChoice || actions[Math.floor(Math.random() * actions.length)];

        const whisperTo = rollMode === "gmroll" || rollMode === "blindroll" || rollMode === "selfroll" ? ChatMessage.getWhisperRecipients(game.user.name) : [];

        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ token }),
          content: `
            <div class="message-content" style="font-style: italic;">
              <h3 style="margin-bottom: 0.2em;">Enemy Intent</h3>
              <b>${token.name}</b> intends to: <b>${action}</b>
            </div>`,
          type: CONST.CHAT_MESSAGE_TYPES.OTHER,
          whisper: whisperTo,
          blind: rollMode === "blindroll"
        });
      }
    },
    cancel: {
      label: "Cancel"
    }
  },
  default: "confirm"
}).render(true);