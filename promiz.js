!function(){

  // This object gets globalalized/exported
  var promiz = {

    // promise factory
    defer: function(){
      return new promise()
    },

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

  // This is the promise object itself
  function promise(fn, er){
    this.promise = this
    this.state = 'pending'
    this.val = null
    this.next = []
    this.prev = null
    this.fn = fn || null
    this.er = er || null
    
    this.resolve = function(val) {
      if(this.state !== 'pending') return
      if(this.prev && this.prev.state === 'pending') return this.prev.resolve(val)
      this.val = val
      this.state = 'resolving'
      
      process.nextTick(function() {
        this.fire()
      }.bind(this))
    }
    
    this.reject = function(val) {
      if(this.state !== 'pending') return
      if(this.prev && this.prev.state === 'pending') return this.prev.reject(val)
      this.val = val
      this.state = 'rejecting'
      
      process.nextTick(function() {
        this.fire()
      }.bind(this))
    }
    
    this.then = function(fn, er) {
      var p = new promise(fn, er)
      this.next.push(p)
      p.prev = this
      if(this.state === 'resolved' || this.state === 'rejected') {
        if(this.state === 'resolved' && this.next) {
            p.resolve(this.val)
        }
        if(this.state === 'rejected' && this.next) {
            p.reject(this.val)
        }
      }
      return p
    }
    
    this.fail = function(er) {
      return this.then(null, er)
    }
    
    this.finish = function(type, val) {
      this.state = type
      this.val = val || this.val
      
      if(this.state === 'resolved' && this.next) {
        this.next.map(function(p){
          p.resolve(this.val)
        }.bind(this))
      }
      
      if(this.state === 'rejected' && this.next) {
        this.next.map(function(p){
          p.reject(this.val)
        }.bind(this))
      }
    }
    
    this.chain = function(promise, ref) {
      var self = this
      
      if(promise === this) {
        return this.finish('rejected', new TypeError())
      }
      
      // it's not a thenable, resolve/reject with it's value
      if(typeof promise !== 'object' || typeof ref !== 'function') {
        if(this.state === 'resolving')
          return this.finish('resolved', promise)
        return this.finish('rejected', promise)
      }

      try {
        ref.call(promise, function resolved(val) {
          self.finish('resolved', val)
        }, function(val) {
          self.finish('rejected', val)
        })
      } catch(e) {
        this.finish('rejected', e)
      }
      
    }
    
    this.fire = function() {
      var self = this
      // check if it's a thenable
      var promise = this.val
      if(promise === this) {
        return this.finish('rejected', new TypeError())
      }
      
      var ref;
      try {
        ref = promise && promise.then
      } catch(e) {
        this.val = e
        this.state = 'rejecting'
        return this.fire()
      }
      
      // it's a thenable chain it
      if(typeof promise === 'object' && typeof ref === 'function') {
        try {
          var cnt=0
          ref.call(promise, function(val) {
            if(cnt++!== 0) return
            self.val = val
            self.state = 'resolving'
            self.fire()
          }, function(val) {
            if(cnt++!== 0) return
            self.val = val
            self.state = 'rejecting'
            self.fire()
          })
        } catch(e) {
          this.state = 'rejecting'
          this.val = e
          this.fire()
        }
        return
      }
      
      if(this.state === 'resolving' && typeof this.fn === 'function' ) {
        try {
          this.val = this.fn.call(undefined, this.val)
        } catch(e) {
          return this.finish('rejected', e)
        }
      }
      
      if (this.state === 'rejecting' && typeof this.er === 'function') {
        try {
          this.val = this.er.call(undefined, this.val)
          this.state = 'resolving'
        } catch(e) {
          return this.finish('rejected', e)
        }
      }

      return this.chain(this.val, ref)
    }
    
    // State transitions from pending to either resolved or rejected
    /*this.state = 'p'

    // Our current value
    this.val = val || undefined

    // This is a pointer to the next promise
    this.next = null
    
    // this is a pointer to the previous promise
    this.previous = null
    
    // functions to call
    this.successFn = null
    this.failFn = null

    // Resolved the promise to a value. Only affects the first time it is called
    this.resolve = function(val) {
      this.resolve = function(){}
      
      if(this.previous) {
        return this.previous.resolve(val)
      }
      this.val = val
      process.nextTick(function() {
        this.state = 'r'
        this.fire()
        this.next = this.q
      }.bind(this))
      this.fire()
      
      this.q = new promise()
      this.q.previous = this
      
      return this.q
    }

    // Rejects the promise with a value. Only affects the first time it is called
    this.reject = function(val) {
      this.reject = function() {}
      if(this.previous) {
        return this.previous.reject(val)
      }
      this.val = val
      process.nextTick(function() {
        this.state = 'f'
        this.fire()
        this.next = this.q
      }.bind(this))
      this.fire()
      
      this.q = new promise()
      this.q.previous = this
      return this.q
    }

    // The heart of the promise, adding a defered call to our call stack
    this.then = function(fn, er) {
      this.successFn = fn
      this.failFn = er
      this.next = new promise()
      this.next.previous = this
      
      if(this.state !== 'p') {
        process.nextTick(function() {
          this.fire()
        }.bind(this))
      }
      
      return this.next
    }
    
    this.fire = function() {
      var res = this.val
      try {
        if(this.state === 's' && this.successFn) {
          res = this.successFn(this.val)
        }
        
        if(this.state === 'f' && this.failFn) {
          res = this.failFn(this.val)
        }
      } catch(e) {
        if(this.state === 's' && this.failFn) {
          try {
            res = this.failFn(e)
          } catch(e) {
            res = e
          }
        } else {
          res = e
        }
      }
      if(res && res.then) {
        res.then(function(val) {
          if(this.next) {
            this.next.state = 'r'
            this.next.val = val
            this.next.fire()
          }
        }.bind(this), function(val) {
          if(this.failFn) {
            var res = val
            try {
              res = this.failFn(val)
              this.state = 's'
            } catch(e) {
              this.state = 'f'
              res = e
            }
            val = res 
          }
          if(this.next) {
            this.next.state = 'f'
            this.next.val = val
            this.next.fire()
          }
        }.bind(this))
      } else if (this.next) {
        this.next.state = 's'
        this.next.val = res
        this.next.fire()
      }
    }
    
    this.fail = function(fn) {
      return this.then(null, fn)
    }
    */
    /*
    // If there is an unhandled error, throw it
    // End the promise chain by returning null
    this.done = function(){
      this.failing = true
      if (this.state !== 'pending') {
        this.fire()
      }
      return null
    }

    // Catch any errors up to this point
    this.fail = function (fn) {
      return this.then(null, fn)
    }

    // Allow for node-style callback returning
    this.nodeify = function (cb) {

      // Process asyncronously, so if the function fails the error gets thrown
      function tick(fn){
        if(typeof process !== 'undefined' && process.nextTick) {
          process.nextTick(fn)
        } else {
          setTimeout(fn, 0)
        }
      }

      if(cb) {
        this.then(function(val){
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
      return this
    }

    // Apply a list value over the next function
    this.spread = function (fn, er) {
      return this.all().then(function(list){
        return fn ? fn.apply(null, list) :  null
      }, er)
    }

    // Resolves an array of promises before continuing
    this.all = function () {
      var self = this

      // create a new deferred, to be resolved when we finish
      var def = new defer()

      // Add a special function to the stack, which takes in the list of promise objects
      this.stack.push([function(list){
        list = list ? (list instanceof Array ? list : [list]) : []
        if (list.length === 0){
          return list
        }

        // We count up resolved and match it to the length of the list of promises
        // This lets us know when we've finished
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
               typeof val.then === 'function' &&
               typeof val === 'object'){
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

      if (this.state !== 'pending') {
        this.fire()
      }

      return def
    }

    // This is our main execution thread
    // Here is where we consume the stack of promises
    this.fire = function (val) {
      var self = this
      this.val = typeof val !== 'undefined' ? val : this.val

      // Iterate through the stack
      while(this.stack.length && this.state !== 'pending') {
        // Get the next stack item
        var entry = this.stack.shift()
        var fn = this.state === 'rejected' ? entry[1] : entry[0]

        if(fn) {
          try {
            this.val = fn(this.val)

            // If the value returned is a promise, resolve it
            if(this.val &&
               typeof this.val.then === 'function' &&
               typeof this.val === 'object') {
              var prevState = this.state

              // Halt stack execution until the promise resolves
              this.state = 'pending'

              // resolving
              this.val.then(function(v){

                // success callback
                self.resolve(v)
              }, function(err){

                // error callback

                // re-run the stack item if it has an error callback
                // but only if we weren't already in a rejected state
                if(prevState !== 'rejected' && entry[1]) {
                  self.stack.unshift(entry)
                }

                self.reject(err)
              })

            } else {
              //this.state = 'resolved'
            }
          } catch (e) {

            // the function call failed, lets reject ourselves
            // and re-run the stack item in case it can handle an error case
            // but only if we didn't just do that (eg. the error function of on the stack threw)
            this.val = e
            if(this.state !== 'rejected' && entry[1]) {
              this.stack.unshift(entry)
            }

            this.state = 'rejected'
          }
        }
      }

      // If the `failing` flag has been set, and we have exausted the stack, and we have an error
      // Throw the error
      if(this.failing && this.stack.length === 0 && this.state === 'rejected') {
        throw this.val
      }

    }
*/

  }

  // Export our library object, either for node.js or as a globally scoped variable
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = promiz
  } else {
    this.Promiz = promiz
  }
}()
