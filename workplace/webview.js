const path = require('path')
const observeDom = require('./observe-dom');

module.exports = (Franz, options) => {

  var unread = 0, name, interval = null;

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

  function highlightMentions() {
    //sometimes the chatlog is not rendered when this happens
    try {
      var messages = document.querySelector('[aria-label="Messages"]').querySelectorAll('[data-tooltip-position="left"] span')
      var regex = new RegExp("(.*)" + name + "(.*)", "i");
      var msg;
      for(var i = 0; i < messages.length; i++) {
        msg = messages[i];
        if(regex.test(msg.innerHTML)) {
          msg.classList.add('f-mention');
        }
      }
    } catch(e) {}
  }

  // Different init times due to render variations, need to make sure the elements exist
  function initHighlight() {
    var chatLog = document.querySelector('div[role="presentation"]');
    if (chatLog) {
      name = document.querySelector('[title=Profile] span').innerText.toLowerCase();
      observeDom(chatLog, highlightMentions);
      highlightMentions();
      window.clearInterval(interval);
    }
  }

  window.addEventListener('focus', function (e){
    Franz.setBadge(unread = 0)
  }, false);
  window.addEventListener('load', function(){
    interval = window.setInterval(initHighlight, 150);
  });

  Franz.injectCSS(path.join(__dirname, 'workplace.css'))
}
