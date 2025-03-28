import { i as importShared, a as getDefaultExportFromCjs } from './react-vendor-773e5a75.js';
import { m as Badge, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, L as Label$1, e as Select, f as SelectTrigger, g as SelectValue, h as SelectContent, i as SelectItem, j as Slider, B as Button, P as Progress } from './toast-58ac552a.js';
import { I as Input, T as Textarea } from './textarea-ba0b28ab.js';
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from './card-7a71f808.js';
import { s as supabaseRestCall, a as saveConsumptionLog } from './missionFreshApiClient-3e62d1ad.js';
import { a as ue, u as useAuth } from './AuthProvider-b0b4665b.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';
import { a as filterProps, _ as _baseExtremum, o as _baseIteratee, p as _baseGt, q as _baseLt, i as isFunction, r as Text, s as polarToCartesian, L as Layer, t as getTickClassName, v as adaptEventsOfChild, w as Label, D as Dot, C as Curve, d as isNil, g as getValueByDataKey, S as Shape, A as Animate, x as get, b as interpolateNumber, c as isEqual, y as isNumber, e as LabelList, G as Global, f as findAllByType, z as getMaxRadius, B as getPercentValue, F as warn, H as mathSign, u as uniqueId, I as Cell, k as generateCategoricalChart, J as Bar, X as XAxis, Y as YAxis, l as formatAxisMap, K as formatAxisMap$1, R as ResponsiveContainer, m as CartesianGrid, T as Tooltip, n as Legend } from './generateCategoricalChart-3e4dddb1.js';

