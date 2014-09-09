var DL = {
  VERSION: "0.1.0",
  defaults: {
    perPage: 50
  }
};

DL.Client = require('./core/client.js');


window.DL = DL;

var dl = new DL.Client({"url":"http://dl-api.ddll.co","appId":62,"key":"180b01d6daa79942286b59a67fa7aa47","name":"abraji-masterbrand-ddll"});

dl.collection('auth').then(console.log.bind(console))