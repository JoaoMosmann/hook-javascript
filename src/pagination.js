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
  this.query = query;
  this.query.p = (perPage || DL.defaults.perPage);

  /**
   * @property collection
   * @type {DL.Collection}
   */
  this.collection = collection;

  this.query.page = 1;
  this._fetch();
};

// Inherits from DL.Iterable
DL.Pagination.prototype = new DL.Events();
DL.Pagination.prototype.constructor = DL.Pagination;

/**
 * Register onchange pages callback.
 * @method change
 * @param {Function} callback
 * @return {Promise}
 */
DL.Pagination.prototype.change = function(callback) {
  return this.on('change', callback);
};

/**
 * @method hasNext
 * @return {Boolean}
 */
DL.Pagination.prototype.hasNext = function() {
  return (this.current_page < this.last_page);
};

/**
 * @method previous
 * @return {Pagination}
 */
DL.Pagination.prototype.previous = function() {
  if (this.current_page > 0) {
    this.query.page = this.current_page - 1;
    this._fetch();
  }
  return this;
};

/**
 * @method next
 * @return {Pagination}
 */
DL.Pagination.prototype.next = function(callback) {
  if (this.hasNext()) {
    this.query.page = this.current_page + 1;
    this._fetch();
  }
  return this;
};

/**
 * @method goto
 * @param {Number} page
 * @return {Pagination}
 */
DL.Pagination.prototype.goto = function(page) {
  this.query.page = page;
  this._fetch();
  return this;
};

/**
 * @method isFetching
 * @return {Booelan}
 */
DL.Pagination.prototype.isFetching = function() {
  return this.fetching;
};

DL.Pagination.prototype._fetch = function() {
  var that = this;
  return this.collection.client.get(this.collection.segments, this.query).then(function() {
    that._fetchComplete.apply(that, arguments);
    that.trigger('change', that);
  });
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
