// Illumination Toggle Macro for Bastian (paladin12)
// This macro toggles the "Illumination" light (10 ft bright, 10 ft dim) on and off, but only for the token named "Bastian."

const allowedTokenName = "Bastian";  // Set to the specific token name "Bastian"

if (canvas.tokens.controlled.length !== 1) {
  ui.notifications.warn("Please select exactly one token.");
  return;
}

let selectedToken = canvas.tokens.controlled[0];

// Check if the selected token matches the allowed token
if (selectedToken.name !== allowedTokenName) {
  ui.notifications.warn(`This macro only works for the token named "${allowedTokenName}".`);
  return;
}

let currentLight = selectedToken.document.light;

// Define the Illumination settings with updated values
const illuminationOn = {
  dim: 10,
  bright: 10,
  color: "#80ffbd",
  animation: { type: "energy", intensity: 2, speed: 3 },
  coloration: 1, // Legacy Coloration enabled
  alpha: 0.7 // Color intensity at 70%
};

// Randomized flavor text options for when the light is turned on
const illuminationOnFlavors = [
  `<b><span style="color: purple;">Bastian</span></b>'s skeletal frame begins to glow with an eerie, pale light.`,
  `A soft, ghostly glow emanates from <b><span style="color: purple;">Bastian</span></b>, illuminating the darkness.`,
  `As the light spreads, <b><span style="color: purple;">Bastian</span></b>'s bones shimmer with an otherworldly radiance.`,
  `<b><span style="color: purple;">Bastian</span></b>'s form lights up, casting long shadows in the eerie glow.`,
  `With a flicker, <b><span style="color: purple;">Bastian</span></b>'s skeletal frame is bathed in a soft, unsettling light.`
];

// Randomized flavor text options for when the light is turned off
const illuminationOffFlavors = [
  `<b><span style="color: purple;">Bastian</span></b>'s light fades, his form retreating into shadow.`,
  `The eerie glow around <b><span style="color: purple;">Bastian</span></b> diminishes, leaving only darkness.`,
  `As the light dims, <b><span style="color: purple;">Bastian</span></b> seems to vanish into the gloom.`,
  `With the light gone, <b><span style="color: purple;">Bastian</span></b> fades into the shadows.`,
  `The glow surrounding <b><span style="color: purple;">Bastian</span></b> fades, and the darkness closes in.`
];

// Function to select a random flavor text
function getRandomFlavor(flavors) {
  return flavors[Math.floor(Math.random() * flavors.length)];
}

// Check if the current light matches the "Illumination" settings
let isIlluminationOn = currentLight.dim === illuminationOn.dim &&
                       currentLight.bright === illuminationOn.bright &&
                       currentLight.color === illuminationOn.color &&
                       currentLight.animation.type === illuminationOn.animation.type &&
                       currentLight.animation.intensity === illuminationOn.animation.intensity &&
                       currentLight.animation.speed === illuminationOn.animation.speed &&
                       currentLight.coloration === illuminationOn.coloration &&
                       currentLight.alpha === illuminationOn.alpha;

// Toggle the light between "Illumination" and "No Light"
let newLightSettings = isIlluminationOn
  ? { dim: 0, bright: 0, color: "#000000", animation: { type: "none" }, coloration: 1, alpha: 1 }
  : illuminationOn;

selectedToken.document.update({
  "light.dim": newLightSettings.dim,
  "light.bright": newLightSettings.bright,
  "light.color": newLightSettings.color,
  "light.animation": newLightSettings.animation,
  "light.coloration": newLightSettings.coloration,
  "light.alpha": newLightSettings.alpha
}).then(() => {
  const mode = isIlluminationOn ? "Illumination Off" : "Illumination On";
  const message = isIlluminationOn
    ? getRandomFlavor(illuminationOffFlavors)
    : getRandomFlavor(illuminationOnFlavors);

  // Create a chat message indicating the change
  ChatMessage.create({
    content: `
      <div class="light-option">
        <h2>${mode}</h2>
        <p>${message}</p>
      </div>
      <style>
        .light-option h2 {
          color: #8b4513;
          text-align: center;
          margin: 0;
        }
        .light-option p {
          font-size: 1.1em;
          margin: 5px 0;
          text-align: center;
        }
      </style>
    `,
    speaker: ChatMessage.getSpeaker({ token: selectedToken.document })
  });
}).catch(err => {
  console.error(err);
  ui.notifications.error("Failed to update the token's light settings.");
});