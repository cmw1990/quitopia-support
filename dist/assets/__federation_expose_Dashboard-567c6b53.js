import { importShared } from './__federation_fn_import-078a81cf.js';
import { t as jsxRuntimeExports, c as createLucideIcon, j as jsxDevRuntimeExports, a as cn, z as motion, C as Card, d as CardHeader, e as CardTitle, q as CardDescription, f as CardContent, p as CardFooter, B as Button, L as Label, J as Jt } from './proxy-0fb2bf4b.js';
import { h as getUserProgress, i as getHealthImprovements, m as shareProgressToSocial } from './missionFreshApiClient-4a1b4bf0.js';
import { P as Progress, R as RadioGroup, c as RadioGroupItem, l as SmokeFreeCounter } from './smoke-free-counter-a4ff4a5c.js';
import { B as Badge } from './badge-8ee49acb.js';
import { L as Leaf } from './leaf-0a2c50fb.js';
import { C as Clock } from './clock-5c9b77ac.js';
import { O as constructFrom, V as startOfDay, N as toDate, W as differenceInCalendarDays, Z as millisecondsInHour, _ as millisecondsInMinute, E as format, R as ResponsiveContainer, D as CartesianGrid, X as XAxis, Y as YAxis, y as Tooltip, z as Legend, P as PolarAngleAxis, s as PolarRadiusAxis, B as Bar, q as Cell } from './generateCategoricalChart-f1756715.js';
import { a as getAugmentedNamespace, c as commonjsGlobal } from './index-c8f38012.js';
import { _ as __vitePreload } from './preload-helper-1e3b7978.js';
import { s as subDays, A as Activity, B as BarChart, T as TriangleAlert } from './BarChart-c126de38.js';
import { L as LoaderCircle, S as Smile, D as Droplet } from './smile-ab1dd02f.js';
import { M as Moon, B as BrainCircuit, C as CalendarDays, L as LineChart, a as Line, R as RadarChart, P as PolarGrid, b as Radar, u as useAuth } from './RadarChart-e373fe62.js';
import { Z as Zap } from './zap-7944e79d.js';
import { B as Battery } from './battery-f7580618.js';
import { H as Heart } from './heart-3d8ce19b.js';
import { C as Cigarette } from './cigarette-e53f938f.js';
import { C as Coffee } from './coffee-a68f3c7d.js';

// src/subscribable.ts
var Subscribable = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = this.subscribe.bind(this);
  }
  subscribe(listener) {
    this.listeners.add(listener);
    this.onSubscribe();
    return () => {
      this.listeners.delete(listener);
      this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
};

// src/utils.ts
var isServer = typeof window === "undefined" || "Deno" in globalThis;
function noop$2() {
  return void 0;
}
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function isValidTimeout(value) {
  return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function resolveStaleTime(staleTime, query) {
  return typeof staleTime === "function" ? staleTime(query) : staleTime;
}
function resolveEnabled(enabled, query) {
  return typeof enabled === "function" ? enabled(query) : enabled;
}
function matchQuery(filters, query) {
  const {
    type = "all",
    exact,
    fetchStatus,
    predicate,
    queryKey,
    stale
  } = filters;
  if (queryKey) {
    if (exact) {
      if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) {
        return false;
      }
    } else if (!partialMatchKey(query.queryKey, queryKey)) {
      return false;
    }
  }
  if (type !== "all") {
    const isActive = query.isActive();
    if (type === "active" && !isActive) {
      return false;
    }
    if (type === "inactive" && isActive) {
      return false;
    }
  }
  if (typeof stale === "boolean" && query.isStale() !== stale) {
    return false;
  }
  if (fetchStatus && fetchStatus !== query.state.fetchStatus) {
    return false;
  }
  if (predicate && !predicate(query)) {
    return false;
  }
  return true;
}
function matchMutation(filters, mutation) {
  const { exact, status, predicate, mutationKey } = filters;
  if (mutationKey) {
    if (!mutation.options.mutationKey) {
      return false;
    }
    if (exact) {
      if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) {
        return false;
      }
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
      return false;
    }
  }
  if (status && mutation.state.status !== status) {
    return false;
  }
  if (predicate && !predicate(mutation)) {
    return false;
  }
  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  const hashFn = options?.queryKeyHashFn || hashKey;
  return hashFn(queryKey);
}
function hashKey(queryKey) {
  return JSON.stringify(
    queryKey,
    (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
      result[key] = val[key];
      return result;
    }, {}) : val
  );
}
function partialMatchKey(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    return !Object.keys(b).some((key) => !partialMatchKey(a[key], b[key]));
  }
  return false;
}
function replaceEqualDeep(a, b) {
  if (a === b) {
    return a;
  }
  const array = isPlainArray(a) && isPlainArray(b);
  if (array || isPlainObject(a) && isPlainObject(b)) {
    const aItems = array ? a : Object.keys(a);
    const aSize = aItems.length;
    const bItems = array ? b : Object.keys(b);
    const bSize = bItems.length;
    const copy = array ? [] : {};
    let equalItems = 0;
    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i];
      if ((!array && aItems.includes(key) || array) && a[key] === void 0 && b[key] === void 0) {
        copy[key] = void 0;
        equalItems++;
      } else {
        copy[key] = replaceEqualDeep(a[key], b[key]);
        if (copy[key] === a[key] && a[key] !== void 0) {
          equalItems++;
        }
      }
    }
    return aSize === bSize && equalItems === aSize ? a : copy;
  }
  return b;
}
function shallowEqualObjects(a, b) {
  if (!b || Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
function isPlainArray(value) {
  return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  }
  const ctor = o.constructor;
  if (ctor === void 0) {
    return true;
  }
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  if (Object.getPrototypeOf(o) !== Object.prototype) {
    return false;
  }
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function sleep$1(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
function replaceData(prevData, data, options) {
  if (typeof options.structuralSharing === "function") {
    return options.structuralSharing(prevData, data);
  } else if (options.structuralSharing !== false) {
    {
      try {
        return replaceEqualDeep(prevData, data);
      } catch (error) {
        console.error(
          `Structural sharing requires data to be JSON serializable. To fix this, turn off structuralSharing or return JSON-serializable data from your queryFn. [${options.queryHash}]: ${error}`
        );
      }
    }
    return replaceEqualDeep(prevData, data);
  }
  return data;
}
function addToEnd(items, item, max = 0) {
  const newItems = [...items, item];
  return max && newItems.length > max ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max = 0) {
  const newItems = [item, ...items];
  return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
}
var skipToken = Symbol();
function ensureQueryFn(options, fetchOptions) {
  {
    if (options.queryFn === skipToken) {
      console.error(
        `Attempted to invoke queryFn when set to skipToken. This is likely a configuration error. Query hash: '${options.queryHash}'`
      );
    }
  }
  if (!options.queryFn && fetchOptions?.initialPromise) {
    return () => fetchOptions.initialPromise;
  }
  if (!options.queryFn || options.queryFn === skipToken) {
    return () => Promise.reject(new Error(`Missing queryFn: '${options.queryHash}'`));
  }
  return options.queryFn;
}

// src/focusManager.ts
var FocusManager = class extends Subscribable {
  #focused;
  #cleanup;
  #setup;
  constructor() {
    super();
    this.#setup = (onFocus) => {
      if (!isServer && window.addEventListener) {
        const listener = () => onFocus();
        window.addEventListener("visibilitychange", listener, false);
        return () => {
          window.removeEventListener("visibilitychange", listener);
        };
      }
      return;
    };
  }
  onSubscribe() {
    if (!this.#cleanup) {
      this.setEventListener(this.#setup);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#cleanup?.();
      this.#cleanup = void 0;
    }
  }
  setEventListener(setup) {
    this.#setup = setup;
    this.#cleanup?.();
    this.#cleanup = setup((focused) => {
      if (typeof focused === "boolean") {
        this.setFocused(focused);
      } else {
        this.onFocus();
      }
    });
  }
  setFocused(focused) {
    const changed = this.#focused !== focused;
    if (changed) {
      this.#focused = focused;
      this.onFocus();
    }
  }
  onFocus() {
    const isFocused = this.isFocused();
    this.listeners.forEach((listener) => {
      listener(isFocused);
    });
  }
  isFocused() {
    if (typeof this.#focused === "boolean") {
      return this.#focused;
    }
    return globalThis.document?.visibilityState !== "hidden";
  }
};
var focusManager = new FocusManager();

// src/onlineManager.ts
var OnlineManager = class extends Subscribable {
  #online = true;
  #cleanup;
  #setup;
  constructor() {
    super();
    this.#setup = (onOnline) => {
      if (!isServer && window.addEventListener) {
        const onlineListener = () => onOnline(true);
        const offlineListener = () => onOnline(false);
        window.addEventListener("online", onlineListener, false);
        window.addEventListener("offline", offlineListener, false);
        return () => {
          window.removeEventListener("online", onlineListener);
          window.removeEventListener("offline", offlineListener);
        };
      }
      return;
    };
  }
  onSubscribe() {
    if (!this.#cleanup) {
      this.setEventListener(this.#setup);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#cleanup?.();
      this.#cleanup = void 0;
    }
  }
  setEventListener(setup) {
    this.#setup = setup;
    this.#cleanup?.();
    this.#cleanup = setup(this.setOnline.bind(this));
  }
  setOnline(online) {
    const changed = this.#online !== online;
    if (changed) {
      this.#online = online;
      this.listeners.forEach((listener) => {
        listener(online);
      });
    }
  }
  isOnline() {
    return this.#online;
  }
};
var onlineManager = new OnlineManager();

// src/retryer.ts
function defaultRetryDelay(failureCount) {
  return Math.min(1e3 * 2 ** failureCount, 3e4);
}
function canFetch(networkMode) {
  return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
var CancelledError = class extends Error {
  constructor(options) {
    super("CancelledError");
    this.revert = options?.revert;
    this.silent = options?.silent;
  }
};
function isCancelledError(value) {
  return value instanceof CancelledError;
}
function createRetryer(config) {
  let isRetryCancelled = false;
  let failureCount = 0;
  let isResolved = false;
  let continueFn;
  let promiseResolve;
  let promiseReject;
  const promise = new Promise((outerResolve, outerReject) => {
    promiseResolve = outerResolve;
    promiseReject = outerReject;
  });
  const cancel = (cancelOptions) => {
    if (!isResolved) {
      reject(new CancelledError(cancelOptions));
      config.abort?.();
    }
  };
  const cancelRetry = () => {
    isRetryCancelled = true;
  };
  const continueRetry = () => {
    isRetryCancelled = false;
  };
  const canContinue = () => focusManager.isFocused() && (config.networkMode === "always" || onlineManager.isOnline()) && config.canRun();
  const canStart = () => canFetch(config.networkMode) && config.canRun();
  const resolve = (value) => {
    if (!isResolved) {
      isResolved = true;
      config.onSuccess?.(value);
      continueFn?.();
      promiseResolve(value);
    }
  };
  const reject = (value) => {
    if (!isResolved) {
      isResolved = true;
      config.onError?.(value);
      continueFn?.();
      promiseReject(value);
    }
  };
  const pause = () => {
    return new Promise((continueResolve) => {
      continueFn = (value) => {
        if (isResolved || canContinue()) {
          continueResolve(value);
        }
      };
      config.onPause?.();
    }).then(() => {
      continueFn = void 0;
      if (!isResolved) {
        config.onContinue?.();
      }
    });
  };
  const run = () => {
    if (isResolved) {
      return;
    }
    let promiseOrValue;
    const initialPromise = failureCount === 0 ? config.initialPromise : void 0;
    try {
      promiseOrValue = initialPromise ?? config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    }
    Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
      if (isResolved) {
        return;
      }
      const retry = config.retry ?? (isServer ? 0 : 3);
      const retryDelay = config.retryDelay ?? defaultRetryDelay;
      const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
      const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
      if (isRetryCancelled || !shouldRetry) {
        reject(error);
        return;
      }
      failureCount++;
      config.onFail?.(failureCount, error);
      sleep$1(delay).then(() => {
        return canContinue() ? void 0 : pause();
      }).then(() => {
        if (isRetryCancelled) {
          reject(error);
        } else {
          run();
        }
      });
    });
  };
  return {
    promise,
    cancel,
    continue: () => {
      continueFn?.();
      return promise;
    },
    cancelRetry,
    continueRetry,
    canStart,
    start: () => {
      if (canStart()) {
        run();
      } else {
        pause().then(run);
      }
      return promise;
    }
  };
}

// src/notifyManager.ts
function createNotifyManager() {
  let queue = [];
  let transactions = 0;
  let notifyFn = (callback) => {
    callback();
  };
  let batchNotifyFn = (callback) => {
    callback();
  };
  let scheduleFn = (cb) => setTimeout(cb, 0);
  const schedule = (callback) => {
    if (transactions) {
      queue.push(callback);
    } else {
      scheduleFn(() => {
        notifyFn(callback);
      });
    }
  };
  const flush = () => {
    const originalQueue = queue;
    queue = [];
    if (originalQueue.length) {
      scheduleFn(() => {
        batchNotifyFn(() => {
          originalQueue.forEach((callback) => {
            notifyFn(callback);
          });
        });
      });
    }
  };
  return {
    batch: (callback) => {
      let result;
      transactions++;
      try {
        result = callback();
      } finally {
        transactions--;
        if (!transactions) {
          flush();
        }
      }
      return result;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (callback) => {
      return (...args) => {
        schedule(() => {
          callback(...args);
        });
      };
    },
    schedule,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (fn) => {
      notifyFn = fn;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (fn) => {
      batchNotifyFn = fn;
    },
    setScheduler: (fn) => {
      scheduleFn = fn;
    }
  };
}
var notifyManager = createNotifyManager();

// src/removable.ts
var Removable = class {
  #gcTimeout;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout();
    if (isValidTimeout(this.gcTime)) {
      this.#gcTimeout = setTimeout(() => {
        this.optionalRemove();
      }, this.gcTime);
    }
  }
  updateGcTime(newGcTime) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      newGcTime ?? (isServer ? Infinity : 5 * 60 * 1e3)
    );
  }
  clearGcTimeout() {
    if (this.#gcTimeout) {
      clearTimeout(this.#gcTimeout);
      this.#gcTimeout = void 0;
    }
  }
};

// src/query.ts
var Query = class extends Removable {
  #initialState;
  #revertState;
  #cache;
  #retryer;
  #defaultOptions;
  #abortSignalConsumed;
  constructor(config) {
    super();
    this.#abortSignalConsumed = false;
    this.#defaultOptions = config.defaultOptions;
    this.setOptions(config.options);
    this.observers = [];
    this.#cache = config.cache;
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
    this.#initialState = getDefaultState(this.options);
    this.state = config.state ?? this.#initialState;
    this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  get promise() {
    return this.#retryer?.promise;
  }
  setOptions(options) {
    this.options = { ...this.#defaultOptions, ...options };
    this.updateGcTime(this.options.gcTime);
  }
  optionalRemove() {
    if (!this.observers.length && this.state.fetchStatus === "idle") {
      this.#cache.remove(this);
    }
  }
  setData(newData, options) {
    const data = replaceData(this.state.data, newData, this.options);
    this.#dispatch({
      data,
      type: "success",
      dataUpdatedAt: options?.updatedAt,
      manual: options?.manual
    });
    return data;
  }
  setState(state, setStateOptions) {
    this.#dispatch({ type: "setState", state, setStateOptions });
  }
  cancel(options) {
    const promise = this.#retryer?.promise;
    this.#retryer?.cancel(options);
    return promise ? promise.then(noop$2).catch(noop$2) : Promise.resolve();
  }
  destroy() {
    super.destroy();
    this.cancel({ silent: true });
  }
  reset() {
    this.destroy();
    this.setState(this.#initialState);
  }
  isActive() {
    return this.observers.some(
      (observer) => resolveEnabled(observer.options.enabled, this) !== false
    );
  }
  isDisabled() {
    return this.getObserversCount() > 0 && !this.isActive();
  }
  isStale() {
    if (this.state.isInvalidated) {
      return true;
    }
    if (this.getObserversCount() > 0) {
      return this.observers.some(
        (observer) => observer.getCurrentResult().isStale
      );
    }
    return this.state.data === void 0;
  }
  isStaleByTime(staleTime = 0) {
    return this.state.isInvalidated || this.state.data === void 0 || !timeUntilStale(this.state.dataUpdatedAt, staleTime);
  }
  onFocus() {
    const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus());
    observer?.refetch({ cancelRefetch: false });
    this.#retryer?.continue();
  }
  onOnline() {
    const observer = this.observers.find((x) => x.shouldFetchOnReconnect());
    observer?.refetch({ cancelRefetch: false });
    this.#retryer?.continue();
  }
  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      this.clearGcTimeout();
      this.#cache.notify({ type: "observerAdded", query: this, observer });
    }
  }
  removeObserver(observer) {
    if (this.observers.includes(observer)) {
      this.observers = this.observers.filter((x) => x !== observer);
      if (!this.observers.length) {
        if (this.#retryer) {
          if (this.#abortSignalConsumed) {
            this.#retryer.cancel({ revert: true });
          } else {
            this.#retryer.cancelRetry();
          }
        }
        this.scheduleGc();
      }
      this.#cache.notify({ type: "observerRemoved", query: this, observer });
    }
  }
  getObserversCount() {
    return this.observers.length;
  }
  invalidate() {
    if (!this.state.isInvalidated) {
      this.#dispatch({ type: "invalidate" });
    }
  }
  fetch(options, fetchOptions) {
    if (this.state.fetchStatus !== "idle") {
      if (this.state.data !== void 0 && fetchOptions?.cancelRefetch) {
        this.cancel({ silent: true });
      } else if (this.#retryer) {
        this.#retryer.continueRetry();
        return this.#retryer.promise;
      }
    }
    if (options) {
      this.setOptions(options);
    }
    if (!this.options.queryFn) {
      const observer = this.observers.find((x) => x.options.queryFn);
      if (observer) {
        this.setOptions(observer.options);
      }
    }
    {
      if (!Array.isArray(this.options.queryKey)) {
        console.error(
          `As of v4, queryKey needs to be an Array. If you are using a string like 'repoData', please change it to an Array, e.g. ['repoData']`
        );
      }
    }
    const abortController = new AbortController();
    const addSignalProperty = (object) => {
      Object.defineProperty(object, "signal", {
        enumerable: true,
        get: () => {
          this.#abortSignalConsumed = true;
          return abortController.signal;
        }
      });
    };
    const fetchFn = () => {
      const queryFn = ensureQueryFn(this.options, fetchOptions);
      const queryFnContext = {
        queryKey: this.queryKey,
        meta: this.meta
      };
      addSignalProperty(queryFnContext);
      this.#abortSignalConsumed = false;
      if (this.options.persister) {
        return this.options.persister(
          queryFn,
          queryFnContext,
          this
        );
      }
      return queryFn(queryFnContext);
    };
    const context = {
      fetchOptions,
      options: this.options,
      queryKey: this.queryKey,
      state: this.state,
      fetchFn
    };
    addSignalProperty(context);
    this.options.behavior?.onFetch(
      context,
      this
    );
    this.#revertState = this.state;
    if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== context.fetchOptions?.meta) {
      this.#dispatch({ type: "fetch", meta: context.fetchOptions?.meta });
    }
    const onError = (error) => {
      if (!(isCancelledError(error) && error.silent)) {
        this.#dispatch({
          type: "error",
          error
        });
      }
      if (!isCancelledError(error)) {
        this.#cache.config.onError?.(
          error,
          this
        );
        this.#cache.config.onSettled?.(
          this.state.data,
          error,
          this
        );
      }
      if (!this.isFetchingOptimistic) {
        this.scheduleGc();
      }
      this.isFetchingOptimistic = false;
    };
    this.#retryer = createRetryer({
      initialPromise: fetchOptions?.initialPromise,
      fn: context.fetchFn,
      abort: abortController.abort.bind(abortController),
      onSuccess: (data) => {
        if (data === void 0) {
          {
            console.error(
              `Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ${this.queryHash}`
            );
          }
          onError(new Error(`${this.queryHash} data is undefined`));
          return;
        }
        try {
          this.setData(data);
        } catch (error) {
          onError(error);
          return;
        }
        this.#cache.config.onSuccess?.(data, this);
        this.#cache.config.onSettled?.(
          data,
          this.state.error,
          this
        );
        if (!this.isFetchingOptimistic) {
          this.scheduleGc();
        }
        this.isFetchingOptimistic = false;
      },
      onError,
      onFail: (failureCount, error) => {
        this.#dispatch({ type: "failed", failureCount, error });
      },
      onPause: () => {
        this.#dispatch({ type: "pause" });
      },
      onContinue: () => {
        this.#dispatch({ type: "continue" });
      },
      retry: context.options.retry,
      retryDelay: context.options.retryDelay,
      networkMode: context.options.networkMode,
      canRun: () => true
    });
    return this.#retryer.start();
  }
  #dispatch(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            fetchFailureCount: action.failureCount,
            fetchFailureReason: action.error
          };
        case "pause":
          return {
            ...state,
            fetchStatus: "paused"
          };
        case "continue":
          return {
            ...state,
            fetchStatus: "fetching"
          };
        case "fetch":
          return {
            ...state,
            ...fetchState(state.data, this.options),
            fetchMeta: action.meta ?? null
          };
        case "success":
          return {
            ...state,
            data: action.data,
            dataUpdateCount: state.dataUpdateCount + 1,
            dataUpdatedAt: action.dataUpdatedAt ?? Date.now(),
            error: null,
            isInvalidated: false,
            status: "success",
            ...!action.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null
            }
          };
        case "error":
          const error = action.error;
          if (isCancelledError(error) && error.revert && this.#revertState) {
            return { ...this.#revertState, fetchStatus: "idle" };
          }
          return {
            ...state,
            error,
            errorUpdateCount: state.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: state.fetchFailureCount + 1,
            fetchFailureReason: error,
            fetchStatus: "idle",
            status: "error"
          };
        case "invalidate":
          return {
            ...state,
            isInvalidated: true
          };
        case "setState":
          return {
            ...state,
            ...action.state
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.observers.forEach((observer) => {
        observer.onQueryUpdate();
      });
      this.#cache.notify({ query: this, type: "updated", action });
    });
  }
};
function fetchState(data, options) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
    ...data === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function getDefaultState(options) {
  const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
  const hasData = data !== void 0;
  const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
  return {
    data,
    dataUpdateCount: 0,
    dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: false,
    status: hasData ? "success" : "pending",
    fetchStatus: "idle"
  };
}

// src/queryObserver.ts
var QueryObserver = class extends Subscribable {
  constructor(client, options) {
    super();
    this.options = options;
    this.#client = client;
    this.#selectError = null;
    this.bindMethods();
    this.setOptions(options);
  }
  #client;
  #currentQuery = void 0;
  #currentQueryInitialState = void 0;
  #currentResult = void 0;
  #currentResultState;
  #currentResultOptions;
  #selectError;
  #selectFn;
  #selectResult;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #lastQueryWithDefinedData;
  #staleTimeoutId;
  #refetchIntervalId;
  #currentRefetchInterval;
  #trackedProps = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.#currentQuery.addObserver(this);
      if (shouldFetchOnMount(this.#currentQuery, this.options)) {
        this.#executeFetch();
      } else {
        this.updateResult();
      }
      this.#updateTimers();
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.#clearStaleTimeout();
    this.#clearRefetchInterval();
    this.#currentQuery.removeObserver(this);
  }
  setOptions(options, notifyOptions) {
    const prevOptions = this.options;
    const prevQuery = this.#currentQuery;
    this.options = this.#client.defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, this.#currentQuery) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    this.#updateQuery();
    this.#currentQuery.setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: this.#currentQuery,
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      this.#currentQuery,
      prevQuery,
      this.options,
      prevOptions
    )) {
      this.#executeFetch();
    }
    this.updateResult(notifyOptions);
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || resolveStaleTime(this.options.staleTime, this.#currentQuery) !== resolveStaleTime(prevOptions.staleTime, this.#currentQuery))) {
      this.#updateStaleTimeout();
    }
    const nextRefetchInterval = this.#computeRefetchInterval();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) {
      this.#updateRefetchInterval(nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = this.#client.getQueryCache().build(this.#client, options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      this.#currentResult = result;
      this.#currentResultOptions = this.options;
      this.#currentResultState = this.#currentQuery.state;
    }
    return result;
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  trackResult(result, onPropTracked) {
    const trackedResult = {};
    Object.keys(result).forEach((key) => {
      Object.defineProperty(trackedResult, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          this.trackProp(key);
          onPropTracked?.(key);
          return result[key];
        }
      });
    });
    return trackedResult;
  }
  trackProp(key) {
    this.#trackedProps.add(key);
  }
  getCurrentQuery() {
    return this.#currentQuery;
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = this.#client.defaultQueryOptions(options);
    const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
    query.isFetchingOptimistic = true;
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return this.#executeFetch({
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return this.#currentResult;
    });
  }
  #executeFetch(fetchOptions) {
    this.#updateQuery();
    let promise = this.#currentQuery.fetch(
      this.options,
      fetchOptions
    );
    if (!fetchOptions?.throwOnError) {
      promise = promise.catch(noop$2);
    }
    return promise;
  }
  #updateStaleTimeout() {
    this.#clearStaleTimeout();
    const staleTime = resolveStaleTime(
      this.options.staleTime,
      this.#currentQuery
    );
    if (isServer || this.#currentResult.isStale || !isValidTimeout(staleTime)) {
      return;
    }
    const time = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime);
    const timeout = time + 1;
    this.#staleTimeoutId = setTimeout(() => {
      if (!this.#currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }
  #computeRefetchInterval() {
    return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
  }
  #updateRefetchInterval(nextInterval) {
    this.#clearRefetchInterval();
    this.#currentRefetchInterval = nextInterval;
    if (isServer || resolveEnabled(this.options.enabled, this.#currentQuery) === false || !isValidTimeout(this.#currentRefetchInterval) || this.#currentRefetchInterval === 0) {
      return;
    }
    this.#refetchIntervalId = setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.#executeFetch();
      }
    }, this.#currentRefetchInterval);
  }
  #updateTimers() {
    this.#updateStaleTimeout();
    this.#updateRefetchInterval(this.#computeRefetchInterval());
  }
  #clearStaleTimeout() {
    if (this.#staleTimeoutId) {
      clearTimeout(this.#staleTimeoutId);
      this.#staleTimeoutId = void 0;
    }
  }
  #clearRefetchInterval() {
    if (this.#refetchIntervalId) {
      clearInterval(this.#refetchIntervalId);
      this.#refetchIntervalId = void 0;
    }
  }
  createResult(query, options) {
    const prevQuery = this.#currentQuery;
    const prevOptions = this.options;
    const prevResult = this.#currentResult;
    const prevResultState = this.#currentResultState;
    const prevResultOptions = this.#currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.#currentQueryInitialState;
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    if (options.select && newState.data !== void 0) {
      if (prevResult && newState.data === prevResultState?.data && options.select === this.#selectFn) {
        data = this.#selectResult;
      } else {
        try {
          this.#selectFn = options.select;
          data = options.select(newState.data);
          data = replaceData(prevResult?.data, data, options);
          this.#selectResult = data;
          this.#selectError = null;
        } catch (selectError) {
          this.#selectError = selectError;
        }
      }
    } else {
      data = newState.data;
    }
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
        placeholderData = prevResult.data;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          this.#lastQueryWithDefinedData?.state.data,
          this.#lastQueryWithDefinedData
        ) : options.placeholderData;
        if (options.select && placeholderData !== void 0) {
          try {
            placeholderData = options.select(placeholderData);
            this.#selectError = null;
          } catch (selectError) {
            this.#selectError = selectError;
          }
        }
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult?.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (this.#selectError) {
      error = this.#selectError;
      data = this.#selectResult;
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: newState.dataUpdateCount > 0 || newState.errorUpdateCount > 0,
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch
    };
    return result;
  }
  updateResult(notifyOptions) {
    const prevResult = this.#currentResult;
    const nextResult = this.createResult(this.#currentQuery, this.options);
    this.#currentResultState = this.#currentQuery.state;
    this.#currentResultOptions = this.options;
    if (this.#currentResultState.data !== void 0) {
      this.#lastQueryWithDefinedData = this.#currentQuery;
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    this.#currentResult = nextResult;
    const defaultNotifyOptions = {};
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? this.#trackedProps
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(this.#currentResult).some((key) => {
        const typedKey = key;
        const changed = this.#currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    if (notifyOptions?.listeners !== false && shouldNotifyListeners()) {
      defaultNotifyOptions.listeners = true;
    }
    this.#notify({ ...defaultNotifyOptions, ...notifyOptions });
  }
  #updateQuery() {
    const query = this.#client.getQueryCache().build(this.#client, this.options);
    if (query === this.#currentQuery) {
      return;
    }
    const prevQuery = this.#currentQuery;
    this.#currentQuery = query;
    this.#currentQueryInitialState = query.state;
    if (this.hasListeners()) {
      prevQuery?.removeObserver(this);
      query.addObserver(this);
    }
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      this.#updateTimers();
    }
  }
  #notify(notifyOptions) {
    notifyManager.batch(() => {
      if (notifyOptions.listeners) {
        this.listeners.forEach((listener) => {
          listener(this.#currentResult);
        });
      }
      this.#client.getQueryCache().notify({
        query: this.#currentQuery,
        type: "observerResultsUpdated"
      });
    });
  }
};
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false) {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}

// src/QueryClientProvider.tsx
const React$6 = await importShared('react');
var QueryClientContext = React$6.createContext(
  void 0
);
var useQueryClient = (queryClient) => {
  const client = React$6.useContext(QueryClientContext);
  if (queryClient) {
    return queryClient;
  }
  if (!client) {
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  }
  return client;
};
var QueryClientProvider = ({
  client,
  children
}) => {
  React$6.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientContext.Provider, { value: client, children });
};

// src/isRestoring.ts
const React$5 = await importShared('react');

var IsRestoringContext = React$5.createContext(false);
var useIsRestoring = () => React$5.useContext(IsRestoringContext);
IsRestoringContext.Provider;

// src/QueryErrorResetBoundary.tsx
const React$4 = await importShared('react');
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = React$4.createContext(createValue());
var useQueryErrorResetBoundary = () => React$4.useContext(QueryErrorResetBoundaryContext);

// src/utils.ts
function shouldThrowError(throwError, params) {
  if (typeof throwError === "function") {
    return throwError(...params);
  }
  return !!throwError;
}

// src/errorBoundaryUtils.ts
const React$3 = await importShared('react');
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary) => {
  if (options.suspense || options.throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  React$3.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && shouldThrowError(throwOnError, [result.error, query]);
};

// src/suspense.ts
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    if (typeof defaultedOptions.staleTime !== "number") {
      defaultedOptions.staleTime = 1e3;
    }
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(defaultedOptions.gcTime, 1e3);
    }
  }
};
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});

// src/useBaseQuery.ts
const React$2 = await importShared('react');
function useBaseQuery(options, Observer, queryClient) {
  {
    if (typeof options !== "object" || Array.isArray(options)) {
      throw new Error(
        'Bad argument type. Starting with v5, only the "Object" form is allowed when calling query related functions. Please use the error stack to find the culprit call. More info here: https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5#supports-a-single-signature-one-object'
      );
    }
  }
  const client = useQueryClient(queryClient);
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedOptions = client.defaultQueryOptions(options);
  client.getDefaultOptions().queries?._experimental_beforeQuery?.(
    defaultedOptions
  );
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary);
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = React$2.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  React$2.useSyncExternalStore(
    React$2.useCallback(
      (onStoreChange) => {
        const unsubscribe = isRestoring ? () => void 0 : observer.subscribe(notifyManager.batchCalls(onStoreChange));
        observer.updateResult();
        return unsubscribe;
      },
      [observer, isRestoring]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  React$2.useEffect(() => {
    observer.setOptions(defaultedOptions, { listeners: false });
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query: client.getQueryCache().get(defaultedOptions.queryHash)
  })) {
    throw result.error;
  }
  client.getDefaultOptions().queries?._experimental_afterQuery?.(
    defaultedOptions,
    result
  );
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}

function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver, queryClient);
}

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const BatteryMedium = createLucideIcon("BatteryMedium", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }],
  ["line", { x1: "6", x2: "6", y1: "11", y2: "13", key: "1wd6dw" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "13", key: "haxvl5" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Brain = createLucideIcon("Brain", [
  [
    "path",
    {
      d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      key: "l5xja"
    }
  ],
  [
    "path",
    {
      d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
      key: "ep3f8r"
    }
  ],
  ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }],
  ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }],
  ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
  ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
  ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }],
  ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
  ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Car = createLucideIcon("Car", [
  [
    "path",
    {
      d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
      key: "5owen"
    }
  ],
  ["circle", { cx: "7", cy: "17", r: "2", key: "u2ysq9" }],
  ["path", { d: "M9 17h6", key: "r8uit2" }],
  ["circle", { cx: "17", cy: "17", r: "2", key: "axvx0g" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChartArea = createLucideIcon("ChartArea", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  [
    "path",
    {
      d: "M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z",
      key: "q0gr47"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChartColumn = createLucideIcon("ChartColumn", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChartLine = createLucideIcon("ChartLine", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "m19 9-5 5-4-4-3 3", key: "2osh9i" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChartNoAxesColumnIncreasing = createLucideIcon("ChartNoAxesColumnIncreasing", [
  ["line", { x1: "12", x2: "12", y1: "20", y2: "10", key: "1vz5eb" }],
  ["line", { x1: "18", x2: "18", y1: "20", y2: "4", key: "cun8e5" }],
  ["line", { x1: "6", x2: "6", y1: "20", y2: "16", key: "hq0ia6" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Factory = createLucideIcon("Factory", [
  [
    "path",
    {
      d: "M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
      key: "159hny"
    }
  ],
  ["path", { d: "M17 18h1", key: "uldtlt" }],
  ["path", { d: "M12 18h1", key: "s9uhes" }],
  ["path", { d: "M7 18h1", key: "1neino" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Info = createLucideIcon("Info", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Lightbulb$1 = createLucideIcon("Lightbulb", [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      key: "1gvzjb"
    }
  ],
  ["path", { d: "M9 18h6", key: "x1upvd" }],
  ["path", { d: "M10 22h4", key: "ceow96" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Medal = createLucideIcon("Medal", [
  [
    "path",
    {
      d: "M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15",
      key: "143lza"
    }
  ],
  ["path", { d: "M11 12 5.12 2.2", key: "qhuxz6" }],
  ["path", { d: "m13 12 5.88-9.8", key: "hbye0f" }],
  ["path", { d: "M8 7h8", key: "i86dvs" }],
  ["circle", { cx: "12", cy: "17", r: "5", key: "qbz8iq" }],
  ["path", { d: "M12 18v-2h-.5", key: "fawc4q" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Wind = createLucideIcon("Wind", [
  ["path", { d: "M12.8 19.6A2 2 0 1 0 14 16H2", key: "148xed" }],
  ["path", { d: "M17.5 8a2.5 2.5 0 1 1 2 4H2", key: "1u4tom" }],
  ["path", { d: "M9.8 4.4A2 2 0 1 1 11 8H2", key: "75valh" }]
]);

const DonutChart = ({
  value,
  maxValue = 100,
  size = 150,
  strokeWidth = 10,
  centerText,
  gradientStart = "#3b82f6",
  gradientEnd = "#2dd4bf",
  bgColor = "#e2e8f0",
  className,
  ...props
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const valuePercentage = Math.min(Math.max(value / maxValue, 0), 1);
  const dashOffset = circumference * (1 - valuePercentage);
  const uniqueId = `donut-gradient-${Math.random().toString(36).substring(2, 9)}`;
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "div",
    {
      className: cn("relative inline-flex items-center justify-center", className),
      style: { width: size, height: size },
      ...props,
      children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("defs", { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("linearGradient", { id: uniqueId, x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("stop", { offset: "0%", stopColor: gradientStart }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
              lineNumber: 43,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("stop", { offset: "100%", stopColor: gradientEnd }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
              lineNumber: 44,
              columnNumber: 13
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
            lineNumber: 42,
            columnNumber: 11
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
            lineNumber: 41,
            columnNumber: 9
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            "circle",
            {
              cx: size / 2,
              cy: size / 2,
              r: radius,
              fill: "none",
              stroke: bgColor,
              strokeWidth
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
              lineNumber: 49,
              columnNumber: 9
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            motion.circle,
            {
              cx: size / 2,
              cy: size / 2,
              r: radius,
              fill: "none",
              stroke: `url(#${uniqueId})`,
              strokeWidth,
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset,
              strokeLinecap: "round",
              transform: `rotate(-90 ${size / 2} ${size / 2})`,
              initial: { strokeDashoffset: circumference },
              animate: { strokeDashoffset: dashOffset },
              transition: { duration: 1, ease: "easeOut" }
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
              lineNumber: 59,
              columnNumber: 9
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
          lineNumber: 40,
          columnNumber: 7
        }, globalThis),
        centerText && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-0 flex items-center justify-center text-center", children: centerText }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
          lineNumber: 78,
          columnNumber: 9
        }, globalThis)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/donut-chart.tsx",
      lineNumber: 35,
      columnNumber: 5
    },
    globalThis
  );
};

const SectionCard = ({
  title,
  description,
  icon,
  footer,
  delay = 0,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  children,
  ...props
}) => {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.4, 0, 0.2, 1]
      },
      className: "h-full",
      children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: cn("h-full border shadow-sm", className), ...props, children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: cn("flex flex-row items-center justify-between gap-4", headerClassName), children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-lg font-medium", children: title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
              lineNumber: 45,
              columnNumber: 13
            }, globalThis),
            description && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
              lineNumber: 46,
              columnNumber: 29
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
            lineNumber: 44,
            columnNumber: 11
          }, globalThis),
          icon && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "rounded-full bg-primary/10 p-2 text-primary", children: icon }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
            lineNumber: 49,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
          lineNumber: 43,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: cn("pt-0", contentClassName), children }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
          lineNumber: 54,
          columnNumber: 9
        }, globalThis),
        footer && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: cn("pt-2", footerClassName), children: footer }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
          lineNumber: 58,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
        lineNumber: 42,
        columnNumber: 7
      }, globalThis)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/section-card.tsx",
      lineNumber: 32,
      columnNumber: 5
    },
    globalThis
  );
};

const HealthImprovementCard = ({
  title,
  description,
  daysRequired,
  daysPassed,
  icon,
  achieved,
  className,
  onClick
}) => {
  const progress = Math.min(Math.round(daysPassed / daysRequired * 100), 100);
  const isImminent = !achieved && progress >= 85 && progress < 100;
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    motion.div,
    {
      whileHover: { y: -5, transition: { duration: 0.2 } },
      className: cn("cursor-pointer", className),
      onClick,
      children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: cn(
        "overflow-hidden border transition-colors",
        achieved ? "bg-green-50 border-green-100" : isImminent ? "bg-amber-50 border-amber-100" : "bg-white"
      ), children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          achieved ? "bg-green-100 text-green-700" : isImminent ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
        ), children: icon }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
          lineNumber: 47,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-sm mb-1", children: title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
              lineNumber: 57,
              columnNumber: 17
            }, globalThis),
            achieved ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: "bg-green-100 text-green-800 border-green-200", children: "Achieved" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
              lineNumber: 59,
              columnNumber: 19
            }, globalThis) : isImminent ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: "bg-amber-100 text-amber-800 border-amber-200", children: "Imminent" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
              lineNumber: 61,
              columnNumber: 19
            }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: "bg-gray-100 text-gray-800 border-gray-200", children: "Upcoming" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
              lineNumber: 63,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
            lineNumber: 56,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 line-clamp-2", children: description }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
            lineNumber: 66,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between text-xs text-gray-500 mb-1", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: `Day ${daysPassed} of ${daysRequired}` }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
                lineNumber: 69,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: `${progress}%` }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
                lineNumber: 70,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
              lineNumber: 68,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Progress,
              {
                value: progress,
                className: cn(
                  "h-2",
                  achieved ? "bg-green-100" : isImminent ? "bg-amber-100" : "bg-blue-100"
                ),
                indicatorClassName: cn(
                  achieved ? "bg-green-500" : isImminent ? "bg-amber-500" : "bg-blue-500"
                )
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
                lineNumber: 72,
                columnNumber: 17
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
            lineNumber: 67,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
          lineNumber: 55,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
        lineNumber: 46,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
        lineNumber: 45,
        columnNumber: 9
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
        lineNumber: 39,
        columnNumber: 7
      }, globalThis)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-improvement-card.tsx",
      lineNumber: 34,
      columnNumber: 5
    },
    globalThis
  );
};

const SavingsCalculator = ({
  quitDate,
  costPerPack,
  packsPerDay,
  savings,
  className
}) => {
  const daysSince = quitDate ? Math.floor(((/* @__PURE__ */ new Date()).getTime() - quitDate.getTime()) / (1e3 * 60 * 60 * 24)) : 0;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  const savingsItems = [
    { label: "Daily", amount: savings.daily, color: "bg-blue-100 text-blue-800" },
    { label: "Weekly", amount: savings.weekly, color: "bg-teal-100 text-teal-800" },
    { label: "Monthly", amount: savings.monthly, color: "bg-indigo-100 text-indigo-800" },
    { label: "Yearly", amount: savings.yearly, color: "bg-violet-100 text-violet-800" }
  ];
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: cn("overflow-hidden", className), children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-sm font-medium mb-1", children: "Money Saved" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
        lineNumber: 53,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-500", children: [
        "Based on ",
        formatCurrency(costPerPack),
        " per pack, ",
        packsPerDay,
        " pack(s) per day"
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
        lineNumber: 54,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
      lineNumber: 52,
      columnNumber: 11
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-500", children: "Total Saved" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
          lineNumber: 61,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-2xl font-semibold text-green-600", children: formatCurrency(savings.total) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
          lineNumber: 62,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
        lineNumber: 60,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        DonutChart,
        {
          value: savings.total,
          maxValue: savings.yearly,
          size: 80,
          strokeWidth: 8,
          gradientStart: "#22c55e",
          gradientEnd: "#15803d",
          centerText: `${daysSince}d`
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
          lineNumber: 64,
          columnNumber: 13
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
      lineNumber: 59,
      columnNumber: 11
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: savingsItems.map((item, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 * index },
        children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "rounded-md p-2", style: { background: item.color.split(" ")[0] }, children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs font-medium mb-1", style: { color: item.color.split(" ")[1] }, children: item.label }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
            lineNumber: 84,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-semibold", style: { color: item.color.split(" ")[1] }, children: formatCurrency(item.amount) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
            lineNumber: 87,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
          lineNumber: 83,
          columnNumber: 17
        }, globalThis)
      },
      item.label,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
        lineNumber: 77,
        columnNumber: 15
      },
      globalThis
    )) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
      lineNumber: 75,
      columnNumber: 11
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
    lineNumber: 51,
    columnNumber: 9
  }, globalThis) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
    lineNumber: 50,
    columnNumber: 7
  }, globalThis) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/savings-calculator.tsx",
    lineNumber: 49,
    columnNumber: 5
  }, globalThis);
};

