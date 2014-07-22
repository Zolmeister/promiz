(function () {

  /**
   * @constructor
   */
  function Deferred(fn, er) {
    // states
    // 0: pending
    // 1: resolving
    // 2: rejecting
    // 3: resolved
    // 4: rejected
    var self = this,
      state = 0,
      val = 0,
      next = [];

    self['promise'] = self

    self['resolve'] = function (v) {
      if (!state) {
        val = v
        state = 1

        fire()
      }
      return this
    }

    self['reject'] = function (v) {
      if (!state) {
        val = v
        state = 2

        fire()
      }
      return this
    }

    self['then'] = function (fn, er) {
      var d = new Deferred(fn, er)
      if (state == 3) {
        d.resolve(val)
      }
      else if (state == 4) {
        d.reject(val)
      }
      else {
        next.push(d)
      }
      return d
    }

    var finish = function (type) {
      state = type || 4
      next.map(function (p) {
        state == 3 && p.resolve(val) || p.reject(val)
      })
    }

    // ref : reference to 'then' function
    // cb, ec, cn : successCallback, failureCallback, notThennableCallback
    function thennable (ref, cb, ec, cn) {
      if ((typeof val == 'object' || typeof val == 'function') && typeof ref == 'function') {
        try {

          // cnt protects against abuse calls from spec checker
          var cnt = 0
          ref.call(val, function (v) {
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

          else if (state == 2 && typeof er == 'function') {
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

  // Export our library object, either for node.js or as a globally scoped variable
  if (typeof module != 'undefined') {
    function nProp(store) {
  		function prop() {
  			if (arguments.length) store = arguments[0]
  			return store
  		}
  		prop.toJSON = function() {
  			return store
  		}
  		return prop
  	}

    function newPromisedProp(prop, promise) {
      prop.then = function () {
        var newProp = nProp(prop())
        return newPromisedProp(newProp,
        promise.then.apply(promise, arguments).then(newProp))
      }
      prop.promise = prop
      prop.resolve = function (val) {
        prop(val)
        promise = promise.resolve.apply(promise, arguments)
        return prop
      }
      prop.reject = function () {
        promise = promise.reject.apply(promise, arguments)
        return prop
      }

      return prop
    }

    module['exports'] = {
      deferred: function () {
        return newPromisedProp(nProp(), new Deferred())
      }
    }
  } else {
    this['Promiz'] = Deferred
  }
})()
