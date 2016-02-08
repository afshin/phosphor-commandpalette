/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Message
} from 'phosphor-messaging';

import {
  Widget
} from 'phosphor-widget';

import {
  AbstractPaletteModel, ICommandResult, IHeaderResult, ISearchResult,
  SearchResultType
} from './abstractmodel';


/**
 * The class name added to `CommandPalette` instances.
 */
const PALETTE_CLASS = 'p-CommandPalette';

/**
 * The class name added to the search section of the palette.
 */
const SEARCH_CLASS = 'p-CommandPalette-search';

/**
 * The class name added to the input wrapper in the search section.
 */
const WRAPPER_CLASS = 'p-CommandPalette-inputWrapper';

/**
 * The class name added to the input node in the search section.
 */
const INPUT_CLASS = 'p-CommandPalette-input';

/**
 * The class name added to the content section of the palette.
 */
const CONTENT_CLASS = 'p-CommandPalette-content';

/**
 * The class name added to a palette section header.
 */
const HEADER_CLASS = 'p-CommandPalette-header';

/**
 * The class name added to a palette section header text node.
 */
const HEADER_TEXT_CLASS = 'p-CommandPalette-headerText';

/**
 * The class name added to a palette section header icon node.
 */
const HEADER_ICON_CLASS = 'p-CommandPalette-headerIcon';

/**
 * The class name added to a palette item.
 */
const ITEM_CLASS = 'p-CommandPalette-item';

/**
 * The class name added to item the wrapper around item text (excludes icon).
 */
const ITEM_CONTENT_CLASS = 'p-CommandPalette-itemContent';

/**
 * The class name added to item icons.
 */
const ITEM_ICON_CLASS = 'p-CommandPalette-itemIcon';

/**
 * The class name added to item titles.
 */
const ITEM_TEXT_CLASS = 'p-CommandPalette-itemText';

/**
 * The class name added to item shortcuts.
 */
const ITEM_SHORTCUT_CLASS = 'p-CommandPalette-itemShortcut';

/**
 * The class name added to item captions.
 */
const ITEM_CAPTION_CLASS = 'p-CommandPalette-itemCaption';

/**
 * The class name added to the active palette item.
 */
const ACTIVE_CLASS = 'p-mod-active';

/**
 * The regex for parsing the query input string.
 */
const QUERY_REGEX = /^(\w*:)?(.*)$/;

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
 * A widget which displays commands from a command source.
 */
export
class CommandPalette extends Widget {
  /**
   * Create the DOM node for a command palette.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let search = document.createElement('div');
    let wrapper = document.createElement('div');
    let input = document.createElement('input');
    let content = document.createElement('ul');
    search.className = SEARCH_CLASS;
    wrapper.className = WRAPPER_CLASS;
    input.className = INPUT_CLASS;
    content.className = CONTENT_CLASS;
    wrapper.appendChild(input);
    search.appendChild(wrapper);
    node.appendChild(search);
    node.appendChild(content);
    return node;
  }

  /**
   * Create a header node for a command palette.
   *
   * @param data - The palette header item data to render.
   *
   * @returns A new DOM node for a palette section header.
   *
   * #### Notes
   * This method may be reimplemented to create custom headers.
   */
  static createHeaderNode(data: IHeaderResult): HTMLElement {
    let node = document.createElement('li');
    let text = document.createElement('span');
    let icon = document.createElement('span');
    node.className = HEADER_CLASS;
    text.className = HEADER_TEXT_CLASS;
    icon.className = HEADER_ICON_CLASS;
    text.innerHTML = data.text;
    node.appendChild(text);
    node.appendChild(icon);
    return node;
  }

  /**
   * Create an item node for a command palette.
   *
   * @param data - The palette item data to render.
   *
   * @returns A new DOM node for a palette section item.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createItemNode(data: ICommandResult): HTMLElement {
    let node = document.createElement('li');
    let content = document.createElement('div');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    let caption = document.createElement('span');
    let shortcut = document.createElement('span');

    content.className = ITEM_CONTENT_CLASS;
    text.className = ITEM_TEXT_CLASS;
    caption.className = ITEM_CAPTION_CLASS;
    shortcut.className = ITEM_SHORTCUT_CLASS;

    let itemClass = ITEM_CLASS;
    let extraItem = data.className;
    if (extraItem) itemClass += ' ' + extraItem;
    node.className = itemClass;

    let iconClass = ITEM_ICON_CLASS;
    let extraIcon = data.icon;
    if (extraIcon) iconClass += ' ' + extraIcon;
    icon.className = iconClass;

    text.innerHTML = data.text;
    caption.innerHTML = data.caption;
    shortcut.innerHTML = data.shortcut;

    content.appendChild(shortcut);
    content.appendChild(text);
    content.appendChild(caption);
    node.appendChild(icon);
    node.appendChild(content);

    return node;
  }

  /**
   * Construct a new command palette.
   */
  constructor() {
    super();
    this.addClass(PALETTE_CLASS);
  }

