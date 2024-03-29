/**
 * @module DL
 * @class DL.Files
 */


var when = require('when')
  , Files = function(client) {
    this.client = client;
  };

/**
 * @method upload
 * @param {Canvas|Blob} data
 * @param {String} filename [optional]
 * @param {String} mimeType [optional]
 * @return {Promise}
 */
Files.prototype.upload = function(data, fileName, mimeType){
  var formData = new FormData();
  if(data instanceof HTMLCanvasElement && data.toBlob){
  var deferred = when.defer();
    var self = this;
    data.toBlob(function(blob){
      self.upload(blob, fileName, mimeType).then(deferred.resolver.resolve, deferred.resolver.reject);
    }, mimeType || "image/png");

  return deferred.promise;
  }

  try {
    formData.append('file', data, fileName || "dlApiFile");
  } catch(e) {
    formData.append('file', data);
  }
  return this.client.post('files', formData);
};

/**
 * Get file data by id.
 * @method get
 * @param {Number|String} _id
 * @return {Promise}
 */
Files.prototype.get = function(_id) {
  return this.client.get('files/' + _id);
};

/**
 * Remove file by id.
 * @method remove
 * @param {Number|String} _id
 * @return {Promise}
 */
Files.prototype.remove = function(_id) {
  return this.client.remove('files/' + _id);
};

module.exports = Files;