// Ensure at least one token is selected
if (!canvas.tokens.controlled.length) {
  return ui.notifications.warn("You must select at least one token.");
}

// Define different light settings
const lightPresets = {
  "torch": {
      label: "Torch",
      bright: 10,
      dim: 20,
      color: "#ffaa00",
      animation: { type: "torch", intensity: 5, speed: 2 }
  },
  "lantern": {
      label: "Lantern",
      bright: 15,
      dim: 30,
      color: "#ffeeaa",
      animation: { type: "pulse", intensity: 4, speed: 1 }
  },
  "candle": {
      label: "Candle",
      bright: 5,
      dim: 5,
      color: "#ffddaa",
      animation: { type: "flicker", intensity: 2, speed: 1 }
  },
  "darkvision": {
      label: "Darkvision",
      bright: 0,
      dim: 60,
      color: "#aaffaa",
      animation: { type: "none" }
  },
  "illumination": {
      label: "Illumination",
      bright: 10,
      dim: 10,
      color: "#ffffff",
      animation: { type: "none" }
  },
  "noLight": {
      label: "No Light",
      bright: 0,
      dim: 0,
      color: "#000000",
      animation: { type: null }
  }
};

// Create selection dialog
let optionsHTML = Object.entries(lightPresets)
  .map(([key, setting]) => `<option value="${key}">${setting.label}</option>`)
  .join("");

new Dialog({
  title: "Toggle Token Light",
  content: `
      <form>
          <div class="form-group">
              <label for="lightType">Select a Light Type:</label>
              <select id="lightType">${optionsHTML}</select>
          </div>
      </form>
  `,
  buttons: {
      apply: {
          label: "Apply",
          callback: async (html) => {
              let selectedLight = html.find("#lightType").val();
              let lightSetting = lightPresets[selectedLight];

              // Update selected tokens with chosen light settings
              for (let token of canvas.tokens.controlled) {
                  await token.document.update({
                      "light.bright": lightSetting.bright,
                      "light.dim": lightSetting.dim,
                      "light.color": lightSetting.color,
                      "light.animation": lightSetting.animation
                  });
              }

              ui.notifications.info(`Light changed to: ${lightSetting.label}`);
          }
      },
      cancel: {
          label: "Cancel"
      }
  },
  default: "apply"
}).render(true);