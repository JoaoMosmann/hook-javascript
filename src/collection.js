/**
 * @module DL
 * @class DL.Collection
 *
 * @param {DL.Client} client
 * @param {String} name
 * @constructor
 */
var Iterable = require('./core/iterable.js');
var Pagination = require('./pagination.js');

var Collection = function(client, name) {
  this.client = client;

  this.name = this._validateName(name);
  this.reset();

  this.segments = 'collection/' + this.name;
};

// Inherits from DL.Iterable
Collection.prototype = new Iterable();
Collection.prototype.constructor = Collection;

/**
 * Create a new resource
 * @method create
 * @param {Object} data
 * @return {DL.Collection} this
 *
 * @example Creating an entry
 *
 *     client.collection('posts').create({
 *       title: "Post name",
 *       summary: "My awesome new post",
 *       stars: 5
 *     });
 *
 * @example Listening to complete event
 *
 *     // Verbose way
 *     var c = client.collection('posts');
 *     var promise = c.create({ title: "Post name", summary: "Something", stars: 5 });
 *     promise.then(function(data) {
 *         console.log(data);
 *     });
 *
 *     // Short way
 *     client.collection('posts').create({ title: "Post name", summary: "Something", stars: 5 }).then(function(data) {
 *         console.log(data);
 *     });
 *
 */
Collection.prototype.create = function(data) {
  return this.client.post(this.segments, data);
};

/**
 * Get collection data, based on `where` params.
 * @method get
 * @return {DL.Collection} this
 */
Collection.prototype.get = function() {
  return this.client.get(this.segments, this.buildQuery());
};

/**
 * Add `where` param
 * @method where
 * @param {Object | String} where params or field name
 * @param {String} operation '<', '<=', '>', '>=', '!=', 'in', 'between', 'not_in', 'not_between', 'like'
 * @param {String} value value
 * @return {DL.Collection} this
 *
 * @example Multiple 'where' calls
 *
 *     var c = client.collection('posts');
 *     c.where('author','Vicente'); // equal operator may be omitted
 *     c.where('stars','>',10);     // support '<' and '>' operators
 *     c.then(function(result) {
 *       console.log(result);
 *     });
 *
 * @example One 'where' call
 *
 *     client.collection('posts').where({
 *       author: 'Vicente',
 *       stars: ['>', 10]
 *     }).then(function(result) {
 *       console.log(result);
 *     })
 *
 * @example Filtering 'in' value list.
 *
 *     client.collection('posts').where('author_id', 'in', [500, 501]).then(function(result) {
 *       console.log(result);
 *     })
 *
 * @example Partial String matching
 *
 *     client.collection('posts').where('author', 'like', '%Silva%').then(function(result) {
 *       console.log(result);
 *     })
 *
 */
Collection.prototype.where = function(objects, _operation, _value) {
  var field,
      operation = (typeof(_value)==="undefined") ? '=' : _operation,
      value = (typeof(_value)==="undefined") ? _operation : _value;

  if (typeof(objects)==="object") {
    for (field in objects) {
      if (objects.hasOwnProperty(field)) {
        operation = '=';
        if (objects[field] instanceof Array) {
          operation = objects[field][0];
          value = objects[field][1];
        } else {
          value = objects[field];
        }
        this.addWhere(field, operation, value);
      }
    }
  } else {
    this.addWhere(objects, operation, value);
  }

  return this;
};


/**
 * Find first item by _id
 * @method find
 * @param {Number} _id
 * @param {Function} callback [optional]
 * @return {Promise}
 *
 * @example Finding first item by _id, with 'success' callback as param.
 *
 *     client.collection('posts').find(50, function(data) {
 *       console.log("Row:", data);
 *     });
 *
 * @example Catching 'not found' error.
 *
 *     client.collection('posts').find(128371923).then(function(data) {
 *       console.log("Row:", data); // will never execute this
 *     }).otherwise(function(e) {
 *       console.log("Not found.");
 *     });
 *
 */
Collection.prototype.find = function(_id) {
  var promise = this.client.get(this.segments + '/' + _id, this.buildQuery());
  if (arguments.length > 1) {
    return promise.then.apply(promise, Array.prototype.slice.call(arguments,1));
  }
  return promise;
};

