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
      fn = fn || 0,
      er = er || 0,
      next = [];

    self['resolve'] = function (v) {
      if (!state) {
        val = v
        state = 1

        setImmediate(fire)
      }
    }

    self['reject'] = function (v) {
      if (!state) {
        val = v
        state = 2

        setImmediate(fire)
      }
    }

    self['then'] = function (fn, er) {
      var p = new promise(fn, er)
      next.push(p)
      if (state == 3) {
        p.resolve(val)
      }
      if (state == 4) {
        p.reject(val)
      }
      return p
    }

    var finish = function (type) {
      state = type || 4

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
    };

    function fire() {

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
        try {
          if (state == 1 && typeof fn == 'function') {
            val = fn(val)
          }

          if (state == 2 && typeof er == 'function') {
            val = er(val)
            state = 1
          }
        } catch (e) {
          val = e
          return finish()
        }

        if (val == self) {
          val = TypeError()
          finish()
        } else thennable(ref, function () {
            finish(3)
          }, finish, function () {
            finish(state == 1 && 3)
          })

      })
    }


  }

  // this object gets globalalized/exported

  var promiz = {
    // promise factory
    defer: function () {
      return new promise()
    }
  }
  // Export our library object, either for node.js or as a globally scoped variable
  if (typeof module != 'undefined') {
    module['exports'] = promiz
  } else {
    this['Promiz'] = promiz
  }
})()