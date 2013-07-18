var promiz = (function(){
  function defer(){

    this.state = 'pending'
    this.value
    this.stack = []

    this.resolve = function(val){
      process.nextTick(function(){
        this.state = 'resolved'
        this.fire(val)
      }.bind(this))
      return this
    }

    this.reject = function(val){
      process.nextTick(function(){
        this.state = 'rejected'
        this.fire(val)
      }.bind(this))
      return this
    }

    this.then = function(fn, er){
      this.stack.push([fn, er])
      if (this.state !== 'pending') {
        process.nextTick(function(){
          this.fire()
        }.bind(this))
      }
      return this
    }

    this.done = function(){
      // TODO
      return this
    }

    this.catch = function (fn) {
      this.stack.push([null, fn])
      if (this.state !== 'pending') {
        process.nextTick(function(){
          this.fire()
        }.bind(this))
      }
      return this
    }
    this.fail = function (fn) {
      return this.catch(fn)
    }
    this.nodeify = function () {
      // TODO
    }
    this.spread = function (fn, er) {

    }
    this.all = function () {
      // TODO

    }

    this.fire = function(val){
      val = this.value = typeof val !== 'undefined' ? val : this.value

      while(this.stack.length && this.state !== 'pending') {
        var entry = this.stack.shift()
        var fn = this.state === 'rejected' ? entry[1] : entry[0]

        if(fn) {
          try {

            val = this.value = fn.call(void 0, val)
            if(val && val.then && (val.catch || val.fail)) {
              var previousState = this.state
              this.state = 'pending'
              var promise = val.then(function(v){
                val = this.value = v
                this.resolve(v)
              }.bind(this))

              var catcher = function(err){
                val = this.value = err
                if(previousState !== 'rejected') this.stack.unshift(entry)
                this.reject(err)
              }.bind(this)

              if (promise.catch) {
                promise.catch(catcher)
              } else {
                promise.fail(catcher)
              }

            } else if (this.state === 'rejected') {
              this.state = 'resolved'
            }
          } catch (e) {
            val = this.value = e
            if(this.state !== 'rejected') this.stack.unshift(entry)
            this.state = 'rejected'
          }
        }
      }
    }

  }

  return {
    defer: function(){
      return new defer()
    },

    fcall: function() {
      var deferred = new defer()
      var args = Array.apply([], arguments)
      var fn = args.shift()
      deferred.resolve(fn.call(void 0, args))
      return deferred
    },

    nfcall: function() {

    },
  }

})()

module.exports = promiz