/**
 * Group results by field
 * @method group
 * @param {String} field
 * @param {String} ... more fields
 * @return {DL.Collection} this
 */
Collection.prototype.group = function() {
  this._group = arguments;
  return this;
};

/**
 * Count the number of items on this collection
 * @method count
 * @param {Function} callback [optional]
 * @return {Promise}
 *
 * @example Count the elements of the current query
 *
 *     client.collection('posts').where('author','Vicente').count(function(total) {
 *       console.log("Total:", total);
 *     });
 */
Collection.prototype.count = function() {
  this.options.aggregation = {method: 'count', field: null};
  var promise = this.get();
  if (arguments.length > 0) {
    promise.then.apply(promise, arguments);
  }
  return promise;
};

/**
 * Aggregate field with 'max' values
 * @method max
 * @param {String} field
 * @param {Function} callback [optional]
 * @return {Promise}
 *
 * @example Get the max value from highscore collection
 *
 *     client.collection('highscore').max('score', function(data) {
 *       console.log("max: ", data);
 *     });
 */
Collection.prototype.max = function(field) {
  this.options.aggregation = {method: 'max', field: field};
  var promise = this.get();
  if (arguments.length > 1) {
    promise.then.apply(promise, Array.prototype.slice.call(arguments,1));
  }
  return promise;
};

/**
 * Aggregate field with 'min' values
 * @method min
 * @param {String} field
 * @param {Function} callback [optional]
 * @return {Promise}
 *
 * @example Get the min value from highscore collection
 *
 *     client.collection('highscore').min('score', function(data) {
 *       console.log("min: ", data);
 *     });
 */
Collection.prototype.min = function(field) {
  this.options.aggregation = {method: 'min', field: field};
  var promise = this.get();
  if (arguments.length > 1) {
    promise.then.apply(promise, Array.prototype.slice.call(arguments,1));
  }
  return promise;
};

/**
 * Aggregate field with 'avg' values
 * @method avg
 * @param {String} field
 * @param {Function} callback [optional]
 * @return {Promise}
 *
 * @example Get the average value from highscore collection
 *
 *     client.collection('highscore').avg('score', function(data) {
 *       console.log("avg: ", data);
 *     });
 */
Collection.prototype.avg = function(field) {
  this.options.aggregation = {method: 'avg', field: field};
  var promise = this.get();
  if (arguments.length > 1) {
    promise.then.apply(promise, Array.prototype.slice.call(arguments,1));
  }
  return promise;
};

/**
 * Aggregate field with 'sum' values
 * @method sum
 * @param {String} field
 * @param {Function} callback [optional]
 * @return {Promise}
 *
 * @example Get the sum value from highscore collection
 *
 *     client.collection('highscore').sum('score', function(data) {
 *       console.log("sum: ", data);
 *     });
 */
Collection.prototype.sum = function(field) {
  this.options.aggregation = {method: 'sum', field: field};
  var promise = this.get();
  if (arguments.length > 1) {
    promise.then.apply(promise, Array.prototype.slice.call(arguments,1));
  }
  return promise;
};

/**
 * Query only the first result
 * @method first
 * @param {Function} callback [optional]
 * @return {Promise}
 *
 * @example Return just the first element for current query
 *
 *     client.collection('users').sort('created_at', -1).first(function(data) {
 *       console.log("Last created user:", data);
 *     });
 */
Collection.prototype.first = function() {
  this.options.first = 1;
  var promise = this.get();
  promise.then.apply(promise, arguments);
  return promise;
};

/**
 * First or create
 * method firstorCreate
 * param {Object} data
 * param {Function} callback
 * return {Promise}
 *
 * example Return the first match for 'data' param, or create it.
 *
 *     client.collection('uniques').firstOrCreate({type: "something"}).then(function(data) {
 *       console.log("Unique row: ", data);
 *     });
 */
Collection.prototype.firstOrCreate = function(data) {
  throw new Error("Not implemented");
  // var promise;
  // this.options.first = 1;
  // promise = this.client.post(this.segments, { data: data, options: this.buildQuery() });
  // if (arguments.length > 1) {
  //   promise.then(arguments[1]);
  // }
  // return promise;
};

