// Disguise Toggle Macro (undead33)
// This macro toggles the selected token between civilian and disguised modes by changing the token's image and sends a chat message indicating the change.
// It only works for a specific token with the name "Pluu".

if (canvas.tokens.controlled.length !== 1) {
  ui.notifications.warn("Please select exactly one token.");
  return;
}

const allowedTokenName = "Pluu"; // Replace with the name of the token you want to allow

let selectedToken = canvas.tokens.controlled[0];

// Check if the selected token is the allowed token
if (selectedToken.name !== allowedTokenName) {
  ui.notifications.warn(`This macro can only be used with the token "${allowedTokenName}".`);
  return;
}

// Define the image paths for civilian and disguised modes
const civilianImage = "Icons/tkn_PluuY2_3.png";   // Civilian mode image
const disguisedImage = "Icons/tkn_PluuY2_3B.png"; // Disguised mode image

let currentImage = selectedToken.document.texture.src;

// Toggle between civilian and disguised images
let newImage = (currentImage === civilianImage) ? disguisedImage : civilianImage;
let isDisguised = newImage === disguisedImage;

selectedToken.document.update({
  "texture.src": newImage
}).then(() => {
  const mode = isDisguised ? "Disguise On" : "Disguise Off";
  const message = isDisguised
    ? `<b><span style="color: #4b8dbf;">Pluu</span></b> hides into <b><span style="color: purple;">Bastian</span></b>'s body.`
    : `<b><span style="color: #4b8dbf;">Pluu</span></b> comes out of hiding.`;

  ui.notifications.info(`Token image switched to ${isDisguised ? "Disguised" : "Civilian"} mode.`);

  // Create a chat message indicating the change
  ChatMessage.create({
    content: `
      <div class="disguise-toggle">
        <h2>${mode}</h2>
        <p>${message}</p>
      </div>
      <style>
        .disguise-toggle h2 {
          color: #8b4513;
          text-align: center;
          margin: 0;
        }
        .disguise-toggle p {
          font-size: 1.1em;
          margin: 5px 0;
          text-align: center;
        }
      </style>
    `,
    speaker: ChatMessage.getSpeaker({ token: selectedToken })
  });
});