const HealthMetricsSection = ({
  healthImprovement,
  healthMetrics,
  onViewAllClick
}) => {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    SectionCard,
    {
      title: "Health Metrics Dashboard",
      description: "Real-time indicators of your improving health",
      icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChartColumn, { className: "h-5 w-5" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
        lineNumber: 35,
        columnNumber: 13
      }, globalThis),
      children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-lg mb-3", children: "Recovery Progress" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
            lineNumber: 39,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative inline-flex flex-col items-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              DonutChart,
              {
                value: healthImprovement,
                gradientStart: "#3b82f6",
                gradientEnd: "#10b981",
                size: 180,
                centerText: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold", children: [
                    healthImprovement,
                    "%"
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                    lineNumber: 49,
                    columnNumber: 21
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xs text-gray-500", children: "Recovery" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                    lineNumber: 50,
                    columnNumber: 21
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 48,
                  columnNumber: 19
                }, globalThis)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 42,
                columnNumber: 15
              },
              globalThis
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-3 h-3 rounded-full bg-red-500 mr-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 56,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Heart Rate" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 57,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 55,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-3 h-3 rounded-full bg-blue-500 mr-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 60,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Oxygen" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 61,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 59,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-3 h-3 rounded-full bg-teal-500 mr-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 64,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Lung Function" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 65,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 63,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-3 h-3 rounded-full bg-purple-500 mr-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 68,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Circulation" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 69,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 67,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
              lineNumber: 54,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
            lineNumber: 41,
            columnNumber: 13
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
            lineNumber: 40,
            columnNumber: 11
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
          lineNumber: 38,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-lg mb-3", children: "Key Health Improvements" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
            lineNumber: 77,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: [
            healthMetrics.slice(0, 4).map((metric) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: metric.icon }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 81,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-grow", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-1", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-medium", children: metric.title }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                    lineNumber: 86,
                    columnNumber: 21
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-medium", children: [
                    Math.round(metric.improvement),
                    "%"
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                    lineNumber: 87,
                    columnNumber: 21
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                  lineNumber: 85,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Progress,
                  {
                    value: metric.improvement,
                    className: "h-2",
                    indicatorClassName: metric.improvement > 75 ? "bg-green-500" : metric.improvement > 50 ? "bg-blue-500" : metric.improvement > 25 ? "bg-amber-500" : "bg-red-500"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                    lineNumber: 89,
                    columnNumber: 19
                  },
                  globalThis
                )
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 84,
                columnNumber: 17
              }, globalThis)
            ] }, metric.id, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
              lineNumber: 80,
              columnNumber: 15
            }, globalThis)),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "w-full mt-2 text-primary",
                onClick: onViewAllClick,
                children: "View All Health Metrics"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
                lineNumber: 102,
                columnNumber: 13
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
            lineNumber: 78,
            columnNumber: 11
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
          lineNumber: 76,
          columnNumber: 9
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
        lineNumber: 37,
        columnNumber: 7
      }, globalThis)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/health-metrics-section.tsx",
      lineNumber: 32,
      columnNumber: 5
    },
    globalThis
  );
};

const EnvironmentalImpactSection = ({
  carbonReduction,
  cigarettesAvoided
}) => {
  const CO2Icon = (props) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
      children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M7 13a3 3 0 00-3 3v4h3" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 30,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M14 13a4 4 0 014 4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 31,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M14 17a3 3 0 01-3 3H9" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 32,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M14 9a3 3 0 110 6h-3" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 33,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M3 7V5a2 2 0 012-2h10" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 34,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M17 8a1 1 0 100-2 1 1 0 000 2z" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 35,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M13 5a1 1 0 100-2 1 1 0 000 2z" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 36,
          columnNumber: 7
        }, globalThis)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
      lineNumber: 18,
      columnNumber: 5
    },
    globalThis
  );
  const TreeIcon = (props) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
      children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 22v-7l-2-2" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 54,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M17 8a5 5 0 00-10 0" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 55,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 13a5 5 0 005-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 56,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 13a5 5 0 01-5-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 57,
          columnNumber: 7
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M7 8a7 7 0 0114 0" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 58,
          columnNumber: 7
        }, globalThis)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
      lineNumber: 42,
      columnNumber: 5
    },
    globalThis
  );
  const DropletIcon = (props) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
      children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
        lineNumber: 76,
        columnNumber: 7
      }, globalThis)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
      lineNumber: 64,
      columnNumber: 5
    },
    globalThis
  );
  const co2Kilograms = (carbonReduction / 1e3).toFixed(2);
  const treesEquivalent = Math.floor(carbonReduction / 7e3);
  const waterSaved = (cigarettesAvoided * 3.7).toFixed(1);
  (cigarettesAvoided * 0.01).toFixed(1);
  const landSaved = (cigarettesAvoided / 100 * 1e-4).toFixed(4);
  const toxinsReduced = (cigarettesAvoided * 7).toFixed(0);
  const carKilometersAvoided = (carbonReduction / 170).toFixed(1);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    SectionCard,
    {
      title: "Your Environmental Impact",
      description: "The positive effect your decision has on the planet",
      icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-5 w-5" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
        lineNumber: 95,
        columnNumber: 13
      }, globalThis),
      children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 space-y-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-lg", children: "Carbon Reduction" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 102,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500 text-sm mt-1", children: [
                  "You've prevented ",
                  co2Kilograms,
                  " kg of CO2 emissions"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 103,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 101,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-3 bg-green-100 dark:bg-green-900/30 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CO2Icon, { className: "h-6 w-6 text-green-600 dark:text-green-400" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 108,
                columnNumber: 17
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 107,
                columnNumber: 15
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
              lineNumber: 100,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xs text-gray-500 mb-1 flex justify-between", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "0 kg" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 114,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                  Math.max(5, Math.ceil(parseFloat(co2Kilograms) / 5) * 5),
                  " kg"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 115,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 113,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Progress,
                {
                  value: parseFloat(co2Kilograms) / Math.max(5, Math.ceil(parseFloat(co2Kilograms) / 5) * 5) * 100,
                  className: "h-2",
                  indicatorClassName: "bg-green-500"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 117,
                  columnNumber: 15
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
              lineNumber: 112,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 flex items-center gap-2 text-sm text-gray-600", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Car, { className: "h-4 w-4 text-gray-500" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 125,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: [
                "Equivalent to not driving a car for ",
                carKilometersAvoided,
                " km"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 126,
                columnNumber: 15
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
              lineNumber: 124,
              columnNumber: 13
            }, globalThis),
            carbonReduction > 5e3 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-2 flex items-center gap-2 text-sm text-gray-600", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TreeIcon, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 131,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: [
                "Equivalent to planting ",
                treesEquivalent,
                " ",
                treesEquivalent === 1 ? "tree" : "trees"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 132,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
              lineNumber: 130,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
            lineNumber: 99,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-lg", children: "Time Saved" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 140,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500 text-sm mt-1", children: [
                  "You've reclaimed approximately ",
                  Math.floor(cigarettesAvoided * 5 / 60),
                  " hours"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 141,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 139,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 146,
                columnNumber: 17
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 145,
                columnNumber: 15
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
              lineNumber: 138,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm mt-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "The average cigarette takes 5 minutes to smoke. You've saved:" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 152,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "list-disc list-inside mt-2 space-y-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: [
                  Math.floor(cigarettesAvoided * 5 / 60),
                  " hours"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 154,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: [
                  Math.floor(cigarettesAvoided * 5 / 60 / 24),
                  " days"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 155,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: [
                  "Approximately ",
                  (cigarettesAvoided * 5 / 60 / 168).toFixed(1),
                  " weeks"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 156,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 153,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
              lineNumber: 151,
              columnNumber: 15
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
              lineNumber: 150,
              columnNumber: 13
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
            lineNumber: 137,
            columnNumber: 11
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
          lineNumber: 98,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.3 },
            className: "bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm",
            children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-lg mb-4", children: "Additional Environmental Benefits" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 169,
                columnNumber: 11
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(DropletIcon, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 174,
                    columnNumber: 17
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 173,
                    columnNumber: 15
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: "Water Saved" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 177,
                      columnNumber: 17
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500", children: [
                      waterSaved,
                      " liters"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 178,
                      columnNumber: 17
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-400 mt-1", children: "Each cigarette requires ~3.7L of water to produce" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 179,
                      columnNumber: 17
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 176,
                    columnNumber: 15
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 172,
                  columnNumber: 13
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Factory, { className: "h-5 w-5 text-purple-600 dark:text-purple-400" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 185,
                    columnNumber: 17
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 184,
                    columnNumber: 15
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: "Toxins Reduced" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 188,
                      columnNumber: 17
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500", children: [
                      toxinsReduced,
                      " chemicals"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 189,
                      columnNumber: 17
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-400 mt-1", children: "Cigarettes contain ~7000 harmful chemicals" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 190,
                      columnNumber: 17
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 187,
                    columnNumber: 15
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 183,
                  columnNumber: 13
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-5 w-5 text-emerald-600 dark:text-emerald-400" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 196,
                    columnNumber: 17
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 195,
                    columnNumber: 15
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: "Land Preserved" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 199,
                      columnNumber: 17
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500", children: [
                      landSaved,
                      " hectares"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 200,
                      columnNumber: 17
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-400 mt-1", children: "Tobacco farming contributes to deforestation" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                      lineNumber: 201,
                      columnNumber: 17
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                    lineNumber: 198,
                    columnNumber: 15
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                  lineNumber: 194,
                  columnNumber: 13
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 171,
                columnNumber: 11
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 pt-4 border-t border-gray-100 dark:border-gray-700", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-500", children: "By not smoking, you're helping reduce the environmental impact of tobacco production, which is responsible for deforestation, water pollution, and significant CO2 emissions. Every cigarette not smoked makes a difference." }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 207,
                columnNumber: 13
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
                lineNumber: 206,
                columnNumber: 11
              }, globalThis)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
            lineNumber: 163,
            columnNumber: 9
          },
          globalThis
        )
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
        lineNumber: 97,
        columnNumber: 7
      }, globalThis)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/environmental-impact-section.tsx",
      lineNumber: 92,
      columnNumber: 5
    },
    globalThis
  );
};

/**
 * @name constructNow
 * @category Generic Helpers
 * @summary Constructs a new current date using the passed value constructor.
 * @pure false
 *
 * @description
 * The function constructs a new current date using the constructor from
 * the reference date. It helps to build generic functions that accept date
 * extensions and use the current date.
 *
 * It defaults to `Date` if the passed reference date is a number or a string.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The reference date to take constructor from
 *
 * @returns Current date initialized using the given date constructor
 *
 * @example
 * import { constructNow, isSameDay } from 'date-fns'
 *
 * function isToday<DateType extends Date>(
 *   date: DateType | number | string,
 * ): boolean {
 *   // If we were to use `new Date()` directly, the function would  behave
 *   // differently in different timezones and return false for the same date.
 *   return isSameDay(date, constructNow(date));
 * }
 */
function constructNow(date) {
  return constructFrom(date, Date.now());
}

/**
 * @name isSameDay
 * @category Day Helpers
 * @summary Are the given dates in the same day (and year and month)?
 *
 * @description
 * Are the given dates in the same day (and year and month)?
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param dateLeft - The first date to check
 * @param dateRight - The second date to check

 * @returns The dates are in the same day (and year and month)
 *
 * @example
 * // Are 4 September 06:00:00 and 4 September 18:00:00 in the same day?
 * const result = isSameDay(new Date(2014, 8, 4, 6, 0), new Date(2014, 8, 4, 18, 0))
 * //=> true
 *
 * @example
 * // Are 4 September and 4 October in the same day?
 * const result = isSameDay(new Date(2014, 8, 4), new Date(2014, 9, 4))
 * //=> false
 *
 * @example
 * // Are 4 September, 2014 and 4 September, 2015 in the same day?
 * const result = isSameDay(new Date(2014, 8, 4), new Date(2015, 8, 4))
 * //=> false
 */
function isSameDay(dateLeft, dateRight) {
  const dateLeftStartOfDay = startOfDay(dateLeft);
  const dateRightStartOfDay = startOfDay(dateRight);

  return +dateLeftStartOfDay === +dateRightStartOfDay;
}

/**
 * @name differenceInDays
 * @category Day Helpers
 * @summary Get the number of full days between the given dates.
 *
 * @description
 * Get the number of full day periods between two dates. Fractional days are
 * truncated towards zero.
 *
 * One "full day" is the distance between a local time in one day to the same
 * local time on the next or previous day. A full day can sometimes be less than
 * or more than 24 hours if a daylight savings change happens between two dates.
 *
 * To ignore DST and only measure exact 24-hour periods, use this instead:
 * `Math.trunc(differenceInHours(dateLeft, dateRight)/24)|0`.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param dateLeft - The later date
 * @param dateRight - The earlier date
 *
 * @returns The number of full days according to the local timezone
 *
 * @example
 * // How many full days are between
 * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
 * const result = differenceInDays(
 *   new Date(2012, 6, 2, 0, 0),
 *   new Date(2011, 6, 2, 23, 0)
 * )
 * //=> 365
 *
 * @example
 * // How many full days are between
 * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
 * const result = differenceInDays(
 *   new Date(2011, 6, 3, 0, 1),
 *   new Date(2011, 6, 2, 23, 59)
 * )
 * //=> 0
 *
 * @example
 * // How many full days are between
 * // 1 March 2020 0:00 and 1 June 2020 0:00 ?
 * // Note: because local time is used, the
 * // result will always be 92 days, even in
 * // time zones where DST starts and the
 * // period has only 92*24-1 hours.
 * const result = differenceInDays(
 *   new Date(2020, 5, 1),
 *   new Date(2020, 2, 1)
 * )
 * //=> 92
 */
function differenceInDays(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);

  const sign = compareLocalAsc(_dateLeft, _dateRight);
  const difference = Math.abs(differenceInCalendarDays(_dateLeft, _dateRight));

  _dateLeft.setDate(_dateLeft.getDate() - sign * difference);

  // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
  // If so, result must be decreased by 1 in absolute value
  const isLastDayNotFull = Number(
    compareLocalAsc(_dateLeft, _dateRight) === -sign,
  );
  const result = sign * (difference - isLastDayNotFull);
  // Prevent negative zero
  return result === 0 ? 0 : result;
}

// Like `compareAsc` but uses local time not UTC, which is needed
// for accurate equality comparisons of UTC timestamps that end up
// having the same representation in local time, e.g. one hour before
// DST ends vs. the instant that DST ends.
function compareLocalAsc(dateLeft, dateRight) {
  const diff =
    dateLeft.getFullYear() - dateRight.getFullYear() ||
    dateLeft.getMonth() - dateRight.getMonth() ||
    dateLeft.getDate() - dateRight.getDate() ||
    dateLeft.getHours() - dateRight.getHours() ||
    dateLeft.getMinutes() - dateRight.getMinutes() ||
    dateLeft.getSeconds() - dateRight.getSeconds() ||
    dateLeft.getMilliseconds() - dateRight.getMilliseconds();

  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
    // Return 0 if diff is 0; return NaN if diff is NaN
  } else {
    return diff;
  }
}

function getRoundingMethod(method) {
  return (number) => {
    const round = method ? Math[method] : Math.trunc;
    const result = round(number);
    // Prevent negative zero
    return result === 0 ? 0 : result;
  };
}

/**
 * @name differenceInMilliseconds
 * @category Millisecond Helpers
 * @summary Get the number of milliseconds between the given dates.
 *
 * @description
 * Get the number of milliseconds between the given dates.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param dateLeft - The later date
 * @param dateRight - The earlier date
 *
 * @returns The number of milliseconds
 *
 * @example
 * // How many milliseconds are between
 * // 2 July 2014 12:30:20.600 and 2 July 2014 12:30:21.700?
 * const result = differenceInMilliseconds(
 *   new Date(2014, 6, 2, 12, 30, 21, 700),
 *   new Date(2014, 6, 2, 12, 30, 20, 600)
 * )
 * //=> 1100
 */
function differenceInMilliseconds(dateLeft, dateRight) {
  return +toDate(dateLeft) - +toDate(dateRight);
}

/**
 * The {@link differenceInHours} function options.
 */

/**
 * @name differenceInHours
 * @category Hour Helpers
 * @summary Get the number of hours between the given dates.
 *
 * @description
 * Get the number of hours between the given dates.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param dateLeft - The later date
 * @param dateRight - The earlier date
 * @param options - An object with options.
 *
 * @returns The number of hours
 *
 * @example
 * // How many hours are between 2 July 2014 06:50:00 and 2 July 2014 19:00:00?
 * const result = differenceInHours(
 *   new Date(2014, 6, 2, 19, 0),
 *   new Date(2014, 6, 2, 6, 50)
 * )
 * //=> 12
 */
function differenceInHours(dateLeft, dateRight, options) {
  const diff =
    differenceInMilliseconds(dateLeft, dateRight) / millisecondsInHour;
  return getRoundingMethod(options?.roundingMethod)(diff);
}

/**
 * @name isToday
 * @category Day Helpers
 * @summary Is the given date today?
 * @pure false
 *
 * @description
 * Is the given date today?
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The date to check
 *
 * @returns The date is today
 *
 * @example
 * // If today is 6 October 2014, is 6 October 14:00:00 today?
 * const result = isToday(new Date(2014, 9, 6, 14, 0))
 * //=> true
 */
function isToday(date) {
  return isSameDay(date, constructNow(date));
}

/**
 * @name isYesterday
 * @category Day Helpers
 * @summary Is the given date yesterday?
 * @pure false
 *
 * @description
 * Is the given date yesterday?
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The date to check
 *
 * @returns The date is yesterday
 *
 * @example
 * // If today is 6 October 2014, is 5 October 14:00:00 yesterday?
 * const result = isYesterday(new Date(2014, 9, 5, 14, 0))
 * //=> true
 */
function isYesterday(date) {
  return isSameDay(date, subDays(constructNow(date), 1));
}

/**
 * The {@link parseISO} function options.
 */

/**
 * @name parseISO
 * @category Common Helpers
 * @summary Parse ISO string
 *
 * @description
 * Parse the given string in ISO 8601 format and return an instance of Date.
 *
 * Function accepts complete ISO 8601 formats as well as partial implementations.
 * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
 *
 * If the argument isn't a string, the function cannot parse the string or
 * the values are invalid, it returns Invalid Date.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param argument - The value to convert
 * @param options - An object with options
 *
 * @returns The parsed date in the local time zone
 *
 * @example
 * // Convert string '2014-02-11T11:30:30' to date:
 * const result = parseISO('2014-02-11T11:30:30')
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert string '+02014101' to date,
 * // if the additional number of digits in the extended year format is 1:
 * const result = parseISO('+02014101', { additionalDigits: 1 })
 * //=> Fri Apr 11 2014 00:00:00
 */
function parseISO(argument, options) {
  const additionalDigits = options?.additionalDigits ?? 2;
  const dateStrings = splitDateString(argument);

  let date;
  if (dateStrings.date) {
    const parseYearResult = parseYear(dateStrings.date, additionalDigits);
    date = parseDate(parseYearResult.restDateString, parseYearResult.year);
  }

  if (!date || isNaN(date.getTime())) {
    return new Date(NaN);
  }

  const timestamp = date.getTime();
  let time = 0;
  let offset;

  if (dateStrings.time) {
    time = parseTime(dateStrings.time);
    if (isNaN(time)) {
      return new Date(NaN);
    }
  }

  if (dateStrings.timezone) {
    offset = parseTimezone(dateStrings.timezone);
    if (isNaN(offset)) {
      return new Date(NaN);
    }
  } else {
    const dirtyDate = new Date(timestamp + time);
    // JS parsed string assuming it's in UTC timezone
    // but we need it to be parsed in our timezone
    // so we use utc values to build date in our timezone.
    // Year values from 0 to 99 map to the years 1900 to 1999
    // so set year explicitly with setFullYear.
    const result = new Date(0);
    result.setFullYear(
      dirtyDate.getUTCFullYear(),
      dirtyDate.getUTCMonth(),
      dirtyDate.getUTCDate(),
    );
    result.setHours(
      dirtyDate.getUTCHours(),
      dirtyDate.getUTCMinutes(),
      dirtyDate.getUTCSeconds(),
      dirtyDate.getUTCMilliseconds(),
    );
    return result;
  }

  return new Date(timestamp + time + offset);
}

const patterns = {
  dateTimeDelimiter: /[T ]/,
  timeZoneDelimiter: /[Z ]/i,
  timezone: /([Z+-].*)$/,
};

const dateRegex =
  /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/;
const timeRegex =
  /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/;
const timezoneRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/;

function splitDateString(dateString) {
  const dateStrings = {};
  const array = dateString.split(patterns.dateTimeDelimiter);
  let timeString;

  // The regex match should only return at maximum two array elements.
  // [date], [time], or [date, time].
  if (array.length > 2) {
    return dateStrings;
  }

  if (/:/.test(array[0])) {
    timeString = array[0];
  } else {
    dateStrings.date = array[0];
    timeString = array[1];
    if (patterns.timeZoneDelimiter.test(dateStrings.date)) {
      dateStrings.date = dateString.split(patterns.timeZoneDelimiter)[0];
      timeString = dateString.substr(
        dateStrings.date.length,
        dateString.length,
      );
    }
  }

  if (timeString) {
    const token = patterns.timezone.exec(timeString);
    if (token) {
      dateStrings.time = timeString.replace(token[1], "");
      dateStrings.timezone = token[1];
    } else {
      dateStrings.time = timeString;
    }
  }

  return dateStrings;
}

function parseYear(dateString, additionalDigits) {
  const regex = new RegExp(
    "^(?:(\\d{4}|[+-]\\d{" +
      (4 + additionalDigits) +
      "})|(\\d{2}|[+-]\\d{" +
      (2 + additionalDigits) +
      "})$)",
  );

  const captures = dateString.match(regex);
  // Invalid ISO-formatted year
  if (!captures) return { year: NaN, restDateString: "" };

  const year = captures[1] ? parseInt(captures[1]) : null;
  const century = captures[2] ? parseInt(captures[2]) : null;

  // either year or century is null, not both
  return {
    year: century === null ? year : century * 100,
    restDateString: dateString.slice((captures[1] || captures[2]).length),
  };
}

function parseDate(dateString, year) {
  // Invalid ISO-formatted year
  if (year === null) return new Date(NaN);

  const captures = dateString.match(dateRegex);
  // Invalid ISO-formatted string
  if (!captures) return new Date(NaN);

  const isWeekDate = !!captures[4];
  const dayOfYear = parseDateUnit(captures[1]);
  const month = parseDateUnit(captures[2]) - 1;
  const day = parseDateUnit(captures[3]);
  const week = parseDateUnit(captures[4]);
  const dayOfWeek = parseDateUnit(captures[5]) - 1;

  if (isWeekDate) {
    if (!validateWeekDate(year, week, dayOfWeek)) {
      return new Date(NaN);
    }
    return dayOfISOWeekYear(year, week, dayOfWeek);
  } else {
    const date = new Date(0);
    if (
      !validateDate(year, month, day) ||
      !validateDayOfYearDate(year, dayOfYear)
    ) {
      return new Date(NaN);
    }
    date.setUTCFullYear(year, month, Math.max(dayOfYear, day));
    return date;
  }
}

function parseDateUnit(value) {
  return value ? parseInt(value) : 1;
}

function parseTime(timeString) {
  const captures = timeString.match(timeRegex);
  if (!captures) return NaN; // Invalid ISO-formatted time

  const hours = parseTimeUnit(captures[1]);
  const minutes = parseTimeUnit(captures[2]);
  const seconds = parseTimeUnit(captures[3]);

  if (!validateTime(hours, minutes, seconds)) {
    return NaN;
  }

  return (
    hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * 1000
  );
}

function parseTimeUnit(value) {
  return (value && parseFloat(value.replace(",", "."))) || 0;
}

function parseTimezone(timezoneString) {
  if (timezoneString === "Z") return 0;

  const captures = timezoneString.match(timezoneRegex);
  if (!captures) return 0;

  const sign = captures[1] === "+" ? -1 : 1;
  const hours = parseInt(captures[2]);
  const minutes = (captures[3] && parseInt(captures[3])) || 0;

  if (!validateTimezone(hours, minutes)) {
    return NaN;
  }

  return sign * (hours * millisecondsInHour + minutes * millisecondsInMinute);
}

function dayOfISOWeekYear(isoWeekYear, week, day) {
  const date = new Date(0);
  date.setUTCFullYear(isoWeekYear, 0, 4);
  const fourthOfJanuaryDay = date.getUTCDay() || 7;
  const diff = (week - 1) * 7 + day + 1 - fourthOfJanuaryDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

// Validation functions

// February is null to handle the leap year (using ||)
const daysInMonths = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYearIndex(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function validateDate(year, month, date) {
  return (
    month >= 0 &&
    month <= 11 &&
    date >= 1 &&
    date <= (daysInMonths[month] || (isLeapYearIndex(year) ? 29 : 28))
  );
}

function validateDayOfYearDate(year, dayOfYear) {
  return dayOfYear >= 1 && dayOfYear <= (isLeapYearIndex(year) ? 366 : 365);
}

function validateWeekDate(_year, week, day) {
  return week >= 1 && week <= 53 && day >= 0 && day <= 6;
}

function validateTime(hours, minutes, seconds) {
  if (hours === 24) {
    return minutes === 0 && seconds === 0;
  }

  return (
    seconds >= 0 &&
    seconds < 60 &&
    minutes >= 0 &&
    minutes < 60 &&
    hours >= 0 &&
    hours < 25
  );
}

function validateTimezone(_hours, minutes) {
  return minutes >= 0 && minutes <= 59;
}

const resolveFetch$3 = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else if (typeof fetch === 'undefined') {
        _fetch = (...args) => __vitePreload(() => Promise.resolve().then(() => browser),true?void 0:void 0).then(({ default: fetch }) => fetch(...args));
    }
    else {
        _fetch = fetch;
    }
    return (...args) => _fetch(...args);
};

class FunctionsError extends Error {
    constructor(message, name = 'FunctionsError', context) {
        super(message);
        this.name = name;
        this.context = context;
    }
}
class FunctionsFetchError extends FunctionsError {
    constructor(context) {
        super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
    }
}
class FunctionsRelayError extends FunctionsError {
    constructor(context) {
        super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
    }
}
class FunctionsHttpError extends FunctionsError {
    constructor(context) {
        super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
    }
}
// Define the enum for the 'region' property
var FunctionRegion;
(function (FunctionRegion) {
    FunctionRegion["Any"] = "any";
    FunctionRegion["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion["ApSouth1"] = "ap-south-1";
    FunctionRegion["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion["CaCentral1"] = "ca-central-1";
    FunctionRegion["EuCentral1"] = "eu-central-1";
    FunctionRegion["EuWest1"] = "eu-west-1";
    FunctionRegion["EuWest2"] = "eu-west-2";
    FunctionRegion["EuWest3"] = "eu-west-3";
    FunctionRegion["SaEast1"] = "sa-east-1";
    FunctionRegion["UsEast1"] = "us-east-1";
    FunctionRegion["UsWest1"] = "us-west-1";
    FunctionRegion["UsWest2"] = "us-west-2";
})(FunctionRegion || (FunctionRegion = {}));

var __awaiter$7 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class FunctionsClient {
    constructor(url, { headers = {}, customFetch, region = FunctionRegion.Any, } = {}) {
        this.url = url;
        this.headers = headers;
        this.region = region;
        this.fetch = resolveFetch$3(customFetch);
    }
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     */
    setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     */
    invoke(functionName, options = {}) {
        var _a;
        return __awaiter$7(this, void 0, void 0, function* () {
            try {
                const { headers, method, body: functionArgs } = options;
                let _headers = {};
                let { region } = options;
                if (!region) {
                    region = this.region;
                }
                if (region && region !== 'any') {
                    _headers['x-region'] = region;
                }
                let body;
                if (functionArgs &&
                    ((headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) || !headers)) {
                    if ((typeof Blob !== 'undefined' && functionArgs instanceof Blob) ||
                        functionArgs instanceof ArrayBuffer) {
                        // will work for File as File inherits Blob
                        // also works for ArrayBuffer as it is the same underlying structure as a Blob
                        _headers['Content-Type'] = 'application/octet-stream';
                        body = functionArgs;
                    }
                    else if (typeof functionArgs === 'string') {
                        // plain string
                        _headers['Content-Type'] = 'text/plain';
                        body = functionArgs;
                    }
                    else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) {
                        // don't set content-type headers
                        // Request will automatically add the right boundary value
                        body = functionArgs;
                    }
                    else {
                        // default, assume this is JSON
                        _headers['Content-Type'] = 'application/json';
                        body = JSON.stringify(functionArgs);
                    }
                }
                const response = yield this.fetch(`${this.url}/${functionName}`, {
                    method: method || 'POST',
                    // headers priority is (high to low):
                    // 1. invoke-level headers
                    // 2. client-level headers
                    // 3. default Content-Type header
                    headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                    body,
                }).catch((fetchError) => {
                    throw new FunctionsFetchError(fetchError);
                });
                const isRelayError = response.headers.get('x-relay-error');
                if (isRelayError && isRelayError === 'true') {
                    throw new FunctionsRelayError(response);
                }
                if (!response.ok) {
                    throw new FunctionsHttpError(response);
                }
                let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                let data;
                if (responseType === 'application/json') {
                    data = yield response.json();
                }
                else if (responseType === 'application/octet-stream') {
                    data = yield response.blob();
                }
                else if (responseType === 'text/event-stream') {
                    data = response;
                }
                else if (responseType === 'multipart/form-data') {
                    data = yield response.formData();
                }
                else {
                    // default to text
                    data = yield response.text();
                }
                return { data, error: null };
            }
            catch (error) {
                return { data: null, error };
            }
        });
    }
}

var cjs = {};

var PostgrestClient$2 = {};

var PostgrestQueryBuilder$2 = {};

var PostgrestFilterBuilder$2 = {};

var PostgrestTransformBuilder$2 = {};

var PostgrestBuilder$2 = {};

// ref: https://github.com/tc39/proposal-global
var getGlobal = function() {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof global !== 'undefined') { return global; }
    throw new Error('unable to locate global object');
};

var globalObject = getGlobal();

const fetch$1 = globalObject.fetch;

const nodeFetch = globalObject.fetch.bind(globalObject);

const Headers$1 = globalObject.Headers;
const Request = globalObject.Request;
const Response$1 = globalObject.Response;

const browser = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Headers: Headers$1,
  Request,
  Response: Response$1,
  default: nodeFetch,
  fetch: fetch$1
}, Symbol.toStringTag, { value: 'Module' }));

const require$$0 = /*@__PURE__*/getAugmentedNamespace(browser);

var PostgrestError$2 = {};

Object.defineProperty(PostgrestError$2, "__esModule", { value: true });
/**
 * Error format
 *
 * {@link https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes}
 */
let PostgrestError$1 = class PostgrestError extends Error {
    constructor(context) {
        super(context.message);
        this.name = 'PostgrestError';
        this.details = context.details;
        this.hint = context.hint;
        this.code = context.code;
    }
};
PostgrestError$2.default = PostgrestError$1;

