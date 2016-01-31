/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays from 'phosphor-arrays';

import {
  Command, CommandItem
} from 'phosphor-command';

import {
  Message
} from 'phosphor-messaging';

import {
  Property, clearPropertyData
} from 'phosphor-properties';

import {
  Widget
} from 'phosphor-widget';

import {
  FuzzyMatcher, ICommandSearchItem, ICommandMatchResult
} from './matcher';

import './index.css';


/**
 * The class name added to `CommandPalette` instances.
 */
const PALETTE_CLASS = 'p-CommandPalette';

/**
 * The data attribute name for command palette item registrations.
 */
const REGISTRATION_ID = 'data-registration-id';

/**
 * The class name added to the content section of the palette.
 */
const CONTENT_CLASS = 'p-CommandPalette-content';

/**
 * The class name added to the search section of the palette.
 */
const SEARCH_CLASS = 'p-CommandPalette-search';

/**
 * The class name added to palette section headers.
 */
const HEADER_CLASS = 'p-CommandPalette-header';

/**
 * The class name added to the input wrapper in the search section.
 */
const INPUT_CLASS = 'p-CommandPalette-inputWrapper';

/**
 * The class name added to disabled palette items.
 */
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to the currently active palette item.
 */
const ACTIVE_CLASS = 'p-mod-active';

/**
 * The class name added to each palette item.
 */
const COMMAND_CLASS = 'p-CommandPalette-command';

/**
 * The class name added to the first line of a palette item.
 */
const COMMAND_TOP_CLASS = 'p-CommandPalette-commandTop';

/**
 * The class name added to the second line of a palette item.
 */
const COMMAND_BOTTOM_CLASS = 'p-CommandPalette-commandBottom';

/**
 * The class name added to an item caption.
 */
const CAPTION_CLASS = 'p-CommandPalette-caption';

/**
 * The class name added to an item shortcut.
 */
const SHORTCUT_CLASS = 'p-CommandPalette-shortcut';

/**
 * The class name added to an item title.
 */
const TITLE_CLASS = 'p-CommandPalette-title';

/**
 * The `keyCode` value for the enter key.
 */
const ENTER = 13;

/**
 * The `keyCode` value for the escape key.
 */
const ESCAPE = 27;

/**
 * The `keyCode` value for the up arrow key.
 */
const UP_ARROW = 38;

/**
 * The `keyCode` value for the down arrow key.
 */
const DOWN_ARROW = 40;

/**
 * A map of the special `keyCode` values a command palette uses for navigation.
 */
const FN_KEYS: { [key: string]: void } = {
  [ENTER]: null,
  [ESCAPE]: null,
  [UP_ARROW]: null,
  [DOWN_ARROW]: null
};

/**
 * A singleton instance of the fuzzy matcher used for search results.
 */
const matcher = new FuzzyMatcher('primary', 'secondary');

/**
 * The seed value for registration IDs that are generated for palette items.
 */
var registrationSeed = 0;


/**
 * The scroll directions for changing the active command.
 */
const enum ScrollDirection {
  /**
   * Move the active selection up.
   */
  Up,
  /**
   * Move the active selection down.
   */
  Down
}

/**
 * Test to see if a child node needs to be scrolled to within its parent node.
 *
 * @param parentNode - The element containing the child being checked.
 *
 * @param childNode - The child element whose visibility is being checked.
 *
 * @returns true if the parent node needs to be scrolled to reveal the child.
 */
function scrollTest(parentNode: HTMLElement, childNode: HTMLElement): boolean {
  let parent = parentNode.getBoundingClientRect();
  let child = childNode.getBoundingClientRect();
  return child.top < parent.top || child.top + child.height > parent.bottom;
}


/**
 * A group of items that the command palette can render.
 */
interface ICommandPaletteSection {
  /**
   * The heading for the command section.
   */
  title: string;
  /**
   * The internal registration IDs of the command palette items.
   */
  registrations: string[];
};


/**
 * A widget which displays registered commands and allows them to be executed.
 */
export
class CommandPalette extends Widget {
  /**
   * A property that holds the registration ID for each `CommandItem`.
   */
  static idProperty = new Property<CommandItem, string>({
    name: 'id',
    value: ''
  });

