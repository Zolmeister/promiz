(function () {

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

    self['promise'] = self
    var state = 0,
      val = 0,
      prev = 0,
      fn = fn || 0,
      er = er || 0,
      next = [];


    self['resolve'] = function (v) {
      if (!state) {
        if (prev && !prev.state) return prev.resolve(v)
        val = v
        state = 1

        setImmediate(function () {
          fire()
        })
      }
    }

    self['reject'] = function (v) {
      if (!state) {
        if (prev && !prev.state) return prev.reject(v)
        val = v
        state = 2

        setImmediate(function () {
          fire()
        })
      }
    }

    self['then'] = function (fn, er) {
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
      if (typeof val == 'object' & typeof ref == 'function') {
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
        if (state == 1 & typeof fn == 'function') {
          try {
            val = fn(val)
          } catch (e) {
            val = e
            return finish(4)
          }
        }

        if (state == 2 & typeof er == 'function') {
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

   
  }

  // this object gets globalalized/exported
  
  var promiz = {
    // promise factory
    defer: function () {
      return new promise(0, 0)
    }
  }
  // Export our library object, either for node.js or as a globally scoped variable
  if (typeof module != 'undefined') {
    module['exports'] = promiz
  } else {
    this['Promiz'] = promiz
  }
})()