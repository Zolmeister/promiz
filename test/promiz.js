var Promise = require('./../promiz')
var should = require('clay-chai').should()
var expect = require('clay-chai').expect

describe('promiz library', function(){
  this.timeout(200)

  describe('constructor', function () {
    it('resolves', function (done) {
      Promise.resolve(22).then(function (tt) {
        tt.should.be(22)
        done()
      })
    })

    it('rejects', function (done) {
      Promise.reject(new Error('abc')).then(function () {
        done(new Error('then recieved an error'))
      }, function (err) {
        err.message.should.be('abc')
        done()
      })
    })

    it('rejects with resolved promise', function (done) {
      Promise.reject(Promise.resolve()).then(function () {
        done(new Error('then recieved an error'))
      }, function (err) {
        expect(err instanceof Promise).to.be(true)
        done()
      })
    })
  })


  describe('basic user deferreds', function(){

    function testPromise() {
      return new Promise(function (resolve, reject) {
        process.nextTick(function(){
          resolve(22)
        })
      })
    }

    it('allows custom promise functions through deferred object', function(done) {
      var promise = testPromise()


      var called = 0
      promise.then(function(twentyTwo){
        expect(twentyTwo).to.be(22)
        expect(called).to.be(0)
        called++
        return 99
      })

      promise.then(function(twentyTwo){
        expect(twentyTwo).to.be(22)
        expect(called).to.be(1)
        called++
        return 99
      })

      promise.then(function(twentyTwo){
        expect(twentyTwo).to.be(22)
        expect(called).to.be(2)
        return 99
      })

      promise.then(testPromise).then(function(twentyTwo){
        expect(twentyTwo).to.be(22)
      }).then(function(){
        return testPromise()
      }).then(function(twentyTwo){
        expect(twentyTwo).to.be(22)
        done()
      })

    })

    it('allows resolving with a thenable', function(done) {


      var d = new Promise()
      d.resolve(testPromise())
      d.then(function(twentyTwo){
        expect(twentyTwo).to.be(22)
        done()
      })
    })

    it('follows multi-use spec', function(done){


      var promise = testPromise()

      var called = 0
      promise.then(function(twentyTwo) {
        expect(called++).to.be(0)
        expect(twentyTwo).to.be(22)
        return 11
      })
      promise.then(function(twentyTwo) {
        expect(called++).to.be(1)
        expect(twentyTwo).to.be(22)
        return 11
      })
      promise.then(function(twentyTwo) {
        expect(called++).to.be(2)
        expect(twentyTwo).to.be(22)
        done()
      })
    })

    it('supports early deferreds', function(done){


      var promise = testPromise()

      function earlyDefer() {
        var deferred = new Promise().resolve(33)
        return deferred
      }

      promise.then(function(){
        return earlyDefer()
      }).then(function(thirtyThree){
        expect(thirtyThree).to.be(33)
      }).then(earlyDefer).then(function(thirtyThree){
        expect(thirtyThree).to.be(33)
        done()
      })

    })

    it('basic error deferred', function (done) {
      function errDefer() {
        var deferred = new Promise(function (resolve, reject) {
          process.nextTick(function(){
            reject(new Error('abc'))
          })
        })
        return deferred
      }

      errDefer().then(function () {
        done(new Error('then recieved an error'))
      }, function (err) {
        expect(err.message).to.be('abc')
      }).then(function () {
        throw new Error('abc')
      }).then(null, function (err) {
        expect(err.message).to.be('abc')
        done()
      })
    })

    it('supports error deferreds', function(done){
      function errDefer() {
        var deferred = new Promise(function (resolve, reject) {
          process.nextTick(function(){
            reject(new Error('abc'))
          })
        })
        return deferred
      }

      var promise = testPromise()


      promise.then(errDefer).then(function(){
        // This should not be called
        done(new Error('then recieved an error'))
      }).then(null, function(err) {
        expect(err.message).to.be('abc')
        done()
      })
    })

    it('supports early error deferreds', function(done){
      var promise = testPromise()

      function earlyErr() {
        var deferred = new Promise()
        deferred.reject(new Error('def'))
        return deferred
      }

      promise.then(function(){
        return earlyErr()
      }).then(function() {
        // This should not be called
        done(new Error('then recieved an error'))
      }).then(null, function(err) {
        expect(err.message).to.be('def')
      }).then(null, function(err){
        done(new Error('exception transcended a fail'))
      }).then(function(){
        done()
      })
    })

    it('supports double resolves', function(done) {
      var promise = testPromise()

      function doubleResolve() {
        var deferred = new Promise()
        deferred.resolve(66)
        deferred.resolve(99)
        return deferred
      }

      promise.then(doubleResolve).then(function(sixtySix){
        expect(sixtySix).to.be(66)
        done()
      })
    })

    it('supports double rejects', function(done) {
      var promise = testPromise()

      function doubleReject() {
        var deferred = new Promise(function (resolve, reject) {
          reject(new Error('abc'))
          reject(new Error('def'))
        })
        return deferred
      }

      promise.then(doubleReject).then(null, function(abc){
        expect(abc.message).to.be('abc')
        done()
      })
    })

    it('isnt called twice', function (done) {
      var p1 = new Promise(function (resolve) {
        resolve(1)
      })

      p1.then(function (r1) {
          r1.should.be(1)
          setTimeout(function () {
            done()
          }, 10)
      }).catch(function (e) {
        done(new Error())
      })
    })

  })

  describe('error handling', function(){

    function errDefer() {
      var deferred = new Promise()
      process.nextTick(function(){
        deferred.reject(new Error('abc'))
      })
      return deferred
    }


    it('handles basic errors properly', function(done) {
      var promise = errDefer()

      promise.then(function(err){
        console.log('errr', err)
        done(new Error('then recieved an error'))
      }).then(null, function(err){
        expect(err.message).to.be('abc')
      }).then(null, function(){
        done(new Error('then recieved an error'))
      }).then(null, function(){
        done(new Error('then recieved an error'))
      }).then(function(){
        done()
      })
    })

    it('handles async errors properly', function(done){
      var promise = errDefer()
      promise.then(null, function(){
        return errDefer().then(null, function(){
          return 11
        })
      }).then(function(eleven) {
        expect(eleven).to.be(11)
        done()
      })
    })

    it('supports second `then` argument properly', function(done) {
      var promise = errDefer()
      promise.then(null, function(){
        return 1
      }).then(function(){
        throw new Error('def')
      }).then(null, function(err) {
        expect(err.message).to.be('def')
        return 99
      }).then(function(ninetyNine){
        expect(ninetyNine).to.be(99)
        return errDefer().then(null, function(){
          return 44
        })
      }).then(function(fortyFour){
        expect(fortyFour).to.be(44)
        throw new Error('ghi')
      }).then(null, function(err){
        expect(err.message).to.be('ghi')
      }).then(function(err) {
        done()
      })
    })

    it('rejects internal trhow', function (done) {
      var p = new Promise(function (resolve, reject) {
        throw new Error('abc')
      })

      p.then(function () {
        done(new Error('then recieved an error'))
      }, function (err) {
        expect(err.message).to.be('abc')
        done()
      })
    })

  })
})
