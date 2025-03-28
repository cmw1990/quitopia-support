import { i as importShared } from './react-vendor-773e5a75.js';
import { f as cn, C as Card } from './card-7a71f808.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';
import { a as ue, u as useAuth } from './AuthProvider-b0b4665b.js';
import { i as isFunction, D as Dot, f as findAllByType, L as Layer, a as filterProps, C as Curve, A as Animate, b as interpolateNumber, c as isEqual, d as isNil, h as hasClipDot, e as LabelList, G as Global, g as getValueByDataKey, j as getCateCoordinateOfLine, u as uniqueId, E as ErrorBar, k as generateCategoricalChart, X as XAxis, Y as YAxis, l as formatAxisMap, R as ResponsiveContainer, m as CartesianGrid, T as Tooltip, n as Legend } from './generateCategoricalChart-3e4dddb1.js';

function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("animate-pulse rounded-md bg-muted", className),
      ...props
    }
  );
}

const VITE_SUPABASE_URL = "https://zoubqdwxemivxrjruvam.supabase.co";
const VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs";
class MissionFreshApiClient {
  constructor() {
    this.baseUrl = VITE_SUPABASE_URL + "/rest/v1";
    this.headers = {
      "Content-Type": "application/json",
      "apikey": VITE_SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${VITE_SUPABASE_ANON_KEY}`,
      "Prefer": "return=representation"
    };
  }
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        ue.error(errorMessage);
      } catch (e) {
        ue.error("An error occurred while processing your request");
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.json();
        return {
          ...response,
          data
        };
      } catch (e) {
        console.warn("Failed to parse JSON response:", e);
        return {
          ...response,
          data: Array.isArray(response) ? [] : {}
        };
      }
    }
    return response;
  }
  async get(endpoint) {
    return this.request(endpoint, {
      method: "GET"
    });
  }
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE"
    });
  }
  async request(endpoint, options = {}, session) {
    try {
      const headers = {
        "Content-Type": "application/json",
        "apikey": VITE_SUPABASE_ANON_KEY
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      } else {
        headers["Authorization"] = `Bearer ${VITE_SUPABASE_ANON_KEY}`;
      }
      const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      const apiEndpoint = formattedEndpoint.startsWith("/rest/v1") ? formattedEndpoint : `/rest/v1${formattedEndpoint}`;
      const response = await fetch(`${VITE_SUPABASE_URL}${apiEndpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(error.message || "API request failed");
      }
      const data = await response.json();
      return {
        ok: true,
        data
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
  // API Methods
  async getConsumptionLogs(userId) {
    const endpoint = userId ? `/consumption_logs8?user_id=eq.${userId}&order=consumption_date.desc` : "/consumption_logs8?order=consumption_date.desc";
    return this.get(endpoint);
  }
  async saveConsumptionLog(log) {
    return this.post("/consumption_logs8", log);
  }
  async deleteConsumptionLog(id) {
    return this.delete(`/consumption_logs8?id=eq.${id}`);
  }
  async getWithdrawalSymptoms(session) {
    return this.request("/withdrawal_symptoms8", {}, session);
  }
  async getWithdrawalSymptomsByType(symptomType, session) {
    return this.request(`/withdrawal_symptoms8?symptom_type=eq.${symptomType}&order=created_at.desc`, {}, session);
  }
  async getWithdrawalSymptomsTimeRange(startDate, endDate, session) {
    return this.request(`/withdrawal_symptoms8?created_at=gte.${startDate}&created_at=lte.${endDate}&order=created_at.desc`, {}, session);
  }
  async saveWithdrawalSymptom(symptom, session) {
    return this.request("/withdrawal_symptoms8", {
      method: symptom.id ? "PUT" : "POST",
      body: JSON.stringify(symptom)
    }, session);
  }
  async deleteWithdrawalSymptom(id, session) {
    return this.request(`/withdrawal_symptoms8?id=eq.${id}`, {
      method: "DELETE"
    }, session);
  }
  async getSavedCopingStrategies(userId, session) {
    return this.request(`/user_coping_strategies8?user_id=eq.${userId}&order=effectiveness.desc`, {}, session);
  }
  async saveUserCopingStrategy(strategy, session) {
    return this.request("/user_coping_strategies8", {
      method: strategy.id ? "PUT" : "POST",
      body: JSON.stringify(strategy)
    }, session);
  }
  async updateCopingStrategyEffectiveness(id, effectiveness, session) {
    return this.request(`/user_coping_strategies8?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        effectiveness
      })
    }, session);
  }
  async saveWithdrawalPrediction(userId, predictions, session) {
    return this.request("/withdrawal_predictions8", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        predictions,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    }, session);
  }
  async savePersonalizedRecommendation(userId, recommendation, session) {
    return this.request("/personalized_recommendations8", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        ...recommendation,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    }, session);
  }
  async saveCravingRecord(data) {
    return this.post("/craving_records8", data);
  }
  async deleteCravingRecord(id) {
    return this.delete(`/craving_records8?id=eq.${id}`);
  }
  async getFinancialImpact() {
    return this.get("/financial_impact8");
  }
  async saveFinancialRecord(data) {
    return this.post("/financial_records8", data);
  }
  async deleteFinancialRecord(id) {
    return this.delete(`/financial_records8?id=eq.${id}`);
  }
  async getQuitGoals() {
    return this.get("/quit_goals8?order=created_at.desc");
  }
  async saveQuitGoal(data) {
    return this.post("/quit_goals8", data);
  }
  async updateQuitGoal(id, data) {
    return this.put(`/quit_goals8?id=eq.${id}`, data);
  }
  async deleteQuitGoal(id) {
    return this.delete(`/quit_goals8?id=eq.${id}`);
  }
  async getCopingStrategies() {
    return this.get("/coping_strategies8");
  }
  async saveCopingStrategy(data) {
    return this.post("/coping_strategies8", data);
  }
  async updateCopingStrategy(id, data) {
    return this.put(`/coping_strategies8?id=eq.${id}`, data);
  }
  async deleteCopingStrategy(id) {
    return this.delete(`/coping_strategies8?id=eq.${id}`);
  }
  async getProgressData(session) {
    const response = await this.request("/progress8", {}, session);
    if (!response.ok) {
      console.error("Failed to load progress data:", response.error);
      ue.error(response.error || "Failed to load progress data");
      return [];
    }
    return response.data || [];
  }
}
const missionFreshApiClient = new MissionFreshApiClient();

var _excluded = ["type", "layout", "connectNulls", "ref"],
  _excluded2 = ["key"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
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
 * @fileOverview Line
 */
const React = await importShared('react');
const {PureComponent} = React;
const clsx = await importShared('clsx');
var Line = /*#__PURE__*/function (_PureComponent) {
  function Line() {
    var _this;
    _classCallCheck(this, Line);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Line, [].concat(args));
    _defineProperty(_this, "state", {
      isAnimationFinished: true,
      totalLength: 0
    });
    _defineProperty(_this, "generateSimpleStrokeDasharray", function (totalLength, length) {
      return "".concat(length, "px ").concat(totalLength - length, "px");
    });
    _defineProperty(_this, "getStrokeDasharray", function (length, totalLength, lines) {
      var lineLength = lines.reduce(function (pre, next) {
        return pre + next;
      });

      // if lineLength is 0 return the default when no strokeDasharray is provided
      if (!lineLength) {
        return _this.generateSimpleStrokeDasharray(totalLength, length);
      }
      var count = Math.floor(length / lineLength);
      var remainLength = length % lineLength;
      var restLength = totalLength - length;
      var remainLines = [];
      for (var i = 0, sum = 0; i < lines.length; sum += lines[i], ++i) {
        if (sum + lines[i] > remainLength) {
          remainLines = [].concat(_toConsumableArray(lines.slice(0, i)), [remainLength - sum]);
          break;
        }
      }
      var emptyLines = remainLines.length % 2 === 0 ? [0, restLength] : [restLength];
      return [].concat(_toConsumableArray(Line.repeat(lines, count)), _toConsumableArray(remainLines), emptyLines).map(function (line) {
        return "".concat(line, "px");
      }).join(', ');
    });
    _defineProperty(_this, "id", uniqueId('recharts-line-'));
    _defineProperty(_this, "pathRef", function (node) {
      _this.mainCurve = node;
    });
    _defineProperty(_this, "handleAnimationEnd", function () {
      _this.setState({
        isAnimationFinished: true
      });
      if (_this.props.onAnimationEnd) {
        _this.props.onAnimationEnd();
      }
    });
    _defineProperty(_this, "handleAnimationStart", function () {
      _this.setState({
        isAnimationFinished: false
      });
      if (_this.props.onAnimationStart) {
        _this.props.onAnimationStart();
      }
    });
    return _this;
  }
  _inherits(Line, _PureComponent);
  return _createClass(Line, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (!this.props.isAnimationActive) {
        return;
      }
      var totalLength = this.getTotalLength();
      this.setState({
        totalLength: totalLength
      });
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      if (!this.props.isAnimationActive) {
        return;
      }
      var totalLength = this.getTotalLength();
      if (totalLength !== this.state.totalLength) {
        this.setState({
          totalLength: totalLength
        });
      }
    }
  }, {
    key: "getTotalLength",
    value: function getTotalLength() {
      var curveDom = this.mainCurve;
      try {
        return curveDom && curveDom.getTotalLength && curveDom.getTotalLength() || 0;
      } catch (err) {
        return 0;
      }
    }
  }, {
    key: "renderErrorBar",
    value: function renderErrorBar(needClip, clipPathId) {
      if (this.props.isAnimationActive && !this.state.isAnimationFinished) {
        return null;
      }
      var _this$props = this.props,
        points = _this$props.points,
        xAxis = _this$props.xAxis,
        yAxis = _this$props.yAxis,
        layout = _this$props.layout,
        children = _this$props.children;
      var errorBarItems = findAllByType(children, ErrorBar);
      if (!errorBarItems) {
        return null;
      }
      var dataPointFormatter = function dataPointFormatter(dataPoint, dataKey) {
        return {
          x: dataPoint.x,
          y: dataPoint.y,
          value: dataPoint.value,
          errorVal: getValueByDataKey(dataPoint.payload, dataKey)
        };
      };
      var errorBarProps = {
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null
      };
      return /*#__PURE__*/React.createElement(Layer, errorBarProps, errorBarItems.map(function (item) {
        return /*#__PURE__*/React.cloneElement(item, {
          key: "bar-".concat(item.props.dataKey),
          data: points,
          xAxis: xAxis,
          yAxis: yAxis,
          layout: layout,
          dataPointFormatter: dataPointFormatter
        });
      }));
    }
  }, {
    key: "renderDots",
    value: function renderDots(needClip, clipDot, clipPathId) {
      var isAnimationActive = this.props.isAnimationActive;
      if (isAnimationActive && !this.state.isAnimationFinished) {
        return null;
      }
      var _this$props2 = this.props,
        dot = _this$props2.dot,
        points = _this$props2.points,
        dataKey = _this$props2.dataKey;
      var lineProps = filterProps(this.props, false);
      var customDotProps = filterProps(dot, true);
      var dots = points.map(function (entry, i) {
        var dotProps = _objectSpread(_objectSpread(_objectSpread({
          key: "dot-".concat(i),
          r: 3
        }, lineProps), customDotProps), {}, {
          value: entry.value,
          dataKey: dataKey,
          cx: entry.x,
          cy: entry.y,
          index: i,
          payload: entry.payload
        });
        return Line.renderDotItem(dot, dotProps);
      });
      var dotsProps = {
        clipPath: needClip ? "url(#clipPath-".concat(clipDot ? '' : 'dots-').concat(clipPathId, ")") : null
      };
      return /*#__PURE__*/React.createElement(Layer, _extends({
        className: "recharts-line-dots",
        key: "dots"
      }, dotsProps), dots);
    }
  }, {
    key: "renderCurveStatically",
    value: function renderCurveStatically(points, needClip, clipPathId, props) {
      var _this$props3 = this.props,
        type = _this$props3.type,
        layout = _this$props3.layout,
        connectNulls = _this$props3.connectNulls;
        _this$props3.ref;
        var others = _objectWithoutProperties(_this$props3, _excluded);
      var curveProps = _objectSpread(_objectSpread(_objectSpread({}, filterProps(others, true)), {}, {
        fill: 'none',
        className: 'recharts-line-curve',
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null,
        points: points
      }, props), {}, {
        type: type,
        layout: layout,
        connectNulls: connectNulls
      });
      return /*#__PURE__*/React.createElement(Curve, _extends({}, curveProps, {
        pathRef: this.pathRef
      }));
    }
  }, {
    key: "renderCurveWithAnimation",
    value: function renderCurveWithAnimation(needClip, clipPathId) {
      var _this2 = this;
      var _this$props4 = this.props,
        points = _this$props4.points,
        strokeDasharray = _this$props4.strokeDasharray,
        isAnimationActive = _this$props4.isAnimationActive,
        animationBegin = _this$props4.animationBegin,
        animationDuration = _this$props4.animationDuration,
        animationEasing = _this$props4.animationEasing,
        animationId = _this$props4.animationId,
        animateNewValues = _this$props4.animateNewValues,
        width = _this$props4.width,
        height = _this$props4.height;
      var _this$state = this.state,
        prevPoints = _this$state.prevPoints,
        totalLength = _this$state.totalLength;
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
        key: "line-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function (_ref) {
        var t = _ref.t;
        if (prevPoints) {
          var prevPointsDiffFactor = prevPoints.length / points.length;
          var stepData = points.map(function (entry, index) {
            var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
            if (prevPoints[prevPointIndex]) {
              var prev = prevPoints[prevPointIndex];
              var interpolatorX = interpolateNumber(prev.x, entry.x);
              var interpolatorY = interpolateNumber(prev.y, entry.y);
              return _objectSpread(_objectSpread({}, entry), {}, {
                x: interpolatorX(t),
                y: interpolatorY(t)
              });
            }

            // magic number of faking previous x and y location
            if (animateNewValues) {
              var _interpolatorX = interpolateNumber(width * 2, entry.x);
              var _interpolatorY = interpolateNumber(height / 2, entry.y);
              return _objectSpread(_objectSpread({}, entry), {}, {
                x: _interpolatorX(t),
                y: _interpolatorY(t)
              });
            }
            return _objectSpread(_objectSpread({}, entry), {}, {
              x: entry.x,
              y: entry.y
            });
          });
          return _this2.renderCurveStatically(stepData, needClip, clipPathId);
        }
        var interpolator = interpolateNumber(0, totalLength);
        var curLength = interpolator(t);
        var currentStrokeDasharray;
        if (strokeDasharray) {
          var lines = "".concat(strokeDasharray).split(/[,\s]+/gim).map(function (num) {
            return parseFloat(num);
          });
          currentStrokeDasharray = _this2.getStrokeDasharray(curLength, totalLength, lines);
        } else {
          currentStrokeDasharray = _this2.generateSimpleStrokeDasharray(totalLength, curLength);
        }
        return _this2.renderCurveStatically(points, needClip, clipPathId, {
          strokeDasharray: currentStrokeDasharray
        });
      });
    }
  }, {
    key: "renderCurve",
    value: function renderCurve(needClip, clipPathId) {
      var _this$props5 = this.props,
        points = _this$props5.points,
        isAnimationActive = _this$props5.isAnimationActive;
      var _this$state2 = this.state,
        prevPoints = _this$state2.prevPoints,
        totalLength = _this$state2.totalLength;
      if (isAnimationActive && points && points.length && (!prevPoints && totalLength > 0 || !isEqual(prevPoints, points))) {
        return this.renderCurveWithAnimation(needClip, clipPathId);
      }
      return this.renderCurveStatically(points, needClip, clipPathId);
    }
  }, {
    key: "render",
    value: function render() {
      var _filterProps;
      var _this$props6 = this.props,
        hide = _this$props6.hide,
        dot = _this$props6.dot,
        points = _this$props6.points,
        className = _this$props6.className,
        xAxis = _this$props6.xAxis,
        yAxis = _this$props6.yAxis,
        top = _this$props6.top,
        left = _this$props6.left,
        width = _this$props6.width,
        height = _this$props6.height,
        isAnimationActive = _this$props6.isAnimationActive,
        id = _this$props6.id;
      if (hide || !points || !points.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var hasSinglePoint = points.length === 1;
      var layerClass = clsx('recharts-line', className);
      var needClipX = xAxis && xAxis.allowDataOverflow;
      var needClipY = yAxis && yAxis.allowDataOverflow;
      var needClip = needClipX || needClipY;
      var clipPathId = isNil(id) ? this.id : id;
      var _ref2 = (_filterProps = filterProps(dot, false)) !== null && _filterProps !== void 0 ? _filterProps : {
          r: 3,
          strokeWidth: 2
        },
        _ref2$r = _ref2.r,
        r = _ref2$r === void 0 ? 3 : _ref2$r,
        _ref2$strokeWidth = _ref2.strokeWidth,
        strokeWidth = _ref2$strokeWidth === void 0 ? 2 : _ref2$strokeWidth;
      var _ref3 = hasClipDot(dot) ? dot : {},
        _ref3$clipDot = _ref3.clipDot,
        clipDot = _ref3$clipDot === void 0 ? true : _ref3$clipDot;
      var dotSize = r * 2 + strokeWidth;
      return /*#__PURE__*/React.createElement(Layer, {
        className: layerClass
      }, needClipX || needClipY ? /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
        id: "clipPath-".concat(clipPathId)
      }, /*#__PURE__*/React.createElement("rect", {
        x: needClipX ? left : left - width / 2,
        y: needClipY ? top : top - height / 2,
        width: needClipX ? width : width * 2,
        height: needClipY ? height : height * 2
      })), !clipDot && /*#__PURE__*/React.createElement("clipPath", {
        id: "clipPath-dots-".concat(clipPathId)
      }, /*#__PURE__*/React.createElement("rect", {
        x: left - dotSize / 2,
        y: top - dotSize / 2,
        width: width + dotSize,
        height: height + dotSize
      }))) : null, !hasSinglePoint && this.renderCurve(needClip, clipPathId), this.renderErrorBar(needClip, clipPathId), (hasSinglePoint || dot) && this.renderDots(needClip, clipDot, clipPathId), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curPoints: nextProps.points,
          prevPoints: prevState.curPoints
        };
      }
      if (nextProps.points !== prevState.curPoints) {
        return {
          curPoints: nextProps.points
        };
      }
      return null;
    }
  }, {
    key: "repeat",
    value: function repeat(lines, count) {
      var linesUnit = lines.length % 2 !== 0 ? [].concat(_toConsumableArray(lines), [0]) : lines;
      var result = [];
      for (var i = 0; i < count; ++i) {
        result = [].concat(_toConsumableArray(result), _toConsumableArray(linesUnit));
      }
      return result;
    }
  }, {
    key: "renderDotItem",
    value: function renderDotItem(option, props) {
      var dotItem;
      if ( /*#__PURE__*/React.isValidElement(option)) {
        dotItem = /*#__PURE__*/React.cloneElement(option, props);
      } else if (isFunction(option)) {
        dotItem = option(props);
      } else {
        var key = props.key,
          dotProps = _objectWithoutProperties(props, _excluded2);
        var className = clsx('recharts-line-dot', typeof option !== 'boolean' ? option.className : '');
        dotItem = /*#__PURE__*/React.createElement(Dot, _extends({
          key: key
        }, dotProps, {
          className: className
        }));
      }
      return dotItem;
    }
  }]);
}(PureComponent);
_defineProperty(Line, "displayName", 'Line');
_defineProperty(Line, "defaultProps", {
  xAxisId: 0,
  yAxisId: 0,
  connectNulls: false,
  activeDot: true,
  dot: true,
  legendType: 'line',
  stroke: '#3182bd',
  strokeWidth: 1,
  fill: '#fff',
  points: [],
  isAnimationActive: !Global.isSsr,
  animateNewValues: true,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  hide: false,
  label: false
});
/**
 * Compose the data of each group
 * @param {Object} props The props from the component
 * @param  {Object} xAxis   The configuration of x-axis
 * @param  {Object} yAxis   The configuration of y-axis
 * @param  {String} dataKey The unique key of a group
 * @return {Array}  Composed data
 */
_defineProperty(Line, "getComposedData", function (_ref4) {
  var props = _ref4.props,
    xAxis = _ref4.xAxis,
    yAxis = _ref4.yAxis,
    xAxisTicks = _ref4.xAxisTicks,
    yAxisTicks = _ref4.yAxisTicks,
    dataKey = _ref4.dataKey,
    bandSize = _ref4.bandSize,
    displayedData = _ref4.displayedData,
    offset = _ref4.offset;
  var layout = props.layout;
  var points = displayedData.map(function (entry, index) {
    var value = getValueByDataKey(entry, dataKey);
    if (layout === 'horizontal') {
      return {
        x: getCateCoordinateOfLine({
          axis: xAxis,
          ticks: xAxisTicks,
          bandSize: bandSize,
          entry: entry,
          index: index
        }),
        y: isNil(value) ? null : yAxis.scale(value),
        value: value,
        payload: entry
      };
    }
    return {
      x: isNil(value) ? null : xAxis.scale(value),
      y: getCateCoordinateOfLine({
        axis: yAxis,
        ticks: yAxisTicks,
        bandSize: bandSize,
        entry: entry,
        index: index
      }),
      value: value,
      payload: entry
    };
  });
  return _objectSpread({
    points: points,
    layout: layout
  }, offset);
});

/**
 * @fileOverview Line Chart
 */
var LineChart = generateCategoricalChart({
  chartName: 'LineChart',
  GraphicalChild: Line,
  axisComponents: [{
    axisType: 'xAxis',
    AxisComp: XAxis
  }, {
    axisType: 'yAxis',
    AxisComp: YAxis
  }],
  formatAxisMap: formatAxisMap
});

const {useEffect,useState} = await importShared('react');
const Progress = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(
    []
  );
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!session)
        return;
      setLoading(true);
      setError(null);
      try {
        const data = await missionFreshApiClient.getProgressData(session);
        setProgressData(data);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError(
          "We are currently setting up progress tracking. This feature will be available soon."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [session]);
  if (!session) {
    return null;
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[400px] w-full" }) }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "flex flex-col items-center justify-center h-[400px] text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            { className: "text-amber-600 mb-2", children: "⚠️ Progress Tracking Coming Soon" }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 max-w-md", children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            { className: "text-gray-400 text-sm mt-4", children: "Your progress data will automatically appear here once the setup is complete." }
          )
        ] }
      ) }
    );
  }
  if (progressData.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "flex flex-col items-center justify-center h-[400px] text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 mb-2", children: "No progress data available yet." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            { className: "text-gray-400 text-sm", children: "Start tracking your quit journey to see your progress chart here." }
          )
        ] }
      ) }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-6", children: "Your Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        { className: "h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ResponsiveContainer,
          { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            LineChart,
            { data: progressData, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Line,
                {
                  yAxisId: "left",
                  type: "monotone",
                  dataKey: "cigarettes_avoided",
                  stroke: "#8884d8",
                  name: "Cigarettes Avoided"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Line,
                {
                  yAxisId: "left",
                  type: "monotone",
                  dataKey: "money_saved",
                  stroke: "#82ca9d",
                  name: "Money Saved ($)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Line,
                {
                  yAxisId: "right",
                  type: "monotone",
                  dataKey: "health_score",
                  stroke: "#ffc658",
                  name: "Health Score"
                }
              )
            ] }
          ) }
        ) }
      )
    ] }
  );
};

export { Progress, Skeleton as S, missionFreshApiClient as m };
