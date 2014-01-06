(function () {

  // self is the promise object itself
  /**
   * @constructor
   */
  function promise(fn, er) {
    // states
    // 0: pending
    // 1: resolving
    // 2: rejecting
    // 3: resolved
    // 4: rejected
    var self = this

    self.promise = self
    var state = 0,
      val = 0,
      prev = 0,
      fn = fn || 0,
      er = er || 0,
      next = [];


    self.resolve = function (v) {
      if (!state) {
        if (prev && !prev.state) return prev.resolve(v)
        val = v
        state = 1

        setImmediate(function () {
          fire()
        })
      }
    }

    self.reject = function (v) {
      if (!state) {
        if (prev && !prev.state) return prev.reject(v)
        val = v
        state = 2

        setImmediate(function () {
          fire()
        })
      }
    }

    self.then = function (fn, er) {
      var p = new promise(fn, er)
      next.push(p)
      p.prev = self
      if (state == 3) {
        p.resolve(val)
      }
      if (state == 4) {
        p.reject(val)
      }
      return p
    }

    self.fail = function (er) {
      return self.then(null, er)
    }

    var finish = function (type) {
      state = type

      if (state == 3) {
        next.map(function (p) {
          p.resolve(val)
        })
      }

      if (state == 4) {
        next.map(function (p) {
          p.reject(val)
        })
      }
    }

    // ref : reference to 'then' function
    // cb, ec, cn : successCallback, failureCallback, notThennableCallback
    var thennable = function (ref, cb, ec, cn) {
      if (typeof val == 'object' && typeof ref == 'function') {
        try {
          
          // cnt protects against abuse calls from spec checker
          var cnt = 0
          ref.call(val, function x(v) {
            if (cnt++) return
            val = v
            cb()
          }, function (v) {
            if (cnt++) return
            val = v
            ec()
          })
        } catch (e) {
          val = e
          ec()
        }
      } else {
        cn()
      }
    }

    var fire = function () {

      // check if it's a thenable
      var ref;
      try {
        ref = val && val.then
      } catch (e) {
        val = e
        state = 2
        return fire()
      }

      thennable(ref, function () {
        state = 1
        fire()
      }, function () {
        state = 2
        fire()
      }, function () {
        if (state == 1 && typeof fn == 'function') {
          try {
            val = fn(val)
          } catch (e) {
            val = e
            return finish(4)
          }
        }

        if (state == 2 && typeof er == 'function') {
          try {
            val = er(val)
            state = 1
          } catch (e) {
            val = e
            return finish(4)
          }
        }

        if (val == self) {
          val = TypeError()
          return finish(4)
        }

        thennable(ref, function () {
          finish(3)
        }, function () {
          finish(4)
        }, function () {
          state == 1 ? finish(3) : finish(4)
        })

      })
    }

    // State transitions from pending to either resolved or rejected
    /*self.state = 'p'

    // Our current value
    self.val = val || undefined

    // self is a pointer to the next promise
    self.next = null
    
    // self is a pointer to the previous promise
    self.previous = null
    
    // functions to call
    self.successFn = null
    self.failFn = null

    // Resolved the promise to a value. Only affects the first time it is called
    self.resolve = function(val) {
      self.resolve = function(){}
      
      if(self.previous) {
        return self.previous.resolve(val)
      }
      self.val = val
      process.nextTick(function() {
        self.state = 'r'
        fire()
        self.next = self.q
      }.bind(self))
      fire()
      
      self.q = new promise()
      self.q.previous = self
      
      return self.q
    }

    // Rejects the promise with a value. Only affects the first time it is called
    self.reject = function(val) {
      self.reject = function() {}
      if(self.previous) {
        return self.previous.reject(val)
      }
      self.val = val
      process.nextTick(function() {
        self.state = 'f'
        fire()
        self.next = self.q
      }.bind(self))
      fire()
      
      self.q = new promise()
      self.q.previous = self
      return self.q
    }

    // The heart of the promise, adding a defered call to our call stack
    self.then = function(fn, er) {
      self.successFn = fn
      self.failFn = er
      self.next = new promise()
      self.next.previous = self
      
      if(self.state !== 'p') {
        process.nextTick(function() {
          fire()
        }.bind(self))
      }
      
      return self.next
    }
    
    fire = function() {
      var res = self.val
      try {
        if(self.state == 's' && self.successFn) {
          res = self.successFn(self.val)
        }
        
        if(self.state == 'f' && self.failFn) {
          res = self.failFn(self.val)
        }
      } catch(e) {
        if(self.state == 's' && self.failFn) {
          try {
            res = self.failFn(e)
          } catch(e) {
            res = e
          }
        } else {
          res = e
        }
      }
      if(res && res.then) {
        res.then(function(val) {
          if(self.next) {
            self.next.state = 'r'
            self.next.val = val
            self.next.fire()
          }
        }.bind(self), function(val) {
          if(self.failFn) {
            var res = val
            try {
              res = self.failFn(val)
              self.state = 's'
            } catch(e) {
              self.state = 'f'
              res = e
            }
            val = res 
          }
          if(self.next) {
            self.next.state = 'f'
            self.next.val = val
            self.next.fire()
          }
        }.bind(self))
      } else if (self.next) {
        self.next.state = 's'
        self.next.val = res
        self.next.fire()
      }
    }
    
    self.fail = function(fn) {
      return self.then(null, fn)
    }
    */
    /*
    // If there is an unhandled error, throw it
    // End the promise chain by returning null
    self.done = function(){
      self.failing = true
      if (self.state !== 0) {
        fire()
      }
      return null
    }

    // Catch any errors up to self point
    self.fail = function (fn) {
      return self.then(null, fn)
    }

    // Allow for node-style callback returning
    self.nodeify = function (cb) {

      // Process asyncronously, so if the function fails the error gets thrown
      function tick(fn){
        if(typeof process !== 'undefined' && process.nextTick) {
          process.nextTick(fn)
        } else {
          setTimeout(fn, 0)
        }
      }

      if(cb) {
        self.then(function(val){
          tick(function(){
            cb(null, val)
          })

          return val
        }, function(err){
          tick(function(){
            cb(err)
          })
        })
      }

      // still returns a promise to allow `dual` functions (callback + promise)
      return self
    }

    // Apply a list value over the next function
    self.spread = function (fn, er) {
      return self.all().then(function(list){
        return fn ? fn.apply(null, list) :  null
      }, er)
    }

    // Resolves an array of promises before continuing
    self.all = function () {
      var self = self

      // create a new deferred, to be resolved when we finish
      var def = new defer()

      // Add a special function to the stack, which takes in the list of promise objects
      self.stack.push([function(list){
        list = list ? (list instanceof Array ? list : [list]) : []
        if (list.length == 0){
          return list
        }

        // We count up resolved and match it to the length of the list of promises
        // self lets us know when we've finished
        var cnt = 0
        var len = list.length

        function checkDone(){
          if(cnt !== len) {
            return
          }
          def.resolve(list)
        }

        // iterate over the list, resolving each value
        var ind = len

        while(ind--) {

          // Create varaible scope
          (function(){
            var i = ind
            var val = list[i]
            if(val && val.then &&
               typeof val.then == 'function' &&
               typeof val == 'object'){
            val.then(function(res){
              list[i] = res
              cnt++
              checkDone()
            }, function(err){
              def.reject(err)
            })
          } else {
            list[i] = val
            cnt++
            checkDone()
          }
          })()
        }

        return null
      }, null])

      if (self.state !== 0) {
        fire()
      }

      return def
    }

    // self is our main execution thread
    // Here is where we consume the stack of promises
    fire = function (val) {
      var self = self
      self.val = typeof val !== 'undefined' ? val : self.val

      // Iterate through the stack
      while(self.stack.length && self.state !== 0) {
        // Get the next stack item
        var entry = self.stack.shift()
        var fn = self.state == 4 ? entry[1] : entry[0]

        if(fn) {
          try {
            self.val = fn(self.val)

            // If the value returned is a promise, resolve it
            if(self.val &&
               typeof self.val.then == 'function' &&
               typeof self.val == 'object') {
              var prevState = self.state

              // Halt stack execution until the promise resolves
              self.state = 0

              // resolving
              self.val.then(function(v){

                // success callback
                self.resolve(v)
              }, function(err){

                // error callback

                // re-run the stack item if it has an error callback
                // but only if we weren't already in a rejected state
                if(prevState !== 4 && entry[1]) {
                  self.stack.unshift(entry)
                }

                self.reject(err)
              })

            } else {
              //self.state = 3
            }
          } catch (e) {

            // the function call failed, lets reject ourselves
            // and re-run the stack item in case it can handle an error case
            // but only if we didn't just do that (eg. the error function of on the stack threw)
            self.val = e
            if(self.state !== 4 && entry[1]) {
              self.stack.unshift(entry)
            }

            self.state = 4
          }
        }
      }

      // If the `failing` flag has been set, and we have exausted the stack, and we have an error
      // Throw the error
      if(self.failing && self.stack.length == 0 && self.state == 4) {
        throw self.val
      }

    }
*/

  }

  // self object gets globalalized/exported
  var promiz = {

    // promise factory
    defer: function () {
      return new promise(0, 0)
    }

    // calls a function and resolved as a promise
    /*fcall: function() {
      var def = new promise()
      var args = Array.apply([], arguments)
      var fn = args.shift()
      try {
        var val = fn.apply(null, args)
        def.resolve(val)
      } catch(e) {
        def.reject(e)
      }

      return def
    },

    // calls a node-style function (eg. expects callback as function(err, callback))
    nfcall: function() {
      var def = new promise()
      var args = Array.apply([], arguments)
      var fn = args.shift()
      try {

        // Add our custom promise callback to the end of the arguments
        args.push(function(err, val){
          if(err) {
            return def.reject(err)
          }
          return def.resolve(val)
        })
        fn.apply(null, args)
      } catch (e) {
        def.reject(e)
      }

      return def
    }*/
  }
  // Export our library object, either for node.js or as a globally scoped variable
  if (typeof module !== 'undefined') {
    module.exports = promiz
  } else {
    this.Promiz = promiz
  }
})()