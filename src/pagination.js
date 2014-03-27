/**
 * @module DL
 * @class DL.Pagination
 * @extends DL.Events
 *
 * @param {DL.Collection} collection
 * @param {Number} perPage
 * @constructor
 */
DL.Pagination = function(collection, query, perPage) {
  this.fetching = true;
  this.perPage = (perPage || DL.defaults.perPage);

  /**
   * @property collection
   * @type {DL.Collection}
   */
  this.collection = collection;
  this.query = query;
};

// Inherits from DL.Iterable
DL.Pagination.prototype = new DL.Events();
DL.Pagination.prototype.constructor = DL.Pagination;

DL.Pagination.prototype._fetch = function(page) {
  this.query.p = page;
  return this.collection.client.get(this.collection.segments, this.query).then(this._fetchComplete);
};

DL.Pagination.prototype._fetchComplete = function(response) {
  this.fetching = false;

  /**
   * @property total
   * @type {Number}
   */
  this.total = response.total;

  /**
   * @property per_page
   * @type {Number}
   */
  this.per_page = response.per_page;

  /**
   * @property current_page
   * @type {Number}
   */
  this.current_page = response.current_page;

  /**
   * @property last_page
   * @type {Number}
   */
  this.last_page = response.last_page;

  /**
   * @property from
   * @type {Number}
   */
  this.from = response.from;

  /**
   * @property to
   * @type {Number}
   */
  this.to = response.to;

  /**
   * @property items
   * @type {Object}
   */
  this.items = response.data;
};

/**
 * @method hasNext
 * @return {Boolean}
 */
DL.Pagination.prototype.hasNext = function() {
  return (this.current_page < this.to);
};

/**
 * @method previous
 * @return {Pagination}
 */
DL.Pagination.prototype.previous = function() {
  if (this.current_page > 0) {
    this.current_page -= 1;
    this._fetch(this.current_page);
  }
  return (this.current_page < this.to);
};

/**
 * @method next
 * @return {Pagination}
 */
DL.Pagination.prototype.next = function(callback) {
  if (this.hasNext()) {
  }
  return (this.current_page < this.to);
};

/**
 * @method goto
 * @param {Number} page
 * @return {Pagination}
 */
DL.Pagination.prototype.goto = function(callback) {
};

/**
 * @method isFetching
 * @return {Booelan}
 */
DL.Pagination.prototype.isFetching = function() {
  return this.fetching;
};