  /**
   * Create the DOM node for a command palette.
   *
   * #### Notes
   * This method may be reimplemented to create a custom root node.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('ul');
    let search = document.createElement('div');
    let input = document.createElement('input');
    let wrapper = document.createElement('div');
    content.className = CONTENT_CLASS;
    search.className = SEARCH_CLASS;
    wrapper.className = INPUT_CLASS;
    wrapper.appendChild(input);
    search.appendChild(wrapper);
    node.appendChild(search);
    node.appendChild(content);
    return node;
  }

  /**
   * Create a new header node for a command palette section.
   *
   * @param title - The palette section title
   *
   * @returns A new DOM node to use as a header in a command palette section.
   *
   * #### Notes
   * This method may be reimplemented to create custom headers.
   */
  static createHeaderNode(title: string): HTMLElement {
    let node = document.createElement('li');
    let span = document.createElement('span');
    let hr = document.createElement('hr');
    node.className = HEADER_CLASS;
    span.textContent = title;
    node.appendChild(span);
    node.appendChild(hr);
    return node;
  }

  /**
   * Create a new item node for a command palette.
   *
   * @param id - The registration ID for a `CommandItem`.
   *
   * @param item - The `CommandItem` to render.
   *
   * @returns A new DOM node to use as an item in a command palette.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createItemNode(item: CommandItem): HTMLElement {
    let node = document.createElement('li');
    let top = document.createElement('div');
    let bottom = document.createElement('div');
    let title = document.createElement('span');
    let shortcut = document.createElement('span');
    let caption = document.createElement('span');
    let id = this.idProperty.get(item);
    // Set the styles for each element.
    node.className = COMMAND_CLASS;
    if (!item.isEnabled) node.classList.add(DISABLED_CLASS);
    top.className = COMMAND_TOP_CLASS;
    bottom.className = COMMAND_BOTTOM_CLASS;
    title.className = TITLE_CLASS;
    shortcut.className = SHORTCUT_CLASS;
    caption.className = CAPTION_CLASS;
    // Populate the content and attributes for each element.
    node.setAttribute(REGISTRATION_ID, id);
    title.textContent = item.text;
    title.setAttribute('title', item.text);
    if (item.shortcut) shortcut.textContent = item.shortcut;
    if (item.caption) {
      caption.textContent = item.caption;
      caption.setAttribute('title', item.caption);
    }
    // Compose the node.
    top.appendChild(title);
    top.appendChild(shortcut);
    bottom.appendChild(caption);
    node.appendChild(top);
    node.appendChild(bottom);
    return node;
  }

  /**
   * Create a new section document fragment for a command palette.
   *
   * @param title - The section heading.
   *
   * @param items - The `CommandItem`s and registration IDs for a section.
   *
   * @returns A `DocumentFragment` with the whole rendered section.
   *
   * #### Notes
   * This method may be reimplemented to create custom sections.
   */
  static createSectionFragment(title: string, items: CommandItem[]): DocumentFragment {
    let fragment = document.createDocumentFragment();
    fragment.appendChild(this.createHeaderNode(title));
    items.forEach(item => {
      fragment.appendChild(this.createItemNode(item));
    });
    return fragment;
  }

  /**
   * Get the command palette content node.
   *
   * #### Notes
   * This is the node which holds the command palette item nodes.
   *
   * Modifying this node directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
  }

  /**
   * Get the command palette input node.
   *
   * #### Notes
   * Modifying this node directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  /**
   * Construct a new command palette.
   */
  constructor() {
    super();
    this.addClass(PALETTE_CLASS);
    Command.changed.connect(this._onCommandChanged, this);
  }

  /**
   * Dispose of the resources held by the command palette.
   */
  dispose(): void {
    Object.keys(this._registry).forEach(id => { clearPropertyData(id); });
    this._buffer.length = 0;
    this._registry = null;
    Command.changed.disconnect(this._onCommandChanged, this);
    super.dispose();
  }

  /**
   * Add new command items to the palette.
   *
   * @param commands - An array of `CommandItem` instances.
   */
  add(commands: CommandItem[]): void {
    let constructor = this.constructor as typeof CommandPalette;
    commands.forEach(item => {
      let id = `palette-${++registrationSeed}`;
      // Associate the ID property.
      constructor.idProperty.set(item, id);
      // Add the item to the private registry.
      this._registry[id] = item;
    });
    this._bufferItems(Object.keys(this._registry));
  }