var __importDefault$5 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PostgrestBuilder$2, "__esModule", { value: true });
// @ts-ignore
const node_fetch_1 = __importDefault$5(require$$0);
const PostgrestError_1$1 = __importDefault$5(PostgrestError$2);
let PostgrestBuilder$1 = class PostgrestBuilder {
    constructor(builder) {
        this.shouldThrowOnError = false;
        this.method = builder.method;
        this.url = builder.url;
        this.headers = builder.headers;
        this.schema = builder.schema;
        this.body = builder.body;
        this.shouldThrowOnError = builder.shouldThrowOnError;
        this.signal = builder.signal;
        this.isMaybeSingle = builder.isMaybeSingle;
        if (builder.fetch) {
            this.fetch = builder.fetch;
        }
        else if (typeof fetch === 'undefined') {
            this.fetch = node_fetch_1.default;
        }
        else {
            this.fetch = fetch;
        }
    }
    /**
     * If there's an error with the query, throwOnError will reject the promise by
     * throwing the error instead of returning it as part of a successful response.
     *
     * {@link https://github.com/supabase/supabase-js/issues/92}
     */
    throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /**
     * Set an HTTP header for the request.
     */
    setHeader(name, value) {
        this.headers = Object.assign({}, this.headers);
        this.headers[name] = value;
        return this;
    }
    then(onfulfilled, onrejected) {
        // https://postgrest.org/en/stable/api.html#switching-schemas
        if (this.schema === undefined) ;
        else if (['GET', 'HEAD'].includes(this.method)) {
            this.headers['Accept-Profile'] = this.schema;
        }
        else {
            this.headers['Content-Profile'] = this.schema;
        }
        if (this.method !== 'GET' && this.method !== 'HEAD') {
            this.headers['Content-Type'] = 'application/json';
        }
        // NOTE: Invoke w/o `this` to avoid illegal invocation error.
        // https://github.com/supabase/postgrest-js/pull/247
        const _fetch = this.fetch;
        let res = _fetch(this.url.toString(), {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify(this.body),
            signal: this.signal,
        }).then(async (res) => {
            var _a, _b, _c;
            let error = null;
            let data = null;
            let count = null;
            let status = res.status;
            let statusText = res.statusText;
            if (res.ok) {
                if (this.method !== 'HEAD') {
                    const body = await res.text();
                    if (body === '') ;
                    else if (this.headers['Accept'] === 'text/csv') {
                        data = body;
                    }
                    else if (this.headers['Accept'] &&
                        this.headers['Accept'].includes('application/vnd.pgrst.plan+text')) {
                        data = body;
                    }
                    else {
                        data = JSON.parse(body);
                    }
                }
                const countHeader = (_a = this.headers['Prefer']) === null || _a === void 0 ? void 0 : _a.match(/count=(exact|planned|estimated)/);
                const contentRange = (_b = res.headers.get('content-range')) === null || _b === void 0 ? void 0 : _b.split('/');
                if (countHeader && contentRange && contentRange.length > 1) {
                    count = parseInt(contentRange[1]);
                }
                // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
                // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
                if (this.isMaybeSingle && this.method === 'GET' && Array.isArray(data)) {
                    if (data.length > 1) {
                        error = {
                            // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
                            code: 'PGRST116',
                            details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                            hint: null,
                            message: 'JSON object requested, multiple (or no) rows returned',
                        };
                        data = null;
                        count = null;
                        status = 406;
                        statusText = 'Not Acceptable';
                    }
                    else if (data.length === 1) {
                        data = data[0];
                    }
                    else {
                        data = null;
                    }
                }
            }
            else {
                const body = await res.text();
                try {
                    error = JSON.parse(body);
                    // Workaround for https://github.com/supabase/postgrest-js/issues/295
                    if (Array.isArray(error) && res.status === 404) {
                        data = [];
                        error = null;
                        status = 200;
                        statusText = 'OK';
                    }
                }
                catch (_d) {
                    // Workaround for https://github.com/supabase/postgrest-js/issues/295
                    if (res.status === 404 && body === '') {
                        status = 204;
                        statusText = 'No Content';
                    }
                    else {
                        error = {
                            message: body,
                        };
                    }
                }
                if (error && this.isMaybeSingle && ((_c = error === null || error === void 0 ? void 0 : error.details) === null || _c === void 0 ? void 0 : _c.includes('0 rows'))) {
                    error = null;
                    status = 200;
                    statusText = 'OK';
                }
                if (error && this.shouldThrowOnError) {
                    throw new PostgrestError_1$1.default(error);
                }
            }
            const postgrestResponse = {
                error,
                data,
                count,
                status,
                statusText,
            };
            return postgrestResponse;
        });
        if (!this.shouldThrowOnError) {
            res = res.catch((fetchError) => {
                var _a, _b, _c;
                return ({
                    error: {
                        message: `${(_a = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _a !== void 0 ? _a : 'FetchError'}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                        details: `${(_b = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _b !== void 0 ? _b : ''}`,
                        hint: '',
                        code: `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) !== null && _c !== void 0 ? _c : ''}`,
                    },
                    data: null,
                    count: null,
                    status: 0,
                    statusText: '',
                });
            });
        }
        return res.then(onfulfilled, onrejected);
    }
    /**
     * Override the type of the returned `data`.
     *
     * @typeParam NewResult - The new result type to override with
     * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
     */
    returns() {
        /* istanbul ignore next */
        return this;
    }
    /**
     * Override the type of the returned `data` field in the response.
     *
     * @typeParam NewResult - The new type to cast the response data to
     * @typeParam Options - Optional type configuration (defaults to { merge: true })
     * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
     * @example
     * ```typescript
     * // Merge with existing types (default behavior)
     * const query = supabase
     *   .from('users')
     *   .select()
     *   .overrideTypes<{ custom_field: string }>()
     *
     * // Replace existing types completely
     * const replaceQuery = supabase
     *   .from('users')
     *   .select()
     *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
     * ```
     * @returns A PostgrestBuilder instance with the new type
     */
    overrideTypes() {
        return this;
    }
};
PostgrestBuilder$2.default = PostgrestBuilder$1;

var __importDefault$4 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PostgrestTransformBuilder$2, "__esModule", { value: true });
const PostgrestBuilder_1$1 = __importDefault$4(PostgrestBuilder$2);
let PostgrestTransformBuilder$1 = class PostgrestTransformBuilder extends PostgrestBuilder_1$1.default {
    /**
     * Perform a SELECT on the query result.
     *
     * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
     * return modified rows. By calling this method, modified rows are returned in
     * `data`.
     *
     * @param columns - The columns to retrieve, separated by commas
     */
    select(columns) {
        // Remove whitespaces except when quoted
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
            .split('')
            .map((c) => {
            if (/\s/.test(c) && !quoted) {
                return '';
            }
            if (c === '"') {
                quoted = !quoted;
            }
            return c;
        })
            .join('');
        this.url.searchParams.set('select', cleanedColumns);
        if (this.headers['Prefer']) {
            this.headers['Prefer'] += ',';
        }
        this.headers['Prefer'] += 'return=representation';
        return this;
    }
    /**
     * Order the query result by `column`.
     *
     * You can call this method multiple times to order by multiple columns.
     *
     * You can order referenced tables, but it only affects the ordering of the
     * parent table if you use `!inner` in the query.
     *
     * @param column - The column to order by
     * @param options - Named parameters
     * @param options.ascending - If `true`, the result will be in ascending order
     * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
     * `null`s appear last.
     * @param options.referencedTable - Set this to order a referenced table by
     * its columns
     * @param options.foreignTable - Deprecated, use `options.referencedTable`
     * instead
     */
    order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable, } = {}) {
        const key = referencedTable ? `${referencedTable}.order` : 'order';
        const existingOrder = this.url.searchParams.get(key);
        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ''}${column}.${ascending ? 'asc' : 'desc'}${nullsFirst === undefined ? '' : nullsFirst ? '.nullsfirst' : '.nullslast'}`);
        return this;
    }
    /**
     * Limit the query result by `count`.
     *
     * @param count - The maximum number of rows to return
     * @param options - Named parameters
     * @param options.referencedTable - Set this to limit rows of referenced
     * tables instead of the parent table
     * @param options.foreignTable - Deprecated, use `options.referencedTable`
     * instead
     */
    limit(count, { foreignTable, referencedTable = foreignTable, } = {}) {
        const key = typeof referencedTable === 'undefined' ? 'limit' : `${referencedTable}.limit`;
        this.url.searchParams.set(key, `${count}`);
        return this;
    }
    /**
     * Limit the query result by starting at an offset `from` and ending at the offset `to`.
     * Only records within this range are returned.
     * This respects the query order and if there is no order clause the range could behave unexpectedly.
     * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
     * and fourth rows of the query.
     *
     * @param from - The starting index from which to limit the result
     * @param to - The last index to which to limit the result
     * @param options - Named parameters
     * @param options.referencedTable - Set this to limit rows of referenced
     * tables instead of the parent table
     * @param options.foreignTable - Deprecated, use `options.referencedTable`
     * instead
     */
    range(from, to, { foreignTable, referencedTable = foreignTable, } = {}) {
        const keyOffset = typeof referencedTable === 'undefined' ? 'offset' : `${referencedTable}.offset`;
        const keyLimit = typeof referencedTable === 'undefined' ? 'limit' : `${referencedTable}.limit`;
        this.url.searchParams.set(keyOffset, `${from}`);
        // Range is inclusive, so add 1
        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
        return this;
    }
    /**
     * Set the AbortSignal for the fetch request.
     *
     * @param signal - The AbortSignal to use for the fetch request
     */
    abortSignal(signal) {
        this.signal = signal;
        return this;
    }
    /**
     * Return `data` as a single object instead of an array of objects.
     *
     * Query result must be one row (e.g. using `.limit(1)`), otherwise this
     * returns an error.
     */
    single() {
        this.headers['Accept'] = 'application/vnd.pgrst.object+json';
        return this;
    }
    /**
     * Return `data` as a single object instead of an array of objects.
     *
     * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
     * this returns an error.
     */
    maybeSingle() {
        // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
        // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
        if (this.method === 'GET') {
            this.headers['Accept'] = 'application/json';
        }
        else {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
        }
        this.isMaybeSingle = true;
        return this;
    }
    /**
     * Return `data` as a string in CSV format.
     */
    csv() {
        this.headers['Accept'] = 'text/csv';
        return this;
    }
    /**
     * Return `data` as an object in [GeoJSON](https://geojson.org) format.
     */
    geojson() {
        this.headers['Accept'] = 'application/geo+json';
        return this;
    }
    /**
     * Return `data` as the EXPLAIN plan for the query.
     *
     * You need to enable the
     * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
     * setting before using this method.
     *
     * @param options - Named parameters
     *
     * @param options.analyze - If `true`, the query will be executed and the
     * actual run time will be returned
     *
     * @param options.verbose - If `true`, the query identifier will be returned
     * and `data` will include the output columns of the query
     *
     * @param options.settings - If `true`, include information on configuration
     * parameters that affect query planning
     *
     * @param options.buffers - If `true`, include information on buffer usage
     *
     * @param options.wal - If `true`, include information on WAL record generation
     *
     * @param options.format - The format of the output, can be `"text"` (default)
     * or `"json"`
     */
    explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = 'text', } = {}) {
        var _a;
        const options = [
            analyze ? 'analyze' : null,
            verbose ? 'verbose' : null,
            settings ? 'settings' : null,
            buffers ? 'buffers' : null,
            wal ? 'wal' : null,
        ]
            .filter(Boolean)
            .join('|');
        // An Accept header can carry multiple media types but postgrest-js always sends one
        const forMediatype = (_a = this.headers['Accept']) !== null && _a !== void 0 ? _a : 'application/json';
        this.headers['Accept'] = `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`;
        if (format === 'json')
            return this;
        else
            return this;
    }
    /**
     * Rollback the query.
     *
     * `data` will still be returned, but the query is not committed.
     */
    rollback() {
        var _a;
        if (((_a = this.headers['Prefer']) !== null && _a !== void 0 ? _a : '').trim().length > 0) {
            this.headers['Prefer'] += ',tx=rollback';
        }
        else {
            this.headers['Prefer'] = 'tx=rollback';
        }
        return this;
    }
    /**
     * Override the type of the returned `data`.
     *
     * @typeParam NewResult - The new result type to override with
     * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
     */
    returns() {
        return this;
    }
};
PostgrestTransformBuilder$2.default = PostgrestTransformBuilder$1;

var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PostgrestFilterBuilder$2, "__esModule", { value: true });
const PostgrestTransformBuilder_1$1 = __importDefault$3(PostgrestTransformBuilder$2);
let PostgrestFilterBuilder$1 = class PostgrestFilterBuilder extends PostgrestTransformBuilder_1$1.default {
    /**
     * Match only rows where `column` is equal to `value`.
     *
     * To check if the value of `column` is NULL, you should use `.is()` instead.
     *
     * @param column - The column to filter on
     * @param value - The value to filter with
     */
    eq(column, value) {
        this.url.searchParams.append(column, `eq.${value}`);
        return this;
    }
    /**
     * Match only rows where `column` is not equal to `value`.
     *
     * @param column - The column to filter on
     * @param value - The value to filter with
     */
    neq(column, value) {
        this.url.searchParams.append(column, `neq.${value}`);
        return this;
    }
    /**
     * Match only rows where `column` is greater than `value`.
     *
     * @param column - The column to filter on
     * @param value - The value to filter with
     */
    gt(column, value) {
        this.url.searchParams.append(column, `gt.${value}`);
        return this;
    }
    /**
     * Match only rows where `column` is greater than or equal to `value`.
     *
     * @param column - The column to filter on
     * @param value - The value to filter with
     */
    gte(column, value) {
        this.url.searchParams.append(column, `gte.${value}`);
        return this;
    }
    /**
     * Match only rows where `column` is less than `value`.
     *
     * @param column - The column to filter on
     * @param value - The value to filter with
     */
    lt(column, value) {
        this.url.searchParams.append(column, `lt.${value}`);
        return this;
    }
    /**
     * Match only rows where `column` is less than or equal to `value`.
     *
     * @param column - The column to filter on
     * @param value - The value to filter with
     */
    lte(column, value) {
        this.url.searchParams.append(column, `lte.${value}`);
        return this;
    }
    /**
     * Match only rows where `column` matches `pattern` case-sensitively.
     *
     * @param column - The column to filter on
     * @param pattern - The pattern to match with
     */
    like(column, pattern) {
        this.url.searchParams.append(column, `like.${pattern}`);
        return this;
    }
    /**
     * Match only rows where `column` matches all of `patterns` case-sensitively.
     *
     * @param column - The column to filter on
     * @param patterns - The patterns to match with
     */
    likeAllOf(column, patterns) {
        this.url.searchParams.append(column, `like(all).{${patterns.join(',')}}`);
        return this;
    }
    /**
     * Match only rows where `column` matches any of `patterns` case-sensitively.
     *
     * @param column - The column to filter on
     * @param patterns - The patterns to match with
     */
    likeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `like(any).{${patterns.join(',')}}`);
        return this;
    }
    /**
     * Match only rows where `column` matches `pattern` case-insensitively.
     *
     * @param column - The column to filter on
     * @param pattern - The pattern to match with
     */
    ilike(column, pattern) {
        this.url.searchParams.append(column, `ilike.${pattern}`);
        return this;
    }
    /**
     * Match only rows where `column` matches all of `patterns` case-insensitively.
     *
     * @param column - The column to filter on
     * @param patterns - The patterns to match with
     */
    ilikeAllOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(all).{${patterns.join(',')}}`);
        return this;
    }
    /**
     * Match only rows where `column` matches any of `patterns` case-insensitively.
     *
     * @param column - The column to filter on
     * @param patterns - The patterns to match with
     */
    ilikeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(any).{${patterns.join(',')}}`);
        return this;
    }
    /**
     * Match only rows where `column` IS `value`.
     *
     * For non-boolean columns, this is only relevant for checking if the value of
     * `column` is NULL by setting `value` to `null`.
     *
     * For boolean columns, you can also set `value` to `true` or `false` and it
     * will behave the same way as `.eq()`.
     *
     * @param column - The column to filter on
     * @param value - The value to filter with
     */
    is(column, value) {
        this.url.searchParams.append(column, `is.${value}`);
        return this;
    }
    /**
     * Match only rows where `column` is included in the `values` array.
     *
     * @param column - The column to filter on
     * @param values - The values array to filter with
     */
    in(column, values) {
        const cleanedValues = Array.from(new Set(values))
            .map((s) => {
            // handle postgrest reserved characters
            // https://postgrest.org/en/v7.0.0/api.html#reserved-characters
            if (typeof s === 'string' && new RegExp('[,()]').test(s))
                return `"${s}"`;
            else
                return `${s}`;
        })
            .join(',');
        this.url.searchParams.append(column, `in.(${cleanedValues})`);
        return this;
    }
    /**
     * Only relevant for jsonb, array, and range columns. Match only rows where
     * `column` contains every element appearing in `value`.
     *
     * @param column - The jsonb, array, or range column to filter on
     * @param value - The jsonb, array, or range value to filter with
     */
    contains(column, value) {
        if (typeof value === 'string') {
            // range types can be inclusive '[', ']' or exclusive '(', ')' so just
            // keep it simple and accept a string
            this.url.searchParams.append(column, `cs.${value}`);
        }
        else if (Array.isArray(value)) {
            // array
            this.url.searchParams.append(column, `cs.{${value.join(',')}}`);
        }
        else {
            // json
            this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
        }
        return this;
    }
    /**
     * Only relevant for jsonb, array, and range columns. Match only rows where
     * every element appearing in `column` is contained by `value`.
     *
     * @param column - The jsonb, array, or range column to filter on
     * @param value - The jsonb, array, or range value to filter with
     */
    containedBy(column, value) {
        if (typeof value === 'string') {
            // range
            this.url.searchParams.append(column, `cd.${value}`);
        }
        else if (Array.isArray(value)) {
            // array
            this.url.searchParams.append(column, `cd.{${value.join(',')}}`);
        }
        else {
            // json
            this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
        }
        return this;
    }
    /**
     * Only relevant for range columns. Match only rows where every element in
     * `column` is greater than any element in `range`.
     *
     * @param column - The range column to filter on
     * @param range - The range to filter with
     */
    rangeGt(column, range) {
        this.url.searchParams.append(column, `sr.${range}`);
        return this;
    }
    /**
     * Only relevant for range columns. Match only rows where every element in
     * `column` is either contained in `range` or greater than any element in
     * `range`.
     *
     * @param column - The range column to filter on
     * @param range - The range to filter with
     */
    rangeGte(column, range) {
        this.url.searchParams.append(column, `nxl.${range}`);
        return this;
    }
    /**
     * Only relevant for range columns. Match only rows where every element in
     * `column` is less than any element in `range`.
     *
     * @param column - The range column to filter on
     * @param range - The range to filter with
     */
    rangeLt(column, range) {
        this.url.searchParams.append(column, `sl.${range}`);
        return this;
    }
    /**
     * Only relevant for range columns. Match only rows where every element in
     * `column` is either contained in `range` or less than any element in
     * `range`.
     *
     * @param column - The range column to filter on
     * @param range - The range to filter with
     */
    rangeLte(column, range) {
        this.url.searchParams.append(column, `nxr.${range}`);
        return this;
    }
    /**
     * Only relevant for range columns. Match only rows where `column` is
     * mutually exclusive to `range` and there can be no element between the two
     * ranges.
     *
     * @param column - The range column to filter on
     * @param range - The range to filter with
     */
    rangeAdjacent(column, range) {
        this.url.searchParams.append(column, `adj.${range}`);
        return this;
    }
    /**
     * Only relevant for array and range columns. Match only rows where
     * `column` and `value` have an element in common.
     *
     * @param column - The array or range column to filter on
     * @param value - The array or range value to filter with
     */
    overlaps(column, value) {
        if (typeof value === 'string') {
            // range
            this.url.searchParams.append(column, `ov.${value}`);
        }
        else {
            // array
            this.url.searchParams.append(column, `ov.{${value.join(',')}}`);
        }
        return this;
    }
    /**
     * Only relevant for text and tsvector columns. Match only rows where
     * `column` matches the query string in `query`.
     *
     * @param column - The text or tsvector column to filter on
     * @param query - The query text to match with
     * @param options - Named parameters
     * @param options.config - The text search configuration to use
     * @param options.type - Change how the `query` text is interpreted
     */
    textSearch(column, query, { config, type } = {}) {
        let typePart = '';
        if (type === 'plain') {
            typePart = 'pl';
        }
        else if (type === 'phrase') {
            typePart = 'ph';
        }
        else if (type === 'websearch') {
            typePart = 'w';
        }
        const configPart = config === undefined ? '' : `(${config})`;
        this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
        return this;
    }
    /**
     * Match only rows where each column in `query` keys is equal to its
     * associated value. Shorthand for multiple `.eq()`s.
     *
     * @param query - The object to filter with, with column names as keys mapped
     * to their filter values
     */
    match(query) {
        Object.entries(query).forEach(([column, value]) => {
            this.url.searchParams.append(column, `eq.${value}`);
        });
        return this;
    }
    /**
     * Match only rows which doesn't satisfy the filter.
     *
     * Unlike most filters, `opearator` and `value` are used as-is and need to
     * follow [PostgREST
     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
     * to make sure they are properly sanitized.
     *
     * @param column - The column to filter on
     * @param operator - The operator to be negated to filter with, following
     * PostgREST syntax
     * @param value - The value to filter with, following PostgREST syntax
     */
    not(column, operator, value) {
        this.url.searchParams.append(column, `not.${operator}.${value}`);
        return this;
    }
    /**
     * Match only rows which satisfy at least one of the filters.
     *
     * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
     * to make sure it's properly sanitized.
     *
     * It's currently not possible to do an `.or()` filter across multiple tables.
     *
     * @param filters - The filters to use, following PostgREST syntax
     * @param options - Named parameters
     * @param options.referencedTable - Set this to filter on referenced tables
     * instead of the parent table
     * @param options.foreignTable - Deprecated, use `referencedTable` instead
     */
    or(filters, { foreignTable, referencedTable = foreignTable, } = {}) {
        const key = referencedTable ? `${referencedTable}.or` : 'or';
        this.url.searchParams.append(key, `(${filters})`);
        return this;
    }
    /**
     * Match only rows which satisfy the filter. This is an escape hatch - you
     * should use the specific filter methods wherever possible.
     *
     * Unlike most filters, `opearator` and `value` are used as-is and need to
     * follow [PostgREST
     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
     * to make sure they are properly sanitized.
     *
     * @param column - The column to filter on
     * @param operator - The operator to filter with, following PostgREST syntax
     * @param value - The value to filter with, following PostgREST syntax
     */
    filter(column, operator, value) {
        this.url.searchParams.append(column, `${operator}.${value}`);
        return this;
    }
};
PostgrestFilterBuilder$2.default = PostgrestFilterBuilder$1;

var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PostgrestQueryBuilder$2, "__esModule", { value: true });
const PostgrestFilterBuilder_1$2 = __importDefault$2(PostgrestFilterBuilder$2);
let PostgrestQueryBuilder$1 = class PostgrestQueryBuilder {
    constructor(url, { headers = {}, schema, fetch, }) {
        this.url = url;
        this.headers = headers;
        this.schema = schema;
        this.fetch = fetch;
    }
    /**
     * Perform a SELECT query on the table or view.
     *
     * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
     *
     * @param options - Named parameters
     *
     * @param options.head - When set to `true`, `data` will not be returned.
     * Useful if you only need the count.
     *
     * @param options.count - Count algorithm to use to count rows in the table or view.
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    select(columns, { head = false, count, } = {}) {
        const method = head ? 'HEAD' : 'GET';
        // Remove whitespaces except when quoted
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
            .split('')
            .map((c) => {
            if (/\s/.test(c) && !quoted) {
                return '';
            }
            if (c === '"') {
                quoted = !quoted;
            }
            return c;
        })
            .join('');
        this.url.searchParams.set('select', cleanedColumns);
        if (count) {
            this.headers['Prefer'] = `count=${count}`;
        }
        return new PostgrestFilterBuilder_1$2.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: false,
        });
    }
    /**
     * Perform an INSERT into the table or view.
     *
     * By default, inserted rows are not returned. To return it, chain the call
     * with `.select()`.
     *
     * @param values - The values to insert. Pass an object to insert a single row
     * or an array to insert multiple rows.
     *
     * @param options - Named parameters
     *
     * @param options.count - Count algorithm to use to count inserted rows.
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     *
     * @param options.defaultToNull - Make missing fields default to `null`.
     * Otherwise, use the default value for the column. Only applies for bulk
     * inserts.
     */
    insert(values, { count, defaultToNull = true, } = {}) {
        const method = 'POST';
        const prefersHeaders = [];
        if (this.headers['Prefer']) {
            prefersHeaders.push(this.headers['Prefer']);
        }
        if (count) {
            prefersHeaders.push(`count=${count}`);
        }
        if (!defaultToNull) {
            prefersHeaders.push('missing=default');
        }
        this.headers['Prefer'] = prefersHeaders.join(',');
        if (Array.isArray(values)) {
            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
                const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
                this.url.searchParams.set('columns', uniqueColumns.join(','));
            }
        }
        return new PostgrestFilterBuilder_1$2.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false,
        });
    }
    /**
     * Perform an UPSERT on the table or view. Depending on the column(s) passed
     * to `onConflict`, `.upsert()` allows you to perform the equivalent of
     * `.insert()` if a row with the corresponding `onConflict` columns doesn't
     * exist, or if it does exist, perform an alternative action depending on
     * `ignoreDuplicates`.
     *
     * By default, upserted rows are not returned. To return it, chain the call
     * with `.select()`.
     *
     * @param values - The values to upsert with. Pass an object to upsert a
     * single row or an array to upsert multiple rows.
     *
     * @param options - Named parameters
     *
     * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
     * duplicate rows are determined. Two rows are duplicates if all the
     * `onConflict` columns are equal.
     *
     * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
     * `false`, duplicate rows are merged with existing rows.
     *
     * @param options.count - Count algorithm to use to count upserted rows.
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     *
     * @param options.defaultToNull - Make missing fields default to `null`.
     * Otherwise, use the default value for the column. This only applies when
     * inserting new rows, not when merging with existing rows under
     * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
     */
    upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true, } = {}) {
        const method = 'POST';
        const prefersHeaders = [`resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`];
        if (onConflict !== undefined)
            this.url.searchParams.set('on_conflict', onConflict);
        if (this.headers['Prefer']) {
            prefersHeaders.push(this.headers['Prefer']);
        }
        if (count) {
            prefersHeaders.push(`count=${count}`);
        }
        if (!defaultToNull) {
            prefersHeaders.push('missing=default');
        }
        this.headers['Prefer'] = prefersHeaders.join(',');
        if (Array.isArray(values)) {
            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
                const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
                this.url.searchParams.set('columns', uniqueColumns.join(','));
            }
        }
        return new PostgrestFilterBuilder_1$2.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false,
        });
    }
    /**
     * Perform an UPDATE on the table or view.
     *
     * By default, updated rows are not returned. To return it, chain the call
     * with `.select()` after filters.
     *
     * @param values - The values to update with
     *
     * @param options - Named parameters
     *
     * @param options.count - Count algorithm to use to count updated rows.
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    update(values, { count, } = {}) {
        const method = 'PATCH';
        const prefersHeaders = [];
        if (this.headers['Prefer']) {
            prefersHeaders.push(this.headers['Prefer']);
        }
        if (count) {
            prefersHeaders.push(`count=${count}`);
        }
        this.headers['Prefer'] = prefersHeaders.join(',');
        return new PostgrestFilterBuilder_1$2.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false,
        });
    }
    /**
     * Perform a DELETE on the table or view.
     *
     * By default, deleted rows are not returned. To return it, chain the call
     * with `.select()` after filters.
     *
     * @param options - Named parameters
     *
     * @param options.count - Count algorithm to use to count deleted rows.
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    delete({ count, } = {}) {
        const method = 'DELETE';
        const prefersHeaders = [];
        if (count) {
            prefersHeaders.push(`count=${count}`);
        }
        if (this.headers['Prefer']) {
            prefersHeaders.unshift(this.headers['Prefer']);
        }
        this.headers['Prefer'] = prefersHeaders.join(',');
        return new PostgrestFilterBuilder_1$2.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: false,
        });
    }
};
PostgrestQueryBuilder$2.default = PostgrestQueryBuilder$1;

var constants = {};

var version$4 = {};

Object.defineProperty(version$4, "__esModule", { value: true });
version$4.version = void 0;
version$4.version = '0.0.0-automated';

Object.defineProperty(constants, "__esModule", { value: true });
constants.DEFAULT_HEADERS = void 0;
const version_1 = version$4;
constants.DEFAULT_HEADERS = { 'X-Client-Info': `postgrest-js/${version_1.version}` };

var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PostgrestClient$2, "__esModule", { value: true });
const PostgrestQueryBuilder_1$1 = __importDefault$1(PostgrestQueryBuilder$2);
const PostgrestFilterBuilder_1$1 = __importDefault$1(PostgrestFilterBuilder$2);
const constants_1 = constants;
/**
 * PostgREST client.
 *
 * @typeParam Database - Types for the schema from the [type
 * generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
 *
 * @typeParam SchemaName - Postgres schema to switch to. Must be a string
 * literal, the same one passed to the constructor. If the schema is not
 * `"public"`, this must be supplied manually.
 */
let PostgrestClient$1 = class PostgrestClient {
    // TODO: Add back shouldThrowOnError once we figure out the typings
    /**
     * Creates a PostgREST client.
     *
     * @param url - URL of the PostgREST endpoint
     * @param options - Named parameters
     * @param options.headers - Custom headers
     * @param options.schema - Postgres schema to switch to
     * @param options.fetch - Custom fetch
     */
    constructor(url, { headers = {}, schema, fetch, } = {}) {
        this.url = url;
        this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
        this.schemaName = schema;
        this.fetch = fetch;
    }
    /**
     * Perform a query on a table or a view.
     *
     * @param relation - The table or view name to query
     */
    from(relation) {
        const url = new URL(`${this.url}/${relation}`);
        return new PostgrestQueryBuilder_1$1.default(url, {
            headers: Object.assign({}, this.headers),
            schema: this.schemaName,
            fetch: this.fetch,
        });
    }
    /**
     * Select a schema to query or perform an function (rpc) call.
     *
     * The schema needs to be on the list of exposed schemas inside Supabase.
     *
     * @param schema - The schema to query
     */
    schema(schema) {
        return new PostgrestClient(this.url, {
            headers: this.headers,
            schema,
            fetch: this.fetch,
        });
    }
    /**
     * Perform a function call.
     *
     * @param fn - The function name to call
     * @param args - The arguments to pass to the function call
     * @param options - Named parameters
     * @param options.head - When set to `true`, `data` will not be returned.
     * Useful if you only need the count.
     * @param options.get - When set to `true`, the function will be called with
     * read-only access mode.
     * @param options.count - Count algorithm to use to count rows returned by the
     * function. Only applicable for [set-returning
     * functions](https://www.postgresql.org/docs/current/functions-srf.html).
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    rpc(fn, args = {}, { head = false, get = false, count, } = {}) {
        let method;
        const url = new URL(`${this.url}/rpc/${fn}`);
        let body;
        if (head || get) {
            method = head ? 'HEAD' : 'GET';
            Object.entries(args)
                // params with undefined value needs to be filtered out, otherwise it'll
                // show up as `?param=undefined`
                .filter(([_, value]) => value !== undefined)
                // array values need special syntax
                .map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(',')}}` : `${value}`])
                .forEach(([name, value]) => {
                url.searchParams.append(name, value);
            });
        }
        else {
            method = 'POST';
            body = args;
        }
        const headers = Object.assign({}, this.headers);
        if (count) {
            headers['Prefer'] = `count=${count}`;
        }
        return new PostgrestFilterBuilder_1$1.default({
            method,
            url,
            headers,
            schema: this.schemaName,
            body,
            fetch: this.fetch,
            allowEmpty: false,
        });
    }
};
PostgrestClient$2.default = PostgrestClient$1;

var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(cjs, "__esModule", { value: true });
cjs.PostgrestError = cjs.PostgrestBuilder = cjs.PostgrestTransformBuilder = cjs.PostgrestFilterBuilder = cjs.PostgrestQueryBuilder = cjs.PostgrestClient = void 0;
// Always update wrapper.mjs when updating this file.
const PostgrestClient_1 = __importDefault(PostgrestClient$2);
cjs.PostgrestClient = PostgrestClient_1.default;
const PostgrestQueryBuilder_1 = __importDefault(PostgrestQueryBuilder$2);
cjs.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
const PostgrestFilterBuilder_1 = __importDefault(PostgrestFilterBuilder$2);
cjs.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
const PostgrestTransformBuilder_1 = __importDefault(PostgrestTransformBuilder$2);
cjs.PostgrestTransformBuilder = PostgrestTransformBuilder_1.default;
const PostgrestBuilder_1 = __importDefault(PostgrestBuilder$2);
cjs.PostgrestBuilder = PostgrestBuilder_1.default;
const PostgrestError_1 = __importDefault(PostgrestError$2);
cjs.PostgrestError = PostgrestError_1.default;
var _default = cjs.default = {
    PostgrestClient: PostgrestClient_1.default,
    PostgrestQueryBuilder: PostgrestQueryBuilder_1.default,
    PostgrestFilterBuilder: PostgrestFilterBuilder_1.default,
    PostgrestTransformBuilder: PostgrestTransformBuilder_1.default,
    PostgrestBuilder: PostgrestBuilder_1.default,
    PostgrestError: PostgrestError_1.default,
};

const {
  PostgrestClient,
  PostgrestQueryBuilder,
  PostgrestFilterBuilder,
  PostgrestTransformBuilder,
  PostgrestBuilder,
  PostgrestError,
} = _default;

const version$3 = '2.11.2';

const DEFAULT_HEADERS$3 = { 'X-Client-Info': `realtime-js/${version$3}` };
const VSN = '1.0.0';
const DEFAULT_TIMEOUT = 10000;
const WS_CLOSE_NORMAL = 1000;
var SOCKET_STATES;
(function (SOCKET_STATES) {
    SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
    SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
    SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
    SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
})(SOCKET_STATES || (SOCKET_STATES = {}));
var CHANNEL_STATES;
(function (CHANNEL_STATES) {
    CHANNEL_STATES["closed"] = "closed";
    CHANNEL_STATES["errored"] = "errored";
    CHANNEL_STATES["joined"] = "joined";
    CHANNEL_STATES["joining"] = "joining";
    CHANNEL_STATES["leaving"] = "leaving";
})(CHANNEL_STATES || (CHANNEL_STATES = {}));
var CHANNEL_EVENTS;
(function (CHANNEL_EVENTS) {
    CHANNEL_EVENTS["close"] = "phx_close";
    CHANNEL_EVENTS["error"] = "phx_error";
    CHANNEL_EVENTS["join"] = "phx_join";
    CHANNEL_EVENTS["reply"] = "phx_reply";
    CHANNEL_EVENTS["leave"] = "phx_leave";
    CHANNEL_EVENTS["access_token"] = "access_token";
})(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
var TRANSPORTS;
(function (TRANSPORTS) {
    TRANSPORTS["websocket"] = "websocket";
})(TRANSPORTS || (TRANSPORTS = {}));
var CONNECTION_STATE;
(function (CONNECTION_STATE) {
    CONNECTION_STATE["Connecting"] = "connecting";
    CONNECTION_STATE["Open"] = "open";
    CONNECTION_STATE["Closing"] = "closing";
    CONNECTION_STATE["Closed"] = "closed";
})(CONNECTION_STATE || (CONNECTION_STATE = {}));

// This file draws heavily from https://github.com/phoenixframework/phoenix/commit/cf098e9cf7a44ee6479d31d911a97d3c7430c6fe
// License: https://github.com/phoenixframework/phoenix/blob/master/LICENSE.md
class Serializer {
    constructor() {
        this.HEADER_LENGTH = 1;
    }
    decode(rawPayload, callback) {
        if (rawPayload.constructor === ArrayBuffer) {
            return callback(this._binaryDecode(rawPayload));
        }
        if (typeof rawPayload === 'string') {
            return callback(JSON.parse(rawPayload));
        }
        return callback({});
    }
    _binaryDecode(buffer) {
        const view = new DataView(buffer);
        const decoder = new TextDecoder();
        return this._decodeBroadcast(buffer, view, decoder);
    }
    _decodeBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1);
        const eventSize = view.getUint8(2);
        let offset = this.HEADER_LENGTH + 2;
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
        offset = offset + topicSize;
        const event = decoder.decode(buffer.slice(offset, offset + eventSize));
        offset = offset + eventSize;
        const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
        return { ref: null, topic: topic, event: event, payload: data };
    }
}

/**
 * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
 *
 * @example
 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *      return [1000, 5000, 10000][tries - 1] || 10000
 *    })
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 *    reconnectTimer.scheduleTimeout() // fires after 5000
 *    reconnectTimer.reset()
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 */
class Timer {
    constructor(callback, timerCalc) {
        this.callback = callback;
        this.timerCalc = timerCalc;
        this.timer = undefined;
        this.tries = 0;
        this.callback = callback;
        this.timerCalc = timerCalc;
    }
    reset() {
        this.tries = 0;
        clearTimeout(this.timer);
    }
    // Cancels any previous scheduleTimeout and schedules callback
    scheduleTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.tries = this.tries + 1;
            this.callback();
        }, this.timerCalc(this.tries + 1));
    }
}

/**
 * Helpers to convert the change Payload into native JS types.
 */
// Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
// 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
var PostgresTypes;
(function (PostgresTypes) {
    PostgresTypes["abstime"] = "abstime";
    PostgresTypes["bool"] = "bool";
    PostgresTypes["date"] = "date";
    PostgresTypes["daterange"] = "daterange";
    PostgresTypes["float4"] = "float4";
    PostgresTypes["float8"] = "float8";
    PostgresTypes["int2"] = "int2";
    PostgresTypes["int4"] = "int4";
    PostgresTypes["int4range"] = "int4range";
    PostgresTypes["int8"] = "int8";
    PostgresTypes["int8range"] = "int8range";
    PostgresTypes["json"] = "json";
    PostgresTypes["jsonb"] = "jsonb";
    PostgresTypes["money"] = "money";
    PostgresTypes["numeric"] = "numeric";
    PostgresTypes["oid"] = "oid";
    PostgresTypes["reltime"] = "reltime";
    PostgresTypes["text"] = "text";
    PostgresTypes["time"] = "time";
    PostgresTypes["timestamp"] = "timestamp";
    PostgresTypes["timestamptz"] = "timestamptz";
    PostgresTypes["timetz"] = "timetz";
    PostgresTypes["tsrange"] = "tsrange";
    PostgresTypes["tstzrange"] = "tstzrange";
})(PostgresTypes || (PostgresTypes = {}));
/**
 * Takes an array of columns and an object of string values then converts each string value
 * to its mapped type.
 *
 * @param {{name: String, type: String}[]} columns
 * @param {Object} record
 * @param {Object} options The map of various options that can be applied to the mapper
 * @param {Array} options.skipTypes The array of types that should not be converted
 *
 * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
 * //=>{ first_name: 'Paul', age: 33 }
 */
const convertChangeData = (columns, record, options = {}) => {
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    return Object.keys(record).reduce((acc, rec_key) => {
        acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
        return acc;
    }, {});
};
/**
 * Converts the value of an individual column.
 *
 * @param {String} columnName The column that you want to convert
 * @param {{name: String, type: String}[]} columns All of the columns
 * @param {Object} record The map of string values
 * @param {Array} skipTypes An array of types that should not be converted
 * @return {object} Useless information
 *
 * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
 * //=> 33
 * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
 * //=> "33"
 */
const convertColumn = (columnName, columns, record, skipTypes) => {
    const column = columns.find((x) => x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) {
        return convertCell(colType, value);
    }
    return noop$1(value);
};
/**
 * If the value of the cell is `null`, returns null.
 * Otherwise converts the string value to the correct type.
 * @param {String} type A postgres column type
 * @param {String} value The cell value
 *
 * @example convertCell('bool', 't')
 * //=> true
 * @example convertCell('int8', '10')
 * //=> 10
 * @example convertCell('_int4', '{1,2,3,4}')
 * //=> [1,2,3,4]
 */
const convertCell = (type, value) => {
    // if data type is an array
    if (type.charAt(0) === '_') {
        const dataType = type.slice(1, type.length);
        return toArray(value, dataType);
    }
    // If not null, convert to correct type.
    switch (type) {
        case PostgresTypes.bool:
            return toBoolean(value);
        case PostgresTypes.float4:
        case PostgresTypes.float8:
        case PostgresTypes.int2:
        case PostgresTypes.int4:
        case PostgresTypes.int8:
        case PostgresTypes.numeric:
        case PostgresTypes.oid:
            return toNumber(value);
        case PostgresTypes.json:
        case PostgresTypes.jsonb:
            return toJson(value);
        case PostgresTypes.timestamp:
            return toTimestampString(value); // Format to be consistent with PostgREST
        case PostgresTypes.abstime: // To allow users to cast it based on Timezone
        case PostgresTypes.date: // To allow users to cast it based on Timezone
        case PostgresTypes.daterange:
        case PostgresTypes.int4range:
        case PostgresTypes.int8range:
        case PostgresTypes.money:
        case PostgresTypes.reltime: // To allow users to cast it based on Timezone
        case PostgresTypes.text:
        case PostgresTypes.time: // To allow users to cast it based on Timezone
        case PostgresTypes.timestamptz: // To allow users to cast it based on Timezone
        case PostgresTypes.timetz: // To allow users to cast it based on Timezone
        case PostgresTypes.tsrange:
        case PostgresTypes.tstzrange:
            return noop$1(value);
        default:
            // Return the value for remaining types
            return noop$1(value);
    }
};
const noop$1 = (value) => {
    return value;
};
const toBoolean = (value) => {
    switch (value) {
        case 't':
            return true;
        case 'f':
            return false;
        default:
            return value;
    }
};
const toNumber = (value) => {
    if (typeof value === 'string') {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) {
            return parsedValue;
        }
    }
    return value;
};
const toJson = (value) => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            console.log(`JSON parse error: ${error}`);
            return value;
        }
    }
    return value;
};
/**
 * Converts a Postgres Array into a native JS array
 *
 * @example toArray('{}', 'int4')
 * //=> []
 * @example toArray('{"[2021-01-01,2021-12-31)","(2021-01-01,2021-12-32]"}', 'daterange')
 * //=> ['[2021-01-01,2021-12-31)', '(2021-01-01,2021-12-32]']
 * @example toArray([1,2,3,4], 'int4')
 * //=> [1,2,3,4]
 */
