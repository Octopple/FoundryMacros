// Heal Selected Token to Max HP
if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn("Please select exactly one token.");
    return;
  }
  
  const token = canvas.tokens.controlled[0];
  const actor = token.actor;
  
  const hp = actor.system.attributes.hp;
  if (!hp || typeof hp.max !== "number") {
    ui.notifications.error("Unable to read HP data.");
    return;
  }
  
  await actor.update({ "system.attributes.hp.value": hp.max });
  
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ token: token }),
    content: `<b>${token.name}</b> is fully healed to <b>${hp.max}</b> HP.`
  });
  