// Toggle: Prompt to apply Aid and/or Aspiring Leader effects (D&D5E v4.2.2 + Foundry VTT v12)
// Applies temporary max HP and temp HP as buffs with effects

if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn("Please select exactly one token.");
    return;
  }
  
  const token = canvas.tokens.controlled[0];
  const actor = token.actor;
  
  new Dialog({
    title: "Apply Leadership Buffs",
    content: `
      <form>
        <div class="form-group">
          <label><input type="checkbox" id="aid-check"> Aid (+10 Temporary Max HP)</label>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="leader-check"> Aspiring Leader (15 Temp HP)</label>
        </div>
      </form>
    `,
    buttons: {
      apply: {
        label: "Apply/Remove",
        callback: async (html) => {
          const applyAid = html.find('#aid-check').is(":checked");
          const applyLeader = html.find('#leader-check').is(":checked");
  
          const hasAid = actor.getFlag("world", "aidActive");
          const hasLeader = actor.getFlag("world", "leaderActive");
  
          const hp = actor.system.attributes.hp;
          let updates = {};
          const effectsToApply = [];
          const messages = [];
  
          // Aid toggle
          if (applyAid && !hasAid) {
            updates["system.attributes.hp.tempmax"] = (hp.tempmax || 0) + 10;
            updates["system.attributes.hp.value"] = Math.min((hp.value || 0) + 10, (hp.max || 0) + 10);
            await actor.setFlag("world", "aidActive", true);
            effectsToApply.push({
              label: "Aid",
              icon: "icons/skills/melee/hand-grip-sword-orange.webp",
              changes: [],
              duration: { rounds: 9999 },
              origin: `Actor.${actor.id}`,
              flags: { core: { statusId: "Aid" } }
            });
            messages.push(`Applied Aid (+10 Temp Max HP)`);
          } else if (!applyAid && hasAid) {
            updates["system.attributes.hp.tempmax"] = Math.max((hp.tempmax || 0) - 10, 0);
            updates["system.attributes.hp.value"] = Math.min(hp.value, hp.max);
            await actor.unsetFlag("world", "aidActive");
            const existing = actor.effects.find(e => e.name === "Aid");
            if (existing) await existing.delete();
            messages.push(`Removed Aid (+10 Temporary Max HP)`);
          }
  
          // Aspiring Leader toggle
          if (applyLeader && !hasLeader) {
            updates["system.attributes.hp.temp"] = 15;
            await actor.setFlag("world", "leaderActive", true);
            effectsToApply.push({
              label: "Aspiring Leader",
              icon: "modules/plutonium/media/icon/feat/phb-inspiring-leader.webp",
              changes: [],
              duration: { rounds: 9999 },
              origin: `Actor.${actor.id}`,
              flags: { core: { statusId: "Aspiring Leader" } }
            });
            messages.push(`Applied Aspiring Leader (+15 Temp HP)`);
          } else if (!applyLeader && hasLeader) {
            updates["system.attributes.hp.temp"] = 0;
            await actor.unsetFlag("world", "leaderActive");
            const existing = actor.effects.find(e => e.name === "Aspiring Leader");
            if (existing) await existing.delete();
            messages.push(`Removed Aspiring Leader (15 Temp HP)`);
          }
  
          if (Object.keys(updates).length > 0) await actor.update(updates);
          if (effectsToApply.length > 0) await actor.createEmbeddedDocuments("ActiveEffect", effectsToApply);
  
          if (messages.length > 0) {
            ChatMessage.create({
              speaker: ChatMessage.getSpeaker({ token }),
              content: `<b>${actor.name}</b>:<br>` + messages.map(m => `⦁ ${m}`).join("<br>")
            });
          }
        }
      },
      cancel: {
        label: "Cancel"
      }
    },
    default: "apply"
  }).render(true);
  