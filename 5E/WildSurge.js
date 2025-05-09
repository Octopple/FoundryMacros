// Wild Magic Surge Macro - Player-Friendly
// Works without requiring GM permissions and uses simple animations.

const useAnimations = true; // Set to false if you don't want animations

// Define the Good table entries
const goodEntries = [
  { range: [1, 4], text: "Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls." },
  { range: [5, 8], text: "A Friendly creature appears in a random unoccupied space within 60 feet of you. The creature disappears after 1 minute. Roll 1d4 for the creature: 1 - Modron Duodrone, 2 - Flumph, 3 - Modron Monodrone, 4 - Unicorn." },
  { range: [9, 12], text: "For the next minute, you regain 5 Hit Points at the start of each of your turns." },
  { range: [13, 16], text: "Creatures have Disadvantage on saving throws against the next spell you cast in the next minute that requires a saving throw." },
  { range: [17, 20], text: "You experience a random effect that lasts for 1 minute: 1 - ethereal music only you and creatures within 5 feet can hear; 2 - size increases by one category; 3 - grow a feather beard that explodes when you sneeze; 4 - must shout when you speak; 5 - illusory butterflies flutter around you; 6 - eye on forehead granting Advantage on Wisdom (Perception); 7 - pink bubbles float out of your mouth when you speak; 8 - skin turns blue for 24 hours or until Remove Curse." },
  { range: [21, 24], text: "For the next minute, your spells with a casting time of an action have a casting time of a Bonus Action." },
  { range: [25, 28], text: "You are transported to the Astral Plane until the end of your next turn. You return to the space you previously occupied or the nearest unoccupied space." },
  { range: [29, 32], text: "The next time you cast a spell that deals damage within the next minute, maximize each damage die instead of rolling." },
  { range: [33, 36], text: "You have Resistance to all damage for the next minute." },
  { range: [37, 40], text: "You turn into a potted plant until the start of your next turn. While a plant, you are Incapacitated and have Vulnerability to all damage. If reduced to 0 HP, you revert to normal and the pot breaks." },
  { range: [41, 44], text: "For the next minute, you can teleport up to 20 feet as a Bonus Action on each of your turns." },
  { range: [45, 48], text: "You and up to three creatures you choose within 30 feet are Invisible for 1 minute. The invisibility ends on a creature if it attacks, deals damage, or casts a spell." },
  { range: [49, 52], text: "A spectral shield hovers near you for the next minute, granting you a +2 bonus to AC and immunity to Magic Missile." },
  { range: [53, 56], text: "You can take one extra action on this turn." },
  { range: [57, 60], text: "You cast a random spell. Roll 1d10 for the spell: 1 - Confusion, 2 - Fireball, 3 - Fog Cloud, 4 - Fly (random creature within 60 feet), 5 - Grease, 6 - Levitate (self), 7 - Magic Missile (level 5), 8 - Mirror Image, 9 - Polymorph (self, into Goat), 10 - See Invisibility." },
  { range: [61, 64], text: "For the next minute, any flammable, nonmagical object you touch ignites, dealing 1d4 Fire damage and burning." },
  { range: [65, 68], text: "If you die within the next hour, you revive immediately as if by the Reincarnate spell." },
  { range: [69, 72], text: "You have the Frightened condition until the end of your next turn. The DM determines the source of your fear." },
  { range: [73, 76], text: "You teleport up to 60 feet to an unoccupied space you can see." },
  { range: [77, 80], text: "A random creature within 60 feet has the Poisoned condition for 1d4 hours." },
  { range: [81, 84], text: "You radiate Bright Light in a 30-foot radius for the next minute. Any creature ending its turn within 5 feet of you is Blinded until the end of its next turn." },
  { range: [85, 88], text: "Up to three creatures of your choice within 30 feet take 1d10 Necrotic damage. You regain HP equal to the Necrotic damage dealt." },
  { range: [89, 92], text: "Up to three creatures of your choice within 30 feet take 4d10 Lightning damage." },
  { range: [93, 96], text: "You and all creatures within 30 feet have Vulnerability to Piercing damage for the next minute." },
  { range: [97, 100], text: "Roll 1d6 for the effect: 1 - you regain 2d10 HP; 2 - one ally regains 2d10 HP; 3 - regain your lowest-level expended spell slot; 4 - ally regains lowest-level spell slot; 5 - regain all expended Sorcery Points; 6 - effects from rows 17–20 all occur." }
];