  /**
   * Dispose of the resources held by the command palette.
   */
  dispose(): void {
    this._model = null;
    super.dispose();
  }

  /**
   * Get the model for the command palette.
   */
  get model(): AbstractPaletteModel {
    return this._model;
  }

  /**
   * Set the model for the command palette.
   */
  set model(value: AbstractPaletteModel) {
    value = value || null;
    if (this._model === value) {
      return;
    }
    if (this._model) {
      this._model.changed.disconnect(this._onModelChanged);
    }
    if (value) {
      value.changed.connect(this._onModelChanged);
    }
    this._model = value;
    this.update();
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
    case 'input':
      this._evtInput(event);
      break;
    case 'blur':
      this._deactivate();
      break;
    }
  }

  /**
   * A message handler invoked on a `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('click', this);
    this.node.addEventListener('keydown', this);
    this.node.addEventListener('input', this);
    this.inputNode.addEventListener('blur', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('input', this);
    this.inputNode.removeEventListener('blur', this);
  }

  /**
   *
   */
  protected onUpdateRequest(msg: Message): void {
    // Empty the content node.
    let content = this.contentNode;
    content.textContent = '';

    // Bail if there is no model.
    if (!this._model) {
      return;
    }

    // Keep a local buffer containing search results.
    let query = this.inputNode.value;
    let result = this._model.search(query);
    this._buffer = result;
    if (result.length === 0) {
      return;
    }

    // Create a document fragment that will populate the content node.
    let fragment = document.createDocumentFragment();
    let ctor = this.constructor as typeof CommandPalette;

    for (let i = 0, n = result.length; i < n; ++i) {
      let node: HTMLElement;
      let { type, value } = result[i];
      switch (type) {
      case SearchResultType.Header:
        let header = value as IHeaderResult;
        node = ctor.createHeaderNode(header);
        if (header.category) node.dataset['index'] = `${i}`;
        break;
      case SearchResultType.Command:
        node = ctor.createItemNode(value as ICommandResult);
        node.dataset['index'] = `${i}`;
        break;
      default:
        throw new Error('invalid search result type');
      }
      fragment.appendChild(node);
    }

    content.appendChild(fragment);

    // If the results were from a search, highlight the first item.
    if (query.length) {
      let selector = `.${ITEM_CLASS}`;
      let target = this.contentNode.querySelector(selector) as HTMLElement;
      // Scroll all the way to the top of the content node.
      this.contentNode.scrollTop = 0;
      this._activateNode(target);
    }
  }

  /**
   * Activate the next command in the given direction.
   *
   * @param direction - The scroll direction.
   */
  private _activate(direction: ScrollDirection): void {
    let active = this._findActiveNode();
    if (!active) {
      if (direction === ScrollDirection.Down) {
        return this._activateFirst();
      }
      if (direction === ScrollDirection.Up) {
        return this._activateLast();
      }
    }
    let nodes = this.contentNode.querySelectorAll('[data-index]');
    let current = Array.prototype.indexOf.call(nodes, active);
    let newActive: number;
    if (direction === ScrollDirection.Up) {
      newActive = current > 0 ? current - 1 : nodes.length - 1;
    } else {
      newActive = current < nodes.length - 1 ? current + 1 : 0;
    }
    if (newActive === 0) {
      return this._activateFirst();
    }
    let target = nodes[newActive] as HTMLElement;
    let scrollIntoView = scrollTest(this.contentNode, target);
    let alignToTop = direction === ScrollDirection.Up;
    this._activateNode(target, scrollIntoView, alignToTop);
  }

  /**
   * Activate the first item.
   */
  private _activateFirst(): void {
    let nodes = this.contentNode.querySelectorAll('[data-index]');
    // If the palette contains any items, activate the first one.
    if (nodes.length) {
      // Scroll all the way to the top of the content node.
      this.contentNode.scrollTop = 0;
      let target = nodes[0] as HTMLElement;
      // Test if the first item is visible.
      let scrollIntoView = scrollTest(this.contentNode, target);
      this._activateNode(target, scrollIntoView, true);
    }
  }

  /**
   * Activate the last command.
   */
  private _activateLast(): void {
    let nodes = this.contentNode.querySelectorAll('[data-index]');
    // If the palette contains any items, activate the last one.
    if (nodes.length) {
      // Scroll all the way to the bottom of the content node.
      this.contentNode.scrollTop = this.contentNode.scrollHeight;
      let target = nodes[nodes.length - 1] as HTMLElement;
      // Test if the last item is visible.
      let scrollIntoView = scrollTest(this.contentNode, target);
      this._activateNode(target, scrollIntoView, false);
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
    let active = this._findActiveNode();
    if (target === active) {
      return;
    }
    if (active) this._deactivate();
    target.classList.add(ACTIVE_CLASS);
    if (scrollIntoView) target.scrollIntoView(alignToTop);
  }

  /**
   * Deactivate (i.e. deselect) all palette items.
   */
  private _deactivate(): void {
    let selector = `.${ACTIVE_CLASS}`;
    let nodes = this.contentNode.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].classList.remove(ACTIVE_CLASS);
    }
  }

  /**
   * Handle the `'click'` event for the command palette.
   */
  private _evtClick(event: MouseEvent): void {
    let { altKey, ctrlKey, metaKey, shiftKey } = event;
    if (event.button !== 0 || altKey || ctrlKey || metaKey || shiftKey) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    let target = event.target as HTMLElement;
    while (!target.hasAttribute('data-index')) {
      if (target === this.node) {
        return;
      }
      target = target.parentElement;
    }
    this._execute(target);
  }

  /**
   * Handle the `'keydown'` event for the command palette.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    let { altKey, ctrlKey, metaKey, shiftKey, keyCode } = event;
    // Ignore system keyboard shortcuts.
    if (altKey || ctrlKey || metaKey || shiftKey) {
      return;
    }
    // Allow all normal (non-navigation) keystrokes to propagate.
    if (!FN_KEYS.hasOwnProperty(`${keyCode}`)) {
      return;
    }
    if (keyCode === ESCAPE) {
      let inputValue = this.inputNode.value;
      let { category, text } = AbstractPaletteModel.splitQuery(inputValue);
      // If escape key is pressed and category exists, stop propagation.
      if (category) {
        event.preventDefault();
        event.stopPropagation();
        // Remove the category and leave the search query intact.
        this.inputNode.value = text;
        this.inputNode.focus();
        this.update();
        return;
      }
      // If escape key is pressed and text exists, stop propagation.
      if (text) {
        event.preventDefault();
        event.stopPropagation();
        // Remove the search query, resetting the palette.
        this.inputNode.value = '';
        this.inputNode.focus();
        this.update();
        return;
      }
      // If escape key is pressed and results in no search action, propagate.
      this._deactivate();
      this.inputNode.blur();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (keyCode === UP_ARROW) {
      return this._activate(ScrollDirection.Up);
    }
    if (keyCode === DOWN_ARROW) {
      return this._activate(ScrollDirection.Down);
    }
    if (keyCode === ENTER) {
      let active = this._findActiveNode();
      if (!active) {
        return;
      }
      this._execute(active);
      this._deactivate();
      return;
    }
  }

  /**
   * Handle the `'input'` event for the command palette.
   */
  private _evtInput(event: Event): void {
    this.update();
  }

  /**
   * Execute the command or category search associated with a palette node.
   */
  private _execute(target: HTMLElement): void {
    let { type, value } = this._buffer[parseInt(target.dataset['index'], 10)];
    switch (type) {
    case SearchResultType.Header:
      let { category } = value as IHeaderResult;
      let { text } = AbstractPaletteModel.splitQuery(this.inputNode.value);
      this.inputNode.value = `${category.trim()}: ${text}`;
      this.inputNode.focus();
      this.update();
      break;
    case SearchResultType.Command:
      let { handler, args } = value as ICommandResult;
      handler(args);
      break;
    default:
      throw new Error('invalid search result type');
    }
  }

  /**
   * Find the currently selected item.
   */
  private _findActiveNode(): HTMLElement {
    let selector = `.${ACTIVE_CLASS}`;
    return this.contentNode.querySelector(selector) as HTMLElement;
  }

  /**
   *
   */
  private _onModelChanged(): void {

  }

  private _buffer: ISearchResult[];
  private _model: AbstractPaletteModel = null;
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