const toArray = (value, type) => {
    if (typeof value !== 'string') {
        return value;
    }
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    // Confirm value is a Postgres array by checking curly brackets
    if (openBrace === '{' && closeBrace === '}') {
        let arr;
        const valTrim = value.slice(1, lastIdx);
        // TODO: find a better solution to separate Postgres array data
        try {
            arr = JSON.parse('[' + valTrim + ']');
        }
        catch (_) {
            // WARNING: splitting on comma does not cover all edge cases
            arr = valTrim ? valTrim.split(',') : [];
        }
        return arr.map((val) => convertCell(type, val));
    }
    return value;
};
/**
 * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
 * See https://github.com/supabase/supabase/issues/18
 *
 * @example toTimestampString('2019-09-10 00:00:00')
 * //=> '2019-09-10T00:00:00'
 */
const toTimestampString = (value) => {
    if (typeof value === 'string') {
        return value.replace(' ', 'T');
    }
    return value;
};
const httpEndpointURL = (socketUrl) => {
    let url = socketUrl;
    url = url.replace(/^ws/i, 'http');
    url = url.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, '');
    return url.replace(/\/+$/, '');
};

class Push {
    /**
     * Initializes the Push
     *
     * @param channel The Channel
     * @param event The event, for example `"phx_join"`
     * @param payload The payload, for example `{user_id: 123}`
     * @param timeout The push timeout in milliseconds
     */
    constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
        this.channel = channel;
        this.event = event;
        this.payload = payload;
        this.timeout = timeout;
        this.sent = false;
        this.timeoutTimer = undefined;
        this.ref = '';
        this.receivedResp = null;
        this.recHooks = [];
        this.refEvent = null;
    }
    resend(timeout) {
        this.timeout = timeout;
        this._cancelRefEvent();
        this.ref = '';
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
    }
    send() {
        if (this._hasReceived('timeout')) {
            return;
        }
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
            topic: this.channel.topic,
            event: this.event,
            payload: this.payload,
            ref: this.ref,
            join_ref: this.channel._joinRef(),
        });
    }
    updatePayload(payload) {
        this.payload = Object.assign(Object.assign({}, this.payload), payload);
    }
    receive(status, callback) {
        var _a;
        if (this._hasReceived(status)) {
            callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
        }
        this.recHooks.push({ status, callback });
        return this;
    }
    startTimeout() {
        if (this.timeoutTimer) {
            return;
        }
        this.ref = this.channel.socket._makeRef();
        this.refEvent = this.channel._replyEventName(this.ref);
        const callback = (payload) => {
            this._cancelRefEvent();
            this._cancelTimeout();
            this.receivedResp = payload;
            this._matchReceive(payload);
        };
        this.channel._on(this.refEvent, {}, callback);
        this.timeoutTimer = setTimeout(() => {
            this.trigger('timeout', {});
        }, this.timeout);
    }
    trigger(status, response) {
        if (this.refEvent)
            this.channel._trigger(this.refEvent, { status, response });
    }
    destroy() {
        this._cancelRefEvent();
        this._cancelTimeout();
    }
    _cancelRefEvent() {
        if (!this.refEvent) {
            return;
        }
        this.channel._off(this.refEvent, {});
    }
    _cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = undefined;
    }
    _matchReceive({ status, response, }) {
        this.recHooks
            .filter((h) => h.status === status)
            .forEach((h) => h.callback(response));
    }
    _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
    }
}

/*
  This file draws heavily from https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/assets/js/phoenix/presence.js
  License: https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/LICENSE.md
*/
var REALTIME_PRESENCE_LISTEN_EVENTS;
(function (REALTIME_PRESENCE_LISTEN_EVENTS) {
    REALTIME_PRESENCE_LISTEN_EVENTS["SYNC"] = "sync";
    REALTIME_PRESENCE_LISTEN_EVENTS["JOIN"] = "join";
    REALTIME_PRESENCE_LISTEN_EVENTS["LEAVE"] = "leave";
})(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
class RealtimePresence {
    /**
     * Initializes the Presence.
     *
     * @param channel - The RealtimeChannel
     * @param opts - The options,
     *        for example `{events: {state: 'state', diff: 'diff'}}`
     */
    constructor(channel, opts) {
        this.channel = channel;
        this.state = {};
        this.pendingDiffs = [];
        this.joinRef = null;
        this.caller = {
            onJoin: () => { },
            onLeave: () => { },
            onSync: () => { },
        };
        const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
            state: 'presence_state',
            diff: 'presence_diff',
        };
        this.channel._on(events.state, {}, (newState) => {
            const { onJoin, onLeave, onSync } = this.caller;
            this.joinRef = this.channel._joinRef();
            this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
            this.pendingDiffs.forEach((diff) => {
                this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
            });
            this.pendingDiffs = [];
            onSync();
        });
        this.channel._on(events.diff, {}, (diff) => {
            const { onJoin, onLeave, onSync } = this.caller;
            if (this.inPendingSyncState()) {
                this.pendingDiffs.push(diff);
            }
            else {
                this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                onSync();
            }
        });
        this.onJoin((key, currentPresences, newPresences) => {
            this.channel._trigger('presence', {
                event: 'join',
                key,
                currentPresences,
                newPresences,
            });
        });
        this.onLeave((key, currentPresences, leftPresences) => {
            this.channel._trigger('presence', {
                event: 'leave',
                key,
                currentPresences,
                leftPresences,
            });
        });
        this.onSync(() => {
            this.channel._trigger('presence', { event: 'sync' });
        });
    }
    /**
     * Used to sync the list of presences on the server with the
     * client's state.
     *
     * An optional `onJoin` and `onLeave` callback can be provided to
     * react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @internal
     */
    static syncState(currentState, newState, onJoin, onLeave) {
        const state = this.cloneDeep(currentState);
        const transformedState = this.transformState(newState);
        const joins = {};
        const leaves = {};
        this.map(state, (key, presences) => {
            if (!transformedState[key]) {
                leaves[key] = presences;
            }
        });
        this.map(transformedState, (key, newPresences) => {
            const currentPresences = state[key];
            if (currentPresences) {
                const newPresenceRefs = newPresences.map((m) => m.presence_ref);
                const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
                const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
                const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
                if (joinedPresences.length > 0) {
                    joins[key] = joinedPresences;
                }
                if (leftPresences.length > 0) {
                    leaves[key] = leftPresences;
                }
            }
            else {
                joins[key] = newPresences;
            }
        });
        return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
    }
    /**
     * Used to sync a diff of presence join and leave events from the
     * server, as they happen.
     *
     * Like `syncState`, `syncDiff` accepts optional `onJoin` and
     * `onLeave` callbacks to react to a user joining or leaving from a
     * device.
     *
     * @internal
     */
    static syncDiff(state, diff, onJoin, onLeave) {
        const { joins, leaves } = {
            joins: this.transformState(diff.joins),
            leaves: this.transformState(diff.leaves),
        };
        if (!onJoin) {
            onJoin = () => { };
        }
        if (!onLeave) {
            onLeave = () => { };
        }
        this.map(joins, (key, newPresences) => {
            var _a;
            const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
            state[key] = this.cloneDeep(newPresences);
            if (currentPresences.length > 0) {
                const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
                const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
                state[key].unshift(...curPresences);
            }
            onJoin(key, currentPresences, newPresences);
        });
        this.map(leaves, (key, leftPresences) => {
            let currentPresences = state[key];
            if (!currentPresences)
                return;
            const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
            currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
            state[key] = currentPresences;
            onLeave(key, currentPresences, leftPresences);
            if (currentPresences.length === 0)
                delete state[key];
        });
        return state;
    }
    /** @internal */
    static map(obj, func) {
        return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
    }
    /**
     * Remove 'metas' key
     * Change 'phx_ref' to 'presence_ref'
     * Remove 'phx_ref' and 'phx_ref_prev'
     *
     * @example
     * // returns {
     *  abc123: [
     *    { presence_ref: '2', user_id: 1 },
     *    { presence_ref: '3', user_id: 2 }
     *  ]
     * }
     * RealtimePresence.transformState({
     *  abc123: {
     *    metas: [
     *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
     *      { phx_ref: '3', user_id: 2 }
     *    ]
     *  }
     * })
     *
     * @internal
     */
    static transformState(state) {
        state = this.cloneDeep(state);
        return Object.getOwnPropertyNames(state).reduce((newState, key) => {
            const presences = state[key];
            if ('metas' in presences) {
                newState[key] = presences.metas.map((presence) => {
                    presence['presence_ref'] = presence['phx_ref'];
                    delete presence['phx_ref'];
                    delete presence['phx_ref_prev'];
                    return presence;
                });
            }
            else {
                newState[key] = presences;
            }
            return newState;
        }, {});
    }
    /** @internal */
    static cloneDeep(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /** @internal */
    onJoin(callback) {
        this.caller.onJoin = callback;
    }
    /** @internal */
    onLeave(callback) {
        this.caller.onLeave = callback;
    }
    /** @internal */
    onSync(callback) {
        this.caller.onSync = callback;
    }
    /** @internal */
    inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef();
    }
}