  /**
   * Handle the DOM events for the command palette.
   *
   * @param event - The DOM event sent to the command palette.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the command palette's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'click':
      this._evtClick(event as MouseEvent);
      break;
    case 'keydown':
      this._evtKeyDown(event as KeyboardEvent);
      break;
    case 'mousemove':
      this._evtMouseMove(event as MouseEvent);
      break;
    case 'mouseleave':
      this._evtMouseLeave(event as MouseEvent);
      break;
    }
  }

  /**
   * Remove command items from the palette.
   *
   * @param commands - An array of `CommandItem` instances.
   */
  remove(commands: CommandItem[]): void {
    let constructor = this.constructor as typeof CommandPalette;
    commands.forEach(item => {
      let id = constructor.idProperty.get(item);
      if (!id) return;
      delete this._registry[id];
      clearPropertyData(item);
    });
    this._bufferItems(Object.keys(this._registry));
  }

  /**
   * Search for a specific query string among command titles and captions.
   *
   * @param query - The query string.
   */
  search(query: string): void {
    let searchableItems = Object.keys(this._registry).reduce((acc, id) => {
      let item = this._registry[id];
      // Append title to caption transparently as the primary search string.
      let primary = [item.text, item.caption].join(' ');
      let secondary = item.category;
      acc.push({ id, primary, secondary });
      return acc;
    }, [] as ICommandSearchItem[]);
    this._bufferSearchResults(matcher.search(query, searchableItems));
  }

  /**
   * A message handler invoked on a `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('click', this);
    this.node.addEventListener('keydown', this);
    this.node.addEventListener('mousemove', this);
    this.contentNode.addEventListener('mouseleave', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('mousemove', this);
    this.contentNode.removeEventListener('mouseleave', this);
  }

  /**
   * A handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    this.inputNode.focus();
  }

  /**
   * A handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Clear the node.
    this.contentNode.textContent = '';
    // Render the buffer.
    this._buffer.forEach(section => this._renderSection(section));
    // If there is a post-update handler, run it.
    if (this._onceAfterUpdate) {
      this._onceAfterUpdate.call(this);
      // Post-update handlers only run once.
      this._onceAfterUpdate = null;
    }
  }

  /**
   * Activate the next command in the given direction.
   *
   * @param direction - The scroll direction.
   */
  private _activate(direction: ScrollDirection): void {
    let active = this._findActive();
    if (!active) {
      if (direction === ScrollDirection.Down) return this._activateFirst();
      if (direction === ScrollDirection.Up) return this._activateLast();
    }
    let registrations = this._buffer.map(section => section.registrations)
      .reduce((acc, ids) => { return acc.concat(ids); }, [] as string[]);
    let current = registrations.indexOf(active.getAttribute(REGISTRATION_ID));
    let newActive: number;
    if (direction === ScrollDirection.Up) {
      newActive = current > 0 ? current - 1 : registrations.length - 1;
    } else {
      newActive = current < registrations.length - 1 ? current + 1 : 0;
    }
    while (newActive !== current) {
      if (this._registry[registrations[newActive]].isEnabled) break;
      if (direction === ScrollDirection.Up) {
        newActive = newActive > 0 ? newActive - 1 : registrations.length - 1;
      } else {
        newActive = newActive < registrations.length - 1 ? newActive + 1 : 0;
      }
    }
    if (newActive === 0) return this._activateFirst();
    let selector = `[${REGISTRATION_ID}="${registrations[newActive]}"]`;
    let target = this.node.querySelector(selector) as HTMLElement;
    let scrollIntoView = scrollTest(this.contentNode, target);
    let alignToTop = direction === ScrollDirection.Up;
    this._activateNode(target, scrollIntoView, alignToTop);
  }

  /**
   * Activate the first command.
   */
  private _activateFirst(): void {
    // Query the DOM for items that are not disabled.
    let selector = `.${COMMAND_CLASS}:not(.${DISABLED_CLASS})`;
    let nodes = this.node.querySelectorAll(selector);
    // If the palette contains any enabled items, activate the first one.
    if (nodes.length) {
      // Scroll all the way to the top of the content node.
      this.contentNode.scrollTop = 0;
      let target = nodes[0] as HTMLElement;
      // Test if the first enabled item is visible.
      let scrollIntoView = scrollTest(this.contentNode, target);
      let alignToTop = true;
      this._activateNode(target, scrollIntoView, alignToTop);
    }
  }

