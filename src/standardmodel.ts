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
  AbstractPaletteModel, ISearchResult, SearchResultType
} from './abstractmodel';

import {
  StringSearch
} from './stringsearch';


/**
 * An options object for initializing a standard palette item.
 */
export
interface IStandardPaletteItemOptions {
  /**
   * The text for the item.
   *
   * #### Notes
   * This is the primary text for the item in a palette.
   */
  text: string;

  /**
   * The handler function for the item.
   *
   * #### Notes
   * This will be invoked when an item is clicked by the user.
   */
  handler: (args: any) => void;

  /**
   * The arguments for the handler, if necessary.
   *
   * #### Notes
   * If this is not provided, `undefined` will be used for the args.
   */
  args?: any;

  /**
   * The icon class name(s) for the item, if any.
   *
   * #### Notes
   * Multiple class names should be separated by whitespace.
   */
  icon?: string;

  /**
   * The caption for the item, if any.
   *
   * #### Notes
   * This is more descriptive than what is provided by `text`.
   */
  caption?: string;

  /**
   * The keyboard shortcut for the item, if any.
   *
   * #### Notes
   * This is for decoration purposes only.
   */
  shortcut?: string;

  /**
   * The extra class name(s) for the item, if any.
   *
   * #### Notes
   * Multiple class names should be separated by whitespace.
   */
  className?: string;

  /**
   * The category name for the item.
   *
   * #### Notes
   * This is used to group multiple items with the same category.
   *
   * The category will be normalized by removing extraneous white
   * space and converting it to lower case.
   */
  category?: string;
}


/**
 * An object for use with a standard palette model.
 *
 * #### Notes
 * Instances of this class will not typically be created directly by
 * the user. A palette model will create and return instances of the
 * class from its adder methods.
 */
export
class StandardPaletteItem {
  /**
   * Construct a new standard palette item.
   *
   * @param options - The options for initializing the item.
   */
  constructor(options: IStandardPaletteItemOptions) {
    this._text = options.text;
    this._args = options.args;
    this._handler = options.handler;
    this._icon = options.icon || '';
    this._caption = options.caption || '';
    this._shortcut = options.shortcut || '';
    this._className = options.className || '';
    this._category = Private.normalizeCategory(options.category || '');
  }

  /**
   * Get the primary text for the item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get text(): string {
    return this._text;
  }

  /**
   * Get the icon class name(s) for the item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get icon(): string {
    return this._icon;
  }

  /**
   * Get the descriptive caption for the item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get caption(): string {
    return this._caption;
  }

  /**
   * Get the keyboard shortcut for the item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get shortcut(): string {
    return this._shortcut;
  }

  /**
   * Get the category name for the item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get category(): string {
    return this._category;
  }

  /**
   * Get the extra class name(s) for the item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get className(): string {
    return this._className;
  }

  /**
   * Get the handler function for the item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get handler(): (args: any) => void {
    return this._handler;
  }

  /**
   * Get the arguments for the handler.
   *
   * #### Notes
   * This is a read-only property.
   */
  get args(): any {
    return this._args;
  }

  private _args: any;
  private _text: string;
  private _icon: string;
  private _caption: string;
  private _shortcut: string;
  private _category: string;
  private _className: string;
  private _handler: (args: any) => void;
}


/**
 * A concrete palette model which holds a collection of palette items.
 *
 * #### Notes
 * This class is a reasonable option for populating command palettes
 * when the number of items is reasonable, and when the items can be
 * created ahead of time. If lazy searching of a large data set is
 * required, then a custom palette model should be used instead.
 */
export
class StandardPaletteModel extends AbstractPaletteModel {
  /**
   * Get the items contained in the palette model.
   *
   * @returns A new array of the current items in the model.
   */
  items(): StandardPaletteItem[] {
    return this._items.slice();
  }

  /**
   * Add a new palette item to the model.
   *
   * @param options - The options for initializing the item.
   *
   * @returns The palette item which was added to the model.
   */
  addItem(options: IStandardPaletteItemOptions): StandardPaletteItem {
    let item = new StandardPaletteItem(options);
    this._items.push(item);
    this.changed.emit(void 0);
    return item;
  }

  /**
   * Add several new palette items to the model.
   *
   * @param options - The options for initializing the items.
   *
   * @returns The new palette items where were added to the model.
   */
  addItems(options: IStandardPaletteItemOptions[]): StandardPaletteItem[] {
    let items = options.map(opts => new StandardPaletteItem(opts));
    Array.prototype.push.apply(this._items, items);
    this.changed.emit(void 0);
    return items;
  }

  /**
   * Remove a palette item from the model.
   *
   * @param item - The item to remove from the model.
   *
   * #### Notes
   * If the item is not contained in the model, this is a no-op.
   */
  removeItem(item: StandardPaletteItem): void {
    let i = arrays.remove(this._items, item);
    if (i !== -1) this.changed.emit(void 0);
  }

