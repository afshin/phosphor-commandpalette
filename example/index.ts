/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  BoxPanel
} from 'phosphor-boxpanel';

import {
 CommandPalette, IStandardPaletteItemOptions, StandardPaletteModel
} from 'phosphor-commandpalette';


const p1 = new CommandPalette();
const p2 = new CommandPalette();

const m1 = new StandardPaletteModel();
const m2 = new StandardPaletteModel();

p1.model = m1;
p2.model = m2;


const outer = new BoxPanel();
const output = new BoxPanel();
const palettes = new BoxPanel();


var timeout: number;

function logHandler(args: any): void {
  if (timeout) clearTimeout(timeout);
  output.node.textContent = args.caption || args.text;
  timeout = setTimeout(() => { output.node.textContent = ''; }, 3000);
}


const p1ItemOptions = [
  createItemOpts('Ancient near east', 'Sumer', 'The Mesopotamian city-states'),
  createItemOpts('Ancient near east', 'Babylon', 'The city-state of Babylon'),
  createItemOpts('Ancient near east', 'Hittites', 'The Hittite empire'),
  createItemOpts('Ancient near east', 'Egypt', 'The Egyptian empire'),
  createItemOpts('Ancient near east', 'Persia', 'The Persian empire'),

  createItemOpts('Ancient Mesoamerica', 'Olmecs', 'The Olmec empire'),
  createItemOpts('Ancient Mesoamerica', 'Aztecs', 'The Aztec empire'),
  createItemOpts('Ancient Mesoamerica', 'Mayans', 'The Mayan empire'),

  createItemOpts('Ancient South America', 'Tiwanaku', 'The Tiwanaku'),
  createItemOpts('Ancient South America', 'Chimú', 'The Chimú culture'),
  createItemOpts('Ancient South America', 'Inca', 'The Incan empire'),

  createItemOpts('Ancient Africa', 'Carthage', 'The Carthaginian empire'),
  createItemOpts('Ancient Africa', 'Numidia', 'The kingdom of Numidia'),
  createItemOpts('Ancient Africa', 'Kush', 'The kushite empire')
];


const p2ItemOptions = [
  createItemOpts('Romance languages', 'Italian', 'lingua italiana'),
  createItemOpts('Romance languages', 'Romanian', 'limba română'),
  createItemOpts('Romance languages', 'French', 'le français'),
  createItemOpts('Romance languages', 'Spanish', 'español'),
  createItemOpts('Romance languages', 'Portuguese', 'língua portuguesa'),
  createItemOpts('Romance languages', 'Romansh', 'Romansh'),
  createItemOpts('Romance languages', 'Sicilian', 'lingua siciliana'),
  createItemOpts('Romance languages', 'Walloon', 'Walon'),
  createItemOpts('Romance languages', 'Catalan', 'català'),
  createItemOpts('Romance languages', 'Corsican', 'lingua corsa'),

  createItemOpts('Semitic languages', 'Arabic', 'العَرَبِية'),
  createItemOpts('Semitic languages', 'Amharic', 'አማርኛ'),
  createItemOpts('Semitic languages', 'Hebrew', 'עברית'),
  createItemOpts('Semitic languages', 'Tigrinya', 'ትግርኛ'),

  createItemOpts('Japonic languages', 'Japanese', '日本語'),
  createItemOpts('Japonic languages', 'Ryukyuan languages', '琉球語派'),

  createItemOpts('Algonquian languages', 'Arapaho', 'Hinónoʼeitíít'),
  createItemOpts('Algonquian languages', 'Ojibwe', 'ᐊᓂᔑᓈᐯᒧᐎᓐ'),
  createItemOpts('Algonquian languages', 'Massachusett', 'Massachusett'),
  createItemOpts('Algonquian languages', 'Unami', 'Unami'),

  createItemOpts('Iranian languages', 'Persian', 'فارسی'),
  createItemOpts('Iranian languages', 'Pashto', 'پښتو'),
  createItemOpts('Iranian languages', 'Kurdish', 'کوردی'),
  createItemOpts('Iranian languages', 'Balochi', 'بلوچی'),

  createItemOpts('Turkic languages', 'Turkish', 'Türkçe'),
  createItemOpts('Turkic languages', 'Azeri', 'Азәрбајҹан дили'),
  createItemOpts('Turkic languages', 'Uzbek', 'Oʻzbekcha'),
  createItemOpts('Turkic languages', 'Kazakh', 'قازاق ٴتىلى'),

  createItemOpts('Sino-Tibetan languages', 'Mandarin', '官话'),
  createItemOpts('Sino-Tibetan languages', 'Wu', '吴语'),
  createItemOpts('Sino-Tibetan languages', 'Min', '闽语'),
  createItemOpts('Sino-Tibetan languages', 'Cantonese', '广东话'),
  createItemOpts('Sino-Tibetan languages', 'Standard Tibetan', 'ལྷ་སའི་སྐད'),
  createItemOpts('Sino-Tibetan languages', 'Burmese', 'မြန်မာဘာသာ'),

  createItemOpts('Germanic languages', 'German', 'Deutsch'),
  createItemOpts('Germanic languages', 'English', 'English'),
  createItemOpts('Germanic languages', 'Scots', 'Scots'),
  createItemOpts('Germanic languages', 'Faroese', 'føroyskt'),
  createItemOpts('Germanic languages', 'Afrikaans', 'Afrikaans'),
  createItemOpts('Germanic languages', 'North Frisian', 'North Frisian'),
  createItemOpts('Germanic languages', 'West Frisian', 'West Frisian'),
  createItemOpts('Germanic languages', 'Saterland Frisian', 'Saterland Frisian'),
  createItemOpts('Germanic languages', 'Danish', 'dansk sprog'),
  createItemOpts('Germanic languages', 'Swedish', 'svenska'),
  createItemOpts('Germanic languages', 'Icelandic', 'íslenska'),
  createItemOpts('Germanic languages', 'Norwegian', 'norsk'),
  createItemOpts('Germanic languages', 'Dutch', 'Nederlands'),

  createItemOpts('Language isolates', 'Basque', 'Euskara'),
  createItemOpts('Language isolates', 'Korean', '한국어/조선말'),
  createItemOpts('Language isolates', 'Bangime', 'Baŋgɛri-mɛ'),
  createItemOpts('Language isolates', 'Hadza', 'Hazane'),
  createItemOpts('Language isolates', 'Sandawe', 'Sandaweeki'),
  createItemOpts('Language isolates', 'Ainu', 'アィヌ')
];


function createItemOpts(category: string, text: string, caption: string): IStandardPaletteItemOptions {
  let handler = logHandler;
  let args = { text, caption };
  return { text, caption, category, handler, args };
}


function main() {
  // Populate command palette models.
  m1.addItems(p1ItemOptions);
  m2.addItems(p2ItemOptions);

  // Populate palettes panel.
  BoxPanel.setStretch(p1, 1);
  BoxPanel.setStretch(p2, 1);
  palettes.direction = BoxPanel.LeftToRight;
  palettes.spacing = 5;
  palettes.addChild(p1);
  palettes.addChild(p2);

  // Populate output panel.
  output.id = 'output';
  BoxPanel.setSizeBasis(output, 60);
  BoxPanel.setStretch(palettes, 1);
  outer.direction = BoxPanel.TopToBottom;
  outer.spacing = 2;
  outer.addChild(palettes);
  outer.addChild(output);

  // Attach main panel to body.
  outer.id = 'main';
  outer.attach(document.body);
}


window.onload = main;
window.onresize = () => { outer.update(); };
