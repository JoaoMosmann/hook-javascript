/**
 * @module DL
 */
var DL = {
  VERSION: "0.1.0",
  defaults: {
    perPage: 50
  }
};

DL.Client = require('./client.js');

window.DL = DL;