var _excluded$1 = ["points", "className", "baseLinePoints", "connectNulls"];
function _extends$3() { _extends$3 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$3.apply(this, arguments); }
function _objectWithoutProperties$1(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$1(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose$1(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/**
 * @fileOverview Polygon
 */
const React$3 = await importShared('react');

const clsx$3 = await importShared('clsx');
var isValidatePoint = function isValidatePoint(point) {
  return point && point.x === +point.x && point.y === +point.y;
};
var getParsedPoints = function getParsedPoints() {
  var points = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var segmentPoints = [[]];
  points.forEach(function (entry) {
    if (isValidatePoint(entry)) {
      segmentPoints[segmentPoints.length - 1].push(entry);
    } else if (segmentPoints[segmentPoints.length - 1].length > 0) {
      // add another path
      segmentPoints.push([]);
    }
  });
  if (isValidatePoint(points[0])) {
    segmentPoints[segmentPoints.length - 1].push(points[0]);
  }
  if (segmentPoints[segmentPoints.length - 1].length <= 0) {
    segmentPoints = segmentPoints.slice(0, -1);
  }
  return segmentPoints;
};
var getSinglePolygonPath = function getSinglePolygonPath(points, connectNulls) {
  var segmentPoints = getParsedPoints(points);
  if (connectNulls) {
    segmentPoints = [segmentPoints.reduce(function (res, segPoints) {
      return [].concat(_toConsumableArray(res), _toConsumableArray(segPoints));
    }, [])];
  }
  var polygonPath = segmentPoints.map(function (segPoints) {
    return segPoints.reduce(function (path, point, index) {
      return "".concat(path).concat(index === 0 ? 'M' : 'L').concat(point.x, ",").concat(point.y);
    }, '');
  }).join('');
  return segmentPoints.length === 1 ? "".concat(polygonPath, "Z") : polygonPath;
};
var getRanglePath = function getRanglePath(points, baseLinePoints, connectNulls) {
  var outerPath = getSinglePolygonPath(points, connectNulls);
  return "".concat(outerPath.slice(-1) === 'Z' ? outerPath.slice(0, -1) : outerPath, "L").concat(getSinglePolygonPath(baseLinePoints.reverse(), connectNulls).slice(1));
};
var Polygon = function Polygon(props) {
  var points = props.points,
    className = props.className,
    baseLinePoints = props.baseLinePoints,
    connectNulls = props.connectNulls,
    others = _objectWithoutProperties$1(props, _excluded$1);
  if (!points || !points.length) {
    return null;
  }
  var layerClass = clsx$3('recharts-polygon', className);
  if (baseLinePoints && baseLinePoints.length) {
    var hasStroke = others.stroke && others.stroke !== 'none';
    var rangePath = getRanglePath(points, baseLinePoints, connectNulls);
    return /*#__PURE__*/React$3.createElement("g", {
      className: layerClass
    }, /*#__PURE__*/React$3.createElement("path", _extends$3({}, filterProps(others, true), {
      fill: rangePath.slice(-1) === 'Z' ? others.fill : 'none',
      stroke: "none",
      d: rangePath
    })), hasStroke ? /*#__PURE__*/React$3.createElement("path", _extends$3({}, filterProps(others, true), {
      fill: "none",
      d: getSinglePolygonPath(points, connectNulls)
    })) : null, hasStroke ? /*#__PURE__*/React$3.createElement("path", _extends$3({}, filterProps(others, true), {
      fill: "none",
      d: getSinglePolygonPath(baseLinePoints, connectNulls)
    })) : null);
  }
  var singlePath = getSinglePolygonPath(points, connectNulls);
  return /*#__PURE__*/React$3.createElement("path", _extends$3({}, filterProps(others, true), {
    fill: singlePath.slice(-1) === 'Z' ? others.fill : 'none',
    className: layerClass,
    d: singlePath
  }));
};

var baseExtremum$1 = _baseExtremum,
    baseGt = _baseGt,
    baseIteratee$1 = _baseIteratee;

/**
 * This method is like `_.max` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * the value is ranked. The iteratee is invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {*} Returns the maximum value.
 * @example
 *
 * var objects = [{ 'n': 1 }, { 'n': 2 }];
 *
 * _.maxBy(objects, function(o) { return o.n; });
 * // => { 'n': 2 }
 *
 * // The `_.property` iteratee shorthand.
 * _.maxBy(objects, 'n');
 * // => { 'n': 2 }
 */
function maxBy(array, iteratee) {
  return (array && array.length)
    ? baseExtremum$1(array, baseIteratee$1(iteratee), baseGt)
    : undefined;
}

var maxBy_1 = maxBy;

const maxBy$1 = /*@__PURE__*/getDefaultExportFromCjs(maxBy_1);

var baseExtremum = _baseExtremum,
    baseIteratee = _baseIteratee,
    baseLt = _baseLt;

/**
 * This method is like `_.min` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * the value is ranked. The iteratee is invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {*} Returns the minimum value.
 * @example
 *
 * var objects = [{ 'n': 1 }, { 'n': 2 }];
 *
 * _.minBy(objects, function(o) { return o.n; });
 * // => { 'n': 1 }
 *
 * // The `_.property` iteratee shorthand.
 * _.minBy(objects, 'n');
 * // => { 'n': 1 }
 */
function minBy(array, iteratee) {
  return (array && array.length)
    ? baseExtremum(array, baseIteratee(iteratee), baseLt)
    : undefined;
}

var minBy_1 = minBy;

const minBy$1 = /*@__PURE__*/getDefaultExportFromCjs(minBy_1);

var _excluded = ["cx", "cy", "angle", "ticks", "axisLine"],
  _excluded2 = ["ticks", "tick", "angle", "tickFormatter", "stroke"];
function _typeof$2(o) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$2(o); }
function _extends$2() { _extends$2 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }
function ownKeys$2(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$2(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$2(Object(t), !0).forEach(function (r) { _defineProperty$2(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$2(descriptor.key), descriptor); } }
function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); if (staticProps) _defineProperties$2(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper$2(t, o, e) { return o = _getPrototypeOf$2(o), _possibleConstructorReturn$2(t, _isNativeReflectConstruct$2() ? Reflect.construct(o, e || [], _getPrototypeOf$2(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn$2(self, call) { if (call && (_typeof$2(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$2(self); }
function _assertThisInitialized$2(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct$2() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$2 = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf$2(o) { _getPrototypeOf$2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$2(o); }
function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$2(subClass, superClass); }
function _setPrototypeOf$2(o, p) { _setPrototypeOf$2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$2(o, p); }
function _defineProperty$2(obj, key, value) { key = _toPropertyKey$2(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey$2(t) { var i = _toPrimitive$2(t, "string"); return "symbol" == _typeof$2(i) ? i : i + ""; }
function _toPrimitive$2(t, r) { if ("object" != _typeof$2(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof$2(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview The axis of polar coordinate system
 */
const React$2 = await importShared('react');
const {PureComponent: PureComponent$2} = React$2;
const clsx$2 = await importShared('clsx');
var PolarRadiusAxis = /*#__PURE__*/function (_PureComponent) {
  function PolarRadiusAxis() {
    _classCallCheck$2(this, PolarRadiusAxis);
    return _callSuper$2(this, PolarRadiusAxis, arguments);
  }
  _inherits$2(PolarRadiusAxis, _PureComponent);
  return _createClass$2(PolarRadiusAxis, [{
    key: "getTickValueCoord",
    value:
    /**
     * Calculate the coordinate of tick
     * @param  {Number} coordinate The radius of tick
     * @return {Object} (x, y)
     */
    function getTickValueCoord(_ref) {
      var coordinate = _ref.coordinate;
      var _this$props = this.props,
        angle = _this$props.angle,
        cx = _this$props.cx,
        cy = _this$props.cy;
      return polarToCartesian(cx, cy, coordinate, angle);
    }
  }, {
    key: "getTickTextAnchor",
    value: function getTickTextAnchor() {
      var orientation = this.props.orientation;
      var textAnchor;
      switch (orientation) {
        case 'left':
          textAnchor = 'end';
          break;
        case 'right':
          textAnchor = 'start';
          break;
        default:
          textAnchor = 'middle';
          break;
      }
      return textAnchor;
    }
  }, {
    key: "getViewBox",
    value: function getViewBox() {
      var _this$props2 = this.props,
        cx = _this$props2.cx,
        cy = _this$props2.cy,
        angle = _this$props2.angle,
        ticks = _this$props2.ticks;
      var maxRadiusTick = maxBy$1(ticks, function (entry) {
        return entry.coordinate || 0;
      });
      var minRadiusTick = minBy$1(ticks, function (entry) {
        return entry.coordinate || 0;
      });
      return {
        cx: cx,
        cy: cy,
        startAngle: angle,
        endAngle: angle,
        innerRadius: minRadiusTick.coordinate || 0,
        outerRadius: maxRadiusTick.coordinate || 0
      };
    }
  }, {
    key: "renderAxisLine",
    value: function renderAxisLine() {
      var _this$props3 = this.props,
        cx = _this$props3.cx,
        cy = _this$props3.cy,
        angle = _this$props3.angle,
        ticks = _this$props3.ticks,
        axisLine = _this$props3.axisLine,
        others = _objectWithoutProperties(_this$props3, _excluded);
      var extent = ticks.reduce(function (result, entry) {
        return [Math.min(result[0], entry.coordinate), Math.max(result[1], entry.coordinate)];
      }, [Infinity, -Infinity]);
      var point0 = polarToCartesian(cx, cy, extent[0], angle);
      var point1 = polarToCartesian(cx, cy, extent[1], angle);
      var props = _objectSpread$2(_objectSpread$2(_objectSpread$2({}, filterProps(others, false)), {}, {
        fill: 'none'
      }, filterProps(axisLine, false)), {}, {
        x1: point0.x,
        y1: point0.y,
        x2: point1.x,
        y2: point1.y
      });
      return /*#__PURE__*/React$2.createElement("line", _extends$2({
        className: "recharts-polar-radius-axis-line"
      }, props));
    }
  }, {
    key: "renderTicks",
    value: function renderTicks() {
      var _this = this;
      var _this$props4 = this.props,
        ticks = _this$props4.ticks,
        tick = _this$props4.tick,
        angle = _this$props4.angle,
        tickFormatter = _this$props4.tickFormatter,
        stroke = _this$props4.stroke,
        others = _objectWithoutProperties(_this$props4, _excluded2);
      var textAnchor = this.getTickTextAnchor();
      var axisProps = filterProps(others, false);
      var customTickProps = filterProps(tick, false);
      var items = ticks.map(function (entry, i) {
        var coord = _this.getTickValueCoord(entry);
        var tickProps = _objectSpread$2(_objectSpread$2(_objectSpread$2(_objectSpread$2({
          textAnchor: textAnchor,
          transform: "rotate(".concat(90 - angle, ", ").concat(coord.x, ", ").concat(coord.y, ")")
        }, axisProps), {}, {
          stroke: 'none',
          fill: stroke
        }, customTickProps), {}, {
          index: i
        }, coord), {}, {
          payload: entry
        });
        return /*#__PURE__*/React$2.createElement(Layer, _extends$2({
          className: clsx$2('recharts-polar-radius-axis-tick', getTickClassName(tick)),
          key: "tick-".concat(entry.coordinate)
        }, adaptEventsOfChild(_this.props, entry, i)), PolarRadiusAxis.renderTickItem(tick, tickProps, tickFormatter ? tickFormatter(entry.value, i) : entry.value));
      });
      return /*#__PURE__*/React$2.createElement(Layer, {
        className: "recharts-polar-radius-axis-ticks"
      }, items);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
        ticks = _this$props5.ticks,
        axisLine = _this$props5.axisLine,
        tick = _this$props5.tick;
      if (!ticks || !ticks.length) {
        return null;
      }
      return /*#__PURE__*/React$2.createElement(Layer, {
        className: clsx$2('recharts-polar-radius-axis', this.props.className)
      }, axisLine && this.renderAxisLine(), tick && this.renderTicks(), Label.renderCallByParent(this.props, this.getViewBox()));
    }
  }], [{
    key: "renderTickItem",
    value: function renderTickItem(option, props, value) {
      var tickItem;
      if ( /*#__PURE__*/React$2.isValidElement(option)) {
        tickItem = /*#__PURE__*/React$2.cloneElement(option, props);
      } else if (isFunction(option)) {
        tickItem = option(props);
      } else {
        tickItem = /*#__PURE__*/React$2.createElement(Text, _extends$2({}, props, {
          className: "recharts-polar-radius-axis-tick-value"
        }), value);
      }
      return tickItem;
    }
  }]);
}(PureComponent$2);
_defineProperty$2(PolarRadiusAxis, "displayName", 'PolarRadiusAxis');
_defineProperty$2(PolarRadiusAxis, "axisType", 'radiusAxis');
_defineProperty$2(PolarRadiusAxis, "defaultProps", {
  type: 'number',
  radiusAxisId: 0,
  cx: 0,
  cy: 0,
  angle: 0,
  orientation: 'right',
  stroke: '#ccc',
  axisLine: true,
  tick: true,
  tickCount: 5,
  allowDataOverflow: false,
  scale: 'auto',
  allowDuplicatedCategory: true
});

function _typeof$1(o) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$1(o); }
function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty$1(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor); } }
function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper$1(t, o, e) { return o = _getPrototypeOf$1(o), _possibleConstructorReturn$1(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf$1(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$1(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$1(self); }
function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct$1() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }
function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$1(subClass, superClass); }
function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }
function _defineProperty$1(obj, key, value) { key = _toPropertyKey$1(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey$1(t) { var i = _toPrimitive$1(t, "string"); return "symbol" == _typeof$1(i) ? i : i + ""; }
function _toPrimitive$1(t, r) { if ("object" != _typeof$1(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof$1(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Axis of radial direction
 */
const React$1 = await importShared('react');
const {PureComponent: PureComponent$1} = React$1;
const clsx$1 = await importShared('clsx');
var RADIAN = Math.PI / 180;
var eps = 1e-5;
var PolarAngleAxis = /*#__PURE__*/function (_PureComponent) {
  function PolarAngleAxis() {
    _classCallCheck$1(this, PolarAngleAxis);
    return _callSuper$1(this, PolarAngleAxis, arguments);
  }
  _inherits$1(PolarAngleAxis, _PureComponent);
  return _createClass$1(PolarAngleAxis, [{
    key: "getTickLineCoord",
    value:
    /**
     * Calculate the coordinate of line endpoint
     * @param  {Object} data The Data if ticks
     * @return {Object} (x0, y0): The start point of text,
     *                  (x1, y1): The end point close to text,
     *                  (x2, y2): The end point close to axis
     */
    function getTickLineCoord(data) {
      var _this$props = this.props,
        cx = _this$props.cx,
        cy = _this$props.cy,
        radius = _this$props.radius,
        orientation = _this$props.orientation,
        tickSize = _this$props.tickSize;
      var tickLineSize = tickSize || 8;
      var p1 = polarToCartesian(cx, cy, radius, data.coordinate);
      var p2 = polarToCartesian(cx, cy, radius + (orientation === 'inner' ? -1 : 1) * tickLineSize, data.coordinate);
      return {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y
      };
    }

    /**
     * Get the text-anchor of each tick
     * @param  {Object} data Data of ticks
     * @return {String} text-anchor
     */
  }, {
    key: "getTickTextAnchor",
    value: function getTickTextAnchor(data) {
      var orientation = this.props.orientation;
      var cos = Math.cos(-data.coordinate * RADIAN);
      var textAnchor;
      if (cos > eps) {
        textAnchor = orientation === 'outer' ? 'start' : 'end';
      } else if (cos < -eps) {
        textAnchor = orientation === 'outer' ? 'end' : 'start';
      } else {
        textAnchor = 'middle';
      }
      return textAnchor;
    }
  }, {
    key: "renderAxisLine",
    value: function renderAxisLine() {
      var _this$props2 = this.props,
        cx = _this$props2.cx,
        cy = _this$props2.cy,
        radius = _this$props2.radius,
        axisLine = _this$props2.axisLine,
        axisLineType = _this$props2.axisLineType;
      var props = _objectSpread$1(_objectSpread$1({}, filterProps(this.props, false)), {}, {
        fill: 'none'
      }, filterProps(axisLine, false));
      if (axisLineType === 'circle') {
        return /*#__PURE__*/React$1.createElement(Dot, _extends$1({
          className: "recharts-polar-angle-axis-line"
        }, props, {
          cx: cx,
          cy: cy,
          r: radius
        }));
      }
      var ticks = this.props.ticks;
      var points = ticks.map(function (entry) {
        return polarToCartesian(cx, cy, radius, entry.coordinate);
      });
      return /*#__PURE__*/React$1.createElement(Polygon, _extends$1({
        className: "recharts-polar-angle-axis-line"
      }, props, {
        points: points
      }));
    }
  }, {
    key: "renderTicks",
    value: function renderTicks() {
      var _this = this;
      var _this$props3 = this.props,
        ticks = _this$props3.ticks,
        tick = _this$props3.tick,
        tickLine = _this$props3.tickLine,
        tickFormatter = _this$props3.tickFormatter,
        stroke = _this$props3.stroke;
      var axisProps = filterProps(this.props, false);
      var customTickProps = filterProps(tick, false);
      var tickLineProps = _objectSpread$1(_objectSpread$1({}, axisProps), {}, {
        fill: 'none'
      }, filterProps(tickLine, false));
      var items = ticks.map(function (entry, i) {
        var lineCoord = _this.getTickLineCoord(entry);
        var textAnchor = _this.getTickTextAnchor(entry);
        var tickProps = _objectSpread$1(_objectSpread$1(_objectSpread$1({
          textAnchor: textAnchor
        }, axisProps), {}, {
          stroke: 'none',
          fill: stroke
        }, customTickProps), {}, {
          index: i,
          payload: entry,
          x: lineCoord.x2,
          y: lineCoord.y2
        });
        return /*#__PURE__*/React$1.createElement(Layer, _extends$1({
          className: clsx$1('recharts-polar-angle-axis-tick', getTickClassName(tick)),
          key: "tick-".concat(entry.coordinate)
        }, adaptEventsOfChild(_this.props, entry, i)), tickLine && /*#__PURE__*/React$1.createElement("line", _extends$1({
          className: "recharts-polar-angle-axis-tick-line"
        }, tickLineProps, lineCoord)), tick && PolarAngleAxis.renderTickItem(tick, tickProps, tickFormatter ? tickFormatter(entry.value, i) : entry.value));
      });
      return /*#__PURE__*/React$1.createElement(Layer, {
        className: "recharts-polar-angle-axis-ticks"
      }, items);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
        ticks = _this$props4.ticks,
        radius = _this$props4.radius,
        axisLine = _this$props4.axisLine;
      if (radius <= 0 || !ticks || !ticks.length) {
        return null;
      }
      return /*#__PURE__*/React$1.createElement(Layer, {
        className: clsx$1('recharts-polar-angle-axis', this.props.className)
      }, axisLine && this.renderAxisLine(), this.renderTicks());
    }
  }], [{
    key: "renderTickItem",
    value: function renderTickItem(option, props, value) {
      var tickItem;
      if ( /*#__PURE__*/React$1.isValidElement(option)) {
        tickItem = /*#__PURE__*/React$1.cloneElement(option, props);
      } else if (isFunction(option)) {
        tickItem = option(props);
      } else {
        tickItem = /*#__PURE__*/React$1.createElement(Text, _extends$1({}, props, {
          className: "recharts-polar-angle-axis-tick-value"
        }), value);
      }
      return tickItem;
    }
  }]);
}(PureComponent$1);
_defineProperty$1(PolarAngleAxis, "displayName", 'PolarAngleAxis');
_defineProperty$1(PolarAngleAxis, "axisType", 'angleAxis');
_defineProperty$1(PolarAngleAxis, "defaultProps", {
  type: 'category',
  angleAxisId: 0,
  scale: 'auto',
  cx: 0,
  cy: 0,
  orientation: 'outer',
  axisLine: true,
  tickLine: true,
  tickSize: 8,
  tick: true,
  hide: false,
  allowDuplicatedCategory: true
});

var _Pie;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Render sectors of a pie
 */
const React = await importShared('react');
const {PureComponent} = React;
const clsx = await importShared('clsx');
var Pie = /*#__PURE__*/function (_PureComponent) {
  function Pie(props) {
    var _this;
    _classCallCheck(this, Pie);
    _this = _callSuper(this, Pie, [props]);
    _defineProperty(_this, "pieRef", null);
    _defineProperty(_this, "sectorRefs", []);
    _defineProperty(_this, "id", uniqueId('recharts-pie-'));
    _defineProperty(_this, "handleAnimationEnd", function () {
      var onAnimationEnd = _this.props.onAnimationEnd;
      _this.setState({
        isAnimationFinished: true
      });
      if (isFunction(onAnimationEnd)) {
        onAnimationEnd();
      }
    });
    _defineProperty(_this, "handleAnimationStart", function () {
      var onAnimationStart = _this.props.onAnimationStart;
      _this.setState({
        isAnimationFinished: false
      });
      if (isFunction(onAnimationStart)) {
        onAnimationStart();
      }
    });
    _this.state = {
      isAnimationFinished: !props.isAnimationActive,
      prevIsAnimationActive: props.isAnimationActive,
      prevAnimationId: props.animationId,
      sectorToFocus: 0
    };
    return _this;
  }
  _inherits(Pie, _PureComponent);
  return _createClass(Pie, [{
    key: "isActiveIndex",
    value: function isActiveIndex(i) {
      var activeIndex = this.props.activeIndex;
      if (Array.isArray(activeIndex)) {
        return activeIndex.indexOf(i) !== -1;
      }
      return i === activeIndex;
    }
  }, {
    key: "hasActiveIndex",
    value: function hasActiveIndex() {
      var activeIndex = this.props.activeIndex;
      return Array.isArray(activeIndex) ? activeIndex.length !== 0 : activeIndex || activeIndex === 0;
    }
  }, {
    key: "renderLabels",
    value: function renderLabels(sectors) {
      var isAnimationActive = this.props.isAnimationActive;
      if (isAnimationActive && !this.state.isAnimationFinished) {
        return null;
      }
      var _this$props = this.props,
        label = _this$props.label,
        labelLine = _this$props.labelLine,
        dataKey = _this$props.dataKey,
        valueKey = _this$props.valueKey;
      var pieProps = filterProps(this.props, false);
      var customLabelProps = filterProps(label, false);
      var customLabelLineProps = filterProps(labelLine, false);
      var offsetRadius = label && label.offsetRadius || 20;
      var labels = sectors.map(function (entry, i) {
        var midAngle = (entry.startAngle + entry.endAngle) / 2;
        var endPoint = polarToCartesian(entry.cx, entry.cy, entry.outerRadius + offsetRadius, midAngle);
        var labelProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieProps), entry), {}, {
          stroke: 'none'
        }, customLabelProps), {}, {
          index: i,
          textAnchor: Pie.getTextAnchor(endPoint.x, entry.cx)
        }, endPoint);
        var lineProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieProps), entry), {}, {
          fill: 'none',
          stroke: entry.fill
        }, customLabelLineProps), {}, {
          index: i,
          points: [polarToCartesian(entry.cx, entry.cy, entry.outerRadius, midAngle), endPoint]
        });
        var realDataKey = dataKey;
        // TODO: compatible to lower versions
        if (isNil(dataKey) && isNil(valueKey)) {
          realDataKey = 'value';
        } else if (isNil(dataKey)) {
          realDataKey = valueKey;
        }
        return (
          /*#__PURE__*/
          // eslint-disable-next-line react/no-array-index-key
          React.createElement(Layer, {
            key: "label-".concat(entry.startAngle, "-").concat(entry.endAngle, "-").concat(entry.midAngle, "-").concat(i)
          }, labelLine && Pie.renderLabelLineItem(labelLine, lineProps, 'line'), Pie.renderLabelItem(label, labelProps, getValueByDataKey(entry, realDataKey)))
        );
      });
      return /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-pie-labels"
      }, labels);
    }
  }, {
    key: "renderSectorsStatically",
    value: function renderSectorsStatically(sectors) {
      var _this2 = this;
      var _this$props2 = this.props,
        activeShape = _this$props2.activeShape,
        blendStroke = _this$props2.blendStroke,
        inactiveShapeProp = _this$props2.inactiveShape;
      return sectors.map(function (entry, i) {
        if ((entry === null || entry === void 0 ? void 0 : entry.startAngle) === 0 && (entry === null || entry === void 0 ? void 0 : entry.endAngle) === 0 && sectors.length !== 1) return null;
        var isActive = _this2.isActiveIndex(i);
        var inactiveShape = inactiveShapeProp && _this2.hasActiveIndex() ? inactiveShapeProp : null;
        var sectorOptions = isActive ? activeShape : inactiveShape;
        var sectorProps = _objectSpread(_objectSpread({}, entry), {}, {
          stroke: blendStroke ? entry.fill : entry.stroke,
          tabIndex: -1
        });
        return /*#__PURE__*/React.createElement(Layer, _extends({
          ref: function ref(_ref) {
            if (_ref && !_this2.sectorRefs.includes(_ref)) {
              _this2.sectorRefs.push(_ref);
            }
          },
          tabIndex: -1,
          className: "recharts-pie-sector"
        }, adaptEventsOfChild(_this2.props, entry, i), {
          // eslint-disable-next-line react/no-array-index-key
          key: "sector-".concat(entry === null || entry === void 0 ? void 0 : entry.startAngle, "-").concat(entry === null || entry === void 0 ? void 0 : entry.endAngle, "-").concat(entry.midAngle, "-").concat(i)
        }), /*#__PURE__*/React.createElement(Shape, _extends({
          option: sectorOptions,
          isActive: isActive,
          shapeType: "sector"
        }, sectorProps)));
      });
    }
  }, {
    key: "renderSectorsWithAnimation",
    value: function renderSectorsWithAnimation() {
      var _this3 = this;
      var _this$props3 = this.props,
        sectors = _this$props3.sectors,
        isAnimationActive = _this$props3.isAnimationActive,
        animationBegin = _this$props3.animationBegin,
        animationDuration = _this$props3.animationDuration,
        animationEasing = _this$props3.animationEasing,
        animationId = _this$props3.animationId;
      var _this$state = this.state,
        prevSectors = _this$state.prevSectors,
        prevIsAnimationActive = _this$state.prevIsAnimationActive;
      return /*#__PURE__*/React.createElement(Animate, {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        from: {
          t: 0
        },
        to: {
          t: 1
        },
        key: "pie-".concat(animationId, "-").concat(prevIsAnimationActive),
        onAnimationStart: this.handleAnimationStart,
        onAnimationEnd: this.handleAnimationEnd
      }, function (_ref2) {
        var t = _ref2.t;
        var stepData = [];
        var first = sectors && sectors[0];
        var curAngle = first.startAngle;
        sectors.forEach(function (entry, index) {
          var prev = prevSectors && prevSectors[index];
          var paddingAngle = index > 0 ? get(entry, 'paddingAngle', 0) : 0;
          if (prev) {
            var angleIp = interpolateNumber(prev.endAngle - prev.startAngle, entry.endAngle - entry.startAngle);
            var latest = _objectSpread(_objectSpread({}, entry), {}, {
              startAngle: curAngle + paddingAngle,
              endAngle: curAngle + angleIp(t) + paddingAngle
            });
            stepData.push(latest);
            curAngle = latest.endAngle;
          } else {
            var endAngle = entry.endAngle,
              startAngle = entry.startAngle;
            var interpolatorAngle = interpolateNumber(0, endAngle - startAngle);
            var deltaAngle = interpolatorAngle(t);
            var _latest = _objectSpread(_objectSpread({}, entry), {}, {
              startAngle: curAngle + paddingAngle,
              endAngle: curAngle + deltaAngle + paddingAngle
            });
            stepData.push(_latest);
            curAngle = _latest.endAngle;
          }
        });
        return /*#__PURE__*/React.createElement(Layer, null, _this3.renderSectorsStatically(stepData));
      });
    }
  }, {
    key: "attachKeyboardHandlers",
    value: function attachKeyboardHandlers(pieRef) {
      var _this4 = this;
      // eslint-disable-next-line no-param-reassign
      pieRef.onkeydown = function (e) {
        if (!e.altKey) {
          switch (e.key) {
            case 'ArrowLeft':
              {
                var next = ++_this4.state.sectorToFocus % _this4.sectorRefs.length;
                _this4.sectorRefs[next].focus();
                _this4.setState({
                  sectorToFocus: next
                });
                break;
              }
            case 'ArrowRight':
              {
                var _next = --_this4.state.sectorToFocus < 0 ? _this4.sectorRefs.length - 1 : _this4.state.sectorToFocus % _this4.sectorRefs.length;
                _this4.sectorRefs[_next].focus();
                _this4.setState({
                  sectorToFocus: _next
                });
                break;
              }
            case 'Escape':
              {
                _this4.sectorRefs[_this4.state.sectorToFocus].blur();
                _this4.setState({
                  sectorToFocus: 0
                });
                break;
              }
          }
        }
      };
    }
  }, {
    key: "renderSectors",
    value: function renderSectors() {
      var _this$props4 = this.props,
        sectors = _this$props4.sectors,
        isAnimationActive = _this$props4.isAnimationActive;
      var prevSectors = this.state.prevSectors;
      if (isAnimationActive && sectors && sectors.length && (!prevSectors || !isEqual(prevSectors, sectors))) {
        return this.renderSectorsWithAnimation();
      }
      return this.renderSectorsStatically(sectors);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.pieRef) {
        this.attachKeyboardHandlers(this.pieRef);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this5 = this;
      var _this$props5 = this.props,
        hide = _this$props5.hide,
        sectors = _this$props5.sectors,
        className = _this$props5.className,
        label = _this$props5.label,
        cx = _this$props5.cx,
        cy = _this$props5.cy,
        innerRadius = _this$props5.innerRadius,
        outerRadius = _this$props5.outerRadius,
        isAnimationActive = _this$props5.isAnimationActive;
      var isAnimationFinished = this.state.isAnimationFinished;
      if (hide || !sectors || !sectors.length || !isNumber(cx) || !isNumber(cy) || !isNumber(innerRadius) || !isNumber(outerRadius)) {
        return null;
      }
      var layerClass = clsx('recharts-pie', className);
      return /*#__PURE__*/React.createElement(Layer, {
        tabIndex: this.props.rootTabIndex,
        className: layerClass,
        ref: function ref(_ref3) {
          _this5.pieRef = _ref3;
        }
      }, this.renderSectors(), label && this.renderLabels(sectors), Label.renderCallByParent(this.props, null, false), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, sectors, false));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (prevState.prevIsAnimationActive !== nextProps.isAnimationActive) {
        return {
          prevIsAnimationActive: nextProps.isAnimationActive,
          prevAnimationId: nextProps.animationId,
          curSectors: nextProps.sectors,
          prevSectors: [],
          isAnimationFinished: true
        };
      }
      if (nextProps.isAnimationActive && nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curSectors: nextProps.sectors,
          prevSectors: prevState.curSectors,
          isAnimationFinished: true
        };
      }
      if (nextProps.sectors !== prevState.curSectors) {
        return {
          curSectors: nextProps.sectors,
          isAnimationFinished: true
        };
      }
      return null;
    }
  }, {
    key: "getTextAnchor",
    value: function getTextAnchor(x, cx) {
      if (x > cx) {
        return 'start';
      }
      if (x < cx) {
        return 'end';
      }
      return 'middle';
    }
  }, {
    key: "renderLabelLineItem",
    value: function renderLabelLineItem(option, props, key) {
      if ( /*#__PURE__*/React.isValidElement(option)) {
        return /*#__PURE__*/React.cloneElement(option, props);
      }
      if (isFunction(option)) {
        return option(props);
      }
      var className = clsx('recharts-pie-label-line', typeof option !== 'boolean' ? option.className : '');
      return /*#__PURE__*/React.createElement(Curve, _extends({}, props, {
        key: key,
        type: "linear",
        className: className
      }));
    }
  }, {
    key: "renderLabelItem",
    value: function renderLabelItem(option, props, value) {
      if ( /*#__PURE__*/React.isValidElement(option)) {
        return /*#__PURE__*/React.cloneElement(option, props);
      }
      var label = value;
      if (isFunction(option)) {
        label = option(props);
        if ( /*#__PURE__*/React.isValidElement(label)) {
          return label;
        }
      }
      var className = clsx('recharts-pie-label-text', typeof option !== 'boolean' && !isFunction(option) ? option.className : '');
      return /*#__PURE__*/React.createElement(Text, _extends({}, props, {
        alignmentBaseline: "middle",
        className: className
      }), label);
    }
  }]);
}(PureComponent);
_Pie = Pie;
_defineProperty(Pie, "displayName", 'Pie');
_defineProperty(Pie, "defaultProps", {
  stroke: '#fff',
  fill: '#808080',
  legendType: 'rect',
  cx: '50%',
  cy: '50%',
  startAngle: 0,
  endAngle: 360,
  innerRadius: 0,
  outerRadius: '80%',
  paddingAngle: 0,
  labelLine: true,
  hide: false,
  minAngle: 0,
  isAnimationActive: !Global.isSsr,
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  nameKey: 'name',
  blendStroke: false,
  rootTabIndex: 0
});
_defineProperty(Pie, "parseDeltaAngle", function (startAngle, endAngle) {
  var sign = mathSign(endAngle - startAngle);
  var deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
  return sign * deltaAngle;
});
_defineProperty(Pie, "getRealPieData", function (itemProps) {
  var data = itemProps.data,
    children = itemProps.children;
  var presentationProps = filterProps(itemProps, false);
  var cells = findAllByType(children, Cell);
  if (data && data.length) {
    return data.map(function (entry, index) {
      return _objectSpread(_objectSpread(_objectSpread({
        payload: entry
      }, presentationProps), entry), cells && cells[index] && cells[index].props);
    });
  }
  if (cells && cells.length) {
    return cells.map(function (cell) {
      return _objectSpread(_objectSpread({}, presentationProps), cell.props);
    });
  }
  return [];
});
_defineProperty(Pie, "parseCoordinateOfPie", function (itemProps, offset) {
  var top = offset.top,
    left = offset.left,
    width = offset.width,
    height = offset.height;
  var maxPieRadius = getMaxRadius(width, height);
  var cx = left + getPercentValue(itemProps.cx, width, width / 2);
  var cy = top + getPercentValue(itemProps.cy, height, height / 2);
  var innerRadius = getPercentValue(itemProps.innerRadius, maxPieRadius, 0);
  var outerRadius = getPercentValue(itemProps.outerRadius, maxPieRadius, maxPieRadius * 0.8);
  var maxRadius = itemProps.maxRadius || Math.sqrt(width * width + height * height) / 2;
  return {
    cx: cx,
    cy: cy,
    innerRadius: innerRadius,
    outerRadius: outerRadius,
    maxRadius: maxRadius
  };
});
_defineProperty(Pie, "getComposedData", function (_ref4) {
  var item = _ref4.item,
    offset = _ref4.offset;
  var itemProps = item.type.defaultProps !== undefined ? _objectSpread(_objectSpread({}, item.type.defaultProps), item.props) : item.props;
  var pieData = _Pie.getRealPieData(itemProps);
  if (!pieData || !pieData.length) {
    return null;
  }
  var cornerRadius = itemProps.cornerRadius,
    startAngle = itemProps.startAngle,
    endAngle = itemProps.endAngle,
    paddingAngle = itemProps.paddingAngle,
    dataKey = itemProps.dataKey,
    nameKey = itemProps.nameKey,
    valueKey = itemProps.valueKey,
    tooltipType = itemProps.tooltipType;
  var minAngle = Math.abs(itemProps.minAngle);
  var coordinate = _Pie.parseCoordinateOfPie(itemProps, offset);
  var deltaAngle = _Pie.parseDeltaAngle(startAngle, endAngle);
  var absDeltaAngle = Math.abs(deltaAngle);
  var realDataKey = dataKey;
  if (isNil(dataKey) && isNil(valueKey)) {
    warn(false, "Use \"dataKey\" to specify the value of pie,\n      the props \"valueKey\" will be deprecated in 1.1.0");
    realDataKey = 'value';
  } else if (isNil(dataKey)) {
    warn(false, "Use \"dataKey\" to specify the value of pie,\n      the props \"valueKey\" will be deprecated in 1.1.0");
    realDataKey = valueKey;
  }
  var notZeroItemCount = pieData.filter(function (entry) {
    return getValueByDataKey(entry, realDataKey, 0) !== 0;
  }).length;
  var totalPadingAngle = (absDeltaAngle >= 360 ? notZeroItemCount : notZeroItemCount - 1) * paddingAngle;
  var realTotalAngle = absDeltaAngle - notZeroItemCount * minAngle - totalPadingAngle;
  var sum = pieData.reduce(function (result, entry) {
    var val = getValueByDataKey(entry, realDataKey, 0);
    return result + (isNumber(val) ? val : 0);
  }, 0);
  var sectors;
  if (sum > 0) {
    var prev;
    sectors = pieData.map(function (entry, i) {
      var val = getValueByDataKey(entry, realDataKey, 0);
      var name = getValueByDataKey(entry, nameKey, i);
      var percent = (isNumber(val) ? val : 0) / sum;
      var tempStartAngle;
      if (i) {
        tempStartAngle = prev.endAngle + mathSign(deltaAngle) * paddingAngle * (val !== 0 ? 1 : 0);
      } else {
        tempStartAngle = startAngle;
      }
      var tempEndAngle = tempStartAngle + mathSign(deltaAngle) * ((val !== 0 ? minAngle : 0) + percent * realTotalAngle);
      var midAngle = (tempStartAngle + tempEndAngle) / 2;
      var middleRadius = (coordinate.innerRadius + coordinate.outerRadius) / 2;
      var tooltipPayload = [{
        name: name,
        value: val,
        payload: entry,
        dataKey: realDataKey,
        type: tooltipType
      }];
      var tooltipPosition = polarToCartesian(coordinate.cx, coordinate.cy, middleRadius, midAngle);
      prev = _objectSpread(_objectSpread(_objectSpread({
        percent: percent,
        cornerRadius: cornerRadius,
        name: name,
        tooltipPayload: tooltipPayload,
        midAngle: midAngle,
        middleRadius: middleRadius,
        tooltipPosition: tooltipPosition
      }, entry), coordinate), {}, {
        value: getValueByDataKey(entry, realDataKey),
        startAngle: tempStartAngle,
        endAngle: tempEndAngle,
        payload: entry,
        paddingAngle: mathSign(deltaAngle) * paddingAngle
      });
      return prev;
    });
  }
  return _objectSpread(_objectSpread({}, coordinate), {}, {
    sectors: sectors,
    data: pieData
  });
});

/**
 * @fileOverview Bar Chart
 */
var BarChart = generateCategoricalChart({
  chartName: 'BarChart',
  GraphicalChild: Bar,
  defaultTooltipEventType: 'axis',
  validateTooltipEventTypes: ['axis', 'item'],
  axisComponents: [{
    axisType: 'xAxis',
    AxisComp: XAxis
  }, {
    axisType: 'yAxis',
    AxisComp: YAxis
  }],
  formatAxisMap: formatAxisMap
});

/**
 * @fileOverview Pie Chart
 */
var PieChart = generateCategoricalChart({
  chartName: 'PieChart',
  GraphicalChild: Pie,
  validateTooltipEventTypes: ['item'],
  defaultTooltipEventType: 'item',
  legendContent: 'children',
  axisComponents: [{
    axisType: 'angleAxis',
    AxisComp: PolarAngleAxis
  }, {
    axisType: 'radiusAxis',
    AxisComp: PolarRadiusAxis
  }],
  formatAxisMap: formatAxisMap$1,
  defaultProps: {
    layout: 'centric',
    startAngle: 0,
    endAngle: 360,
    cx: '50%',
    cy: '50%',
    innerRadius: 0,
    outerRadius: '80%'
  }
});

const useToast = () => {
  return {
    toast: (message, options) => ue(message, options),
    error: (message, options) => ue.error(message, options),
    success: (message, options) => ue.success(message, options)
  };
};

const {useState,useEffect} = await importShared('react');
const {format} = await importShared('date-fns');
const {Clock,CloudRain,Coffee,Cigarette,Home,MapPin,PanelTopOpen,Leaf,Zap,ThumbsUp,ThumbsDown,Trash2,Edit,Flame,Wind,X,CalendarClock,BarChart2,PlusCircle,Activity,BrainCircuit,Lungs,HeartPulse,Award,Sparkles,GraduationCap} = await importShared('lucide-react');
const productTypes = [
  {
    value: "cigarettes",
    label: "Cigarettes",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Cigarette, { className: "h-4 w-4" }),
    color: "rgb(225, 113, 113)"
  },
  {
    value: "vape",
    label: "Vape/E-cigarette",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-4 w-4" }),
    color: "rgb(100, 173, 186)"
  },
  {
    value: "nicotine_pouches",
    label: "Nicotine Pouches",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelTopOpen, { className: "h-4 w-4" }),
    color: "rgb(88, 175, 124)"
  },
  {
    value: "nicotine_gum",
    label: "Nicotine Gum",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-4 w-4" }),
    color: "rgb(104, 160, 199)"
  },
  {
    value: "cigars",
    label: "Cigars",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4" }),
    color: "rgb(245, 174, 113)"
  }
];
const unitOptions = {
  cigarettes: [{ value: "cigarettes", label: "Cigarettes" }],
  vape: [
    { value: "puffs", label: "Puffs" },
    { value: "ml", label: "Milliliters" },
    { value: "pods", label: "Pods" }
  ],
  nicotine_pouches: [{ value: "pouches", label: "Pouches" }],
  nicotine_gum: [{ value: "pieces", label: "Pieces" }],
  cigars: [{ value: "cigars", label: "Cigars" }]
};
const commonTriggers = [
  {
    value: "stress",
    label: "Stress",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-warning" })
  },
  {
    value: "social",
    label: "Social Situation",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-4 w-4 text-secondary" })
  },
  {
    value: "boredom",
    label: "Boredom",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "h-4 w-4 text-text-tertiary" })
  },
  {
    value: "caffeine",
    label: "After Coffee/Tea",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { className: "h-4 w-4 text-accent" })
  },
  {
    value: "morning",
    label: "Morning Routine",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-info" })
  },
  {
    value: "weather",
    label: "Weather/Environment",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "h-4 w-4 text-info" })
  }
];
const commonLocations = [
  {
    value: "home",
    label: "Home",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Home, { className: "h-4 w-4 text-primary" })
  },
  {
    value: "work",
    label: "Work",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-info" })
  },
  {
    value: "car",
    label: "In Car",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-text-tertiary" })
  },
  {
    value: "outdoors",
    label: "Outdoors",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-success" })
  },
  {
    value: "social",
    label: "Social Venue",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-secondary" })
  }
];
const moodOptions = [
  {
    value: "very_negative",
    label: "Very Low",
    emoji: "😭",
    color: "rgb(225, 113, 113)"
  },
  { value: "negative", label: "Low", emoji: "😟", color: "rgb(226, 184, 124)" },
  {
    value: "neutral",
    label: "Neutral",
    emoji: "😐",
    color: "rgb(156, 167, 180)"
  },
  {
    value: "positive",
    label: "Good",
    emoji: "��",
    color: "rgb(100, 173, 186)"
  },
  {
    value: "very_positive",
    label: "Great",
    emoji: "😁",
    color: "rgb(88, 175, 124)"
  }
];
const ConsumptionLogger = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("log");
  const [date, setDate] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(/* @__PURE__ */ new Date(), "HH:mm"));
  const [productType, setProductType] = useState("cigarettes");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("cigarettes");
  const [trigger, setTrigger] = useState("");
  const [customTrigger, setCustomTrigger] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [mood, setMood] = useState("neutral");
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState("");
  const [consumptionLogs, setConsumptionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  useState(false);
  const [editingLog, setEditingLog] = useState(null);
  useState([]);
  const [triggerDistribution, setTriggerDistribution] = useState([]);
  useState([]);
  useState([]);
  const [locationDistribution, setLocationDistribution] = useState([]);
  useState([]);
  const [insights, setInsights] = useState([]);
  const [productTypeDistribution, setProductTypeDistribution] = useState(
    []
  );
  const [dailyConsumptionData, setDailyConsumptionData] = useState([]);
  const [timeOfDayDistribution, setTimeOfDayDistribution] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState({
    product_type: "",
    quantity: 1,
    unit: "unit",
    consumption_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    location: "",
    trigger: "",
    mood: "",
    intensity: 5,
    notes: ""
  });
  useState(false);
  useState("form");
  const { toast: toast2 } = useToast();
  const [healthImpacts, setHealthImpacts] = useState([]);
  const [consumptionSummary, setConsumptionSummary] = useState(null);
  const [lastConsumption, setLastConsumption] = useState(null);
  const [showHealthImpactDetails, setShowHealthImpactDetails] = useState(false);
  useState("");
  const [costPerPack, setCostPerPack] = useState(10);
  const [cigPerPack, setCigPerPack] = useState(20);
  const [motivationalTips, setMotivationalTips] = useState([]);
  useEffect(() => {
    if (session) {
      loadLogs();
    }
  }, [session]);
  const loadLogs = async () => {
    if (!session?.user?.id)
      return;
    setLoading(true);
    try {
      const data = await supabaseRestCall(
        `/rest/v1/consumption_logs8?user_id=eq.${session.user.id}&order=consumption_date.desc`,
        {
          method: "GET"
        },
        session
      );
      if (data) {
        setLogs(data);
        generateInsights(data);
      }
      toast2({
        title: "Logs loaded successfully",
        description: `Loaded ${data.length} consumption logs.`
      });
    } catch (error) {
      console.error("Error loading logs:", error);
      toast2({
        title: "Error loading logs",
        description: "Could not load your consumption logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const generateInsights = (logs2) => {
    if (!logs2 || logs2.length === 0) {
      setInsights([]);
      setProductTypeDistribution([]);
      setDailyConsumptionData([]);
      setTimeOfDayDistribution([]);
      setMoodDistribution([]);
      setLocationDistribution([]);
      setTriggerDistribution([]);
      return;
    }
    const dailyConsumption2 = {};
    logs2.forEach((log) => {
      const date2 = format(new Date(log.consumption_date), "yyyy-MM-dd");
      const quantity2 = log.quantity || 0;
      dailyConsumption2[date2] = (dailyConsumption2[date2] || 0) + quantity2;
    });
    const dailyConsumptionArray = Object.entries(dailyConsumption2).map(([date2, total]) => ({ date: date2, total })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDailyConsumptionData(dailyConsumptionArray);
    const productTypes2 = {};
    logs2.forEach((log) => {
      const type = log.product_type || "Unknown";
      productTypes2[type] = (productTypes2[type] || 0) + 1;
    });
    const productTypeArray = Object.entries(productTypes2).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    setProductTypeDistribution(productTypeArray);
    const timeDistribution = {
      "Morning (6am-12pm)": 0,
      "Afternoon (12pm-6pm)": 0,
      "Evening (6pm-12am)": 0,
      "Night (12am-6am)": 0
    };
    logs2.forEach((log) => {
      const date2 = new Date(log.consumption_date);
      const hour = date2.getHours();
      if (hour >= 6 && hour < 12) {
        timeDistribution["Morning (6am-12pm)"] += 1;
      } else if (hour >= 12 && hour < 18) {
        timeDistribution["Afternoon (12pm-6pm)"] += 1;
      } else if (hour >= 18 && hour < 24) {
        timeDistribution["Evening (6pm-12am)"] += 1;
      } else {
        timeDistribution["Night (12am-6am)"] += 1;
      }
    });
    const timeDistributionArray = Object.entries(timeDistribution).map(([name, value]) => ({ name, value })).filter((item) => item.value > 0);
    setTimeOfDayDistribution(timeDistributionArray);
    const moods = {};
    logs2.forEach((log) => {
      const mood2 = log.mood || "Unknown";
      moods[mood2] = (moods[mood2] || 0) + 1;
    });
    const moodArray = Object.entries(moods).map(([name, value]) => {
      const moodInfo = moodOptions.find((m) => m.value === name) || {
        label: name,
        color: "#999999"
      };
      return {
        name: moodInfo.label || name,
        value,
        color: moodInfo.color
      };
    }).sort((a, b) => b.value - a.value);
    setMoodDistribution(moodArray);
    const locations = {};
    logs2.forEach((log) => {
      const location2 = log.location || "Unknown";
      locations[location2] = (locations[location2] || 0) + 1;
    });
    const locationArray = Object.entries(locations).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    setLocationDistribution(locationArray);
    const triggers = {};
    logs2.forEach((log) => {
      const trigger2 = log.trigger || "Unknown";
      triggers[trigger2] = (triggers[trigger2] || 0) + 1;
    });
    const triggerArray = Object.entries(triggers).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    setTriggerDistribution(triggerArray);
    let newInsights = [];
    if (logs2.length > 0) {
      if (timeDistributionArray.length > 0) {
        const mostCommonTime = timeDistributionArray.reduce(
          (prev, current) => prev.value > current.value ? prev : current
        );
        newInsights.push(
          `You most frequently consume during the ${mostCommonTime.name.toLowerCase()}.`
        );
      }
      if (moodArray.length > 0) {
        const mostCommonMood = moodArray[0];
        newInsights.push(
          `You often consume when feeling ${mostCommonMood.name.toLowerCase()}.`
        );
      }
      if (dailyConsumptionArray.length > 1) {
        const recentTrend = dailyConsumptionArray.slice(-3);
        if (recentTrend.length >= 2) {
          const isIncreasing = recentTrend[recentTrend.length - 1].total > recentTrend[0].total;
          if (isIncreasing) {
            newInsights.push("Your consumption has been increasing recently.");
          } else {
            newInsights.push("Your consumption has been decreasing recently.");
          }
        }
      }
      if (locationArray.length > 0) {
        newInsights.push(
          `Your most common consumption location is ${locationArray[0].name}.`
        );
      }
      if (triggerArray.length > 0) {
        newInsights.push(
          `Your most common consumption trigger is ${triggerArray[0].name}.`
        );
      }
    }
    setInsights(newInsights);
  };
  const resetForm = () => {
    setDate(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
    setTime(format(/* @__PURE__ */ new Date(), "HH:mm"));
    setProductType("cigarettes");
    setQuantity(1);
    setUnit("cigarettes");
    setTrigger("");
    setCustomTrigger("");
    setLocation("");
    setCustomLocation("");
    setMood("neutral");
    setIntensity(5);
    setNotes("");
    setEditingLog(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast2.error("Please sign in to log consumption");
      return;
    }
    if (!currentLog.product_type || !currentLog.consumption_date) {
      toast2.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const logData = {
        ...currentLog,
        user_id: session.user.id,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      await saveConsumptionLog(logData, session);
      toast2.success("Consumption logged successfully");
      resetForm();
    } catch (error) {
      console.error("Error logging consumption:", error);
      toast2.error("Failed to log consumption");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (log) => {
    if (!session?.user?.id || !log.id)
      return;
    const logToDelete = log;
    setLogs((prevLogs) => prevLogs.filter((l) => l.id !== log.id));
    try {
      await supabaseRestCall(
        `/rest/v1/consumption_logs8?id=eq.${log.id}`,
        {
          method: "DELETE"
        },
        session
      );
      toast2({
        title: "Log deleted",
        description: "Your consumption log has been deleted."
      });
    } catch (error) {
      console.error("Error deleting log:", error);
      setLogs((prevLogs) => [...prevLogs, logToDelete]);
      toast2({
        title: "Error deleting log",
        description: "Could not delete your consumption log. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleEdit = (log) => {
    const logDate = new Date(log.consumption_date);
    setDate(format(logDate, "yyyy-MM-dd"));
    setTime(format(logDate, "HH:mm"));
    setProductType(log.product_type);
    setQuantity(log.quantity);
    setUnit(log.unit);
    if (commonTriggers.some((t) => t.value === log.trigger)) {
      setTrigger(log.trigger || "");
      setCustomTrigger("");
    } else {
      setTrigger("custom");
      setCustomTrigger(log.trigger || "");
    }
    if (commonLocations.some((l) => l.value === log.location)) {
      setLocation(log.location || "");
      setCustomLocation("");
    } else {
      setLocation("custom");
      setCustomLocation(log.location || "");
    }
    setMood(log.mood || "neutral");
    setIntensity(log.intensity || 5);
    setNotes(log.notes || "");
    setEditingLog(log);
    setActiveTab("log");
  };
  const handleProductTypeChange = (value) => {
    setProductType(value);
    const options = unitOptions[value];
    if (options && options.length > 0) {
      setUnit(options[0].value);
    }
  };
  const calculateHealthImpacts = (lastConsumptionDate) => {
    const now = /* @__PURE__ */ new Date();
    const hoursSinceLastSmoke = differenceInHours(now, lastConsumptionDate);
    const healthMilestones = [
      {
        name: "Blood Oxygen",
        icon: HeartPulse,
        description: "Blood oxygen levels return to normal",
        timeToRecover: 12,
        progress: Math.min(100, hoursSinceLastSmoke / 12 * 100),
        color: "text-red-500"
      },
      {
        name: "Carbon Monoxide",
        icon: Lungs,
        description: "Carbon monoxide levels drop to normal",
        timeToRecover: 24,
        progress: Math.min(100, hoursSinceLastSmoke / 24 * 100),
        color: "text-blue-500"
      },
      {
        name: "Nicotine",
        icon: BrainCircuit,
        description: "Nicotine is eliminated from the body",
        timeToRecover: 72,
        progress: Math.min(100, hoursSinceLastSmoke / 72 * 100),
        color: "text-purple-500"
      },
      {
        name: "Smell & Taste",
        icon: Sparkles,
        description: "Sense of smell and taste improve",
        timeToRecover: 48,
        progress: Math.min(100, hoursSinceLastSmoke / 48 * 100),
        color: "text-amber-500"
      },
      {
        name: "Circulation",
        icon: Activity,
        description: "Circulation begins to improve",
        timeToRecover: 336,
        // 2 weeks in hours
        progress: Math.min(100, hoursSinceLastSmoke / 336 * 100),
        color: "text-green-500"
      }
    ];
    setHealthImpacts(healthMilestones);
  };
  const calculateConsumptionSummary = (logs2) => {
    if (!logs2.length)
      return;
    const totalCigarettes = logs2.reduce((sum, log) => {
      if (log.product_type === "cigarettes") {
        return sum + log.quantity;
      }
      return sum;
    }, 0);
    const totalCost = totalCigarettes * (costPerPack / cigPerPack);
    const earliestLog = new Date(logs2[logs2.length - 1].consumption_date);
    const dayCount = Math.max(1, differenceInDays(/* @__PURE__ */ new Date(), earliestLog) + 1);
    const averagePerDay = totalCigarettes / dayCount;
    const triggerCounts = {};
    const locationCounts = {};
    logs2.forEach((log) => {
      if (log.trigger) {
        triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
      }
      if (log.location) {
        locationCounts[log.location] = (locationCounts[log.location] || 0) + 1;
      }
    });
    const mostCommonTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    const mostCommonLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    const consumptionDays = logs2.map((log) => format(new Date(log.consumption_date), "yyyy-MM-dd"));
    const uniqueDays = [...new Set(consumptionDays)].sort();
    let longestStreak = 0;
    let currentStreak = 0;
    const lastConsumptionDay = uniqueDays[uniqueDays.length - 1];
    const lastDate = new Date(lastConsumptionDay);
    currentStreak = differenceInDays(/* @__PURE__ */ new Date(), lastDate);
    const smokeFreeHours = differenceInHours(
      /* @__PURE__ */ new Date(),
      new Date(logs2[0].consumption_date)
    );
    setConsumptionSummary({
      totalCigarettes,
      totalCost,
      averagePerDay,
      mostCommonTrigger,
      mostCommonLocation,
      longestStreak,
      currentStreak,
      smokeFreeHours
    });
  };
  const generateMotivationalTips = (summary, logs2) => {
    if (!summary)
      return;
    const tips = [];
    if (summary.mostCommonTrigger !== "None") {
      tips.push(`Your most common trigger is "${summary.mostCommonTrigger}". Try to avoid situations where this trigger occurs or prepare alternative coping strategies.`);
    }
    const morningLogs = logs2.filter((log) => {
      const hour = new Date(log.consumption_date).getHours();
      return hour >= 5 && hour < 12;
    });
    if (morningLogs.length > logs2.length * 0.4) {
      tips.push("Morning cravings are common. Try changing your morning routine and replace smoking with a healthy habit like stretching or meditation.");
    }
    if (summary.currentStreak > 0) {
      tips.push(`You're on a ${summary.currentStreak}-day streak without smoking. Each day gets easier - keep going!`);
    } else {
      tips.push("Every moment is a new opportunity to quit. Log your triggers to better understand your smoking patterns.");
    }
    if (summary.totalCost > 0) {
      tips.push(`You've spent approximately $${summary.totalCost.toFixed(2)} on cigarettes in this period. Consider what else you could do with that money!`);
    }
    tips.push("When a craving hits, try the 4Ds: Deep breaths, Drink water, Distract yourself, or Delay for 5-10 minutes.");
    setMotivationalTips(tips);
  };
  useEffect(() => {
    const fetchLogs = async () => {
      if (!session)
        return;
      setLoading(true);
      try {
        const result = await supabaseRestCall(
          `/rest/v1/consumption_logs8?user_id=eq.${session.user.id}&order=consumption_date.desc`,
          { method: "GET" },
          session
        );
        if (result && Array.isArray(result)) {
          setLogs(result);
          if (result.length > 0) {
            setLastConsumption(result[0]);
            calculateHealthImpacts(new Date(result[0].consumption_date));
            calculateConsumptionSummary(result);
            generateMotivationalTips(consumptionSummary, result);
          }
        }
      } catch (error) {
        console.error("Error fetching consumption logs:", error);
        toast2({
          title: "Error",
          description: "Failed to load consumption data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [session]);
  if (!session?.user?.id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        { className: "text-muted-foreground", children: "Please sign in to log consumption." }
      ) }
    );
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }
    );
  }
  const renderHealthImpactSection = () => {
    if (!lastConsumption) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          { className: "text-muted-foreground", children: "Log your first consumption to track health impacts." }
        ) }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      { className: "border-border/20 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          CardHeader,
          { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CardTitle,
              { className: "flex items-center gap-2 text-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "h-5 w-5 text-primary" }),
                "Health Recovery Progress"
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CardDescription,
              { children: [
                "Since your last logged consumption on ",
                format(new Date(lastConsumption.consumption_date), "MMM d, h:mm a")
              ] }
            )
          ] }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardContent,
          { className: "space-y-4", children: healthImpacts.map(
            (impact, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "flex justify-between items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          TooltipProvider,
                          { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            Tooltip,
                            { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                TooltipTrigger,
                                { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "div",
                                  { className: `p-1.5 rounded-full bg-muted ${impact.color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(impact.icon, { className: "h-4 w-4" }) }
                                ) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                TooltipContent,
                                { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: impact.description }) }
                              )
                            ] }
                          ) }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: impact.name })
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      { className: "text-sm font-medium", children: impact.progress >= 100 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: "Recovered" }
                      ) : `${Math.round(impact.progress)}%` }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: impact.progress, className: "h-2" })
              ] },
              index
            )
          ) }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardFooter,
          { className: "flex justify-center border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setShowHealthImpactDetails(!showHealthImpactDetails),
              children: showHealthImpactDetails ? "Hide Details" : "Show More Details"
            }
          ) }
        )
      ] }
    );
  };
  const renderMotivationalSection = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      { className: "border-border/20 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          CardHeader,
          { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CardTitle,
              { className: "flex items-center gap-2 text-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-5 w-5 text-amber-500" }),
                "Your Personalized Insights"
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CardDescription,
              { children: "Based on your consumption patterns" }
            )
          ] }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardContent,
          { children: motivationalTips.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "ul",
            { className: "space-y-3", children: motivationalTips.map(
              (tip, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "li",
                { className: "flex items-start gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-4 w-4 text-primary" }) }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: tip })
                ] },
                index
              )
            ) }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            { className: "text-muted-foreground text-sm", children: "Log your smoking habits to receive personalized insights." }
          ) }
        )
      ] }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    { className: "space-y-6 overflow-y-auto max-h-full pb-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h1",
                { className: "text-3xl font-bold tracking-tight mb-1", children: "Consumption Logger" }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                { className: "text-text-secondary", children: "Track your tobacco and nicotine usage to identify patterns" }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            { variant: "outline", className: "flex items-center gap-1.5 bg-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format(/* @__PURE__ */ new Date(), "MMMM d, yyyy") })
            ] }
          )
        ] }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsList,
            { className: "grid w-full grid-cols-3 mb-3 bg-muted/30 p-1.5 rounded-lg gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                {
                  value: "log",
                  className: "flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-3 py-2.5 transition-all hover:bg-white/50 hover:text-primary/80",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PlusCircle, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Log Usage" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                {
                  value: "history",
                  className: "flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-3 py-2.5 transition-all hover:bg-white/50 hover:text-primary/80",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "History" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                {
                  value: "insights",
                  className: "flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-3 py-2.5 transition-all hover:bg-white/50 hover:text-primary/80",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart2, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Insights" })
                  ]
                }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsContent,
            { value: "log", className: "space-y-4 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              { className: "overflow-hidden border-border/30 shadow-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CardHeader,
                  { className: "bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/20", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardTitle,
                      { className: "flex items-center gap-2 text-lg", children: editingLog ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        jsxRuntimeExports.Fragment,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Edit, { className: "h-5 w-5 text-primary" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit Consumption Log" })
                        ] }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        jsxRuntimeExports.Fragment,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(PlusCircle, { className: "h-5 w-5 text-primary" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Consumption Log" })
                        ] }
                      ) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardDescription,
                      { children: editingLog ? "Update the details of your consumption log" : "Record your tobacco or nicotine consumption to track patterns" }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "form",
                  { onSubmit: handleSubmit, className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardContent,
                      { className: "space-y-6 pt-6", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "grid md:grid-cols-3 gap-6", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Label$1,
                                  { htmlFor: "date", className: "text-text-secondary", children: "Date" }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Input,
                                  {
                                    id: "date",
                                    type: "date",
                                    value: date,
                                    onChange: (e) => setDate(e.target.value),
                                    className: "bg-white border-border",
                                    required: true
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Label$1,
                                  { htmlFor: "time", className: "text-text-secondary", children: "Time" }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Input,
                                  {
                                    id: "time",
                                    type: "time",
                                    value: time,
                                    onChange: (e) => setTime(e.target.value),
                                    className: "bg-white border-border",
                                    required: true
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Label$1,
                                  {
                                    htmlFor: "product-type",
                                    className: "text-text-secondary",
                                    children: "Product Type"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  Select,
                                  {
                                    value: productType,
                                    onValueChange: handleProductTypeChange,
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        SelectTrigger,
                                        {
                                          id: "product-type",
                                          className: "bg-white border-border",
                                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product" })
                                        }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        SelectContent,
                                        { children: productTypes.map(
                                          (product) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                            SelectItem,
                                            {
                                              value: product.value,
                                              className: "flex items-center gap-2",
                                              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                                "div",
                                                { className: "flex items-center gap-2", children: [
                                                  product.icon,
                                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: product.label })
                                                ] }
                                              )
                                            },
                                            product.value
                                          )
                                        ) }
                                      )
                                    ]
                                  }
                                )
                              ] }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "grid md:grid-cols-2 gap-6", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Label$1,
                                  { htmlFor: "quantity", className: "text-text-secondary", children: "Quantity" }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "flex items-center gap-3", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      Input,
                                      {
                                        id: "quantity",
                                        type: "number",
                                        min: "1",
                                        value: quantity,
                                        onChange: (e) => setQuantity(parseInt(e.target.value)),
                                        className: "flex-1 bg-white border-border",
                                        required: true
                                      }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      Select,
                                      { value: unit, onValueChange: setUnit, children: [
                                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                                          SelectTrigger,
                                          {
                                            id: "unit",
                                            className: "w-[150px] bg-white border-border",
                                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select unit" })
                                          }
                                        ),
                                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                                          SelectContent,
                                          { children: unitOptions[productType]?.map(
                                            (unitOption) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                              SelectItem,
                                              {
                                                value: unitOption.value,
                                                children: unitOption.label
                                              },
                                              unitOption.value
                                            )
                                          ) }
                                        )
                                      ] }
                                    )
                                  ] }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "flex items-center justify-between", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      Label$1,
                                      {
                                        htmlFor: "intensity",
                                        className: "text-text-secondary",
                                        children: "Craving Intensity"
                                      }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      "span",
                                      { className: "text-sm font-medium text-text-primary", children: [
                                        intensity,
                                        " / 10"
                                      ] }
                                    )
                                  ] }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Slider,
                                  {
                                    id: "intensity",
                                    min: 1,
                                    max: 10,
                                    step: 1,
                                    value: [intensity],
                                    onValueChange: (values) => setIntensity(values[0]),
                                    className: "py-2"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "flex justify-between text-xs text-text-tertiary", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mild" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Moderate" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Severe" })
                                  ] }
                                )
                              ] }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "grid md:grid-cols-2 gap-6", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Label$1,
                                  { htmlFor: "trigger", className: "text-text-secondary", children: "Trigger" }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  Select,
                                  { value: trigger, onValueChange: setTrigger, children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      SelectTrigger,
                                      {
                                        id: "trigger",
                                        className: "bg-white border-border",
                                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "What triggered usage?" })
                                      }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      SelectContent,
                                      { children: [
                                        commonTriggers.map(
                                          (trig) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                            SelectItem,
                                            {
                                              value: trig.value,
                                              className: "flex items-center gap-2",
                                              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                                "div",
                                                { className: "flex items-center gap-2", children: [
                                                  trig.icon,
                                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: trig.label })
                                                ] }
                                              )
                                            },
                                            trig.value
                                          )
                                        ),
                                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom trigger" })
                                      ] }
                                    )
                                  ] }
                                ),
                                trigger === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Input,
                                  {
                                    placeholder: "Enter custom trigger",
                                    value: customTrigger,
                                    onChange: (e) => setCustomTrigger(e.target.value),
                                    className: "mt-2 bg-white border-border",
                                    required: trigger === "custom"
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Label$1,
                                  { htmlFor: "location", className: "text-text-secondary", children: "Location" }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  Select,
                                  { value: location, onValueChange: setLocation, children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      SelectTrigger,
                                      {
                                        id: "location",
                                        className: "bg-white border-border",
                                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Where were you?" })
                                      }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      SelectContent,
                                      { children: [
                                        commonLocations.map(
                                          (loc) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                            SelectItem,
                                            {
                                              value: loc.value,
                                              className: "flex items-center gap-2",
                                              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                                "div",
                                                { className: "flex items-center gap-2", children: [
                                                  loc.icon,
                                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: loc.label })
                                                ] }
                                              )
                                            },
                                            loc.value
                                          )
                                        ),
                                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom location" })
                                      ] }
                                    )
                                  ] }
                                ),
                                location === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Input,
                                  {
                                    placeholder: "Enter custom location",
                                    value: customLocation,
                                    onChange: (e) => setCustomLocation(e.target.value),
                                    className: "mt-2 bg-white border-border",
                                    required: location === "custom"
                                  }
                                )
                              ] }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Label$1,
                              { htmlFor: "mood", className: "text-text-secondary", children: "Mood" }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "grid grid-cols-5 gap-2", children: moodOptions.map(
                                (moodOption) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "button",
                                  {
                                    type: "button",
                                    className: `flex flex-col items-center p-2 rounded-md border transition-all duration-200 hover:shadow-sm ${mood === moodOption.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"}`,
                                    onClick: () => setMood(moodOption.value),
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "span",
                                        { className: "text-2xl mb-1", children: moodOption.emoji }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "span",
                                        { className: "text-xs font-medium", children: moodOption.label }
                                      )
                                    ]
                                  },
                                  moodOption.value
                                )
                              ) }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Label$1,
                              { htmlFor: "notes", className: "text-text-secondary", children: "Notes" }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Textarea,
                              {
                                id: "notes",
                                placeholder: "Additional context about this usage event...",
                                value: notes,
                                onChange: (e) => setNotes(e.target.value),
                                className: "resize-none bg-white border-border"
                              }
                            )
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardFooter,
                      { className: "flex justify-between border-t border-border/20 bg-background/50 px-6 py-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          {
                            type: "button",
                            variant: "outline",
                            className: "border-border/50",
                            onClick: resetForm,
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-2" }),
                              "Cancel"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            type: "submit",
                            className: "bg-primary text-white hover:bg-primary-dark",
                            disabled: loading,
                            children: loading ? "Logging..." : editingLog ? "Update Log" : "Add Log"
                          }
                        )
                      ] }
                    )
                  ] }
                )
              ] }
            ) }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsContent,
            { value: "history", className: "space-y-4 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h2",
                { className: "text-2xl font-medium text-text-primary tracking-tight mb-1", children: "Consumption History" }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                { className: "text-sm text-text-secondary", children: "View your past consumption logs" }
              ),
              consumptionLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                { className: "text-center py-8 text-text-secondary", children: "No consumption logs recorded yet." }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                { className: "space-y-4", children: consumptionLogs.map((log) => {
                  const productInfo = productTypes.find(
                    (p) => p.value === log.product_type
                  );
                  const moodInfo = moodOptions.find((m) => m.value === log.mood);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "p-4 bg-white rounded-xl shadow-sm border border-border/10 transition-all duration-300 hover:translate-y-[-2px]",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "space-y-3", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-center gap-2", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    {
                                      className: `p-2 rounded-full ${productInfo?.value ? `bg-${productInfo.value}-100` : "bg-border"}`,
                                      children: productInfo?.icon || /* @__PURE__ */ jsxRuntimeExports.jsx(Cigarette, { className: "h-4 w-4" })
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "h4",
                                        { className: "text-sm font-medium", children: [
                                          log.quantity,
                                          " ",
                                          log.unit,
                                          " of",
                                          " ",
                                          productInfo?.label || log.product_type
                                        ] }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "p",
                                        { className: "text-xs text-text-secondary", children: format(new Date(log.consumption_date), "PPp") }
                                      )
                                    ] }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex flex-wrap gap-2 my-2", children: [
                                  log.trigger && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    Badge,
                                    { variant: "outline", className: "text-xs", children: [
                                      "Trigger: ",
                                      log.trigger
                                    ] }
                                  ),
                                  log.location && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    Badge,
                                    { variant: "outline", className: "text-xs", children: [
                                      "Location: ",
                                      log.location
                                    ] }
                                  ),
                                  log.mood && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    Badge,
                                    { variant: "outline", className: "text-xs", children: [
                                      "Mood: ",
                                      moodInfo?.emoji || "😐",
                                      " ",
                                      moodInfo?.label || log.mood
                                    ] }
                                  ),
                                  log.intensity !== void 0 && log.intensity > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    Badge,
                                    { variant: "outline", className: "text-xs", children: [
                                      "Intensity: ",
                                      log.intensity,
                                      "/10"
                                    ] }
                                  )
                                ] }
                              ),
                              log.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "p",
                                { className: "text-sm text-text-secondary italic", children: [
                                  '"',
                                  log.notes,
                                  '"'
                                ] }
                              )
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "flex items-start gap-2 lg:justify-end", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                Button,
                                {
                                  variant: "outline",
                                  size: "sm",
                                  className: "h-8 px-3 transition-all duration-200 hover:bg-border",
                                  onClick: () => handleEdit(log),
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(Edit, { className: "h-3.5 w-3.5 mr-1" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit" })
                                  ]
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                Button,
                                {
                                  variant: "outline",
                                  size: "sm",
                                  className: "h-8 px-3 text-red-500 transition-all duration-200 hover:bg-red-50",
                                  onClick: () => handleDelete(log),
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 mr-1" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delete" })
                                  ]
                                }
                              )
                            ] }
                          )
                        ] }
                      )
                    },
                    log.id
                  );
                }) }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsContent,
            { value: "insights", className: "space-y-4 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h2",
                { className: "text-2xl font-medium text-text-primary tracking-tight mb-1", children: "Consumption Insights" }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                { className: "text-sm text-text-secondary", children: "Analyze your usage patterns and trends" }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "p-6 mb-6 bg-white rounded-xl shadow-sm border border-border/10 transition-all duration-300", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    { className: "text-lg font-medium text-text-primary mb-4", children: "Consumption Trends" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ResponsiveContainer,
                      { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        BarChart,
                        {
                          data: dailyConsumptionData,
                          margin: {
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Tooltip,
                              {
                                contentStyle: {
                                  backgroundColor: "white",
                                  borderColor: "#ddd",
                                  borderRadius: "8px",
                                  padding: "12px"
                                }
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "total", fill: "#8884d8" })
                          ]
                        }
                      ) }
                    ) }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "p-6 mb-6 bg-white rounded-xl shadow-sm border border-border/10 transition-all duration-300", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    { className: "text-lg font-medium text-text-primary mb-4", children: "Product Type Distribution" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ResponsiveContainer,
                      { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        PieChart,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Pie,
                            {
                              data: productTypeDistribution,
                              cx: "50%",
                              cy: "50%",
                              labelLine: false,
                              outerRadius: 80,
                              fill: "#8884d8",
                              dataKey: "value",
                              children: productTypeDistribution.map(
                                (entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.color }, `cell-${index}`)
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Tooltip,
                            {
                              labelStyle: { color: "#000" },
                              itemStyle: { color: "#000" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
                        ] }
                      ) }
                    ) }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "p-6 mb-6 bg-white rounded-xl shadow-sm border border-border/10 transition-all duration-300", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    { className: "text-lg font-medium text-text-primary mb-4", children: "Time of Day Distribution" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ResponsiveContainer,
                      { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        PieChart,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Pie,
                            {
                              data: timeOfDayDistribution,
                              cx: "50%",
                              cy: "50%",
                              labelLine: false,
                              outerRadius: 80,
                              fill: "#8884d8",
                              dataKey: "value",
                              children: timeOfDayDistribution.map(
                                (entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.color }, `cell-${index}`)
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Tooltip,
                            {
                              labelStyle: { color: "#000" },
                              itemStyle: { color: "#000" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
                        ] }
                      ) }
                    ) }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "p-6 mb-6 bg-white rounded-xl shadow-sm border border-border/10 transition-all duration-300", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    { className: "text-lg font-medium text-text-primary mb-4", children: "Mood Distribution" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ResponsiveContainer,
                      { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        PieChart,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Pie,
                            {
                              data: moodDistribution,
                              cx: "50%",
                              cy: "50%",
                              labelLine: false,
                              outerRadius: 80,
                              fill: "#8884d8",
                              dataKey: "value",
                              children: moodDistribution.map(
                                (entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.color }, `cell-${index}`)
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Tooltip,
                            {
                              labelStyle: { color: "#000" },
                              itemStyle: { color: "#000" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
                        ] }
                      ) }
                    ) }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "p-6 mb-6 bg-white rounded-xl shadow-sm border border-border/10 transition-all duration-300", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    { className: "text-lg font-medium text-text-primary mb-4", children: "Insights" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ResponsiveContainer,
                      { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        PieChart,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Pie,
                            {
                              data: insights.map((insight) => ({
                                name: insight,
                                value: 1
                              })),
                              cx: "50%",
                              cy: "50%",
                              labelLine: false,
                              outerRadius: 80,
                              fill: "#8884d8",
                              dataKey: "value",
                              children: insights.map(
                                (insight, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: "#8884d8" }, `cell-${index}`)
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Tooltip,
                            {
                              labelStyle: { color: "#000" },
                              itemStyle: { color: "#000" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
                        ] }
                      ) }
                    ) }
                  )
                ] }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsContent,
            { value: "analytics", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
                renderHealthImpactSection(),
                renderMotivationalSection()
              ] }
            ) }
          )
        ] }
      )
    ] }
  );
};

export { ConsumptionLogger, useToast as u };
