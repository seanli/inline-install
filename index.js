'use strict';

/**
 * Created by alykoshin on 9/30/14.
 */

/* globals chrome */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var Emitter = require('mini-emitter');
}

//

/**
 *
 * @param options
 * @param {string} options.url                     - URL to Extension in Chrome Web Store
 * @param {string} [options.text='This site requires Chrome Extension to be installed. Proceed with the installation?]                  - text to show to the user
 * @param {boolean} [options.reloadOnSuccess=true] - Reload page on success
 * @returns {InlineInstall}
 * @constructor
 */
var InlineInstall = function(options) {
  var self = this;
  Emitter(self);

  if (!options || !options.url) {
    throw 'InlineInstall: execute(): options and options.url are mandatory.';
  }
  options.text = options.text || 'This site requires Chrome Extension to be installed. Proceed with the installation?';
  options.reloadOnSuccess = options.reloadOnSuccess || true;

  var h = 40; // Prompt height

  var showPrompt = function (text, okText, cancelText, onClickCb) {
    var w = window;

    var i = document.createElement('iframe');
    i.style.position = 'fixed';
    i.style.top = '-' + (h+1) + 'px';
    i.style.left  = 0;
    i.style.right = 0;
    i.style.width  = '100%';
    i.style.height = h+'px';
    i.style.backgroundColor = '#ffffe0';
    i.style.border = 'none';
    i.style.borderBottom = '1px solid #888888';
    i.style.zIndex = '9999999';
    if (typeof i.style.webkitTransition === 'string') {
      i.style.webkitTransition = 'all .25s ease-out';
    } else if(typeof i.style.transition === 'string') {
      i.style.transition       = 'all .25s ease-out';
    }
    document.body.appendChild(i);
    var c = (i.contentWindow) ? i.contentWindow :
            (i.contentDocument.document) ? i.contentDocument.document : i.contentDocument;
    c.document.open();
    c.document.write(
      '<span style="' +
      '  font-family: Helvetica, Arial, sans-serif; ' +
      '  font-size: .9rem; ' +
      '  padding: 7px; ' +
      '  vertical-align: middle; ' +
      '  cursor: default;' +
      '">' +
      text +
      '</span>');

    if (okText && onClickCb) {
      c.document.write(
        '<button id="okay">' + okText + '</button>' +
        '&nbsp;'+
        '<button>' + cancelText + '</button>');
      c.document.close();

      c.document.getElementById('okay').addEventListener('click', function(e) {
        // window.open(buttonLink, '_top');

        if (onClickCb) { onClickCb(); }

        e.preventDefault();
        try {
          event.cancelBubble = true;
        } catch(error) {
          // Mute the exception
        }
      });
    } else {
      c.document.close();
    }

    c.document.addEventListener('click', function() {
      w.document.body.removeChild(i);
    });

    setTimeout(function() {
      if (typeof i.style.webkitTransform === 'string') { i.style.webkitTransform = 'translateY('+h+'px)';
      } else if(typeof i.style.transform === 'string') { i.style.transform       = 'translateY('+h+'px)';
      } else {
        i.style.top = '0px';
      }
    }, 300);

  };

  self.init = function() {

  };


  var successCallback = function () {
    self.emit('success');
    location.reload();
  };

  var failureCallback = function (error) {
    self.emit('error', error);
  };

  var addLink = function(url) {
    var a  = document.createElement('link');
    a.href = url;
    a.rel = 'chrome-webstore-item';
    document.head.appendChild(a);
  };

  var doInstall = function() {
    addLink(self.url);
    try {
      return !!window.chrome && !!chrome.webstore && !!chrome.webstore.install &&
        chrome.webstore.install(
          self.url,
          successCallback,
          failureCallback
        );
    } catch (e) {
      failureCallback(e);
      return false;
    }
  };

  self.execute = function() {
    showPrompt(options.text, 'Ok', 'Cancel', doInstall);
  };

  return self;
};


if (typeof module !== 'undefined') {
  module.exports = InlineInstall;
}

if (typeof window !== 'undefined') {
  window.InlineInstall = InlineInstall;
}