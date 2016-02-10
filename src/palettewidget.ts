/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

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
 * The class name added to a palette command.
 */
const COMMAND_CLASS = 'p-CommandPalette-command';

/**
 * The class name added to the command content node.
 */
const COMMAND_CONTENT_CLASS = 'p-CommandPalette-commandContent';

/**
 * The class name added to a command icon node.
 */
const COMMAND_ICON_CLASS = 'p-CommandPalette-commandIcon';

/**
 * The class name added to a command text node.
 */
const COMMAND_TEXT_CLASS = 'p-CommandPalette-commandText';

/**
 * The class name added to a command shortcut node.
 */
const COMMAND_SHORTCUT_CLASS = 'p-CommandPalette-commandShortcut';

/**
 * The class name added to a command caption node.
 */
const COMMAND_CAPTION_CLASS = 'p-CommandPalette-commandCaption';

/**
 * The class name added to the active palette header or command.
 */
const ACTIVE_CLASS = 'p-mod-active';


/**
 * An enum of command palette activation targets.
 */
export
enum ActivationTarget {
  /**
   * The activation target is a header item.
   */
  Header,

  /**
   * The activation target is a command item.
   */
  Command,

  /**
   * The activate target is any item.
   */
  Any,
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
    input.spellcheck = false;
    wrapper.appendChild(input);
    search.appendChild(wrapper);
    node.appendChild(search);
    node.appendChild(content);
    return node;
  }

  /**
   * Create a new header node for a command palette.
   *
   * @returns A new DOM node for a palette section header.
   *
   * #### Notes
   * This method may be reimplemented to create custom headers.
   */
  static createHeaderNode(): HTMLElement {
    let node = document.createElement('li');
    node.className = HEADER_CLASS;
    return node;
  }

  /**
   * Create a new command node for a command palette.
   *
   * @returns A new DOM node for a palette section command.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createCommandNode(): HTMLElement {
    let node = document.createElement('li');
    let content = document.createElement('div');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    let caption = document.createElement('span');
    let shortcut = document.createElement('span');
    node.className = COMMAND_CLASS;
    content.className = COMMAND_CONTENT_CLASS;
    icon.className = COMMAND_ICON_CLASS;
    text.className = COMMAND_TEXT_CLASS;
    caption.className = COMMAND_CAPTION_CLASS;
    shortcut.className = COMMAND_SHORTCUT_CLASS;
    content.appendChild(shortcut);
    content.appendChild(text);
    content.appendChild(caption);
    node.appendChild(icon);
    node.appendChild(content);
    return node;
  }

  /**
   * Update a header node to reflect the given data.
   *
   * @param node - The header node which should be updated.
   *
   * @param data - The data object to use for the node state.
   *
   * #### Notes
   * This is called automatically when the node should be updated.
   *
   * If the [[createHeaderNode]] method is reimplemented, this method
   * should also be reimplemented so that the node state is properly
   * updated.
   */
  static updateHeaderNode(node: HTMLElement, data: IHeaderResult): void {
    node.className = HEADER_CLASS;
    node.innerHTML = data.text;
  }

  /**
   * Update a command node to reflect the given data.
   *
   * @param node - The command node which should be updated.
   *
   * @param data - The data object to use for the node state.
   *
   * #### Notes
   * This is called automatically when the node should be updated.
   *
   * If the [[createHeaderNode]] method is reimplemented, this method
   * should also be reimplemented so that the node state is properly
   * updated.
   */
  static updateCommandNode(node: HTMLElement, data: ICommandResult): void {
    let icon = node.firstChild as HTMLElement;
    let content = icon.nextSibling as HTMLElement;
    let shortcut = content.firstChild as HTMLElement;
    let text = shortcut.nextSibling as HTMLElement;
    let caption = text.nextSibling as HTMLElement;

    let itemClass = COMMAND_CLASS;
    if (data.className) itemClass += ' ' + data.className;
    node.className = itemClass;

    let iconClass = COMMAND_ICON_CLASS;
    if (data.icon) iconClass += ' ' + data.icon;
    icon.className = iconClass;

    text.innerHTML = data.text;
    caption.innerHTML = data.caption;
    shortcut.innerHTML = data.shortcut;
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
    this._results.length = 0;
    this._headerPool.length = 0;
    this._commandPool.length = 0;
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
      this._model.changed.disconnect(this._onModelChanged, this);
    }
    if (value) {
      value.changed.connect(this._onModelChanged, this);
    }
    this._model = value;
    this._results.length = 0;
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
   * This node can be used to trigger manual updates of the command
   * palette. Simply set the input node `value` to the desired text
   * and call `palette.update()`.
   *
   * This is a read-only property.
   */
  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  /**
   * Activate the first matching target item in the palette.
   *
   * @param target - The activation target. The default is `Any`.
   *
   * #### Notes
   * This automatically scrolls the item into view.
   *
   * If no matching item is found, no item is activated.
   */
  activateFirst(target = ActivationTarget.Any): void {
    let i: number;
    if (target === ActivationTarget.Header) {
      let type = SearchResultType.Header;
      i = arrays.findIndex(this._results, r => r.type === type);
    } else if (target === ActivationTarget.Command) {
      let type = SearchResultType.Command;
      i = arrays.findIndex(this._results, r => r.type === type);
    } else {
      i = 0;
    }
    this._activate(i);
  }

  /**
   * Activate the last matching target item in the palette.
   *
   * @param target - The activation target. The default is `Any`.
   *
   * #### Notes
   * This automatically scrolls the item into view.
   *
   * If no matching item is found, no item is activated.
   */
  activateLast(target = ActivationTarget.Any): void {
    let i: number;
    if (target === ActivationTarget.Header) {
      let type = SearchResultType.Header;
      i = arrays.rfindIndex(this._results, r => r.type === type);
    } else if (target === ActivationTarget.Command) {
      let type = SearchResultType.Command;
      i = arrays.rfindIndex(this._results, r => r.type === type);
    } else {
      i = this._results.length - 1;
    }
    this._activate(i);
  }

  /**
   * Activate the next matching target item in the palette.
   *
   * @param target - The activation target. The default is `Any`.
   *
   * #### Notes
   * This automatically scrolls the item into view.
   *
   * The search will wrap around at the end of the palette.
   *
   * If no matching item is found, no item is activated.
   */
  activateNext(target = ActivationTarget.Any): void {
    let i: number;
    let k = this._activeIndex + 1;
    let j = k >= this._results.length ? 0 : k;
    if (target === ActivationTarget.Header) {
      let type = SearchResultType.Header;
      i = arrays.findIndex(this._results, r => r.type === type, j, true);
    } else if (target === ActivationTarget.Command) {
      let type = SearchResultType.Command;
      i = arrays.findIndex(this._results, r => r.type === type, j, true);
    } else {
      i = j;
    }
    this._activate(i);
  }

  /**
   * Activate the previous matching target item in the palette.
   *
   * @param target - The activation target. The default is `Any`.
   *
   * #### Notes
   * This automatically scrolls the item into view.
   *
   * The search will wrap around at the end of the palette.
   *
   * If no matching item is found, no item is activated.
   */
  activatePrevious(target = ActivationTarget.Any): void {
    let i: number;
    let k = this._activeIndex;
    let j = k <= 0 ? this._results.length - 1 : k - 1;
    if (target === ActivationTarget.Header) {
      let type = SearchResultType.Header;
      i = arrays.rfindIndex(this._results, r => r.type === type, j, true);
    } else if (target === ActivationTarget.Command) {
      let type = SearchResultType.Command;
      i = arrays.rfindIndex(this._results, r => r.type === type, j, true);
    } else {
      i = j;
    }
    this._activate(i);
  }

  /**
   * Trigger the currently active item in the palette.
   *
   * #### Notes
   * If the active item is a header, the search results are refined
   * using the category of the header. If the current category is
   * the same as the header category, the category will be removed.
   *
   * If the active item is a command, the command handler will be
   * invoked and the current query text will be selected.
   *
   * If there is no active item, this is a no-op.
   */
  triggerActive(): void {
    let result = this._results[this._activeIndex];
    if (!result) {
      return;
    }
    if (result.type === SearchResultType.Header) {
      let input = this.inputNode;
      let { category, text } = CommandPalette.splitQuery(input.value);
      let desired = (result.value as IHeaderResult).category.trim();
      let computed = desired === category ? '' : desired;
      let query = CommandPalette.joinQuery(computed, text);
      input.value = query;
      input.focus();
      this.update();
    } else if (result.type === SearchResultType.Command) {
      let { handler, args } = result.value as ICommandResult;
      this.inputNode.select();
      handler(args);
    }
    // Deactivate the item that was just fired.
    this._activate(-1);
  }

  /**
   * Handle the DOM events for the command palette.
   *
   * @param event - The DOM event sent to the command palette.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the command palette's DOM node.
   * It should not be called directly by user code.
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
      this.update();
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
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('input', this);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Clear the current content.
    let content = this.contentNode;
    content.textContent = '';

    // Reset the active index.
    this._activeIndex = -1;

    // Bail early if there is no model.
    if (!this._model) {
      return;
    }

    // Split the query text into its category and text parts.
    let { category, text } = CommandPalette.splitQuery(this.inputNode.value);

    // Search for query matches and store the results for later use.
    let results = this._results = this._model.search(category, text);

    // If the results are empty, there is nothing left to do.
    if (results.length === 0) {
      return;
    }

    // Grab the derived class type for access to the render methods.
    let ctor = this.constructor as typeof CommandPalette;

    // Setup the header node render function.
    let headerPoolIndex = 0;
    let headerPool = this._headerPool;
    let renderHeader = (data: IHeaderResult) => {
      let node = headerPool[headerPoolIndex++];
      if (!node) {
        node = ctor.createHeaderNode();
        headerPool.push(node);
      }
      ctor.updateHeaderNode(node, data);
      return node;
    };

    // Setup the command node render function.
    let commandPoolIndex = 0;
    let commandPool = this._commandPool;
    let renderCommand = (data: ICommandResult) => {
      let node = commandPool[commandPoolIndex++];
      if (!node) {
        node = ctor.createCommandNode();
        commandPool.push(node);
      }
      ctor.updateCommandNode(node, data);
      return node;
    };

    // Loop over the search results and render the nodes.
    let fragment = document.createDocumentFragment();
    for (let { type, value } of results) {
      if (type === SearchResultType.Header) {
        fragment.appendChild(renderHeader(value as IHeaderResult));
      } else if (type === SearchResultType.Command) {
        fragment.appendChild(renderCommand(value as ICommandResult));
      } else {
        throw new Error('invalid search result type');
      }
    }

    // Update the content node with the rendered search results.
    content.appendChild(fragment);

    // If there is query text, highlight the first command item.
    // Otherwise, reset the content scroll position to the top.
    if (category || text) {
      this.activateFirst(ActivationTarget.Command);
    } else {
      requestAnimationFrame(() => { content.scrollTop = 0; });
    }
  }

  /**
   * Activate the node at the given index.
   *
   * If the node is scrolled out of view, it will be scrolled into
   * view and aligned according to the `alignTop` parameter.
   */
  private _activate(index: number): void {
    let content = this.contentNode;
    let children = content.children;
    if (index < 0 || index >= children.length) {
      index = -1;
    }
    if (this._activeIndex === index) {
      return;
    }
    let oldNode = children[this._activeIndex] as HTMLElement;
    let newNode = children[index] as HTMLElement;
    this._activeIndex = index;
    if (oldNode) oldNode.classList.remove(ACTIVE_CLASS);
    if (newNode) newNode.classList.add(ACTIVE_CLASS);
    if (newNode) requestAnimationFrame(() => {
      Private.scrollIfNeeded(content, newNode);
    });
  }

  /**
   * Handle the `'click'` event for the command palette.
   */
  private _evtClick(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    let root = this.node;
    let content = this.contentNode;
    let target = event.target as Node;
    while (true) {
      if (target === root) return;
      let parent = target.parentNode;
      if (parent === content) break;
      target = parent;
    }
    let index = Array.prototype.indexOf.call(content.children, target);
    this._activate(index);
    this.triggerActive();
  }

  /**
   * Handle the `'keydown'` event for the command palette.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    switch (event.keyCode) {
    case 13:  // Enter
      event.preventDefault();
      event.stopPropagation();
      this.triggerActive();
      break;
    case 38:  // Up Arrow
      event.preventDefault();
      event.stopPropagation();
      this.activatePrevious();
      break;
    case 40:  // Down Arrow
      event.preventDefault();
      event.stopPropagation();
      this.activateNext();
      break;
    }
  }

  /**
   * Handle the `changed` signal for the palette model.
   */
  private _onModelChanged(): void {
    this.update();
  }

  private _activeIndex = -1;
  private _results: ISearchResult[] = [];
  private _headerPool: HTMLElement[] = [];
  private _commandPool: HTMLElement[] = [];
  private _model: AbstractPaletteModel = null;
}


