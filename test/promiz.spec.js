var promiz = require('./../promiz')

jasmine.getEnv().defaultTimeoutInterval = 200

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


    it('allows custom promise functions through deferred object', function(done) {

      function testPromise() {
        var deferred = promiz.defer()
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
        var deferred = promiz.defer()
        process.nextTick(function(){
          deferred.resolve(22)
        })
        return deferred
      }
      
      var d = promiz.defer()
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
      }).then(null, function(err) {
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
      }).fail(function(err){
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
      }).fail(function(err){
        expect(err).toBeDefined()
        expect(err.message).toBe('abc')
      }).fail(function(){
        done(new Error('then recieved an error'))
      }).fail(function(){
        done(new Error('then recieved an error'))
      }).then(function(){
        done()
      })
    })

    it('handles async errors properly', function(done){
      promise.then(null, function(){
        return errDefer().fail(function(){
          return 11
        })
      }).then(function(eleven) {
        expect(eleven).toBe(11)
        done()
      })
    })

    it('supports second `then` argument properly', function(done) {
      promise.fail(function(){
        return 1
      }).then(function(){
        throw new Error('def')
      }).fail(function(err) {
        expect(err).toBeDefined()
        expect(err.message).toBe('def')
        return 99
      }).then(function(ninetyNine){
        expect(ninetyNine).toBe(99)
        return errDefer().fail(function(){
          return 44
        })
      }).then(function(fortyFour){
        expect(fortyFour).toBe(44)
        throw new Error('ghi')
      }).fail(function(err){
        expect(err).toBeDefined()
        expect(err.message).toBe('ghi')
      }).then(function(err) {
        done()
      })
    })

  })

  describe('throwers', function(){

    function testPromise() {
      var deferred = promiz.defer()
      process.nextTick(function(){
        deferred.resolve(22)
      })
      return deferred
    }

    var promise = testPromise()

    it('prevents continuation on done', function(){
      expect(promise.done()).toBe(null)
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
        expect(list[2]).toBe(33)
        expect(list[3]).toBe(77)
        done()
      })
    })

    it('spreads', function(done){
      testPromise().then(function(){
        return [1, 2, testPromise().then(function(){ return 3 })]
      }).spread(function(one, two, three){
        expect(one).toBe(1)
        expect(two).toBe(2)
        expect(three).toBe(3)
        done()
      })
    })
  })

  describe('nodeify', function(){
    function testPromise() {
      var deferred = promiz.defer()
      process.nextTick(function(){
        deferred.resolve(22)
      })
      return deferred
    }

    var promise = testPromise()

    it('lets a promise terminate with a node-style callback', function(done){
      function cb(err, val){
        expect(val).toBe(3)
        done()
      }
      promise.then(function(){
        return 3
      }).nodeify(cb)
    })

    it('terminates with a node style callback and passes errors down', function(done){
      function cb(err, val){
        expect(err.message).toBe('abc')
        done()
      }
      promise.then(function(){
        throw new Error('abc')
      }).nodeify(cb)
    })

    it('still returns a promise to chain off of', function(done){
      testPromise().then(function(){
        return 3
      }).nodeify(function(){}).then(function(val){
        expect(val).toBe(3)
        return 11
      }).nodeify().then(function(val){
        expect(val).toBe(11)
        done()
      })
    })
  })

  describe('fcall', function(){
    it('calls a function and returns a promise', function(done){
      promiz.fcall(function(a, two, tr){
        expect(a).toBe('a')
        expect(two).toBe(2)
        expect(tr).toBe(true)
        return [a, two, tr]
      }, 'a', 2, true).then(function(list){
        expect(list.length).toBe(3)
        done()
      })
    })

    it('properly handles errors thrown by the function', function(done){
      promiz.fcall(function(){
        throw new Error('abc')
      }).then(function(){
        done(new Error('fcall did catch throw properly'))
      }).fail(function(err){
        expect(err.message).toBe('abc')
        done()
      })
    })
  })

  describe('nfcall', function(){
    it('calls a node-style function and returns a promise', function(done){
      function nodeStyle(val1, val2, val3, cb){
        expect(val1).toBe('a')
        expect(val2).toBe(2)
        expect(val3).toBe(true)
        process.nextTick(function(){
          cb(null, 88)
        })
      }

      promiz.nfcall(nodeStyle, 'a', 2, true).then(function(val){
        expect(val).toBe(88)
        done()
      })
    })

    it('properly handles errors returned by the function', function(done){
      function nodeStyle(cb){
        process.nextTick(function(){
          cb(new Error('abc'))
        })
      }

      promiz.nfcall(nodeStyle).then(function(){
        done(new Error('nfcall did not catch throw properly'))
      }).fail(function(err){
        expect(err.message).toBe('abc')
        done()
      })
    })

    it('properly handles errors thrown by the function', function(){
      function nodeStyle(cb){
        throw new Error('abc')
      }

      promiz.nfcall(nodeStyle).then(function(){
        done(new Error('nfcall did not catch throw properly'))
      }).fail(function(err){
        expect(err.message).toBe('abc')
        done()
      })
    })
  })
})





