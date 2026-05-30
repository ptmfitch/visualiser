/**
 * QuickSettings control panels for Wave / Particles / Background config objects.
 * Replaces the p5.gui dependency (used only in setupGui).
 */

function createControlPanel(label, x, y, parent) {
  parent = parent || document.body
  var qs = QuickSettings.create(x, y, label, parent)
  var panelId = label.replace(/[^a-z0-9]+/gi, '_').toLowerCase()

  return {
    _qs: qs,
    _panelId: panelId,

    addObject: function (object) {
      var params = Array.prototype.slice.call(arguments, 1)
      if (params.length === 0) {
        params = Object.keys(object)
      } else if (params.length === 1 && Array.isArray(params[0])) {
        params = params[0]
      }
      bindConfigParams(qs, object, params, panelId)
      return this
    },

    addDropDown: function (title, items, callback) {
      qs.addDropDown(title, items, callback)
      return this
    },

    addButton: function (title, callback) {
      qs.addButton(title, callback)
      return this
    },

    addText: function (title, text) {
      qs.addText(title, text)
      return this
    },

    bindRange: function (title, min, max, value, step, object, key) {
      qs.bindRange(title, min, max, value, step, object, key)
      return this
    },

    setValue: function (title, value) {
      if (qs._controls[title]) {
        qs._controls[title].setValue(value)
      }
      return this
    },

    setControlVisibility: function (title, visible) {
      if (qs._controls[title]) {
        qs._controls[title].container.style.display = visible ? '' : 'none'
      }
      return this
    },

    addBoundDropDown: function (title, items, object, callback) {
      qs.addDropDown(title, items, function (value) {
        object[title] = value.value
        if (callback) {
          callback(value)
        }
      })
      return this
    },

    syncDropDown: function (title, options, value) {
      syncDropDownSelection(qs, title, options, value)
      return this
    },

    setControlVisible: function (title, visible) {
      var ctrl = qs._controls[title]
      if (ctrl && ctrl.container) {
        ctrl.container.style.display = visible ? '' : 'none'
      }
      return this
    },

    getControlKeys: function () {
      return Object.keys(qs._controls || {})
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

function syncDropDownSelection(qs, title, options, value) {
  var ctrl = qs._controls[title]
  if (!ctrl || !ctrl.control) {
    return false
  }
  var index = options.indexOf(value)
  if (index < 0) {
    index = 0
  }
  ctrl.control.selectedIndex = index
  return true
}

function supportsNativeColorInput() {
  var input = document.createElement('input')
  input.type = 'color'
  input.value = '!'
  return input.type === 'color' && input.value !== '!'
}

function bindRgbColor(qs, title, object, panelId) {
  if (!Array.isArray(object[title])) {
    object[title] = hexToRgbArray(object[title])
  }
  var hex = rgbArrayToHex(object[title])
  var nativeColor = supportsNativeColorInput()
  var container = qs._createContainer()
  var label = document.createElement('div')
  label.className = 'qs_label'
  label.innerHTML = '<b>' + title + ':</b> ' + hex
  container.appendChild(label)

  var row = document.createElement('div')
  row.style.display = 'flex'
  row.style.gap = '6px'
  row.style.alignItems = 'center'

  var colorInput = null
  var hexInput = document.createElement('input')
  hexInput.type = 'text'
  hexInput.className = 'qs_text_input'
  hexInput.value = hex
  hexInput.style.flex = '1'
  hexInput.setAttribute('spellcheck', 'false')
  hexInput.setAttribute('aria-label', title + ' hex colour')

  function applyHex(hexValue) {
    if (!/^#([a-f0-9]{6})$/i.test(hexValue)) {
      return false
    }
    var rgb = hexToRgbArray(hexValue)
    object[title][0] = rgb[0]
    object[title][1] = rgb[1]
    object[title][2] = rgb[2]
    var normalized = rgbArrayToHex(object[title])
    label.innerHTML = '<b>' + title + ':</b> ' + normalized
    if (colorInput) {
      colorInput.value = normalized
    }
    hexInput.value = normalized
    return true
  }

  if (nativeColor) {
    colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = hex
    colorInput.title = title
    colorInput.setAttribute('aria-label', title + ' colour')
    colorInput.style.cssText =
      'width:28px;height:24px;padding:0;border:1px solid #aaaaaa;cursor:pointer;flex-shrink:0;background:none;'
    colorInput.addEventListener('input', function () {
      applyHex(colorInput.value)
    })
    row.appendChild(colorInput)
  }

  row.appendChild(hexInput)
  container.appendChild(row)

  hexInput.addEventListener('change', function () {
    applyHex(hexInput.value.trim())
  })
  hexInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      applyHex(hexInput.value.trim())
      hexInput.blur()
    }
  })

  qs._controls[title] = {
    container: container,
    control: colorInput || hexInput,
    label: label,
    title: title,
    getValue: function () {
      return rgbArrayToHex(object[title])
    },
    setValue: function (value) {
      applyHex(typeof value === 'string' ? value : rgbArrayToHex(value))
    },
  }
}

function bindConfigParams(qs, object, params, panelId) {
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
          bindRgbColor(qs, arg, object, panelId)
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
          bindRgbColor(qs, arg, object, panelId)
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
