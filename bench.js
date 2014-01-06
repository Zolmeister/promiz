var Promiz = require('./promiz')
var Q = require('q')
var async = require('async')

console.log('---Simple single async call 10000 times---\n')

var target = 100000
var cnt = 0

function promiz(){
  if(cnt === target) {
    console.timeEnd('Promiz')
    cnt = 0
    console.time('Q')
    return q()
  }
  cnt++

  var d = Promiz.defer()
  d.then(function(){
      promiz()
  })
  setImmediate(function(){
    d.resolve()
  })
}

console.time('Promiz')
promiz()

function q(){
  if(cnt === target) {
    console.timeEnd('Q')
    cnt=0
    console.time('async')
    return asy()
  }
  cnt++

  var d = Q.defer()
  d.promise.then(function(){
      q()
  })
  setImmediate(function(){
    d.resolve()
  })
}

function asy() {
  if(cnt === target) {
    console.timeEnd('async')
    return advanced()
  }
  cnt++

  setImmediate(function(){
    async.series([
      function(cb){
        return cb()
      }
    ], function(err, res){
          asy()
    })
  })
}

function advanced() {
  console.log('\n---Advanced parallel + waterfall style 10000 times---\n')
  cnt = 0
  console.time('Promiz')
  promizAdvanced()
}

function stub(val){
  return val || 1
}

function promizAdvanced() {
  if(cnt === target) {
    console.timeEnd('Promiz')
    cnt = 0
    console.time('Q')
    return qAdvanced()
  }
  cnt++

  var d = Promiz.defer()
  d.then(function(){
      return [Promiz.fcall(stub, 1),
              Promiz.fcall(stub, 2),
              Promiz.fcall(stub, 3)]
  }).all().then(function(){
    promizAdvanced()
  })
  setImmediate(function(){
    d.resolve()
  })
}

function qAdvanced() {
  if(cnt === target) {
    console.timeEnd('Q')
    cnt=0
    console.time('async')
    return asyncAdvanced()
  }
  cnt++

  var d = Q.defer()
  d.promise.then(function(){
      return [Q.fcall(stub, 1), Q.fcall(stub, 2), Q.fcall(stub, 3)]
  }).all().then(function(){
    qAdvanced()
  })
  setImmediate(function(){
    d.resolve()
  })
}

function asyncAdvanced() {

  if(cnt === target) {
    console.timeEnd('async')
    return
  }
  cnt++

  setImmediate(function(){
    async.series([
      function(cb){
        return cb()
      }
    ], function(err, res){
          async.parallel([
            function(cb){
              cb(null, stub(1))
            }, function(cb){
              cb(null, stub(2))
            }, function(cb){
              cb(null, stub(3))
            }
          ], function(err, res){
            asyncAdvanced()
          })
    })
  })
}
