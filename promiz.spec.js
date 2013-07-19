var promiz = require('./promiz')

describe('promiz library', function(){


  describe('basic user deferreds', function(){
    return
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

    it('supports double rejects', function(done) {
      function doubleReject() {
        var deferred = promiz.defer()
        deferred.reject(new Error('abc'))
        deferred.reject(new Error('def'))
        return deferred
      }

      promise.then(doubleReject).fail(function(abc){
        expect(abc.message).toBe('abc')
        done()
      })
    })

  })

  describe('error handling', function(){
    return
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

  describe('throwers', function(){
    return
    function testPromise() {
      var deferred = promiz.defer()
      process.nextTick(function(){
        deferred.resolve(22)
      })
      return deferred
    }

    var promise = testPromise()

    it('prevents continuation on done', function(){
      expect(promise.done()).toBeUndefined()
      expect(promise.throwing).toBe(true)
    })

    it('sets throwing to true', function(){
      promise = testPromise()
      promise.throws()
      expect(promise.throwing).toBe(true)
    })

  })

  describe('spread and all', function(){
    function testPromise() {
      var deferred = promiz.defer()
      process.nextTick(function(){
        deferred.resolve(22)
      })
      return deferred
    }

    var promise = testPromise()

    it('alls', function(done){
      promise.then(function(){
        return [1,2,3]
      })
      .all()
      .then(function(oneTwoThree){
        expect(oneTwoThree.join('')).toBe('123')

        var prom1 =  testPromise()
        var prom2 =  testPromise().then()
        var prom3 =  testPromise().then(function(){ return 33 })
        var static = 77

        return [prom1, prom2, prom3, static]

      }).all().then(function(list){
        expect(list[0]).toBe(22)
        expect(list[1]).toBeUndefined()
        expect(list[2]).toBe(33)
        expect(list[3]).toBe(77)
        done()
      })
    })

    it('spreads', function(){

    })
  })

  describe('asyncronicity', function(){
    it('is actually always asyncronouse', function(){

    })
  })

})





