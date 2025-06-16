// This multiattack uses any weapons or features on your selected token (Working on v12)
const MODULE_NAME = "world"; // Use "world" or your module name if you're saving globally
const FLAG_SCOPE = "multiattackMemory";

if (canvas.tokens.controlled.length !== 1) {
  return ui.notifications.warn("Please select a single token.");
}

const actor = canvas.tokens.controlled[0].actor;
const weapons = actor.items.filter(i => i.type === "weapon" || i.type === "feat" || i.type === "spell");

if (!weapons.length) return ui.notifications.warn("No usable weapons or features found.");

const lastUsed = await game.user.getFlag(MODULE_NAME, FLAG_SCOPE) || {};
const defaultWeaponId = lastUsed.weaponId || weapons[0].id;
const defaultAttackCount = lastUsed.attackCount || 2;

const weaponOptions = weapons.map(w => {
  const selected = w.id === defaultWeaponId ? "selected" : "";
  return `<option value="${w.id}" ${selected}>${w.name}</option>`;
}).join("");

const attackCountOptions = [1, 2, 3, 4, 5].map(n => {
  const selected = n === defaultAttackCount ? "selected" : "";
  return `<option value="${n}" ${selected}>${n}</option>`;
}).join("");

new Dialog({
  title: "Choose Attack & Count",
  content: `
    <form>
      <div class="form-group">
        <label>Attack:</label>
        <select id="weapon-select">${weaponOptions}</select>
      </div>
      <div class="form-group">
        <label>Number of Attacks:</label>
        <select id="attack-count">${attackCountOptions}</select>
      </div>
    </form>`,
  buttons: {
    use: {
      icon: "<i class='fas fa-fist-raised'></i>",
      label: "Use",
      callback: async (html) => {
        const itemId = html.find("#weapon-select").val();
        const count = parseInt(html.find("#attack-count").val());
        const item = actor.items.get(itemId);
        if (!item) return;

        // Save current selection
        await game.user.setFlag(MODULE_NAME, FLAG_SCOPE, {
          weaponId: itemId,
          attackCount: count
        });

        for (let i = 0; i < count; i++) {
          await item.use();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    },
    cancel: {
      label: "Cancel"
    }
  },
  default: "use"
}).render(true);
