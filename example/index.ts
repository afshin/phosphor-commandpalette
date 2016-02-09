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

import {
  Widget
} from 'phosphor-widget';


const EMPIRES = [
  { category: 'Ancient near east', text: 'Sumer', caption: 'The Mesopotamian city-states' },
  { category: 'Ancient near east', text: 'Babylon', caption: 'The city-state of Babylon' },
  { category: 'Ancient near east', text: 'Hittites', caption: 'The Hittite empire' },
  { category: 'Ancient near east', text: 'Egypt', caption: 'The Egyptian empire' },
  { category: 'Ancient near east', text: 'Persia', caption: 'The Persian empire' },

  { category: 'Ancient Mesoamerica', text: 'Olmecs', caption: 'The Olmec empire' },
  { category: 'Ancient Mesoamerica', text: 'Aztecs', caption: 'The Aztec empire' },
  { category: 'Ancient Mesoamerica', text: 'Mayans', caption: 'The Mayan empire' },

  { category: 'Ancient South America', text: 'Tiwanaku', caption: 'The Tiwanaku' },
  { category: 'Ancient South America', text: 'Chimú', caption: 'The Chimú culture' },
  { category: 'Ancient South America', text: 'Inca', caption: 'The Incan empire' },

  { category: 'Ancient Africa', text: 'Carthage', caption: 'The Carthaginian empire' },
  { category: 'Ancient Africa', text: 'Numidia', caption: 'The kingdom of Numidia' },
  { category: 'Ancient Africa', text: 'Kush', caption:'The kushite empire' }
];