  /**
   * Remove several items from the model.
   *
   * @param items - The items to remove from the model.
   *
   * #### Notes
   * Items which are no contained in the model are ignored.
   */
  removeItems(items: StandardPaletteItem[]): void {
    let rest = this._items.filter(other => items.indexOf(other) === -1);
    if (rest.length === this._items.length) {
      return;
    }
    this._items = rest;
    this.changed.emit(void 0);
  }

  /**
   * Remove all items from the model.
   */
  clearItems(): void {
    if (this._items.length === 0) {
      return;
    }
    this._items.length = 0;
    this.changed.emit(void 0);
  }

  /**
   * Search the palette model for matching commands.
   *
   * @param category - The category match against the model items. If
   *   this is an empty string, all item categories will be matched.
   *
   * @param text - The text to match against the model items. If this
   *   is an empty string, all items will be matched.
   *
   * @returns An array of new search results for the query.
   */
  search(category: string, text: string): ISearchResult[] {
    // Collect a mapping of the matching categories. The mapping will
    // only contain categories which match the provided query text.
    // If the category is an empty string, all categories will be
    // matched with a score of `0` and a `null` indices array.
    let catmap = Private.matchCategory(this._items, category);

    // Filter the items for matching text. Only items which have a
    // category in the given map are considered. The category score
    // is added to the text score to create the final item score.
    // If the text is an empty string, all items will be matched
    // will a text score of `0` and `null` indices array.
    let scores = Private.matchText(this._items, text, catmap);

    // Sort the items based on their total item score. Ties are
    // broken by locale ordering the category followed by the text.
    scores.sort(Private.scoreCmp);

    // Group the item scores by category. The categories are added
    // to the map in the order they appear in the scores array.
    let groups = Private.groupScores(scores);

    // Return the results for the search. The headers are created in
    // the order of key iteration of the map. On major browsers, this
    // is insertion order. This means that headers are created in the
    // order of first appearance in the sorted scores array.
    return Private.createSearchResults(groups, catmap);
  }

  private _items: StandardPaletteItem[] = [];
}


/**
 * The namespace for the `StandardPaletteModel` private data.
 */
namespace Private {
  /**
   * A type alias for a string map object.
   */
  export
  type StringMap<T> = { [key: string]: T };

  /**
   * An object which represents a text match score.
   */
  export
  interface IScore {
    /**
     * The numerical score for the text match.
     */
    score: number;

    /**
     * The indices of the matched characters.
     */
    indices: number[];
  }

  /**
   * A text match score with associated palette item.
   */
  export
  interface IItemScore extends IScore {
    /**
     * The palette item associated with the match.
     */
    item: StandardPaletteItem;
  }