/**
 * The namespace for the `CommandPalette` class statics.
 */
export
namespace CommandPalette {
  /**
   * Split a query string into its category and text components.
   *
   * @param query - A query string of the form `(:<category>:)?<text>`.
   *
   * @returns The `category` and `text` components of the query with
   *   leading and trailing whitespace removed.
   */
  export
  function splitQuery(query: string): { category: string, text: string } {
    query = query.trim();
    if (query[0] !== ':') {
      return { category: '', text: query };
    }
    let i = query.indexOf(':', 1);
    if (i === -1) {
      return { category: query.slice(1).trim(), text: '' };
    }
    let category = query.slice(1, i).trim();
    let text = query.slice(i + 1).trim();
    return { category, text };
  }

  /**
   * Join category and text components into a query string.
   *
   * @param category - The category for the query or an empty string.
   *
   * @param text - The text for the query or an empty string.
   *
   * @returns The joined query string for the components.
   */
  export
  function joinQuery(category: string, text: string): string {
    let query: string;
    if (category && text) {
      query = `:${category.trim()}: ${text.trim()}`;
    } else if (category) {
      query = `:${category.trim()}: `;
    } else if (text) {
      query = text.trim();
    } else {
      query = '';
    }
    return query;
  }
}


/**
 * The namespace for the `CommandPalette` private data.
 */
namespace Private {
  /**
   * Scroll an element into view if needed.
   *
   * @param area - The scroll area element.
   *
   * @param elem - The element of interest.
   */
  export
  function scrollIfNeeded(area: HTMLElement, elem: HTMLElement): void {
    let ar = area.getBoundingClientRect();
    let er = elem.getBoundingClientRect();
    if (er.top < ar.top) {
      area.scrollTop -= ar.top - er.top;
    } else if (er.bottom > ar.bottom) {
      area.scrollTop += er.bottom - ar.bottom;
    }
  }
}
