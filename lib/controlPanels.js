/**
 * QuickSettings control panels for Wave / Particles / Background config objects.
 * Replaces the p5.gui dependency (used only in setupGui).
 */

function createControlPanel(label, x, y, parent) {
  parent = parent || document.body
  var qs = QuickSettings.create(x, y, label, parent)

  return {
    addObject: function (object) {
      var params = Array.prototype.slice.call(arguments, 1)
      if (params.length === 0) {
        params = Object.keys(object)
      }
      bindConfigParams(qs, object, params)
      return this
    },

    addDropDown: function (title, items, callback) {
      qs.addDropDown(title, items, callback)
      return this
    },

    setPosition: function (px, py) {
      qs.setPosition(px, py)
      return this
    },

    show: function () {
      qs.show()
    },

    hide: function () {
      qs.hide()
    },
  }
}

function bindConfigParams(qs, object, params) {
  var sliderDefaults = { min: 0, max: 100, step: 1 }

  for (var i = 0; i < params.length; i++) {
    var arg = params[i]
    var val = object[arg]
    var typ = typeof val

    if (shouldSkipConfigKey(arg)) {
      continue
    }

    switch (typ) {
      case 'object':
        if (isRgbColorArray(val)) {
          var c = color(val[0], val[1], val[2])
          var levels = c.levels.slice(0, 3)
          qs.bindColor(arg, rgbArrayToHex(levels), object)
        } else if (isStringArray(val)) {
          qs.bindDropDown(arg, val, object)
          object[arg] = val[0]
        }
        break

      case 'number': {
        var limits = sliderLimits(object, arg, val, sliderDefaults)
        qs.bindRange(arg, limits.vmin, limits.vmax, val, limits.step, object)
        break
      }

      case 'string':
        if (/^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.test(val)) {
          qs.bindColor(arg, val, object)
        } else {
          qs.bindText(arg, val, object)
        }
        break

      case 'boolean':
        qs.bindBoolean(arg, object[arg], object)
        break
    }
  }
}
