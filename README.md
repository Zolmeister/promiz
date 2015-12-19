![Promiz.js](https://raw.github.com/Zolmeister/promiz/master/imgs/logo.png)
======
<a href="http://promises-aplus.github.com/promises-spec">
    <img src="https://raw.github.com/Zolmeister/promiz/master/imgs/promise-logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>
A polyfill for ES6-style Promises in 913 bytes (gzip) (v0.3 [Blog Post](http://www.zolmeister.com/2014/01/promiz-micro-promises-in-228-bytes.html)) ~~([How it was built](http://www.zolmeister.com/2013/07/promizjs.html))~~  
![build-status](https://travis-ci.org/Zolmeister/promiz.png?branch=master)
## Install
```bash
# Node.js
npm install promiz --save

# Bower
bower install promiz --save
```
```html
<!-- Browser -->
<script src='promiz.js'></script>
```
Promiz - **913 bytes** (min + gzip) - as reported by uglify.js  
## Promiz
[HTML5rocks tutorial](http://www.html5rocks.com/en/tutorials/es6/promises/)
### Constructor - `new Promise(Function<resolve, reject>)`
```js
var promise = new Promise(function (resolve, reject) {
  if ('itIsRaining' && Math.random() * 10 === 2) {
    reject(new Error('reason'))
  } else {
    resolve(42)
  }
})
```
### `Promise.reject({reason})`
```js
promise = Promise.reject(new Error('reason'))
```
### `Promise.resolve({value})`
```js
promise = Promise.resolve(42)
```
### `promise.then({Function}, {Function})`
```js
promise = Promise.resolve(42)
promise.then(function (success) {
  return 'Promise resolved to: ' + success
}, function (failure) {
  return 'Promise failed with: ' + failure
})
```
### `promise.catch({Function})`
```js
promise = Promise.reject(new Error('failure'))
promise.catch(function (failure) {
  return 'Promise failed with: ' + failure
})
```
### `Promise.all({iterable})`
```js
promise1 = Promise.resolve(1)
promise2 = Promise.resolve(2)
Promise.all([promise1, 123, promise2])
.then(function (promises) {
  promises[0] === 1
  promises[1] === 123
  promises[2] === 2
})
```
### `Promise.race({iterable})`
```js
promise1 = new Promise()
promise2 = new Promise()

setTimeout(function () {
  promise1.resolve('z')
}, 10)

setTimeout(function () {
  promise2.resolve('l')
}, 100)

Promise.race([promise1, promise2])
.then(function (winner) {
  winner === 'z'
})
```

### Licence: MIT