  /**
   * Activate the last command.
   */
  private _activateLast(): void {
    // Query the DOM for items that are not disabled.
    let selector = `.${COMMAND_CLASS}:not(.${DISABLED_CLASS})`;
    let nodes = this.node.querySelectorAll(selector);
    // If the palette contains any enabled items, activate the last one.
    if (nodes.length) {
      // Scroll all the way to the bottom of the content node.
      this.contentNode.scrollTop = this.contentNode.scrollHeight;
      let target = nodes[nodes.length - 1] as HTMLElement;
      // Test if the last enabled item is visible.
      let scrollIntoView = scrollTest(this.contentNode, target);
      let alignToTop = false;
      this._activateNode(target, scrollIntoView, alignToTop);
    }
  }

  /**
   * Activate a specific command and optionally scroll it into view.
   *
   * @param target - The node that is being activated.
   *
   * @param scrollIntoView - A flag indicating whether to scroll to the node.
   *
   * @param alignToTop - A flag indicating whether to align scroll to top.
   */
  private _activateNode(target: HTMLElement, scrollIntoView?: boolean, alignToTop?: boolean): void {
    let active = this._findActive();
    if (target === active) return;
    if (active) this._deactivate();
    target.classList.add(ACTIVE_CLASS);
    if (scrollIntoView) target.scrollIntoView(alignToTop);
  }

  /**
   * Buffer a list of registration IDs, grouping them by category.
   *
   * @param registrations - The list of registration ids to buffer.
   */
  private _bufferItems(registrations: string[]): void {
    let sections: ICommandPaletteSection[] = [];
    // Group items by category into sections.
    registrations.forEach(id => {
      let item = this._registry[id];
      // Discover whether a section with this category already exists.
      let sectionIndex = arrays.findIndex(sections, section => {
        return section.title === item.category;
      });
      if (sectionIndex === -1) {
        // If a section with this header does not exist, add a new section.
        sections.push({ title: item.category, registrations: [id] });
      } else {
        // If a section exists with this header, add to it.
        sections[sectionIndex].registrations.push(id);
      }
    });
    this._buffer = sections;
    this._sort();
    this.update();
  }

  /**
   * Buffer a list of search results without regrouping them.
   *
   * @param items - The search results to buffer.
   */
  private _bufferSearchResults(items: ICommandMatchResult[]): void {
    this._buffer = items.reduce((acc, val, idx) => {
      let item = this._registry[val.id];
      let heading = item.category;
      if (!idx) {
        acc.push({ title: heading, registrations: [val.id] });
        return acc;
      }
      if (acc[acc.length - 1].title === heading) {
        // Add to the last group.
        acc[acc.length - 1].registrations.push(val.id);
      } else {
        // Create a new group.
        acc.push({ title: heading, registrations: [val.id] });
      }
      return acc;
    }, [] as ICommandPaletteSection[]);
    // If there are search results, select the first item.
    // If isVisible is false for all items, this will be a no-op.
    if (this._buffer.length) this._onceAfterUpdate = this._activateFirst;
    this.update();
  }

