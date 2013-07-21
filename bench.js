var Promiz = require('./promiz')
var Q = require('q')
var async = require('async')

console.time('Promiz')

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
    process.nextTick(function(){
      promiz()
    })
  })
  d.resolve()
}
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
    process.nextTick(function(){
      q()
    })
  })
  d.resolve()
}

function asy() {
  if(cnt === target) {
    console.timeEnd('async')
    return
  }
  cnt++

  async.series([
    function(cb){
      return cb()
    }
  ], function(err, res){
    process.nextTick(function(){
        asy()
      })
  })
}