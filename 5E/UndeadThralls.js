// Apply or Remove 'Undead Thrall' effect to selected token
// Grants bonus HP and weapon damage scaling with wizard level and proficiency

if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn("Please select exactly one token.");
    return;
  }
  
  const token = canvas.tokens.controlled[0];
  const actor = token.actor;
  
  new Dialog({
    title: "Undead Thrall Toggle",
    content: `
      <form>
        <div class="form-group">
          <label>Wizard Level:</label>
          <input type="number" id="wizard-level" name="wizard-level" value="1" min="1" step="1"/>
        </div>
        <div class="form-group">
          <label>Proficiency Bonus:</label>
          <input type="number" id="prof-bonus" name="prof-bonus" value="2" min="1" max="10"/>
        </div>
      </form>
    `,
    buttons: {
      toggle: {
        label: "Toggle Effect",
        callback: async (html) => {
          const wizLevel = parseInt(html.find('[name="wizard-level"]').val());
          const profBonus = parseInt(html.find('[name="prof-bonus"]').val());
  
          if (isNaN(wizLevel) || isNaN(profBonus)) {
            ui.notifications.error("Please enter valid numbers for both fields.");
            return;
          }
  
          const effectName = "Undead Thralls";
          const existing = actor.effects.find(e => e.name === effectName);
          const hp = actor.system.attributes.hp;
  
          if (existing) {
            await existing.delete();
            await actor.update({
              "system.attributes.hp.max": Math.max(hp.max - wizLevel, 1),
              "system.attributes.hp.value": Math.min(hp.value, Math.max(hp.max - wizLevel, 1))
            });
  
            ChatMessage.create({
              speaker: ChatMessage.getSpeaker({ token }),
              content: `<b>${actor.name}</b> is no longer an <b>Undead Thrall</b>. Max HP -${wizLevel}, damage bonus removed.`
            });
            return;
          }
  
          // Apply effect
          const newMax = hp.max + wizLevel;
          const newValue = Math.min(hp.value + wizLevel, newMax);
  
          await actor.update({
            "system.attributes.hp.max": newMax,
            "system.attributes.hp.value": newValue
          });
  
          const effectData = {
            label: effectName,
            icon: "icons/magic/death/undead-skeleton-deformed-red.webp",
            description: `<p>Whenever you create an undead using a necromancy spell, it has additional benefits:</p>
            <ul class="rd__list">
              <li class="rd__li">The creature's <strong>hit point maximum</strong> is increased by an amount equal to your <strong>wizard level</strong>.</li>
              <li class="rd__li">The creature adds your <strong>proficiency bonus</strong> to its <strong>weapon damage</strong> rolls.</li>
            </ul>`,
            changes: [
              {
                key: "system.bonuses.mwak.damage",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: `+${profBonus}`,
                priority: 20
              },
              {
                key: "system.bonuses.rwak.damage",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: `+${profBonus}`,
                priority: 20
              }
            ],
            origin: `Actor.${actor.id}`,
            disabled: false,
            flags: {},
          };
  
          await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
  
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ token }),
            content: `<b>${actor.name}</b> is now an <b>Undead Thrall</b>!<br>+${wizLevel} Max HP and Weapon Damage +${profBonus}.`
          });
        }
      },
      cancel: {
        label: "Cancel"
      }
    },
    default: "toggle"
  }).render(true);
  