// Define the Chaos table entries
const chaosEntries = [
  { range: [1, 2], text: "Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls." },
  { range: [3, 4], text: "For the next minute, you can see any invisible creature if you have line of sight to it." },
  { range: [5, 6], text: "A modron chosen and controlled by the DM appears in an unoccupied space within 5 feet of you, then disappears 1 minute later." },
  { range: [7, 8], text: "You cast fireball as a 3rd-level spell centered on yourself." },
  { range: [9, 10], text: "You cast magic missile as a 5th-level spell." },
  { range: [11, 12], text: "Roll a d10. Your height changes by a number of inches equal to the roll. If the roll is odd, you shrink. If the roll is even, you grow." },
  { range: [13, 14], text: "You cast confusion centered on yourself." },
  { range: [15, 16], text: "For the next minute, you regain 5 hit points at the start of each of your turns." },
  { range: [17, 18], text: "You grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode out from your face." },
  { range: [19, 20], text: "You cast grease centered on yourself." },
  { range: [21, 22], text: "Creatures have disadvantage on saving throws against the next spell you cast in the next minute that involves a saving throw." },
  { range: [23, 24], text: "Your skin turns a vibrant shade of blue. A remove curse spell can end this effect." },
  { range: [25, 26], text: "An eye appears on your forehead for the next minute. During that time, you have advantage on Wisdom (Perception) checks that rely on sight." },
  { range: [27, 28], text: "For the next minute, all your spells with a casting time of 1 action have a casting time of 1 bonus action." },
  { range: [29, 30], text: "You teleport up to 60 feet to an unoccupied space of your choice that you can see." },
  { range: [31, 32], text: "You are transported to the Astral Plane until the end of your next turn, after which time you return to the space you previously occupied or the nearest unoccupied space if that space is occupied." },
  { range: [33, 34], text: "Maximize the damage of the next damaging spell you cast within the next minute." },
  { range: [35, 36], text: "Roll a d10. Your age changes by a number of years equal to the roll. If the roll is odd, you get younger (minimum 1 year old). If the roll is even, you get older." },
  { range: [37, 38], text: "1d6 flumphs controlled by the DM appear in unoccupied spaces within 60 feet of you and are frightened of you. They vanish after 1 minute." },
  { range: [39, 40], text: "You regain 2d10 hit points." },
  { range: [41, 42], text: "You turn into a potted plant until the start of your next turn. While a plant, you are incapacitated and have vulnerability to all damage. If you drop to 0 hit points, your pot breaks, and your form reverts." },
  { range: [43, 44], text: "For the next minute, you can teleport up to 20 feet as a bonus action on each of your turns." },
  { range: [45, 46], text: "You cast levitate on yourself." },
  { range: [47, 48], text: "A unicorn controlled by the DM appears in a space within 5 feet of you, then disappears 1 minute later." },
  { range: [49, 50], text: "You can't speak for the next minute. Whenever you try, pink bubbles float out of your mouth." },
  { range: [51, 52], text: "A spectral shield hovers near you for the next minute, granting you a +2 bonus to AC and immunity to magic missile." },
  { range: [53, 54], text: "You are immune to being intoxicated by alcohol for the next 5d6 days." },
  { range: [55, 56], text: "Your hair falls out but grows back within 24 hours." },
  { range: [57, 58], text: "For the next minute, any flammable object you touch that isn't being worn or carried by another creature bursts into flame." },
  { range: [59, 60], text: "You regain your lowest-level expended spell slot." },
  { range: [61, 62], text: "For the next minute, you must shout when you speak." },
  { range: [63, 64], text: "You cast fog cloud centered on yourself." },
  { range: [65, 66], text: "Up to three creatures you choose within 30 feet of you take 4d10 lightning damage." },
  { range: [67, 68], text: "You are frightened by the nearest creature until the end of your next turn." },
  { range: [69, 70], text: "Each creature within 30 feet of you becomes invisible for the next minute. The invisibility ends on a creature when it attacks or casts a spell." },
  { range: [71, 72], text: "You gain resistance to all damage for the next minute." },
  { range: [73, 74], text: "A random creature within 60 feet of you becomes poisoned for 1d4 hours." },
  { range: [75, 76], text: "You glow with bright light in a 30-foot radius for the next minute. Any creature that ends its turn within 5 feet of you is blinded until the end of its next turn." },
  { range: [77, 78], text: "You cast polymorph on yourself. If you fail the saving throw, you turn into a sheep for the spell's duration." },
  { range: [79, 80], text: "Illusory butterflies and flower petals flutter in the air within 10 feet of you for the next minute." },
  { range: [81, 82], text: "You can take one additional action immediately." },
  { range: [83, 84], text: "Each creature within 30 feet of you takes 1d10 necrotic damage. You regain hit points equal to the sum of the necrotic damage dealt." },
  { range: [85, 86], text: "You cast mirror image." },
  { range: [87, 88], text: "You cast fly on a random creature within 60 feet of you." },
  { range: [89, 90], text: "You become invisible for the next minute. During that time, other creatures can't hear you. The invisibility ends if you attack or cast a spell." },
  { range: [91, 92], text: "If you die within the next minute, you immediately come back to life as if by the reincarnate spell." },
  { range: [93, 94], text: "Your size increases by one size category for the next minute." },
  { range: [95, 96], text: "You and all creatures within 30 feet of you gain vulnerability to piercing damage for the next minute." },
  { range: [97, 98], text: "You are surrounded by faint, ethereal music for the next minute." },
  { range: [99, 100], text: "You regain all expended sorcery points." }
];

