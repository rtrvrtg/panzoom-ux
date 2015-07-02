/**
 * PanZoom UX integration
 * call PanZoomUX.init($, $(this)); on elements you want to make zoomable
 */
var PanZoomUX = {
  init: function($, pz, settings){
    if (!settings) settings = {};

    var helpDesc = "Zoomable visual content. " +
      "Use arrow keys to scroll image. " +
      "Use plus and minus keys to zoom in and out. " + 
      "Press the zero key to reset pan and zoom.";

    var wrapper = $('<div />', {
      'class': 'panzoom-container',
      tabindex: 0,
      'aria-live': 'polite'
    });
    var panZoomID = PanZoomUX.assignPanZoomID(wrapper);
    wrapper.focusout(function(e){
      $(this).find('.panzoom-description-location').text("");
    });
    pz.wrap(wrapper);

    var descID = PanZoomUX.utils.makeID("panzoom-container-desc"),
    desc = $('<div />', {
      hidden: 'true',
      text: helpDesc,
      id: descID,
      'class': 'panzoom-description-text'
    }),
    descPosition = $('<span />', {
      'class': 'panzoom-description-location'
    });

    desc.append(descPosition);
    $('#' + panZoomID).prepend(desc).attr('aria-describedby', descID);

    // Visible controls
    var controlSettings = PanZoomUX.initialiseControls($, pz, panZoomID);
    $.extend(settings, controlSettings);

    // Initialise
    pz.panzoom(settings);

    // Update position description for a11y
    var panzoompan = null,
    pzpArguments = {
      x: 0,
      y: 0,
      pan: false
    },
    tellEnd = function(e) {
      pz.parent().find('.panzoom-description-location').text(
        'Image has been panned.'
      );
    },
    tellZoom = function(e, panzoom, scale, opts) {
      pzpArguments.pan = false;
      pz.parent().find('.panzoom-description-location').text(
        'Zoomed to ' + (scale == 1 ? 'original size' : PanZoomUX.utils.roundDecimal(scale, 2) + ' times') + '.'
      );
    },
    tellReset = function(e, panzoom, matrix) {
      pzpArguments.pan = false;
      pz.parent().find('.panzoom-description-location').text(
        'Pan and zoom have both been reset.'
      );
    },
    tellPan = setInterval(function(){
      if (pzpArguments.pan) {
        pz.parent().find('.panzoom-description-location').text(
          'Panned to X coordinate ' + pzpArguments.x + ' by Y coordinate ' + pzpArguments.y + '.'
        );
      }
    }, 500);
    pz.on('panzoompan', function(){
      pzpArguments = { x: arguments[2], y: arguments[3], pan: true };
    });
    
    pz.on('panzoomzoom', $.debounce(500, tellZoom));
    pz.on('panzoomreset', $.debounce(500, tellReset));

    // Mousewheel zoom
    pz.parent().on('mousewheel.focal', function(e) {
      e.preventDefault();
      var delta = e.delta || e.originalEvent.wheelDelta;
      var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
      pz.panzoom('zoom', zoomOut, {
        increment: 0.1,
        animate: false,
        focal: e
      });
    });

    // Kbd
    var keydownLoop = null,
    keydownState  = {
      up: false,
      down: false,
      left: false,
      right: false
    },
    keydownSpeed  = 100,
    keydownDist   = 5,
    keydownRunner = function(){
      var x = 0, y = 0;
      if (keydownState.down) {
        y += (-1 * keydownDist);
      }
      if (keydownState.up) {
        y += (1 * keydownDist);
      }
      if (keydownState.right) {
        x += (-1 * keydownDist);
      }
      if (keydownState.left) {
        x += (1 * keydownDist);
      }
      pz.panzoom('pan', x, y, { relative: true });
    };

    pz.parent().on('keydown', function(e) {
      switch (e.keyCode) {
        case 37:
          keydownState.left = true;
          break;
        case 38:
          keydownState.up = true;
          break;
        case 39:
          keydownState.right = true;
          break;
        case 40:
          keydownState.down = true;
          break;
        case 61:
        case 187:
          if (e.shiftKey) pz.panzoom('zoom');
          break;
        case 107:
          pz.panzoom('zoom');
          break;
        case 109:
        case 173:
        case 189:
          pz.panzoom('zoom', true);
          break;
      }

      switch (e.keyCode) {
        case 37:
        case 38:
        case 39:
        case 40:
          e.preventDefault();
          e.stopPropagation();
          keydownLoop = setInterval(keydownRunner, keydownSpeed);
          break;
        case 107:
        case 61:
        case 109:
        case 173:
        case 187:
        case 189:
          e.preventDefault();
          e.stopPropagation();
          break;
        case 48:
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    });
    pz.parent().on('keyup', function(e) {
      e.preventDefault();
      e.stopPropagation();

      switch (e.keyCode) {
        case 37:
          keydownState.left = false;
          break;
        case 38:
          keydownState.up = false;
          break;
        case 39:
          keydownState.right = false;
          break;
        case 40:
          keydownState.down = false;
          break;
      }

      switch (e.keyCode) {
        case 37:
        case 38:
        case 39:
        case 40:
          if (!(keydownState.left || keydownState.right || keydownState.up || keydownState.down)) {
            clearInterval(keydownLoop);
          }
          break;
        case 107:
          break;
        case 109:
        case 173:
          break;
        case 48:
          pz.panzoom('reset');
          break;
      }
    });

    // Fix responsiveness
    $(window).on('resize', function() {
      pz.panzoom('resetDimensions');
    });
  },

  // Initialise controls
  initialiseControls: function($, $panzoom, panZoomID) {
    var controls = $('<div />', {
      'class': 'panzoom-controls'
    });

    var zoomIn = $('<a />', {
      'class': 'panzoom-zoom-in',
      href: '#',
      title: 'Zoom in',
      text: 'Zoom in',
      'aria-controls': panZoomID,
      'aria-hidden': 'true',
      tabindex: '-1'
    }),
    zoomOut = $('<a />', {
      'class': 'panzoom-zoom-out',
      href: '#',
      title: 'Zoom in',
      text: 'Zoom out',
      'aria-controls': panZoomID,
      'aria-hidden': 'true',
      tabindex: '-1'
    }),
    zoomRange = $('<input />', {
      'class': 'panzoom-zoom-range',
      'data-owlcarousel-nokbd': 'data-owlcarousel-nokbd',
      type: 'range',
      title: 'Zoom range',
      'aria-controls': panZoomID,
      'aria-hidden': 'true',
      tabindex: '-1'
    }),
    zoomReset = $('<a />', {
      'class': 'panzoom-zoom-reset',
      href: '#',
      title: 'Reset zoom',
      text: 'Reset zoom',
      'aria-controls': panZoomID,
      'aria-hidden': 'true',
      tabindex: '-1'
    });

    var dontProp = function(e){
      e.stopPropagation();
    };

    zoomIn.bind('mousedown touchstart', dontProp);
    zoomOut.bind('mousedown touchstart', dontProp);
    zoomRange.bind('mousedown touchstart', dontProp);
    zoomReset.bind('mousedown touchstart', dontProp);

    controls.append(zoomIn)
            .append(zoomOut)
            .append(zoomRange)
            .append(zoomReset);

    $panzoom.parent().append(controls);

    return {
      $zoomIn: $panzoom.parent().find(".panzoom-controls .panzoom-zoom-in"),
      $zoomOut: $panzoom.parent().find(".panzoom-controls .panzoom-zoom-out"),
      $zoomRange: $panzoom.parent().find(".panzoom-controls .panzoom-zoom-range"),
      $reset: $panzoom.parent().find(".panzoom-controls .panzoom-zoom-reset")
    };
  },

  // Assign pan zoom ID and return ID
  assignPanZoomID: function (elem){
    var pzID = elem.attr('id');
    if (!pzID) {
      pzID = PanZoomUX.utils.makeID("panzoom-container");
    }
    elem.attr('id', pzID);
    return pzID;
  },

  // General utilities
  utils: {
    // Generate a GUID-like random number
    generateUUID: function() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    },
    // Create a namespaced HTML ID that is random enough
    // to be more or less unique
    makeID: function(prefix) {
      return prefix + "-" + PanZoomUX.utils.generateUUID();
    },
    // Round a decimal number to a number of digits
    roundDecimal: function(num, digits) {
      if (digits <= 0) return num;
      var factor = (digits * 10),
      n = Math.round(num * factor),
      suf = (n % factor) / factor,
      pre = (n / factor) - suf;
      return pre + suf;
    }
  }
};