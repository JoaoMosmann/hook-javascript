/**
 * @module DL
 * @class DL.System
 *
 * @param {Client} client
 * @constructor
 */

var System = function(client) {
  this.client = client;
};

/**
 * Return server's system time.
 * @method time
 * @return {Promise}
 */
System.prototype.time = function() {
  var promise = this.client.get('system/time');
  if (arguments.length > 0) {
    promise.then.apply(promise, arguments);
  }
  return promise;
};

module.exports = System;