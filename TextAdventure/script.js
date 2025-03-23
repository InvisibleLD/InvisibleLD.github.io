let userInput;
let generateButton;
let randomButton;
let passwordDisplay;
let generatedPassword = "";

function setup() {
  noCanvas();

  createP("Your input (max 10 characters):");

  userInput = createInput();
  userInput.attribute('maxlength', '10');

  generateButton = createButton("Generate Based on Input");
  generateButton.mousePressed(generateFromInput);

  randomButton = createButton("Generate Random Password");
  randomButton.mousePressed(generatePureRandom);

  passwordDisplay = createP("Generated password will appear here.");
}

function generateFromInput() {
  let input = userInput.value().replace(/[^a-zA-Z0-9]/g, "");
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  if (input.length === 0) {
    passwordDisplay.html("Please enter some characters or use the Random button.");
    generatedPassword = "";
    return;
  }

  // Check repeate character
  const uniqueChars = [...new Set(input.split(''))];
  let extended = input;

  while (extended.length < 10) {
    let randomChar = chars.charAt(floor(random(chars.length)));

    // If input is all same, avoid adding repeatedly
    if (uniqueChars.length === 1 && randomChar === uniqueChars[0]) {
      continue;
    }

    extended += randomChar;
  }

  generatedPassword = shuffleString(extended);
  passwordDisplay.html(generatedPassword);
}

function generatePureRandom() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(floor(random(chars.length)));
  }
  generatedPassword = password;
  passwordDisplay.html(generatedPassword);
}

function shuffleString(str) {
  let arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}