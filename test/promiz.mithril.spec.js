var promiz = require('./../promiz.mithril')
jasmine.getEnv().defaultTimeoutInterval = 200

describe('promiz library', function(){


  describe('basic user deferreds', function(){

    function testPromise() {
      var deferred = promiz.deferred()
      process.nextTick(function(){
        deferred.resolve(22)
      })
      return deferred
    }

    var promise = testPromise()


    it('allows custom promise functions through deferred object', function(done) {

      function testPromise() {
        var deferred = promiz.deferred()
        process.nextTick(function(){
          deferred.resolve(22)
        })
        return deferred
      }


      var called = 0
      promise.then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
        expect(called).toBe(0)
        called++
        done()
        return 99
      })

      promise.then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
        expect(called).toBe(1)
        called++
        return 99
      })

      promise.then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
        expect(called).toBe(2)
        return 99
      })

      promise.then(testPromise).then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
      }).then(function(){
        return testPromise()
      }).then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
        done()
      })

    })

    it('allows resolving with a thenable', function(done) {
      function testPromise() {
        var deferred = promiz.deferred()
        process.nextTick(function(){
          deferred.resolve(22)
        })
        return deferred
      }

      var d = promiz.deferred()
      d.resolve(testPromise())
      d.then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
        done()
      })
    })

    it('follows multi-use spec', function(done){
      var called = 0
      promise.then(function(twentyTwo) {
        expect(called++).toBe(0)
        expect(twentyTwo).toBe(22)
        return 11
      })
      promise.then(function(twentyTwo) {
        expect(called++).toBe(1)
        expect(twentyTwo).toBe(22)
        return 11
      })
      promise.then(function(twentyTwo) {
        expect(called++).toBe(2)
        expect(twentyTwo).toBe(22)
        done()
      })
    })

    it('supports early deferreds', function(done){
      function earlydeferred() {
        var deferred = promiz.deferred()
        deferred.resolve(33)
        return deferred
      }

      promise.then(function(){
        return earlydeferred()
      }).then(function(thirtyThree){
        expect(thirtyThree).toBe(33)
      }).then(earlydeferred).then(function(thirtyThree){
        expect(thirtyThree).toBe(33)
        done()
      })

    })

    it('supports error deferreds', function(done){
      function errdeferred() {
        var deferred = promiz.deferred()
        process.nextTick(function(){
          deferred.reject(new Error('abc'))
        })
        return deferred
      }


      promise.then(errdeferred).then(function(){
        // This should not be called
        done(new Error('then recieved an error'))
      }).then(null, function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('abc')
        done()
      })
    })

    it('supports early error deferreds', function(done){
      function earlyErr() {
        var deferred = promiz.deferred()
        deferred.reject(new Error('def'))
        return deferred
      }

      promise.then(function(){
        return earlyErr()
      }).then(function() {
        // This should not be called
        done(new Error('then recieved an error'))
      }).then(null, function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('def')
      }).then(null, function(err){
        done(new Error('exception transcended a fail'))
      }).then(function(){
        done()
      })
    })

    it('supports double resolves', function(done) {
      function doubleResolve() {
        var deferred = promiz.deferred()
        deferred.resolve(66)
        deferred.resolve(99)
        return deferred
      }

      promise.then(doubleResolve).then(function(sixtySix){
        expect(sixtySix).toBe(66)
        done()
      })
    })

    it('supports double rejects', function(done) {
      function doubleReject() {
        var deferred = promiz.deferred()
        deferred.reject(new Error('abc'))
        deferred.reject(new Error('def'))
        return deferred
      }

      promise.then(doubleReject).then(null, function(abc){
        expect(abc.message).toBe('abc')
        done()
      })
    })

  })

  describe('propness', function () {
    function testPromise() {
      var deferred = promiz.deferred()
      deferred.resolve(22)
      return deferred
    }

    it('funcs', function () {
      expect(testPromise()()).toBe(22)
      expect(testPromise().then(function () {
        return 33
      })()).toBe(33)
    })
  })

  describe('error handling', function(){

    function errdeferred() {
      var deferred = promiz.deferred()
      process.nextTick(function(){
        deferred.reject(new Error('abc'))
      })
      return deferred
    }

    var promise = errdeferred()

    it('handles basic errors properly', function(done) {

      promise.then(function(err){
        console.log('errr', err)
        done(new Error('then recieved an error'))
      }).then(null, function(err){
        expect(err).toBeDefined()
        expect(err.message).toBe('abc')
      }).then(null, function(){
        done(new Error('then recieved an error'))
      }).then(null, function(){
        done(new Error('then recieved an error'))
      }).then(function(){
        done()
      })
    })

    it('handles async errors properly', function(done){
      promise.then(null, function(){
        return errdeferred().then(null, function(){
          return 11
        })
      }).then(function(eleven) {
        expect(eleven).toBe(11)
        done()
      })
    })

    it('supports second `then` argument properly', function(done) {
      promise.then(null, function(){
        return 1
      }).then(function(){
        throw new Error('def')
      }).then(null, function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('def')
        return 99
      }).then(function(ninetyNine){
        expect(ninetyNine).toBe(99)
        return errdeferred().then(null, function(){
          return 44
        })
      }).then(function(fortyFour){
        expect(fortyFour).toBe(44)
        throw new Error('ghi')
      }).then(null, function(err){
        expect(err).toBeDefined()
        expect(err.message).toBe('ghi')
      }).then(function(err) {
        done()
      })
    })

  })
})