  /**
   * Normalize a category for a palette item.
   *
   * @param category - The item category to normalize.
   *
   * @returns The normalized category text.
   *
   * #### Notes
   * This converts the category to lower case and removes any
   * extraneous whitespace.
   */
  export
  function normalizeCategory(category: string): string {
    return category.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  /**
   * Collect a mapping of the categories which match the given query.
   *
   * @param items - The palette items to search.
   *
   * @param query - The category portion of the palette model query.
   *
   * @returns A mapping of matched category to match score.
   *
   * #### Notes
   * The query string will be normalized by lower casing and removing
   * all whitespace. If the normalized query is an empty string, all
   * categories will be matched with a `0` score and `null` indices.
   */
  export
  function matchCategory(items: StandardPaletteItem[], query: string): StringMap<IScore> {
    // Normalize the query text to lower case with no whitespace.
    query = normalizeQueryText(query);

    // Create the maps needed to track the match state.
    let seen: StringMap<boolean> = Object.create(null);
    let matched: StringMap<IScore> = Object.create(null);

    // Iterate over the items and match the categories.
    for (let { category } of items) {
      // If a category has already been seen, no more work is needed.
      if (category in seen) {
        continue;
      }

      // Mark the category as seen so it is only processed once.
      seen[category] = true;

      // If the query is empty, all categories match by default.
      if (!query) {
        matched[category] = { score: 0, indices: null };
        continue;
      }

      // Run the matcher for the query and skip if no match.
      let match = StringSearch.sumOfSquares(category, query);
      if (!match) {
        continue;
      }

      // Store the match score in the results.
      matched[category] = match;
    }

    // Return the final mapping of matched categories.
    return matched;
  }

  /**
   * Filter palette items for those with matching text and category.
   *
   * @param items - The palette items to search.
   *
   * @param query - The text portion of the palette model query.
   *
   * @param categories - A mapping of the valid item categories.
   *
   * @returns An array of item scores for the matching items.
   *
   * #### Notes
   * The query string will be normalized by lower casing and removing
   * all whitespace. If the normalized query is an empty string, all
   * items will be matched with a `0` text score and `null` indices.
   *
   * Items which have a category which is not present in the category
   * map will be ignored.
   *
   * The final item score is the sum of the item text score and the
   * relevant category score.
   *
   * This function does not sort the results.
   */
  export
  function matchText(items: StandardPaletteItem[], query: string, categories: StringMap<IScore>): IItemScore[] {
    // Normalize the query text to lower case with no whitespace.
    query = normalizeQueryText(query);

    // Create the array to hold the resulting scores.
    let scores: IItemScore[] = [];

    // Iterate over the items and match the text with the query.
    for (let item of items) {
      // Lookup the category score for the item category.
      let cs = categories[item.category];

      // If the category was not matched, the item is skipped.
      if (!cs) {
        continue;
      }

      // If the query is empty, all items are matched by default.
      if (!query) {
        scores.push({ score: cs.score, indices: null, item });
        continue;
      }

      // Run the matcher for the query and skip if no match.
      let match = StringSearch.sumOfSquares(item.text.toLowerCase(), query);
      if (!match) {
        continue;
      }

      // Create the match score for the item.
      let score = cs.score + match.score;
      scores.push({ score, indices: match.indices, item });
    }

    // Return the final array of matched item scores.
    return scores;
  }

  /**
   * A sort comparison function for a palette item match score.
   *
   * #### Notes
   * This orders the items first based on score (lower is better), then
   * by locale order of the item category followed by the item text.
   */
  export
  function scoreCmp(a: IItemScore, b: IItemScore): number {
    let d1 = a.score - b.score;
    if (d1 !== 0) {
      return d1;
    }
    let d2 = a.item.category.localeCompare(b.item.category);
    if (d2 !== 0) {
      return d2;
    }
    return a.item.text.localeCompare(b.item.text);
  }

  /**
   * Group item scores by item category.
   *
   * @param scores - The items to group by category.
   *
   * @returns A mapping of category name to group of items.
   *
   * #### Notes
   * The categories are added to the map in the order of first
   * appearance in the `scores` array.
   */
  export
  function groupScores(scores: IItemScore[]): StringMap<IItemScore[]> {
    let result: StringMap<IItemScore[]> = Object.create(null);
    for (let score of scores) {
      let cat = score.item.category;
      (result[cat] || (result[cat] = [])).push(score);
    }
    return result;
  }

  /**
   * Create the search results for a collection of item scores.
   *
   * @param groups - The item scores, grouped by category.
   *
   * @param categories - A mapping of category scores.
   *
   * @returns A flat array of search results for the groups.
   *
   * #### Notes
   * This function renders the groups in iteration order, which on all
   * major browsers is order of insertion (a de facto standard).
   */
  export
  function createSearchResults(groups: StringMap<IItemScore[]>, categories: StringMap<IScore>): ISearchResult[] {
    let results: ISearchResult[] = [];
    for (let cat in groups) {
      results.push(createHeaderResult(cat, categories[cat]));
      for (let score of groups[cat]) {
        results.push(createCommandResult(score));
      }
    }
    return results;
  }

  /**
   * Normalize the query text for a palette item.
   *
   * @param text - The category or text portion of a palette query.
   *
   * @returns The normalized query text.
   *
   * #### Notes
   * The text is normalized by converting to lower case and removing
   * all whitespace.
   */
  function normalizeQueryText(text: string): string {
    return text.replace(/\s+/g, '').toLowerCase();
  }

  /**
   * Create a header search result for the given data.
   *
   * @param category - The category name for the header.
   *
   * @param score - The score for the category match.
   *
   * @returns A header search result for the given data.
   */
  function createHeaderResult(category: string, score: IScore): ISearchResult {
    let text = highlightText(category, score.indices);
    return { type: SearchResultType.Header, value: { text, category } };
  }

  /**
   * Create a command search result for the given data.
   *
   * @param score - The score for the item match.
   *
   * @returns A command search result for the given data.
   */
  function createCommandResult(score: IItemScore): ISearchResult {
    let text = highlightText(score.item.text, score.indices);
    let { icon, caption, shortcut, className, handler, args } = score.item;
    let value = { text, icon, caption, shortcut, className, handler, args };
    return { type: SearchResultType.Command, value };
  }

  /**
   * Highlight the matching character of the given text.
   *
   * @param text - The text to highlight.
   *
   * @param indices - The character indices to highlight, or `null`.
   *
   * @returns The text interpolated with `<mark>` tags as needed.
   */
  function highlightText(text: string, indices: number[]): string {
    return indices ? StringSearch.highlight(text, indices) : text;
  }
}