var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
(function (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT) {
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["ALL"] = "*";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["INSERT"] = "INSERT";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["UPDATE"] = "UPDATE";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["DELETE"] = "DELETE";
})(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
var REALTIME_LISTEN_TYPES;
(function (REALTIME_LISTEN_TYPES) {
    REALTIME_LISTEN_TYPES["BROADCAST"] = "broadcast";
    REALTIME_LISTEN_TYPES["PRESENCE"] = "presence";
    REALTIME_LISTEN_TYPES["POSTGRES_CHANGES"] = "postgres_changes";
    REALTIME_LISTEN_TYPES["SYSTEM"] = "system";
})(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
var REALTIME_SUBSCRIBE_STATES;
(function (REALTIME_SUBSCRIBE_STATES) {
    REALTIME_SUBSCRIBE_STATES["SUBSCRIBED"] = "SUBSCRIBED";
    REALTIME_SUBSCRIBE_STATES["TIMED_OUT"] = "TIMED_OUT";
    REALTIME_SUBSCRIBE_STATES["CLOSED"] = "CLOSED";
    REALTIME_SUBSCRIBE_STATES["CHANNEL_ERROR"] = "CHANNEL_ERROR";
})(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
/** A channel is the basic building block of Realtime
 * and narrows the scope of data flow to subscribed clients.
 * You can think of a channel as a chatroom where participants are able to see who's online
 * and send and receive messages.
 */
class RealtimeChannel {
    constructor(
    /** Topic name can be any string. */
    topic, params = { config: {} }, socket) {
        this.topic = topic;
        this.params = params;
        this.socket = socket;
        this.bindings = {};
        this.state = CHANNEL_STATES.closed;
        this.joinedOnce = false;
        this.pushBuffer = [];
        this.subTopic = topic.replace(/^realtime:/i, '');
        this.params.config = Object.assign({
            broadcast: { ack: false, self: false },
            presence: { key: '' },
            private: false,
        }, params.config);
        this.timeout = this.socket.timeout;
        this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
        this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
        this.joinPush.receive('ok', () => {
            this.state = CHANNEL_STATES.joined;
            this.rejoinTimer.reset();
            this.pushBuffer.forEach((pushEvent) => pushEvent.send());
            this.pushBuffer = [];
        });
        this._onClose(() => {
            this.rejoinTimer.reset();
            this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`);
            this.state = CHANNEL_STATES.closed;
            this.socket._remove(this);
        });
        this._onError((reason) => {
            if (this._isLeaving() || this._isClosed()) {
                return;
            }
            this.socket.log('channel', `error ${this.topic}`, reason);
            this.state = CHANNEL_STATES.errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive('timeout', () => {
            if (!this._isJoining()) {
                return;
            }
            this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
            this.state = CHANNEL_STATES.errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
            this._trigger(this._replyEventName(ref), payload);
        });
        this.presence = new RealtimePresence(this);
        this.broadcastEndpointURL =
            httpEndpointURL(this.socket.endPoint) + '/api/broadcast';
        this.private = this.params.config.private || false;
    }
    /** Subscribe registers your client with the server */
    subscribe(callback, timeout = this.timeout) {
        var _a, _b;
        if (!this.socket.isConnected()) {
            this.socket.connect();
        }
        if (this.joinedOnce) {
            throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
        }
        else {
            const { config: { broadcast, presence, private: isPrivate }, } = this.params;
            this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
            this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CLOSED));
            const accessTokenPayload = {};
            const config = {
                broadcast,
                presence,
                postgres_changes: (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [],
                private: isPrivate,
            };
            if (this.socket.accessTokenValue) {
                accessTokenPayload.access_token = this.socket.accessTokenValue;
            }
            this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
            this.joinedOnce = true;
            this._rejoin(timeout);
            this.joinPush
                .receive('ok', async ({ postgres_changes }) => {
                var _a;
                this.socket.setAuth();
                if (postgres_changes === undefined) {
                    callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                    return;
                }
                else {
                    const clientPostgresBindings = this.bindings.postgres_changes;
                    const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
                    const newPostgresBindings = [];
                    for (let i = 0; i < bindingsLen; i++) {
                        const clientPostgresBinding = clientPostgresBindings[i];
                        const { filter: { event, schema, table, filter }, } = clientPostgresBinding;
                        const serverPostgresFilter = postgres_changes && postgres_changes[i];
                        if (serverPostgresFilter &&
                            serverPostgresFilter.event === event &&
                            serverPostgresFilter.schema === schema &&
                            serverPostgresFilter.table === table &&
                            serverPostgresFilter.filter === filter) {
                            newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
                        }
                        else {
                            this.unsubscribe();
                            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('mismatch between server and client bindings for postgres changes'));
                            return;
                        }
                    }
                    this.bindings.postgres_changes = newPostgresBindings;
                    callback && callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                    return;
                }
            })
                .receive('error', (error) => {
                callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(', ') || 'error')));
                return;
            })
                .receive('timeout', () => {
                callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
                return;
            });
        }
        return this;
    }
    presenceState() {
        return this.presence.state;
    }
    async track(payload, opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'track',
            payload,
        }, opts.timeout || this.timeout);
    }
    async untrack(opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'untrack',
        }, opts);
    }
    on(type, filter, callback) {
        return this._on(type, filter, callback);
    }
    /**
     * Sends a message into the channel.
     *
     * @param args Arguments to send to channel
     * @param args.type The type of event to send
     * @param args.event The name of the event being sent
     * @param args.payload Payload to be sent
     * @param opts Options to be used during the send process
     */
    async send(args, opts = {}) {
        var _a, _b;
        if (!this._canPush() && args.type === 'broadcast') {
            const { event, payload: endpoint_payload } = args;
            const authorization = this.socket.accessTokenValue
                ? `Bearer ${this.socket.accessTokenValue}`
                : '';
            const options = {
                method: 'POST',
                headers: {
                    Authorization: authorization,
                    apikey: this.socket.apiKey ? this.socket.apiKey : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            topic: this.subTopic,
                            event,
                            payload: endpoint_payload,
                            private: this.private,
                        },
                    ],
                }),
            };
            try {
                const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
                await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
                return response.ok ? 'ok' : 'error';
            }
            catch (error) {
                if (error.name === 'AbortError') {
                    return 'timed out';
                }
                else {
                    return 'error';
                }
            }
        }
        else {
            return new Promise((resolve) => {
                var _a, _b, _c;
                const push = this._push(args.type, args, opts.timeout || this.timeout);
                if (args.type === 'broadcast' && !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
                    resolve('ok');
                }
                push.receive('ok', () => resolve('ok'));
                push.receive('error', () => resolve('error'));
                push.receive('timeout', () => resolve('timed out'));
            });
        }
    }
    updateJoinPayload(payload) {
        this.joinPush.updatePayload(payload);
    }
    /**
     * Leaves the channel.
     *
     * Unsubscribes from server events, and instructs channel to terminate on server.
     * Triggers onClose() hooks.
     *
     * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
     * channel.unsubscribe().receive("ok", () => alert("left!") )
     */
    unsubscribe(timeout = this.timeout) {
        this.state = CHANNEL_STATES.leaving;
        const onClose = () => {
            this.socket.log('channel', `leave ${this.topic}`);
            this._trigger(CHANNEL_EVENTS.close, 'leave', this._joinRef());
        };
        this.rejoinTimer.reset();
        // Destroy joinPush to avoid connection timeouts during unscription phase
        this.joinPush.destroy();
        return new Promise((resolve) => {
            const leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
            leavePush
                .receive('ok', () => {
                onClose();
                resolve('ok');
            })
                .receive('timeout', () => {
                onClose();
                resolve('timed out');
            })
                .receive('error', () => {
                resolve('error');
            });
            leavePush.send();
            if (!this._canPush()) {
                leavePush.trigger('ok', {});
            }
        });
    }
    /** @internal */
    async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
        clearTimeout(id);
        return response;
    }
    /** @internal */
    _push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) {
            throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        }
        let pushEvent = new Push(this, event, payload, timeout);
        if (this._canPush()) {
            pushEvent.send();
        }
        else {
            pushEvent.startTimeout();
            this.pushBuffer.push(pushEvent);
        }
        return pushEvent;
    }
    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling before dispatching to the channel callbacks.
     * Must return the payload, modified or unmodified.
     *
     * @internal
     */
    _onMessage(_event, payload, _ref) {
        return payload;
    }
    /** @internal */
    _isMember(topic) {
        return this.topic === topic;
    }
    /** @internal */
    _joinRef() {
        return this.joinPush.ref;
    }
    /** @internal */
    _trigger(type, payload, ref) {
        var _a, _b;
        const typeLower = type.toLocaleLowerCase();
        const { close, error, leave, join } = CHANNEL_EVENTS;
        const events = [close, error, leave, join];
        if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
            return;
        }
        let handledPayload = this._onMessage(typeLower, payload, ref);
        if (payload && !handledPayload) {
            throw 'channel onMessage callbacks must return the payload, modified or unmodified';
        }
        if (['insert', 'update', 'delete'].includes(typeLower)) {
            (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
                var _a, _b, _c;
                return (((_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event) === '*' ||
                    ((_c = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower);
            }).map((bind) => bind.callback(handledPayload, ref));
        }
        else {
            (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
                var _a, _b, _c, _d, _e, _f;
                if (['broadcast', 'presence', 'postgres_changes'].includes(typeLower)) {
                    if ('id' in bind) {
                        const bindId = bind.id;
                        const bindEvent = (_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event;
                        return (bindId &&
                            ((_b = payload.ids) === null || _b === void 0 ? void 0 : _b.includes(bindId)) &&
                            (bindEvent === '*' ||
                                (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) ===
                                    ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase())));
                    }
                    else {
                        const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                        return (bindEvent === '*' ||
                            bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase()));
                    }
                }
                else {
                    return bind.type.toLocaleLowerCase() === typeLower;
                }
            }).map((bind) => {
                if (typeof handledPayload === 'object' && 'ids' in handledPayload) {
                    const postgresChanges = handledPayload.data;
                    const { schema, table, commit_timestamp, type, errors } = postgresChanges;
                    const enrichedPayload = {
                        schema: schema,
                        table: table,
                        commit_timestamp: commit_timestamp,
                        eventType: type,
                        new: {},
                        old: {},
                        errors: errors,
                    };
                    handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
                }
                bind.callback(handledPayload, ref);
            });
        }
    }
    /** @internal */
    _isClosed() {
        return this.state === CHANNEL_STATES.closed;
    }
    /** @internal */
    _isJoined() {
        return this.state === CHANNEL_STATES.joined;
    }
    /** @internal */
    _isJoining() {
        return this.state === CHANNEL_STATES.joining;
    }
    /** @internal */
    _isLeaving() {
        return this.state === CHANNEL_STATES.leaving;
    }
    /** @internal */
    _replyEventName(ref) {
        return `chan_reply_${ref}`;
    }
    /** @internal */
    _on(type, filter, callback) {
        const typeLower = type.toLocaleLowerCase();
        const binding = {
            type: typeLower,
            filter: filter,
            callback: callback,
        };
        if (this.bindings[typeLower]) {
            this.bindings[typeLower].push(binding);
        }
        else {
            this.bindings[typeLower] = [binding];
        }
        return this;
    }
    /** @internal */
    _off(type, filter) {
        const typeLower = type.toLocaleLowerCase();
        this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
            var _a;
            return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower &&
                RealtimeChannel.isEqual(bind.filter, filter));
        });
        return this;
    }
    /** @internal */
    static isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
        }
        for (const k in obj1) {
            if (obj1[k] !== obj2[k]) {
                return false;
            }
        }
        return true;
    }
    /** @internal */
    _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) {
            this._rejoin();
        }
    }
    /**
     * Registers a callback that will be executed when the channel closes.
     *
     * @internal
     */
    _onClose(callback) {
        this._on(CHANNEL_EVENTS.close, {}, callback);
    }
    /**
     * Registers a callback that will be executed when the channel encounteres an error.
     *
     * @internal
     */
    _onError(callback) {
        this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
    }
    /**
     * Returns `true` if the socket is connected and the channel has been joined.
     *
     * @internal
     */
    _canPush() {
        return this.socket.isConnected() && this._isJoined();
    }
    /** @internal */
    _rejoin(timeout = this.timeout) {
        if (this._isLeaving()) {
            return;
        }
        this.socket._leaveOpenTopic(this.topic);
        this.state = CHANNEL_STATES.joining;
        this.joinPush.resend(timeout);
    }
    /** @internal */
    _getPayloadRecords(payload) {
        const records = {
            new: {},
            old: {},
        };
        if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
            records.new = convertChangeData(payload.columns, payload.record);
        }
        if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
            records.old = convertChangeData(payload.columns, payload.old_record);
        }
        return records;
    }
}

const noop = () => { };
const NATIVE_WEBSOCKET_AVAILABLE = typeof WebSocket !== 'undefined';
const WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
class RealtimeClient {
    /**
     * Initializes the Socket.
     *
     * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
     * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
     * @param options.transport The Websocket Transport, for example WebSocket.
     * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
     * @param options.params The optional params to pass when connecting.
     * @param options.headers The optional headers to pass when connecting.
     * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
     * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
     * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
     * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
     * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
     * @param options.worker Use Web Worker to set a side flow. Defaults to false.
     * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
     */
    constructor(endPoint, options) {
        var _a;
        this.accessTokenValue = null;
        this.apiKey = null;
        this.channels = [];
        this.endPoint = '';
        this.httpEndpoint = '';
        this.headers = DEFAULT_HEADERS$3;
        this.params = {};
        this.timeout = DEFAULT_TIMEOUT;
        this.heartbeatIntervalMs = 30000;
        this.heartbeatTimer = undefined;
        this.pendingHeartbeatRef = null;
        this.ref = 0;
        this.logger = noop;
        this.conn = null;
        this.sendBuffer = [];
        this.serializer = new Serializer();
        this.stateChangeCallbacks = {
            open: [],
            close: [],
            error: [],
            message: [],
        };
        this.accessToken = null;
        /**
         * Use either custom fetch, if provided, or default fetch to make HTTP requests
         *
         * @internal
         */
        this._resolveFetch = (customFetch) => {
            let _fetch;
            if (customFetch) {
                _fetch = customFetch;
            }
            else if (typeof fetch === 'undefined') {
                _fetch = (...args) => __vitePreload(() => Promise.resolve().then(() => browser),true?void 0:void 0).then(({ default: fetch }) => fetch(...args));
            }
            else {
                _fetch = fetch;
            }
            return (...args) => _fetch(...args);
        };
        this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
        this.httpEndpoint = httpEndpointURL(endPoint);
        if (options === null || options === void 0 ? void 0 : options.transport) {
            this.transport = options.transport;
        }
        else {
            this.transport = null;
        }
        if (options === null || options === void 0 ? void 0 : options.params)
            this.params = options.params;
        if (options === null || options === void 0 ? void 0 : options.headers)
            this.headers = Object.assign(Object.assign({}, this.headers), options.headers);
        if (options === null || options === void 0 ? void 0 : options.timeout)
            this.timeout = options.timeout;
        if (options === null || options === void 0 ? void 0 : options.logger)
            this.logger = options.logger;
        if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
            this.heartbeatIntervalMs = options.heartbeatIntervalMs;
        const accessTokenValue = (_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey;
        if (accessTokenValue) {
            this.accessTokenValue = accessTokenValue;
            this.apiKey = accessTokenValue;
        }
        this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs)
            ? options.reconnectAfterMs
            : (tries) => {
                return [1000, 2000, 5000, 10000][tries - 1] || 10000;
            };
        this.encode = (options === null || options === void 0 ? void 0 : options.encode)
            ? options.encode
            : (payload, callback) => {
                return callback(JSON.stringify(payload));
            };
        this.decode = (options === null || options === void 0 ? void 0 : options.decode)
            ? options.decode
            : this.serializer.decode.bind(this.serializer);
        this.reconnectTimer = new Timer(async () => {
            this.disconnect();
            this.connect();
        }, this.reconnectAfterMs);
        this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
        if (options === null || options === void 0 ? void 0 : options.worker) {
            if (typeof window !== 'undefined' && !window.Worker) {
                throw new Error('Web Worker is not supported');
            }
            this.worker = (options === null || options === void 0 ? void 0 : options.worker) || false;
            this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
        }
        this.accessToken = (options === null || options === void 0 ? void 0 : options.accessToken) || null;
    }
    /**
     * Connects the socket, unless already connected.
     */
    connect() {
        if (this.conn) {
            return;
        }
        if (this.transport) {
            this.conn = new this.transport(this.endpointURL(), undefined, {
                headers: this.headers,
            });
            return;
        }
        if (NATIVE_WEBSOCKET_AVAILABLE) {
            this.conn = new WebSocket(this.endpointURL());
            this.setupConnection();
            return;
        }
        this.conn = new WSWebSocketDummy(this.endpointURL(), undefined, {
            close: () => {
                this.conn = null;
            },
        });
        __vitePreload(() => import('./browser-98402157.js').then(n => n.b),true?[]:void 0).then(({ default: WS }) => {
            this.conn = new WS(this.endpointURL(), undefined, {
                headers: this.headers,
            });
            this.setupConnection();
        });
    }
    /**
     * Returns the URL of the websocket.
     * @returns string The URL of the websocket.
     */
    endpointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
    }
    /**
     * Disconnects the socket.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */
    disconnect(code, reason) {
        if (this.conn) {
            this.conn.onclose = function () { }; // noop
            if (code) {
                this.conn.close(code, reason !== null && reason !== void 0 ? reason : '');
            }
            else {
                this.conn.close();
            }
            this.conn = null;
            // remove open handles
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.reconnectTimer.reset();
        }
    }
    /**
     * Returns all created channels
     */
    getChannels() {
        return this.channels;
    }
    /**
     * Unsubscribes and removes a single channel
     * @param channel A RealtimeChannel instance
     */
    async removeChannel(channel) {
        const status = await channel.unsubscribe();
        if (this.channels.length === 0) {
            this.disconnect();
        }
        return status;
    }
    /**
     * Unsubscribes and removes all channels
     */
    async removeAllChannels() {
        const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
        this.disconnect();
        return values_1;
    }
    /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */
    log(kind, msg, data) {
        this.logger(kind, msg, data);
    }
    /**
     * Returns the current state of the socket.
     */
    connectionState() {
        switch (this.conn && this.conn.readyState) {
            case SOCKET_STATES.connecting:
                return CONNECTION_STATE.Connecting;
            case SOCKET_STATES.open:
                return CONNECTION_STATE.Open;
            case SOCKET_STATES.closing:
                return CONNECTION_STATE.Closing;
            default:
                return CONNECTION_STATE.Closed;
        }
    }
    /**
     * Returns `true` is the connection is open.
     */
    isConnected() {
        return this.connectionState() === CONNECTION_STATE.Open;
    }
    channel(topic, params = { config: {} }) {
        const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
        this.channels.push(chan);
        return chan;
    }
    /**
     * Push out a message if the socket is connected.
     *
     * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
     */
    push(data) {
        const { topic, event, payload, ref } = data;
        const callback = () => {
            this.encode(data, (result) => {
                var _a;
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
            });
        };
        this.log('push', `${topic} ${event} (${ref})`, payload);
        if (this.isConnected()) {
            callback();
        }
        else {
            this.sendBuffer.push(callback);
        }
    }
    /**
     * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
     *
     * If param is null it will use the `accessToken` callback function or the token set on the client.
     *
     * On callback used, it will set the value of the token internal to the client.
     *
     * @param token A JWT string to override the token set on the client.
     */
    async setAuth(token = null) {
        let tokenToSend = token ||
            (this.accessToken && (await this.accessToken())) ||
            this.accessTokenValue;
        if (tokenToSend) {
            let parsed = null;
            try {
                parsed = JSON.parse(atob(tokenToSend.split('.')[1]));
            }
            catch (_error) { }
            if (parsed && parsed.exp) {
                let now = Math.floor(Date.now() / 1000);
                let valid = now - parsed.exp < 0;
                if (!valid) {
                    this.log('auth', `InvalidJWTToken: Invalid value for JWT claim "exp" with value ${parsed.exp}`);
                    return Promise.reject(`InvalidJWTToken: Invalid value for JWT claim "exp" with value ${parsed.exp}`);
                }
            }
            this.accessTokenValue = tokenToSend;
            this.channels.forEach((channel) => {
                tokenToSend && channel.updateJoinPayload({ access_token: tokenToSend });
                if (channel.joinedOnce && channel._isJoined()) {
                    channel._push(CHANNEL_EVENTS.access_token, {
                        access_token: tokenToSend,
                    });
                }
            });
        }
    }
    /**
     * Sends a heartbeat message if the socket is connected.
     */
    async sendHeartbeat() {
        var _a;
        if (!this.isConnected()) {
            return;
        }
        if (this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null;
            this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
            (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'hearbeat timeout');
            return;
        }
        this.pendingHeartbeatRef = this._makeRef();
        this.push({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: this.pendingHeartbeatRef,
        });
        this.setAuth();
    }
    /**
     * Flushes send buffer
     */
    flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
            this.sendBuffer.forEach((callback) => callback());
            this.sendBuffer = [];
        }
    }
    /**
     * Return the next message ref, accounting for overflows
     *
     * @internal
     */
    _makeRef() {
        let newRef = this.ref + 1;
        if (newRef === this.ref) {
            this.ref = 0;
        }
        else {
            this.ref = newRef;
        }
        return this.ref.toString();
    }
    /**
     * Unsubscribe from channels with the specified topic.
     *
     * @internal
     */
    _leaveOpenTopic(topic) {
        let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
        if (dupChannel) {
            this.log('transport', `leaving duplicate topic "${topic}"`);
            dupChannel.unsubscribe();
        }
    }
    /**
     * Removes a subscription from the socket.
     *
     * @param channel An open subscription.
     *
     * @internal
     */
    _remove(channel) {
        this.channels = this.channels.filter((c) => c._joinRef() !== channel._joinRef());
    }
    /**
     * Sets up connection handlers.
     *
     * @internal
     */
    setupConnection() {
        if (this.conn) {
            this.conn.binaryType = 'arraybuffer';
            this.conn.onopen = () => this._onConnOpen();
            this.conn.onerror = (error) => this._onConnError(error);
            this.conn.onmessage = (event) => this._onConnMessage(event);
            this.conn.onclose = (event) => this._onConnClose(event);
        }
    }
    /** @internal */
    _onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg) => {
            let { topic, event, payload, ref } = msg;
            if (ref && ref === this.pendingHeartbeatRef) {
                this.pendingHeartbeatRef = null;
            }
            this.log('receive', `${payload.status || ''} ${topic} ${event} ${(ref && '(' + ref + ')') || ''}`, payload);
            this.channels
                .filter((channel) => channel._isMember(topic))
                .forEach((channel) => channel._trigger(event, payload, ref));
            this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
        });
    }
    /** @internal */
    async _onConnOpen() {
        this.log('transport', `connected to ${this.endpointURL()}`);
        this.flushSendBuffer();
        this.reconnectTimer.reset();
        if (!this.worker) {
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
        }
        else {
            if (this.workerUrl) {
                this.log('worker', `starting worker for from ${this.workerUrl}`);
            }
            else {
                this.log('worker', `starting default worker`);
            }
            const objectUrl = this._workerObjectUrl(this.workerUrl);
            this.workerRef = new Worker(objectUrl);
            this.workerRef.onerror = (error) => {
                this.log('worker', 'worker error', error.message);
                this.workerRef.terminate();
            };
            this.workerRef.onmessage = (event) => {
                if (event.data.event === 'keepAlive') {
                    this.sendHeartbeat();
                }
            };
            this.workerRef.postMessage({
                event: 'start',
                interval: this.heartbeatIntervalMs,
            });
        }
        this.stateChangeCallbacks.open.forEach((callback) => callback());
    }
    /** @internal */
    _onConnClose(event) {
        this.log('transport', 'close', event);
        this._triggerChanError();
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.reconnectTimer.scheduleTimeout();
        this.stateChangeCallbacks.close.forEach((callback) => callback(event));
    }
    /** @internal */
    _onConnError(error) {
        this.log('transport', error.message);
        this._triggerChanError();
        this.stateChangeCallbacks.error.forEach((callback) => callback(error));
    }
    /** @internal */
    _triggerChanError() {
        this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
    }
    /** @internal */
    _appendParams(url, params) {
        if (Object.keys(params).length === 0) {
            return url;
        }
        const prefix = url.match(/\?/) ? '&' : '?';
        const query = new URLSearchParams(params);
        return `${url}${prefix}${query}`;
    }
    _workerObjectUrl(url) {
        let result_url;
        if (url) {
            result_url = url;
        }
        else {
            const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
            result_url = URL.createObjectURL(blob);
        }
        return result_url;
    }
}
class WSWebSocketDummy {
    constructor(address, _protocols, options) {
        this.binaryType = 'arraybuffer';
        this.onclose = () => { };
        this.onerror = () => { };
        this.onmessage = () => { };
        this.onopen = () => { };
        this.readyState = SOCKET_STATES.connecting;
        this.send = () => { };
        this.url = null;
        this.url = address;
        this.close = options.close;
    }
}

class StorageError extends Error {
    constructor(message) {
        super(message);
        this.__isStorageError = true;
        this.name = 'StorageError';
    }
}
function isStorageError(error) {
    return typeof error === 'object' && error !== null && '__isStorageError' in error;
}
class StorageApiError extends StorageError {
    constructor(message, status) {
        super(message);
        this.name = 'StorageApiError';
        this.status = status;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
        };
    }
}
class StorageUnknownError extends StorageError {
    constructor(message, originalError) {
        super(message);
        this.name = 'StorageUnknownError';
        this.originalError = originalError;
    }
}

var __awaiter$6 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const resolveFetch$2 = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else if (typeof fetch === 'undefined') {
        _fetch = (...args) => __vitePreload(() => Promise.resolve().then(() => browser),true?void 0:void 0).then(({ default: fetch }) => fetch(...args));
    }
    else {
        _fetch = fetch;
    }
    return (...args) => _fetch(...args);
};
const resolveResponse = () => __awaiter$6(void 0, void 0, void 0, function* () {
    if (typeof Response === 'undefined') {
        // @ts-ignore
        return (yield __vitePreload(() => Promise.resolve().then(() => browser),true?void 0:void 0)).Response;
    }
    return Response;
});
const recursiveToCamel = (item) => {
    if (Array.isArray(item)) {
        return item.map((el) => recursiveToCamel(el));
    }
    else if (typeof item === 'function' || item !== Object(item)) {
        return item;
    }
    const result = {};
    Object.entries(item).forEach(([key, value]) => {
        const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ''));
        result[newKey] = recursiveToCamel(value);
    });
    return result;
};

var __awaiter$5 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
const handleError$1 = (error, reject, options) => __awaiter$5(void 0, void 0, void 0, function* () {
    const Res = yield resolveResponse();
    if (error instanceof Res && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
        error
            .json()
            .then((err) => {
            reject(new StorageApiError(_getErrorMessage$1(err), error.status || 500));
        })
            .catch((err) => {
            reject(new StorageUnknownError(_getErrorMessage$1(err), err));
        });
    }
    else {
        reject(new StorageUnknownError(_getErrorMessage$1(error), error));
    }
});
const _getRequestParams$1 = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === 'GET') {
        return params;
    }
    params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
    if (body) {
        params.body = JSON.stringify(body);
    }
    return Object.assign(Object.assign({}, params), parameters);
};
function _handleRequest$1(fetcher, method, url, options, parameters, body) {
    return __awaiter$5(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fetcher(url, _getRequestParams$1(method, options, parameters, body))
                .then((result) => {
                if (!result.ok)
                    throw result;
                if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                    return result;
                return result.json();
            })
                .then((data) => resolve(data))
                .catch((error) => handleError$1(error, reject, options));
        });
    });
}
function get(fetcher, url, options, parameters) {
    return __awaiter$5(this, void 0, void 0, function* () {
        return _handleRequest$1(fetcher, 'GET', url, options, parameters);
    });
}
function post(fetcher, url, body, options, parameters) {
    return __awaiter$5(this, void 0, void 0, function* () {
        return _handleRequest$1(fetcher, 'POST', url, options, parameters, body);
    });
}
function put(fetcher, url, body, options, parameters) {
    return __awaiter$5(this, void 0, void 0, function* () {
        return _handleRequest$1(fetcher, 'PUT', url, options, parameters, body);
    });
}
function head(fetcher, url, options, parameters) {
    return __awaiter$5(this, void 0, void 0, function* () {
        return _handleRequest$1(fetcher, 'HEAD', url, Object.assign(Object.assign({}, options), { noResolveJson: true }), parameters);
    });
}
function remove(fetcher, url, body, options, parameters) {
    return __awaiter$5(this, void 0, void 0, function* () {
        return _handleRequest$1(fetcher, 'DELETE', url, options, parameters, body);
    });
}

var __awaiter$4 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DEFAULT_SEARCH_OPTIONS = {
    limit: 100,
    offset: 0,
    sortBy: {
        column: 'name',
        order: 'asc',
    },
};
const DEFAULT_FILE_OPTIONS = {
    cacheControl: '3600',
    contentType: 'text/plain;charset=UTF-8',
    upsert: false,
};
class StorageFileApi {
    constructor(url, headers = {}, bucketId, fetch) {
        this.url = url;
        this.headers = headers;
        this.bucketId = bucketId;
        this.fetch = resolveFetch$2(fetch);
    }
    /**
     * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
     *
     * @param method HTTP method.
     * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    uploadOrUpdate(method, path, fileBody, fileOptions) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                let body;
                const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                let headers = Object.assign(Object.assign({}, this.headers), (method === 'POST' && { 'x-upsert': String(options.upsert) }));
                const metadata = options.metadata;
                if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                    body = new FormData();
                    body.append('cacheControl', options.cacheControl);
                    if (metadata) {
                        body.append('metadata', this.encodeMetadata(metadata));
                    }
                    body.append('', fileBody);
                }
                else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                    body = fileBody;
                    body.append('cacheControl', options.cacheControl);
                    if (metadata) {
                        body.append('metadata', this.encodeMetadata(metadata));
                    }
                }
                else {
                    body = fileBody;
                    headers['cache-control'] = `max-age=${options.cacheControl}`;
                    headers['content-type'] = options.contentType;
                    if (metadata) {
                        headers['x-metadata'] = this.toBase64(this.encodeMetadata(metadata));
                    }
                }
                if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) {
                    headers = Object.assign(Object.assign({}, headers), fileOptions.headers);
                }
                const cleanPath = this._removeEmptyFolders(path);
                const _path = this._getFinalPath(cleanPath);
                const res = yield this.fetch(`${this.url}/object/${_path}`, Object.assign({ method, body: body, headers }, ((options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {})));
                const data = yield res.json();
                if (res.ok) {
                    return {
                        data: { path: cleanPath, id: data.Id, fullPath: data.Key },
                        error: null,
                    };
                }
                else {
                    const error = data;
                    return { data: null, error };
                }
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Uploads a file to an existing bucket.
     *
     * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    upload(path, fileBody, fileOptions) {
        return __awaiter$4(this, void 0, void 0, function* () {
            return this.uploadOrUpdate('POST', path, fileBody, fileOptions);
        });
    }
    /**
     * Upload a file with a token generated from `createSignedUploadUrl`.
     * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param token The token generated from `createSignedUploadUrl`
     * @param fileBody The body of the file to be stored in the bucket.
     */
    uploadToSignedUrl(path, token, fileBody, fileOptions) {
        return __awaiter$4(this, void 0, void 0, function* () {
            const cleanPath = this._removeEmptyFolders(path);
            const _path = this._getFinalPath(cleanPath);
            const url = new URL(this.url + `/object/upload/sign/${_path}`);
            url.searchParams.set('token', token);
            try {
                let body;
                const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
                const headers = Object.assign(Object.assign({}, this.headers), { 'x-upsert': String(options.upsert) });
                if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                    body = new FormData();
                    body.append('cacheControl', options.cacheControl);
                    body.append('', fileBody);
                }
                else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                    body = fileBody;
                    body.append('cacheControl', options.cacheControl);
                }
                else {
                    body = fileBody;
                    headers['cache-control'] = `max-age=${options.cacheControl}`;
                    headers['content-type'] = options.contentType;
                }
                const res = yield this.fetch(url.toString(), {
                    method: 'PUT',
                    body: body,
                    headers,
                });
                const data = yield res.json();
                if (res.ok) {
                    return {
                        data: { path: cleanPath, fullPath: data.Key },
                        error: null,
                    };
                }
                else {
                    const error = data;
                    return { data: null, error };
                }
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Creates a signed upload URL.
     * Signed upload URLs can be used to upload files to the bucket without further authentication.
     * They are valid for 2 hours.
     * @param path The file path, including the current file name. For example `folder/image.png`.
     * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
     */
    createSignedUploadUrl(path, options) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                let _path = this._getFinalPath(path);
                const headers = Object.assign({}, this.headers);
                if (options === null || options === void 0 ? void 0 : options.upsert) {
                    headers['x-upsert'] = 'true';
                }
                const data = yield post(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers });
                const url = new URL(this.url + data.url);
                const token = url.searchParams.get('token');
                if (!token) {
                    throw new StorageError('No token returned by API');
                }
                return { data: { signedUrl: url.toString(), path, token }, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Replaces an existing file at the specified path with a new one.
     *
     * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    update(path, fileBody, fileOptions) {
        return __awaiter$4(this, void 0, void 0, function* () {
            return this.uploadOrUpdate('PUT', path, fileBody, fileOptions);
        });
    }
    /**
     * Moves an existing file to a new path in the same bucket.
     *
     * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
     * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
     * @param options The destination options.
     */
    move(fromPath, toPath, options) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                const data = yield post(this.fetch, `${this.url}/object/move`, {
                    bucketId: this.bucketId,
                    sourceKey: fromPath,
                    destinationKey: toPath,
                    destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket,
                }, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Copies an existing file to a new path in the same bucket.
     *
     * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
     * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
     * @param options The destination options.
     */
    copy(fromPath, toPath, options) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                const data = yield post(this.fetch, `${this.url}/object/copy`, {
                    bucketId: this.bucketId,
                    sourceKey: fromPath,
                    destinationKey: toPath,
                    destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket,
                }, { headers: this.headers });
                return { data: { path: data.Key }, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
     *
     * @param path The file path, including the current file name. For example `folder/image.png`.
     * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
     * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     * @param options.transform Transform the asset before serving it to the client.
     */
    createSignedUrl(path, expiresIn, options) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                let _path = this._getFinalPath(path);
                let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, ((options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {})), { headers: this.headers });
                const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                    ? `&download=${options.download === true ? '' : options.download}`
                    : '';
                const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
                data = { signedUrl };
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
     *
     * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
     * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
     * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     */
    createSignedUrls(paths, expiresIn, options) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                const data = yield post(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
                const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                    ? `&download=${options.download === true ? '' : options.download}`
                    : '';
                return {
                    data: data.map((datum) => (Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL
                            ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`)
                            : null }))),
                    error: null,
                };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
     *
     * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
     * @param options.transform Transform the asset before serving it to the client.
     */
    download(path, options) {
        return __awaiter$4(this, void 0, void 0, function* () {
            const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
            const renderPath = wantsTransformation ? 'render/image/authenticated' : 'object';
            const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
            const queryString = transformationQuery ? `?${transformationQuery}` : '';
            try {
                const _path = this._getFinalPath(path);
                const res = yield get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
                    headers: this.headers,
                    noResolveJson: true,
                });
                const data = yield res.blob();
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the details of an existing file.
     * @param path
     */
    info(path) {
        return __awaiter$4(this, void 0, void 0, function* () {
            const _path = this._getFinalPath(path);
            try {
                const data = yield get(this.fetch, `${this.url}/object/info/${_path}`, {
                    headers: this.headers,
                });
                return { data: recursiveToCamel(data), error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Checks the existence of a file.
     * @param path
     */
    exists(path) {
        return __awaiter$4(this, void 0, void 0, function* () {
            const _path = this._getFinalPath(path);
            try {
                yield head(this.fetch, `${this.url}/object/${_path}`, {
                    headers: this.headers,
                });
                return { data: true, error: null };
            }
            catch (error) {
                if (isStorageError(error) && error instanceof StorageUnknownError) {
                    const originalError = error.originalError;
                    if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) {
                        return { data: false, error };
                    }
                }
                throw error;
            }
        });
    }
    /**
     * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
     * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
     *
     * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
     * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     * @param options.transform Transform the asset before serving it to the client.
     */
    getPublicUrl(path, options) {
        const _path = this._getFinalPath(path);
        const _queryString = [];
        const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
            ? `download=${options.download === true ? '' : options.download}`
            : '';
        if (downloadQueryParam !== '') {
            _queryString.push(downloadQueryParam);
        }
        const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
        const renderPath = wantsTransformation ? 'render/image' : 'object';
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        if (transformationQuery !== '') {
            _queryString.push(transformationQuery);
        }
        let queryString = _queryString.join('&');
        if (queryString !== '') {
            queryString = `?${queryString}`;
        }
        return {
            data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) },
        };
    }
    /**
     * Deletes files within the same bucket
     *
     * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
     */
    remove(paths) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Get file metadata
     * @param id the file id to retrieve metadata
     */
    // async getMetadata(
    //   id: string
    // ): Promise<
    //   | {
    //       data: Metadata
    //       error: null
    //     }
    //   | {
    //       data: null
    //       error: StorageError
    //     }
    // > {
    //   try {
    //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
    //     return { data, error: null }
    //   } catch (error) {
    //     if (isStorageError(error)) {
    //       return { data: null, error }
    //     }
    //     throw error
    //   }
    // }
    /**
     * Update file metadata
     * @param id the file id to update metadata
     * @param meta the new file metadata
     */
    // async updateMetadata(
    //   id: string,
    //   meta: Metadata
    // ): Promise<
    //   | {
    //       data: Metadata
    //       error: null
    //     }
    //   | {
    //       data: null
    //       error: StorageError
    //     }
    // > {
    //   try {
    //     const data = await post(
    //       this.fetch,
    //       `${this.url}/metadata/${id}`,
    //       { ...meta },
    //       { headers: this.headers }
    //     )
    //     return { data, error: null }
    //   } catch (error) {
    //     if (isStorageError(error)) {
    //       return { data: null, error }
    //     }
    //     throw error
    //   }
    // }
    /**
     * Lists all the files within a bucket.
     * @param path The folder path.
     */
    list(path, options, parameters) {
        return __awaiter$4(this, void 0, void 0, function* () {
            try {
                const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || '' });
                const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    encodeMetadata(metadata) {
        return JSON.stringify(metadata);
    }
    toBase64(data) {
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(data).toString('base64');
        }
        return btoa(data);
    }
    _getFinalPath(path) {
        return `${this.bucketId}/${path}`;
    }
    _removeEmptyFolders(path) {
        return path.replace(/^\/|\/$/g, '').replace(/\/+/g, '/');
    }
    transformOptsToQueryString(transform) {
        const params = [];
        if (transform.width) {
            params.push(`width=${transform.width}`);
        }
        if (transform.height) {
            params.push(`height=${transform.height}`);
        }
        if (transform.resize) {
            params.push(`resize=${transform.resize}`);
        }
        if (transform.format) {
            params.push(`format=${transform.format}`);
        }
        if (transform.quality) {
            params.push(`quality=${transform.quality}`);
        }
        return params.join('&');
    }
}

// generated by genversion
const version$2 = '2.7.1';

const DEFAULT_HEADERS$2 = { 'X-Client-Info': `storage-js/${version$2}` };

var __awaiter$3 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class StorageBucketApi {
    constructor(url, headers = {}, fetch) {
        this.url = url;
        this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
        this.fetch = resolveFetch$2(fetch);
    }
    /**
     * Retrieves the details of all Storage buckets within an existing project.
     */
    listBuckets() {
        return __awaiter$3(this, void 0, void 0, function* () {
            try {
                const data = yield get(this.fetch, `${this.url}/bucket`, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the details of an existing Storage bucket.
     *
     * @param id The unique identifier of the bucket you would like to retrieve.
     */
    getBucket(id) {
        return __awaiter$3(this, void 0, void 0, function* () {
            try {
                const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Creates a new Storage bucket
     *
     * @param id A unique identifier for the bucket you are creating.
     * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
     * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
     * The global file size limit takes precedence over this value.
     * The default value is null, which doesn't set a per bucket file size limit.
     * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
     * The default value is null, which allows files with all mime types to be uploaded.
     * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
     * @returns newly created bucket id
     */
    createBucket(id, options = {
        public: false,
    }) {
        return __awaiter$3(this, void 0, void 0, function* () {
            try {
                const data = yield post(this.fetch, `${this.url}/bucket`, {
                    id,
                    name: id,
                    public: options.public,
                    file_size_limit: options.fileSizeLimit,
                    allowed_mime_types: options.allowedMimeTypes,
                }, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Updates a Storage bucket
     *
     * @param id A unique identifier for the bucket you are updating.
     * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
     * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
     * The global file size limit takes precedence over this value.
     * The default value is null, which doesn't set a per bucket file size limit.
     * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
     * The default value is null, which allows files with all mime types to be uploaded.
     * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
     */
    updateBucket(id, options) {
        return __awaiter$3(this, void 0, void 0, function* () {
            try {
                const data = yield put(this.fetch, `${this.url}/bucket/${id}`, {
                    id,
                    name: id,
                    public: options.public,
                    file_size_limit: options.fileSizeLimit,
                    allowed_mime_types: options.allowedMimeTypes,
                }, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Removes all objects inside a single bucket.
     *
     * @param id The unique identifier of the bucket you would like to empty.
     */
    emptyBucket(id) {
        return __awaiter$3(this, void 0, void 0, function* () {
            try {
                const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
     * You must first `empty()` the bucket.
     *
     * @param id The unique identifier of the bucket you would like to delete.
     */
    deleteBucket(id) {
        return __awaiter$3(this, void 0, void 0, function* () {
            try {
                const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
                return { data, error: null };
            }
            catch (error) {
                if (isStorageError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
}

class StorageClient extends StorageBucketApi {
    constructor(url, headers = {}, fetch) {
        super(url, headers, fetch);
    }
    /**
     * Perform file operation in a bucket.
     *
     * @param id The bucket id to operate on.
     */
    from(id) {
        return new StorageFileApi(this.url, this.headers, id, this.fetch);
    }
}

const version$1 = '2.49.1';

let JS_ENV = '';
// @ts-ignore
if (typeof Deno !== 'undefined') {
    JS_ENV = 'deno';
}
else if (typeof document !== 'undefined') {
    JS_ENV = 'web';
}
else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    JS_ENV = 'react-native';
}
else {
    JS_ENV = 'node';
}
const DEFAULT_HEADERS$1 = { 'X-Client-Info': `supabase-js-${JS_ENV}/${version$1}` };
const DEFAULT_GLOBAL_OPTIONS = {
    headers: DEFAULT_HEADERS$1,
};
const DEFAULT_DB_OPTIONS = {
    schema: 'public',
};
const DEFAULT_AUTH_OPTIONS = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
};
const DEFAULT_REALTIME_OPTIONS = {};

var __awaiter$2 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const resolveFetch$1 = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else if (typeof fetch === 'undefined') {
        _fetch = nodeFetch;
    }
    else {
        _fetch = fetch;
    }
    return (...args) => _fetch(...args);
};
const resolveHeadersConstructor = () => {
    if (typeof Headers === 'undefined') {
        return Headers$1;
    }
    return Headers;
};
const fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
    const fetch = resolveFetch$1(customFetch);
    const HeadersConstructor = resolveHeadersConstructor();
    return (input, init) => __awaiter$2(void 0, void 0, void 0, function* () {
        var _a;
        const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : supabaseKey;
        let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
        if (!headers.has('apikey')) {
            headers.set('apikey', supabaseKey);
        }
        if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return fetch(input, Object.assign(Object.assign({}, init), { headers }));
    });
};

var __awaiter$1 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function stripTrailingSlash(url) {
    return url.replace(/\/$/, '');
}
function applySettingDefaults(options, defaults) {
    const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions, } = options;
    const { db: DEFAULT_DB_OPTIONS, auth: DEFAULT_AUTH_OPTIONS, realtime: DEFAULT_REALTIME_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS, } = defaults;
    const result = {
        db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS), dbOptions),
        auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
        realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS), realtimeOptions),
        global: Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions),
        accessToken: () => __awaiter$1(this, void 0, void 0, function* () { return ''; }),
    };
    if (options.accessToken) {
        result.accessToken = options.accessToken;
    }
    else {
        // hack around Required<>
        delete result.accessToken;
    }
    return result;
}

const version = '2.68.0';

/** Current session will be checked for refresh at this interval. */
const AUTO_REFRESH_TICK_DURATION_MS = 30 * 1000;
/**
 * A token refresh will be attempted this many ticks before the current session expires. */
const AUTO_REFRESH_TICK_THRESHOLD = 3;
/*
 * Earliest time before an access token expires that the session should be refreshed.
 */
const EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
const GOTRUE_URL = 'http://localhost:9999';
const STORAGE_KEY = 'supabase.auth.token';
const DEFAULT_HEADERS = { 'X-Client-Info': `gotrue-js/${version}` };
const API_VERSION_HEADER_NAME = 'X-Supabase-Api-Version';
const API_VERSIONS = {
    '2024-01-01': {
        timestamp: Date.parse('2024-01-01T00:00:00.0Z'),
        name: '2024-01-01',
    },
};

function expiresAt(expiresIn) {
    const timeNow = Math.round(Date.now() / 1000);
    return timeNow + expiresIn;
}
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
const localStorageWriteTests = {
    tested: false,
    writable: false,
};
/**
 * Checks whether localStorage is supported on this browser.
 */
const supportsLocalStorage = () => {
    if (!isBrowser()) {
        return false;
    }
    try {
        if (typeof globalThis.localStorage !== 'object') {
            return false;
        }
    }
    catch (e) {
        // DOM exception when accessing `localStorage`
        return false;
    }
    if (localStorageWriteTests.tested) {
        return localStorageWriteTests.writable;
    }
    const randomKey = `lswt-${Math.random()}${Math.random()}`;
    try {
        globalThis.localStorage.setItem(randomKey, randomKey);
        globalThis.localStorage.removeItem(randomKey);
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = true;
    }
    catch (e) {
        // localStorage can't be written to
        // https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = false;
    }
    return localStorageWriteTests.writable;
};
/**
 * Extracts parameters encoded in the URL both in the query and fragment.
 */
function parseParametersFromURL(href) {
    const result = {};
    const url = new URL(href);
    if (url.hash && url.hash[0] === '#') {
        try {
            const hashSearchParams = new URLSearchParams(url.hash.substring(1));
            hashSearchParams.forEach((value, key) => {
                result[key] = value;
            });
        }
        catch (e) {
            // hash is not a query string
        }
    }
    // search parameters take precedence over hash parameters
    url.searchParams.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}
const resolveFetch = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else if (typeof fetch === 'undefined') {
        _fetch = (...args) => __vitePreload(() => Promise.resolve().then(() => browser),true?void 0:void 0).then(({ default: fetch }) => fetch(...args));
    }
    else {
        _fetch = fetch;
    }
    return (...args) => _fetch(...args);
};
const looksLikeFetchResponse = (maybeResponse) => {
    return (typeof maybeResponse === 'object' &&
        maybeResponse !== null &&
        'status' in maybeResponse &&
        'ok' in maybeResponse &&
        'json' in maybeResponse &&
        typeof maybeResponse.json === 'function');
};
// Storage helpers
const setItemAsync = async (storage, key, data) => {
    await storage.setItem(key, JSON.stringify(data));
};
const getItemAsync = async (storage, key) => {
    const value = await storage.getItem(key);
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch (_a) {
        return value;
    }
};
const removeItemAsync = async (storage, key) => {
    await storage.removeItem(key);
};
function decodeBase64URL(value) {
    const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let base64 = '';
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;
    value = value.replace('-', '+').replace('_', '/');
    while (i < value.length) {
        enc1 = key.indexOf(value.charAt(i++));
        enc2 = key.indexOf(value.charAt(i++));
        enc3 = key.indexOf(value.charAt(i++));
        enc4 = key.indexOf(value.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        base64 = base64 + String.fromCharCode(chr1);
        if (enc3 != 64 && chr2 != 0) {
            base64 = base64 + String.fromCharCode(chr2);
        }
        if (enc4 != 64 && chr3 != 0) {
            base64 = base64 + String.fromCharCode(chr3);
        }
    }
    return base64;
}
/**
 * A deferred represents some asynchronous work that is not yet finished, which
 * may or may not culminate in a value.
 * Taken from: https://github.com/mike-north/types/blob/master/src/async.ts
 */
class Deferred {
    constructor() {
        this.promise = new Deferred.promiseConstructor((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
Deferred.promiseConstructor = Promise;
// Taken from: https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
function decodeJWTPayload(token) {
    // Regex checks for base64url format
    const base64UrlRegex = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}=?$|[a-z0-9_-]{2}(==)?$)$/i;
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('JWT is not valid: not a JWT structure');
    }
    if (!base64UrlRegex.test(parts[1])) {
        throw new Error('JWT is not valid: payload is not in base64url format');
    }
    const base64Url = parts[1];
    return JSON.parse(decodeBase64URL(base64Url));
}
/**
 * Creates a promise that resolves to null after some time.
 */
async function sleep(time) {
    return await new Promise((accept) => {
        setTimeout(() => accept(null), time);
    });
}
/**
 * Converts the provided async function into a retryable function. Each result
 * or thrown error is sent to the isRetryable function which should return true
 * if the function should run again.
 */
function retryable(fn, isRetryable) {
    const promise = new Promise((accept, reject) => {
        (async () => {
            for (let attempt = 0; attempt < Infinity; attempt++) {
                try {
                    const result = await fn(attempt);
                    if (!isRetryable(attempt, null, result)) {
                        accept(result);
                        return;
                    }
                }
                catch (e) {
                    if (!isRetryable(attempt, e)) {
                        reject(e);
                        return;
                    }
                }
            }
        })();
    });
    return promise;
}
function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2);
}
// Functions below taken from: https://stackoverflow.com/questions/63309409/creating-a-code-verifier-and-challenge-for-pkce-auth-on-spotify-api-in-reactjs
function generatePKCEVerifier() {
    const verifierLength = 56;
    const array = new Uint32Array(verifierLength);
    if (typeof crypto === 'undefined') {
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        const charSetLen = charSet.length;
        let verifier = '';
        for (let i = 0; i < verifierLength; i++) {
            verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
        }
        return verifier;
    }
    crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join('');
}
async function sha256(randomString) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(randomString);
    const hash = await crypto.subtle.digest('SHA-256', encodedData);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes)
        .map((c) => String.fromCharCode(c))
        .join('');
}
function base64urlencode(str) {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function generatePKCEChallenge(verifier) {
    const hasCryptoSupport = typeof crypto !== 'undefined' &&
        typeof crypto.subtle !== 'undefined' &&
        typeof TextEncoder !== 'undefined';
    if (!hasCryptoSupport) {
        console.warn('WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.');
        return verifier;
    }
    const hashed = await sha256(verifier);
    return base64urlencode(hashed);
}
async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
    const codeVerifier = generatePKCEVerifier();
    let storedCodeVerifier = codeVerifier;
    if (isPasswordRecovery) {
        storedCodeVerifier += '/PASSWORD_RECOVERY';
    }
    await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
    const codeChallenge = await generatePKCEChallenge(codeVerifier);
    const codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
    return [codeChallenge, codeChallengeMethod];
}
/** Parses the API version which is 2YYY-MM-DD. */
const API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function parseResponseAPIVersion(response) {
    const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
    if (!apiVersion) {
        return null;
    }
    if (!apiVersion.match(API_VERSION_REGEX)) {
        return null;
    }
    try {
        const date = new Date(`${apiVersion}T00:00:00.0Z`);
        return date;
    }
    catch (e) {
        return null;
    }
}

class AuthError extends Error {
    constructor(message, status, code) {
        super(message);
        this.__isAuthError = true;
        this.name = 'AuthError';
        this.status = status;
        this.code = code;
    }
}
function isAuthError(error) {
    return typeof error === 'object' && error !== null && '__isAuthError' in error;
}
class AuthApiError extends AuthError {
    constructor(message, status, code) {
        super(message, status, code);
        this.name = 'AuthApiError';
        this.status = status;
        this.code = code;
    }
}
function isAuthApiError(error) {
    return isAuthError(error) && error.name === 'AuthApiError';
}
class AuthUnknownError extends AuthError {
    constructor(message, originalError) {
        super(message);
        this.name = 'AuthUnknownError';
        this.originalError = originalError;
    }
}
class CustomAuthError extends AuthError {
    constructor(message, name, status, code) {
        super(message, status, code);
        this.name = name;
        this.status = status;
    }
}
class AuthSessionMissingError extends CustomAuthError {
    constructor() {
        super('Auth session missing!', 'AuthSessionMissingError', 400, undefined);
    }
}
function isAuthSessionMissingError(error) {
    return isAuthError(error) && error.name === 'AuthSessionMissingError';
}
class AuthInvalidTokenResponseError extends CustomAuthError {
    constructor() {
        super('Auth session or user missing', 'AuthInvalidTokenResponseError', 500, undefined);
    }
}
class AuthInvalidCredentialsError extends CustomAuthError {
    constructor(message) {
        super(message, 'AuthInvalidCredentialsError', 400, undefined);
    }
}
class AuthImplicitGrantRedirectError extends CustomAuthError {
    constructor(message, details = null) {
        super(message, 'AuthImplicitGrantRedirectError', 500, undefined);
        this.details = null;
        this.details = details;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details,
        };
    }
}
function isAuthImplicitGrantRedirectError(error) {
    return isAuthError(error) && error.name === 'AuthImplicitGrantRedirectError';
}
class AuthPKCEGrantCodeExchangeError extends CustomAuthError {
    constructor(message, details = null) {
        super(message, 'AuthPKCEGrantCodeExchangeError', 500, undefined);
        this.details = null;
        this.details = details;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details,
        };
    }
}
class AuthRetryableFetchError extends CustomAuthError {
    constructor(message, status) {
        super(message, 'AuthRetryableFetchError', status, undefined);
    }
}
function isAuthRetryableFetchError(error) {
    return isAuthError(error) && error.name === 'AuthRetryableFetchError';
}
/**
 * This error is thrown on certain methods when the password used is deemed
 * weak. Inspect the reasons to identify what password strength rules are
 * inadequate.
 */
class AuthWeakPasswordError extends CustomAuthError {
    constructor(message, status, reasons) {
        super(message, 'AuthWeakPasswordError', status, 'weak_password');
        this.reasons = reasons;
    }
}

var __rest$1 = (globalThis && globalThis.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
const NETWORK_ERROR_CODES = [502, 503, 504];
async function handleError(error) {
    var _a;
    if (!looksLikeFetchResponse(error)) {
        throw new AuthRetryableFetchError(_getErrorMessage(error), 0);
    }
    if (NETWORK_ERROR_CODES.includes(error.status)) {
        // status in 500...599 range - server had an error, request might be retryed.
        throw new AuthRetryableFetchError(_getErrorMessage(error), error.status);
    }
    let data;
    try {
        data = await error.json();
    }
    catch (e) {
        throw new AuthUnknownError(_getErrorMessage(e), e);
    }
    let errorCode = undefined;
    const responseAPIVersion = parseResponseAPIVersion(error);
    if (responseAPIVersion &&
        responseAPIVersion.getTime() >= API_VERSIONS['2024-01-01'].timestamp &&
        typeof data === 'object' &&
        data &&
        typeof data.code === 'string') {
        errorCode = data.code;
    }
    else if (typeof data === 'object' && data && typeof data.error_code === 'string') {
        errorCode = data.error_code;
    }
    if (!errorCode) {
        // Legacy support for weak password errors, when there were no error codes
        if (typeof data === 'object' &&
            data &&
            typeof data.weak_password === 'object' &&
            data.weak_password &&
            Array.isArray(data.weak_password.reasons) &&
            data.weak_password.reasons.length &&
            data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
            throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, data.weak_password.reasons);
        }
    }
    else if (errorCode === 'weak_password') {
        throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
    }
    else if (errorCode === 'session_not_found') {
        // The `session_id` inside the JWT does not correspond to a row in the
        // `sessions` table. This usually means the user has signed out, has been
        // deleted, or their session has somehow been terminated.
        throw new AuthSessionMissingError();
    }
    throw new AuthApiError(_getErrorMessage(data), error.status || 500, errorCode);
}
const _getRequestParams = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === 'GET') {
        return params;
    }
    params.headers = Object.assign({ 'Content-Type': 'application/json;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
    params.body = JSON.stringify(body);
    return Object.assign(Object.assign({}, params), parameters);
};
async function _request(fetcher, method, url, options) {
    var _a;
    const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
    if (!headers[API_VERSION_HEADER_NAME]) {
        headers[API_VERSION_HEADER_NAME] = API_VERSIONS['2024-01-01'].name;
    }
    if (options === null || options === void 0 ? void 0 : options.jwt) {
        headers['Authorization'] = `Bearer ${options.jwt}`;
    }
    const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
        qs['redirect_to'] = options.redirectTo;
    }
    const queryString = Object.keys(qs).length ? '?' + new URLSearchParams(qs).toString() : '';
    const data = await _handleRequest(fetcher, method, url + queryString, {
        headers,
        noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson,
    }, {}, options === null || options === void 0 ? void 0 : options.body);
    return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
}
async function _handleRequest(fetcher, method, url, options, parameters, body) {
    const requestParams = _getRequestParams(method, options, parameters, body);
    let result;
    try {
        result = await fetcher(url, Object.assign({}, requestParams));
    }
    catch (e) {
        console.error(e);
        // fetch failed, likely due to a network or CORS error
        throw new AuthRetryableFetchError(_getErrorMessage(e), 0);
    }
    if (!result.ok) {
        await handleError(result);
    }
    if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
        return result;
    }
    try {
        return await result.json();
    }
    catch (e) {
        await handleError(e);
    }
}
function _sessionResponse(data) {
    var _a;
    let session = null;
    if (hasSession(data)) {
        session = Object.assign({}, data);
        if (!data.expires_at) {
            session.expires_at = expiresAt(data.expires_in);
        }
    }
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { session, user }, error: null };
}
function _sessionResponsePassword(data) {
    const response = _sessionResponse(data);
    if (!response.error &&
        data.weak_password &&
        typeof data.weak_password === 'object' &&
        Array.isArray(data.weak_password.reasons) &&
        data.weak_password.reasons.length &&
        data.weak_password.message &&
        typeof data.weak_password.message === 'string' &&
        data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
        response.data.weak_password = data.weak_password;
    }
    return response;
}
function _userResponse(data) {
    var _a;
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { user }, error: null };
}
function _ssoResponse(data) {
    return { data, error: null };
}
function _generateLinkResponse(data) {
    const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest$1(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
    const properties = {
        action_link,
        email_otp,
        hashed_token,
        redirect_to,
        verification_type,
    };
    const user = Object.assign({}, rest);
    return {
        data: {
            properties,
            user,
        },
        error: null,
    };
}
function _noResolveJsonResponse(data) {
    return data;
}
/**
 * hasSession checks if the response object contains a valid session
 * @param data A response object
 * @returns true if a session is in the response
 */
function hasSession(data) {
    return data.access_token && data.refresh_token && data.expires_in;
}

var __rest = (globalThis && globalThis.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
class GoTrueAdminApi {
    constructor({ url = '', headers = {}, fetch, }) {
        this.url = url;
        this.headers = headers;
        this.fetch = resolveFetch(fetch);
        this.mfa = {
            listFactors: this._listFactors.bind(this),
            deleteFactor: this._deleteFactor.bind(this),
        };
    }
    /**
     * Removes a logged-in session.
     * @param jwt A valid, logged-in JWT.
     * @param scope The logout sope.
     */
    async signOut(jwt, scope = 'global') {
        try {
            await _request(this.fetch, 'POST', `${this.url}/logout?scope=${scope}`, {
                headers: this.headers,
                jwt,
                noResolveJson: true,
            });
            return { data: null, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    /**
     * Sends an invite link to an email address.
     * @param email The email address of the user.
     * @param options Additional options to be included when inviting.
     */
    async inviteUserByEmail(email, options = {}) {
        try {
            return await _request(this.fetch, 'POST', `${this.url}/invite`, {
                body: { email, data: options.data },
                headers: this.headers,
                redirectTo: options.redirectTo,
                xform: _userResponse,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null }, error };
            }
            throw error;
        }
    }
    /**
     * Generates email links and OTPs to be sent via a custom email provider.
     * @param email The user's email.
     * @param options.password User password. For signup only.
     * @param options.data Optional user metadata. For signup only.
     * @param options.redirectTo The redirect url which should be appended to the generated link
     */
    async generateLink(params) {
        try {
            const { options } = params, rest = __rest(params, ["options"]);
            const body = Object.assign(Object.assign({}, rest), options);
            if ('newEmail' in rest) {
                // replace newEmail with new_email in request body
                body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
                delete body['newEmail'];
            }
            return await _request(this.fetch, 'POST', `${this.url}/admin/generate_link`, {
                body: body,
                headers: this.headers,
                xform: _generateLinkResponse,
                redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return {
                    data: {
                        properties: null,
                        user: null,
                    },
                    error,
                };
            }
            throw error;
        }
    }
    // User Admin API
    /**
     * Creates a new user.
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async createUser(attributes) {
        try {
            return await _request(this.fetch, 'POST', `${this.url}/admin/users`, {
                body: attributes,
                headers: this.headers,
                xform: _userResponse,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null }, error };
            }
            throw error;
        }
    }
    /**
     * Get a list of users.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
     */
    async listUsers(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const pagination = { nextPage: null, lastPage: 0, total: 0 };
            const response = await _request(this.fetch, 'GET', `${this.url}/admin/users`, {
                headers: this.headers,
                noResolveJson: true,
                query: {
                    page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                    per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '',
                },
                xform: _noResolveJsonResponse,
            });
            if (response.error)
                throw response.error;
            const users = await response.json();
            const total = (_e = response.headers.get('x-total-count')) !== null && _e !== void 0 ? _e : 0;
            const links = (_g = (_f = response.headers.get('link')) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : [];
            if (links.length > 0) {
                links.forEach((link) => {
                    const page = parseInt(link.split(';')[0].split('=')[1].substring(0, 1));
                    const rel = JSON.parse(link.split(';')[1].split('=')[1]);
                    pagination[`${rel}Page`] = page;
                });
                pagination.total = parseInt(total);
            }
            return { data: Object.assign(Object.assign({}, users), pagination), error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { users: [] }, error };
            }
            throw error;
        }
    }
    /**
     * Get user by id.
     *
     * @param uid The user's unique identifier
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async getUserById(uid) {
        try {
            return await _request(this.fetch, 'GET', `${this.url}/admin/users/${uid}`, {
                headers: this.headers,
                xform: _userResponse,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null }, error };
            }
            throw error;
        }
    }
    /**
     * Updates the user data.
     *
     * @param attributes The data you want to update.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async updateUserById(uid, attributes) {
        try {
            return await _request(this.fetch, 'PUT', `${this.url}/admin/users/${uid}`, {
                body: attributes,
                headers: this.headers,
                xform: _userResponse,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null }, error };
            }
            throw error;
        }
    }
    /**
     * Delete a user. Requires a `service_role` key.
     *
     * @param id The user id you want to remove.
     * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
     * Defaults to false for backward compatibility.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async deleteUser(id, shouldSoftDelete = false) {
        try {
            return await _request(this.fetch, 'DELETE', `${this.url}/admin/users/${id}`, {
                headers: this.headers,
                body: {
                    should_soft_delete: shouldSoftDelete,
                },
                xform: _userResponse,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null }, error };
            }
            throw error;
        }
    }
    async _listFactors(params) {
        try {
            const { data, error } = await _request(this.fetch, 'GET', `${this.url}/admin/users/${params.userId}/factors`, {
                headers: this.headers,
                xform: (factors) => {
                    return { data: { factors }, error: null };
                },
            });
            return { data, error };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    async _deleteFactor(params) {
        try {
            const data = await _request(this.fetch, 'DELETE', `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
                headers: this.headers,
            });
            return { data, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
}

/**
 * Provides safe access to the globalThis.localStorage property.
 */
const localStorageAdapter = {
    getItem: (key) => {
        if (!supportsLocalStorage()) {
            return null;
        }
        return globalThis.localStorage.getItem(key);
    },
    setItem: (key, value) => {
        if (!supportsLocalStorage()) {
            return;
        }
        globalThis.localStorage.setItem(key, value);
    },
    removeItem: (key) => {
        if (!supportsLocalStorage()) {
            return;
        }
        globalThis.localStorage.removeItem(key);
    },
};
/**
 * Returns a localStorage-like object that stores the key-value pairs in
 * memory.
 */
function memoryLocalStorageAdapter(store = {}) {
    return {
        getItem: (key) => {
            return store[key] || null;
        },
        setItem: (key, value) => {
            store[key] = value;
        },
        removeItem: (key) => {
            delete store[key];
        },
    };
}

/**
 * https://mathiasbynens.be/notes/globalthis
 */
function polyfillGlobalThis() {
    if (typeof globalThis === 'object')
        return;
    try {
        Object.defineProperty(Object.prototype, '__magic__', {
            get: function () {
                return this;
            },
            configurable: true,
        });
        // @ts-expect-error 'Allow access to magic'
        __magic__.globalThis = __magic__;
        // @ts-expect-error 'Allow access to magic'
        delete Object.prototype.__magic__;
    }
    catch (e) {
        if (typeof self !== 'undefined') {
            // @ts-expect-error 'Allow access to globals'
            self.globalThis = self;
        }
    }
}

/**
 * @experimental
 */
const internals = {
    /**
     * @experimental
     */
    debug: !!(globalThis &&
        supportsLocalStorage() &&
        globalThis.localStorage &&
        globalThis.localStorage.getItem('supabase.gotrue-js.locks.debug') === 'true'),
};
/**
 * An error thrown when a lock cannot be acquired after some amount of time.
 *
 * Use the {@link #isAcquireTimeout} property instead of checking with `instanceof`.
 */
class LockAcquireTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.isAcquireTimeout = true;
    }
}
class NavigatorLockAcquireTimeoutError extends LockAcquireTimeoutError {
}
/**
 * Implements a global exclusive lock using the Navigator LockManager API. It
 * is available on all browsers released after 2022-03-15 with Safari being the
 * last one to release support. If the API is not available, this function will
 * throw. Make sure you check availablility before configuring {@link
 * GoTrueClient}.
 *
 * You can turn on debugging by setting the `supabase.gotrue-js.locks.debug`
 * local storage item to `true`.
 *
 * Internals:
 *
 * Since the LockManager API does not preserve stack traces for the async
 * function passed in the `request` method, a trick is used where acquiring the
 * lock releases a previously started promise to run the operation in the `fn`
 * function. The lock waits for that promise to finish (with or without error),
 * while the function will finally wait for the result anyway.
 *
 * @param name Name of the lock to be acquired.
 * @param acquireTimeout If negative, no timeout. If 0 an error is thrown if
 *                       the lock can't be acquired without waiting. If positive, the lock acquire
 *                       will time out after so many milliseconds. An error is
 *                       a timeout if it has `isAcquireTimeout` set to true.
 * @param fn The operation to run once the lock is acquired.
 */
async function navigatorLock(name, acquireTimeout, fn) {
    if (internals.debug) {
        console.log('@supabase/gotrue-js: navigatorLock: acquire lock', name, acquireTimeout);
    }
    const abortController = new globalThis.AbortController();
    if (acquireTimeout > 0) {
        setTimeout(() => {
            abortController.abort();
            if (internals.debug) {
                console.log('@supabase/gotrue-js: navigatorLock acquire timed out', name);
            }
        }, acquireTimeout);
    }
    // MDN article: https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
    // Wrapping navigator.locks.request() with a plain Promise is done as some
    // libraries like zone.js patch the Promise object to track the execution
    // context. However, it appears that most browsers use an internal promise
    // implementation when using the navigator.locks.request() API causing them
    // to lose context and emit confusing log messages or break certain features.
    // This wrapping is believed to help zone.js track the execution context
    // better.
    return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, acquireTimeout === 0
        ? {
            mode: 'exclusive',
            ifAvailable: true,
        }
        : {
            mode: 'exclusive',
            signal: abortController.signal,
        }, async (lock) => {
        if (lock) {
            if (internals.debug) {
                console.log('@supabase/gotrue-js: navigatorLock: acquired', name, lock.name);
            }
            try {
                return await fn();
            }
            finally {
                if (internals.debug) {
                    console.log('@supabase/gotrue-js: navigatorLock: released', name, lock.name);
                }
            }
        }
        else {
            if (acquireTimeout === 0) {
                if (internals.debug) {
                    console.log('@supabase/gotrue-js: navigatorLock: not immediately available', name);
                }
                throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
            }
            else {
                if (internals.debug) {
                    try {
                        const result = await globalThis.navigator.locks.query();
                        console.log('@supabase/gotrue-js: Navigator LockManager state', JSON.stringify(result, null, '  '));
                    }
                    catch (e) {
                        console.warn('@supabase/gotrue-js: Error when querying Navigator LockManager state', e);
                    }
                }
                // Browser is not following the Navigator LockManager spec, it
                // returned a null lock when we didn't use ifAvailable. So we can
                // pretend the lock is acquired in the name of backward compatibility
                // and user experience and just run the function.
                console.warn('@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request');
                return await fn();
            }
        }
    }));
}

polyfillGlobalThis(); // Make "globalThis" available
const DEFAULT_OPTIONS = {
    url: GOTRUE_URL,
    storageKey: STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    headers: DEFAULT_HEADERS,
    flowType: 'implicit',
    debug: false,
    hasCustomAuthorizationHeader: false,
};
async function lockNoOp(name, acquireTimeout, fn) {
    return await fn();
}
class GoTrueClient {
    /**
     * Create a new client for use in the browser.
     */
    constructor(options) {
        var _a, _b;
        this.memoryStorage = null;
        this.stateChangeEmitters = new Map();
        this.autoRefreshTicker = null;
        this.visibilityChangedCallback = null;
        this.refreshingDeferred = null;
        /**
         * Keeps track of the async client initialization.
         * When null or not yet resolved the auth state is `unknown`
         * Once resolved the the auth state is known and it's save to call any further client methods.
         * Keep extra care to never reject or throw uncaught errors
         */
        this.initializePromise = null;
        this.detectSessionInUrl = true;
        this.hasCustomAuthorizationHeader = false;
        this.suppressGetSessionWarning = false;
        this.lockAcquired = false;
        this.pendingInLock = [];
        /**
         * Used to broadcast state change events to other tabs listening.
         */
        this.broadcastChannel = null;
        this.logger = console.log;
        this.instanceID = GoTrueClient.nextInstanceID;
        GoTrueClient.nextInstanceID += 1;
        if (this.instanceID > 0 && isBrowser()) {
            console.warn('Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.');
        }
        const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        this.logDebugMessages = !!settings.debug;
        if (typeof settings.debug === 'function') {
            this.logger = settings.debug;
        }
        this.persistSession = settings.persistSession;
        this.storageKey = settings.storageKey;
        this.autoRefreshToken = settings.autoRefreshToken;
        this.admin = new GoTrueAdminApi({
            url: settings.url,
            headers: settings.headers,
            fetch: settings.fetch,
        });
        this.url = settings.url;
        this.headers = settings.headers;
        this.fetch = resolveFetch(settings.fetch);
        this.lock = settings.lock || lockNoOp;
        this.detectSessionInUrl = settings.detectSessionInUrl;
        this.flowType = settings.flowType;
        this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
        if (settings.lock) {
            this.lock = settings.lock;
        }
        else if (isBrowser() && ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _a === void 0 ? void 0 : _a.locks)) {
            this.lock = navigatorLock;
        }
        else {
            this.lock = lockNoOp;
        }
        this.mfa = {
            verify: this._verify.bind(this),
            enroll: this._enroll.bind(this),
            unenroll: this._unenroll.bind(this),
            challenge: this._challenge.bind(this),
            listFactors: this._listFactors.bind(this),
            challengeAndVerify: this._challengeAndVerify.bind(this),
            getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
        };
        if (this.persistSession) {
            if (settings.storage) {
                this.storage = settings.storage;
            }
            else {
                if (supportsLocalStorage()) {
                    this.storage = localStorageAdapter;
                }
                else {
                    this.memoryStorage = {};
                    this.storage = memoryLocalStorageAdapter(this.memoryStorage);
                }
            }
        }
        else {
            this.memoryStorage = {};
            this.storage = memoryLocalStorageAdapter(this.memoryStorage);
        }
        if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
            try {
                this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
            }
            catch (e) {
                console.error('Failed to create a new BroadcastChannel, multi-tab state changes will not be available', e);
            }
            (_b = this.broadcastChannel) === null || _b === void 0 ? void 0 : _b.addEventListener('message', async (event) => {
                this._debug('received broadcast notification from other tab or client', event);
                await this._notifyAllSubscribers(event.data.event, event.data.session, false); // broadcast = false so we don't get an endless loop of messages
            });
        }
        this.initialize();
    }
    _debug(...args) {
        if (this.logDebugMessages) {
            this.logger(`GoTrueClient@${this.instanceID} (${version}) ${new Date().toISOString()}`, ...args);
        }
        return this;
    }
    /**
     * Initializes the client session either from the url or from storage.
     * This method is automatically called when instantiating the client, but should also be called
     * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
     */
    async initialize() {
        if (this.initializePromise) {
            return await this.initializePromise;
        }
        this.initializePromise = (async () => {
            return await this._acquireLock(-1, async () => {
                return await this._initialize();
            });
        })();
        return await this.initializePromise;
    }
    /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */
    async _initialize() {
        var _a;
        try {
            const params = parseParametersFromURL(window.location.href);
            let callbackUrlType = 'none';
            if (this._isImplicitGrantCallback(params)) {
                callbackUrlType = 'implicit';
            }
            else if (await this._isPKCECallback(params)) {
                callbackUrlType = 'pkce';
            }
            /**
             * Attempt to get the session from the URL only if these conditions are fulfilled
             *
             * Note: If the URL isn't one of the callback url types (implicit or pkce),
             * then there could be an existing session so we don't want to prematurely remove it
             */
            if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== 'none') {
                const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
                if (error) {
                    this._debug('#_initialize()', 'error detecting session from URL', error);
                    if (isAuthImplicitGrantRedirectError(error)) {
                        const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
                        if (errorCode === 'identity_already_exists' ||
                            errorCode === 'identity_not_found' ||
                            errorCode === 'single_identity_not_deletable') {
                            return { error };
                        }
                    }
                    // failed login attempt via url,
                    // remove old session as in verifyOtp, signUp and signInWith*
                    await this._removeSession();
                    return { error };
                }
                const { session, redirectType } = data;
                this._debug('#_initialize()', 'detected session in URL', session, 'redirect type', redirectType);
                await this._saveSession(session);
                setTimeout(async () => {
                    if (redirectType === 'recovery') {
                        await this._notifyAllSubscribers('PASSWORD_RECOVERY', session);
                    }
                    else {
                        await this._notifyAllSubscribers('SIGNED_IN', session);
                    }
                }, 0);
                return { error: null };
            }
            // no login attempt via callback url try to recover session from storage
            await this._recoverAndRefresh();
            return { error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { error };
            }
            return {
                error: new AuthUnknownError('Unexpected error during initialization', error),
            };
        }
        finally {
            await this._handleVisibilityChange();
            this._debug('#_initialize()', 'end');
        }
    }
    /**
     * Creates a new anonymous user.
     *
     * @returns A session where the is_anonymous claim in the access token JWT set to true
     */
    async signInAnonymously(credentials) {
        var _a, _b, _c;
        try {
            const res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                headers: this.headers,
                body: {
                    data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
                    gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken },
                },
                xform: _sessionResponse,
            });
            const { data, error } = res;
            if (error || !data) {
                return { data: { user: null, session: null }, error: error };
            }
            const session = data.session;
            const user = data.user;
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return { data: { user, session }, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
     *
     * @returns A logged-in session if the server has "autoconfirm" ON
     * @returns A user if the server has "autoconfirm" OFF
     */
    async signUp(credentials) {
        var _a, _b, _c;
        try {
            let res;
            if ('email' in credentials) {
                const { email, password, options } = credentials;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') {
                    ;
                    [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                }
                res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                    headers: this.headers,
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    body: {
                        email,
                        password,
                        data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod,
                    },
                    xform: _sessionResponse,
                });
            }
            else if ('phone' in credentials) {
                const { phone, password, options } = credentials;
                res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                    headers: this.headers,
                    body: {
                        phone,
                        password,
                        data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                        channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : 'sms',
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponse,
                });
            }
            else {
                throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
            }
            const { data, error } = res;
            if (error || !data) {
                return { data: { user: null, session: null }, error: error };
            }
            const session = data.session;
            const user = data.user;
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return { data: { user, session }, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong or that the account can only
     * be accessed via social login.
     */
    async signInWithPassword(credentials) {
        try {
            let res;
            if ('email' in credentials) {
                const { email, password, options } = credentials;
                res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        email,
                        password,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponsePassword,
                });
            }
            else if ('phone' in credentials) {
                const { phone, password, options } = credentials;
                res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        phone,
                        password,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponsePassword,
                });
            }
            else {
                throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
            }
            const { data, error } = res;
            if (error) {
                return { data: { user: null, session: null }, error };
            }
            else if (!data || !data.session || !data.user) {
                return { data: { user: null, session: null }, error: new AuthInvalidTokenResponseError() };
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return {
                data: Object.assign({ user: data.user, session: data.session }, (data.weak_password ? { weakPassword: data.weak_password } : null)),
                error,
            };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Log in an existing user via a third-party provider.
     * This method supports the PKCE flow.
     */
    async signInWithOAuth(credentials) {
        var _a, _b, _c, _d;
        return await this._handleProviderSignIn(credentials.provider, {
            redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
            scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
            queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
            skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect,
        });
    }
    /**
     * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
     */
    async exchangeCodeForSession(authCode) {
        await this.initializePromise;
        return this._acquireLock(-1, async () => {
            return this._exchangeCodeForSession(authCode);
        });
    }
    async _exchangeCodeForSession(authCode) {
        const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : '').split('/');
        try {
            const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=pkce`, {
                headers: this.headers,
                body: {
                    auth_code: authCode,
                    code_verifier: codeVerifier,
                },
                xform: _sessionResponse,
            });
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (error) {
                throw error;
            }
            if (!data || !data.session || !data.user) {
                return {
                    data: { user: null, session: null, redirectType: null },
                    error: new AuthInvalidTokenResponseError(),
                };
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return { data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null, redirectType: null }, error };
            }
            throw error;
        }
    }
    /**
     * Allows signing in with an OIDC ID token. The authentication provider used
     * should be enabled and configured.
     */
    async signInWithIdToken(credentials) {
        try {
            const { options, provider, token, access_token, nonce } = credentials;
            const res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                headers: this.headers,
                body: {
                    provider,
                    id_token: token,
                    access_token,
                    nonce,
                    gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                },
                xform: _sessionResponse,
            });
            const { data, error } = res;
            if (error) {
                return { data: { user: null, session: null }, error };
            }
            else if (!data || !data.session || !data.user) {
                return {
                    data: { user: null, session: null },
                    error: new AuthInvalidTokenResponseError(),
                };
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return { data, error };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Log in a user using magiclink or a one-time password (OTP).
     *
     * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
     * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
     * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or, that the account
     * can only be accessed via social login.
     *
     * Do note that you will need to configure a Whatsapp sender on Twilio
     * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
     * channel is not supported on other providers
     * at this time.
     * This method supports PKCE when an email is passed.
     */
    async signInWithOtp(credentials) {
        var _a, _b, _c, _d, _e;
        try {
            if ('email' in credentials) {
                const { email, options } = credentials;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') {
                    ;
                    [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                }
                const { error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        email,
                        data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                        create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod,
                    },
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                });
                return { data: { user: null, session: null }, error };
            }
            if ('phone' in credentials) {
                const { phone, options } = credentials;
                const { data, error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        phone,
                        data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                        create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : 'sms',
                    },
                });
                return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
            }
            throw new AuthInvalidCredentialsError('You must provide either an email or phone number.');
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
     */
    async verifyOtp(params) {
        var _a, _b;
        try {
            let redirectTo = undefined;
            let captchaToken = undefined;
            if ('options' in params) {
                redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
                captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
            }
            const { data, error } = await _request(this.fetch, 'POST', `${this.url}/verify`, {
                headers: this.headers,
                body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
                redirectTo,
                xform: _sessionResponse,
            });
            if (error) {
                throw error;
            }
            if (!data) {
                throw new Error('An error occurred on token verification.');
            }
            const session = data.session;
            const user = data.user;
            if (session === null || session === void 0 ? void 0 : session.access_token) {
                await this._saveSession(session);
                await this._notifyAllSubscribers(params.type == 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
            }
            return { data: { user, session }, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Attempts a single-sign on using an enterprise Identity Provider. A
     * successful SSO attempt will redirect the current page to the identity
     * provider authorization page. The redirect URL is implementation and SSO
     * protocol specific.
     *
     * You can use it by providing a SSO domain. Typically you can extract this
     * domain by asking users for their email address. If this domain is
     * registered on the Auth instance the redirect will use that organization's
     * currently active SSO Identity Provider for the login.
     *
     * If you have built an organization-specific login page, you can use the
     * organization's SSO Identity Provider UUID directly instead.
     */
    async signInWithSSO(params) {
        var _a, _b, _c;
        try {
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === 'pkce') {
                ;
                [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
            }
            return await _request(this.fetch, 'POST', `${this.url}/sso`, {
                body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ('providerId' in params ? { provider_id: params.providerId } : null)), ('domain' in params ? { domain: params.domain } : null)), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : undefined }), (((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken)
                    ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } }
                    : null)), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                headers: this.headers,
                xform: _ssoResponse,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    /**
     * Sends a reauthentication OTP to the user's email or phone number.
     * Requires the user to be signed-in.
     */
    async reauthenticate() {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
            return await this._reauthenticate();
        });
    }
    async _reauthenticate() {
        try {
            return await this._useSession(async (result) => {
                const { data: { session }, error: sessionError, } = result;
                if (sessionError)
                    throw sessionError;
                if (!session)
                    throw new AuthSessionMissingError();
                const { error } = await _request(this.fetch, 'GET', `${this.url}/reauthenticate`, {
                    headers: this.headers,
                    jwt: session.access_token,
                });
                return { data: { user: null, session: null }, error };
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */
    async resend(credentials) {
        try {
            const endpoint = `${this.url}/resend`;
            if ('email' in credentials) {
                const { email, type, options } = credentials;
                const { error } = await _request(this.fetch, 'POST', endpoint, {
                    headers: this.headers,
                    body: {
                        email,
                        type,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                });
                return { data: { user: null, session: null }, error };
            }
            else if ('phone' in credentials) {
                const { phone, type, options } = credentials;
                const { data, error } = await _request(this.fetch, 'POST', endpoint, {
                    headers: this.headers,
                    body: {
                        phone,
                        type,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                });
                return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
            }
            throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a type');
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Returns the session, refreshing it if necessary.
     *
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     *
     * **IMPORTANT:** This method loads values directly from the storage attached
     * to the client. If that storage is based on request cookies for example,
     * the values in it may not be authentic and therefore it's strongly advised
     * against using this method and its results in such circumstances. A warning
     * will be emitted if this is detected. Use {@link #getUser()} instead.
     */
    async getSession() {
        await this.initializePromise;
        const result = await this._acquireLock(-1, async () => {
            return this._useSession(async (result) => {
                return result;
            });
        });
        return result;
    }
    /**
     * Acquires a global lock based on the storage key.
     */
    async _acquireLock(acquireTimeout, fn) {
        this._debug('#_acquireLock', 'begin', acquireTimeout);
        try {
            if (this.lockAcquired) {
                const last = this.pendingInLock.length
                    ? this.pendingInLock[this.pendingInLock.length - 1]
                    : Promise.resolve();
                const result = (async () => {
                    await last;
                    return await fn();
                })();
                this.pendingInLock.push((async () => {
                    try {
                        await result;
                    }
                    catch (e) {
                        // we just care if it finished
                    }
                })());
                return result;
            }
            return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
                this._debug('#_acquireLock', 'lock acquired for storage key', this.storageKey);
                try {
                    this.lockAcquired = true;
                    const result = fn();
                    this.pendingInLock.push((async () => {
                        try {
                            await result;
                        }
                        catch (e) {
                            // we just care if it finished
                        }
                    })());
                    await result;
                    // keep draining the queue until there's nothing to wait on
                    while (this.pendingInLock.length) {
                        const waitOn = [...this.pendingInLock];
                        await Promise.all(waitOn);
                        this.pendingInLock.splice(0, waitOn.length);
                    }
                    return await result;
                }
                finally {
                    this._debug('#_acquireLock', 'lock released for storage key', this.storageKey);
                    this.lockAcquired = false;
                }
            });
        }
        finally {
            this._debug('#_acquireLock', 'end');
        }
    }
    /**
     * Use instead of {@link #getSession} inside the library. It is
     * semantically usually what you want, as getting a session involves some
     * processing afterwards that requires only one client operating on the
     * session at once across multiple tabs or processes.
     */
    async _useSession(fn) {
        this._debug('#_useSession', 'begin');
        try {
            // the use of __loadSession here is the only correct use of the function!
            const result = await this.__loadSession();
            return await fn(result);
        }
        finally {
            this._debug('#_useSession', 'end');
        }
    }
    /**
     * NEVER USE DIRECTLY!
     *
     * Always use {@link #_useSession}.
     */
    async __loadSession() {
        this._debug('#__loadSession()', 'begin');
        if (!this.lockAcquired) {
            this._debug('#__loadSession()', 'used outside of an acquired lock!', new Error().stack);
        }
        try {
            let currentSession = null;
            const maybeSession = await getItemAsync(this.storage, this.storageKey);
            this._debug('#getSession()', 'session from storage', maybeSession);
            if (maybeSession !== null) {
                if (this._isValidSession(maybeSession)) {
                    currentSession = maybeSession;
                }
                else {
                    this._debug('#getSession()', 'session from storage is not valid');
                    await this._removeSession();
                }
            }
            if (!currentSession) {
                return { data: { session: null }, error: null };
            }
            // A session is considered expired before the access token _actually_
            // expires. When the autoRefreshToken option is off (or when the tab is
            // in the background), very eager users of getSession() -- like
            // realtime-js -- might send a valid JWT which will expire by the time it
            // reaches the server.
            const hasExpired = currentSession.expires_at
                ? currentSession.expires_at * 1000 - Date.now() < EXPIRY_MARGIN_MS
                : false;
            this._debug('#__loadSession()', `session has${hasExpired ? '' : ' not'} expired`, 'expires_at', currentSession.expires_at);
            if (!hasExpired) {
                if (this.storage.isServer) {
                    let suppressWarning = this.suppressGetSessionWarning;
                    const proxySession = new Proxy(currentSession, {
                        get: (target, prop, receiver) => {
                            if (!suppressWarning && prop === 'user') {
                                // only show warning when the user object is being accessed from the server
                                console.warn('Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.');
                                suppressWarning = true; // keeps this proxy instance from logging additional warnings
                                this.suppressGetSessionWarning = true; // keeps this client's future proxy instances from warning
                            }
                            return Reflect.get(target, prop, receiver);
                        },
                    });
                    currentSession = proxySession;
                }
                return { data: { session: currentSession }, error: null };
            }
            const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
                return { data: { session: null }, error };
            }
            return { data: { session }, error: null };
        }
        finally {
            this._debug('#__loadSession()', 'end');
        }
    }
    /**
     * Gets the current user details if there is an existing session. This method
     * performs a network request to the Supabase Auth server, so the returned
     * value is authentic and can be used to base authorization rules on.
     *
     * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
     */
    async getUser(jwt) {
        if (jwt) {
            return await this._getUser(jwt);
        }
        await this.initializePromise;
        const result = await this._acquireLock(-1, async () => {
            return await this._getUser();
        });
        return result;
    }
    async _getUser(jwt) {
        try {
            if (jwt) {
                return await _request(this.fetch, 'GET', `${this.url}/user`, {
                    headers: this.headers,
                    jwt: jwt,
                    xform: _userResponse,
                });
            }
            return await this._useSession(async (result) => {
                var _a, _b, _c;
                const { data, error } = result;
                if (error) {
                    throw error;
                }
                // returns an error if there is no access_token or custom authorization header
                if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
                    return { data: { user: null }, error: new AuthSessionMissingError() };
                }
                return await _request(this.fetch, 'GET', `${this.url}/user`, {
                    headers: this.headers,
                    jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : undefined,
                    xform: _userResponse,
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                if (isAuthSessionMissingError(error)) {
                    // JWT contains a `session_id` which does not correspond to an active
                    // session in the database, indicating the user is signed out.
                    await this._removeSession();
                    await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                }
                return { data: { user: null }, error };
            }
            throw error;
        }
    }
    /**
     * Updates user data for a logged in user.
     */
    async updateUser(attributes, options = {}) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
            return await this._updateUser(attributes, options);
        });
    }
    async _updateUser(attributes, options = {}) {
        try {
            return await this._useSession(async (result) => {
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) {
                    throw sessionError;
                }
                if (!sessionData.session) {
                    throw new AuthSessionMissingError();
                }
                const session = sessionData.session;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce' && attributes.email != null) {
                    ;
                    [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                }
                const { data, error: userError } = await _request(this.fetch, 'PUT', `${this.url}/user`, {
                    headers: this.headers,
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                    jwt: session.access_token,
                    xform: _userResponse,
                });
                if (userError)
                    throw userError;
                session.user = data.user;
                await this._saveSession(session);
                await this._notifyAllSubscribers('USER_UPDATED', session);
                return { data: { user: session.user }, error: null };
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null }, error };
            }
            throw error;
        }
    }
    /**
     * Decodes a JWT (without performing any validation).
     */
    _decodeJWT(jwt) {
        return decodeJWTPayload(jwt);
    }
    /**
     * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
     * If the refresh token or access token in the current session is invalid, an error will be thrown.
     * @param currentSession The current session that minimally contains an access token and refresh token.
     */
    async setSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
            return await this._setSession(currentSession);
        });
    }
    async _setSession(currentSession) {
        try {
            if (!currentSession.access_token || !currentSession.refresh_token) {
                throw new AuthSessionMissingError();
            }
            const timeNow = Date.now() / 1000;
            let expiresAt = timeNow;
            let hasExpired = true;
            let session = null;
            const payload = decodeJWTPayload(currentSession.access_token);
            if (payload.exp) {
                expiresAt = payload.exp;
                hasExpired = expiresAt <= timeNow;
            }
            if (hasExpired) {
                const { session: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
                if (error) {
                    return { data: { user: null, session: null }, error: error };
                }
                if (!refreshedSession) {
                    return { data: { user: null, session: null }, error: null };
                }
                session = refreshedSession;
            }
            else {
                const { data, error } = await this._getUser(currentSession.access_token);
                if (error) {
                    throw error;
                }
                session = {
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token,
                    user: data.user,
                    token_type: 'bearer',
                    expires_in: expiresAt - timeNow,
                    expires_at: expiresAt,
                };
                await this._saveSession(session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return { data: { user: session.user, session }, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { session: null, user: null }, error };
            }
            throw error;
        }
    }
    /**
     * Returns a new session, regardless of expiry status.
     * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
     * If the current session's refresh token is invalid, an error will be thrown.
     * @param currentSession The current session. If passed in, it must contain a refresh token.
     */
    async refreshSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
            return await this._refreshSession(currentSession);
        });
    }
    async _refreshSession(currentSession) {
        try {
            return await this._useSession(async (result) => {
                var _a;
                if (!currentSession) {
                    const { data, error } = result;
                    if (error) {
                        throw error;
                    }
                    currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : undefined;
                }
                if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
                    throw new AuthSessionMissingError();
                }
                const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
                if (error) {
                    return { data: { user: null, session: null }, error: error };
                }
                if (!session) {
                    return { data: { user: null, session: null }, error: null };
                }
                return { data: { user: session.user, session }, error: null };
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { user: null, session: null }, error };
            }
            throw error;
        }
    }
    /**
     * Gets the session data from a URL string
     */
    async _getSessionFromURL(params, callbackUrlType) {
        try {
            if (!isBrowser())
                throw new AuthImplicitGrantRedirectError('No browser detected.');
            // If there's an error in the URL, it doesn't matter what flow it is, we just return the error.
            if (params.error || params.error_description || params.error_code) {
                // The error class returned implies that the redirect is from an implicit grant flow
                // but it could also be from a redirect error from a PKCE flow.
                throw new AuthImplicitGrantRedirectError(params.error_description || 'Error in URL with unspecified error_description', {
                    error: params.error || 'unspecified_error',
                    code: params.error_code || 'unspecified_code',
                });
            }
            // Checks for mismatches between the flowType initialised in the client and the URL parameters
            switch (callbackUrlType) {
                case 'implicit':
                    if (this.flowType === 'pkce') {
                        throw new AuthPKCEGrantCodeExchangeError('Not a valid PKCE flow url.');
                    }
                    break;
                case 'pkce':
                    if (this.flowType === 'implicit') {
                        throw new AuthImplicitGrantRedirectError('Not a valid implicit grant flow url.');
                    }
                    break;
                default:
                // there's no mismatch so we continue
            }
            // Since this is a redirect for PKCE, we attempt to retrieve the code from the URL for the code exchange
            if (callbackUrlType === 'pkce') {
                this._debug('#_initialize()', 'begin', 'is PKCE flow', true);
                if (!params.code)
                    throw new AuthPKCEGrantCodeExchangeError('No code detected.');
                const { data, error } = await this._exchangeCodeForSession(params.code);
                if (error)
                    throw error;
                const url = new URL(window.location.href);
                url.searchParams.delete('code');
                window.history.replaceState(window.history.state, '', url.toString());
                return { data: { session: data.session, redirectType: null }, error: null };
            }
            const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type, } = params;
            if (!access_token || !expires_in || !refresh_token || !token_type) {
                throw new AuthImplicitGrantRedirectError('No session defined in URL');
            }
            const timeNow = Math.round(Date.now() / 1000);
            const expiresIn = parseInt(expires_in);
            let expiresAt = timeNow + expiresIn;
            if (expires_at) {
                expiresAt = parseInt(expires_at);
            }
            const actuallyExpiresIn = expiresAt - timeNow;
            if (actuallyExpiresIn * 1000 <= AUTO_REFRESH_TICK_DURATION_MS) {
                console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
            }
            const issuedAt = expiresAt - expiresIn;
            if (timeNow - issuedAt >= 120) {
                console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale', issuedAt, expiresAt, timeNow);
            }
            else if (timeNow - issuedAt < 0) {
                console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew', issuedAt, expiresAt, timeNow);
            }
            const { data, error } = await this._getUser(access_token);
            if (error)
                throw error;
            const session = {
                provider_token,
                provider_refresh_token,
                access_token,
                expires_in: expiresIn,
                expires_at: expiresAt,
                refresh_token,
                token_type,
                user: data.user,
            };
            // Remove tokens from URL
            window.location.hash = '';
            this._debug('#_getSessionFromURL()', 'clearing window.location.hash');
            return { data: { session, redirectType: params.type }, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { session: null, redirectType: null }, error };
            }
            throw error;
        }
    }
    /**
     * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
     */
    _isImplicitGrantCallback(params) {
        return Boolean(params.access_token || params.error_description);
    }
    /**
     * Checks if the current URL and backing storage contain parameters given by a PKCE flow
     */
    async _isPKCECallback(params) {
        const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        return !!(params.code && currentStorageContent);
    }
    /**
     * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
     *
     * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
     * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
     *
     * If using `others` scope, no `SIGNED_OUT` event is fired!
     */
    async signOut(options = { scope: 'global' }) {
        await this.initializePromise;
        return await this._acquireLock(-1, async () => {
            return await this._signOut(options);
        });
    }
    async _signOut({ scope } = { scope: 'global' }) {
        return await this._useSession(async (result) => {
            var _a;
            const { data, error: sessionError } = result;
            if (sessionError) {
                return { error: sessionError };
            }
            const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
            if (accessToken) {
                const { error } = await this.admin.signOut(accessToken, scope);
                if (error) {
                    // ignore 404s since user might not exist anymore
                    // ignore 401s since an invalid or expired JWT should sign out the current session
                    if (!(isAuthApiError(error) &&
                        (error.status === 404 || error.status === 401 || error.status === 403))) {
                        return { error };
                    }
                }
            }
            if (scope !== 'others') {
                await this._removeSession();
                await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            }
            return { error: null };
        });
    }
    /**
     * Receive a notification every time an auth event happens.
     * @param callback A callback function to be invoked when an auth event happens.
     */
    onAuthStateChange(callback) {
        const id = uuid();
        const subscription = {
            id,
            callback,
            unsubscribe: () => {
                this._debug('#unsubscribe()', 'state change callback with id removed', id);
                this.stateChangeEmitters.delete(id);
            },
        };
        this._debug('#onAuthStateChange()', 'registered callback with id', id);
        this.stateChangeEmitters.set(id, subscription);
        (async () => {
            await this.initializePromise;
            await this._acquireLock(-1, async () => {
                this._emitInitialSession(id);
            });
        })();
        return { data: { subscription } };
    }
    async _emitInitialSession(id) {
        return await this._useSession(async (result) => {
            var _a, _b;
            try {
                const { data: { session }, error, } = result;
                if (error)
                    throw error;
                await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback('INITIAL_SESSION', session));
                this._debug('INITIAL_SESSION', 'callback id', id, 'session', session);
            }
            catch (err) {
                await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback('INITIAL_SESSION', null));
                this._debug('INITIAL_SESSION', 'callback id', id, 'error', err);
                console.error(err);
            }
        });
    }
    /**
     * Sends a password reset request to an email address. This method supports the PKCE flow.
     *
     * @param email The email address of the user.
     * @param options.redirectTo The URL to send the user to after they click the password reset link.
     * @param options.captchaToken Verification token received when the user completes the captcha on the site.
     */
    async resetPasswordForEmail(email, options = {}) {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === 'pkce') {
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey, true // isPasswordRecovery
            );
        }
        try {
            return await _request(this.fetch, 'POST', `${this.url}/recover`, {
                body: {
                    email,
                    code_challenge: codeChallenge,
                    code_challenge_method: codeChallengeMethod,
                    gotrue_meta_security: { captcha_token: options.captchaToken },
                },
                headers: this.headers,
                redirectTo: options.redirectTo,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    /**
     * Gets all the identities linked to a user.
     */
    async getUserIdentities() {
        var _a;
        try {
            const { data, error } = await this.getUser();
            if (error)
                throw error;
            return { data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    /**
     * Links an oauth identity to an existing user.
     * This method supports the PKCE flow.
     */
    async linkIdentity(credentials) {
        var _a;
        try {
            const { data, error } = await this._useSession(async (result) => {
                var _a, _b, _c, _d, _e;
                const { data, error } = result;
                if (error)
                    throw error;
                const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
                    redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
                    scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                    queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                    skipBrowserRedirect: true,
                });
                return await _request(this.fetch, 'GET', url, {
                    headers: this.headers,
                    jwt: (_e = (_d = data.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : undefined,
                });
            });
            if (error)
                throw error;
            if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
                window.location.assign(data === null || data === void 0 ? void 0 : data.url);
            }
            return { data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url }, error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: { provider: credentials.provider, url: null }, error };
            }
            throw error;
        }
    }
    /**
     * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
     */
    async unlinkIdentity(identity) {
        try {
            return await this._useSession(async (result) => {
                var _a, _b;
                const { data, error } = result;
                if (error) {
                    throw error;
                }
                return await _request(this.fetch, 'DELETE', `${this.url}/user/identities/${identity.identity_id}`, {
                    headers: this.headers,
                    jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : undefined,
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    /**
     * Generates a new JWT.
     * @param refreshToken A valid refresh token that was returned on login.
     */
    async _refreshAccessToken(refreshToken) {
        const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, 'begin');
        try {
            const startedAt = Date.now();
            // will attempt to refresh the token with exponential backoff
            return await retryable(async (attempt) => {
                if (attempt > 0) {
                    await sleep(200 * Math.pow(2, attempt - 1)); // 200, 400, 800, ...
                }
                this._debug(debugName, 'refreshing attempt', attempt);
                return await _request(this.fetch, 'POST', `${this.url}/token?grant_type=refresh_token`, {
                    body: { refresh_token: refreshToken },
                    headers: this.headers,
                    xform: _sessionResponse,
                });
            }, (attempt, error) => {
                const nextBackOffInterval = 200 * Math.pow(2, attempt);
                return (error &&
                    isAuthRetryableFetchError(error) &&
                    // retryable only if the request can be sent before the backoff overflows the tick duration
                    Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS);
            });
        }
        catch (error) {
            this._debug(debugName, 'error', error);
            if (isAuthError(error)) {
                return { data: { session: null, user: null }, error };
            }
            throw error;
        }
        finally {
            this._debug(debugName, 'end');
        }
    }
    _isValidSession(maybeSession) {
        const isValidSession = typeof maybeSession === 'object' &&
            maybeSession !== null &&
            'access_token' in maybeSession &&
            'refresh_token' in maybeSession &&
            'expires_at' in maybeSession;
        return isValidSession;
    }
    async _handleProviderSignIn(provider, options) {
        const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
            redirectTo: options.redirectTo,
            scopes: options.scopes,
            queryParams: options.queryParams,
        });
        this._debug('#_handleProviderSignIn()', 'provider', provider, 'options', options, 'url', url);
        // try to open on the browser
        if (isBrowser() && !options.skipBrowserRedirect) {
            window.location.assign(url);
        }
        return { data: { provider, url }, error: null };
    }
    /**
     * Recovers the session from LocalStorage and refreshes the token
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */
    async _recoverAndRefresh() {
        var _a;
        const debugName = '#_recoverAndRefresh()';
        this._debug(debugName, 'begin');
        try {
            const currentSession = await getItemAsync(this.storage, this.storageKey);
            this._debug(debugName, 'session from storage', currentSession);
            if (!this._isValidSession(currentSession)) {
                this._debug(debugName, 'session is not valid');
                if (currentSession !== null) {
                    await this._removeSession();
                }
                return;
            }
            const expiresWithMargin = ((_a = currentSession.expires_at) !== null && _a !== void 0 ? _a : Infinity) * 1000 - Date.now() < EXPIRY_MARGIN_MS;
            this._debug(debugName, `session has${expiresWithMargin ? '' : ' not'} expired with margin of ${EXPIRY_MARGIN_MS}s`);
            if (expiresWithMargin) {
                if (this.autoRefreshToken && currentSession.refresh_token) {
                    const { error } = await this._callRefreshToken(currentSession.refresh_token);
                    if (error) {
                        console.error(error);
                        if (!isAuthRetryableFetchError(error)) {
                            this._debug(debugName, 'refresh failed with a non-retryable error, removing the session', error);
                            await this._removeSession();
                        }
                    }
                }
            }
            else {
                // no need to persist currentSession again, as we just loaded it from
                // local storage; persisting it again may overwrite a value saved by
                // another client with access to the same local storage
                await this._notifyAllSubscribers('SIGNED_IN', currentSession);
            }
        }
        catch (err) {
            this._debug(debugName, 'error', err);
            console.error(err);
            return;
        }
        finally {
            this._debug(debugName, 'end');
        }
    }
    async _callRefreshToken(refreshToken) {
        var _a, _b;
        if (!refreshToken) {
            throw new AuthSessionMissingError();
        }
        // refreshing is already in progress
        if (this.refreshingDeferred) {
            return this.refreshingDeferred.promise;
        }
        const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, 'begin');
        try {
            this.refreshingDeferred = new Deferred();
            const { data, error } = await this._refreshAccessToken(refreshToken);
            if (error)
                throw error;
            if (!data.session)
                throw new AuthSessionMissingError();
            await this._saveSession(data.session);
            await this._notifyAllSubscribers('TOKEN_REFRESHED', data.session);
            const result = { session: data.session, error: null };
            this.refreshingDeferred.resolve(result);
            return result;
        }
        catch (error) {
            this._debug(debugName, 'error', error);
            if (isAuthError(error)) {
                const result = { session: null, error };
                if (!isAuthRetryableFetchError(error)) {
                    await this._removeSession();
                }
                (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
                return result;
            }
            (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
            throw error;
        }
        finally {
            this.refreshingDeferred = null;
            this._debug(debugName, 'end');
        }
    }
    async _notifyAllSubscribers(event, session, broadcast = true) {
        const debugName = `#_notifyAllSubscribers(${event})`;
        this._debug(debugName, 'begin', session, `broadcast = ${broadcast}`);
        try {
            if (this.broadcastChannel && broadcast) {
                this.broadcastChannel.postMessage({ event, session });
            }
            const errors = [];
            const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
                try {
                    await x.callback(event, session);
                }
                catch (e) {
                    errors.push(e);
                }
            });
            await Promise.all(promises);
            if (errors.length > 0) {
                for (let i = 0; i < errors.length; i += 1) {
                    console.error(errors[i]);
                }
                throw errors[0];
            }
        }
        finally {
            this._debug(debugName, 'end');
        }
    }
    /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */
    async _saveSession(session) {
        this._debug('#_saveSession()', session);
        // _saveSession is always called whenever a new session has been acquired
        // so we can safely suppress the warning returned by future getSession calls
        this.suppressGetSessionWarning = true;
        await setItemAsync(this.storage, this.storageKey, session);
    }
    async _removeSession() {
        this._debug('#_removeSession()');
        await removeItemAsync(this.storage, this.storageKey);
        await this._notifyAllSubscribers('SIGNED_OUT', null);
    }
    /**
     * Removes any registered visibilitychange callback.
     *
     * {@see #startAutoRefresh}
     * {@see #stopAutoRefresh}
     */
    _removeVisibilityChangedCallback() {
        this._debug('#_removeVisibilityChangedCallback()');
        const callback = this.visibilityChangedCallback;
        this.visibilityChangedCallback = null;
        try {
            if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
                window.removeEventListener('visibilitychange', callback);
            }
        }
        catch (e) {
            console.error('removing visibilitychange callback failed', e);
        }
    }
    /**
     * This is the private implementation of {@link #startAutoRefresh}. Use this
     * within the library.
     */
    async _startAutoRefresh() {
        await this._stopAutoRefresh();
        this._debug('#_startAutoRefresh()');
        const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
        this.autoRefreshTicker = ticker;
        if (ticker && typeof ticker === 'object' && typeof ticker.unref === 'function') {
            // ticker is a NodeJS Timeout object that has an `unref` method
            // https://nodejs.org/api/timers.html#timeoutunref
            // When auto refresh is used in NodeJS (like for testing) the
            // `setInterval` is preventing the process from being marked as
            // finished and tests run endlessly. This can be prevented by calling
            // `unref()` on the returned object.
            ticker.unref();
            // @ts-expect-error TS has no context of Deno
        }
        else if (typeof Deno !== 'undefined' && typeof Deno.unrefTimer === 'function') {
            // similar like for NodeJS, but with the Deno API
            // https://deno.land/api@latest?unstable&s=Deno.unrefTimer
            // @ts-expect-error TS has no context of Deno
            Deno.unrefTimer(ticker);
        }
        // run the tick immediately, but in the next pass of the event loop so that
        // #_initialize can be allowed to complete without recursively waiting on
        // itself
        setTimeout(async () => {
            await this.initializePromise;
            await this._autoRefreshTokenTick();
        }, 0);
    }
    /**
     * This is the private implementation of {@link #stopAutoRefresh}. Use this
     * within the library.
     */
    async _stopAutoRefresh() {
        this._debug('#_stopAutoRefresh()');
        const ticker = this.autoRefreshTicker;
        this.autoRefreshTicker = null;
        if (ticker) {
            clearInterval(ticker);
        }
    }
    /**
     * Starts an auto-refresh process in the background. The session is checked
     * every few seconds. Close to the time of expiration a process is started to
     * refresh the session. If refreshing fails it will be retried for as long as
     * necessary.
     *
     * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
     * to call this function, it will be called for you.
     *
     * On browsers the refresh process works only when the tab/window is in the
     * foreground to conserve resources as well as prevent race conditions and
     * flooding auth with requests. If you call this method any managed
     * visibility change callback will be removed and you must manage visibility
     * changes on your own.
     *
     * On non-browser platforms the refresh process works *continuously* in the
     * background, which may not be desirable. You should hook into your
     * platform's foreground indication mechanism and call these methods
     * appropriately to conserve resources.
     *
     * {@see #stopAutoRefresh}
     */
    async startAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._startAutoRefresh();
    }
    /**
     * Stops an active auto refresh process running in the background (if any).
     *
     * If you call this method any managed visibility change callback will be
     * removed and you must manage visibility changes on your own.
     *
     * See {@link #startAutoRefresh} for more details.
     */
    async stopAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._stopAutoRefresh();
    }
    /**
     * Runs the auto refresh token tick.
     */
    async _autoRefreshTokenTick() {
        this._debug('#_autoRefreshTokenTick()', 'begin');
        try {
            await this._acquireLock(0, async () => {
                try {
                    const now = Date.now();
                    try {
                        return await this._useSession(async (result) => {
                            const { data: { session }, } = result;
                            if (!session || !session.refresh_token || !session.expires_at) {
                                this._debug('#_autoRefreshTokenTick()', 'no session');
                                return;
                            }
                            // session will expire in this many ticks (or has already expired if <= 0)
                            const expiresInTicks = Math.floor((session.expires_at * 1000 - now) / AUTO_REFRESH_TICK_DURATION_MS);
                            this._debug('#_autoRefreshTokenTick()', `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                            if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                                await this._callRefreshToken(session.refresh_token);
                            }
                        });
                    }
                    catch (e) {
                        console.error('Auto refresh tick failed with error. This is likely a transient error.', e);
                    }
                }
                finally {
                    this._debug('#_autoRefreshTokenTick()', 'end');
                }
            });
        }
        catch (e) {
            if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
                this._debug('auto refresh token tick lock not available');
            }
            else {
                throw e;
            }
        }
    }
    /**
     * Registers callbacks on the browser / platform, which in-turn run
     * algorithms when the browser window/tab are in foreground. On non-browser
     * platforms it assumes always foreground.
     */
    async _handleVisibilityChange() {
        this._debug('#_handleVisibilityChange()');
        if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
            if (this.autoRefreshToken) {
                // in non-browser environments the refresh token ticker runs always
                this.startAutoRefresh();
            }
            return false;
        }
        try {
            this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
            window === null || window === void 0 ? void 0 : window.addEventListener('visibilitychange', this.visibilityChangedCallback);
            // now immediately call the visbility changed callback to setup with the
            // current visbility state
            await this._onVisibilityChanged(true); // initial call
        }
        catch (error) {
            console.error('_handleVisibilityChange', error);
        }
    }
    /**
     * Callback registered with `window.addEventListener('visibilitychange')`.
     */
    async _onVisibilityChanged(calledFromInitialize) {
        const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
        this._debug(methodName, 'visibilityState', document.visibilityState);
        if (document.visibilityState === 'visible') {
            if (this.autoRefreshToken) {
                // in browser environments the refresh token ticker runs only on focused tabs
                // which prevents race conditions
                this._startAutoRefresh();
            }
            if (!calledFromInitialize) {
                // called when the visibility has changed, i.e. the browser
                // transitioned from hidden -> visible so we need to see if the session
                // should be recovered immediately... but to do that we need to acquire
                // the lock first asynchronously
                await this.initializePromise;
                await this._acquireLock(-1, async () => {
                    if (document.visibilityState !== 'visible') {
                        this._debug(methodName, 'acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting');
                        // visibility has changed while waiting for the lock, abort
                        return;
                    }
                    // recover the session
                    await this._recoverAndRefresh();
                });
            }
        }
        else if (document.visibilityState === 'hidden') {
            if (this.autoRefreshToken) {
                this._stopAutoRefresh();
            }
        }
    }
    /**
     * Generates the relevant login URL for a third-party provider.
     * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
     * @param options.scopes A space-separated list of scopes granted to the OAuth application.
     * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
     */
    async _getUrlForProvider(url, provider, options) {
        const urlParams = [`provider=${encodeURIComponent(provider)}`];
        if (options === null || options === void 0 ? void 0 : options.redirectTo) {
            urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
        }
        if (options === null || options === void 0 ? void 0 : options.scopes) {
            urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
        }
        if (this.flowType === 'pkce') {
            const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
            const flowParams = new URLSearchParams({
                code_challenge: `${encodeURIComponent(codeChallenge)}`,
                code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`,
            });
            urlParams.push(flowParams.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.queryParams) {
            const query = new URLSearchParams(options.queryParams);
            urlParams.push(query.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
            urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
        }
        return `${url}?${urlParams.join('&')}`;
    }
    async _unenroll(params) {
        try {
            return await this._useSession(async (result) => {
                var _a;
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) {
                    return { data: null, error: sessionError };
                }
                return await _request(this.fetch, 'DELETE', `${this.url}/factors/${params.factorId}`, {
                    headers: this.headers,
                    jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    async _enroll(params) {
        try {
            return await this._useSession(async (result) => {
                var _a, _b;
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) {
                    return { data: null, error: sessionError };
                }
                const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, (params.factorType === 'phone' ? { phone: params.phone } : { issuer: params.issuer }));
                const { data, error } = await _request(this.fetch, 'POST', `${this.url}/factors`, {
                    body,
                    headers: this.headers,
                    jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                });
                if (error) {
                    return { data: null, error };
                }
                if (params.factorType === 'totp' && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
                    data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
                }
                return { data, error: null };
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            throw error;
        }
    }
    /**
     * {@see GoTrueMFAApi#verify}
     */
    async _verify(params) {
        return this._acquireLock(-1, async () => {
            try {
                return await this._useSession(async (result) => {
                    var _a;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    const { data, error } = await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/verify`, {
                        body: { code: params.code, challenge_id: params.challengeId },
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                    if (error) {
                        return { data: null, error };
                    }
                    await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1000) + data.expires_in }, data));
                    await this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', data);
                    return { data, error };
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * {@see GoTrueMFAApi#challenge}
     */
    async _challenge(params) {
        return this._acquireLock(-1, async () => {
            try {
                return await this._useSession(async (result) => {
                    var _a;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    return await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/challenge`, {
                        body: { channel: params.channel },
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * {@see GoTrueMFAApi#challengeAndVerify}
     */
    async _challengeAndVerify(params) {
        // both _challenge and _verify independently acquire the lock, so no need
        // to acquire it here
        const { data: challengeData, error: challengeError } = await this._challenge({
            factorId: params.factorId,
        });
        if (challengeError) {
            return { data: null, error: challengeError };
        }
        return await this._verify({
            factorId: params.factorId,
            challengeId: challengeData.id,
            code: params.code,
        });
    }
    /**
     * {@see GoTrueMFAApi#listFactors}
     */
    async _listFactors() {
        // use #getUser instead of #_getUser as the former acquires a lock
        const { data: { user }, error: userError, } = await this.getUser();
        if (userError) {
            return { data: null, error: userError };
        }
        const factors = (user === null || user === void 0 ? void 0 : user.factors) || [];
        const totp = factors.filter((factor) => factor.factor_type === 'totp' && factor.status === 'verified');
        const phone = factors.filter((factor) => factor.factor_type === 'phone' && factor.status === 'verified');
        return {
            data: {
                all: factors,
                totp,
                phone,
            },
            error: null,
        };
    }
    /**
     * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
     */
    async _getAuthenticatorAssuranceLevel() {
        return this._acquireLock(-1, async () => {
            return await this._useSession(async (result) => {
                var _a, _b;
                const { data: { session }, error: sessionError, } = result;
                if (sessionError) {
                    return { data: null, error: sessionError };
                }
                if (!session) {
                    return {
                        data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
                        error: null,
                    };
                }
                const payload = this._decodeJWT(session.access_token);
                let currentLevel = null;
                if (payload.aal) {
                    currentLevel = payload.aal;
                }
                let nextLevel = currentLevel;
                const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === 'verified')) !== null && _b !== void 0 ? _b : [];
                if (verifiedFactors.length > 0) {
                    nextLevel = 'aal2';
                }
                const currentAuthenticationMethods = payload.amr || [];
                return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
            });
        });
    }
}
GoTrueClient.nextInstanceID = 0;

const AuthClient = GoTrueClient;

class SupabaseAuthClient extends AuthClient {
    constructor(options) {
        super(options);
    }
}

var __awaiter = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Supabase Client.
 *
 * An isomorphic Javascript client for interacting with Postgres.
 */
class SupabaseClient {
    /**
     * Create a new client for use in the browser.
     * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
     * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
     * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
     * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
     * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
     * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
     * @param options.realtime Options passed along to realtime-js constructor.
     * @param options.global.fetch A custom fetch implementation.
     * @param options.global.headers Any additional headers to send with each network request.
     */
    constructor(supabaseUrl, supabaseKey, options) {
        var _a, _b, _c;
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        if (!supabaseUrl)
            throw new Error('supabaseUrl is required.');
        if (!supabaseKey)
            throw new Error('supabaseKey is required.');
        const _supabaseUrl = stripTrailingSlash(supabaseUrl);
        this.realtimeUrl = `${_supabaseUrl}/realtime/v1`.replace(/^http/i, 'ws');
        this.authUrl = `${_supabaseUrl}/auth/v1`;
        this.storageUrl = `${_supabaseUrl}/storage/v1`;
        this.functionsUrl = `${_supabaseUrl}/functions/v1`;
        // default storage key uses the supabase project ref as a namespace
        const defaultStorageKey = `sb-${new URL(this.authUrl).hostname.split('.')[0]}-auth-token`;
        const DEFAULTS = {
            db: DEFAULT_DB_OPTIONS,
            realtime: DEFAULT_REALTIME_OPTIONS,
            auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
            global: DEFAULT_GLOBAL_OPTIONS,
        };
        const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
        this.storageKey = (_a = settings.auth.storageKey) !== null && _a !== void 0 ? _a : '';
        this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
        if (!settings.accessToken) {
            this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
        }
        else {
            this.accessToken = settings.accessToken;
            this.auth = new Proxy({}, {
                get: (_, prop) => {
                    throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
                },
            });
        }
        this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
        this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, settings.realtime));
        this.rest = new PostgrestClient(`${_supabaseUrl}/rest/v1`, {
            headers: this.headers,
            schema: settings.db.schema,
            fetch: this.fetch,
        });
        if (!settings.accessToken) {
            this._listenForAuthEvents();
        }
    }
    /**
     * Supabase Functions allows you to deploy and invoke edge functions.
     */
    get functions() {
        return new FunctionsClient(this.functionsUrl, {
            headers: this.headers,
            customFetch: this.fetch,
        });
    }
    /**
     * Supabase Storage allows you to manage user-generated content, such as photos or videos.
     */
    get storage() {
        return new StorageClient(this.storageUrl, this.headers, this.fetch);
    }
    /**
     * Perform a query on a table or a view.
     *
     * @param relation - The table or view name to query
     */
    from(relation) {
        return this.rest.from(relation);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.schema
    /**
     * Select a schema to query or perform an function (rpc) call.
     *
     * The schema needs to be on the list of exposed schemas inside Supabase.
     *
     * @param schema - The schema to query
     */
    schema(schema) {
        return this.rest.schema(schema);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.rpc
    /**
     * Perform a function call.
     *
     * @param fn - The function name to call
     * @param args - The arguments to pass to the function call
     * @param options - Named parameters
     * @param options.head - When set to `true`, `data` will not be returned.
     * Useful if you only need the count.
     * @param options.get - When set to `true`, the function will be called with
     * read-only access mode.
     * @param options.count - Count algorithm to use to count rows returned by the
     * function. Only applicable for [set-returning
     * functions](https://www.postgresql.org/docs/current/functions-srf.html).
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    rpc(fn, args = {}, options = {}) {
        return this.rest.rpc(fn, args, options);
    }
    /**
     * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
     *
     * @param {string} name - The name of the Realtime channel.
     * @param {Object} opts - The options to pass to the Realtime channel.
     *
     */
    channel(name, opts = { config: {} }) {
        return this.realtime.channel(name, opts);
    }
    /**
     * Returns all Realtime channels.
     */
    getChannels() {
        return this.realtime.getChannels();
    }
    /**
     * Unsubscribes and removes Realtime channel from Realtime client.
     *
     * @param {RealtimeChannel} channel - The name of the Realtime channel.
     *
     */
    removeChannel(channel) {
        return this.realtime.removeChannel(channel);
    }
    /**
     * Unsubscribes and removes all Realtime channels from Realtime client.
     */
    removeAllChannels() {
        return this.realtime.removeAllChannels();
    }
    _getAccessToken() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accessToken) {
                return yield this.accessToken();
            }
            const { data } = yield this.auth.getSession();
            return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : null;
        });
    }
    _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, storageKey, flowType, lock, debug, }, headers, fetch) {
        const authHeaders = {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: `${this.supabaseKey}`,
        };
        return new SupabaseAuthClient({
            url: this.authUrl,
            headers: Object.assign(Object.assign({}, authHeaders), headers),
            storageKey: storageKey,
            autoRefreshToken,
            persistSession,
            detectSessionInUrl,
            storage,
            flowType,
            lock,
            debug,
            fetch,
            // auth checks if there is a custom authorizaiton header using this flag
            // so it knows whether to return an error when getUser is called with no session
            hasCustomAuthorizationHeader: 'Authorization' in this.headers,
        });
    }
    _initRealtimeClient(options) {
        return new RealtimeClient(this.realtimeUrl, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
    }
    _listenForAuthEvents() {
        let data = this.auth.onAuthStateChange((event, session) => {
            this._handleTokenChanged(event, 'CLIENT', session === null || session === void 0 ? void 0 : session.access_token);
        });
        return data;
    }
    _handleTokenChanged(event, source, token) {
        if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
            this.changedAccessToken !== token) {
            this.changedAccessToken = token;
        }
        else if (event === 'SIGNED_OUT') {
            this.realtime.setAuth();
            if (source == 'STORAGE')
                this.auth.signOut();
            this.changedAccessToken = undefined;
        }
    }
}

/**
 * Creates a new Supabase Client.
 */
const createClient = (supabaseUrl, supabaseKey, options) => {
    return new SupabaseClient(supabaseUrl, supabaseKey, options);
};

function calculateHealthImprovement(quitDate) {
  if (!quitDate)
    return 0;
  const daysSinceQuit = Math.max(0, differenceInDays(/* @__PURE__ */ new Date(), quitDate));
  if (daysSinceQuit <= 0)
    return 0;
  if (daysSinceQuit < 2)
    return Math.min(10, daysSinceQuit * 5);
  if (daysSinceQuit < 7)
    return 10 + Math.min(10, (daysSinceQuit - 2) * 2);
  if (daysSinceQuit < 30)
    return 20 + Math.min(15, (daysSinceQuit - 7) * 0.65);
  if (daysSinceQuit < 90)
    return 35 + Math.min(15, (daysSinceQuit - 30) * 0.25);
  if (daysSinceQuit < 365)
    return 50 + Math.min(20, (daysSinceQuit - 90) * 0.073);
  if (daysSinceQuit < 3650)
    return 70 + Math.min(25, (daysSinceQuit - 365) * 0.025);
  return 95;
}
function calculateCigarettesAvoided(quitDate, dailyAvgCigarettes) {
  if (!quitDate || dailyAvgCigarettes <= 0)
    return 0;
  const daysSinceQuit = Math.max(0, differenceInDays(/* @__PURE__ */ new Date(), quitDate));
  return Math.floor(daysSinceQuit * dailyAvgCigarettes);
}
function calculateCarbonReduction(cigarettesAvoided) {
  return cigarettesAvoided * 14;
}
function calculateSavings(quitDate, costPerPack, packsPerDay) {
  if (!quitDate || costPerPack <= 0 || packsPerDay <= 0) {
    return { daily: 0, weekly: 0, monthly: 0, yearly: 0, total: 0 };
  }
  const daysSinceQuit = Math.max(0, differenceInDays(/* @__PURE__ */ new Date(), quitDate));
  const dailySavings = costPerPack * packsPerDay;
  return {
    daily: dailySavings,
    weekly: dailySavings * 7,
    monthly: dailySavings * 30,
    yearly: dailySavings * 365,
    total: dailySavings * daysSinceQuit
  };
}

const supabase = createClient(
  "https://zoubqdwxemivxrjruvam.supabase.co" ,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs" ,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

const React$1 = await importShared('react');
const {useState: useState$2} = React$1;
const HolisticDashboard = ({
  session,
  quitDate,
  className = ""
}) => {
  useState$2("dashboard");
  const [timeRange, setTimeRange] = useState$2("week");
  const { data: moodLogs, isLoading: moodLoading } = useQuery({
    queryKey: ["mood-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mood_logs").select("*").eq("user_id", session?.user?.id).order("timestamp", { ascending: false }).limit(30);
      if (error)
        throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });
  const { data: energyLogs, isLoading: energyLoading } = useQuery({
    queryKey: ["energy-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("energy_focus_logs").select("*").eq("user_id", session?.user?.id).order("timestamp", { ascending: false }).limit(30);
      if (error)
        throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });
  const { data: focusLogs, isLoading: focusLoading } = useQuery({
    queryKey: ["focus-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("focus_logs").select("*").eq("user_id", session?.user?.id).order("timestamp", { ascending: false }).limit(30);
      if (error)
        throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });
  const dailyMetrics = React$1.useMemo(() => {
    const metricsByDate = {};
    const daysToShow = timeRange === "week" ? 7 : 30;
    for (let i = 0; i < daysToShow; i++) {
      const date = subDays(/* @__PURE__ */ new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const formattedDate = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d");
      metricsByDate[dateStr] = {
        date: dateStr,
        formattedDate,
        mood: 0,
        energy: 0,
        focus: 0,
        moodCount: 0,
        energyCount: 0,
        focusCount: 0,
        cravingRelated: 0,
        physicalActivity: 0,
        averageSleep: 0
      };
    }
    moodLogs?.forEach((log) => {
      const date = format(new Date(log.timestamp), "yyyy-MM-dd");
      if (metricsByDate[date]) {
        metricsByDate[date].mood += log.mood_score;
        metricsByDate[date].moodCount += 1;
        if (log.related_to_cravings) {
          metricsByDate[date].cravingRelated += 1;
        }
      }
    });
    energyLogs?.forEach((log) => {
      const date = format(new Date(log.timestamp), "yyyy-MM-dd");
      if (metricsByDate[date]) {
        metricsByDate[date].energy += log.energy_level;
        metricsByDate[date].energyCount += 1;
        if (log.physical_activity) {
          metricsByDate[date].physicalActivity += 1;
        }
        metricsByDate[date].averageSleep += log.sleep_hours;
      }
    });
    focusLogs?.forEach((log) => {
      const date = format(new Date(log.timestamp), "yyyy-MM-dd");
      if (metricsByDate[date]) {
        metricsByDate[date].focus += log.focus_level;
        metricsByDate[date].focusCount += 1;
      }
    });
    return Object.values(metricsByDate).map((daily) => ({
      ...daily,
      mood: daily.moodCount ? daily.mood / daily.moodCount : 0,
      energy: daily.energyCount ? daily.energy / daily.energyCount : 0,
      focus: daily.focusCount ? daily.focus / daily.focusCount : 0,
      averageSleep: daily.energyCount ? daily.averageSleep / daily.energyCount : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [moodLogs, energyLogs, focusLogs, timeRange]);
  const correlations = React$1.useMemo(() => {
    const completeData = dailyMetrics.filter(
      (day) => day.moodCount > 0 && day.energyCount > 0 && day.focusCount > 0
    );
    if (completeData.length < 3) {
      return {
        moodEnergy: 0,
        moodFocus: 0,
        energyFocus: 0,
        physicalActivity: 0,
        cravingImpact: 0,
        sleepQuality: 0
      };
    }
    const avgMood = completeData.reduce((sum, day) => sum + day.mood, 0) / completeData.length;
    const avgEnergy = completeData.reduce((sum, day) => sum + day.energy, 0) / completeData.length;
    const avgFocus = completeData.reduce((sum, day) => sum + day.focus, 0) / completeData.length;
    let covMoodEnergy = 0, covMoodFocus = 0, covEnergyFocus = 0;
    let varMood = 0, varEnergy = 0, varFocus = 0;
    completeData.forEach((day) => {
      covMoodEnergy += (day.mood - avgMood) * (day.energy - avgEnergy);
      covMoodFocus += (day.mood - avgMood) * (day.focus - avgFocus);
      covEnergyFocus += (day.energy - avgEnergy) * (day.focus - avgFocus);
      varMood += Math.pow(day.mood - avgMood, 2);
      varEnergy += Math.pow(day.energy - avgEnergy, 2);
      varFocus += Math.pow(day.focus - avgFocus, 2);
    });
    const moodEnergy = covMoodEnergy / Math.sqrt(varMood * varEnergy);
    const moodFocus = covMoodFocus / Math.sqrt(varMood * varFocus);
    const energyFocus = covEnergyFocus / Math.sqrt(varEnergy * varFocus);
    const physicalActivityDays = completeData.filter((day) => day.physicalActivity > 0);
    const nonPhysicalActivityDays = completeData.filter((day) => day.physicalActivity === 0);
    const physicalActivity = physicalActivityDays.length && nonPhysicalActivityDays.length ? physicalActivityDays.reduce((sum, day) => sum + day.energy, 0) / physicalActivityDays.length / (nonPhysicalActivityDays.reduce((sum, day) => sum + day.energy, 0) / nonPhysicalActivityDays.length) - 1 : 0;
    const cravingDays = completeData.filter((day) => day.cravingRelated > 0);
    const nonCravingDays = completeData.filter((day) => day.cravingRelated === 0);
    const cravingImpact = cravingDays.length && nonCravingDays.length ? cravingDays.reduce((sum, day) => sum + day.mood, 0) / cravingDays.length / (nonCravingDays.reduce((sum, day) => sum + day.mood, 0) / nonCravingDays.length) - 1 : 0;
    const goodSleepDays = completeData.filter((day) => day.averageSleep >= 7);
    const poorSleepDays = completeData.filter((day) => day.averageSleep > 0 && day.averageSleep < 7);
    const sleepQuality = goodSleepDays.length && poorSleepDays.length ? goodSleepDays.reduce((sum, day) => sum + day.energy, 0) / goodSleepDays.length / (poorSleepDays.reduce((sum, day) => sum + day.energy, 0) / poorSleepDays.length) - 1 : 0;
    return {
      moodEnergy: isNaN(moodEnergy) ? 0 : moodEnergy,
      moodFocus: isNaN(moodFocus) ? 0 : moodFocus,
      energyFocus: isNaN(energyFocus) ? 0 : energyFocus,
      physicalActivity: isNaN(physicalActivity) ? 0 : physicalActivity,
      cravingImpact: isNaN(cravingImpact) ? 0 : cravingImpact,
      sleepQuality: isNaN(sleepQuality) ? 0 : sleepQuality
    };
  }, [dailyMetrics]);
  const radarData = [
    {
      subject: "Mood",
      A: dailyMetrics.length ? dailyMetrics.reduce((sum, day) => sum + day.mood, 0) / dailyMetrics.reduce((sum, day) => sum + (day.moodCount > 0 ? 1 : 0), 0) / 10 : 0,
      fullMark: 1
    },
    {
      subject: "Energy",
      A: dailyMetrics.length ? dailyMetrics.reduce((sum, day) => sum + day.energy, 0) / dailyMetrics.reduce((sum, day) => sum + (day.energyCount > 0 ? 1 : 0), 0) / 10 : 0,
      fullMark: 1
    },
    {
      subject: "Focus",
      A: dailyMetrics.length ? dailyMetrics.reduce((sum, day) => sum + day.focus, 0) / dailyMetrics.reduce((sum, day) => sum + (day.focusCount > 0 ? 1 : 0), 0) / 10 : 0,
      fullMark: 1
    },
    {
      subject: "Sleep",
      A: dailyMetrics.length ? dailyMetrics.reduce((sum, day) => sum + day.averageSleep, 0) / dailyMetrics.reduce((sum, day) => sum + (day.energyCount > 0 ? 1 : 0), 0) / 10 : 0,
      fullMark: 1
    },
    {
      subject: "Activity",
      A: dailyMetrics.length ? dailyMetrics.reduce((sum, day) => sum + day.physicalActivity, 0) / dailyMetrics.length / 3 : 0,
      fullMark: 1
    }
  ];
  const correlationData = [
    { name: "Mood-Energy", value: Math.abs(correlations.moodEnergy), actual: correlations.moodEnergy },
    { name: "Mood-Focus", value: Math.abs(correlations.moodFocus), actual: correlations.moodFocus },
    { name: "Energy-Focus", value: Math.abs(correlations.energyFocus), actual: correlations.energyFocus },
    { name: "Exercise Impact", value: Math.abs(correlations.physicalActivity), actual: correlations.physicalActivity },
    { name: "Craving Impact", value: Math.abs(correlations.cravingImpact), actual: correlations.cravingImpact },
    { name: "Sleep Quality", value: Math.abs(correlations.sleepQuality), actual: correlations.sleepQuality }
  ];
  const combinedChartData = dailyMetrics.filter((day) => day.moodCount > 0 || day.energyCount > 0 || day.focusCount > 0).map((day) => ({
    name: day.formattedDate,
    mood: day.moodCount ? day.mood : null,
    energy: day.energyCount ? day.energy : null,
    focus: day.focusCount ? day.focus : null,
    sleep: day.energyCount ? day.averageSleep : null,
    craving: day.cravingRelated > 0 ? 1 : 0,
    activity: day.physicalActivity > 0 ? 1 : 0
  }));
  const formatTooltipValue = (value, name) => {
    if (name !== void 0) {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      return [`${(numValue * 10).toFixed(1)}/10`, name];
    } else {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      return `${(numValue * 10).toFixed(1)}`;
    }
  };
  const isLoading = moodLoading || energyLoading || focusLoading;
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: cn("space-y-8", className), children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col gap-4 md:flex-row md:justify-between md:items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: "Holistic Health Dashboard" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 418,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Track how quitting smoking impacts your overall wellbeing" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 419,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 417,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2 self-start", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        RadioGroup,
        {
          defaultValue: timeRange,
          onValueChange: (value) => setTimeRange(value),
          className: "flex space-x-1",
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "week", id: "week" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                lineNumber: 431,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "week", children: "Week" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                lineNumber: 432,
                columnNumber: 15
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 430,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "month", id: "month" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                lineNumber: 435,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "month", children: "Month" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                lineNumber: 436,
                columnNumber: 15
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 434,
              columnNumber: 13
            }, globalThis)
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 425,
          columnNumber: 11
        },
        globalThis
      ) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 424,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
      lineNumber: 416,
      columnNumber: 7
    }, globalThis),
    isLoading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-80 flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 445,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Loading your health data..." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 446,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
      lineNumber: 444,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
      lineNumber: 443,
      columnNumber: 9
    }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4 md:p-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Moon, { className: "h-5 w-5 text-purple-500 mb-1" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 456,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium mb-1", children: "Average Mood" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 457,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl md:text-2xl font-bold", children: dailyMetrics.length > 0 ? `${(dailyMetrics.reduce((acc, day) => acc + day.mood, 0) / dailyMetrics.filter((d) => d.mood > 0).length * 10).toFixed(1)}/10` : "No data" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 458,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 455,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 454,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 453,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4 md:p-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5 text-amber-500 mb-1" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 470,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium mb-1", children: "Energy Level" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 471,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl md:text-2xl font-bold", children: dailyMetrics.length > 0 ? `${(dailyMetrics.reduce((acc, day) => acc + day.energy, 0) / dailyMetrics.filter((d) => d.energy > 0).length * 10).toFixed(1)}/10` : "No data" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 472,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 469,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 468,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 467,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4 md:p-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BrainCircuit, { className: "h-5 w-5 text-blue-500 mb-1" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 484,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium mb-1", children: "Focus Score" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 485,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl md:text-2xl font-bold", children: dailyMetrics.length > 0 ? `${(dailyMetrics.reduce((acc, day) => acc + day.focus, 0) / dailyMetrics.filter((d) => d.focus > 0).length * 10).toFixed(1)}/10` : "No data" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 486,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 483,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 482,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 481,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4 md:p-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CalendarDays, { className: "h-5 w-5 text-green-500 mb-1" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 498,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium mb-1", children: "Days Tracked" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 499,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl md:text-2xl font-bold", children: dailyMetrics.filter(
            (day) => day.moodCount > 0 || day.energyCount > 0 || day.focusCount > 0
          ).length }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 500,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 497,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 496,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 495,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 452,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Metrics Over Time" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 513,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Track how your mood, energy and focus have changed" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 514,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 512,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-[300px] md:h-[350px]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LineChart, { data: dailyMetrics.slice().reverse(), margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CartesianGrid, { strokeDasharray: "3 3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 522,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            XAxis,
            {
              dataKey: "formattedDate",
              tick: { fontSize: 12 },
              tickMargin: 10,
              height: 40,
              tickFormatter: (value, index) => {
                if (window.innerWidth < 768) {
                  return index % 2 === 0 ? value : "";
                }
                return value;
              }
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 523,
              columnNumber: 21
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            YAxis,
            {
              domain: [0, 1],
              tickFormatter: formatTooltipValue,
              width: 40
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 537,
              columnNumber: 21
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tooltip, { formatter: (value) => formatTooltipValue(value, "") }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 542,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Legend, {}, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 543,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Line,
            {
              type: "monotone",
              dataKey: "mood",
              stroke: "#8b5cf6",
              strokeWidth: 2,
              activeDot: { r: 6 },
              name: "Mood",
              dot: { strokeWidth: 2 }
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 544,
              columnNumber: 21
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Line,
            {
              type: "monotone",
              dataKey: "energy",
              stroke: "#f59e0b",
              strokeWidth: 2,
              activeDot: { r: 6 },
              name: "Energy",
              dot: { strokeWidth: 2 }
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 553,
              columnNumber: 21
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Line,
            {
              type: "monotone",
              dataKey: "focus",
              stroke: "#3b82f6",
              strokeWidth: 2,
              activeDot: { r: 6 },
              name: "Focus",
              dot: { strokeWidth: 2 }
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 562,
              columnNumber: 21
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 521,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 520,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 519,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 518,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 511,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "h-4 w-4 text-yellow-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 582,
              columnNumber: 19
            }, globalThis),
            "Mood"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 581,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 580,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold", children: [
              dailyMetrics.some((d) => d.moodCount > 0) ? (dailyMetrics.reduce((sum, day) => sum + day.mood, 0) / dailyMetrics.reduce((sum, day) => sum + (day.moodCount > 0 ? 1 : 0), 0)).toFixed(1) : "No data",
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-normal text-muted-foreground ml-1", children: "/ 10" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                lineNumber: 592,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 587,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground mt-1", children: [
              dailyMetrics.reduce((sum, day) => sum + day.moodCount, 0),
              " entries in ",
              timeRange
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 594,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 586,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 579,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Battery, { className: "h-4 w-4 text-green-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 603,
              columnNumber: 19
            }, globalThis),
            "Energy"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 602,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 601,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold", children: [
              dailyMetrics.some((d) => d.energyCount > 0) ? (dailyMetrics.reduce((sum, day) => sum + day.energy, 0) / dailyMetrics.reduce((sum, day) => sum + (day.energyCount > 0 ? 1 : 0), 0)).toFixed(1) : "No data",
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-normal text-muted-foreground ml-1", children: "/ 10" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                lineNumber: 613,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 608,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground mt-1", children: [
              dailyMetrics.reduce((sum, day) => sum + day.energyCount, 0),
              " entries in ",
              timeRange
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 615,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 607,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 600,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-4 w-4 text-purple-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 624,
              columnNumber: 19
            }, globalThis),
            "Focus"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 623,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 622,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold", children: [
              dailyMetrics.some((d) => d.focusCount > 0) ? (dailyMetrics.reduce((sum, day) => sum + day.focus, 0) / dailyMetrics.reduce((sum, day) => sum + (day.focusCount > 0 ? 1 : 0), 0)).toFixed(1) : "No data",
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-normal text-muted-foreground ml-1", children: "/ 10" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                lineNumber: 634,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 629,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground mt-1", children: [
              dailyMetrics.reduce((sum, day) => sum + day.focusCount, 0),
              " entries in ",
              timeRange
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 636,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 628,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 621,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 578,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChartArea, { className: "h-4 w-4 text-blue-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 647,
            columnNumber: 17
          }, globalThis),
          "Combined Metrics"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 646,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 645,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-80", children: combinedChartData.length > 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LineChart, { data: combinedChartData, children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CartesianGrid, { strokeDasharray: "3 3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 656,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(XAxis, { dataKey: "name" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 657,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(YAxis, { domain: [0, 10] }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 658,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tooltip, { formatter: (value) => formatTooltipValue(value, "") }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 659,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Legend, {}, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 660,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Line, { type: "monotone", dataKey: "mood", stroke: "#FFB100", activeDot: { r: 8 } }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 661,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Line, { type: "monotone", dataKey: "energy", stroke: "#00C49F" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 662,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Line, { type: "monotone", dataKey: "focus", stroke: "#8884d8" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 663,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Line, { type: "monotone", dataKey: "sleep", stroke: "#82ca9d", strokeDasharray: "5 5" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 664,
            columnNumber: 23
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 655,
          columnNumber: 21
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 654,
          columnNumber: 19
        }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "No data available for the selected period" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 669,
          columnNumber: 21
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 668,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 652,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 651,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 644,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-4 w-4 text-green-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 681,
              columnNumber: 19
            }, globalThis),
            "Holistic Health Radar"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 680,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 679,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-64", children: radarData.some((item) => item.A > 0) ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadarChart, { cx: "50%", cy: "50%", outerRadius: "80%", data: radarData, children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(PolarGrid, {}, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 690,
              columnNumber: 25
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(PolarAngleAxis, { dataKey: "subject" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 691,
              columnNumber: 25
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(PolarRadiusAxis, { angle: 30, domain: [0, 1] }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 692,
              columnNumber: 25
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Radar, { name: "Health Metrics", dataKey: "A", stroke: "#8884d8", fill: "#8884d8", fillOpacity: 0.6 }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 693,
              columnNumber: 25
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 689,
            columnNumber: 23
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 688,
            columnNumber: 21
          }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Not enough data for radar chart" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 698,
            columnNumber: 23
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 697,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 686,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 685,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 678,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Lightbulb$1, { className: "h-4 w-4 text-yellow-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 708,
              columnNumber: 19
            }, globalThis),
            "Correlations and Insights"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 707,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 706,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-64", children: correlationData.some((item) => Math.abs(item.value) > 0.1) ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            BarChart,
            {
              data: correlationData,
              layout: "vertical",
              margin: { top: 5, right: 30, left: 80, bottom: 5 },
              children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CartesianGrid, { strokeDasharray: "3 3" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                  lineNumber: 721,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(XAxis, { type: "number", domain: [-1, 1] }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                  lineNumber: 722,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(YAxis, { dataKey: "name", type: "category", width: 80 }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                  lineNumber: 723,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Tooltip,
                  {
                    formatter: (value) => [`${(Number(value) * 100).toFixed(0)}%`, "Correlation"],
                    labelFormatter: (value, payload) => {
                      const item = payload[0]?.payload;
                      return item ? `${item.name} (${item.actual > 0 ? "Positive" : "Negative"})` : "";
                    }
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                    lineNumber: 724,
                    columnNumber: 25
                  },
                  globalThis
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Bar, { dataKey: "actual", fill: "#8884d8", children: correlationData.map((entry, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cell, { fill: entry.actual >= 0 ? "#4CAF50" : "#F44336" }, `cell-${index}`, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                  lineNumber: 733,
                  columnNumber: 29
                }, globalThis)) }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
                  lineNumber: 731,
                  columnNumber: 25
                }, globalThis)
              ]
            },
            void 0,
            true,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 716,
              columnNumber: 23
            },
            globalThis
          ) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 715,
            columnNumber: 21
          }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Not enough data for correlation analysis" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 740,
            columnNumber: 23
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 739,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 713,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 712,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 705,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 677,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Lightbulb$1, { className: "h-4 w-4 text-yellow-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 752,
            columnNumber: 17
          }, globalThis),
          "Personalized Insights"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 751,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 750,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "space-y-2", children: [
          correlations.physicalActivity > 0.1 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 760,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
              "Physical activity appears to boost your energy levels by approximately ",
              (correlations.physicalActivity * 100).toFixed(0),
              "%."
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 761,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 759,
            columnNumber: 19
          }, globalThis),
          correlations.sleepQuality > 0.1 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 767,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
              "Getting 7+ hours of sleep improves your energy by about ",
              (correlations.sleepQuality * 100).toFixed(0),
              "%."
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 768,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 766,
            columnNumber: 19
          }, globalThis),
          correlations.cravingImpact < -0.1 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TriangleAlert, { className: "h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 774,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
              "Nicotine cravings appear to decrease your mood by approximately ",
              (Math.abs(correlations.cravingImpact) * 100).toFixed(0),
              "%."
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 775,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 773,
            columnNumber: 19
          }, globalThis),
          correlations.moodEnergy > 0.4 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 781,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Your mood and energy levels show a strong positive correlation. Focusing on energy-boosting activities may help improve your mood." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 782,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 780,
            columnNumber: 19
          }, globalThis),
          correlations.moodFocus > 0.4 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 788,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Your mood and focus levels are closely connected. Techniques that improve focus may also benefit your mood." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 789,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 787,
            columnNumber: 19
          }, globalThis),
          !correlationData.some((item) => Math.abs(item.value) > 0.1) && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Info, { className: "h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 795,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Keep tracking your metrics to unlock personalized insights. We need more data to identify patterns in your wellbeing." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
              lineNumber: 796,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
            lineNumber: 794,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 757,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
          lineNumber: 756,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
        lineNumber: 749,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
      lineNumber: 450,
      columnNumber: 9
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/index.tsx",
    lineNumber: 415,
    columnNumber: 5
  }, globalThis);
};

const React = await importShared('react');
const {createContext,useState: useState$1,useContext} = React;
const HolisticHealthContext = createContext(void 0);
const HolisticHealthProvider = ({ children }) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState$1("week");
  const { data: moodLogs, isLoading: moodLoading } = useQuery({
    queryKey: ["mood-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mood_logs").select("*").eq("user_id", session?.user?.id).order("timestamp", { ascending: false }).limit(30);
      if (error)
        throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });
  const { data: energyLogs, isLoading: energyLoading } = useQuery({
    queryKey: ["energy-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("energy_focus_logs").select("*").eq("user_id", session?.user?.id).order("timestamp", { ascending: false }).limit(30);
      if (error)
        throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });
  const { data: focusLogs, isLoading: focusLoading } = useQuery({
    queryKey: ["focus-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("focus_logs").select("*").eq("user_id", session?.user?.id).order("timestamp", { ascending: false }).limit(30);
      if (error)
        throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });
  const dailyMetrics = React.useMemo(() => {
    const metricsByDate = {};
    const daysToShow = timeRange === "week" ? 7 : 30;
    for (let i = 0; i < daysToShow; i++) {
      const date = subDays(/* @__PURE__ */ new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const formattedDate = format(date, "MMM d");
      metricsByDate[dateStr] = {
        date: dateStr,
        formattedDate,
        mood: 0,
        energy: 0,
        focus: 0,
        moodCount: 0,
        energyCount: 0,
        focusCount: 0,
        cravingRelated: 0,
        physicalActivity: 0,
        averageSleep: 0
      };
    }
    moodLogs?.forEach((log) => {
      const date = format(new Date(log.timestamp), "yyyy-MM-dd");
      if (metricsByDate[date]) {
        metricsByDate[date].mood += log.mood_score;
        metricsByDate[date].moodCount += 1;
        if (log.related_to_cravings) {
          metricsByDate[date].cravingRelated += 1;
        }
      }
    });
    energyLogs?.forEach((log) => {
      const date = format(new Date(log.timestamp), "yyyy-MM-dd");
      if (metricsByDate[date]) {
        metricsByDate[date].energy += log.energy_level;
        metricsByDate[date].energyCount += 1;
        if (log.physical_activity) {
          metricsByDate[date].physicalActivity += 1;
        }
        metricsByDate[date].averageSleep += log.sleep_hours;
      }
    });
    focusLogs?.forEach((log) => {
      const date = format(new Date(log.timestamp), "yyyy-MM-dd");
      if (metricsByDate[date]) {
        metricsByDate[date].focus += log.focus_level;
        metricsByDate[date].focusCount += 1;
      }
    });
    return Object.values(metricsByDate).map((daily) => ({
      ...daily,
      mood: daily.moodCount ? daily.mood / daily.moodCount : 0,
      energy: daily.energyCount ? daily.energy / daily.energyCount : 0,
      focus: daily.focusCount ? daily.focus / daily.focusCount : 0,
      averageSleep: daily.energyCount ? daily.averageSleep / daily.energyCount : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [moodLogs, energyLogs, focusLogs, timeRange]);
  const correlations = React.useMemo(() => {
    const completeData = dailyMetrics.filter(
      (day) => day.moodCount > 0 && day.energyCount > 0 && day.focusCount > 0
    );
    if (completeData.length < 3) {
      return {
        moodEnergy: 0,
        moodFocus: 0,
        energyFocus: 0,
        physicalActivity: 0,
        cravingImpact: 0,
        sleepQuality: 0
      };
    }
    const avgMood = completeData.reduce((sum, day) => sum + day.mood, 0) / completeData.length;
    const avgEnergy = completeData.reduce((sum, day) => sum + day.energy, 0) / completeData.length;
    const avgFocus = completeData.reduce((sum, day) => sum + day.focus, 0) / completeData.length;
    let covMoodEnergy = 0, covMoodFocus = 0, covEnergyFocus = 0;
    let varMood = 0, varEnergy = 0, varFocus = 0;
    completeData.forEach((day) => {
      covMoodEnergy += (day.mood - avgMood) * (day.energy - avgEnergy);
      covMoodFocus += (day.mood - avgMood) * (day.focus - avgFocus);
      covEnergyFocus += (day.energy - avgEnergy) * (day.focus - avgFocus);
      varMood += Math.pow(day.mood - avgMood, 2);
      varEnergy += Math.pow(day.energy - avgEnergy, 2);
      varFocus += Math.pow(day.focus - avgFocus, 2);
    });
    const moodEnergy = covMoodEnergy / Math.sqrt(varMood * varEnergy);
    const moodFocus = covMoodFocus / Math.sqrt(varMood * varFocus);
    const energyFocus = covEnergyFocus / Math.sqrt(varEnergy * varFocus);
    const physicalActivityDays = completeData.filter((day) => day.physicalActivity > 0);
    const nonPhysicalActivityDays = completeData.filter((day) => day.physicalActivity === 0);
    const physicalActivity = physicalActivityDays.length && nonPhysicalActivityDays.length ? physicalActivityDays.reduce((sum, day) => sum + day.energy, 0) / physicalActivityDays.length / (nonPhysicalActivityDays.reduce((sum, day) => sum + day.energy, 0) / nonPhysicalActivityDays.length) - 1 : 0;
    const cravingDays = completeData.filter((day) => day.cravingRelated > 0);
    const nonCravingDays = completeData.filter((day) => day.cravingRelated === 0);
    const cravingImpact = cravingDays.length && nonCravingDays.length ? cravingDays.reduce((sum, day) => sum + day.mood, 0) / cravingDays.length / (nonCravingDays.reduce((sum, day) => sum + day.mood, 0) / nonCravingDays.length) - 1 : 0;
    const goodSleepDays = completeData.filter((day) => day.averageSleep >= 7);
    const poorSleepDays = completeData.filter((day) => day.averageSleep > 0 && day.averageSleep < 7);
    const sleepQuality = goodSleepDays.length && poorSleepDays.length ? goodSleepDays.reduce((sum, day) => sum + day.energy, 0) / goodSleepDays.length / (poorSleepDays.reduce((sum, day) => sum + day.energy, 0) / poorSleepDays.length) - 1 : 0;
    return {
      moodEnergy: isNaN(moodEnergy) ? 0 : moodEnergy,
      moodFocus: isNaN(moodFocus) ? 0 : moodFocus,
      energyFocus: isNaN(energyFocus) ? 0 : energyFocus,
      physicalActivity: isNaN(physicalActivity) ? 0 : physicalActivity,
      cravingImpact: isNaN(cravingImpact) ? 0 : cravingImpact,
      sleepQuality: isNaN(sleepQuality) ? 0 : sleepQuality
    };
  }, [dailyMetrics]);
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["mood-logs"] });
    queryClient.invalidateQueries({ queryKey: ["energy-logs"] });
    queryClient.invalidateQueries({ queryKey: ["focus-logs"] });
  };
  const isLoading = moodLoading || energyLoading || focusLoading;
  const value = {
    moodLogs,
    energyLogs,
    focusLogs,
    dailyMetrics,
    correlations,
    isLoading,
    timeRange,
    setTimeRange,
    refreshData
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(HolisticHealthContext.Provider, { value, children }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/health/HolisticDashboard/HolisticHealthContext.tsx",
    lineNumber: 311,
    columnNumber: 5
  }, globalThis);
};

const {useEffect,useState} = await importShared('react');

const {useNavigate} = await importShared('react-router-dom');
const MoodHappy = (props) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("circle", { cx: "12", cy: "12", r: "10" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 72,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M8 14s1.5 2 4 2 4-2 4-2" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 73,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("line", { x1: "9", y1: "9", x2: "9.01", y2: "9" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 74,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("line", { x1: "15", y1: "9", x2: "15.01", y2: "9" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 75,
        columnNumber: 5
      }, globalThis)
    ]
  },
  void 0,
  true,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
    lineNumber: 60,
    columnNumber: 3
  },
  globalThis
);
const MoodSad = (props) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("circle", { cx: "12", cy: "12", r: "10" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 92,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M16 16s-1.5-2-4-2-4 2-4 2" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 93,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("line", { x1: "9", y1: "9", x2: "9.01", y2: "9" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 94,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("line", { x1: "15", y1: "9", x2: "15.01", y2: "9" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 95,
        columnNumber: 5
      }, globalThis)
    ]
  },
  void 0,
  true,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
    lineNumber: 80,
    columnNumber: 3
  },
  globalThis
);
const Lightbulb = (props) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M9 18h6" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 112,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M10 22h4" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 113,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 2v4" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 114,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M4.93 10.93l2.83 2.83" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 115,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M16.24 13.76l2.83 2.83" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 116,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M19.07 10.93l-2.83 2.83" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 117,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M4.93 13.76l2.83-2.83" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 118,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 6a6 6 0 0 1 5 9.33c-.83 1.33-3 2.67-3 3.67v1" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 119,
        columnNumber: 5
      }, globalThis)
    ]
  },
  void 0,
  true,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
    lineNumber: 100,
    columnNumber: 3
  },
  globalThis
);
const Gauge = (props) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 15l3.5-3.5" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 136,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M20.3 18c.4-1 .7-2.2.7-3.4C21 9.8 17 6 12 6s-9 3.8-9 8.6c0 1.2.3 2.4.7 3.4" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 137,
        columnNumber: 5
      }, globalThis)
    ]
  },
  void 0,
  true,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
    lineNumber: 124,
    columnNumber: 3
  },
  globalThis
);
const Dashboard = ({ session }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [quitDate, setQuitDate] = useState(null);
  const [quitDateObject, setQuitDateObject] = useState(null);
  const [daysSinceQuit, setDaysSinceQuit] = useState(0);
  const [hoursSinceQuit, setHoursSinceQuit] = useState(0);
  const [cigarettesAvoided, setCigarettesAvoided] = useState(0);
  const [dailyAvgCigarettes, setDailyAvgCigarettes] = useState(0);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(20);
  const [pricePerPack, setPricePerPack] = useState(0);
  const [healthImprovement, setHealthImprovement] = useState(0);
  const [upcomingMilestones, setUpcomingMilestones] = useState([]);
  const [savingsDetail, setSavingsDetail] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    total: 0
  });
  const [carbonReduction, setCarbonReduction] = useState(0);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [smokeFreeStreak, setSmokeFreeStreak] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [healthScore, setHealthScore] = useState(0);
  const [holisticMetrics, setHolisticMetrics] = useState({
    mood: 50,
    energy: 50,
    focus: 50,
    fatigue: 50
  });
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id)
        return;
      try {
        const today = /* @__PURE__ */ new Date();
        const oneYearAgo = /* @__PURE__ */ new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const startDate = oneYearAgo.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];
        const response = await getUserProgress(
          session.user.id,
          startDate,
          endDate,
          session
        );
        if (response) {
          if (response.userProfile) {
            const {
              quit_date,
              daily_cigarettes,
              cigarettes_per_pack,
              price_per_pack
            } = response.userProfile;
            setQuitDate(quit_date);
            setDailyAvgCigarettes(daily_cigarettes || 0);
            setCigarettesPerPack(cigarettes_per_pack || 20);
            setPricePerPack(price_per_pack || 0);
          }
          setSmokeFreeStreak(response.smokeFreeStreak || 0);
          setTotalSavings(response.totalSavings || 0);
          setHealthScore(response.healthScore || 0);
        }
        const healthImprovements = await getHealthImprovements(
          session.user.id,
          session,
          quitDate || void 0
        );
        if (healthImprovements && healthImprovements.length > 0) {
          setUpcomingMilestones(healthImprovements);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadUserData();
  }, [session]);
  useEffect(() => {
    if (quitDate) {
      try {
        const parsedDate = parseISO(quitDate);
        if (isNaN(parsedDate.getTime())) {
          console.error("Invalid date format:", quitDate);
          setQuitDateObject(/* @__PURE__ */ new Date());
        } else {
          setQuitDateObject(parsedDate);
        }
      } catch (error) {
        console.error("Error parsing quit date:", error);
        setQuitDateObject(/* @__PURE__ */ new Date());
      }
    } else {
      setQuitDateObject(null);
    }
  }, [quitDate]);
  useEffect(() => {
    if (quitDateObject) {
      const days = differenceInDays(/* @__PURE__ */ new Date(), quitDateObject);
      setDaysSinceQuit(Math.max(0, days));
      if (days < 1) {
        const hours = differenceInHours(/* @__PURE__ */ new Date(), quitDateObject);
        setHoursSinceQuit(Math.max(0, hours));
      }
      const avoided = calculateCigarettesAvoided(quitDateObject, dailyAvgCigarettes);
      setCigarettesAvoided(avoided);
      const improvement = calculateHealthImprovement(quitDateObject);
      setHealthImprovement(Math.round(improvement));
      const savings = calculateSavings(quitDateObject, pricePerPack, dailyAvgCigarettes / cigarettesPerPack);
      setSavingsDetail(savings);
      const co2Reduced = calculateCarbonReduction(avoided);
      setCarbonReduction(co2Reduced);
      const metrics = [
        {
          id: "heartRate",
          title: "Heart Rate",
          value: Math.min(days, 3) / 3 * 100,
          unit: "bpm",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5 text-red-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 303,
            columnNumber: 17
          }, globalThis),
          description: "Your heart rate and blood pressure drop to normal levels.",
          improvement: Math.min(days, 3) / 3 * 100
        },
        {
          id: "oxygenLevels",
          title: "Oxygen Levels",
          value: Math.min(days, 14) / 14 * 100,
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Wind, { className: "h-5 w-5 text-blue-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 312,
            columnNumber: 17
          }, globalThis),
          description: "Oxygen levels return to normal and breathing becomes easier.",
          improvement: Math.min(days, 14) / 14 * 100
        },
        {
          id: "circulation",
          title: "Circulation",
          value: Math.min(days, 30) / 30 * 100,
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-5 w-5 text-purple-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 321,
            columnNumber: 17
          }, globalThis),
          description: "Your circulation has improved, making physical activity easier.",
          improvement: Math.min(days, 30) / 30 * 100
        },
        {
          id: "lungFunction",
          title: "Lung Function",
          value: Math.min(days, 90) / 90 * 100,
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Wind, { className: "h-5 w-5 text-teal-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 330,
            columnNumber: 17
          }, globalThis),
          description: "Your lung function is improving, reducing coughing and shortness of breath.",
          improvement: Math.min(days, 90) / 90 * 100
        },
        {
          id: "taste",
          title: "Taste & Smell",
          value: Math.min(days, 10) / 10 * 100,
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Droplet, { className: "h-5 w-5 text-emerald-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 339,
            columnNumber: 17
          }, globalThis),
          description: "Your senses of taste and smell are getting sharper.",
          improvement: Math.min(days, 10) / 10 * 100
        },
        {
          id: "cognition",
          title: "Brain Function",
          value: Math.min(days, 14) / 14 * 100,
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-5 w-5 text-amber-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 348,
            columnNumber: 17
          }, globalThis),
          description: "Improved blood flow to the brain enhances cognitive function.",
          improvement: Math.min(days, 14) / 14 * 100
        }
      ];
      setHealthMetrics(metrics);
      if (upcomingMilestones.length > 0) {
        const processedMilestones = upcomingMilestones.map((milestone) => {
          return {
            ...milestone,
            daysRequired: milestone.days_required,
            achieved: days >= milestone.days_required
          };
        });
        setUpcomingMilestones(processedMilestones);
      }
      const calculateHolisticImprovement = (baseDays, maxDays, minValue, maxValue) => {
        if (days < baseDays) {
          return minValue + (maxValue - minValue) * 0.2 * (days / baseDays);
        } else if (days < maxDays) {
          const progress = (days - baseDays) / (maxDays - baseDays);
          return minValue + (maxValue - minValue) * (0.2 + 0.8 * progress);
        } else {
          return maxValue;
        }
      };
      setHolisticMetrics({
        // Mood improvement: starts at day 3, reaches 85% by day 30
        mood: calculateHolisticImprovement(3, 30, 50, 85),
        // Energy improvement: starts at day 2, reaches 90% by day 21
        energy: calculateHolisticImprovement(2, 21, 50, 90),
        // Focus improvement: starts at day 5, reaches 80% by day 28
        focus: calculateHolisticImprovement(5, 28, 50, 80),
        // Fatigue resistance: starts at day 7, reaches 75% by day 42
        fatigue: calculateHolisticImprovement(7, 42, 50, 75)
      });
    }
  }, [quitDateObject, dailyAvgCigarettes, cigarettesPerPack, pricePerPack, upcomingMilestones]);
  useEffect(() => {
    if (quitDate && daysSinceQuit > 0) {
      const newHealthMetrics = [
        {
          id: "lungFunction",
          title: "Lung Function",
          value: calculateMetricValue(daysSinceQuit, 10, 90, 30),
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Wind, { className: "h-5 w-5 text-blue-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 416,
            columnNumber: 17
          }, globalThis),
          description: "Your lungs are getting stronger every day",
          improvement: Math.min(Math.round(daysSinceQuit / 30 * 100), 90)
        },
        {
          id: "bloodCirculation",
          title: "Blood Circulation",
          value: calculateMetricValue(daysSinceQuit, 5, 90, 14),
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5 text-red-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 425,
            columnNumber: 17
          }, globalThis),
          description: "Your circulation is improving since quitting",
          improvement: Math.min(Math.round(daysSinceQuit / 14 * 100), 95)
        },
        {
          id: "oxygenLevels",
          title: "Oxygen Levels",
          value: calculateMetricValue(daysSinceQuit, 20, 99, 7),
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Droplet, { className: "h-5 w-5 text-cyan-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 434,
            columnNumber: 17
          }, globalThis),
          description: "Your blood oxygen levels are increasing",
          improvement: Math.min(Math.round(daysSinceQuit / 7 * 100), 98)
        },
        {
          id: "healingProgress",
          title: "Recovery Progress",
          value: healthScore,
          unit: "%",
          icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-5 w-5 text-green-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 443,
            columnNumber: 17
          }, globalThis),
          description: "Overall healing progress based on your health data",
          improvement: Math.min(healthScore, 100)
        }
      ];
      setHealthMetrics(newHealthMetrics);
      const avgImprovement = newHealthMetrics.reduce((sum, metric) => sum + metric.improvement, 0) / newHealthMetrics.length;
      setHealthImprovement(Math.round(avgImprovement));
    }
  }, [quitDate, daysSinceQuit, healthScore]);
  const calculateMetricValue = (days, minValue, maxValue, daysToMax) => {
    const progress = Math.min(days / daysToMax, 1);
    return Math.round(minValue + progress * (maxValue - minValue));
  };
  const iconFromString = (iconName) => {
    switch (iconName.toLowerCase()) {
      case "heart":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 472,
          columnNumber: 16
        }, globalThis);
      case "lungs":
      case "wind":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Wind, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 475,
          columnNumber: 16
        }, globalThis);
      case "brain":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 477,
          columnNumber: 16
        }, globalThis);
      case "leaf":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 479,
          columnNumber: 16
        }, globalThis);
      case "zap":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 481,
          columnNumber: 16
        }, globalThis);
      case "droplet":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Droplet, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 483,
          columnNumber: 16
        }, globalThis);
      case "smile":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 485,
          columnNumber: 16
        }, globalThis);
      case "clock":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 487,
          columnNumber: 16
        }, globalThis);
      default:
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 489,
          columnNumber: 16
        }, globalThis);
    }
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10
      }
    }
  };
  const renderHolisticSection = () => {
    if (!quitDateObject) {
      return null;
    }
    const getMoodIcon = () => {
      if (holisticMetrics.mood >= 75)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(MoodHappy, { className: "h-5 w-5 text-purple-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 524,
          columnNumber: 46
        }, globalThis);
      if (holisticMetrics.mood >= 60)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "h-5 w-5 text-emerald-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 525,
          columnNumber: 46
        }, globalThis);
      return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(MoodSad, { className: "h-5 w-5 text-yellow-500" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 526,
        columnNumber: 14
      }, globalThis);
    };
    const getEnergyIcon = () => {
      if (holisticMetrics.energy >= 75)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5 text-amber-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 530,
          columnNumber: 48
        }, globalThis);
      if (holisticMetrics.energy >= 60)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BatteryMedium, { className: "h-5 w-5 text-yellow-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 531,
          columnNumber: 48
        }, globalThis);
      return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Coffee, { className: "h-5 w-5 text-orange-500" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 532,
        columnNumber: 14
      }, globalThis);
    };
    const getFocusIcon = () => {
      if (holisticMetrics.focus >= 75)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BrainCircuit, { className: "h-5 w-5 text-indigo-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 536,
          columnNumber: 47
        }, globalThis);
      if (holisticMetrics.focus >= 60)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Lightbulb, { className: "h-5 w-5 text-blue-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 537,
          columnNumber: 47
        }, globalThis);
      return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-5 w-5 text-purple-500" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 538,
        columnNumber: 14
      }, globalThis);
    };
    const getFatigueIcon = () => {
      if (holisticMetrics.fatigue < 30)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-5 w-5 text-green-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 542,
          columnNumber: 48
        }, globalThis);
      if (holisticMetrics.fatigue < 60)
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Gauge, { className: "h-5 w-5 text-yellow-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 543,
          columnNumber: 48
        }, globalThis);
      return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TriangleAlert, { className: "h-5 w-5 text-red-500" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 544,
        columnNumber: 14
      }, globalThis);
    };
    const correlations = {
      moodEnergy: 75,
      moodFocus: 68,
      energyFocus: 82,
      energyFatigue: 70,
      focusFatigue: 65
    };
    const getCorrelationColor = (value) => {
      if (value >= 80)
        return "text-green-500 bg-green-500";
      if (value >= 60)
        return "text-emerald-500 bg-emerald-500";
      if (value >= 40)
        return "text-yellow-500 bg-yellow-500";
      return "text-red-500 bg-red-500";
    };
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SectionCard, { title: "Holistic Well-being Impact", icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5 text-red-500" }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
      lineNumber: 565,
      columnNumber: 61
    }, globalThis), children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Quitting smoking doesn't just improve your physical health—it enhances your overall well-being. Here's how your quit journey is impacting other aspects of your health:" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 567,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 rounded-lg bg-card/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2 mb-2", children: [
            getMoodIcon(),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium", children: "Mood Stability" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 577,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 575,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: holisticMetrics.mood, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 580,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 579,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground", children: holisticMetrics.mood >= 75 ? "Your brain chemistry is rebalancing, leading to improved mood stability." : holisticMetrics.mood >= 60 ? "You're experiencing fewer mood swings as your body adjusts." : "Mood improvements typically begin after 1-2 weeks as brain chemistry rebalances." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 582,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 574,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 rounded-lg bg-card/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2 mb-2", children: [
            getEnergyIcon(),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium", children: "Energy Levels" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 595,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 593,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: holisticMetrics.energy, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 598,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 597,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground", children: holisticMetrics.energy >= 75 ? "Your improved circulation and oxygen levels are giving you noticeably more energy." : holisticMetrics.energy >= 60 ? "Your energy levels are improving as your circulation recovers." : "Energy improvements begin within days as blood oxygen levels normalize." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 600,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 592,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 rounded-lg bg-card/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2 mb-2", children: [
            getFocusIcon(),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium", children: "Focus & Concentration" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 613,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 611,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: holisticMetrics.focus, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 616,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 615,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground", children: holisticMetrics.focus >= 75 ? "Your brain is receiving optimal oxygen, significantly improving your concentration." : holisticMetrics.focus >= 60 ? "Your focus is improving as carbon monoxide levels in your blood decrease." : "Cognitive function improves gradually as blood oxygen levels normalize." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 618,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 610,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 rounded-lg bg-card/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2 mb-2", children: [
            getFatigueIcon(),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium", children: "Fatigue Resistance" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 631,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 629,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: holisticMetrics.fatigue, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 634,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 633,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground", children: holisticMetrics.fatigue >= 75 ? "Your improved lung function and circulation are significantly reducing fatigue." : holisticMetrics.fatigue >= 60 ? "You're developing greater stamina as your body recovers." : "Physical endurance improves as your respiratory system heals." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 636,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 628,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 572,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-6 p-4 bg-card/50 rounded-lg", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium mb-3", children: "Metric Correlations" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 648,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground mb-4", children: "Your health metrics are interconnected. See how improvements in one area affect others:" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 649,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex gap-2 items-center w-32", children: [
              getMoodIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Mood" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 657,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "+" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 658,
                columnNumber: 19
              }, globalThis),
              getEnergyIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Energy" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 660,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 655,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-grow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Progress,
              {
                value: correlations.moodEnergy,
                className: "h-2",
                indicatorClassName: getCorrelationColor(correlations.moodEnergy)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 663,
                columnNumber: 19
              },
              globalThis
            ) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 662,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: `text-xs font-medium ${getCorrelationColor(correlations.moodEnergy)}`, children: [
              Math.round(correlations.moodEnergy),
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 669,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 654,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex gap-2 items-center w-32", children: [
              getMoodIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Mood" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 677,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "+" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 678,
                columnNumber: 19
              }, globalThis),
              getFocusIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Focus" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 680,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 675,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-grow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Progress,
              {
                value: correlations.moodFocus,
                className: "h-2",
                indicatorClassName: getCorrelationColor(correlations.moodFocus)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 683,
                columnNumber: 19
              },
              globalThis
            ) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 682,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: `text-xs font-medium ${getCorrelationColor(correlations.moodFocus)}`, children: [
              Math.round(correlations.moodFocus),
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 689,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 674,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex gap-2 items-center w-32", children: [
              getEnergyIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Energy" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 697,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "+" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 698,
                columnNumber: 19
              }, globalThis),
              getFatigueIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Fatigue" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 700,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 695,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-grow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Progress,
              {
                value: correlations.energyFatigue,
                className: "h-2",
                indicatorClassName: getCorrelationColor(correlations.energyFatigue)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 703,
                columnNumber: 19
              },
              globalThis
            ) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 702,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: `text-xs font-medium ${getCorrelationColor(correlations.energyFatigue)}`, children: [
              Math.round(correlations.energyFatigue),
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 709,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 694,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex gap-2 items-center w-32", children: [
              getFocusIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Focus" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 717,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "+" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 718,
                columnNumber: 19
              }, globalThis),
              getFatigueIcon(),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs", children: "Fatigue" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 720,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 715,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-grow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Progress,
              {
                value: correlations.focusFatigue,
                className: "h-2",
                indicatorClassName: getCorrelationColor(correlations.focusFatigue)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 723,
                columnNumber: 19
              },
              globalThis
            ) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 722,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: `text-xs font-medium ${getCorrelationColor(correlations.focusFatigue)}`, children: [
              Math.round(correlations.focusFatigue),
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 729,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 714,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 653,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "Higher correlation percentages indicate these metrics are improving together, showing the holistic impact of quitting smoking on your overall well-being." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 736,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 735,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 647,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "w-full mt-2",
          onClick: () => navigate("/health-tracking"),
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-4 w-4 mr-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 749,
              columnNumber: 13
            }, globalThis),
            "Track Your Holistic Health"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 743,
          columnNumber: 11
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
      lineNumber: 566,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
      lineNumber: 565,
      columnNumber: 7
    }, globalThis);
  };
  const handleShareProgress = async (platform) => {
    if (!session?.user?.id) {
      Jt.error("You must be logged in to share your progress");
      return;
    }
    setIsSharing(true);
    try {
      const defaultMessage = `I've been smoke-free for ${daysSinceQuit} days! I've avoided ${cigarettesAvoided} cigarettes and saved $${savingsDetail.total.toFixed(2)}. #MissionFresh #SmokeFree`;
      const message = shareMessage || defaultMessage;
      const response = await shareProgressToSocial(
        session.user.id,
        "latest",
        platform,
        message,
        session
      );
      if (response.success) {
        Jt.success(`Successfully shared to ${platform}!`);
        setIsSharing(false);
        setShareMessage("");
      } else {
        Jt.error(`Failed to share: ${response.error}`);
        setIsSharing(false);
      }
    } catch (error) {
      console.error("Error sharing progress:", error);
      Jt.error("Error sharing progress");
      setIsSharing(false);
    }
  };
  const renderSocialSharingSection = () => {
    if (!quitDateObject || daysSinceQuit < 1) {
      return null;
    }
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      SectionCard,
      {
        title: "Share Your Progress",
        description: "Let your friends know about your journey",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 803,
          columnNumber: 15
        }, globalThis),
        children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 bg-card/50 rounded-lg", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium mb-2", children: "Share Your Achievement" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 807,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: [
              "You've been smoke-free for ",
              daysSinceQuit,
              " days! Share this achievement with your friends and family."
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 808,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              "textarea",
              {
                className: "mt-3 w-full p-2 text-sm border rounded-md dark:bg-gray-800",
                rows: 3,
                placeholder: "Add a custom message (optional)",
                value: shareMessage,
                onChange: (e) => setShareMessage(e.target.value)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 812,
                columnNumber: 13
              },
              globalThis
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-2 mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "flex items-center gap-2",
                  onClick: () => handleShareProgress("twitter"),
                  disabled: isSharing,
                  children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("svg", { className: "h-4 w-4", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                      lineNumber: 829,
                      columnNumber: 19
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                      lineNumber: 828,
                      columnNumber: 17
                    }, globalThis),
                    "Twitter"
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 821,
                  columnNumber: 15
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "flex items-center gap-2",
                  onClick: () => handleShareProgress("facebook"),
                  disabled: isSharing,
                  children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("svg", { className: "h-4 w-4", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                      lineNumber: 842,
                      columnNumber: 19
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                      lineNumber: 841,
                      columnNumber: 17
                    }, globalThis),
                    "Facebook"
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 834,
                  columnNumber: 15
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "flex items-center gap-2",
                  onClick: () => handleShareProgress("instagram"),
                  disabled: isSharing,
                  children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("svg", { className: "h-4 w-4", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                      lineNumber: 855,
                      columnNumber: 19
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                      lineNumber: 854,
                      columnNumber: 17
                    }, globalThis),
                    "Instagram"
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 847,
                  columnNumber: 15
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 820,
              columnNumber: 13
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 806,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "Note: Sharing your progress can help motivate others and hold yourself accountable. Your personal health data will not be shared, only the metrics you choose." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 863,
            columnNumber: 13
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 862,
            columnNumber: 11
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 805,
          columnNumber: 9
        }, globalThis)
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 800,
        columnNumber: 7
      },
      globalThis
    );
  };
  if (!session?.user) {
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-2xl font-bold mb-4", children: "Please Log In" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 877,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mb-4", children: "You need to be logged in to view your dashboard." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 878,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: () => navigate("/login"), children: "Log In" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
        lineNumber: 881,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
      lineNumber: 876,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
      lineNumber: 875,
      columnNumber: 7
    }, globalThis);
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container max-w-7xl mx-auto p-4 space-y-8 pb-20", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    motion.div,
    {
      className: "space-y-6",
      variants: containerVariants,
      initial: "hidden",
      animate: "visible",
      children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold", children: "Your Dashboard" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 898,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500 mt-2", children: daysSinceQuit > 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
            "You've been smoke-free for ",
            daysSinceQuit,
            " days. Keep going!"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 901,
            columnNumber: 15
          }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: "You're just getting started! Your fresh journey begins today." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 903,
            columnNumber: 15
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 899,
            columnNumber: 11
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 897,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SmokeFreeCounter, { quitDate: quitDateObject }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 911,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            SavingsCalculator,
            {
              quitDate: quitDateObject,
              costPerPack: pricePerPack,
              packsPerDay: dailyAvgCigarettes / cigarettesPerPack,
              savings: savingsDetail
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 913,
              columnNumber: 13
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 910,
          columnNumber: 11
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 909,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          SectionCard,
          {
            title: "Health Improvements",
            description: "Track how your body is healing since quitting",
            icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 927,
              columnNumber: 19
            }, globalThis),
            footer: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Button,
              {
                variant: "outline",
                onClick: () => navigate("/health-timeline"),
                className: "w-full mt-2",
                children: "View Full Health Timeline"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 929,
                columnNumber: 15
              },
              globalThis
            ),
            children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4", children: upcomingMilestones.length > 0 ? upcomingMilestones.map((milestone) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              HealthImprovementCard,
              {
                title: milestone.title,
                description: milestone.description,
                daysRequired: milestone.daysRequired || 0,
                daysPassed: daysSinceQuit,
                icon: typeof milestone.icon === "string" ? iconFromString(milestone.icon) : milestone.icon,
                achieved: milestone.achieved,
                onClick: () => navigate("/health-timeline")
              },
              milestone.id,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 941,
                columnNumber: 19
              },
              globalThis
            )) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "col-span-3 text-center p-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500", children: "Health milestones will appear as you progress." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 954,
              columnNumber: 19
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 953,
              columnNumber: 17
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 938,
              columnNumber: 13
            }, globalThis)
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 924,
            columnNumber: 11
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 923,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          HealthMetricsSection,
          {
            healthImprovement,
            healthMetrics,
            onViewAllClick: () => navigate("/health-timeline")
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 963,
            columnNumber: 11
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 962,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          EnvironmentalImpactSection,
          {
            carbonReduction,
            cigarettesAvoided
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 972,
            columnNumber: 11
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 971,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          SectionCard,
          {
            title: "Your Progress",
            description: "Track your journey and see your achievements",
            icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Medal, { className: "h-5 w-5" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 983,
              columnNumber: 19
            }, globalThis),
            children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-medium", children: "Overall Health Recovery" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 987,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-medium", children: [
                  healthImprovement,
                  "%"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 988,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 986,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Progress,
                {
                  value: healthImprovement,
                  className: "h-2",
                  indicatorClassName: healthImprovement > 75 ? "bg-green-500" : healthImprovement > 50 ? "bg-blue-500" : healthImprovement > 25 ? "bg-amber-500" : "bg-red-500"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 990,
                  columnNumber: 15
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 mt-6", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center shadow-sm", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-6 w-6 mx-auto mb-2 text-blue-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1002,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xl font-semibold", children: daysSinceQuit > 0 ? daysSinceQuit : `${hoursSinceQuit}h` }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1003,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-gray-600", children: daysSinceQuit > 0 ? "Days Smoke-Free" : "Hours Smoke-Free" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1006,
                    columnNumber: 19
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1001,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center shadow-sm", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cigarette, { className: "h-6 w-6 mx-auto mb-2 text-red-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1012,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xl font-semibold", children: cigarettesAvoided }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1013,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-gray-600", children: "Cigarettes Avoided" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1014,
                    columnNumber: 19
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1011,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center shadow-sm", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-6 w-6 mx-auto mb-2 text-purple-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1018,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xl font-semibold", children: [
                    healthImprovement,
                    "%"
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1019,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-gray-600", children: "Health Improved" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1020,
                    columnNumber: 19
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1017,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1e3,
                columnNumber: 15
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 985,
              columnNumber: 13
            }, globalThis)
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 980,
            columnNumber: 11
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 979,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              className: "h-full",
              onClick: () => navigate("/nrt-directory"),
              children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center p-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5 mb-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1036,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "NRT Products" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1037,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1035,
                columnNumber: 15
              }, globalThis)
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 1030,
              columnNumber: 13
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              className: "h-full",
              onClick: () => navigate("/community"),
              children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center p-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-5 w-5 mb-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1047,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Community" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1048,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1046,
                columnNumber: 15
              }, globalThis)
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 1041,
              columnNumber: 13
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              className: "h-full",
              onClick: () => navigate("/trigger-analysis"),
              children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center p-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cigarette, { className: "h-5 w-5 mb-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1058,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Trigger Analysis" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1059,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1057,
                columnNumber: 15
              }, globalThis)
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 1052,
              columnNumber: 13
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              className: "h-full",
              onClick: () => navigate("/step-rewards"),
              children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center p-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Medal, { className: "h-5 w-5 mb-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1069,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Step Rewards" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1070,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1068,
                columnNumber: 15
              }, globalThis)
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 1063,
              columnNumber: 13
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 1029,
          columnNumber: 11
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 1028,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(HolisticHealthProvider, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          HolisticDashboard,
          {
            session,
            quitDate: userData?.quit_date,
            className: "mb-6"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 1078,
            columnNumber: 11
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 1077,
          columnNumber: 9
        }, globalThis),
        renderHolisticSection(),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: renderSocialSharingSection() }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 1089,
          columnNumber: 9
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          SectionCard,
          {
            title: "Holistic Well-being Dashboard",
            description: "Discover how quitting affects your mood, energy, and focus",
            icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChartNoAxesColumnIncreasing, { className: "h-5 w-5 text-indigo-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 1098,
              columnNumber: 19
            }, globalThis),
            footer: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  onClick: () => navigate("/health/dashboard"),
                  className: "w-full",
                  children: "Open Full Dashboard"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1101,
                  columnNumber: 17
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  variant: "outline",
                  onClick: () => navigate("/health/mood"),
                  className: "w-full",
                  children: "Track Your Mood"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1107,
                  columnNumber: 17
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 1100,
              columnNumber: 15
            }, globalThis),
            children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-lg", children: "Holistic Health Overview" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1119,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChartLine, { className: "h-5 w-5 text-indigo-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1120,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1118,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground mb-1", children: "Mood" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1125,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mb-2", children: holisticMetrics.mood >= 75 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(MoodHappy, { className: "h-5 w-5 text-purple-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1128,
                    columnNumber: 23
                  }, globalThis) : holisticMetrics.mood >= 60 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "h-5 w-5 text-emerald-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1130,
                    columnNumber: 23
                  }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(MoodSad, { className: "h-5 w-5 text-yellow-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1132,
                    columnNumber: 23
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1126,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: holisticMetrics.mood, className: "h-2" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1135,
                    columnNumber: 19
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1124,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground mb-1", children: "Energy" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1139,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mb-2", children: holisticMetrics.energy >= 75 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5 text-amber-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1142,
                    columnNumber: 23
                  }, globalThis) : holisticMetrics.energy >= 60 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BatteryMedium, { className: "h-5 w-5 text-yellow-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1144,
                    columnNumber: 23
                  }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Coffee, { className: "h-5 w-5 text-orange-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1146,
                    columnNumber: 23
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1140,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: holisticMetrics.energy, className: "h-2" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1149,
                    columnNumber: 19
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1138,
                  columnNumber: 17
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground mb-1", children: "Focus" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1153,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mb-2", children: holisticMetrics.focus >= 75 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BrainCircuit, { className: "h-5 w-5 text-indigo-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1156,
                    columnNumber: 23
                  }, globalThis) : holisticMetrics.focus >= 60 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Lightbulb, { className: "h-5 w-5 text-blue-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1158,
                    columnNumber: 23
                  }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-5 w-5 text-purple-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1160,
                    columnNumber: 23
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1154,
                    columnNumber: 19
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: holisticMetrics.focus, className: "h-2" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                    lineNumber: 1163,
                    columnNumber: 19
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                  lineNumber: 1152,
                  columnNumber: 17
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1123,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xs text-muted-foreground mt-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "Discover detailed insights, correlations, and personalized recommendations for improving your overall well-being in our comprehensive holistic dashboard." }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1168,
                columnNumber: 17
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
                lineNumber: 1167,
                columnNumber: 15
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
              lineNumber: 1117,
              columnNumber: 13
            }, globalThis)
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
            lineNumber: 1095,
            columnNumber: 11
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
          lineNumber: 1094,
          columnNumber: 9
        }, globalThis)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
      lineNumber: 891,
      columnNumber: 7
    },
    globalThis
  ) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Dashboard.tsx",
    lineNumber: 890,
    columnNumber: 5
  }, globalThis);
};

export { Brain as B, ChartLine as C, Dashboard, Info as I, Medal as M, Query as Q, Removable as R, Subscribable as S, Wind as W, matchMutation as a, noop$2 as b, createRetryer as c, addToStart as d, Dashboard as default, ensureQueryFn as e, addToEnd as f, focusManager as g, hashQueryKeyByOptions as h, functionalUpdate as i, hashKey as j, createClient as k, ChartNoAxesColumnIncreasing as l, matchQuery as m, notifyManager as n, onlineManager as o, partialMatchKey as p, QueryClientProvider as q, resolveStaleTime as r, skipToken as s };
