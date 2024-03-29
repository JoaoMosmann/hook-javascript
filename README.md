dl-api-javascript
===

dl-api javascript client.

# How-to build
---

    $ npm install -g grunt-cli bower
    $ npm install
    $ bower install
    $ grunt

# Simple Usage

DL.Client is the entry-point for using dl-api.

You should instantiate a global javascript client for consuming dl-api.

```javascript
window.dl = new DL.Client({
  url:   "http://local-or-remote-dl-api-address.com/api/public/index.php/",
  appId: 1,    // your app's id
  key: 'test'  // your app's public key
});
```

After that, you're free to instantiate collections

```javascript
dl.collection('posts').create({
  title: "Post name",
  summary: "My awesome new post",
  stars: 5
});
```

And filter then, using `where`

```javascript
var c = dl.collection('posts');
c.where('author','Vicente'); // equal operator may be omitted
c.where('stars','>',10);     // support '<' and '>' operators
c.then(function(result) {
  console.log(result);
});
```

# API Docs

For a more complete documentation, check the [API reference](http://doubleleft.github.io/hook-javascript/).

To build and publish the docs:

```bash
make publish-docs
```
