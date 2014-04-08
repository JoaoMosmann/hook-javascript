/**
 * DL.Client is the entry-point for using dl-api.
 *
 * You should instantiate a global javascript client for consuming dl-api.
 *
 * ```javascript
 * window.dl = new DL.Client({
 *   url: "http://local-or-remote-dl-api-address.com/api/public/index.php/",
 *   appId: 1,    // your app's id
 *   key: 'test'  // your app's public key
 * });
 * ```
 *
 * @module DL
 * @class DL.Client
 *
 * @param {Object} options
 *   @param {String} options.appId
 *   @param {String} options.key
 *   @param {String} options.url default: http://dl-api.dev
 *
 * @constructor
 */
DL.Client = function(options) {
  this.url = options.url || "http://dl-api.dev/api/public/index.php/";
  this.appId = options.appId;
  this.key = options.key;

  /**
   * @property {DL.KeyValues} keys
   */
  this.keys = new DL.KeyValues(this);

  /**
   * @property {DL.Auth} auth
   */
  this.auth = new DL.Auth(this);

  /**
   * @property {DL.Fiels} files
   */
  this.files = new DL.Files(this);

  /**
   * @property {DL.System} system
   */
  this.system = new DL.System(this);
};

/**
 * Get collection instance.
 * @method collection
 * @param {String} collectionName
 * @return {DL.Collection}
 *
 * @example Retrieve a collection reference. Your collection tables are created on demand.
 *
 *     // Users collection
 *     var users = client.collection('users');
 *
 *     // Highscores
 *     var highscores = client.collection('highscores');
 *
 */
DL.Client.prototype.collection = function(collectionName) {
  return new DL.Collection(this, collectionName);
};

/**
 * Get channel instance.
 * @method channel
 * @param {String} name
 * @param {Object} options (optional)
 * @return {DL.Channel}
 *
 * @example Retrieve a channel reference.
 *
 *     var messages = client.channel('messages');
 *
 */
DL.Client.prototype.channel = function(name, options) {
  var collection = this.collection(name);
  collection.segments = collection.segments.replace('collection/', 'channels/');
  return new DL.Channel(this, collection, options);
};

/**
 * @method post
 * @param {String} segments
 * @param {Object} data
 */
DL.Client.prototype.post = function(segments, data) {
  if (typeof(data)==="undefined") {
    data = {};
  }
  return this.request(segments, "POST", data);
};

/**
 * @method get
 * @param {String} segments
 * @param {Object} data
 */
DL.Client.prototype.get = function(segments, data) {
  return this.request(segments, "GET", data);
};

/**
 * @method put
 * @param {String} segments
 * @param {Object} data
 */
DL.Client.prototype.put = function(segments, data) {
  return this.request(segments, "PUT", data);
};

/**
 * @method delete
 * @param {String} segments
 */
DL.Client.prototype.remove = function(segments, data) {
  return this.request(segments, "DELETE", data);
};

/**
 * @method request
 * @param {String} segments
 * @param {String} method
 * @param {Object} data
 */
DL.Client.prototype.request = function(segments, method, data) {
    var payload, request_headers, deferred = when.defer(),
        synchronous = false;

    // FIXME: find a better way to write this
    if (data && data._sync) {
        delete data._sync;
        synchronous = true;
    }
    // Compute payload
    payload = this.getPayload(method, data);

    // Compute request headers
    request_headers = this.getHeaders();
    if(!(window.FormData && payload instanceof FormData)){
        request_headers["Content-Type"] = 'application/json'; // exchange data via JSON to keep basic data types
    }

    var url = this.url + segments;
    var data = payload;
    var sync = synchronous;
    var headers = request_headers;

    if (typeof data !== 'string'){
        var serialized = [];
        var skip = false;
        for (var datum in data) {
            if(typeof(data[datum]) == "function"){
                skip = true;
                break;
            }
            serialized.push(datum + '=' + data[datum]);
        }
        if(!skip){
            data = serialized.join('&');
        }
    }

    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(this.readyState != 4){
            return;
        }
        if(this.status == 200){
            var response = this.responseText;
            var data = null;
            try{
                data = JSON.parse(response);
            } catch(e) {
                //something wrong with JSON. IE throws exception on JSON.parse
            }

            if (!data || data.error) {
                deferred.resolver.reject(data);
            } else {
                deferred.resolver.resolve(data);
            }
        }else{
            var data = null;
            try{
                data = JSON.parse(this.responseText);
            }catch(e){
            }
            deferred.resolver.reject(data);
        }
    };

    request.open(method, (method === 'GET' && data ? url+'?'+data : url), !sync);
    if(headers != null){
        for (var header in headers) {
            request.setRequestHeader(header, headers[header]);
        }
    }
    request.send(method !== 'GET' ? data : null);
    return deferred.promise;
};

/**
 * Get XHR headers for app/auth context.
 * @method getHeaders
 * @return {Object}
 */
DL.Client.prototype.getHeaders = function() {
  // App authentication request headers
  var request_headers = {
    'X-App-Id': this.appId,
    'X-App-Key': this.key
  }, auth_token;

  // Forward user authentication token, if it is set
  var auth_token = window.localStorage.getItem(this.appId + '-' + DL.Auth.AUTH_TOKEN_KEY);
  if (auth_token) {
    request_headers['X-Auth-Token'] = auth_token;
  }
  return request_headers;
}

/**
 * Get payload of given data
 * @method getPayload
 * @param {String} requestMethod
 * @param {Object} data
 * @return {String|FormData}
 */
DL.Client.prototype.getPayload = function(method, data) {
  var payload = null;
  if (data) {
    if (window.FormData && (data instanceof FormData)){
      payload = data;

    }else if (method !== "GET") {
      var field, value, filename,
          formdata = window.FormData ? new FormData() : null,
          worth = false;

      for (field in data) {
        value = data[field];
        filename = null;
        
        if(typeof(value) === "function" || typeof(value) === "object"){
            if((value instanceof HTMLInputElement)){
                filename = value.files[0].name;
                value = value.files[0];
                worth = true;

            }else if((window.HTMLCanvasElement && value instanceof HTMLCanvasElement) || value.getContext != null){
                value = window.Blob ? dataURLtoBlob(value.toDataURL()) : "dl-api-"+(value.toDataURL());
                worth = true;

            }else if (window.Blob && (value instanceof Blob)){
                worth = true;
                filename = 'blob.' + value.type.match(/\/(.*)/)[1]; // get extension from blob mime/type
            }
        }

        if(formdata != null){
            formdata.append(field, value, filename || "file");
        }else{
            data[field] = value;
        }
      }

      if (worth && formdata != null) {
        payload = formdata;
      }
    }

    payload = payload || JSON.stringify(data);
    if (method==="GET" && typeof(payload)==="string") {
      payload = encodeURIComponent(payload);
    }
  }
  return payload;
}

DL.Client.prototype.serialize = function(obj, prefix) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
      v = obj[p];
      str.push(typeof v == "object" ? this.serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
};
