// Ensure the token is selected
if (canvas.tokens.controlled.length === 0) {
    ui.notifications.warn("Please select Sanguro!");
    return;
}

// Assuming Sanguro is the selected token
let sanguro = canvas.tokens.controlled.find(t => t.name === "Sanguro");

if (!sanguro) {
    ui.notifications.warn("Sanguro is not selected!");
    return;
}

// Path to the sleep icon (ensure you place the actual image in your Foundry VTT folder structure)
const sleepIconPath = "icons/svg/sleep.svg"; // Replace with your actual file path

// Variations of flavor text for sleeping in soil with nature effects
const soilSleepMessages = [
    "Sanguro digs a small hole in the soil, snuggles into the ground, and plants himself before drifting into a peaceful sleep as fireflies glow softly around him.",
    "Finding a soft patch of soil, Sanguro burrows in, his roots nestling into the earth as he gently falls asleep, accompanied by the soft rustling of leaves in the wind.",
    "Sanguro carefully digs into the ground, wrapping himself in the warm embrace of the soil. Nearby, a gentle breeze carries the scent of flowers, and he falls asleep with a smile.",
    "With a smile, Sanguro plants himself into the soil, feeling at home as the earth's warmth lulls him into a deep sleep. The distant call of a night owl comforts him.",
    "Sanguro burrows into the earth, feeling the connection with the soil as the stars twinkle above. A few nearby crickets begin their nightly song as Sanguro peacefully drifts off to sleep."
];

// Variations of flavor text for sleeping without soil with nature effects
const nonSoilSleepMessages = [
    "Sanguro finds a comfortable spot, curls up, and slowly drifts off to sleep as a gentle breeze carries the scent of pine needles and forest flowers.",
    "Without soil to plant himself, Sanguro makes do with a soft bed of leaves. He falls asleep as fireflies dance above him and the sound of a nearby stream hums gently in the distance.",
    "Sanguro lies down gently, closing his eyes while the nearby trees sway softly in the wind, their branches whispering lullabies to him as he drifts to sleep.",
    "Snuggling up in a cozy corner, Sanguro lets out a content sigh. The distant hoot of an owl and the chirping of crickets guide him into a deep and restful sleep.",
    "Sanguro curls up under the open sky, where a few stars peek through the clouds. The soft rustling of leaves and the cool night air help Sanguro ease into slumber."
];

// Create a dialog for selecting whether Sanguro is in soil
new Dialog({
    title: "Sanguro Goes to Sleep",
    content: `
        <form>
            <div class="form-group">
                <label>Is Sanguro outside in soil?</label>
                <input type="checkbox" id="soil-checkbox"/>
            </div>
        </form>
    `,
    buttons: {
        sleep: {
            label: "Sleep",
            callback: (html) => {
                // Check if the soil checkbox is selected
                let isInSoil = html.find("#soil-checkbox").is(":checked");

                // Pick a random message from the appropriate list
                let sleepMessage = isInSoil 
                    ? soilSleepMessages[Math.floor(Math.random() * soilSleepMessages.length)]
                    : nonSoilSleepMessages[Math.floor(Math.random() * nonSoilSleepMessages.length)];

                // Send the chat message with the image
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ token: sanguro }),
                    content: `<h3><img src="${sleepIconPath}" width="40" style="vertical-align:middle; margin-right: 5px;" />Sanguro Goes to Sleep</h3>${sleepMessage}`,
                });
            }
        },
        cancel: {
            label: "Cancel"
        }
    },
    default: "sleep"
}).render(true);