/**
 * Alias for get & then
 * @method then
 * @return {Promise}
 */
Collection.prototype.then = function() {
  var promise = this.get();
  promise.then.apply(promise, arguments);
  return promise;
};

/**
 * Clear collection filtering state
 * @method reset
 * @return {DL.Collection} this
 */
Collection.prototype.reset = function() {
  this.options = {};
  this.wheres = [];
  this.ordering = [];
  this._group = [];
  this._limit = null;
  this._offset = null;
  return this;
};

/**
 * @method sort
 * @param {String} field
 * @param {Number|String} direction
 * @return {DL.Collection} this
 *
 * @example Return just the first element for current query
 *
 *     // Ommit the second argument for ascending order:
 *     client.collection('users').sort('created_at').then(function(data){ });
 *
 *     // Use 1 or 'asc' to specify ascending order:
 *     client.collection('users').sort('created_at', 1).then(function(data){  });
 *     client.collection('users').sort('created_at', 'asc').then(function(data){  });
 *
 *     // Use -1 or 'desc' for descending order:
 *     client.collection('users').sort('created_at', -1).then(function(data) {  });
 *     client.collection('users').sort('created_at', 'desc').then(function(data) {  });
 */
Collection.prototype.sort = function(field, direction) {
  if (!direction) {
    direction = "asc";
  } else if (typeof(direction)==="number") {
    direction = (parseInt(direction, 10) === -1) ? 'desc' : 'asc';
  }
  this.ordering.push([field, direction]);
  return this;
};

/**
 * @method limit
 * @param {Number} int
 * @return {DL.Collection} this
 *
 * @example Limit the number of rows to retrieve
 *
 *     client.collection('posts').sort('updated_at', -1).limit(5).then(function(data) {
 *       console.log("Last 5 rows updated: ", data);
 *     });
 *
 * @example Limit and offset
 *
 *     client.collection('posts').sort('updated_at', -1).limit(5).offset(5).then(function(data) {
 *       console.log("last 5 rows updated, after 5 lastest: ", data);
 *     });
 */
Collection.prototype.limit = function(int) {
  this._limit = int;
  return this;
};

/**
 * @method offset
 * @see limit
 *
 * @param {Number} int
 * @return {DL.Collection} this
 */
Collection.prototype.offset = function(int) {
  this._offset = int;
  return this;
};

/**
 * Get channel for this collection.
 * @method channel
 * @param {Object} options (optional)
 * @return {DL.Channel}
 *
 * @example Streaming collection data
 *
 *     client.collection('messages').where('type', 'new-game').channel().subscribe(function(event, data) {
 *       console.log("Received new-game message: ", data);
 *     });
 *
 *     client.collection('messages').create({type: 'sad', text: "i'm sad because streaming won't catch me"});
 *     client.collection('messages').create({type: 'new-game', text: "yey, streaming will catch me!"});
 *
 */
Collection.prototype.channel = function(options) {
  throw new Error("Not implemented.");
  // return new DL.Channel(this.client, this, options);
};

/**
 * @method paginate
 * @return {DL.Pagination}
 *
 * @param {Mixed} perpage_or_callback
 * @param {Function} onComplete
 * @param {Function} onError (optional)
 */
Collection.prototype.paginate = function(perPage, onComplete, onError) {
  var pagination = new Pagination(this);

  if (!onComplete) {
    onComplete = perPage;
    perPage = DL.defaults.perPage;
  }

  this.options.paginate = perPage;
  this.then(function(data) {
    pagination._fetchComplete(data);
    if (onComplete) { onComplete(pagination); }
  }, onError);

  return pagination;
};

/**
 * Drop entire collection. This operation is irreversible.
 * @return {Promise}
 */
Collection.prototype.drop = function() {
  return this.client.remove(this.segments);
};

