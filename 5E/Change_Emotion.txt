// Define the emotions and corresponding image files
const emotions = {
  "Happy": "icons/tkn_Sanguro.png",  // Main token image
  "Neutral": "Icons/tkn_Sanguro_Neutral.png",
  "Sad": "Icons/tkn_Sanguro_Sad.png",
  "Angry": "Icons/tkn_Sanguro_Angry.png",
  "Surprised": "Icons/tkn_Sanguro_Shock.png",
  "Mmmmm": "Icons/tkn_Sanguro_MMM.png"
};

// Ensure the selected token is Sanguro
const token = canvas.tokens.controlled.find(t => t.name === "Sanguro");

if (!token) {
  return ui.notifications.warn("Please select the token for 'Sanguro'.");
}

// Create the dialog for emotion selection
new Dialog({
  title: "Select Emotion",
  content: `<form>
              <div class="form-group">
                <label>Choose Emotion:</label>
                <select id="emotion-select">
                  ${Object.keys(emotions).map(e => `<option value="${e}">${e}</option>`).join('')}
                </select>
              </div>
            </form>`,
  buttons: {
    change: {
      label: "Change Token Art",
      callback: (html) => {
        const emotion = html.find("#emotion-select").val();
        const imgPath = emotions[emotion];
        token.document.update({ img: imgPath });
      }
    },
    cancel: {
      label: "Cancel"
    }
  },
  default: "change"
}).render(true);