// Perform the coin flip: 1 = heads (Good), 2 = tails (Chaos)
let coinFlipRoll = await (new Roll("1d2")).evaluate({ async: true });
await game.dice3d?.showForRoll(coinFlipRoll); // Dice So Nice! visualization
let coinFlip = coinFlipRoll.total;
let selectedTableName = (coinFlip === 1) ? "Good" : "Chaos";
let selectedTableEntries = (coinFlip === 1) ? goodEntries : chaosEntries;
let resultMessage = (coinFlip === 1) ? "<b>Heads!</b> Rolling on the <b>Good</b> table..." : "<b>Tails!</b> Rolling on the <b>Chaos</b> table...";

// Roll a d100 to determine the effect
let roll = await (new Roll("1d100")).evaluate({ async: true });
await game.dice3d?.showForRoll(roll); // Dice So Nice! visualization

// Find the appropriate entry based on the roll result
let effect = selectedTableEntries.find(entry => roll.total >= entry.range[0] && roll.total <= entry.range[1])?.text;

// Send the result to chat
ChatMessage.create({
  speaker: { alias: "Wild Magic Surge" },
  content: `
    <div class="wild-magic-result">
      <h2>Wild Magic Surge</h2>
      <p>${resultMessage}</p>
      <p><b>Roll:</b> ${roll.total}</p>
      <p><b>Result:</b> ${effect || "No valid effect found!"}</p>
    </div>
    <style>
      .wild-magic-result {
        border: 1px solid #4b8dbf;
        padding: 10px;
        border-radius: 5px;
        background-color: #f4f4e1;
        text-align: center;
      }
      .wild-magic-result h2 {
        color: #8b4513;
        margin: 0;
      }
    </style>
  `
});