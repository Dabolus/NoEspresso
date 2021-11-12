const kDefaultBlockStrength = 40;

const kColorDeficiencyTable = [
  {
    name: 'None',
    values: null, // Don't use filter
  },
  {
    name: 'Protanopia',
    values:
      '0.567 0.433 0 0 0    0.558 0.442 0 0 0      0 0.242 0.758 0 0      0 0 0 1 0',
  },
  {
    name: 'Protanomaly',
    values:
      '0.817 0.183 0 0 0    0.333 0.667 0 0 0      0 0.125 0.875 0 0      0 0 0 1 0',
  },
  {
    name: 'Deuteranopia',
    values:
      '0.625 0.375 0 0 0    0.7 0.3 0 0 0        0 0.3 0.7 0 0        0 0 0 1 0',
  },
  {
    name: 'Deuteranomaly',
    values:
      '0.8 0.2 0 0 0      0.258 0.742 0 0 0      0 0.142 0.858 0 0      0 0 0 1 0',
  },
  {
    name: 'Tritanopia',
    values:
      '0.95 0.05 0 0 0      0 0.433 0.567 0 0      0 0.475 0.525 0 0      0 0 0 1 0',
  },
  {
    name: 'Tritanomaly',
    values:
      '0.967 0.033 0 0 0    0 0.733 0.267 0 0      0 0.183 0.817 0 0      0 0 0 1 0',
  },
  {
    name: 'Achromatopsia (no color)',
    values:
      '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0    0.299 0.587 0.114 0 0    0 0 0 1 0',
  },
  {
    name: 'Achromatomaly',
    values:
      '0.618 0.320 0.062 0 0  0.163 0.775 0.062 0 0    0.163 0.320 0.516 0 0    0 0 0 1 0',
  },
];

function updateSettingsImpl() {
  let blockTypeRadio = document.querySelector(
    'input[type="radio"][name="blockType"]:checked'
  );
  let blockType = blockTypeRadio ? blockTypeRadio.id : 'noBlock';
  let colorDeficiencyTypeIndex = document.getElementById('color').selectedIndex;
  const includeCursorCheckbox = document.querySelector(
    'input[type="checkbox"][name="includeCursor"]'
  );
  browser.extension.getBackgroundPage().updateSettings({
    blurLevel: parseInt(document.getElementById('blur').value),
    contrastLevel: parseInt(document.getElementById('contrast').value),
    brightnessLevel: parseInt(document.getElementById('brightness').value),
    ghostingLevel: parseInt(document.getElementById('ghosting').value),
    snowLevel: parseInt(document.getElementById('snow').value),
    cloudyLevel: parseInt(document.getElementById('cloudy').value),
    flutterLevel: parseInt(document.getElementById('flutter').value),
    colorDeficiencyTypeIndex: colorDeficiencyTypeIndex,
    colorDeficiencyMatrixValues:
      kColorDeficiencyTable[colorDeficiencyTypeIndex].values,
    blockType: blockType,
    blockStrength: parseInt(document.getElementById('blockStrength').value),
    includeCursor: includeCursorCheckbox.checked,
  });
}

function updateSettings() {
  setTimeout(updateSettingsImpl, 0); // Delay so that reset button is finished changing settings
}

function updateValue(type, value) {
  const inputs = document.querySelectorAll(`.${type}`);
  for (let count = 0; count < inputs.length; count++) {
    inputs[count].value = value;
  }
}

function updateOneSetting(evt) {
  if (evt.target.localName === 'input' && evt.target.hasAttribute('value')) {
    updateValue(evt.target.className, evt.target.value);
  }
  updateSettings();
}

function visitLink() {
  chrome.tabs.create({ url: this.getAttribute('href') });
}

function createColorDeficiencyOptions(settings) {
  let colorSelect = document.getElementById('color');
  for (let index = 0; index < kColorDeficiencyTable.length; index++) {
    let option = document.createElement('option');
    option.innerText = kColorDeficiencyTable[index].name;
    colorSelect.add(option);
  }
  colorSelect.selectedIndex = settings.colorDeficiencyTypeIndex || 0;
}

function focusEventTarget(evt) {
  setTimeout(function () {
    evt.target.focus();
  }, 0);
}

document.addEventListener('DOMContentLoaded', function () {
  let settings = browser.extension.getBackgroundPage().getSettings();
  document.getElementById('blur').focus();
  updateValue('blur', settings.blurLevel || 0);
  updateValue('contrast', settings.contrastLevel || 0);
  updateValue('brightness', settings.brightnessLevel || 0);
  updateValue('ghosting', settings.ghostingLevel || 0);
  updateValue('snow', settings.snowLevel || 0);
  updateValue('cloudy', settings.cloudyLevel || 0);
  updateValue('flutter', settings.flutterLevel || 0);
  updateValue('blockStrength', settings.blockStrength || kDefaultBlockStrength);

  createColorDeficiencyOptions(settings);

  // ----------------------------------------------------------------------
  // Block type radio
  let blockType = settings.blockType || 'noBlock';
  document.visionSettings[blockType].checked = 'checked';
  // ----------------------------------------------------------------------

  // ----------------------------------------------------------------------
  // Experimental settings
  const includeCursor = settings.includeCursor || false;
  if (includeCursor) {
    document.visionSettings.includeCursor.checked = 'checked';
  }
  // ----------------------------------------------------------------------

  updateSettings();

  // Add listeners
  document.visionSettings.addEventListener('input', updateOneSetting);
  document.visionSettings.addEventListener('change', updateSettings);
  document.visionSettings.addEventListener('select', updateSettings);
  document.visionSettings.addEventListener('reset', updateSettings);

  // Make links work
  let links = document.querySelectorAll('a[href]');
  for (var linkNum = 0; linkNum < links.length; linkNum++) {
    links[linkNum].addEventListener('click', visitLink);
  }

  // Make sliders focus on click
  let sliders = document.querySelectorAll('input[type="range"]');
  for (var sliderNum = 0; sliderNum < sliders.length; sliderNum++) {
    sliders[sliderNum].addEventListener('mousedown', focusEventTarget);
  }
});