/**
 * Remove a single row by id
 * @method remove
 * @param {String} id [optional]
 * @return {Promise}
 *
 * @example Deleting a row by id
 *
 *     client.collection('posts').remove(1).then(function(data) {
 *       console.log("Success:", data.success);
 *     });
 *
 * @example Deleting multiple rows
 *
 *     client.collection('ranking').where('score', 0).remove().then(function(data) {
 *       console.log("Success:", data.success);
 *     });
 */
Collection.prototype.remove = function(_id) {
  var path = this.segments;
  if (typeof(_id)!=="undefined") {
    path += '/' + _id;
  }
  return this.client.remove(path, this.buildQuery());
};

/**
 * Update a single collection entry
 * @method update
 * @param {Number | String} _id
 * @param {Object} data
 *
 * @example Updating a single row
 *
 *     client.collection('posts').update(1, { title: "Changing post title" }).then(function(data) {
 *       console.log("Success:", data.success);
 *     });
 */
Collection.prototype.update = function(_id, data) {
  return this.client.post(this.segments + '/' + _id, data);
};

/**
 * Increment a value from 'field' from all rows matching current filter.
 * @method increment
 * @param {String} field
 * @param {Number} value
 * @return {Promise}
 *
 * @example Increment user score
 *
 *     client.collection('users').where('_id', user_id).increment('score', 10).then(function(numRows) {
 *       console.log(numRows, " users has been updated");
 *     });
 */
Collection.prototype.increment = function(field, value) {
  this.options.operation = { method: 'increment', field: field, value: value };
  var promise = this.client.put(this.segments, this.buildQuery());
  if (arguments.length > 0) {
    promise.then.apply(promise, arguments);
  }
  return promise;
};

/**
 * Decrement a value from 'field' from all rows matching current filter.
 * @method decrement
 * @param {String} field
 * @param {Number} value
 * @return {Promise}
 *
 * @example Decrement user score
 *
 *     client.collection('users').where('_id', user_id).decrement('score', 10).then(function(numRows) {
 *       console.log(numRows, " users has been updated");
 *     });
 */
Collection.prototype.decrement = function(field, value) {
  this.options.operation = { method: 'decrement', field: field, value: value };
  var promise = this.client.put(this.segments, this.buildQuery());
  if (arguments.length > 0) {
    promise.then.apply(promise, arguments);
  }
  return promise;
};

/**
 * Update all collection's data based on `where` params.
 * @method updateAll
 * @param {Object} data key-value data to update from matched rows [optional]
 * @return {Promise}
 *
 * @example Updating all rows of the collection
 *
 *     client.collection('users').updateAll({category: 'everybody'}).then(function(numRows) {
 *       console.log(numRows, " users has been updated");
 *     });
 *
 * @example Updating collection filters
 *
 *     client.collection('users').where('age','<',18).updateAll({category: 'baby'}).then(function(numRows) {
 *       console.log(numRows, " users has been updated");
 *     });
 */
Collection.prototype.updateAll = function(data) {
  this.options.data = data;
  return this.client.put(this.segments, this.buildQuery());
};

Collection.prototype.addWhere = function(field, operation, value) {
  this.wheres.push([field, operation.toLowerCase(), value]);
  return this;
};

Collection.prototype._validateName = function(name) {
  var regexp = /^[a-z_\/0-9]+$/;

  if (!regexp.test(name)) {
    throw new Error("Invalid name: " + name);
  }

  return name;
};

Collection.prototype.buildQuery = function() {
  var query = {};

  // apply limit / offset
  if (this._limit !== null) { query.limit = this._limit; }
  if (this._offset !== null) { query.offset = this._offset; }

  // apply wheres
  if (this.wheres.length > 0) {
    query.q = this.wheres;
  }

  // apply ordering
  if (this.ordering.length > 0) {
    query.s = this.ordering;
  }

  // apply group
  if (this._group.length > 0) {
    query.g = this._group;
  }

  var f, shortnames = {
    paginate: 'p',
    first: 'f',
    aggregation: 'aggr',
    operation: 'op',
    data: 'data'
  };

  for (f in shortnames) {
    if (this.options[f]) {
      query[shortnames[f]] = this.options[f];
    }
  }

  // clear wheres/ordering for future calls
  this.reset();

  return query;
};

module.exports = Collection;