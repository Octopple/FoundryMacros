// Toggle Player Size Macro (paladin49)
// This macro toggles the size of the selected player's token between normal and enlarged (giant rage) states.

let selectedTokens = canvas.tokens.controlled;

if (selectedTokens.length === 0) {
  ui.notifications.warn("Please select a token.");
  return;
}

const normalSize = 1; // Normal size in squares
const enlargedSize = 2; // Enlarged size in squares during rage

const flavorTextsRage = [
  "The ground trembles as the character's form swells with the fury of a giant.",
  "With a roar, the character's body expands, towering over the battlefield in a display of raw power.",
  "A surge of energy courses through the character, limbs growing and muscles bulging as they assume a giant's stature.",
  "The character's eyes blaze with rage as their form enlarges, casting a long shadow across the land.",
  "As the character's rage intensifies, their size increases, each step shaking the ground beneath them."
];

const flavorTextsUnrage = [
  "The character's form shrinks back to its normal size, the fury of the giant subsiding.",
  "With a deep breath, the character's body returns to its regular proportions, the rage dissipating.",
  "The energy within the character fades, and their size diminishes back to normal.",
  "The blaze in the character's eyes dims as their form contracts, the ground settling once more.",
  "As the character's rage subsides, their size reduces, each step lighter than before."
];

const renderDialog = (defaultAction) => {
  const sizeDialog = new Dialog({
    title: "Toggle Player Size",
    content: `
      <form>
        <div class="form-group">
          <label>Choose Action:</label>
          <select id="action" name="action">
            <option value="rage" ${defaultAction === "rage" ? "selected" : ""}>Rage (Enlarge)</option>
            <option value="unrage" ${defaultAction === "unrage" ? "selected" : ""}>Unrage (Shrink)</option>
          </select>
        </div>
      </form>
    `,
    buttons: {
      toggle: {
        icon: "<i class='fas fa-exchange-alt'></i>",
        label: "Toggle Size",
        callback: (html) => {
          const action = html.find('[name="action"]').val();
          const updates = [];
          let flavorText;

          for (const token of selectedTokens) {
            const currentSize = token.data.width;

            if (action === "rage" && currentSize === normalSize) {
              updates.push({_id: token.id, width: enlargedSize, height: enlargedSize});
              flavorText = flavorTextsRage[Math.floor(Math.random() * flavorTextsRage.length)];
              ChatMessage.create({
                content: `<div class="giant-rage"><h2>Rage</h2><p>${flavorText}</p></div>`,
                speaker: ChatMessage.getSpeaker({token: token})
              });
            } else if (action === "unrage" && currentSize === enlargedSize) {
              updates.push({_id: token.id, width: normalSize, height: normalSize});
              flavorText = flavorTextsUnrage[Math.floor(Math.random() * flavorTextsUnrage.length)];
              ChatMessage.create({
                content: `<div class="giant-rage"><h2>Unrage</h2><p>${flavorText}</p></div>`,
                speaker: ChatMessage.getSpeaker({token: token})
              });
            }
          }

          if (updates.length > 0) {
            canvas.scene.updateEmbeddedDocuments("Token", updates);
            ui.notifications.info(`Token size has been toggled.`);
            renderDialog(action === "rage" ? "unrage" : "rage");
          } else {
            ui.notifications.info(`Tokens are already in the desired state.`);
          }
        }
      },
      cancel: {
        icon: "<i class='fas fa-times'></i>",
        label: "Cancel"
      }
    },
    default: "toggle",
    close: () => {}
  });

  sizeDialog.render(true);
};

renderDialog("rage");