const LANGUAGES = [
  { category: 'Romance languages', text: 'Italian', caption: 'lingua italiana' },
  { category: 'Romance languages', text: 'Romanian', caption: 'limba română' },
  { category: 'Romance languages', text: 'French', caption: 'le français' },
  { category: 'Romance languages', text: 'Spanish', caption: 'español' },
  { category: 'Romance languages', text: 'Portuguese', caption: 'língua portuguesa' },
  { category: 'Romance languages', text: 'Romansh', caption: 'Romansh' },
  { category: 'Romance languages', text: 'Sicilian', caption: 'lingua siciliana' },
  { category: 'Romance languages', text: 'Walloon', caption: 'Walon' },
  { category: 'Romance languages', text: 'Catalan', caption: 'català' },
  { category: 'Romance languages', text: 'Corsican', caption: 'lingua corsa' },

  { category: 'Semitic languages', text: 'Arabic', caption: 'العَرَبِية' },
  { category: 'Semitic languages', text: 'Amharic', caption: 'አማርኛ' },
  { category: 'Semitic languages', text: 'Hebrew', caption: 'עברית' },
  { category: 'Semitic languages', text: 'Tigrinya', caption: 'ትግርኛ' },

  { category: 'Japonic languages', text: 'Japanese', caption: '日本語' },
  { category: 'Japonic languages', text: 'Ryukyuan languages', caption: '琉球語派' },

  { category: 'Algonquian languages', text: 'Arapaho', caption: 'Hinónoʼeitíít' },
  { category: 'Algonquian languages', text: 'Ojibwe', caption: 'ᐊᓂᔑᓈᐯᒧᐎᓐ' },
  { category: 'Algonquian languages', text: 'Massachusett', caption: 'Massachusett' },
  { category: 'Algonquian languages', text: 'Unami', caption: 'Unami' },

  { category: 'Iranian languages', text: 'Persian', caption: 'فارسی' },
  { category: 'Iranian languages', text: 'Pashto', caption: 'پښتو' },
  { category: 'Iranian languages', text: 'Kurdish', caption: 'کوردی' },
  { category: 'Iranian languages', text: 'Balochi', caption: 'بلوچی' },

  { category: 'Turkic languages', text: 'Turkish', caption: 'Türkçe' },
  { category: 'Turkic languages', text: 'Azeri', caption: 'Азәрбајҹан дили' },
  { category: 'Turkic languages', text: 'Uzbek', caption: 'Oʻzbekcha' },
  { category: 'Turkic languages', text: 'Kazakh', caption: 'قازاق ٴتىلى' },

  { category: 'Sino-Tibetan languages', text: 'Mandarin', caption: '官话' },
  { category: 'Sino-Tibetan languages', text: 'Wu', caption: '吴语' },
  { category: 'Sino-Tibetan languages', text: 'Min', caption: '闽语' },
  { category: 'Sino-Tibetan languages', text: 'Cantonese', caption: '广东话' },
  { category: 'Sino-Tibetan languages', text: 'Standard Tibetan', caption: 'ལྷ་སའི་སྐད' },
  { category: 'Sino-Tibetan languages', text: 'Burmese', caption: 'မြန်မာဘာသာ' },

  { category: 'Germanic languages', text: 'German', caption: 'Deutsch' },
  { category: 'Germanic languages', text: 'English', caption: 'English' },
  { category: 'Germanic languages', text: 'Scots', caption: 'Scots' },
  { category: 'Germanic languages', text: 'Faroese', caption: 'føroyskt' },
  { category: 'Germanic languages', text: 'Afrikaans', caption: 'Afrikaans' },
  { category: 'Germanic languages', text: 'North Frisian', caption: 'North Frisian' },
  { category: 'Germanic languages', text: 'West Frisian', caption: 'West Frisian' },
  { category: 'Germanic languages', text: 'Saterland Frisian', caption: 'Saterland Frisian' },
  { category: 'Germanic languages', text: 'Danish', caption: 'dansk sprog' },
  { category: 'Germanic languages', text: 'Swedish', caption: 'svenska' },
  { category: 'Germanic languages', text: 'Icelandic', caption: 'íslenska' },
  { category: 'Germanic languages', text: 'Norwegian', caption: 'norsk' },
  { category: 'Germanic languages', text: 'Dutch', caption: 'Nederlands' },

  { category: 'Language isolates', text: 'Basque', caption: 'Euskara' },
  { category: 'Language isolates', text: 'Korean', caption: '한국어/조선말' },
  { category: 'Language isolates', text: 'Bangime', caption: 'Baŋgɛri-mɛ' },
  { category: 'Language isolates', text: 'Hadza', caption: 'Hazane' },
  { category: 'Language isolates', text: 'Sandawe', caption: 'Sandaweeki' },
  { category: 'Language isolates', text: 'Ainu', caption: 'アィヌ' }
];


interface IItemData {
  category: string;
  text: string;
  caption: string;
}


function logHandler(args: any): void {
  document.getElementById('output').textContent = args.caption;
}


function createOptions(data: IItemData): IStandardPaletteItemOptions {
  let { category, text, caption } = data;
  return { category, text, caption, handler: logHandler, args: { caption } };
}


function main() {
  let p1 = new CommandPalette();
  let m1 = new StandardPaletteModel();
  m1.addItems(EMPIRES.map(createOptions));
  p1.model = m1;

  let p2 = new CommandPalette();
  let m2 = new StandardPaletteModel();
  m2.addItems(LANGUAGES.map(createOptions));
  p2.model = m2;

  let output = new Widget();
  output.id = 'output';

  let palettes = new BoxPanel();
  palettes.direction = BoxPanel.LeftToRight;
  palettes.spacing = 4;

  let outer = new BoxPanel();
  outer.id = 'main';
  outer.direction = BoxPanel.TopToBottom;
  outer.spacing = 4;

  BoxPanel.setStretch(p1, 1);
  BoxPanel.setStretch(p2, 1);

  BoxPanel.setSizeBasis(output, 60);
  BoxPanel.setStretch(palettes, 1);

  palettes.addChild(p1);
  palettes.addChild(p2);

  outer.addChild(palettes);
  outer.addChild(output);

  outer.attach(document.body);

  window.onresize = () => { outer.update(); };
}


window.onload = main;
