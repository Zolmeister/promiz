var Promiz = require('./promiz')
var Q = require('q')

console.time('Promiz')

var target = 2000
var cnt = 0
function promiz(){

  if(cnt === target) {
    console.timeEnd('Promiz')
    cnt = 0
    console.time('Q')
    return q()
  }
  if(cnt === 2855){
    console.log('okkk')
  }
  cnt++



  var d = Promiz.defer()
  d.then(function(){
    promiz()
  })
  d.resolve()
}
promiz()

function q(){

  if(cnt === target) {
    console.timeEnd('Q')
    return
  }
  cnt++

  var d = Q.defer()
  d.promise.then(function(){
    q()
  })
  d.resolve()
}
