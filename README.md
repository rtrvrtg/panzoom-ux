# PanZoom UX

User experience enhancements for [jQuery.panzoom](https://github.com/timmywil/jquery.panzoom)

## Authorship

Written by [Geoffrey Roberts](mailto:g.roberts@blackicemedia.com)

## License

MIT

## Features

* Accessibility enhancements
* Keyboard controls

## Requirements

* jQuery
* jQuery.panzoom
* [jquery-throttle-debounce](http://benalman.com/projects/jquery-throttle-debounce-plugin/)
* jQuery Mousewheel (optional)

## Installation

In the `<head>` of your page, after you set up your jQuery, jQuery.panzoom, and jquery-throttle-debounce `<script>` items, add the following:

```html
<script type="text/javascript" src="panzoom.ux.js"></script>
```

Be sure to set some basic stylesheet rules for your controls:

```css
.panzoom-controls {
  position: absolute;
  top: 0;
  left: 0;
}
```

## Usage

Assuming you have a HTML element on the page called `elem` in your script, use the following to set PanZoom UX up:

```javascript
PanZoomUX.init($, $(elem));
```

This will instantiate jQuery.panzoom on the element and add all enhancements.

Should you need to specify particular parameters on jQuery.panzoom, call the following:

```javascript
PanZoomUX.init($, $(elem), params);
```

## Changelog

### v0.1

Initial commit