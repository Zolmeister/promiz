var promiz = require('./promiz')

describe('promiz library', function(){


  describe('basic user deferreds', function(){

    function testPromise() {
      var deferred = promiz.defer()
      process.nextTick(function(){
        deferred.resolve(22)
      })
      return deferred
    }

    var promise = testPromise()


    it('allows custom promise functions through deferred object', function(done){

      function testPromise() {
        var deferred = promiz.defer()
        process.nextTick(function(){
          deferred.resolve(22)
        })
        return deferred
      }

      promise.then(testPromise).then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
      }).then(function(){
        return testPromise()
      }).then(function(twentyTwo){
        expect(twentyTwo).toBe(22)
        done()
      })
    })

    it('supports early deferreds', function(done){
      function earlyDefer() {
        var deferred = promiz.defer()
        deferred.resolve(33)
        return deferred
      }

      promise.then(function(){
        return earlyDefer()
      }).then(function(thirtyThree){
        expect(thirtyThree).toBe(33)
      }).then(earlyDefer).then(function(thirtyThree){
        expect(thirtyThree).toBe(33)
        done()
      })

    })

    it('supports error deferreds', function(done){
      function errDefer() {
        var deferred = promiz.defer()
        process.nextTick(function(){
          deferred.reject(new Error('abc'))
        })
        return deferred
      }

      promise.then(errDefer).then(function(){
        // This should not be called
        done(new Error('then recieved an error'))
      }).catch(function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('abc')
        done()
      })
    })

    it('supports early error deferreds', function(done){
      function earlyErr() {
        var deferred = promiz.defer()
        deferred.reject(new Error('def'))
        return deferred
      }

      promise.then(function(){
        return earlyErr()
      }).then(function() {
        // This should not be called
        done(new Error('then recieved an error'))
      }).fail(function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('def')
      }).catch(function(err){
        done(new Error('exception transcended a fail'))
      }).then(function(){
        done()
      })
    })

    it('supports double resolves', function(done) {
      function doubleResolve() {
        var deferred = promiz.defer()
        deferred.resolve(66)
        deferred.resolve(99)
        return deferred
      }

      promise.then(doubleResolve).then(function(sixtySix){
        expect(sixtySix).toBe(66)
        done()
      })
    })

  })

  describe('error handling', function(){

    function errDefer() {
      var deferred = promiz.defer()
      process.nextTick(function(){
        deferred.reject(new Error('abc'))
      })
      return deferred
    }

    var promise = errDefer()

    it('handles basic errors properly', function(done) {
      promise.then(function(err){
        console.log('errr', err)
        done(new Error('then recieved an error'))
      }).catch(function(err){
        expect(err).toBeDefined()
        expect(err.message).toBe('abc')
      }).fail(function(){
        done(new Error('then recieved an error'))
      }).catch(function(){
        done(new Error('then recieved an error'))
      }).then(function(){
        done()
      })
    })

    it('handles async errors properly', function(done){
      promise.then(function(){
        return errDefer().catch(function(){
          return 11
        })
      }).then(function(eleven) {
        expect(eleven).toBe(11)
        done()
      })
    })

    it('supports second `then` argument properly', function(done){
      promise.then(function(){
        throw new Error('def')
      }, function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('def')
        return 99
      }).then(function(ninetyNine){
        expect(ninetyNine).toBe(99)
        return errDefer().catch(function(){
          return 44
        })
      }).then(function(fortyFour){
        expect(fortyFour).toBe(44)
        throw new Error('ghi')
      }).catch(function(err){
        expect(err).toBeDefined()
        expect(err.message).toBe('ghi')
      }).then(errDefer, function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('abc')
        done()
      })
    })

  })

})





