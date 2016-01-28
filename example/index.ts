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
  CommandItem, SimpleCommand
} from 'phosphor-command';

import {
 CommandPalette
} from 'phosphor-commandpalette';


const p1 = new CommandPalette();
const p2 = new CommandPalette();
const outer = new BoxPanel();
const output = new BoxPanel();
const palettes = new BoxPanel();

var timeout: number;

function createCommand(category: string, title: string, caption: string): CommandItem {
  let command = new SimpleCommand({
    handler: () => {
      if (timeout) clearTimeout(timeout);
      output.node.textContent = caption || title;
      timeout = setTimeout(() => { output.node.textContent = ''; }, 3000);
    },
    text: title,
    caption: caption,
    category: category
  });
  return new CommandItem({ command });
}


function main() {
  // Populate left palette commands.
  p1.add([
    createCommand('Ancient near east', 'Sumer', 'The Mesopotamian city-states'),
    createCommand('Ancient near east', 'Babylon', 'The city-state of Babylon'),
    createCommand('Ancient near east', 'Hittites', 'The Hittite empire'),
    createCommand('Ancient near east', 'Egypt', 'The Egyptian empire'),
    createCommand('Ancient near east', 'Persia', 'The Persian empire'),
    createCommand('Ancient Mesoamerica', 'Olmecs', 'The Olmec empire'),
    createCommand('Ancient Mesoamerica', 'Aztecs', 'The Aztec empire'),
    createCommand('Ancient Mesoamerica', 'Mayans', 'The Mayan empire'),
    createCommand('Ancient South American', 'Chimú', 'The Chimú culture'),
    createCommand('Ancient South American', 'Inca', 'The Incan empire')
  ]);
  p2.add([
    createCommand('Romance languages', 'Italian', ''),
    createCommand('Romance languages', 'Romanian', ''),
    createCommand('Romance languages', 'French', ''),
    createCommand('Romance languages', 'Spanish', ''),
    createCommand('Romance languages', 'Portuguese', ''),
    createCommand('Germanic languages', 'German', ''),
    createCommand('Germanic languages', 'English', ''),
    createCommand('Germanic languages', 'Danish', ''),
    createCommand('Germanic languages', 'Swedish', ''),
    createCommand('Germanic languages', 'Icelandic', ''),
    createCommand('Germanic languages', 'Norwegian', ''),
    createCommand('Germanic languages', 'Dutch', ''),
    createCommand('Isolate languages', 'Finnish', '')
  ]);
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
