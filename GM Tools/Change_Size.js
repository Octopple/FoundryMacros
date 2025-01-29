// Ensure a token is selected
if (!canvas.tokens.controlled.length) {
  return ui.notifications.warn("You must select at least one token.");
}

// Predefined size options (D&D5E standard sizes)
const sizeOptions = {
  "0.5": "Small (0.5x0.5)",
  "1": "Medium (1x1)",
  "2": "Large (2x2)",
  "3": "Huge (3x3)",
  "4": "Gargantuan (4x4)",
  "custom": "Custom Size..."
};

// Create size selection dialog
let optionsHTML = Object.entries(sizeOptions)
  .map(([value, label]) => `<option value="${value}">${label}</option>`)
  .join("");

new Dialog({
  title: "Change Token Size",
  content: `
      <form>
          <div class="form-group">
              <label for="size">Select a Size:</label>
              <select id="size">${optionsHTML}</select>
          </div>
          <div class="form-group" id="customSizeGroup" style="display: none;">
              <label for="customSize">Enter Custom Size (e.g., 1.5):</label>
              <input type="number" id="customSize" step="0.1" min="0.1" />
          </div>
      </form>
      <script>
          document.getElementById("size").addEventListener("change", function() {
              document.getElementById("customSizeGroup").style.display = (this.value === "custom") ? "block" : "none";
          });
      </script>
  `,
  buttons: {
      apply: {
          label: "Apply",
          callback: async (html) => {
              let selectedSize = html.find("#size").val();
              let customSize = parseFloat(html.find("#customSize").val());

              // If custom size is selected, validate input
              let finalSize = selectedSize === "custom" ? (customSize > 0 ? customSize : 1) : parseFloat(selectedSize);

              // Update selected tokens
              for (let token of canvas.tokens.controlled) {
                  await token.document.update({ width: finalSize, height: finalSize });
              }

              ui.notifications.info(`Token size changed to ${finalSize}x${finalSize}.`);
          }
      },
      cancel: {
          label: "Cancel"
      }
  },
  default: "apply"
}).render(true);
