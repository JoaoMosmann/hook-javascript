/**
 * @module DL
 * @class DL.PluginManager
 * @constructor
 * @static
 */
var Plugin = {};
Plugin.Manager = { plugins: [] };

/**
 * Register plugin to be instantiated on DL.Client
 * @method register
 * @param {Object} class
 * @static
 */
Plugin.Manager.register = function(path, klass) {
  this.plugins.push({ path: path, klass: klass });
};

/**
 * Register all plugins on target DL.Client
 * @method setup
 * @param {DL.Client} client
 * @static
 */
Plugin.Manager.setup = function(client) {
  for (var i=0, l = this.plugins.length; i < l; i++) {
    client[ this.plugins[i].path ] = new this.plugins[i].klass(client);
  }
};

module.exports = Plugin;