  /**
   * Deactivate (i.e. deselect) all palette item.
   */
  private _deactivate(): void {
    let selector = `.${COMMAND_CLASS}.${ACTIVE_CLASS}`;
    let nodes = this.node.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].classList.remove(ACTIVE_CLASS);
    }
  }

  /**
   * Handle the `'click'` event for the command palette.
   */
  private _evtClick(event: MouseEvent): void {
    let { altKey, ctrlKey, metaKey, shiftKey } = event;
    if (event.button !== 0 || altKey || ctrlKey || metaKey || shiftKey) return;
    event.stopPropagation();
    event.preventDefault();
    let target = event.target as HTMLElement;
    while (!target.hasAttribute(REGISTRATION_ID)) {
      if (target === this.node as HTMLElement) return;
      target = target.parentElement;
    }
    let item = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (item.isEnabled) item.execute();
  }

  /**
   * Handle the `'keydown'` event for the command palette.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    let { altKey, ctrlKey, metaKey, keyCode } = event;
    if (!FN_KEYS.hasOwnProperty(`${keyCode}`)) {
      let input = this.inputNode;
      let oldValue = input.value;
      requestAnimationFrame(() => {
        let newValue = input.value;
        // If the search value has not changed, do nothing.
        if (newValue === oldValue) return;
        // If the search value has changed to empty, render everything.
        if (newValue === '') {
          return this._bufferItems(Object.keys(this._registry));
        }
        // Otherwise, search for the new value.
        this.search(newValue);
      });
      return;
    }
    // Ignore system keyboard shortcuts.
    if (altKey || ctrlKey || metaKey) return;
    // If escape key is pressed and nothing is active, allow propagation.
    if (keyCode === ESCAPE) {
      if (!this._findActive()) return;
      event.preventDefault();
      event.stopPropagation();
      return this._deactivate();
    }
    event.preventDefault();
    event.stopPropagation();
    if (keyCode === UP_ARROW) return this._activate(ScrollDirection.Up);
    if (keyCode === DOWN_ARROW) return this._activate(ScrollDirection.Down);
    if (keyCode === ENTER) {
      let active = this._findActive();
      if (!active) return;
      let item = this._registry[active.getAttribute(REGISTRATION_ID)];
      if (item.isEnabled) item.execute();
      this._deactivate();
      return;
    }
  }

  /**
   * Handle the `'mouseleave'` event for the command palette.
   */
  private _evtMouseLeave(event: MouseEvent): void {
    this._deactivate();
  }

  /**
   * Handle the `'mousemove'` event for the command palette.
   */
  private _evtMouseMove(event: MouseEvent): void {
    let target = event.target as HTMLElement;
    while (!target.hasAttribute(REGISTRATION_ID)) {
      if (target === this.node as HTMLElement) return this._deactivate();
      target = target.parentElement;
    }
    let item = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (item.isEnabled) {
      this._activateNode(target);
    } else {
      this._deactivate();
    }
  }

  /**
   * Find the currently selected command.
   */
  private _findActive(): HTMLElement {
    let selector = `.${COMMAND_CLASS}.${ACTIVE_CLASS}`;
    return this.node.querySelector(selector) as HTMLElement;
  }

  /**
   * A handler invoked on a command changed signal.
   */
  private _onCommandChanged(sender: typeof Command, args: Command): void {
    let staleBuffer = this._buffer.some(section => {
      return section.registrations
        .some(id => args === this._registry[id].command);
    });
    if (!staleBuffer) return;
    // Remember the currently active node.
    let active = this._findActive();
    let current = active ? active.getAttribute(REGISTRATION_ID) : null;
    // Re-buffer, removing any newly invisible commands and re-categorizing.
    let registrations = this._buffer.map(section => section.registrations)
      .reduce((acc, ids) => { return acc.concat(ids); }, [] as string[]);
    this._bufferItems(registrations);
    // Reset state.
    this._onceAfterUpdate = () => {
      // Reactivate the correct node after re-render.
      if (current) {
        let selector = `[${REGISTRATION_ID}="${current}"]`;
        let target = this.node.querySelector(selector) as HTMLElement;
        if (!target || !this._registry[current].isEnabled) return;
        this._activateNode(target);
      }
    }
    this.update();
  }

  /**
   * Render a section and its commands.
   *
   * @param section - The palette section being rendered.
   */
  private _renderSection(section: ICommandPaletteSection): void {
    let constructor = this.constructor as typeof CommandPalette;
    let items = section.registrations
      .map(id => this._registry[id]).filter(item => item.isVisible);
    // If none of the items are visible, do not render the section.
    if (!items.length) return;
    let fragment = constructor.createSectionFragment(section.title, items);
    this.contentNode.appendChild(fragment);
  }

  /**
   * Sort the sections by title and their commands by title.
   */
  private _sort(): void {
    this._buffer.sort((a, b) => { return a.title.localeCompare(b.title); });
    this._buffer.forEach(section => section.registrations.sort((a, b) => {
      let textA = this._registry[a].text;
      let textB = this._registry[b].text;
      return textA.localeCompare(textB);
    }));
  }

  private _buffer: ICommandPaletteSection[] = [];
  private _onceAfterUpdate: () => void = null;
  private _registry: { [id: string]: CommandItem; } = Object.create(null);
}
