const path = require('path')

module.exports = (Franz, options) => {

  var unread = 0

  const get = (obj, key) => key.split('.').reduce((o,k,i) => o && o[k], obj)

  // dumb notification implementation. adds '1+' badge for any kind
  // of 'NewMessage' received, badge is cleared on focus

  ;(function(send) {
    XMLHttpRequest.prototype.send = function (data) {
      this.addEventListener("load", function () {
        if (/chat\.facebook\.com\/pull/.test(this.responseURL)) {
          try {
            var res = this.responseText.replace('for (;;); ', '').split(/[\n\r]+/);
            res.forEach(function(r){
              var data = JSON.parse(r)
              if (get(data, 'ms.0.delta.class') == "NewMessage") {
                Franz.setBadge(unread = '1+')
              }
            })
          } catch (e) {}
        }
      });
      send.call(this, data)
    }
  })(XMLHttpRequest.prototype.send)


  window.addEventListener('focus', function (e){
    Franz.setBadge(unread = 0)
  }, false);

  Franz.injectCSS(path.join(__dirname, 'workplace.css'))
}
