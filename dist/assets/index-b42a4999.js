import { importShared } from './__federation_fn_import-078a81cf.js';
import { c as createLucideIcon, j as jsxDevRuntimeExports, C as Card, d as CardHeader, e as CardTitle, q as CardDescription, f as CardContent, B as Button, X, aw as Te, s as Check, T as Tabs, m as TabsList, n as TabsTrigger, o as TabsContent, S as Select, h as SelectTrigger, i as SelectValue, k as SelectContent, l as SelectItem, J as Jt, p as CardFooter, z as motion, y as ChevronDown, L as Label, I as Input, G as ScrollArea, a as cn, ax as Slot, r as Slider } from './proxy-0fb2bf4b.js';
import { S as Subscribable, h as hashQueryKeyByOptions, Q as Query, n as notifyManager, m as matchQuery, R as Removable, c as createRetryer, a as matchMutation, b as noop, e as ensureQueryFn, d as addToStart, f as addToEnd, g as focusManager, o as onlineManager, r as resolveStaleTime, i as functionalUpdate, j as hashKey, p as partialMatchKey, s as skipToken, C as ChartLine, I as Info, k as createClient, B as Brain, W as Wind$1, l as ChartNoAxesColumnIncreasing, M as Medal, Dashboard, q as QueryClientProvider } from './__federation_expose_Dashboard-567c6b53.js';
import { B as BrainCircuit, C as CalendarDays, A as AuthContext, c as AuthProvider } from './RadarChart-e373fe62.js';
import { C as CircleAlert } from './PieChart-340bd4ec.js';
import { R as RefreshCw, A as ArrowRight, U as Users, a as AnimatePresence, P as Plus, ConsumptionLogger, T as TriggerAnalysis } from './__federation_expose_ConsumptionLogger-0684caaa.js';
import { P as Progress, i as Alert, j as AlertTitle, k as AlertDescription, C as Checkbox, A as Avatar, b as AvatarFallback } from './smoke-free-counter-a4ff4a5c.js';
import { B as Badge } from './badge-8ee49acb.js';
import { L as Leaf } from './leaf-0a2c50fb.js';
import { C as Cigarette } from './cigarette-e53f938f.js';
import { S as Snowflake, B as Book, L as Lock, GuidesHub } from './__federation_expose_GuidesHub-82f8b7c9.js';
import { T as ThumbsUp } from './thumbs-up-21e834e3.js';
import { Z as Zap } from './zap-7944e79d.js';
import { S as Smile } from './smile-ab1dd02f.js';
import { C as Coffee } from './coffee-a68f3c7d.js';
import { H as Heart } from './heart-3d8ce19b.js';
import { C as Clock } from './clock-5c9b77ac.js';
import { C as Calendar } from './calendar-b87af6de.js';
import { U as Utensils } from './utensils-0f99a462.js';
import { C as ChevronLeft, S as SocialShareDialog, s as simulateDeepLink, Progress as Progress$1, c as checkForStoredDeepLink, r as registerDeepLinkHandler, i as initializeMobileIntegration } from './__federation_expose_Progress-990a2dda.js';
import { T as TriangleAlert, A as Activity } from './BarChart-c126de38.js';
import { E as ExternalLink, T as Truck, A as ArrowLeft, NRTDirectory } from './__federation_expose_NRTDirectory-f0fb7c5c.js';
import { S as ShoppingBag, a as Star, F as Filter } from './star-18d7b278.js';
import { k as supabaseRestCall, l as getNicotineProducts } from './missionFreshApiClient-4a1b4bf0.js';
import { s as supabase$1, g as getCurrentSession } from './supabase-client-9c0d55f4.js';
import { AlternativeProducts } from './__federation_expose_AlternativeProducts-0a034389.js';
import { WebTools } from './__federation_expose_WebTools-3fa90134.js';
import { Community } from './__federation_expose_Community-8b5b454c.js';
import { Settings } from './__federation_expose_Settings-0bf416a2.js';
import { S as Search } from './search-7550beea.js';

// src/queryCache.ts
var QueryCache = class extends Subscribable {
  constructor(config = {}) {
    super();
    this.config = config;
    this.#queries = /* @__PURE__ */ new Map();
  }
  #queries;
  build(client, options, state) {
    const queryKey = options.queryKey;
    const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
    let query = this.get(queryHash);
    if (!query) {
      query = new Query({
        cache: this,
        queryKey,
        queryHash,
        options: client.defaultQueryOptions(options),
        state,
        defaultOptions: client.getQueryDefaults(queryKey)
      });
      this.add(query);
    }
    return query;
  }
  add(query) {
    if (!this.#queries.has(query.queryHash)) {
      this.#queries.set(query.queryHash, query);
      this.notify({
        type: "added",
        query
      });
    }
  }
  remove(query) {
    const queryInMap = this.#queries.get(query.queryHash);
    if (queryInMap) {
      query.destroy();
      if (queryInMap === query) {
        this.#queries.delete(query.queryHash);
      }
      this.notify({ type: "removed", query });
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        this.remove(query);
      });
    });
  }
  get(queryHash) {
    return this.#queries.get(queryHash);
  }
  getAll() {
    return [...this.#queries.values()];
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (query) => matchQuery(defaultedFilters, query)
    );
  }
  findAll(filters = {}) {
    const queries = this.getAll();
    return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  onFocus() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onFocus();
      });
    });
  }
  onOnline() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onOnline();
      });
    });
  }
};

// src/mutation.ts
var Mutation = class extends Removable {
  #observers;
  #mutationCache;
  #retryer;
  constructor(config) {
    super();
    this.mutationId = config.mutationId;
    this.#mutationCache = config.mutationCache;
    this.#observers = [];
    this.state = config.state || getDefaultState();
    this.setOptions(config.options);
    this.scheduleGc();
  }
  setOptions(options) {
    this.options = options;
    this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(observer) {
    if (!this.#observers.includes(observer)) {
      this.#observers.push(observer);
      this.clearGcTimeout();
      this.#mutationCache.notify({
        type: "observerAdded",
        mutation: this,
        observer
      });
    }
  }
  removeObserver(observer) {
    this.#observers = this.#observers.filter((x) => x !== observer);
    this.scheduleGc();
    this.#mutationCache.notify({
      type: "observerRemoved",
      mutation: this,
      observer
    });
  }
  optionalRemove() {
    if (!this.#observers.length) {
      if (this.state.status === "pending") {
        this.scheduleGc();
      } else {
        this.#mutationCache.remove(this);
      }
    }
  }
  continue() {
    return this.#retryer?.continue() ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(variables) {
    this.#retryer = createRetryer({
      fn: () => {
        if (!this.options.mutationFn) {
          return Promise.reject(new Error("No mutationFn found"));
        }
        return this.options.mutationFn(variables);
      },
      onFail: (failureCount, error) => {
        this.#dispatch({ type: "failed", failureCount, error });
      },
      onPause: () => {
        this.#dispatch({ type: "pause" });
      },
      onContinue: () => {
        this.#dispatch({ type: "continue" });
      },
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => this.#mutationCache.canRun(this)
    });
    const restored = this.state.status === "pending";
    const isPaused = !this.#retryer.canStart();
    try {
      if (!restored) {
        this.#dispatch({ type: "pending", variables, isPaused });
        await this.#mutationCache.config.onMutate?.(
          variables,
          this
        );
        const context = await this.options.onMutate?.(variables);
        if (context !== this.state.context) {
          this.#dispatch({
            type: "pending",
            context,
            variables,
            isPaused
          });
        }
      }
      const data = await this.#retryer.start();
      await this.#mutationCache.config.onSuccess?.(
        data,
        variables,
        this.state.context,
        this
      );
      await this.options.onSuccess?.(data, variables, this.state.context);
      await this.#mutationCache.config.onSettled?.(
        data,
        null,
        this.state.variables,
        this.state.context,
        this
      );
      await this.options.onSettled?.(data, null, variables, this.state.context);
      this.#dispatch({ type: "success", data });
      return data;
    } catch (error) {
      try {
        await this.#mutationCache.config.onError?.(
          error,
          variables,
          this.state.context,
          this
        );
        await this.options.onError?.(
          error,
          variables,
          this.state.context
        );
        await this.#mutationCache.config.onSettled?.(
          void 0,
          error,
          this.state.variables,
          this.state.context,
          this
        );
        await this.options.onSettled?.(
          void 0,
          error,
          variables,
          this.state.context
        );
        throw error;
      } finally {
        this.#dispatch({ type: "error", error });
      }
    } finally {
      this.#mutationCache.runNext(this);
    }
  }
  #dispatch(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            failureCount: action.failureCount,
            failureReason: action.error
          };
        case "pause":
          return {
            ...state,
            isPaused: true
          };
        case "continue":
          return {
            ...state,
            isPaused: false
          };
        case "pending":
          return {
            ...state,
            context: action.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: action.isPaused,
            status: "pending",
            variables: action.variables,
            submittedAt: Date.now()
          };
        case "success":
          return {
            ...state,
            data: action.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: false
          };
        case "error":
          return {
            ...state,
            data: void 0,
            error: action.error,
            failureCount: state.failureCount + 1,
            failureReason: action.error,
            isPaused: false,
            status: "error"
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.#observers.forEach((observer) => {
        observer.onMutationUpdate(action);
      });
      this.#mutationCache.notify({
        mutation: this,
        type: "updated",
        action
      });
    });
  }
};
function getDefaultState() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}

// src/mutationCache.ts
var MutationCache = class extends Subscribable {
  constructor(config = {}) {
    super();
    this.config = config;
    this.#mutations = /* @__PURE__ */ new Map();
    this.#mutationId = Date.now();
  }
  #mutations;
  #mutationId;
  build(client, options, state) {
    const mutation = new Mutation({
      mutationCache: this,
      mutationId: ++this.#mutationId,
      options: client.defaultMutationOptions(options),
      state
    });
    this.add(mutation);
    return mutation;
  }
  add(mutation) {
    const scope = scopeFor(mutation);
    const mutations = this.#mutations.get(scope) ?? [];
    mutations.push(mutation);
    this.#mutations.set(scope, mutations);
    this.notify({ type: "added", mutation });
  }
  remove(mutation) {
    const scope = scopeFor(mutation);
    if (this.#mutations.has(scope)) {
      const mutations = this.#mutations.get(scope)?.filter((x) => x !== mutation);
      if (mutations) {
        if (mutations.length === 0) {
          this.#mutations.delete(scope);
        } else {
          this.#mutations.set(scope, mutations);
        }
      }
    }
    this.notify({ type: "removed", mutation });
  }
  canRun(mutation) {
    const firstPendingMutation = this.#mutations.get(scopeFor(mutation))?.find((m) => m.state.status === "pending");
    return !firstPendingMutation || firstPendingMutation === mutation;
  }
  runNext(mutation) {
    const foundMutation = this.#mutations.get(scopeFor(mutation))?.find((m) => m !== mutation && m.state.isPaused);
    return foundMutation?.continue() ?? Promise.resolve();
  }
  clear() {
    notifyManager.batch(() => {
      this.getAll().forEach((mutation) => {
        this.remove(mutation);
      });
    });
  }
  getAll() {
    return [...this.#mutations.values()].flat();
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (mutation) => matchMutation(defaultedFilters, mutation)
    );
  }
  findAll(filters = {}) {
    return this.getAll().filter((mutation) => matchMutation(filters, mutation));
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  resumePausedMutations() {
    const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
    return notifyManager.batch(
      () => Promise.all(
        pausedMutations.map((mutation) => mutation.continue().catch(noop))
      )
    );
  }
};
function scopeFor(mutation) {
  return mutation.options.scope?.id ?? String(mutation.mutationId);
}

// src/infiniteQueryBehavior.ts
function infiniteQueryBehavior(pages) {
  return {
    onFetch: (context, query) => {
      const options = context.options;
      const direction = context.fetchOptions?.meta?.fetchMore?.direction;
      const oldPages = context.state.data?.pages || [];
      const oldPageParams = context.state.data?.pageParams || [];
      let result = { pages: [], pageParams: [] };
      let currentPage = 0;
      const fetchFn = async () => {
        let cancelled = false;
        const addSignalProperty = (object) => {
          Object.defineProperty(object, "signal", {
            enumerable: true,
            get: () => {
              if (context.signal.aborted) {
                cancelled = true;
              } else {
                context.signal.addEventListener("abort", () => {
                  cancelled = true;
                });
              }
              return context.signal;
            }
          });
        };
        const queryFn = ensureQueryFn(context.options, context.fetchOptions);
        const fetchPage = async (data, param, previous) => {
          if (cancelled) {
            return Promise.reject();
          }
          if (param == null && data.pages.length) {
            return Promise.resolve(data);
          }
          const queryFnContext = {
            queryKey: context.queryKey,
            pageParam: param,
            direction: previous ? "backward" : "forward",
            meta: context.options.meta
          };
          addSignalProperty(queryFnContext);
          const page = await queryFn(
            queryFnContext
          );
          const { maxPages } = context.options;
          const addTo = previous ? addToStart : addToEnd;
          return {
            pages: addTo(data.pages, page, maxPages),
            pageParams: addTo(data.pageParams, param, maxPages)
          };
        };
        if (direction && oldPages.length) {
          const previous = direction === "backward";
          const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
          const oldData = {
            pages: oldPages,
            pageParams: oldPageParams
          };
          const param = pageParamFn(options, oldData);
          result = await fetchPage(oldData, param, previous);
        } else {
          const remainingPages = pages ?? oldPages.length;
          do {
            const param = currentPage === 0 ? oldPageParams[0] ?? options.initialPageParam : getNextPageParam(options, result);
            if (currentPage > 0 && param == null) {
              break;
            }
            result = await fetchPage(result, param);
            currentPage++;
          } while (currentPage < remainingPages);
        }
        return result;
      };
      if (context.options.persister) {
        context.fetchFn = () => {
          return context.options.persister?.(
            fetchFn,
            {
              queryKey: context.queryKey,
              meta: context.options.meta,
              signal: context.signal
            },
            query
          );
        };
      } else {
        context.fetchFn = fetchFn;
      }
    }
  };
}
function getNextPageParam(options, { pages, pageParams }) {
  const lastIndex = pages.length - 1;
  return pages.length > 0 ? options.getNextPageParam(
    pages[lastIndex],
    pages,
    pageParams[lastIndex],
    pageParams
  ) : void 0;
}
function getPreviousPageParam(options, { pages, pageParams }) {
  return pages.length > 0 ? options.getPreviousPageParam?.(pages[0], pages, pageParams[0], pageParams) : void 0;
}

// src/queryClient.ts
var QueryClient = class {
  #queryCache;
  #mutationCache;
  #defaultOptions;
  #queryDefaults;
  #mutationDefaults;
  #mountCount;
  #unsubscribeFocus;
  #unsubscribeOnline;
  constructor(config = {}) {
    this.#queryCache = config.queryCache || new QueryCache();
    this.#mutationCache = config.mutationCache || new MutationCache();
    this.#defaultOptions = config.defaultOptions || {};
    this.#queryDefaults = /* @__PURE__ */ new Map();
    this.#mutationDefaults = /* @__PURE__ */ new Map();
    this.#mountCount = 0;
  }
  mount() {
    this.#mountCount++;
    if (this.#mountCount !== 1)
      return;
    this.#unsubscribeFocus = focusManager.subscribe(async (focused) => {
      if (focused) {
        await this.resumePausedMutations();
        this.#queryCache.onFocus();
      }
    });
    this.#unsubscribeOnline = onlineManager.subscribe(async (online) => {
      if (online) {
        await this.resumePausedMutations();
        this.#queryCache.onOnline();
      }
    });
  }
  unmount() {
    this.#mountCount--;
    if (this.#mountCount !== 0)
      return;
    this.#unsubscribeFocus?.();
    this.#unsubscribeFocus = void 0;
    this.#unsubscribeOnline?.();
    this.#unsubscribeOnline = void 0;
  }
  isFetching(filters) {
    return this.#queryCache.findAll({ ...filters, fetchStatus: "fetching" }).length;
  }
  isMutating(filters) {
    return this.#mutationCache.findAll({ ...filters, status: "pending" }).length;
  }
  getQueryData(queryKey) {
    const options = this.defaultQueryOptions({ queryKey });
    return this.#queryCache.get(options.queryHash)?.state.data;
  }
  ensureQueryData(options) {
    const cachedData = this.getQueryData(options.queryKey);
    if (cachedData === void 0)
      return this.fetchQuery(options);
    else {
      const defaultedOptions = this.defaultQueryOptions(options);
      const query = this.#queryCache.build(this, defaultedOptions);
      if (options.revalidateIfStale && query.isStaleByTime(resolveStaleTime(defaultedOptions.staleTime, query))) {
        void this.prefetchQuery(defaultedOptions);
      }
      return Promise.resolve(cachedData);
    }
  }
  getQueriesData(filters) {
    return this.#queryCache.findAll(filters).map(({ queryKey, state }) => {
      const data = state.data;
      return [queryKey, data];
    });
  }
  setQueryData(queryKey, updater, options) {
    const defaultedOptions = this.defaultQueryOptions({ queryKey });
    const query = this.#queryCache.get(
      defaultedOptions.queryHash
    );
    const prevData = query?.state.data;
    const data = functionalUpdate(updater, prevData);
    if (data === void 0) {
      return void 0;
    }
    return this.#queryCache.build(this, defaultedOptions).setData(data, { ...options, manual: true });
  }
  setQueriesData(filters, updater, options) {
    return notifyManager.batch(
      () => this.#queryCache.findAll(filters).map(({ queryKey }) => [
        queryKey,
        this.setQueryData(queryKey, updater, options)
      ])
    );
  }
  getQueryState(queryKey) {
    const options = this.defaultQueryOptions({ queryKey });
    return this.#queryCache.get(options.queryHash)?.state;
  }
  removeQueries(filters) {
    const queryCache = this.#queryCache;
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        queryCache.remove(query);
      });
    });
  }
  resetQueries(filters, options) {
    const queryCache = this.#queryCache;
    const refetchFilters = {
      type: "active",
      ...filters
    };
    return notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        query.reset();
      });
      return this.refetchQueries(refetchFilters, options);
    });
  }
  cancelQueries(filters = {}, cancelOptions = {}) {
    const defaultedCancelOptions = { revert: true, ...cancelOptions };
    const promises = notifyManager.batch(
      () => this.#queryCache.findAll(filters).map((query) => query.cancel(defaultedCancelOptions))
    );
    return Promise.all(promises).then(noop).catch(noop);
  }
  invalidateQueries(filters = {}, options = {}) {
    return notifyManager.batch(() => {
      this.#queryCache.findAll(filters).forEach((query) => {
        query.invalidate();
      });
      if (filters.refetchType === "none") {
        return Promise.resolve();
      }
      const refetchFilters = {
        ...filters,
        type: filters.refetchType ?? filters.type ?? "active"
      };
      return this.refetchQueries(refetchFilters, options);
    });
  }
  refetchQueries(filters = {}, options) {
    const fetchOptions = {
      ...options,
      cancelRefetch: options?.cancelRefetch ?? true
    };
    const promises = notifyManager.batch(
      () => this.#queryCache.findAll(filters).filter((query) => !query.isDisabled()).map((query) => {
        let promise = query.fetch(void 0, fetchOptions);
        if (!fetchOptions.throwOnError) {
          promise = promise.catch(noop);
        }
        return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
      })
    );
    return Promise.all(promises).then(noop);
  }
  fetchQuery(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    if (defaultedOptions.retry === void 0) {
      defaultedOptions.retry = false;
    }
    const query = this.#queryCache.build(this, defaultedOptions);
    return query.isStaleByTime(
      resolveStaleTime(defaultedOptions.staleTime, query)
    ) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  }
  prefetchQuery(options) {
    return this.fetchQuery(options).then(noop).catch(noop);
  }
  fetchInfiniteQuery(options) {
    options.behavior = infiniteQueryBehavior(options.pages);
    return this.fetchQuery(options);
  }
  prefetchInfiniteQuery(options) {
    return this.fetchInfiniteQuery(options).then(noop).catch(noop);
  }
  ensureInfiniteQueryData(options) {
    options.behavior = infiniteQueryBehavior(options.pages);
    return this.ensureQueryData(options);
  }
  resumePausedMutations() {
    if (onlineManager.isOnline()) {
      return this.#mutationCache.resumePausedMutations();
    }
    return Promise.resolve();
  }
  getQueryCache() {
    return this.#queryCache;
  }
  getMutationCache() {
    return this.#mutationCache;
  }
  getDefaultOptions() {
    return this.#defaultOptions;
  }
  setDefaultOptions(options) {
    this.#defaultOptions = options;
  }
  setQueryDefaults(queryKey, options) {
    this.#queryDefaults.set(hashKey(queryKey), {
      queryKey,
      defaultOptions: options
    });
  }
  getQueryDefaults(queryKey) {
    const defaults = [...this.#queryDefaults.values()];
    let result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(queryKey, queryDefault.queryKey)) {
        result = { ...result, ...queryDefault.defaultOptions };
      }
    });
    return result;
  }
  setMutationDefaults(mutationKey, options) {
    this.#mutationDefaults.set(hashKey(mutationKey), {
      mutationKey,
      defaultOptions: options
    });
  }
  getMutationDefaults(mutationKey) {
    const defaults = [...this.#mutationDefaults.values()];
    let result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(mutationKey, queryDefault.mutationKey)) {
        result = { ...result, ...queryDefault.defaultOptions };
      }
    });
    return result;
  }
  defaultQueryOptions(options) {
    if (options._defaulted) {
      return options;
    }
    const defaultedOptions = {
      ...this.#defaultOptions.queries,
      ...this.getQueryDefaults(options.queryKey),
      ...options,
      _defaulted: true
    };
    if (!defaultedOptions.queryHash) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(
        defaultedOptions.queryKey,
        defaultedOptions
      );
    }
    if (defaultedOptions.refetchOnReconnect === void 0) {
      defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
    }
    if (defaultedOptions.throwOnError === void 0) {
      defaultedOptions.throwOnError = !!defaultedOptions.suspense;
    }
    if (!defaultedOptions.networkMode && defaultedOptions.persister) {
      defaultedOptions.networkMode = "offlineFirst";
    }
    if (defaultedOptions.enabled !== true && defaultedOptions.queryFn === skipToken) {
      defaultedOptions.enabled = false;
    }
    return defaultedOptions;
  }
  defaultMutationOptions(options) {
    if (options?._defaulted) {
      return options;
    }
    return {
      ...this.#defaultOptions.mutations,
      ...options?.mutationKey && this.getMutationDefaults(options.mutationKey),
      ...options,
      _defaulted: true
    };
  }
  clear() {
    this.#queryCache.clear();
    this.#mutationCache.clear();
  }
};

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Award$1 = createLucideIcon("Award", [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const BatteryFull = createLucideIcon("BatteryFull", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }],
  ["line", { x1: "6", x2: "6", y1: "11", y2: "13", key: "1wd6dw" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "13", key: "haxvl5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "13", key: "c6fn6x" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const BookOpen = createLucideIcon("BookOpen", [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const CircleCheckBig = createLucideIcon("CircleCheckBig", [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const CircleCheck = createLucideIcon("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const CircleDashed = createLucideIcon("CircleDashed", [
  ["path", { d: "M10.1 2.182a10 10 0 0 1 3.8 0", key: "5ilxe3" }],
  ["path", { d: "M13.9 21.818a10 10 0 0 1-3.8 0", key: "11zvb9" }],
  ["path", { d: "M17.609 3.721a10 10 0 0 1 2.69 2.7", key: "1iw5b2" }],
  ["path", { d: "M2.182 13.9a10 10 0 0 1 0-3.8", key: "c0bmvh" }],
  ["path", { d: "M20.279 17.609a10 10 0 0 1-2.7 2.69", key: "1ruxm7" }],
  ["path", { d: "M21.818 10.1a10 10 0 0 1 0 3.8", key: "qkgqxc" }],
  ["path", { d: "M3.721 6.391a10 10 0 0 1 2.7-2.69", key: "1mcia2" }],
  ["path", { d: "M6.391 20.279a10 10 0 0 1-2.69-2.7", key: "1fvljs" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Crown = createLucideIcon("Crown", [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Database = createLucideIcon("Database", [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const EllipsisVertical = createLucideIcon("EllipsisVertical", [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
  ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Flag = createLucideIcon("Flag", [
  ["path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", key: "i9b6wo" }],
  ["line", { x1: "4", x2: "4", y1: "22", y2: "15", key: "1cm3nv" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Flame = createLucideIcon("Flame", [
  [
    "path",
    {
      d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
      key: "96xj49"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Hand = createLucideIcon("Hand", [
  ["path", { d: "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2", key: "1fvzgz" }],
  ["path", { d: "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2", key: "1kc0my" }],
  ["path", { d: "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8", key: "10h0bg" }],
  [
    "path",
    {
      d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
      key: "1s1gnw"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Hash = createLucideIcon("Hash", [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Hourglass = createLucideIcon("Hourglass", [
  ["path", { d: "M5 22h14", key: "ehvnwv" }],
  ["path", { d: "M5 2h14", key: "pdyrp9" }],
  [
    "path",
    {
      d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",
      key: "1d314k"
    }
  ],
  [
    "path",
    { d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2", key: "1vvvr6" }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Laugh = createLucideIcon("Laugh", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z", key: "b2q4dd" }],
  ["line", { x1: "9", x2: "9.01", y1: "9", y2: "9", key: "yxxnd0" }],
  ["line", { x1: "15", x2: "15.01", y1: "9", y2: "9", key: "1p4y9e" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Mail = createLucideIcon("Mail", [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Menu = createLucideIcon("Menu", [
  ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }],
  ["line", { x1: "4", x2: "20", y1: "6", y2: "6", key: "1owob3" }],
  ["line", { x1: "4", x2: "20", y1: "18", y2: "18", key: "yk5zj1" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Puzzle = createLucideIcon("Puzzle", [
  [
    "path",
    {
      d: "M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z",
      key: "w46dr5"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Shield = createLucideIcon("Shield", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const SquareCheckBig = createLucideIcon("SquareCheckBig", [
  ["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Sunrise = createLucideIcon("Sunrise", [
  ["path", { d: "M12 2v8", key: "1q4o3n" }],
  ["path", { d: "m4.93 10.93 1.41 1.41", key: "2a7f42" }],
  ["path", { d: "M2 18h2", key: "j10viu" }],
  ["path", { d: "M20 18h2", key: "wocana" }],
  ["path", { d: "m19.07 10.93-1.41 1.41", key: "15zs5n" }],
  ["path", { d: "M22 22H2", key: "19qnx5" }],
  ["path", { d: "m8 6 4-4 4 4", key: "ybng9g" }],
  ["path", { d: "M16 18a4 4 0 0 0-8 0", key: "1lzouq" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Trash2 = createLucideIcon("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Trophy = createLucideIcon("Trophy", [
  ["path", { d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6", key: "17hqa7" }],
  ["path", { d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", key: "lmptdp" }],
  ["path", { d: "M4 22h16", key: "57wxv0" }],
  ["path", { d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22", key: "1nw9bq" }],
  ["path", { d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22", key: "1np0yb" }],
  ["path", { d: "M18 2H6v7a6 6 0 0 0 12 0V2Z", key: "u46fv3" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const User = createLucideIcon("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);

const {Component} = await importShared('react');
class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null
  };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "mt-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "bg-red-50 dark:bg-red-900/20", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center text-red-700 dark:text-red-300", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleAlert, { className: "mr-2 h-5 w-5" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
              lineNumber: 40,
              columnNumber: 15
            }, this),
            "Something went wrong"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
            lineNumber: 39,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { className: "text-red-600 dark:text-red-400", children: "We encountered an error while processing your request" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
            lineNumber: 43,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
          lineNumber: 38,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mb-4 text-muted-foreground", children: this.state.error?.message || "An unexpected error occurred" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
            lineNumber: 48,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              onClick: () => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              },
              className: "flex items-center",
              children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RefreshCw, { className: "mr-2 h-4 w-4" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
                  lineNumber: 59,
                  columnNumber: 15
                }, this),
                "Reload page"
              ]
            },
            void 0,
            true,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
              lineNumber: 51,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
          lineNumber: 47,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ErrorBoundary.tsx",
        lineNumber: 37,
        columnNumber: 9
      }, this);
    }
    return this.props.children;
  }
}

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;
const capturedLogs = [];
console.error = function(...args) {
  capturedLogs.push({
    type: "error",
    args,
    timestamp: /* @__PURE__ */ new Date()
  });
  originalConsoleError.apply(console, args);
};
console.warn = function(...args) {
  capturedLogs.push({
    type: "warn",
    args,
    timestamp: /* @__PURE__ */ new Date()
  });
  originalConsoleWarn.apply(console, args);
};
console.log = function(...args) {
  capturedLogs.push({
    type: "log",
    args,
    timestamp: /* @__PURE__ */ new Date()
  });
  originalConsoleLog.apply(console, args);
};
function clearCapturedLogs() {
  capturedLogs.length = 0;
}

const {useState: useState$c,useEffect: useEffect$b} = await importShared('react');
function ConsoleErrorDisplay({
  position = "bottom-right",
  showOnlyErrors = true
}) {
  const [isOpen, setIsOpen] = useState$c(false);
  const [logs, setLogs] = useState$c(capturedLogs);
  useEffect$b(() => {
    const interval = setInterval(() => {
      setLogs([...capturedLogs]);
    }, 2e3);
    return () => clearInterval(interval);
  }, []);
  const filteredLogs = showOnlyErrors ? logs.filter((log) => log.type === "error") : logs;
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4"
  };
  if (filteredLogs.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "div",
    {
      className: `fixed ${positionClasses[position]} z-50`,
      children: !isOpen ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        "button",
        {
          className: "bg-red-500 text-white px-3 py-2 rounded-full shadow-lg",
          onClick: () => setIsOpen(true),
          children: [
            filteredLogs.length,
            " ",
            filteredLogs.length === 1 ? "Error" : "Errors"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
          lineNumber: 48,
          columnNumber: 9
        },
        this
      ) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white rounded-md shadow-xl border border-gray-200 w-96 max-h-96 overflow-auto", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between p-3 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-gray-700", children: [
            "Console ",
            showOnlyErrors ? "Errors" : "Logs"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
            lineNumber: 57,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex space-x-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              "button",
              {
                className: "text-xs bg-gray-100 px-2 py-1 rounded",
                onClick: () => {
                  clearCapturedLogs();
                  setLogs([]);
                },
                children: "Clear"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
                lineNumber: 59,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              "button",
              {
                className: "text-gray-400 hover:text-gray-600",
                onClick: () => setIsOpen(false),
                children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(X, { size: 18 }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
                  lineNumber: 72,
                  columnNumber: 17
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
                lineNumber: 68,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
            lineNumber: 58,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
          lineNumber: 56,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-3", children: filteredLogs.length === 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500", children: "No errors to display" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
          lineNumber: 78,
          columnNumber: 15
        }, this) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "divide-y divide-gray-100", children: filteredLogs.map((log, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "py-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: `text-xs font-mono ${log.type === "error" ? "text-red-600" : log.type === "warn" ? "text-amber-600" : "text-gray-700"}`, children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "font-semibold", children: log.type.toUpperCase() }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
              lineNumber: 85,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-gray-400", children: log.timestamp.toLocaleTimeString() }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
              lineNumber: 86,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
            lineNumber: 84,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("pre", { className: "mt-1 whitespace-pre-wrap break-words", children: log.args.map(
            (arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(" ") }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
            lineNumber: 90,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
          lineNumber: 83,
          columnNumber: 21
        }, this) }, index, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
          lineNumber: 82,
          columnNumber: 19
        }, this)) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
          lineNumber: 80,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
          lineNumber: 76,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ConsoleErrorDisplay.tsx",
      lineNumber: 44,
      columnNumber: 5
    },
    this
  );
}

function TestErrors() {
  const generateError = () => {
    console.error("Test error from button click");
    try {
      const obj = null;
      obj.nonExistentMethod();
    } catch (error) {
      console.error("Caught error:", error);
    }
  };
  const generateWarning = () => {
    console.warn("Test warning from button click");
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "fixed top-4 right-4 z-40 flex flex-col space-y-2", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      "button",
      {
        onClick: generateError,
        className: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm",
        children: "Test Error"
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TestErrors.tsx",
        lineNumber: 25,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      "button",
      {
        onClick: generateWarning,
        className: "bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm",
        children: "Test Warning"
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TestErrors.tsx",
        lineNumber: 31,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TestErrors.tsx",
    lineNumber: 24,
    columnNumber: 5
  }, this);
}

const {Outlet} = await importShared('react-router-dom');
function RootLayout() {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Te, { position: "top-right", theme: "system" }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/layout/root-layout.tsx",
      lineNumber: 8,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("main", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container max-w-7xl mx-auto p-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Outlet, {}, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/layout/root-layout.tsx",
      lineNumber: 11,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/layout/root-layout.tsx",
      lineNumber: 10,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/layout/root-layout.tsx",
      lineNumber: 9,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/layout/root-layout.tsx",
    lineNumber: 7,
    columnNumber: 5
  }, this);
}

const React$2 = await importShared('react');

const {useNavigate: useNavigate$5} = await importShared('react-router-dom');
const {Link} = await importShared('react-router-dom');
const LandingPage = ({ session }) => {
  const navigate = useNavigate$5();
  const [mobileMenuOpen, setMobileMenuOpen] = React$2.useState(false);
  const handleGetStarted = () => {
    if (session) {
      navigate("app");
    } else {
      navigate("auth");
    }
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col min-h-screen", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("header", { className: "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between h-16", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Link, { to: "/", className: "flex items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-6 w-6 text-green-600 dark:text-green-500 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 38,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "font-bold text-xl", children: "Mission Fresh" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 39,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 37,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 36,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("nav", { className: "hidden md:flex space-x-8", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Link,
            {
              to: "app/nrt-directory",
              className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
              children: "NRT Directory"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 45,
              columnNumber: 15
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Link,
            {
              to: "app/alternative-products",
              className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
              children: "Smokeless Alternatives"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 51,
              columnNumber: 15
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Link,
            {
              to: "app/guides",
              className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
              children: "Quitting Guides"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 57,
              columnNumber: 15
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Link,
            {
              to: "app/community",
              className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
              children: "Community"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 63,
              columnNumber: 15
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 44,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:hidden", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "button",
          {
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500",
            children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Menu, { className: "h-6 w-6" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 77,
              columnNumber: 17
            }, globalThis)
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 73,
            columnNumber: 15
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 72,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Button,
          {
            onClick: handleGetStarted,
            className: "bg-green-600 hover:bg-green-700 text-white",
            children: session ? "Dashboard" : "Get Started"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 83,
            columnNumber: 15
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 82,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 35,
        columnNumber: 11
      }, globalThis),
      mobileMenuOpen && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:hidden py-2 pb-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Link,
          {
            to: "app/nrt-directory",
            className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
            children: "NRT Directory"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 95,
            columnNumber: 15
          },
          globalThis
        ),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Link,
          {
            to: "app/alternative-products",
            className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
            children: "Smokeless Alternatives"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 101,
            columnNumber: 15
          },
          globalThis
        ),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Link,
          {
            to: "app/guides",
            className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
            children: "Quitting Guides"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 107,
            columnNumber: 15
          },
          globalThis
        ),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Link,
          {
            to: "app/community",
            className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
            children: "Community"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 113,
            columnNumber: 15
          },
          globalThis
        ),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Button,
          {
            onClick: handleGetStarted,
            className: "mt-3 w-full bg-green-600 hover:bg-green-700 text-white",
            children: session ? "Dashboard" : "Get Started"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 119,
            columnNumber: 15
          },
          globalThis
        )
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 94,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 34,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 33,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { className: "bg-gradient-to-b from-green-800 to-green-700 text-white py-16 md:py-24", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 mx-auto", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col md:flex-row items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:w-1/2 mb-10 md:mb-0", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-4xl md:text-5xl font-bold mb-6", children: [
          "Welcome to ",
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "block text-green-300", children: "Mission Fresh" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 136,
            columnNumber: 28
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 135,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xl md:text-2xl mb-4 text-green-100", children: "The world's most comprehensive quit-smoking app, focused on your complete well-being." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 138,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg mb-8 text-green-200", children: "No matter your goal or preferred method, we provide the tools, support, and guidance without judgment." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 141,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col sm:flex-row gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              size: "lg",
              onClick: handleGetStarted,
              className: "bg-green-600 hover:bg-green-700 text-white border-none",
              children: session ? "Go to Your Dashboard" : "Start Your Quit Journey"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 145,
              columnNumber: 17
            },
            globalThis
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              size: "lg",
              className: "border-white text-white hover:bg-white/10",
              onClick: () => navigate("app/community"),
              children: "Join Quitting Community"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 152,
              columnNumber: 17
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 144,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 134,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:w-1/2 flex justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative w-80 h-80", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-0 bg-green-500 rounded-full opacity-20 animate-pulse" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 164,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-4 bg-green-400 rounded-full opacity-20 animate-pulse animation-delay-1000" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 165,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-8 bg-green-600 rounded-full opacity-20 animate-pulse animation-delay-2000" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 166,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "w-32 h-32 text-white" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 168,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 167,
          columnNumber: 17
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 163,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 162,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 133,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 132,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 131,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { className: "py-12 bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 mx-auto", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center mb-10", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-2xl md:text-3xl font-bold", children: "Explore Our Quit Smoking Resources" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 180,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: "Find the right products and alternatives to support your journey" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 181,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 179,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cigarette, { className: "w-6 h-6 text-green-600 dark:text-green-400" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 190,
              columnNumber: 21
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 189,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "ml-4 text-xl font-semibold", children: "NRT Product Directory" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 192,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 188,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Explore FDA-approved nicotine replacement therapies including patches, gums, lozenges, inhalers, and prescription medications." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 194,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "mb-6 space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 199,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Compare effectiveness and side effects" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 200,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 198,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 203,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Read user reviews and experiences" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 204,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 202,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 207,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Find the right dosage for your needs" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 208,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 206,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 197,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              onClick: () => window.location.href = "/app/nrt-directory",
              className: "w-full bg-green-600 hover:bg-green-700 text-white",
              children: "Browse NRT Products"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 211,
              columnNumber: 17
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 187,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 186,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "w-6 h-6 text-green-600 dark:text-green-400" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 225,
              columnNumber: 21
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 224,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "ml-4 text-xl font-semibold", children: "Smokeless Alternatives" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 227,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 223,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Discover non-smoking products like nicotine pouches, lozenges, and other smokeless options that may help you quit." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 229,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "mb-6 space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 234,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Browse alternative nicotine products" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 235,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 233,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 238,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Learn about harm reduction options" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 239,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 237,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 242,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Find products by strength and flavor" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 243,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 241,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 232,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              onClick: () => window.location.href = "/app/alternative-products",
              className: "w-full bg-green-600 hover:bg-green-700 text-white",
              children: "Explore Alternatives"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 246,
              columnNumber: 17
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 222,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 221,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BookOpen, { className: "w-6 h-6 text-green-600 dark:text-green-400" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 260,
              columnNumber: 21
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 259,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "ml-4 text-xl font-semibold", children: "Quitting Guides" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 262,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 258,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Get expert advice on different quitting methods, manage withdrawal symptoms, and learn strategies for long-term success." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 264,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "mb-6 space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 269,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Expert articles on quitting methods" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 270,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 268,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 273,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Withdrawal management strategies" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 274,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 272,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "w-5 h-5 text-green-500 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 277,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Step-by-step quitting plans" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 278,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 276,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 267,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              onClick: () => window.location.href = "/app/quitting-guides",
              className: "w-full bg-green-600 hover:bg-green-700 text-white",
              children: "Explore Guides"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 281,
              columnNumber: 17
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 257,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 256,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 184,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 178,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 177,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { className: "py-16 bg-white dark:bg-gray-800", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 mx-auto", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-3", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: "Whatever Your Goal" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 298,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 297,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-3xl font-bold mb-4", children: "Support for Every Quitting Method" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 300,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto", children: "Unlike other apps that only support cold turkey, we understand that quitting is personal. We provide comprehensive support for all approaches without judgment." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 301,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 296,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Snowflake, { className: "w-6 h-6 text-red-600 dark:text-red-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 313,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 312,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Cold Turkey" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 315,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Complete cessation all at once. Our app provides intensive energy and mood support during the critical first weeks." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 316,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 311,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 310,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 309,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChartLine, { className: "w-6 h-6 text-orange-600 dark:text-orange-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 328,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 327,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Gradual Reduction" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 330,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Systematically reduce consumption at your own pace. We'll help you track and adjust your reduction schedule." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 331,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 326,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 325,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 324,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Hourglass, { className: "w-6 h-6 text-green-600 dark:text-green-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 343,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 342,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Delay Technique" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 345,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Progressively extend the time between each use. Our tools help you manage cravings during longer waiting periods." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 346,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 341,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 340,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 339,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Hand, { className: "w-6 h-6 text-green-600 dark:text-green-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 358,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 357,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Nicotine Replacement" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 360,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Using replacements like patches or gum. We help manage the transition and gradual tapering of replacement products." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 361,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 356,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 355,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 354,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Hash, { className: "w-6 h-6 text-purple-600 dark:text-purple-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 373,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 372,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Cut Triggers" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 375,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Identify and eliminate smoking triggers one by one. Our app helps you track situations that prompt usage." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 376,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 371,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 370,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 369,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ThumbsUp, { className: "w-6 h-6 text-indigo-600 dark:text-indigo-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 388,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 387,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Reduction Only" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 390,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Just want to cut back? No problem. Set your own goals and we'll help you reach them without pressuring complete cessation." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 391,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 386,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 385,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 384,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 307,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          onClick: handleGetStarted,
          className: "flex items-center gap-2",
          children: [
            "Find Your Best Method",
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 405,
              columnNumber: 15
            }, globalThis)
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 400,
          columnNumber: 13
        },
        globalThis
      ) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 399,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 295,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 294,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { className: "py-16 bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 mx-auto", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-3", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: "Comprehensive Support" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 416,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 415,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-3xl font-bold mb-4", children: "Beyond Motivation and Logging" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 418,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto", children: "Mission Fresh provides all the practical tools you need to manage energy, mood, and focus challenges during your quit journey — the real reasons most quit attempts fail." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 419,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 414,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid md:grid-cols-2 gap-8 mb-10", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-2xl font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Database, { className: "h-6 w-6 text-primary" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 428,
              columnNumber: 17
            }, globalThis),
            "Real-Time Progress Tracking"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 427,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mb-4", children: "Every cravings log, mood update, and progress milestone is saved to your secure personal database. All data is synchronized across devices so you can track your journey anywhere." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 431,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-gray-100 dark:bg-gray-700 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Data We Track For You:" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 436,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 439,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Daily consumption of multiple nicotine products" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 440,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 438,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 443,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Cravings intensity, triggers, and resolution strategies" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 444,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 442,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 447,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Energy levels throughout your quit process" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 448,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 446,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 451,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Mood patterns and emotional responses" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 452,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 450,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 455,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Money saved and health improvements" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 456,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 454,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 437,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 435,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 426,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-2xl font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Book, { className: "h-6 w-6 text-primary" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 464,
              columnNumber: 17
            }, globalThis),
            "Method-Specific Guidance"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 463,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mb-4", children: "Whether you're going cold turkey or gradually reducing, Mission Fresh adapts to your preferred quitting strategy with personalized guidance and tools." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 467,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-gray-100 dark:bg-gray-700 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Tailored Support:" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 472,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 475,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Customized reduction plans and schedules" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 476,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 474,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 479,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "NRT (Nicotine Replacement Therapy) tracking" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 480,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 478,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 483,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Trigger identification and management" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 484,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 482,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 487,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Delay technique timers and distractions" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 488,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 486,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 491,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Expert-backed guidance for each method" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 492,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 490,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 473,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 471,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 462,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 425,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border-none shadow-lg", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "w-6 h-6 text-indigo-600 dark:text-indigo-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 505,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 504,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Energy Management" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 507,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Our proprietary energy tools help combat fatigue and energy crashes when nicotine is no longer providing artificial stimulation." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 508,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 503,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 502,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 501,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border-none shadow-lg", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "w-6 h-6 text-green-600 dark:text-green-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 521,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 520,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Mood Support" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 523,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Interactive mood games and personalized strategies help stabilize emotions during withdrawal, reducing irritability and anxiety." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 524,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 519,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 518,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 517,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border-none shadow-lg", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BrainCircuit, { className: "w-6 h-6 text-green-600 dark:text-green-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 537,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 536,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "Holistic Approach" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 539,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Specialized nutrition, hydration, sleep, and exercise plans work together to support your body and mind during the quitting process." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 540,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 535,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 534,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 533,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 499,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 413,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 412,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { className: "py-16 bg-white dark:bg-gray-800", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 mx-auto", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col md:flex-row items-center gap-8", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:w-1/2", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-3", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: "Zero Judgment" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 557,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 556,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-3xl font-bold mb-4", children: "Your Journey, Your Way" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 559,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg text-gray-600 dark:text-gray-400 mb-4", children: "Mission Fresh is built on a foundation of non-judgment. Whether you want to quit completely, reduce your consumption, or just prepare for a future quit attempt — we meet you where you are." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 560,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheckBig, { className: "h-6 w-6 text-green-500 flex-shrink-0 mt-1" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 566,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-gray-600 dark:text-gray-400", children: "Set your own goals based on what works for YOU, not someone else's expectations" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 567,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 565,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheckBig, { className: "h-6 w-6 text-green-500 flex-shrink-0 mt-1" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 570,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-gray-600 dark:text-gray-400", children: "Slip-ups are treated as learning opportunities, not failures" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 571,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 569,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheckBig, { className: "h-6 w-6 text-green-500 flex-shrink-0 mt-1" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 574,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-gray-600 dark:text-gray-400", children: "Personalized support that adapts to your unique triggers and challenges" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 575,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 573,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheckBig, { className: "h-6 w-6 text-green-500 flex-shrink-0 mt-1" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 578,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-gray-600 dark:text-gray-400", children: "Supporting multiple nicotine products: cigarettes, vaping, pouches, and more" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 579,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 577,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 564,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 555,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:w-1/2 grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-indigo-100 dark:bg-indigo-900/40 p-6 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Users, { className: "h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 585,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium mb-2", children: "Community Support" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 586,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Connect with others on similar journeys without fear of criticism." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 587,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 584,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-green-100 dark:bg-green-900/40 p-6 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Sunrise, { className: "h-8 w-8 text-green-600 dark:text-green-400 mb-3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 592,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium mb-2", children: "Fresh Start" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 593,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Every day is a new opportunity — restart anytime without shame." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 594,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 591,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-amber-100 dark:bg-amber-900/40 p-6 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Coffee, { className: "h-8 w-8 text-amber-600 dark:text-amber-400 mb-3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 599,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium mb-2", children: "Quit Your Way" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 600,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Customizable plans that respect your preferences and lifestyle." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 601,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 598,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-green-100 dark:bg-green-900/40 p-6 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-8 w-8 text-green-600 dark:text-green-400 mb-3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 606,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium mb-2", children: "Emotional Support" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 607,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Tools to manage the complex emotions that arise during quitting." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 608,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 605,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 583,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 554,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 553,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 552,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { id: "benefits", className: "py-16 bg-green-50 dark:bg-green-900/10", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center max-w-3xl mx-auto mb-12", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-3xl font-bold mb-4 text-green-800 dark:text-green-400", children: "The Benefits of Quitting Are Immediate" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 621,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg text-gray-600 dark:text-gray-300", children: "Your body begins to heal as soon as you stop smoking. With Mission Fresh by your side, you'll track these health milestones and celebrate each achievement." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 622,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 620,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-8 w-8 text-green-600" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 631,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 630,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2 text-green-700 dark:text-green-500", children: "20 Minutes" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 633,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-300", children: "Your heart rate and blood pressure drop to normal levels, improving circulation." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 634,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 629,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Calendar, { className: "h-8 w-8 text-green-600" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 641,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 640,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2 text-green-700 dark:text-green-500", children: "2 Weeks" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 643,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-300", children: "Lung function improves and circulation gets better. Walking becomes easier." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 644,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 639,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CalendarDays, { className: "h-8 w-8 text-green-600" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 651,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 650,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2 text-green-700 dark:text-green-500", children: "1 Month" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 653,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-300", children: "Your lungs begin to heal, reducing risk of infection and improving overall breathing." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 654,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 649,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-8 w-8 text-green-600" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 661,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 660,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2 text-green-700 dark:text-green-500", children: "1 Year" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 663,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-300", children: "Your risk of heart disease drops to half that of a smoker. A major milestone worth celebrating!" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 664,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 659,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 628,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-12 text-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: handleGetStarted, size: "lg", className: "bg-green-600 hover:bg-green-700", children: "Start Your Healing Journey" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 671,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 670,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 619,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 618,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { className: "py-16 bg-white dark:bg-gray-800", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 mx-auto", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-3", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: "Real Tools, Not Just Tracking" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 683,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 682,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-3xl font-bold mb-4", children: "Comprehensive Toolkit" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 685,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto", children: "Mission Fresh provides practical tools you can use every day to overcome the challenges of quitting." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 686,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 681,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "w-5 h-5 text-red-600 dark:text-red-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 696,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 695,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Energy Management Plan" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 699,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Personalized strategies to maintain energy levels throughout the quitting process." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 700,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 698,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 694,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 693,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 692,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BrainCircuit, { className: "w-5 h-5 text-green-600 dark:text-green-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 712,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 711,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Craving Distraction Games" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 715,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Interactive games specifically designed to redirect your focus during cravings." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 716,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 714,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 710,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 709,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 708,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "w-5 h-5 text-green-600 dark:text-green-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 728,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 727,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Mood Management Exercises" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 731,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Tools to identify and improve your emotional state during challenging moments." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 732,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 730,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 726,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 725,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 724,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Utensils, { className: "w-5 h-5 text-amber-600 dark:text-amber-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 744,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 743,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Nutrition Planner" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 747,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Guidance on foods that support energy, focus, and mood during the quitting process." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 748,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 746,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 742,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 741,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 740,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Users, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 760,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 759,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Community Support" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 763,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Connect with other quitters to share experiences, tips, and encouragement." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 764,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 762,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 758,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 757,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 756,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChartLine, { className: "w-5 h-5 text-purple-600 dark:text-purple-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 776,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 775,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Progress Analytics" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 779,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Comprehensive tracking of cravings, energy, mood, and achievements over time." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 780,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 778,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 774,
          columnNumber: 17
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 773,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 772,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 691,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 680,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 679,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("section", { className: "py-16 bg-indigo-900 text-white", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 mx-auto text-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-indigo-800/50 p-6 rounded-xl max-w-4xl mx-auto border border-indigo-700", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-3xl font-bold mb-6", children: "Begin Your Journey to Freedom Today" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 795,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xl mb-8 max-w-2xl mx-auto", children: [
        "Join thousands of users who have successfully quit smoking without suffering from the energy crashes and mood swings that typically lead to relapse.",
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "block text-indigo-200 mt-2", children: "Quitting doesn't have to be miserable. Start with Mission Fresh today." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 799,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 796,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-indigo-800 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Database, { className: "h-7 w-7 text-indigo-300" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 805,
            columnNumber: 19
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 804,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold mb-1", children: "Secure Data Storage" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 807,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-indigo-200", children: "All your progress is securely stored and synced across devices" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 808,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 803,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-indigo-800 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-7 w-7 text-indigo-300" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 813,
            columnNumber: 19
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 812,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold mb-1", children: "Personalized Methods" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 815,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-indigo-200", children: "Choose from 6 different quitting strategies tailored to your needs" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 816,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 811,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-indigo-800 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheckBig, { className: "h-7 w-7 text-indigo-300" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 821,
            columnNumber: 19
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 820,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold mb-1", children: "Comprehensive Support" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 823,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-indigo-200", children: "Energy, mood, and craving management all in one app" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 824,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 819,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 802,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          size: "lg",
          onClick: handleGetStarted,
          className: "bg-white text-indigo-900 hover:bg-indigo-100 px-8",
          children: "Begin Your Quit Journey Now"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 828,
          columnNumber: 13
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 794,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 793,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 792,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "px-6 py-10 bg-green-50 dark:bg-green-900/20", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-3xl font-bold text-green-800 dark:text-green-400 mb-4", children: "Explore Our Quit Smoking Resources" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 842,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto", children: "Mission Fresh offers comprehensive resources to support your journey to becoming smoke-free, including directories of products that can help manage cravings and reduce withdrawal symptoms." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 845,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 841,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-green-100 dark:border-green-800 hover:shadow-lg transition-shadow", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-1 bg-gradient-to-r from-green-400 to-green-600" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 853,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 mb-4 mx-auto", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cigarette, { className: "h-6 w-6" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 856,
              columnNumber: 19
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 855,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-bold text-center text-green-700 dark:text-green-500 mb-2", children: "NRT Directory" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 858,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-300 text-center mb-4", children: "Browse our comprehensive directory of FDA-approved Nicotine Replacement Therapy products, including patches, gums, lozenges, inhalers, and sprays." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 859,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "text-sm space-y-2 mb-6", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 865,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Detailed product information and user reviews" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 866,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 864,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 869,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Compare effectiveness for different types of smokers" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 870,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 868,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 873,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Find where to purchase with trusted vendors" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 874,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 872,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 863,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Link, { to: "/app/nrt-directory", className: "inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500", children: "Explore NRT Products" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 878,
              columnNumber: 19
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 877,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 854,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 852,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-green-100 dark:border-green-800 hover:shadow-lg transition-shadow", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-1 bg-gradient-to-r from-green-400 to-green-600" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 886,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 mb-4 mx-auto", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-6 w-6" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 889,
              columnNumber: 19
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 888,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-bold text-center text-green-700 dark:text-green-500 mb-2", children: "Alternative Products" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 891,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-300 text-center mb-4", children: "Discover tobacco-free alternatives that can help you manage nicotine cravings while avoiding the harmful effects of tobacco smoke." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 892,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "text-sm space-y-2 mb-6", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 898,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Smoke-free nicotine pouches, lozenges, and more" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 899,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 897,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 902,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "User reviews and ratings from the community" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 903,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 901,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 906,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Find products that fit your lifestyle and preferences" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                  lineNumber: 907,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
                lineNumber: 905,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 896,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Link, { to: "/app/alternative-products", className: "inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500", children: "Explore Alternatives" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 911,
              columnNumber: 19
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
              lineNumber: 910,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
            lineNumber: 887,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
          lineNumber: 885,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
        lineNumber: 851,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 840,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
      lineNumber: 839,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LandingPage.tsx",
    lineNumber: 31,
    columnNumber: 5
  }, globalThis);
};

const getVendors = async (countryCode, session) => {
  try {
    const response = await fetch(
      `${"https://zoubqdwxemivxrjruvam.supabase.co"}/rest/v1/mission4_vendors?select=*&countries=cs.{${countryCode}}`,
      {
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs",
          "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs"}`,
          "Content-Type": "application/json"
        }
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch vendors");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
};
const getCountryInfo = async (countryCode, session) => {
  try {
    const response = await fetch(
      `${"https://zoubqdwxemivxrjruvam.supabase.co"}/rest/v1/mission4_country_regulations?code=eq.${countryCode}&select=*`,
      {
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs",
          "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs"}`,
          "Content-Type": "application/json"
        }
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch country information");
    }
    const results = await response.json();
    return results[0];
  } catch (error) {
    console.error("Error fetching country information:", error);
    throw error;
  }
};
const trackAffiliateClick = async (click, session) => {
  try {
    await fetch(
      `${"https://zoubqdwxemivxrjruvam.supabase.co"}/rest/v1/mission4_affiliate_clicks`,
      {
        method: "POST",
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs",
          "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs"}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          ...click,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      }
    );
  } catch (error) {
    console.error("Error tracking affiliate click:", error);
  }
};
const getBestPrice = async (productId, countryCode, session) => {
  try {
    const response = await fetch(
      `${"https://zoubqdwxemivxrjruvam.supabase.co"}/rest/v1/rpc/mission4_get_best_price`,
      {
        method: "POST",
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs",
          "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs"}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          p_product_id: productId,
          p_country_code: countryCode
        })
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch best price");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching best price:", error);
    throw error;
  }
};
const getHealthImpactDetails = async (productId, session) => {
  try {
    const response = await fetch(
      `${"https://zoubqdwxemivxrjruvam.supabase.co"}/rest/v1/rpc/mission4_get_health_impact_details`,
      {
        method: "POST",
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs",
          "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs"}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          p_product_id: productId
        })
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch health impact details");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching health impact details:", error);
    throw error;
  }
};

const {useState: useState$b,useEffect: useEffect$a} = await importShared('react');
const ProductDetails = ({ product, session, onBack }) => {
  const [selectedVariant, setSelectedVariant] = useState$b(product.variants[0]);
  const [selectedCountry, setSelectedCountry] = useState$b("US");
  const [countryInfo, setCountryInfo] = useState$b(null);
  const [vendors, setVendors] = useState$b([]);
  const [healthDetails, setHealthDetails] = useState$b(null);
  const [bestPrice, setBestPrice] = useState$b(null);
  const [loading, setLoading] = useState$b(false);
  useEffect$a(() => {
    const loadData = async () => {
      if (!session)
        return;
      setLoading(true);
      try {
        const [healthData, countryData, vendorData, priceData] = await Promise.all([
          getHealthImpactDetails(product.id, session),
          getCountryInfo(selectedCountry, session),
          getVendors(selectedCountry, session),
          getBestPrice(product.id, selectedCountry, session)
        ]);
        setHealthDetails(healthData);
        setCountryInfo(countryData);
        setVendors(vendorData);
        setBestPrice(priceData);
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [product.id, selectedCountry, session]);
  const handleBuyClick = async (vendor) => {
    if (!session)
      return;
    await trackAffiliateClick({
      productId: product.id,
      variantId: selectedVariant.id,
      vendorId: vendor.id,
      userId: session.user.id,
      device: "web",
      country: selectedCountry
    }, session);
    window.open(
      `${vendor.website}/products/${product.id}?ref=${vendor.affiliateId}`,
      "_blank"
    );
  };
  const renderHealthImpact = () => {
    const { healthImpact } = product;
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5 text-pink-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 133,
            columnNumber: 13
          }, globalThis),
          "Health Impact Assessment"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 132,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Comprehensive analysis of potential health effects" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 136,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 131,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "font-medium", children: "Gum Health Impact" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 144,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: healthImpact.gumHealth.rating > 7 ? "success" : healthImpact.gumHealth.rating > 4 ? "warning" : "destructive", children: [
              healthImpact.gumHealth.rating,
              "/10"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 145,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 143,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: healthImpact.gumHealth.rating * 10, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 152,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "mt-2 space-y-1", children: healthImpact.gumHealth.factors.map((factor, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TriangleAlert, { className: `h-4 w-4 flex-shrink-0 ${factor.severity === "high" ? "text-red-500" : factor.severity === "moderate" ? "text-yellow-500" : "text-blue-500"}` }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 156,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: factor.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 161,
              columnNumber: 19
            }, globalThis)
          ] }, idx, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 155,
            columnNumber: 17
          }, globalThis)) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 153,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 142,
          columnNumber: 11
        }, globalThis),
        healthDetails?.chemicalDetails && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium", children: "Chemical Analysis" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 170,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid gap-2", children: healthDetails.chemicalDetails.map((chemical, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "p-3", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h5", { className: "font-medium", children: chemical.name }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 176,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: chemical.description }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 177,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 175,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: chemical.warningLevel === "high" ? "destructive" : chemical.warningLevel === "moderate" ? "warning" : "outline", children: chemical.category }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 181,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 174,
            columnNumber: 21
          }, globalThis) }, idx, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 173,
            columnNumber: 19
          }, globalThis)) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 171,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 169,
          columnNumber: 13
        }, globalThis),
        healthDetails?.clinicalStudies && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium", children: "Clinical Research" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 198,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid gap-2", children: healthDetails.clinicalStudies.map((study, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "p-3", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h5", { className: "font-medium", children: study.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 202,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: study.findings }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 203,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              "a",
              {
                href: study.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center gap-1",
                children: [
                  "View Study ",
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ExternalLink, { className: "h-3 w-3" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 212,
                    columnNumber: 34
                  }, globalThis)
                ]
              },
              void 0,
              true,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 206,
                columnNumber: 21
              },
              globalThis
            )
          ] }, idx, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 201,
            columnNumber: 19
          }, globalThis)) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 199,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 197,
          columnNumber: 13
        }, globalThis),
        healthDetails?.safetyRecommendations && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Shield, { className: "h-4 w-4 text-green-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 224,
              columnNumber: 17
            }, globalThis),
            "Safety Recommendations"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 223,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "space-y-1", children: healthDetails.safetyRecommendations.map((rec, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500 flex-shrink-0" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 230,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: rec }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 231,
              columnNumber: 21
            }, globalThis)
          ] }, idx, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 229,
            columnNumber: 19
          }, globalThis)) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 227,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 222,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 140,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
      lineNumber: 130,
      columnNumber: 7
    }, globalThis);
  };
  const renderVendorComparison = () => {
    if (!vendors.length)
      return null;
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ShoppingBag, { className: "h-5 w-5 text-blue-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 250,
            columnNumber: 13
          }, globalThis),
          "Where to Buy"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 249,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Compare prices and shipping options across vendors" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 253,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 248,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Select, { value: selectedCountry, onValueChange: setSelectedCountry, children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Select country" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 263,
              columnNumber: 19
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 262,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: vendors.map((vendor) => vendor.countries.map((country) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: country, children: country }, country, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 268,
              columnNumber: 23
            }, globalThis))) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 265,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 261,
            columnNumber: 15
          }, globalThis),
          countryInfo && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Alert, { className: "flex-1", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TriangleAlert, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 278,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AlertTitle, { children: "Regulatory Information" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 279,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AlertDescription, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "list-disc pl-5 text-sm", children: countryInfo.restrictions.map((restriction, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: restriction }, idx, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 283,
              columnNumber: 25
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 281,
              columnNumber: 21
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 280,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 277,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 260,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid gap-4", children: vendors.map((vendor) => {
          const price = selectedVariant.price[vendor.id];
          const inStock = selectedVariant.inStock[vendor.id];
          const deliveryInfo = vendor.deliveryInfo[selectedCountry];
          return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "p-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium flex items-center gap-2", children: [
                  vendor.name,
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", className: "text-xs", children: [
                    vendor.rating.toFixed(1),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Star, { className: "h-3 w-3 ml-1 fill-current" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                      lineNumber: 306,
                      columnNumber: 29
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 304,
                    columnNumber: 27
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 302,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                  vendor.reviews,
                  " verified reviews"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 309,
                  columnNumber: 25
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 301,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-lg font-bold", children: [
                  "$",
                  price.toFixed(2)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 314,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                  "+ $",
                  deliveryInfo.cost,
                  " shipping"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 315,
                  columnNumber: 25
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 313,
                columnNumber: 23
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 300,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: inStock ? "success" : "secondary", children: inStock ? "In Stock" : "Out of Stock" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 323,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Truck, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 327,
                    columnNumber: 27
                  }, globalThis),
                  deliveryInfo.shippingTime
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 326,
                  columnNumber: 25
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 322,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  onClick: () => handleBuyClick(vendor),
                  disabled: !inStock,
                  children: "Buy Now"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 331,
                  columnNumber: 23
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 321,
              columnNumber: 21
            }, globalThis),
            deliveryInfo.freeShippingThreshold && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: [
              "Free shipping on orders over $",
              deliveryInfo.freeShippingThreshold
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 340,
              columnNumber: 23
            }, globalThis)
          ] }, vendor.id, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 299,
            columnNumber: 19
          }, globalThis);
        }) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 292,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 258,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 257,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
      lineNumber: 247,
      columnNumber: 7
    }, globalThis);
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      Button,
      {
        variant: "ghost",
        onClick: onBack,
        className: "mb-4",
        children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChevronLeft, { className: "h-4 w-4 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 362,
            columnNumber: 9
          }, globalThis),
          "Back to Directory"
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 357,
        columnNumber: 7
      },
      globalThis
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        "img",
        {
          src: product.image,
          alt: product.name,
          className: "w-32 h-32 object-cover rounded-lg"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 368,
          columnNumber: 9
        },
        globalThis
      ),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-2xl font-bold", children: product.name }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 374,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: product.brand }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 375,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2 mt-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: product.type }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 377,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: product.category }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 378,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 376,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mt-4", children: product.description }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 380,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 373,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
      lineNumber: 367,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "overview", className: "mt-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "overview", children: "Overview" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 386,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "health", children: "Health Impact" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 387,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "purchase", children: "Where to Buy" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 388,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 385,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "overview", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Info, { className: "h-5 w-5 text-blue-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 397,
              columnNumber: 19
            }, globalThis),
            "Key Features"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 396,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 395,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "space-y-3", children: product.features.map((feature, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-green-500 mt-1" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 405,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: feature }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 406,
              columnNumber: 23
            }, globalThis)
          ] }, idx, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 404,
            columnNumber: 21
          }, globalThis)) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 402,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 401,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 394,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Shield, { className: "h-5 w-5 text-green-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 417,
              columnNumber: 19
            }, globalThis),
            "Usage Guidelines"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 416,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 415,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Instructions" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 423,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: product.usage.instructions }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 424,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 422,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Recommended Duration" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 429,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: product.usage.duration }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 430,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 428,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Maximum Daily Use" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 435,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "info", children: [
                "Maximum ",
                product.usage.maxDaily,
                " per day"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 436,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 434,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Important Warnings" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 441,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "space-y-2", children: product.usage.warnings.map((warning, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "flex items-start gap-2 text-sm", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TriangleAlert, { className: "h-4 w-4 text-yellow-500 flex-shrink-0" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 445,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: warning }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 446,
                  columnNumber: 25
                }, globalThis)
              ] }, idx, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 444,
                columnNumber: 23
              }, globalThis)) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 442,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 440,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 421,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 414,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Layers, { className: "h-5 w-5 text-purple-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 458,
              columnNumber: 19
            }, globalThis),
            "Available Options"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 457,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 456,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Select,
              {
                value: selectedVariant.id,
                onValueChange: (value) => {
                  const variant = product.variants.find((v) => v.id === value);
                  if (variant)
                    setSelectedVariant(variant);
                },
                children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Select variant" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 473,
                    columnNumber: 25
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 472,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: product.variants.map((variant) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: variant.id, children: [
                    variant.name,
                    " - ",
                    variant.strength,
                    "mg",
                    variant.flavor && ` (${variant.flavor})`
                  ] }, variant.id, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 477,
                    columnNumber: 27
                  }, globalThis)) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 475,
                    columnNumber: 23
                  }, globalThis)
                ]
              },
              void 0,
              true,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 465,
                columnNumber: 21
              },
              globalThis
            ) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 464,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "pt-4 border-t", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Selected Variant Details" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 487,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dl", { className: "space-y-2 text-sm", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dt", { className: "text-gray-600 dark:text-gray-400", children: "Strength:" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 490,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dd", { className: "font-medium", children: [
                    selectedVariant.strength,
                    "mg"
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 491,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 489,
                  columnNumber: 23
                }, globalThis),
                selectedVariant.flavor && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dt", { className: "text-gray-600 dark:text-gray-400", children: "Flavor:" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 495,
                    columnNumber: 27
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dd", { className: "font-medium", children: selectedVariant.flavor }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 496,
                    columnNumber: 27
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 494,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dt", { className: "text-gray-600 dark:text-gray-400", children: "Size:" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 500,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dd", { className: "font-medium", children: selectedVariant.size }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 501,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 499,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 488,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 486,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 463,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 462,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 455,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Award, { className: "h-5 w-5 text-yellow-500" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 513,
              columnNumber: 19
            }, globalThis),
            "Certifications"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 512,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 511,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-2", children: product.certifications.map((cert, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: cert }, idx, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 520,
              columnNumber: 21
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 518,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-medium mb-2", children: "Manufacturer Information" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 526,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dl", { className: "space-y-2 text-sm", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dt", { className: "text-gray-600 dark:text-gray-400", children: "Manufacturer:" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 529,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dd", { className: "font-medium", children: product.manufacturerInfo.name }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 530,
                    columnNumber: 23
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 528,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dt", { className: "text-gray-600 dark:text-gray-400", children: "Country of Origin:" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 533,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("dd", { className: "font-medium", children: product.manufacturerInfo.country }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 534,
                    columnNumber: 23
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 532,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "pt-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  "a",
                  {
                    href: product.manufacturerInfo.website,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1",
                    children: [
                      "Visit Manufacturer Website",
                      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ExternalLink, { className: "h-3 w-3" }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                        lineNumber: 544,
                        columnNumber: 25
                      }, globalThis)
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                    lineNumber: 537,
                    columnNumber: 23
                  },
                  globalThis
                ) }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                  lineNumber: 536,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
                lineNumber: 527,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
              lineNumber: 525,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
            lineNumber: 517,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
          lineNumber: 510,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 392,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 391,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "health", children: renderHealthImpact() }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 554,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "purchase", children: renderVendorComparison() }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
        lineNumber: 558,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
      lineNumber: 384,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/NRTDirectory/ProductDetails.tsx",
    lineNumber: 355,
    columnNumber: 5
  }, globalThis);
};

const mapToNRTProduct = (product) => {
  const defaultVariant = {
    id: `${product.id}-default`,
    name: product.name,
    strength: product.nicotine_strength,
    size: "Standard",
    price: {},
    inStock: {}
  };
  const healthImpact = {
    gumHealth: {
      rating: product.gum_health_rating || 5,
      factors: [{
        issue: "Generic impact",
        severity: product.gum_health_rating && product.gum_health_rating > 7 ? "low" : product.gum_health_rating && product.gum_health_rating > 4 ? "moderate" : "high",
        description: "Standard usage impact on gum health"
      }]
    },
    oralHealth: {
      rating: product.health_impact_rating || 5,
      concerns: product.chemicals_of_concern || []
    },
    systemicEffects: [{
      description: "Standard systemic effects based on product type",
      riskLevel: product.health_impact_rating && product.health_impact_rating > 7 ? "low" : product.health_impact_rating && product.health_impact_rating > 4 ? "moderate" : "high"
    }]
  };
  const chemicals = (product.chemicals_of_concern || []).map((chemical) => ({
    name: chemical,
    category: "concern",
    description: `Chemical found in ${product.name}`,
    effects: [],
    warningLevel: "moderate",
    references: []
  }));
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    type: product.category,
    category: "nrt",
    description: product.description || "",
    image: product.image_url || "/placeholder-product.png",
    variants: [defaultVariant],
    rating: product.average_rating || 0,
    reviews: product.total_reviews || 0,
    chemicals,
    healthImpact,
    usage: {
      instructions: "Follow manufacturer's instructions for use",
      duration: "As directed by healthcare provider",
      maxDaily: 20,
      // Default value
      warnings: product.warnings || []
    },
    features: [],
    pros: [],
    cons: [],
    bestFor: [],
    certifications: [],
    manufacturerInfo: {
      name: product.brand,
      country: "Not specified",
      website: ""
    }
  };
};

const {useContext: useContext$2} = await importShared('react');
const useAuth = () => {
  const context = useContext$2(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { session, setSession, isLoading, signIn: contextSignIn } = context;
  const signIn = async (email, password) => {
    try {
      const response = await supabaseRestCall("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password })
      }, null);
      if (!response.access_token) {
        throw new Error("Login failed");
      }
      const newSession = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_at: Math.floor(Date.now() / 1e3) + response.expires_in,
        expires_in: response.expires_in,
        token_type: "bearer",
        user: response.user
      };
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  return {
    session,
    isLoading,
    signIn
  };
};

const supabaseUrl = "https://zoubqdwxemivxrjruvam.supabase.co" ;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs" ;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getAllChallenges = async () => {
  const { data, error } = await supabase.from("challenges").select("*").order("start_date", { ascending: false });
  if (error) {
    console.error("Error fetching challenges:", error);
    throw new Error("Failed to fetch challenges");
  }
  return data || [];
};
const getChallengeTasks = async (challengeId) => {
  const { data, error } = await supabase.from("challenge_tasks").select("*").eq("challenge_id", challengeId);
  if (error) {
    console.error("Error fetching challenge tasks:", error);
    throw new Error("Failed to fetch challenge tasks");
  }
  return data || [];
};
const getAllUserProgress = async (userId) => {
  const { data, error } = await supabase.from("challenge_progress").select("*").eq("user_id", userId);
  if (error) {
    console.error("Error fetching user progress:", error);
    throw new Error("Failed to fetch user progress");
  }
  return data || [];
};
const joinChallenge = async (userId, challengeId) => {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data, error } = await supabase.from("challenge_progress").insert({
    user_id: userId,
    challenge_id: challengeId,
    joined_at: now,
    completed_tasks: [],
    status: "in_progress",
    updated_at: now
  }).select().single();
  if (error) {
    console.error("Error joining challenge:", error);
    throw new Error("Failed to join challenge");
  }
  await supabase.rpc("increment_participants", { challenge_id: challengeId });
  return data;
};
const completeTask = async (progressId, taskId, completedTasks) => {
  if (!completedTasks.includes(taskId)) {
    completedTasks.push(taskId);
  }
  const { data, error } = await supabase.from("challenge_progress").update({
    completed_tasks: completedTasks,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", progressId).select().single();
  if (error) {
    console.error("Error completing task:", error);
    throw new Error("Failed to complete task");
  }
  return data;
};
const checkChallengeCompletion = async (progressId, challengeId, completedTasks) => {
  const tasks = await getChallengeTasks(challengeId);
  const allTasksCompleted = tasks.every(
    (task) => completedTasks.includes(task.id)
  );
  if (allTasksCompleted) {
    const { error } = await supabase.from("challenge_progress").update({
      status: "completed",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", progressId);
    if (error) {
      console.error("Error updating challenge status:", error);
      throw new Error("Failed to update challenge status");
    }
    return true;
  }
  return false;
};
const awardChallengePoints = async (userId, points) => {
  const { data: profileData, error: profileError } = await supabase.from("profiles").select("points").eq("id", userId).single();
  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    throw new Error("Failed to fetch user profile");
  }
  const currentPoints = profileData?.points || 0;
  const newPoints = currentPoints + points;
  const { error } = await supabase.from("profiles").update({ points: newPoints }).eq("id", userId);
  if (error) {
    console.error("Error updating user points:", error);
    throw new Error("Failed to update user points");
  }
};

const {useState: useState$a,useEffect: useEffect$9} = await importShared('react');
const SkeletonItem = ({ className }) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: `animate-pulse bg-muted ${className}` }, void 0, false, {
  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
  lineNumber: 27,
  columnNumber: 3
}, globalThis);
function CommunityChallenges() {
  const { session, user } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState$a([]);
  const [completedChallenges, setCompletedChallenges] = useState$a([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState$a([]);
  const [isLoading, setIsLoading] = useState$a(true);
  const [selectedChallenge, setSelectedChallenge] = useState$a(null);
  const [userProgress, setUserProgress] = useState$a({});
  const [activeTab, setActiveTab] = useState$a("active");
  useEffect$9(() => {
    fetchChallenges();
  }, [session]);
  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      if (!session || !user) {
        console.error("No authenticated user");
        setIsLoading(false);
        return;
      }
      const userId = user.id;
      const challenges = await getAllChallenges();
      const tasksPromises = challenges.map(
        (challenge) => getChallengeTasks(challenge.id)
      );
      const tasksResults = await Promise.all(tasksPromises);
      challenges.forEach((challenge, index) => {
        challenge.tasks = tasksResults[index];
      });
      const progressData = await getAllUserProgress(userId);
      const progressMap = {};
      progressData.forEach((progress) => {
        progressMap[progress.challenge_id] = progress;
      });
      setUserProgress(progressMap);
      const now = /* @__PURE__ */ new Date();
      const active = [];
      const completed = [];
      const upcoming = [];
      challenges.forEach((challenge) => {
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        const progress = progressMap[challenge.id];
        if (progress && progress.status === "completed") {
          completed.push(challenge);
        } else if (now < startDate) {
          upcoming.push(challenge);
        } else if (now >= startDate && now <= endDate) {
          active.push(challenge);
        }
      });
      setActiveChallenges(active);
      setCompletedChallenges(completed);
      setUpcomingChallenges(upcoming);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      Jt.error("Failed to load challenges");
    } finally {
      setIsLoading(false);
    }
  };
  const joinChallenge$1 = async (challengeId) => {
    try {
      if (!user) {
        Jt.error("You need to be logged in to join a challenge");
        return;
      }
      const progress = await joinChallenge(user.id, challengeId);
      setUserProgress((prev) => ({
        ...prev,
        [challengeId]: progress
      }));
      Jt.success("Successfully joined the challenge!");
      fetchChallenges();
    } catch (error) {
      console.error("Error joining challenge:", error);
      Jt.error("Failed to join challenge");
    }
  };
  const completeTask$1 = async (challengeId, taskId) => {
    try {
      const progress = userProgress[challengeId];
      if (!progress || !progress.id) {
        Jt.error("You must join this challenge first");
        return;
      }
      const completedTasks = [...progress.completed_tasks];
      const taskIndex = completedTasks.indexOf(taskId);
      if (taskIndex === -1) {
        completedTasks.push(taskId);
      } else {
        completedTasks.splice(taskIndex, 1);
      }
      const updatedProgress = await completeTask(progress.id, taskId, completedTasks);
      const allTasksCompleted = await checkChallengeCompletion(
        progress.id,
        challengeId,
        updatedProgress.completed_tasks
      );
      if (allTasksCompleted) {
        const challenge = [...activeChallenges, ...upcomingChallenges, ...completedChallenges].find((c) => c.id === challengeId);
        if (challenge) {
          await awardChallengePoints(user.id, challenge.reward_points);
          Jt.success(`Challenge completed! You earned ${challenge.reward_points} points!`);
        }
      } else {
        Jt.success("Task status updated!");
      }
      setUserProgress((prev) => ({
        ...prev,
        [challengeId]: updatedProgress
      }));
      fetchChallenges();
    } catch (error) {
      console.error("Error updating task:", error);
      Jt.error("Failed to update task status");
    }
  };
  const calculateProgress = (challenge) => {
    const progress = userProgress[challenge.id];
    if (!progress || !challenge.tasks || challenge.tasks.length === 0)
      return 0;
    return Math.round(progress.completed_tasks.length / challenge.tasks.length * 100);
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };
  const getTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = /* @__PURE__ */ new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays === 1)
      return "1 day";
    return `${diffDays} days`;
  };
  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
  };
  const handleBackClick = () => {
    setSelectedChallenge(null);
  };
  const handleTabChange = (value) => {
    setActiveTab(value);
  };
  if (selectedChallenge) {
    const progress = userProgress[selectedChallenge.id];
    const progressPercent = calculateProgress(selectedChallenge);
    const hasJoined = Boolean(progress);
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto p-4", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "ghost", onClick: handleBackClick, className: "mb-4", children: "← Back to Challenges" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 236,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-2xl", children: selectedChallenge.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 244,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: selectedChallenge.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 245,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 243,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: `${getDifficultyColor(selectedChallenge.difficulty)} text-white`, children: selectedChallenge.difficulty.charAt(0).toUpperCase() + selectedChallenge.difficulty.slice(1) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 247,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 242,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 241,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Users, { className: "mr-2 h-5 w-5 text-muted-foreground" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 256,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                selectedChallenge.participants_count,
                " participants"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 257,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 255,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "mr-2 h-5 w-5 text-muted-foreground" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 261,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                "Ends in ",
                getTimeRemaining(selectedChallenge.end_date)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 262,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 260,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "mr-2 h-5 w-5 text-muted-foreground" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 266,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                selectedChallenge.reward_points,
                " points"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 267,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 265,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 254,
            columnNumber: 13
          }, this),
          hasJoined && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Your progress" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 274,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                progressPercent,
                "%"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 275,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 273,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: progressPercent, className: "h-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 277,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 272,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium mb-4", children: "Challenge Tasks" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 282,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: selectedChallenge.tasks?.map((task) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              "div",
              {
                className: "flex items-center justify-between p-3 border rounded-md",
                children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                    hasJoined && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      "div",
                      {
                        className: `w-5 h-5 rounded border mr-3 flex items-center justify-center ${progress?.completed_tasks.includes(task.id) ? "bg-primary border-primary" : "border-gray-300"}`,
                        onClick: () => hasJoined && completeTask$1(selectedChallenge.id, task.id),
                        role: "checkbox",
                        "aria-checked": progress?.completed_tasks.includes(task.id),
                        tabIndex: 0,
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            hasJoined && completeTask$1(selectedChallenge.id, task.id);
                          }
                        },
                        children: progress?.completed_tasks.includes(task.id) && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4 text-white" }, void 0, false, {
                          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                          lineNumber: 308,
                          columnNumber: 29
                        }, this)
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                        lineNumber: 291,
                        columnNumber: 25
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: task.description }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                      lineNumber: 312,
                      columnNumber: 23
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                    lineNumber: 289,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: [
                    task.points,
                    " pts"
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                    lineNumber: 314,
                    columnNumber: 21
                  }, this)
                ]
              },
              task.id,
              true,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 285,
                columnNumber: 19
              },
              this
            )) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 283,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 281,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 253,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { children: !hasJoined ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Button,
          {
            className: "w-full",
            onClick: () => joinChallenge$1(selectedChallenge.id),
            children: "Join Challenge"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 323,
            columnNumber: 15
          },
          this
        ) : progress?.status === "completed" ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { disabled: true, className: "w-full bg-green-600", children: "Challenge Completed!" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 330,
          columnNumber: 15
        }, this) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { disabled: progressPercent === 100, className: "w-full", children: progressPercent === 100 ? "All Tasks Completed!" : "Continue Challenge" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 334,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 321,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 240,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
      lineNumber: 235,
      columnNumber: 7
    }, this);
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto p-4", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold mb-2", children: "Community Challenges" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 348,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Join challenges with the community to stay motivated on your quit smoking journey." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 349,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
      lineNumber: 347,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "active", value: activeTab, onValueChange: handleTabChange, children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "mb-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "active", children: "Active" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 356,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "upcoming", children: "Upcoming" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 357,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "completed", children: "Completed" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 358,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 355,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "active", children: isLoading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-8 w-3/4 mb-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 367,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-4 w-full" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 368,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 366,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-20 w-full mb-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 371,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-4 w-2/3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 372,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 370,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-10 w-full" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 375,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 374,
          columnNumber: 19
        }, this)
      ] }, i, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 365,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 363,
        columnNumber: 13
      }, this) : activeChallenges.length === 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center p-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleAlert, { className: "mx-auto h-12 w-12 text-muted-foreground mb-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 382,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium", children: "No active challenges" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 383,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Check back later or view upcoming challenges." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 384,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 381,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: activeChallenges.map((challenge) => {
        const progress = userProgress[challenge.id];
        const progressPercent = calculateProgress(challenge);
        const hasJoined = Boolean(progress);
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-xl mb-2", children: challenge.title }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 397,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: `${getDifficultyColor(challenge.difficulty)} text-white`, children: challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 398,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 396,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: challenge.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 402,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 395,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-4 text-sm", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Users, { className: "mr-1 h-4 w-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 408,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: challenge.participants_count }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 409,
                  columnNumber: 27
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 407,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "mr-1 h-4 w-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 412,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: getTimeRemaining(challenge.end_date) }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 413,
                  columnNumber: 27
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 411,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "mr-1 h-4 w-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 416,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                  challenge.reward_points,
                  " pts"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 417,
                  columnNumber: 27
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 415,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 406,
              columnNumber: 23
            }, this),
            hasJoined && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-1 text-sm", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Your progress" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 424,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                  progressPercent,
                  "%"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                  lineNumber: 425,
                  columnNumber: 29
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 423,
                columnNumber: 27
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: progressPercent, className: "h-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 427,
                columnNumber: 27
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 422,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Button,
              {
                variant: "outline",
                className: "w-full",
                onClick: () => handleChallengeClick(challenge),
                children: "View Details"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 432,
                columnNumber: 25
              },
              this
            ) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 431,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 405,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { children: !hasJoined ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              className: "w-full",
              onClick: () => joinChallenge$1(challenge.id),
              children: "Join Challenge"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 444,
              columnNumber: 25
            },
            this
          ) : progress?.status === "completed" ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { disabled: true, className: "w-full bg-green-600", children: "Completed!" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 451,
            columnNumber: 25
          }, this) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { className: "w-full", onClick: () => handleChallengeClick(challenge), children: "Continue" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 455,
            columnNumber: 25
          }, this) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 442,
            columnNumber: 21
          }, this)
        ] }, challenge.id, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 394,
          columnNumber: 19
        }, this);
      }) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 387,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 361,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "upcoming", children: isLoading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [1, 2].map((i) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-8 w-3/4 mb-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 473,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-4 w-full" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 474,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 472,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-20 w-full mb-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 477,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-4 w-2/3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 478,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 476,
          columnNumber: 19
        }, this)
      ] }, i, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 471,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 469,
        columnNumber: 13
      }, this) : upcomingChallenges.length === 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center p-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleAlert, { className: "mx-auto h-12 w-12 text-muted-foreground mb-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 485,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium", children: "No upcoming challenges" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 486,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Check back later for new challenges." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 487,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 484,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: upcomingChallenges.map((challenge) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-xl mb-2", children: challenge.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 495,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: `${getDifficultyColor(challenge.difficulty)} text-white`, children: challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 496,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 494,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: challenge.description }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 500,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 493,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-4 text-sm", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Calendar, { className: "mr-1 h-4 w-4 text-muted-foreground" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 506,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                "Starts: ",
                new Date(challenge.start_date).toLocaleDateString()
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 507,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 505,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "mr-1 h-4 w-4 text-muted-foreground" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 512,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                challenge.reward_points,
                " pts"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 513,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 511,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 504,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              className: "w-full",
              onClick: () => handleChallengeClick(challenge),
              children: "View Details"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 518,
              columnNumber: 23
            },
            this
          ) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 517,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 503,
          columnNumber: 19
        }, this)
      ] }, challenge.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 492,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 490,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 467,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "completed", children: isLoading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [1, 2].map((i) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-8 w-3/4 mb-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 539,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-4 w-full" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 540,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 538,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-20 w-full mb-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 543,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SkeletonItem, { className: "h-4 w-2/3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 544,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 542,
          columnNumber: 19
        }, this)
      ] }, i, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 537,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 535,
        columnNumber: 13
      }, this) : completedChallenges.length === 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center p-8", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleAlert, { className: "mx-auto h-12 w-12 text-muted-foreground mb-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 551,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium", children: "No completed challenges" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 552,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Join and complete challenges to see them here." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 553,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 550,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: completedChallenges.map((challenge) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-xl mb-2", children: challenge.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 561,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: "bg-green-600 text-white", children: "Completed" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 562,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 560,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: challenge.description }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 564,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 559,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-4 text-sm", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Calendar, { className: "mr-1 h-4 w-4 text-muted-foreground" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 570,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                "Completed: ",
                new Date(userProgress[challenge.id]?.updated_at || "").toLocaleDateString()
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 571,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 569,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "mr-1 h-4 w-4 text-green-600" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 578,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-green-600 font-medium", children: [
                "+",
                challenge.reward_points,
                " pts"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
                lineNumber: 579,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 577,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 568,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              className: "w-full",
              onClick: () => handleChallengeClick(challenge),
              children: "View Details"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
              lineNumber: 586,
              columnNumber: 23
            },
            this
          ) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
            lineNumber: 585,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
          lineNumber: 567,
          columnNumber: 19
        }, this)
      ] }, challenge.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 558,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 556,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
        lineNumber: 533,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
      lineNumber: 354,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/CommunityChallenges.tsx",
    lineNumber: 346,
    columnNumber: 5
  }, this);
}

// canvas-confetti v1.9.3 built on 2024-04-30T22:19:17.794Z
var module = {};

// source content
/* globals Map */

(function main(global, module, isWorker, workerSize) {
  var canUseWorker = !!(
    global.Worker &&
    global.Blob &&
    global.Promise &&
    global.OffscreenCanvas &&
    global.OffscreenCanvasRenderingContext2D &&
    global.HTMLCanvasElement &&
    global.HTMLCanvasElement.prototype.transferControlToOffscreen &&
    global.URL &&
    global.URL.createObjectURL);

  var canUsePaths = typeof Path2D === 'function' && typeof DOMMatrix === 'function';
  var canDrawBitmap = (function () {
    // this mostly supports ssr
    if (!global.OffscreenCanvas) {
      return false;
    }

    var canvas = new OffscreenCanvas(1, 1);
    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, 1, 1);
    var bitmap = canvas.transferToImageBitmap();

    try {
      ctx.createPattern(bitmap, 'no-repeat');
    } catch (e) {
      return false;
    }

    return true;
  })();

  function noop() {}

  // create a promise if it exists, otherwise, just
  // call the function directly
  function promise(func) {
    var ModulePromise = module.exports.Promise;
    var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;

    if (typeof Prom === 'function') {
      return new Prom(func);
    }

    func(noop, noop);

    return null;
  }

  var bitmapMapper = (function (skipTransform, map) {
    // see https://github.com/catdad/canvas-confetti/issues/209
    // creating canvases is actually pretty expensive, so we should create a
    // 1:1 map for bitmap:canvas, so that we can animate the confetti in
    // a performant manner, but also not store them forever so that we don't
    // have a memory leak
    return {
      transform: function(bitmap) {
        if (skipTransform) {
          return bitmap;
        }

        if (map.has(bitmap)) {
          return map.get(bitmap);
        }

        var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        map.set(bitmap, canvas);

        return canvas;
      },
      clear: function () {
        map.clear();
      }
    };
  })(canDrawBitmap, new Map());

  var raf = (function () {
    var TIME = Math.floor(1000 / 60);
    var frame, cancel;
    var frames = {};
    var lastFrameTime = 0;

    if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
      frame = function (cb) {
        var id = Math.random();

        frames[id] = requestAnimationFrame(function onFrame(time) {
          if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
            lastFrameTime = time;
            delete frames[id];

            cb();
          } else {
            frames[id] = requestAnimationFrame(onFrame);
          }
        });

        return id;
      };
      cancel = function (id) {
        if (frames[id]) {
          cancelAnimationFrame(frames[id]);
        }
      };
    } else {
      frame = function (cb) {
        return setTimeout(cb, TIME);
      };
      cancel = function (timer) {
        return clearTimeout(timer);
      };
    }

    return { frame: frame, cancel: cancel };
  }());

  var getWorker = (function () {
    var worker;
    var prom;
    var resolves = {};

    function decorate(worker) {
      function execute(options, callback) {
        worker.postMessage({ options: options || {}, callback: callback });
      }
      worker.init = function initWorker(canvas) {
        var offscreen = canvas.transferControlToOffscreen();
        worker.postMessage({ canvas: offscreen }, [offscreen]);
      };

      worker.fire = function fireWorker(options, size, done) {
        if (prom) {
          execute(options, null);
          return prom;
        }

        var id = Math.random().toString(36).slice(2);

        prom = promise(function (resolve) {
          function workerDone(msg) {
            if (msg.data.callback !== id) {
              return;
            }

            delete resolves[id];
            worker.removeEventListener('message', workerDone);

            prom = null;

            bitmapMapper.clear();

            done();
            resolve();
          }

          worker.addEventListener('message', workerDone);
          execute(options, id);

          resolves[id] = workerDone.bind(null, { data: { callback: id }});
        });

        return prom;
      };

      worker.reset = function resetWorker() {
        worker.postMessage({ reset: true });

        for (var id in resolves) {
          resolves[id]();
          delete resolves[id];
        }
      };
    }

    return function () {
      if (worker) {
        return worker;
      }

      if (!isWorker && canUseWorker) {
        var code = [
          'var CONFETTI, SIZE = {}, module = {};',
          '(' + main.toString() + ')(this, module, true, SIZE);',
          'onmessage = function(msg) {',
          '  if (msg.data.options) {',
          '    CONFETTI(msg.data.options).then(function () {',
          '      if (msg.data.callback) {',
          '        postMessage({ callback: msg.data.callback });',
          '      }',
          '    });',
          '  } else if (msg.data.reset) {',
          '    CONFETTI && CONFETTI.reset();',
          '  } else if (msg.data.resize) {',
          '    SIZE.width = msg.data.resize.width;',
          '    SIZE.height = msg.data.resize.height;',
          '  } else if (msg.data.canvas) {',
          '    SIZE.width = msg.data.canvas.width;',
          '    SIZE.height = msg.data.canvas.height;',
          '    CONFETTI = module.exports.create(msg.data.canvas);',
          '  }',
          '}',
        ].join('\n');
        try {
          worker = new Worker(URL.createObjectURL(new Blob([code])));
        } catch (e) {
          // eslint-disable-next-line no-console
          typeof console !== undefined && typeof console.warn === 'function' ? console.warn('🎊 Could not load worker', e) : null;

          return null;
        }

        decorate(worker);
      }

      return worker;
    };
  })();

  var defaults = {
    particleCount: 50,
    angle: 90,
    spread: 45,
    startVelocity: 45,
    decay: 0.9,
    gravity: 1,
    drift: 0,
    ticks: 200,
    x: 0.5,
    y: 0.5,
    shapes: ['square', 'circle'],
    zIndex: 100,
    colors: [
      '#26ccff',
      '#a25afd',
      '#ff5e7e',
      '#88ff5a',
      '#fcff42',
      '#ffa62d',
      '#ff36ff'
    ],
    // probably should be true, but back-compat
    disableForReducedMotion: false,
    scalar: 1
  };

  function convert(val, transform) {
    return transform ? transform(val) : val;
  }

  function isOk(val) {
    return !(val === null || val === undefined);
  }

  function prop(options, name, transform) {
    return convert(
      options && isOk(options[name]) ? options[name] : defaults[name],
      transform
    );
  }

  function onlyPositiveInt(number){
    return number < 0 ? 0 : Math.floor(number);
  }

  function randomInt(min, max) {
    // [min, max)
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function toDecimal(str) {
    return parseInt(str, 16);
  }

  function colorsToRgb(colors) {
    return colors.map(hexToRgb);
  }

  function hexToRgb(str) {
    var val = String(str).replace(/[^0-9a-f]/gi, '');

    if (val.length < 6) {
        val = val[0]+val[0]+val[1]+val[1]+val[2]+val[2];
    }

    return {
      r: toDecimal(val.substring(0,2)),
      g: toDecimal(val.substring(2,4)),
      b: toDecimal(val.substring(4,6))
    };
  }

  function getOrigin(options) {
    var origin = prop(options, 'origin', Object);
    origin.x = prop(origin, 'x', Number);
    origin.y = prop(origin, 'y', Number);

    return origin;
  }

  function setCanvasWindowSize(canvas) {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }

  function setCanvasRectSize(canvas) {
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function getCanvas(zIndex) {
    var canvas = document.createElement('canvas');

    canvas.style.position = 'fixed';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = zIndex;

    return canvas;
  }

  function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(radiusX, radiusY);
    context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
    context.restore();
  }

  function randomPhysics(opts) {
    var radAngle = opts.angle * (Math.PI / 180);
    var radSpread = opts.spread * (Math.PI / 180);

    return {
      x: opts.x,
      y: opts.y,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
      velocity: (opts.startVelocity * 0.5) + (Math.random() * opts.startVelocity),
      angle2D: -radAngle + ((0.5 * radSpread) - (Math.random() * radSpread)),
      tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
      color: opts.color,
      shape: opts.shape,
      tick: 0,
      totalTicks: opts.ticks,
      decay: opts.decay,
      drift: opts.drift,
      random: Math.random() + 2,
      tiltSin: 0,
      tiltCos: 0,
      wobbleX: 0,
      wobbleY: 0,
      gravity: opts.gravity * 3,
      ovalScalar: 0.6,
      scalar: opts.scalar,
      flat: opts.flat
    };
  }

  function updateFetti(context, fetti) {
    fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
    fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
    fetti.velocity *= fetti.decay;

    if (fetti.flat) {
      fetti.wobble = 0;
      fetti.wobbleX = fetti.x + (10 * fetti.scalar);
      fetti.wobbleY = fetti.y + (10 * fetti.scalar);

      fetti.tiltSin = 0;
      fetti.tiltCos = 0;
      fetti.random = 1;
    } else {
      fetti.wobble += fetti.wobbleSpeed;
      fetti.wobbleX = fetti.x + ((10 * fetti.scalar) * Math.cos(fetti.wobble));
      fetti.wobbleY = fetti.y + ((10 * fetti.scalar) * Math.sin(fetti.wobble));

      fetti.tiltAngle += 0.1;
      fetti.tiltSin = Math.sin(fetti.tiltAngle);
      fetti.tiltCos = Math.cos(fetti.tiltAngle);
      fetti.random = Math.random() + 2;
    }

    var progress = (fetti.tick++) / fetti.totalTicks;

    var x1 = fetti.x + (fetti.random * fetti.tiltCos);
    var y1 = fetti.y + (fetti.random * fetti.tiltSin);
    var x2 = fetti.wobbleX + (fetti.random * fetti.tiltCos);
    var y2 = fetti.wobbleY + (fetti.random * fetti.tiltSin);

    context.fillStyle = 'rgba(' + fetti.color.r + ', ' + fetti.color.g + ', ' + fetti.color.b + ', ' + (1 - progress) + ')';

    context.beginPath();

    if (canUsePaths && fetti.shape.type === 'path' && typeof fetti.shape.path === 'string' && Array.isArray(fetti.shape.matrix)) {
      context.fill(transformPath2D(
        fetti.shape.path,
        fetti.shape.matrix,
        fetti.x,
        fetti.y,
        Math.abs(x2 - x1) * 0.1,
        Math.abs(y2 - y1) * 0.1,
        Math.PI / 10 * fetti.wobble
      ));
    } else if (fetti.shape.type === 'bitmap') {
      var rotation = Math.PI / 10 * fetti.wobble;
      var scaleX = Math.abs(x2 - x1) * 0.1;
      var scaleY = Math.abs(y2 - y1) * 0.1;
      var width = fetti.shape.bitmap.width * fetti.scalar;
      var height = fetti.shape.bitmap.height * fetti.scalar;

      var matrix = new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        fetti.x,
        fetti.y
      ]);

      // apply the transform matrix from the confetti shape
      matrix.multiplySelf(new DOMMatrix(fetti.shape.matrix));

      var pattern = context.createPattern(bitmapMapper.transform(fetti.shape.bitmap), 'no-repeat');
      pattern.setTransform(matrix);

      context.globalAlpha = (1 - progress);
      context.fillStyle = pattern;
      context.fillRect(
        fetti.x - (width / 2),
        fetti.y - (height / 2),
        width,
        height
      );
      context.globalAlpha = 1;
    } else if (fetti.shape === 'circle') {
      context.ellipse ?
        context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) :
        ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
    } else if (fetti.shape === 'star') {
      var rot = Math.PI / 2 * 3;
      var innerRadius = 4 * fetti.scalar;
      var outerRadius = 8 * fetti.scalar;
      var x = fetti.x;
      var y = fetti.y;
      var spikes = 5;
      var step = Math.PI / spikes;

      while (spikes--) {
        x = fetti.x + Math.cos(rot) * outerRadius;
        y = fetti.y + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = fetti.x + Math.cos(rot) * innerRadius;
        y = fetti.y + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
    } else {
      context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
      context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
      context.lineTo(Math.floor(x2), Math.floor(y2));
      context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
    }

    context.closePath();
    context.fill();

    return fetti.tick < fetti.totalTicks;
  }

  function animate(canvas, fettis, resizer, size, done) {
    var animatingFettis = fettis.slice();
    var context = canvas.getContext('2d');
    var animationFrame;
    var destroy;

    var prom = promise(function (resolve) {
      function onDone() {
        animationFrame = destroy = null;

        context.clearRect(0, 0, size.width, size.height);
        bitmapMapper.clear();

        done();
        resolve();
      }

      function update() {
        if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
          size.width = canvas.width = workerSize.width;
          size.height = canvas.height = workerSize.height;
        }

        if (!size.width && !size.height) {
          resizer(canvas);
          size.width = canvas.width;
          size.height = canvas.height;
        }

        context.clearRect(0, 0, size.width, size.height);

        animatingFettis = animatingFettis.filter(function (fetti) {
          return updateFetti(context, fetti);
        });

        if (animatingFettis.length) {
          animationFrame = raf.frame(update);
        } else {
          onDone();
        }
      }

      animationFrame = raf.frame(update);
      destroy = onDone;
    });

    return {
      addFettis: function (fettis) {
        animatingFettis = animatingFettis.concat(fettis);

        return prom;
      },
      canvas: canvas,
      promise: prom,
      reset: function () {
        if (animationFrame) {
          raf.cancel(animationFrame);
        }

        if (destroy) {
          destroy();
        }
      }
    };
  }

  function confettiCannon(canvas, globalOpts) {
    var isLibCanvas = !canvas;
    var allowResize = !!prop(globalOpts || {}, 'resize');
    var hasResizeEventRegistered = false;
    var globalDisableForReducedMotion = prop(globalOpts, 'disableForReducedMotion', Boolean);
    var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, 'useWorker');
    var worker = shouldUseWorker ? getWorker() : null;
    var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
    var initialized = (canvas && worker) ? !!canvas.__confetti_initialized : false;
    var preferLessMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion)').matches;
    var animationObj;

    function fireLocal(options, size, done) {
      var particleCount = prop(options, 'particleCount', onlyPositiveInt);
      var angle = prop(options, 'angle', Number);
      var spread = prop(options, 'spread', Number);
      var startVelocity = prop(options, 'startVelocity', Number);
      var decay = prop(options, 'decay', Number);
      var gravity = prop(options, 'gravity', Number);
      var drift = prop(options, 'drift', Number);
      var colors = prop(options, 'colors', colorsToRgb);
      var ticks = prop(options, 'ticks', Number);
      var shapes = prop(options, 'shapes');
      var scalar = prop(options, 'scalar');
      var flat = !!prop(options, 'flat');
      var origin = getOrigin(options);

      var temp = particleCount;
      var fettis = [];

      var startX = canvas.width * origin.x;
      var startY = canvas.height * origin.y;

      while (temp--) {
        fettis.push(
          randomPhysics({
            x: startX,
            y: startY,
            angle: angle,
            spread: spread,
            startVelocity: startVelocity,
            color: colors[temp % colors.length],
            shape: shapes[randomInt(0, shapes.length)],
            ticks: ticks,
            decay: decay,
            gravity: gravity,
            drift: drift,
            scalar: scalar,
            flat: flat
          })
        );
      }

      // if we have a previous canvas already animating,
      // add to it
      if (animationObj) {
        return animationObj.addFettis(fettis);
      }

      animationObj = animate(canvas, fettis, resizer, size , done);

      return animationObj.promise;
    }

    function fire(options) {
      var disableForReducedMotion = globalDisableForReducedMotion || prop(options, 'disableForReducedMotion', Boolean);
      var zIndex = prop(options, 'zIndex', Number);

      if (disableForReducedMotion && preferLessMotion) {
        return promise(function (resolve) {
          resolve();
        });
      }

      if (isLibCanvas && animationObj) {
        // use existing canvas from in-progress animation
        canvas = animationObj.canvas;
      } else if (isLibCanvas && !canvas) {
        // create and initialize a new canvas
        canvas = getCanvas(zIndex);
        document.body.appendChild(canvas);
      }

      if (allowResize && !initialized) {
        // initialize the size of a user-supplied canvas
        resizer(canvas);
      }

      var size = {
        width: canvas.width,
        height: canvas.height
      };

      if (worker && !initialized) {
        worker.init(canvas);
      }

      initialized = true;

      if (worker) {
        canvas.__confetti_initialized = true;
      }

      function onResize() {
        if (worker) {
          // TODO this really shouldn't be immediate, because it is expensive
          var obj = {
            getBoundingClientRect: function () {
              if (!isLibCanvas) {
                return canvas.getBoundingClientRect();
              }
            }
          };

          resizer(obj);

          worker.postMessage({
            resize: {
              width: obj.width,
              height: obj.height
            }
          });
          return;
        }

        // don't actually query the size here, since this
        // can execute frequently and rapidly
        size.width = size.height = null;
      }

      function done() {
        animationObj = null;

        if (allowResize) {
          hasResizeEventRegistered = false;
          global.removeEventListener('resize', onResize);
        }

        if (isLibCanvas && canvas) {
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas); 
          }
          canvas = null;
          initialized = false;
        }
      }

      if (allowResize && !hasResizeEventRegistered) {
        hasResizeEventRegistered = true;
        global.addEventListener('resize', onResize, false);
      }

      if (worker) {
        return worker.fire(options, size, done);
      }

      return fireLocal(options, size, done);
    }

    fire.reset = function () {
      if (worker) {
        worker.reset();
      }

      if (animationObj) {
        animationObj.reset();
      }
    };

    return fire;
  }

  // Make default export lazy to defer worker creation until called.
  var defaultFire;
  function getDefaultFire() {
    if (!defaultFire) {
      defaultFire = confettiCannon(null, { useWorker: true, resize: true });
    }
    return defaultFire;
  }

  function transformPath2D(pathString, pathMatrix, x, y, scaleX, scaleY, rotation) {
    var path2d = new Path2D(pathString);

    var t1 = new Path2D();
    t1.addPath(path2d, new DOMMatrix(pathMatrix));

    var t2 = new Path2D();
    // see https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix/DOMMatrix
    t2.addPath(t1, new DOMMatrix([
      Math.cos(rotation) * scaleX,
      Math.sin(rotation) * scaleX,
      -Math.sin(rotation) * scaleY,
      Math.cos(rotation) * scaleY,
      x,
      y
    ]));

    return t2;
  }

  function shapeFromPath(pathData) {
    if (!canUsePaths) {
      throw new Error('path confetti are not supported in this browser');
    }

    var path, matrix;

    if (typeof pathData === 'string') {
      path = pathData;
    } else {
      path = pathData.path;
      matrix = pathData.matrix;
    }

    var path2d = new Path2D(path);
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');

    if (!matrix) {
      // attempt to figure out the width of the path, up to 1000x1000
      var maxSize = 1000;
      var minX = maxSize;
      var minY = maxSize;
      var maxX = 0;
      var maxY = 0;
      var width, height;

      // do some line skipping... this is faster than checking
      // every pixel and will be mostly still correct
      for (var x = 0; x < maxSize; x += 2) {
        for (var y = 0; y < maxSize; y += 2) {
          if (tempCtx.isPointInPath(path2d, x, y, 'nonzero')) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      width = maxX - minX;
      height = maxY - minY;

      var maxDesiredSize = 10;
      var scale = Math.min(maxDesiredSize/width, maxDesiredSize/height);

      matrix = [
        scale, 0, 0, scale,
        -Math.round((width/2) + minX) * scale,
        -Math.round((height/2) + minY) * scale
      ];
    }

    return {
      type: 'path',
      path: path,
      matrix: matrix
    };
  }

  function shapeFromText(textData) {
    var text,
        scalar = 1,
        color = '#000000',
        // see https://nolanlawson.com/2022/04/08/the-struggle-of-using-native-emoji-on-the-web/
        fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';

    if (typeof textData === 'string') {
      text = textData;
    } else {
      text = textData.text;
      scalar = 'scalar' in textData ? textData.scalar : scalar;
      fontFamily = 'fontFamily' in textData ? textData.fontFamily : fontFamily;
      color = 'color' in textData ? textData.color : color;
    }

    // all other confetti are 10 pixels,
    // so this pixel size is the de-facto 100% scale confetti
    var fontSize = 10 * scalar;
    var font = '' + fontSize + 'px ' + fontFamily;

    var canvas = new OffscreenCanvas(fontSize, fontSize);
    var ctx = canvas.getContext('2d');

    ctx.font = font;
    var size = ctx.measureText(text);
    var width = Math.ceil(size.actualBoundingBoxRight + size.actualBoundingBoxLeft);
    var height = Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent);

    var padding = 2;
    var x = size.actualBoundingBoxLeft + padding;
    var y = size.actualBoundingBoxAscent + padding;
    width += padding + padding;
    height += padding + padding;

    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d');
    ctx.font = font;
    ctx.fillStyle = color;

    ctx.fillText(text, x, y);

    var scale = 1 / scalar;

    return {
      type: 'bitmap',
      // TODO these probably need to be transfered for workers
      bitmap: canvas.transferToImageBitmap(),
      matrix: [scale, 0, 0, scale, -width * scale / 2, -height * scale / 2]
    };
  }

  module.exports = function() {
    return getDefaultFire().apply(this, arguments);
  };
  module.exports.reset = function() {
    getDefaultFire().reset();
  };
  module.exports.create = confettiCannon;
  module.exports.shapeFromPath = shapeFromPath;
  module.exports.shapeFromText = shapeFromText;
}((function () {
  if (typeof window !== 'undefined') {
    return window;
  }

  if (typeof self !== 'undefined') {
    return self;
  }

  return this || {};
})(), module, false));

// end source content

const confetti = module.exports;
module.exports.create;

const {useState: useState$9,useEffect: useEffect$8} = await importShared('react');
const Lungs = ({ size = 24, ...props }) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M6.081 20C6.026 20 5.971 20 5.916 20c-2.167-.146-3.972-1.87-4.101-4.035C1.486 8.522 2.4 3.578 4.65 2.05 5.483 1.563 6.542 1.998 6.85 2.85c.317.883-.126 2.797-.258 3.921C6.494 7.443 6.376 8.208 6.537 8.816c.281 1.065 1.664 7.383 1.45 9.492-.08.789-.797 1.692-1.906 1.692z" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 88,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 13c-1.715-2.148-4.524-3.037-6.837-3.557-.773-.173-1.543-.36-2.184-.673-1.992-.977-.753 2.694-.753 2.694" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 89,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M17.357 13c-.81 2.87-2.094 5.329-3.138 6.2-1.333 1.117-2.857 1.312-4.078 1.097M17.919 20C17.974 20 18.029 20 18.084 20c2.167-.146 3.972-1.87 4.101-4.035C22.514 8.522 21.6 3.578 19.35 2.05 18.517 1.563 17.458 1.998 17.15 2.85c-.317.883.126 2.797.258 3.921C17.506 7.443 17.624 8.208 17.463 8.816c-.281 1.065-1.664 7.383-1.45 9.492.08.789.797 1.692 1.906 1.692z" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 90,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12 13c1.715-2.148 4.524-3.037 6.837-3.557.773-.173 1.543-.36 2.184-.673 1.992-.977.753 2.694.753 2.694" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 91,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M6.643 13c.81 2.87 2.094 5.329 3.138 6.2 1.333 1.117 2.857 1.312 4.078 1.097" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 92,
        columnNumber: 5
      }, globalThis)
    ]
  },
  void 0,
  true,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 76,
    columnNumber: 3
  },
  globalThis
);
const Pocket = ({ size = 24, ...props }) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 110,
        columnNumber: 5
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "m8 10 4 4 4-4" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 111,
        columnNumber: 5
      }, globalThis)
    ]
  },
  void 0,
  true,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 98,
    columnNumber: 3
  },
  globalThis
);
function WindIcon(props) {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "svg",
    {
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
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 129,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M9.6 4.6A2 2 0 1 1 11 8H2" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 130,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12.6 19.4A2 2 0 1 0 14 16H2" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 131,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 118,
      columnNumber: 5
    },
    this
  );
}
const achievementIcons = {
  "milestones": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 155,
    columnNumber: 25
  }, globalThis), color: "text-amber-500" },
  "streaks": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Flame, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 156,
    columnNumber: 22
  }, globalThis), color: "text-red-500" },
  "health": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 157,
    columnNumber: 21
  }, globalThis), color: "text-rose-500" },
  "community": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Users, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 158,
    columnNumber: 24
  }, globalThis), color: "text-blue-500" },
  "activities": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 159,
    columnNumber: 25
  }, globalThis), color: "text-purple-500" },
  "holistic": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 160,
    columnNumber: 23
  }, globalThis), color: "text-green-500" },
  "special": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Star, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 161,
    columnNumber: 22
  }, globalThis), color: "text-amber-500" },
  "quitting_cold_turkey": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Pocket, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 162,
    columnNumber: 35
  }, globalThis), color: "text-blue-600" },
  "quitting_reduction": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowRight, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 163,
    columnNumber: 33
  }, globalThis), color: "text-emerald-500" },
  "quitting_nrt": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Lungs, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 164,
    columnNumber: 27
  }, globalThis), color: "text-indigo-500" },
  "energy": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BatteryFull, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 165,
    columnNumber: 21
  }, globalThis), color: "text-yellow-600" },
  "focus": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 166,
    columnNumber: 20
  }, globalThis), color: "text-violet-500" },
  "mood": { icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Laugh, { size: 24 }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 167,
    columnNumber: 19
  }, globalThis), color: "text-pink-500" }
};
const Achievements = ({
  session,
  onShareAchievement
}) => {
  const [achievements, setAchievements] = useState$9([]);
  const [loading, setLoading] = useState$9(true);
  const [activeTab, setActiveTab] = useState$9("all");
  const [selectedAchievement, setSelectedAchievement] = useState$9(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState$9(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState$9(null);
  const [points, setPoints] = useState$9(0);
  const [achievementStats, setAchievementStats] = useState$9({
    total: 0,
    unlocked: 0,
    percentage: 0
  });
  const [filteredAchievements, setFilteredAchievements] = useState$9([]);
  useEffect$8(() => {
    if (session?.user) {
      fetchAchievements();
    }
  }, [session]);
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${"https://zoubqdwxemivxrjruvam.supabase.co"}/rest/v1/game_achievements?user_id=eq.${session?.user.id}&select=*`,
        {
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs",
            "Authorization": `Bearer ${session?.access_token}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const processedAchievements = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: renderAchievementIcon(item.icon_name || "trophy"),
          progress: item.progress || 0,
          completed: item.completed || false,
          unlocked_at: item.unlocked_at,
          game_id: item.game_id
        }));
        setAchievements(processedAchievements);
        calculateStats(processedAchievements);
      } else {
        const sampleAchievements = getSampleAchievements();
        setAchievements(sampleAchievements);
        calculateStats(sampleAchievements);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      const sampleAchievements = getSampleAchievements();
      setAchievements(sampleAchievements);
      calculateStats(sampleAchievements);
    } finally {
      setLoading(false);
    }
  };
  const calculateStats = (achievementsList) => {
    const total = achievementsList.length;
    const unlocked = achievementsList.filter((a) => a.completed).length;
    const percentage = total > 0 ? Math.round(unlocked / total * 100) : 0;
    setAchievementStats({
      total,
      unlocked,
      percentage
    });
    const calculatedPoints = unlocked * 100;
    setPoints(calculatedPoints);
  };
  const getSampleAchievements = () => {
    return [
      {
        id: "fresh-start",
        title: "Fresh Start",
        description: "Begin your journey to a fresher life",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Star, { className: "h-6 w-6 text-yellow-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 300,
          columnNumber: 15
        }, globalThis),
        progress: 100,
        completed: true,
        unlocked_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "one-week-fresh",
        title: "One Week Fresh",
        description: "Complete one week of your fresh journey",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Calendar, { className: "h-6 w-6 text-blue-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 309,
          columnNumber: 15
        }, globalThis),
        progress: 70,
        completed: false
      },
      {
        id: "health-milestone",
        title: "Health Milestone",
        description: "Achieve your first health improvement",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-6 w-6 text-red-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 317,
          columnNumber: 15
        }, globalThis),
        progress: 100,
        completed: true,
        unlocked_at: new Date(Date.now() - 864e5).toISOString()
      },
      {
        id: "task-master",
        title: "Task Master",
        description: "Complete 10 tasks in your fresh journey",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheck, { className: "h-6 w-6 text-green-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 326,
          columnNumber: 15
        }, globalThis),
        progress: 80,
        completed: false
      },
      {
        id: "community-supporter",
        title: "Community Supporter",
        description: "Help another fresh user on their journey",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "h-6 w-6 text-blue-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 334,
          columnNumber: 15
        }, globalThis),
        progress: 0,
        completed: false
      },
      {
        id: "breathing-sessions",
        title: "Deep Breather",
        description: "Complete 5 breathing exercise sessions",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(WindIcon, { className: "h-6 w-6 text-blue-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 342,
          columnNumber: 15
        }, globalThis),
        progress: 60,
        completed: false,
        game_id: "breathing-exercise"
      },
      {
        id: "memory-games-played",
        title: "Mind Sharpener",
        description: "Play 10 memory card games",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-6 w-6 text-purple-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 351,
          columnNumber: 15
        }, globalThis),
        progress: 50,
        completed: false,
        game_id: "memory-cards"
      },
      {
        id: "daily-challenge",
        title: "Daily Challenger",
        description: "Complete a game every day for 7 days",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(WindIcon, { className: "h-6 w-6 text-green-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 360,
          columnNumber: 15
        }, globalThis),
        progress: 45,
        completed: false
      }
    ];
  };
  useEffect$8(() => {
    const filtered = activeTab === "all" ? achievements : activeTab === "unlocked" ? achievements.filter((a) => a.completed) : achievements.filter((a) => !a.completed);
    setFilteredAchievements(filtered);
  }, [activeTab, achievements]);
  const formatDate = (dateString) => {
    if (!dateString)
      return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  const handleShareAchievement = (achievement) => {
    if (onShareAchievement) {
      const achievementWithCategory = {
        ...achievement,
        category: "milestones"
      };
      onShareAchievement(achievementWithCategory);
    } else {
      const shareMessage = `I just earned the "${achievement.title}" achievement in Mission Fresh! ${achievement.description}`;
      if (navigator.share) {
        navigator.share({
          title: "Mission Fresh Achievement",
          text: shareMessage,
          url: window.location.origin
        }).catch((err) => {
          console.error("Error sharing:", err);
          navigator.clipboard.writeText(shareMessage).then(() => Jt.success("Copied to clipboard!")).catch((err2) => console.error("Could not copy text:", err2));
        });
      } else {
        navigator.clipboard.writeText(shareMessage).then(() => Jt.success("Copied to clipboard!")).catch((err) => console.error("Could not copy text:", err));
      }
    }
  };
  const renderAchievementIcon = (iconName) => {
    const iconInfo = achievementIcons[iconName] || achievementIcons["milestones"];
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: `p-2 rounded-full bg-primary/10 ${iconInfo.color}`, children: iconInfo.icon }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 493,
      columnNumber: 7
    }, globalThis);
  };
  const renderPersonalizedRecommendations = () => {
    const inProgressAchievements = achievements.filter((a) => a.progress > 0 && a.progress < 100 && !a.completed);
    const sortedAchievements = [...inProgressAchievements].sort((a, b) => b.progress - a.progress);
    const topAchievements = sortedAchievements.slice(0, 3);
    if (topAchievements.length === 0) {
      return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Recommendations" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 525,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Complete some activities to get personalized recommendations" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 526,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 524,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 523,
        columnNumber: 9
      }, globalThis);
    }
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Almost There!" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 535,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "These achievements are within your reach" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 536,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 534,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: topAchievements.map((achievement) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: achievement.icon }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 542,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: achievement.title }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 546,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: achievement.description }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 549,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: achievement.progress, className: "h-2 mt-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 552,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 545,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", children: [
          achievement.progress,
          "%"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 555,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 554,
          columnNumber: 17
        }, globalThis)
      ] }, achievement.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 541,
        columnNumber: 15
      }, globalThis)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 539,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 538,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full", children: "View All Achievements" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 562,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 561,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 533,
      columnNumber: 7
    }, globalThis);
  };
  const renderAchievementStatistics = () => {
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Your Achievement Stats" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 573,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Track your progress and milestones" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 574,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 572,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-2xl font-bold", children: achievementStats.unlocked }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 579,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Unlocked" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 580,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 578,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-2xl font-bold", children: achievementStats.total }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 583,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 584,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 582,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-2xl font-bold", children: [
              achievementStats.percentage,
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 587,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Complete" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 588,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 586,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 577,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium mb-1", children: "Overall Progress" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 592,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: achievementStats.percentage, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 593,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 591,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium mb-1", children: "Achievement Points" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 596,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-5 w-5 text-yellow-500 mr-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 598,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-lg font-bold", children: points }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 599,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 597,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 595,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 576,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 571,
      columnNumber: 7
    }, globalThis);
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "achievements-container", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold", children: "My Achievements" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 611,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500 dark:text-gray-400", children: "Track your progress and milestones on your fresh journey" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 612,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 610,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:col-span-2", children: renderAchievementStatistics() }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 616,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: renderPersonalizedRecommendations() }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 619,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 615,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "all", className: "w-full", onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "mb-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "all", children: "All Achievements" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 626,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "unlocked", children: "Unlocked" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 627,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "locked", children: "Locked" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 628,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 625,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "all", className: "mt-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: loading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "col-span-full flex justify-center items-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "Loading achievements..." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 635,
        columnNumber: 17
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 634,
        columnNumber: 15
      }, globalThis) : filteredAchievements.length > 0 ? filteredAchievements.map((achievement) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden transition-all hover:shadow-md", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "flex flex-row items-center gap-4 pb-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: achievement.icon }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 641,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-lg", children: achievement.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 645,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: achievement.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 646,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 644,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 640,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mb-1", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-medium", children: "Progress" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 651,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm text-gray-500", children: [
              achievement.progress,
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 652,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 650,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: achievement.progress, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 654,
            columnNumber: 21
          }, globalThis),
          achievement.completed && achievement.unlocked_at && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-3 text-sm text-gray-500", children: [
            "Unlocked: ",
            formatDate(achievement.unlocked_at)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 657,
            columnNumber: 23
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 649,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-end", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => handleShareAchievement(achievement),
            children: "Share"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 663,
            columnNumber: 21
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 662,
          columnNumber: 19
        }, globalThis)
      ] }, achievement.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 639,
        columnNumber: 17
      }, globalThis)) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "col-span-full flex justify-center items-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "No achievements found." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 675,
        columnNumber: 17
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 674,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 632,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 631,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "unlocked", className: "mt-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: loading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "col-span-full flex justify-center items-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "Loading achievements..." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 685,
        columnNumber: 17
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 684,
        columnNumber: 15
      }, globalThis) : filteredAchievements.length > 0 ? filteredAchievements.map((achievement) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden transition-all hover:shadow-md", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "flex flex-row items-center gap-4 pb-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: achievement.icon }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 691,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-lg", children: achievement.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 695,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: achievement.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 696,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 694,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 690,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mb-1", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-medium", children: "Progress" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 701,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm text-gray-500", children: [
              achievement.progress,
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 702,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 700,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: achievement.progress, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 704,
            columnNumber: 21
          }, globalThis),
          achievement.completed && achievement.unlocked_at && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-3 text-sm text-gray-500", children: [
            "Unlocked: ",
            formatDate(achievement.unlocked_at)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 707,
            columnNumber: 23
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 699,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-end", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => handleShareAchievement(achievement),
            children: "Share"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 713,
            columnNumber: 21
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 712,
          columnNumber: 19
        }, globalThis)
      ] }, achievement.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 689,
        columnNumber: 17
      }, globalThis)) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "col-span-full flex justify-center items-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "No unlocked achievements yet. Complete tasks to earn them!" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 725,
        columnNumber: 17
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 724,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 682,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 681,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "locked", className: "mt-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: loading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "col-span-full flex justify-center items-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "Loading achievements..." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 735,
        columnNumber: 17
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 734,
        columnNumber: 15
      }, globalThis) : filteredAchievements.length > 0 ? filteredAchievements.map((achievement) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden transition-all hover:shadow-md opacity-80", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "flex flex-row items-center gap-4 pb-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: achievement.icon }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 741,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-lg", children: achievement.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 745,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: achievement.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 746,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 744,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 740,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mb-1", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm font-medium", children: "Progress" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 751,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm text-gray-500", children: [
              achievement.progress,
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 752,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 750,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: achievement.progress, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 754,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 749,
          columnNumber: 19
        }, globalThis)
      ] }, achievement.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 739,
        columnNumber: 17
      }, globalThis)) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "col-span-full flex justify-center items-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "No locked achievements to display." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 760,
        columnNumber: 17
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 759,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 732,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 731,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 624,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AnimatePresence, { children: showUnlockAnimation && recentlyUnlocked && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.8, y: 50 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: 50 },
        className: "fixed bottom-8 right-8 z-50 max-w-md",
        children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border-2 border-yellow-500 overflow-hidden shadow-xl", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "bg-yellow-500/10 pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "flex items-center text-xl", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-6 w-6 text-yellow-500 mr-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 779,
              columnNumber: 19
            }, globalThis),
            "Achievement Unlocked!"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 778,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 777,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: recentlyUnlocked.icon }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 785,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h4", { className: "font-bold", children: recentlyUnlocked.title }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
                lineNumber: 789,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: recentlyUnlocked.description }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
                lineNumber: 790,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
              lineNumber: 788,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 784,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 783,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-end gap-2 pt-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setShowUnlockAnimation(false),
                children: "Dismiss"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
                lineNumber: 795,
                columnNumber: 17
              },
              globalThis
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Button,
              {
                size: "sm",
                onClick: () => handleShareAchievement(recentlyUnlocked),
                children: "Share"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
                lineNumber: 802,
                columnNumber: 17
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
            lineNumber: 794,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
          lineNumber: 776,
          columnNumber: 13
        }, globalThis)
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 770,
        columnNumber: 11
      },
      globalThis
    ) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
      lineNumber: 768,
      columnNumber: 7
    }, globalThis),
    selectedAchievement && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      SocialShareDialog,
      {
        item: {
          title: `Achievement: ${selectedAchievement.title}`,
          description: `I just earned the "${selectedAchievement.title}" achievement in Mission Fresh! ${selectedAchievement.description}`
        },
        onClose: () => setSelectedAchievement(null)
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
        lineNumber: 816,
        columnNumber: 9
      },
      globalThis
    )
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Achievements.tsx",
    lineNumber: 609,
    columnNumber: 5
  }, globalThis);
};

await importShared('react');

const {useState: useState$8,useEffect: useEffect$7} = await importShared('react');
const TaskManager = ({ session, supabaseClient }) => {
  const [isLoading, setIsLoading] = useState$8(true);
  const [tasks, setTasks] = useState$8([]);
  const [filteredTasks, setFilteredTasks] = useState$8([]);
  const [searchQuery, setSearchQuery] = useState$8("");
  const [statusFilter, setStatusFilter] = useState$8("all");
  const [categoryFilter, setCategoryFilter] = useState$8("all");
  const [completedTasksCollapsed, setCompletedTasksCollapsed] = useState$8(true);
  const [showAddTask, setShowAddTask] = useState$8(false);
  const [newTask, setNewTask] = useState$8({
    title: "",
    description: "",
    category: "custom",
    priority: "medium"
  });
  const [totalPoints, setTotalPoints] = useState$8(0);
  const [errorMessage, setErrorMessage] = useState$8(null);
  useEffect$7(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const mockTasks = [
          {
            id: "1",
            title: "Set your quit date",
            description: "Choose a date within the next two weeks to quit smoking completely.",
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString(),
            completed_date: null,
            status: "pending",
            priority: "high",
            category: "preparation",
            streak_related: true,
            points: 50,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "2",
            title: "Identify your triggers",
            description: "Make a list of situations, feelings, and activities that trigger your smoking urges.",
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toISOString(),
            completed_date: null,
            status: "pending",
            priority: "medium",
            category: "preparation",
            streak_related: false,
            points: 30,
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "3",
            title: "Stock up on nicotine replacement products",
            description: "Purchase gum, patches, or lozenges to help manage cravings.",
            due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3).toISOString(),
            completed_date: null,
            status: "pending",
            priority: "medium",
            category: "preparation",
            streak_related: false,
            points: 20,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "4",
            title: "Dispose of all smoking products",
            description: "Get rid of cigarettes, lighters, ashtrays, and anything else related to smoking.",
            due_date: new Date(Date.now()).toISOString(),
            // Today
            completed_date: new Date(Date.now() - 2 * 60 * 60 * 1e3).toISOString(),
            // 2 hours ago
            status: "completed",
            priority: "high",
            category: "quit_day",
            streak_related: true,
            points: 100,
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "5",
            title: "Inform friends and family about your quit plan",
            description: "Let your support network know about your decision to quit smoking.",
            due_date: null,
            completed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
            status: "completed",
            priority: "low",
            category: "preparation",
            streak_related: false,
            points: 20,
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "6",
            title: "Practice deep breathing exercise",
            description: "Do a 5-minute deep breathing exercise to manage cravings.",
            due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString(),
            // Yesterday
            completed_date: null,
            status: "skipped",
            priority: "medium",
            category: "early_days",
            streak_related: false,
            points: 15,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "7",
            title: "Drink plenty of water today",
            description: "Aim for at least 8 glasses of water to help flush toxins.",
            due_date: (/* @__PURE__ */ new Date()).toISOString(),
            // Today
            completed_date: null,
            status: "pending",
            priority: "medium",
            category: "early_days",
            streak_related: false,
            points: 10,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "8",
            title: "Track cravings in journal",
            description: "Record when cravings occur and what might have triggered them.",
            due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3).toISOString(),
            // Tomorrow
            completed_date: null,
            status: "pending",
            priority: "low",
            category: "maintenance",
            streak_related: true,
            points: 25,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
          }
        ];
        setTasks(mockTasks);
        const points = mockTasks.filter((task) => task.status === "completed").reduce((total, task) => total + task.points, 0);
        setTotalPoints(points);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setErrorMessage("There was an error loading your tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [session, supabaseClient]);
  useEffect$7(() => {
    filterTasks();
  }, [tasks, statusFilter, categoryFilter, searchQuery]);
  const filterTasks = () => {
    let filtered = [...tasks];
    if (searchQuery) {
      filtered = filtered.filter(
        (task) => task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }
    setFilteredTasks(filtered);
  };
  const markTaskCompleted = (taskId) => {
    setTasks(
      (prevTasks) => prevTasks.map(
        (task2) => task2.id === taskId ? {
          ...task2,
          status: "completed",
          completed_date: (/* @__PURE__ */ new Date()).toISOString()
        } : task2
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTotalPoints((prev) => prev + task.points);
    }
  };
  const skipTask = (taskId) => {
    setTasks(
      (prevTasks) => prevTasks.map(
        (task) => task.id === taskId ? {
          ...task,
          status: "skipped"
        } : task
      )
    );
  };
  const undoTaskCompletion = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task)
      return;
    setTasks(
      (prevTasks) => prevTasks.map(
        (t) => t.id === taskId ? {
          ...t,
          status: "pending",
          completed_date: null
        } : t
      )
    );
    setTotalPoints((prev) => prev - task.points);
  };
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };
  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      setErrorMessage("Task title is required");
      return;
    }
    const newTaskObj = {
      id: `new-${Date.now()}`,
      // In production this would be a proper UUID
      title: newTask.title,
      description: newTask.description || null,
      due_date: null,
      completed_date: null,
      status: "pending",
      priority: newTask.priority,
      category: newTask.category,
      streak_related: false,
      points: 10,
      // Default points for custom tasks
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    setTasks((prev) => [...prev, newTaskObj]);
    setNewTask({
      title: "",
      description: "",
      category: "custom",
      priority: "medium"
    });
    setShowAddTask(false);
    setErrorMessage(null);
  };
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getCategoryLabel = (category) => {
    switch (category) {
      case "preparation":
        return "Preparation";
      case "quit_day":
        return "Quit Day";
      case "early_days":
        return "Early Days";
      case "maintenance":
        return "Maintenance";
      case "custom":
        return "Custom";
      default:
        return category;
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = /* @__PURE__ */ new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString(void 0, { weekday: "short", month: "short", day: "numeric" });
    }
  };
  const isTaskOverdue = (task) => {
    if (task.status === "completed" || task.status === "skipped" || !task.due_date) {
      return false;
    }
    const dueDate = new Date(task.due_date);
    const now = /* @__PURE__ */ new Date();
    return dueDate < now;
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-center h-screen", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 381,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mt-4 text-gray-600", children: "Loading your tasks..." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 382,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 380,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 379,
      columnNumber: 7
    }, globalThis);
  }
  const pendingTasks = filteredTasks.filter((task) => task.status === "pending");
  const completedTasks = filteredTasks.filter((task) => task.status === "completed");
  const skippedTasks = filteredTasks.filter((task) => task.status === "skipped");
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto px-4 py-6", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold text-gray-900", children: "Quit Journey Tasks" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 396,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        "button",
        {
          onClick: () => setShowAddTask(true),
          className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center",
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Plus, { className: "h-4 w-4 mr-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 401,
              columnNumber: 11
            }, globalThis),
            "Add Custom Task"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 397,
          columnNumber: 9
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 395,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 mb-6 text-white", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-8 w-8 mr-3" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 409,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-sm font-medium", children: "Total Points Earned" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 411,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-2xl font-bold", children: totalPoints }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 412,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 410,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "ml-auto text-right", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm", children: [
          completedTasks.length,
          " completed / ",
          tasks.length,
          " total tasks"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 415,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-32 bg-white bg-opacity-30 rounded-full h-2 mt-1", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "div",
          {
            className: "bg-white rounded-full h-2",
            style: { width: `${completedTasks.length / tasks.length * 100}%` }
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 419,
            columnNumber: 15
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 418,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 414,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 408,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 407,
      columnNumber: 7
    }, globalThis),
    errorMessage && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleAlert, { className: "h-5 w-5 mr-2" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 432,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: errorMessage }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 433,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 431,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 430,
      columnNumber: 9
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col md:flex-row gap-4 mb-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative flex-grow", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 18 }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 441,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "input",
          {
            type: "text",
            placeholder: "Search tasks...",
            className: "pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value)
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 442,
            columnNumber: 11
          },
          globalThis
        )
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 440,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Filter, { className: "text-gray-400 mr-2", size: 18 }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 452,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            "select",
            {
              className: "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "all", children: "All Statuses" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 458,
                  columnNumber: 15
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "pending", children: "Pending" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 459,
                  columnNumber: 15
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "completed", children: "Completed" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 460,
                  columnNumber: 15
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "skipped", children: "Skipped" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 461,
                  columnNumber: 15
                }, globalThis)
              ]
            },
            void 0,
            true,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 453,
              columnNumber: 13
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 451,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "select",
          {
            className: "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
            value: categoryFilter,
            onChange: (e) => setCategoryFilter(e.target.value),
            children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "all", children: "All Categories" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 470,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "preparation", children: "Preparation" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 471,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "quit_day", children: "Quit Day" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 472,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "early_days", children: "Early Days" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 473,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "maintenance", children: "Maintenance" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 474,
                columnNumber: 15
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "custom", children: "Custom" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 475,
                columnNumber: 15
              }, globalThis)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 465,
            columnNumber: 13
          },
          globalThis
        ) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 464,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 450,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 439,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-xl font-semibold mb-4 flex items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleDashed, { className: "h-5 w-5 mr-2 text-yellow-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 486,
            columnNumber: 13
          }, globalThis),
          "Pending Tasks",
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-2 text-sm font-normal text-gray-500", children: [
            "(",
            pendingTasks.length,
            ")"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 488,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 485,
          columnNumber: 11
        }, globalThis),
        pendingTasks.length > 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: pendingTasks.map((task) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "div",
          {
            className: `bg-white p-4 rounded-lg border ${isTaskOverdue(task) ? "border-red-300" : "border-gray-200"} shadow-sm hover:shadow-md transition-shadow`,
            children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                "button",
                {
                  onClick: () => markTaskCompleted(task.id),
                  className: "mt-1 h-5 w-5 rounded-full border-2 border-green-500 hover:bg-green-100 flex-shrink-0",
                  "aria-label": "Mark as completed"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 503,
                  columnNumber: 21
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "ml-3 flex-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-gray-900", children: task.title }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 511,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex space-x-2", children: [
                    task.streak_related && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "Streak" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 514,
                      columnNumber: 29
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(task.priority)}`, children: task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 518,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("button", { className: "p-1 hover:bg-gray-100 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(EllipsisVertical, { className: "h-4 w-4 text-gray-500" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 523,
                      columnNumber: 31
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 522,
                      columnNumber: 29
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 521,
                      columnNumber: 27
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 512,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 510,
                  columnNumber: 23
                }, globalThis),
                task.description && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 mt-1", children: task.description }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 531,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mt-2", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center text-xs text-gray-500", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Calendar, { className: "h-3 w-3 mr-1" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 536,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                      task.category && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "mr-2", children: getCategoryLabel(task.category) }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 539,
                        columnNumber: 31
                      }, globalThis),
                      task.due_date && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "mx-1", children: "•" }, void 0, false, {
                          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                          lineNumber: 543,
                          columnNumber: 33
                        }, globalThis),
                        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: isTaskOverdue(task) ? "text-red-500 font-medium" : "", children: [
                          "Due: ",
                          formatDate(task.due_date),
                          isTaskOverdue(task) && " (Overdue)"
                        ] }, void 0, true, {
                          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                          lineNumber: 544,
                          columnNumber: 33
                        }, globalThis)
                      ] }, void 0, true, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 542,
                        columnNumber: 31
                      }, globalThis)
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 537,
                      columnNumber: 27
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 535,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center text-xs", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-green-600 font-medium", children: [
                      "+",
                      task.points,
                      " points"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 554,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      "button",
                      {
                        onClick: () => skipTask(task.id),
                        className: "ml-3 text-gray-500 hover:text-gray-700",
                        children: "Skip"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 555,
                        columnNumber: 27
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 553,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 534,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 509,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 502,
              columnNumber: 19
            }, globalThis)
          },
          task.id,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 496,
            columnNumber: 17
          },
          globalThis
        )) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 494,
          columnNumber: 13
        }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center py-8 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SquareCheckBig, { className: "h-12 w-12 mx-auto text-gray-400 mb-3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 570,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500", children: "No pending tasks available." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 571,
            columnNumber: 15
          }, globalThis),
          (statusFilter !== "all" || categoryFilter !== "all" || searchQuery) && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500 mt-1", children: "Try adjusting your filters." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 573,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 569,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 484,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "button",
          {
            onClick: () => setCompletedTasksCollapsed(!completedTasksCollapsed),
            className: "flex items-center w-full text-left text-xl font-semibold mb-4",
            children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheckBig, { className: "h-5 w-5 mr-2 text-green-500" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 585,
                columnNumber: 13
              }, globalThis),
              "Completed Tasks",
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-2 text-sm font-normal text-gray-500", children: [
                "(",
                completedTasks.length,
                ")"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 587,
                columnNumber: 13
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChevronDown, { className: `ml-2 h-5 w-5 text-gray-400 transform transition-transform ${completedTasksCollapsed ? "" : "rotate-180"}` }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 590,
                columnNumber: 13
              }, globalThis)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 581,
            columnNumber: 11
          },
          globalThis
        ),
        !completedTasksCollapsed && completedTasks.length > 0 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: completedTasks.map((task) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "div",
          {
            className: "bg-white p-4 rounded-lg border border-gray-200 shadow-sm",
            children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-1 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-3 w-3" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 602,
                columnNumber: 23
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 601,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "ml-3 flex-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-gray-900 line-through opacity-70", children: task.title }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 607,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex space-x-2", children: [
                    task.streak_related && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 opacity-70", children: "Streak" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 610,
                      columnNumber: 29
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(task.priority)} opacity-70`, children: task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 614,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("button", { className: "p-1 hover:bg-gray-100 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(EllipsisVertical, { className: "h-4 w-4 text-gray-500" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 619,
                      columnNumber: 31
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 618,
                      columnNumber: 29
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 617,
                      columnNumber: 27
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 608,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 606,
                  columnNumber: 23
                }, globalThis),
                task.description && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 mt-1 opacity-70", children: task.description }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 627,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mt-2", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center text-xs text-gray-500", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleCheckBig, { className: "h-3 w-3 mr-1 text-green-500" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 632,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                      "Completed ",
                      task.completed_date ? new Date(task.completed_date).toLocaleDateString() : "recently"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 633,
                      columnNumber: 27
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 631,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center text-xs", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-green-600 font-medium", children: [
                      "+",
                      task.points,
                      " points"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 639,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      "button",
                      {
                        onClick: () => undoTaskCompletion(task.id),
                        className: "ml-3 text-gray-500 hover:text-gray-700",
                        children: "Undo"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 640,
                        columnNumber: 27
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 638,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 630,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 605,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 600,
              columnNumber: 19
            }, globalThis)
          },
          task.id,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 596,
            columnNumber: 17
          },
          globalThis
        )) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 594,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 580,
        columnNumber: 9
      }, globalThis),
      skippedTasks.length > 0 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-xl font-semibold mb-4 flex items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(X, { className: "h-5 w-5 mr-2 text-gray-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 660,
            columnNumber: 15
          }, globalThis),
          "Skipped Tasks",
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-2 text-sm font-normal text-gray-500", children: [
            "(",
            skippedTasks.length,
            ")"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 662,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 659,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: skippedTasks.map((task) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "div",
          {
            className: "bg-white p-4 rounded-lg border border-gray-200 shadow-sm",
            children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-1 h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(X, { className: "h-3 w-3 text-gray-400" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 675,
                columnNumber: 23
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 674,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "ml-3 flex-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-gray-400", children: task.title }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 680,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex space-x-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("button", { className: "p-1 hover:bg-gray-100 rounded-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(EllipsisVertical, { className: "h-4 w-4 text-gray-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 684,
                    columnNumber: 31
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 683,
                    columnNumber: 29
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 682,
                    columnNumber: 27
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 681,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 679,
                  columnNumber: 23
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mt-2", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center text-xs text-gray-500", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Skipped" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 693,
                    columnNumber: 27
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 692,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      "button",
                      {
                        onClick: () => markTaskCompleted(task.id),
                        className: "text-xs text-green-600 hover:text-green-800",
                        children: "Complete anyway"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 697,
                        columnNumber: 27
                      },
                      globalThis
                    ),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      "button",
                      {
                        onClick: () => deleteTask(task.id),
                        className: "text-xs text-red-600 hover:text-red-800",
                        children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trash2, { className: "h-3 w-3" }, void 0, false, {
                          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                          lineNumber: 707,
                          columnNumber: 29
                        }, globalThis)
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 703,
                        columnNumber: 27
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 696,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 691,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 678,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 673,
              columnNumber: 19
            }, globalThis)
          },
          task.id,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
            lineNumber: 669,
            columnNumber: 17
          },
          globalThis
        )) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 667,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 658,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 482,
      columnNumber: 7
    }, globalThis),
    showAddTask && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "fixed inset-0 z-50 overflow-y-auto", onClick: () => setShowAddTask(false), children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
        lineNumber: 724,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        "div",
        {
          className: "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "sm:flex sm:items-start", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg leading-6 font-medium text-gray-900 mb-4", children: "Add Custom Task" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 733,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700", children: [
                    "Task Title ",
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-red-500", children: "*" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 738,
                      columnNumber: 38
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 737,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                    "input",
                    {
                      type: "text",
                      id: "title",
                      className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500",
                      placeholder: "Enter task title",
                      value: newTask.title,
                      onChange: (e) => setNewTask({ ...newTask, title: e.target.value })
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 740,
                      columnNumber: 25
                    },
                    globalThis
                  )
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 736,
                  columnNumber: 23
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 751,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                    "textarea",
                    {
                      id: "description",
                      rows: 3,
                      className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500",
                      placeholder: "Enter task description (optional)",
                      value: newTask.description,
                      onChange: (e) => setNewTask({ ...newTask, description: e.target.value })
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 754,
                      columnNumber: 25
                    },
                    globalThis
                  )
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 750,
                  columnNumber: 23
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: "category", className: "block text-sm font-medium text-gray-700", children: "Category" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 766,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      "select",
                      {
                        id: "category",
                        className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500",
                        value: newTask.category,
                        onChange: (e) => setNewTask({ ...newTask, category: e.target.value }),
                        children: [
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "custom", children: "Custom" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 775,
                            columnNumber: 29
                          }, globalThis),
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "preparation", children: "Preparation" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 776,
                            columnNumber: 29
                          }, globalThis),
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "quit_day", children: "Quit Day" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 777,
                            columnNumber: 29
                          }, globalThis),
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "early_days", children: "Early Days" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 778,
                            columnNumber: 29
                          }, globalThis),
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "maintenance", children: "Maintenance" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 779,
                            columnNumber: 29
                          }, globalThis)
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 769,
                        columnNumber: 27
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 765,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: "priority", className: "block text-sm font-medium text-gray-700", children: "Priority" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                      lineNumber: 784,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      "select",
                      {
                        id: "priority",
                        className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500",
                        value: newTask.priority,
                        onChange: (e) => setNewTask({ ...newTask, priority: e.target.value }),
                        children: [
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "low", children: "Low" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 793,
                            columnNumber: 29
                          }, globalThis),
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "medium", children: "Medium" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 794,
                            columnNumber: 29
                          }, globalThis),
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "high", children: "High" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                            lineNumber: 795,
                            columnNumber: 29
                          }, globalThis)
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                        lineNumber: 787,
                        columnNumber: 27
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                    lineNumber: 783,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 764,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                lineNumber: 735,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 732,
              columnNumber: 19
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 731,
              columnNumber: 17
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 730,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                "button",
                {
                  type: "button",
                  className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
                  onClick: handleAddTask,
                  children: "Add Task"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 804,
                  columnNumber: 17
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                "button",
                {
                  type: "button",
                  className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm",
                  onClick: () => {
                    setShowAddTask(false);
                    setErrorMessage(null);
                  },
                  children: "Cancel"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
                  lineNumber: 811,
                  columnNumber: 17
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
              lineNumber: 803,
              columnNumber: 15
            }, globalThis)
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
          lineNumber: 726,
          columnNumber: 13
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 723,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
      lineNumber: 722,
      columnNumber: 9
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/TaskManager.tsx",
    lineNumber: 394,
    columnNumber: 5
  }, globalThis);
};

const {useState: useState$7,useEffect: useEffect$6} = await importShared('react');

const {useNavigate: useNavigate$4} = await importShared('react-router-dom');
const LoginPage = () => {
  const { session, isLoading, signIn } = useAuth();
  const navigate = useNavigate$4();
  const [email, setEmail] = useState$7("hertzofhopes@gmail.com");
  const [password, setPassword] = useState$7("J4913836j");
  const [isSubmitting, setIsSubmitting] = useState$7(false);
  const [error, setError] = useState$7(null);
  const [rememberMe, setRememberMe] = useState$7(true);
  useEffect$6(() => {
    const timeoutId = setTimeout(() => {
      if (!session && email && password) {
        handleAutoSubmit();
      }
    }, 1e3);
    return () => clearTimeout(timeoutId);
  }, [session, email, password]);
  useEffect$6(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);
  const handleAutoSubmit = async () => {
    try {
      setIsSubmitting(true);
      await signIn(email, password);
    } catch (error2) {
      console.error("Auto-login failed:", error2);
      setError(typeof error2 === "string" ? error2 : "Auto-login failed. Please try manually.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (error2) {
      console.error("Login failed:", error2);
      setError(typeof error2 === "string" ? error2 : "Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const fillTestCredentials = () => {
    setEmail("hertzofhopes@gmail.com");
    setPassword("J4913836j");
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      motion.div,
      {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5 },
        className: "flex flex-col items-center",
        children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mx-auto mb-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
            lineNumber: 104,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-300 font-medium", children: "Connecting to your wellness journey..." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
            lineNumber: 105,
            columnNumber: 11
          }, globalThis)
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
        lineNumber: 98,
        columnNumber: 9
      },
      globalThis
    ) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
      lineNumber: 97,
      columnNumber: 7
    }, globalThis);
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      motion.div,
      {
        variants: containerVariants,
        initial: "hidden",
        animate: "visible",
        className: "mx-auto w-full max-w-sm lg:w-96",
        children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            motion.div,
            {
              variants: itemVariants,
              className: "h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center",
              children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-8 w-8 text-white" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 125,
                columnNumber: 15
              }, globalThis)
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 121,
              columnNumber: 13
            },
            globalThis
          ) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
            lineNumber: 120,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "mt-2 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white", children: "Mission Fresh" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 130,
              columnNumber: 13
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "mt-1 text-center text-lg font-semibold tracking-tight text-indigo-700 dark:text-indigo-400", children: "Your journey to a smoke-free life" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 133,
              columnNumber: 13
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
            lineNumber: 129,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(motion.div, { variants: itemVariants, className: "mt-8", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-xl", children: "Sign in to your account" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 141,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Access your personalized wellness journey" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 142,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 140,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("form", { className: "space-y-4", onSubmit: handleSignIn, children: [
              error && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                motion.div,
                {
                  initial: { opacity: 0, y: -10 },
                  animate: { opacity: 1, y: 0 },
                  className: "rounded-md bg-red-50 dark:bg-red-900/30 p-3",
                  children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Shield, { className: "h-5 w-5 text-red-400" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                      lineNumber: 156,
                      columnNumber: 27
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                      lineNumber: 155,
                      columnNumber: 25
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "ml-3", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-sm font-medium text-red-800 dark:text-red-200", children: error }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                      lineNumber: 159,
                      columnNumber: 27
                    }, globalThis) }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                      lineNumber: 158,
                      columnNumber: 25
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 154,
                    columnNumber: 23
                  }, globalThis)
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 149,
                  columnNumber: 21
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "email", className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Mail, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 167,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Email address" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 168,
                    columnNumber: 23
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 166,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Input,
                  {
                    id: "email",
                    name: "email",
                    type: "email",
                    autoComplete: "email",
                    required: true,
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    className: "block w-full",
                    placeholder: "you@example.com"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 170,
                    columnNumber: 21
                  },
                  globalThis
                )
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 165,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "password", className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Lock, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 185,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Password" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 186,
                    columnNumber: 23
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 184,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Input,
                  {
                    id: "password",
                    name: "password",
                    type: "password",
                    autoComplete: "current-password",
                    required: true,
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                    className: "block w-full",
                    placeholder: "••••••••"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 188,
                    columnNumber: 21
                  },
                  globalThis
                )
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 183,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                    Checkbox,
                    {
                      id: "remember-me",
                      checked: rememberMe,
                      onCheckedChange: (checked) => setRememberMe(checked === true)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                      lineNumber: 203,
                      columnNumber: 23
                    },
                    globalThis
                  ),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "remember-me", className: "ml-2 block text-sm", children: "Remember me" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 208,
                    columnNumber: 23
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 202,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  "button",
                  {
                    type: "button",
                    onClick: fillTestCredentials,
                    className: "font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400",
                    children: "Use test account"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 214,
                    columnNumber: 23
                  },
                  globalThis
                ) }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 213,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 201,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  type: "submit",
                  disabled: isSubmitting,
                  className: "w-full",
                  children: isSubmitting ? "Signing in..." : "Sign in"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 224,
                  columnNumber: 19
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 147,
              columnNumber: 17
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 146,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-center border-t p-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col space-y-1 text-center text-sm", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400", children: "Don't have an account?" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 235,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("a", { href: "#", className: "font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400", children: "Contact your health provider" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 237,
                columnNumber: 21
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 236,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 234,
              columnNumber: 17
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 233,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
            lineNumber: 139,
            columnNumber: 13
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
            lineNumber: 138,
            columnNumber: 11
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            motion.div,
            {
              variants: itemVariants,
              className: "mt-6 flex justify-center gap-6",
              children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center p-3", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-700 p-2 rounded-full shadow-md mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cigarette, { className: "h-5 w-5 text-red-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 252,
                    columnNumber: 17
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 251,
                    columnNumber: 15
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Quit Smoking" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 254,
                    columnNumber: 15
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 250,
                  columnNumber: 13
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center p-3", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-700 p-2 rounded-full shadow-md mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Award$1, { className: "h-5 w-5 text-amber-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 259,
                    columnNumber: 17
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 258,
                    columnNumber: 15
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Track Progress" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 261,
                    columnNumber: 15
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 257,
                  columnNumber: 13
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center text-center p-3", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white dark:bg-gray-700 p-2 rounded-full shadow-md mb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5 text-green-500" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 266,
                    columnNumber: 17
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 265,
                    columnNumber: 15
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Improve Health" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                    lineNumber: 268,
                    columnNumber: 15
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 264,
                  columnNumber: 13
                }, globalThis)
              ]
            },
            void 0,
            true,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 246,
              columnNumber: 11
            },
            globalThis
          )
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
        lineNumber: 114,
        columnNumber: 9
      },
      globalThis
    ) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
      lineNumber: 113,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative hidden w-0 flex-1 lg:block", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-0 h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-0 bg-black/20" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
        lineNumber: 276,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex h-full items-center justify-center p-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.5, duration: 0.5 },
          className: "max-w-xl text-center text-white",
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-4xl font-bold mb-4", children: "Breathe Fresh, Live Better" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 284,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xl mb-6", children: "Your comprehensive companion for quitting smoking and embracing a healthier lifestyle." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 285,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap justify-center gap-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[200px]", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Track Progress" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 290,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-white/80", children: "Monitor your journey with detailed analytics and visualizations." }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 291,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 289,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[200px]", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Health Insights" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 296,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-white/80", children: "Understand how quitting improves your body's recovery over time." }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 297,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 295,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1 min-w-[200px]", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: "Community Support" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 302,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-white/80", children: "Connect with others on the same journey for motivation and tips." }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                  lineNumber: 303,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
                lineNumber: 301,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
              lineNumber: 288,
              columnNumber: 15
            }, globalThis)
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
          lineNumber: 278,
          columnNumber: 13
        },
        globalThis
      ) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
        lineNumber: 277,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
      lineNumber: 275,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
      lineNumber: 274,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/LoginPage.tsx",
    lineNumber: 112,
    columnNumber: 5
  }, globalThis);
};

const {useState: useState$6} = await importShared('react');

const {useLocation,useNavigate: useNavigate$3} = await importShared('react-router-dom');
const DeepLinkHandler = () => {
  const location = useLocation();
  useNavigate$3();
  const [customPath, setCustomPath] = useState$6("");
  const [paramKey, setParamKey] = useState$6("");
  const [paramValue, setParamValue] = useState$6("");
  const [params, setParams] = useState$6({});
  const testDeepLinks = [
    { name: "Home", path: "/" },
    { name: "Progress", path: "/progress" },
    { name: "Recipes", path: "/recipes" },
    { name: "NRT Directory", path: "/nrt-directory" },
    { name: "Community", path: "/community" },
    { name: "Settings", path: "/settings" }
  ];
  const testScenarios = [
    {
      name: "View Specific Product",
      path: "/products/12345",
      description: "View details for a specific product"
    },
    {
      name: "Share Progress",
      path: "/progress",
      params: { share: "true" },
      description: "Open progress page with sharing activated"
    },
    {
      name: "Community Challenge",
      path: "/challenges",
      params: { id: "123" },
      description: "View a specific community challenge"
    }
  ];
  const addParam = () => {
    if (paramKey && paramValue) {
      setParams({ ...params, [paramKey]: paramValue });
      setParamKey("");
      setParamValue("");
    }
  };
  const removeParam = (key) => {
    const newParams = { ...params };
    delete newParams[key];
    setParams(newParams);
  };
  const testCustomDeepLink = () => {
    if (customPath) {
      simulateDeepLink(customPath, params, { showToast: true });
    }
  };
  const testScenario = (path, scenarioParams) => {
    simulateDeepLink(path, scenarioParams, { showToast: true });
  };
  const formatParamsForDisplay = (params2) => {
    if (!params2 || Object.keys(params2).length === 0)
      return "";
    return `?${new URLSearchParams(
      Object.entries(params2).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {})
    ).toString()}`;
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "w-full max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Deep Link Testing" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
        lineNumber: 111,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Test functionality for handling deep links to different parts of the application" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
        lineNumber: 112,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
      lineNumber: 110,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Current Route" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 120,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 bg-muted rounded-md font-mono text-sm", children: [
          location.pathname,
          location.search
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 121,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: [
          "Query parameters: ",
          location.search ? location.search : "None"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 124,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
        lineNumber: 119,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "quick-test", className: "w-full", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "grid grid-cols-3 mb-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "quick-test", children: "Quick Test" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 131,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "custom-link", children: "Custom Link" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 132,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "scenarios", children: "Test Scenarios" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 133,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 130,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "quick-test", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Common Routes" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 139,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: testDeepLinks.map((link, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Button,
            {
              variant: "outline",
              onClick: () => simulateDeepLink(link.path, {}, { showToast: true }),
              className: "w-full",
              children: link.name
            },
            index,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 142,
              columnNumber: 19
            },
            globalThis
          )) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 140,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 138,
          columnNumber: 13
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 137,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "custom-link", className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "customPath", children: "Path" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 158,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Input,
                {
                  id: "customPath",
                  placeholder: "/your/path",
                  value: customPath,
                  onChange: (e) => setCustomPath(e.target.value)
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                  lineNumber: 160,
                  columnNumber: 17
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: testCustomDeepLink, children: "Test" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                lineNumber: 166,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 159,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 157,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Query Parameters" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 171,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-2 mb-2", children: Object.entries(params).map(([key, value]) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center bg-muted rounded-md px-2 py-1 text-sm", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
                key,
                "=",
                value
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                lineNumber: 175,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-5 w-5 ml-1",
                  onClick: () => removeParam(key),
                  children: "×"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                  lineNumber: 176,
                  columnNumber: 21
                },
                globalThis
              )
            ] }, key, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 174,
              columnNumber: 19
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 172,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Input,
                {
                  placeholder: "Parameter name",
                  value: paramKey,
                  onChange: (e) => setParamKey(e.target.value),
                  className: "flex-1"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                  lineNumber: 189,
                  columnNumber: 17
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Input,
                {
                  placeholder: "Value",
                  value: paramValue,
                  onChange: (e) => setParamValue(e.target.value),
                  className: "flex-1"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                  lineNumber: 195,
                  columnNumber: 17
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: addParam, variant: "outline", children: "Add" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                lineNumber: 201,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 188,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 170,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 156,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "scenarios", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: testScenarios.map((scenario, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "bg-muted/30", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "p-4 pb-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-base", children: scenario.name }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 212,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: scenario.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 213,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 211,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4 pt-0", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-2 font-mono text-xs bg-background p-2 rounded-md", children: [
              scenario.path,
              formatParamsForDisplay(scenario.params)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
              lineNumber: 216,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Button,
              {
                size: "sm",
                onClick: () => testScenario(scenario.path, scenario.params),
                children: "Test This Scenario"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
                lineNumber: 219,
                columnNumber: 21
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 215,
            columnNumber: 19
          }, globalThis)
        ] }, index, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 210,
          columnNumber: 17
        }, globalThis)) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 208,
          columnNumber: 13
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 207,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
        lineNumber: 129,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "pt-4 text-sm text-muted-foreground border-t", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium mb-2", children: "How Deep Linking Works" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 233,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ScrollArea, { className: "h-[120px]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "list-disc pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Deep links allow users to navigate directly to specific content within the app" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 236,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "In mobile apps, they can be triggered by notifications, external links, or QR codes" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 237,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "This test tool simulates receiving deep links by dispatching custom events" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 238,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "In a production environment, platform-specific handling would be implemented" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 239,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "For iOS: Universal Links or Custom URL Schemes" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 240,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "For Android: App Links or Intent Filters" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 241,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Web apps can use standard URLs with proper routing" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
            lineNumber: 242,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 235,
          columnNumber: 13
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
          lineNumber: 234,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
        lineNumber: 232,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
      lineNumber: 117,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/DeepLinkHandler.tsx",
    lineNumber: 109,
    columnNumber: 5
  }, globalThis);
};

await importShared('react');

const React$1 = await importShared('react');

const HookFormContext = React$1.createContext(null);
/**
 * This custom hook allows you to access the form context. useFormContext is intended to be used in deeply nested structures, where it would become inconvenient to pass the context as a prop. To be used with {@link FormProvider}.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useformcontext) • [Demo](https://codesandbox.io/s/react-hook-form-v7-form-context-ytudi)
 *
 * @returns return all useForm methods
 *
 * @example
 * ```tsx
 * function App() {
 *   const methods = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   return (
 *     <FormProvider {...methods} >
 *       <form onSubmit={methods.handleSubmit(onSubmit)}>
 *         <NestedInput />
 *         <input type="submit" />
 *       </form>
 *     </FormProvider>
 *   );
 * }
 *
 *  function NestedInput() {
 *   const { register } = useFormContext(); // retrieve all hook methods
 *   return <input {...register("test")} />;
 * }
 * ```
 */
const useFormContext = () => React$1.useContext(HookFormContext);

const React = await importShared('react');
const FormFieldContext = React.createContext(
  {}
);
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = React.createContext(
  {}
);
const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId();
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { ref, className: cn("space-y-2", className), ...props }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/form.tsx",
    lineNumber: 81,
    columnNumber: 7
  }, globalThis) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/form.tsx",
    lineNumber: 80,
    columnNumber: 5
  }, globalThis);
});
FormItem.displayName = "FormItem";
const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    Label,
    {
      ref,
      className: cn(error && "text-destructive", className),
      htmlFor: formItemId,
      ...props
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/form.tsx",
      lineNumber: 94,
      columnNumber: 5
    },
    globalThis
  );
});
FormLabel.displayName = "FormLabel";
const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    Slot,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/form.tsx",
      lineNumber: 111,
      columnNumber: 5
    },
    globalThis
  );
});
FormControl.displayName = "FormControl";
const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "p",
    {
      ref,
      id: formDescriptionId,
      className: cn("text-sm text-muted-foreground", className),
      ...props
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/form.tsx",
      lineNumber: 133,
      columnNumber: 5
    },
    globalThis
  );
});
FormDescription.displayName = "FormDescription";
const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "p",
    {
      ref,
      id: formMessageId,
      className: cn("text-sm font-medium text-destructive", className),
      ...props,
      children: body
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/form.tsx",
      lineNumber: 155,
      columnNumber: 5
    },
    globalThis
  );
});
FormMessage.displayName = "FormMessage";

var util;
(function (util) {
    util.assertEqual = (val) => val;
    function assertIs(_arg) { }
    util.assertIs = assertIs;
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj) => {
        const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
            filtered[k] = obj[k];
        }
        return util.objectValues(filtered);
    };
    util.objectValues = (obj) => {
        return util.objectKeys(obj).map(function (e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
        ? (obj) => Object.keys(obj) // eslint-disable-line ban/ban
        : (object) => {
            const keys = [];
            for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    util.find = (arr, checker) => {
        for (const item of arr) {
            if (checker(item))
                return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function"
        ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
        : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
        return array
            .map((val) => (typeof val === "string" ? `'${val}'` : val))
            .join(separator);
    }
    util.joinValues = joinValues;
    util.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    };
})(util || (util = {}));
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = (first, second) => {
        return {
            ...first,
            ...second, // second overwrites first
        };
    };
})(objectUtil || (objectUtil = {}));
const ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);
const getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
        case "undefined":
            return ZodParsedType.undefined;
        case "string":
            return ZodParsedType.string;
        case "number":
            return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
            return ZodParsedType.boolean;
        case "function":
            return ZodParsedType.function;
        case "bigint":
            return ZodParsedType.bigint;
        case "symbol":
            return ZodParsedType.symbol;
        case "object":
            if (Array.isArray(data)) {
                return ZodParsedType.array;
            }
            if (data === null) {
                return ZodParsedType.null;
            }
            if (data.then &&
                typeof data.then === "function" &&
                data.catch &&
                typeof data.catch === "function") {
                return ZodParsedType.promise;
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return ZodParsedType.map;
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return ZodParsedType.set;
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return ZodParsedType.date;
            }
            return ZodParsedType.object;
        default:
            return ZodParsedType.unknown;
    }
};

const ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite",
]);
class ZodError extends Error {
    constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
            this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
            this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            // eslint-disable-next-line ban/ban
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    get errors() {
        return this.issues;
    }
    format(_mapper) {
        const mapper = _mapper ||
            function (issue) {
                return issue.message;
            };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
            for (const issue of error.issues) {
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                }
                else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                }
                else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                }
                else if (issue.path.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < issue.path.length) {
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || { _errors: [] };
                            // if (typeof el === "string") {
                            //   curr[el] = curr[el] || { _errors: [] };
                            // } else if (typeof el === "number") {
                            //   const errorArray: any = [];
                            //   errorArray._errors = [];
                            //   curr[el] = curr[el] || errorArray;
                            // }
                        }
                        else {
                            curr[el] = curr[el] || { _errors: [] };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    }
    static assert(value) {
        if (!(value instanceof ZodError)) {
            throw new Error(`Not a ZodError: ${value}`);
        }
    }
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(mapper(sub));
            }
            else {
                formErrors.push(mapper(sub));
            }
        }
        return { formErrors, fieldErrors };
    }
    get formErrors() {
        return this.flatten();
    }
}
ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
};

const errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
        case ZodIssueCode.invalid_type:
            if (issue.received === ZodParsedType.undefined) {
                message = "Required";
            }
            else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case ZodIssueCode.invalid_literal:
            message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
            break;
        case ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
            break;
        case ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_union_discriminator:
            message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
            break;
        case ZodIssueCode.invalid_enum_value:
            message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
            break;
        case ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
        case ZodIssueCode.invalid_string:
            if (typeof issue.validation === "object") {
                if ("includes" in issue.validation) {
                    message = `Invalid input: must include "${issue.validation.includes}"`;
                    if (typeof issue.validation.position === "number") {
                        message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                    }
                }
                else if ("startsWith" in issue.validation) {
                    message = `Invalid input: must start with "${issue.validation.startsWith}"`;
                }
                else if ("endsWith" in issue.validation) {
                    message = `Invalid input: must end with "${issue.validation.endsWith}"`;
                }
                else {
                    util.assertNever(issue.validation);
                }
            }
            else if (issue.validation !== "regex") {
                message = `Invalid ${issue.validation}`;
            }
            else {
                message = "Invalid";
            }
            break;
        case ZodIssueCode.too_small:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${issue.minimum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${new Date(Number(issue.minimum))}`;
            else
                message = "Invalid input";
            break;
        case ZodIssueCode.too_big:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
            else if (issue.type === "bigint")
                message = `BigInt must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `smaller than or equal to`
                        : `smaller than`} ${new Date(Number(issue.maximum))}`;
            else
                message = "Invalid input";
            break;
        case ZodIssueCode.custom:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case ZodIssueCode.not_multiple_of:
            message = `Number must be a multiple of ${issue.multipleOf}`;
            break;
        case ZodIssueCode.not_finite:
            message = "Number must be finite";
            break;
        default:
            message = _ctx.defaultError;
            util.assertNever(issue);
    }
    return { message };
};

let overrideErrorMap = errorMap;
function getErrorMap() {
    return overrideErrorMap;
}

const makeIssue = (params) => {
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...(issueData.path || [])];
    const fullIssue = {
        ...issueData,
        path: fullPath,
    };
    if (issueData.message !== undefined) {
        return {
            ...issueData,
            path: fullPath,
            message: issueData.message,
        };
    }
    let errorMessage = "";
    const maps = errorMaps
        .filter((m) => !!m)
        .slice()
        .reverse();
    for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: errorMessage,
    };
};
function addIssueToContext(ctx, issueData) {
    const overrideMap = getErrorMap();
    const issue = makeIssue({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            overrideMap,
            overrideMap === errorMap ? undefined : errorMap, // then global default map
        ].filter((x) => !!x),
    });
    ctx.common.issues.push(issue);
}
class ParseStatus {
    constructor() {
        this.value = "valid";
    }
    dirty() {
        if (this.value === "valid")
            this.value = "dirty";
    }
    abort() {
        if (this.value !== "aborted")
            this.value = "aborted";
    }
    static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
            if (s.status === "aborted")
                return INVALID;
            if (s.status === "dirty")
                status.dirty();
            arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            syncPairs.push({
                key,
                value,
            });
        }
        return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
            const { key, value } = pair;
            if (key.status === "aborted")
                return INVALID;
            if (value.status === "aborted")
                return INVALID;
            if (key.status === "dirty")
                status.dirty();
            if (value.status === "dirty")
                status.dirty();
            if (key.value !== "__proto__" &&
                (typeof value.value !== "undefined" || pair.alwaysSet)) {
                finalObject[key.value] = value.value;
            }
        }
        return { status: status.value, value: finalObject };
    }
}
const INVALID = Object.freeze({
    status: "aborted",
});
const DIRTY = (value) => ({ status: "dirty", value });
const OK = (value) => ({ status: "valid", value });
const isAborted = (x) => x.status === "aborted";
const isDirty = (x) => x.status === "dirty";
const isValid = (x) => x.status === "valid";
const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var errorUtil;
(function (errorUtil) {
    errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil || (errorUtil = {}));

var _ZodEnum_cache, _ZodNativeEnum_cache;
class ParseInputLazyPath {
    constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
    }
    get path() {
        if (!this._cachedPath.length) {
            if (this._key instanceof Array) {
                this._cachedPath.push(...this._path, ...this._key);
            }
            else {
                this._cachedPath.push(...this._path, this._key);
            }
        }
        return this._cachedPath;
    }
}
const handleResult = (ctx, result) => {
    if (isValid(result)) {
        return { success: true, data: result.value };
    }
    else {
        if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        return {
            success: false,
            get error() {
                if (this._error)
                    return this._error;
                const error = new ZodError(ctx.common.issues);
                this._error = error;
                return this._error;
            },
        };
    }
};
function processCreateParams(params) {
    if (!params)
        return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap)
        return { errorMap: errorMap, description };
    const customMap = (iss, ctx) => {
        var _a, _b;
        const { message } = params;
        if (iss.code === "invalid_enum_value") {
            return { message: message !== null && message !== void 0 ? message : ctx.defaultError };
        }
        if (typeof ctx.data === "undefined") {
            return { message: (_a = message !== null && message !== void 0 ? message : required_error) !== null && _a !== void 0 ? _a : ctx.defaultError };
        }
        if (iss.code !== "invalid_type")
            return { message: ctx.defaultError };
        return { message: (_b = message !== null && message !== void 0 ? message : invalid_type_error) !== null && _b !== void 0 ? _b : ctx.defaultError };
    };
    return { errorMap: customMap, description };
}
class ZodType {
    constructor(def) {
        /** Alias of safeParseAsync */
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
    }
    get description() {
        return this._def.description;
    }
    _getType(input) {
        return getParsedType(input.data);
    }
    _getOrReturnCtx(input, ctx) {
        return (ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent,
        });
    }
    _processInputParams(input) {
        return {
            status: new ParseStatus(),
            ctx: {
                common: input.parent.common,
                data: input.data,
                parsedType: getParsedType(input.data),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent,
            },
        };
    }
    _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        var _a;
        const ctx = {
            common: {
                issues: [],
                async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
                contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data),
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = {
            common: {
                issues: [],
                contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
                async: true,
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data),
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult)
            ? maybeAsyncResult
            : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    refine(check, message) {
        const getIssueProperties = (val) => {
            if (typeof message === "string" || typeof message === "undefined") {
                return { message };
            }
            else if (typeof message === "function") {
                return message(val);
            }
            else {
                return message;
            }
        };
        return this._refinement((val, ctx) => {
            const result = check(val);
            const setError = () => ctx.addIssue({
                code: ZodIssueCode.custom,
                ...getIssueProperties(val),
            });
            if (typeof Promise !== "undefined" && result instanceof Promise) {
                return result.then((data) => {
                    if (!data) {
                        setError();
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            }
            else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function"
                    ? refinementData(val, ctx)
                    : refinementData);
                return false;
            }
            else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "refinement", refinement },
        });
    }
    superRefine(refinement) {
        return this._refinement(refinement);
    }
    optional() {
        return ZodOptional.create(this, this._def);
    }
    nullable() {
        return ZodNullable.create(this, this._def);
    }
    nullish() {
        return this.nullable().optional();
    }
    array() {
        return ZodArray.create(this, this._def);
    }
    promise() {
        return ZodPromise.create(this, this._def);
    }
    or(option) {
        return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
        return new ZodEffects({
            ...processCreateParams(this._def),
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "transform", transform },
        });
    }
    default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
            ...processCreateParams(this._def),
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
        });
    }
    brand() {
        return new ZodBranded({
            typeName: ZodFirstPartyTypeKind.ZodBranded,
            type: this,
            ...processCreateParams(this._def),
        });
    }
    catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
            ...processCreateParams(this._def),
            innerType: this,
            catchValue: catchValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodCatch,
        });
    }
    describe(description) {
        const This = this.constructor;
        return new This({
            ...this._def,
            description,
        });
    }
    pipe(target) {
        return ZodPipeline.create(this, target);
    }
    readonly() {
        return ZodReadonly.create(this);
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[0-9a-z]+$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
// const uuidRegex =
//   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
const nanoidRegex = /^[a-z0-9_-]{21}$/i;
const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
//old email regex
// const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
// eslint-disable-next-line
// const emailRegex =
//   /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
// const emailRegex =
//   /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// const emailRegex =
//   /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
// const emailRegex =
//   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex;
// faster, simpler, safer
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
// simple
// const dateRegexSource = `\\d{4}-\\d{2}-\\d{2}`;
// no leap year validation
// const dateRegexSource = `\\d{4}-((0[13578]|10|12)-31|(0[13-9]|1[0-2])-30|(0[1-9]|1[0-2])-(0[1-9]|1\\d|2\\d))`;
// with leap year validation
const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
    // let regex = `\\d{2}:\\d{2}:\\d{2}`;
    let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
    if (args.precision) {
        regex = `${regex}\\.\\d{${args.precision}}`;
    }
    else if (args.precision == null) {
        regex = `${regex}(\\.\\d+)?`;
    }
    return regex;
}
function timeRegex(args) {
    return new RegExp(`^${timeRegexSource(args)}$`);
}
// Adapted from https://stackoverflow.com/a/3143231
function datetimeRegex(args) {
    let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
    const opts = [];
    opts.push(args.local ? `Z?` : `Z`);
    if (args.offset)
        opts.push(`([+-]\\d{2}:?\\d{2})`);
    regex = `${regex}(${opts.join("|")})`;
    return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
    }
    return false;
}
class ZodString extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.string,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const status = new ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.length < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.length > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "length") {
                const tooBig = input.data.length > check.value;
                const tooSmall = input.data.length < check.value;
                if (tooBig || tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    if (tooBig) {
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    else if (tooSmall) {
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    status.dirty();
                }
            }
            else if (check.kind === "email") {
                if (!emailRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "email",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "emoji") {
                if (!emojiRegex) {
                    emojiRegex = new RegExp(_emojiRegex, "u");
                }
                if (!emojiRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "emoji",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "uuid") {
                if (!uuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "uuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "nanoid") {
                if (!nanoidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "nanoid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid") {
                if (!cuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "cuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid2") {
                if (!cuid2Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "cuid2",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ulid") {
                if (!ulidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "ulid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "url") {
                try {
                    new URL(input.data);
                }
                catch (_a) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "url",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "regex") {
                check.regex.lastIndex = 0;
                const testResult = check.regex.test(input.data);
                if (!testResult) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "regex",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "trim") {
                input.data = input.data.trim();
            }
            else if (check.kind === "includes") {
                if (!input.data.includes(check.value, check.position)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: { includes: check.value, position: check.position },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "toLowerCase") {
                input.data = input.data.toLowerCase();
            }
            else if (check.kind === "toUpperCase") {
                input.data = input.data.toUpperCase();
            }
            else if (check.kind === "startsWith") {
                if (!input.data.startsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: { startsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "endsWith") {
                if (!input.data.endsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: { endsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "datetime") {
                const regex = datetimeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: "datetime",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "date") {
                const regex = dateRegex;
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: "date",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "time") {
                const regex = timeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: "time",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "duration") {
                if (!durationRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "duration",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ip") {
                if (!isValidIP(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "ip",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "base64") {
                if (!base64Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "base64",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
            validation,
            code: ZodIssueCode.invalid_string,
            ...errorUtil.errToObj(message),
        });
    }
    _addCheck(check) {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
    }
    url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
    }
    emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
    }
    uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
    }
    nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
    }
    cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
    }
    cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
    }
    ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
    }
    base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
    }
    ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
    }
    datetime(options) {
        var _a, _b;
        if (typeof options === "string") {
            return this._addCheck({
                kind: "datetime",
                precision: null,
                offset: false,
                local: false,
                message: options,
            });
        }
        return this._addCheck({
            kind: "datetime",
            precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
            offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
            local: (_b = options === null || options === void 0 ? void 0 : options.local) !== null && _b !== void 0 ? _b : false,
            ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
        });
    }
    date(message) {
        return this._addCheck({ kind: "date", message });
    }
    time(options) {
        if (typeof options === "string") {
            return this._addCheck({
                kind: "time",
                precision: null,
                message: options,
            });
        }
        return this._addCheck({
            kind: "time",
            precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
            ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
        });
    }
    duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil.errToObj(message),
        });
    }
    includes(value, options) {
        return this._addCheck({
            kind: "includes",
            value: value,
            position: options === null || options === void 0 ? void 0 : options.position,
            ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
        });
    }
    startsWith(value, message) {
        return this._addCheck({
            kind: "startsWith",
            value: value,
            ...errorUtil.errToObj(message),
        });
    }
    endsWith(value, message) {
        return this._addCheck({
            kind: "endsWith",
            value: value,
            ...errorUtil.errToObj(message),
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil.errToObj(message),
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil.errToObj(message),
        });
    }
    length(len, message) {
        return this._addCheck({
            kind: "length",
            value: len,
            ...errorUtil.errToObj(message),
        });
    }
    /**
     * @deprecated Use z.string().min(1) instead.
     * @see {@link ZodString.min}
     */
    nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
    }
    trim() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "trim" }],
        });
    }
    toLowerCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toLowerCase" }],
        });
    }
    toUpperCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toUpperCase" }],
        });
    }
    get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
    }
    get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
    }
    get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
    }
    get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
    }
    get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
    }
    get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
ZodString.create = (params) => {
    var _a;
    return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params),
    });
};
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return (valInt % stepInt) / Math.pow(10, decCount);
}
class ZodNumber extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.number,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        let ctx = undefined;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "int") {
                if (!util.isInteger(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "min") {
                const tooSmall = check.inclusive
                    ? input.data < check.value
                    : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive
                    ? input.data > check.value
                    : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (floatSafeRemainder(input.data, check.value) !== 0) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "finite") {
                if (!Number.isFinite(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_finite,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodNumber({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil.toString(message),
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil.toString(message),
        });
    }
    finite(message) {
        return this._addCheck({
            kind: "finite",
            message: errorUtil.toString(message),
        });
    }
    safe(message) {
        return this._addCheck({
            kind: "min",
            inclusive: true,
            value: Number.MIN_SAFE_INTEGER,
            message: errorUtil.toString(message),
        })._addCheck({
            kind: "max",
            inclusive: true,
            value: Number.MAX_SAFE_INTEGER,
            message: errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" ||
            (ch.kind === "multipleOf" && util.isInteger(ch.value)));
    }
    get isFinite() {
        let max = null, min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "finite" ||
                ch.kind === "int" ||
                ch.kind === "multipleOf") {
                return true;
            }
            else if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
            else if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return Number.isFinite(min) && Number.isFinite(max);
    }
}
ZodNumber.create = (params) => {
    return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params),
    });
};
class ZodBigInt extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = BigInt(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.bigint,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        let ctx = undefined;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                const tooSmall = check.inclusive
                    ? input.data < check.value
                    : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        type: "bigint",
                        minimum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive
                    ? input.data > check.value
                    : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        type: "bigint",
                        maximum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (input.data % check.value !== BigInt(0)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodBigInt({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodBigInt({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
ZodBigInt.create = (params) => {
    var _a;
    return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params),
    });
};
class ZodBoolean extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.boolean,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodBoolean.create = (params) => {
    return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params),
    });
};
class ZodDate extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.date,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (isNaN(input.data.getTime())) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_date,
            });
            return INVALID;
        }
        const status = new ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.getTime() < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        minimum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.getTime() > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        maximum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: new Date(input.data.getTime()),
        };
    }
    _addCheck(check) {
        return new ZodDate({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    min(minDate, message) {
        return this._addCheck({
            kind: "min",
            value: minDate.getTime(),
            message: errorUtil.toString(message),
        });
    }
    max(maxDate, message) {
        return this._addCheck({
            kind: "max",
            value: maxDate.getTime(),
            message: errorUtil.toString(message),
        });
    }
    get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min != null ? new Date(min) : null;
    }
    get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max != null ? new Date(max) : null;
    }
}
ZodDate.create = (params) => {
    return new ZodDate({
        checks: [],
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params),
    });
};
class ZodSymbol extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.symbol,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodSymbol.create = (params) => {
    return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params),
    });
};
class ZodUndefined extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.undefined,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodUndefined.create = (params) => {
    return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params),
    });
};
class ZodNull extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.null,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodNull.create = (params) => {
    return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params),
    });
};
class ZodAny extends ZodType {
    constructor() {
        super(...arguments);
        // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
        this._any = true;
    }
    _parse(input) {
        return OK(input.data);
    }
}
ZodAny.create = (params) => {
    return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params),
    });
};
class ZodUnknown extends ZodType {
    constructor() {
        super(...arguments);
        // required
        this._unknown = true;
    }
    _parse(input) {
        return OK(input.data);
    }
}
ZodUnknown.create = (params) => {
    return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params),
    });
};
class ZodNever extends ZodType {
    _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.never,
            received: ctx.parsedType,
        });
        return INVALID;
    }
}
ZodNever.create = (params) => {
    return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params),
    });
};
class ZodVoid extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.void,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodVoid.create = (params) => {
    return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params),
    });
};
class ZodArray extends ZodType {
    _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (def.exactLength !== null) {
            const tooBig = ctx.data.length > def.exactLength.value;
            const tooSmall = ctx.data.length < def.exactLength.value;
            if (tooBig || tooSmall) {
                addIssueToContext(ctx, {
                    code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
                    minimum: (tooSmall ? def.exactLength.value : undefined),
                    maximum: (tooBig ? def.exactLength.value : undefined),
                    type: "array",
                    inclusive: true,
                    exact: true,
                    message: def.exactLength.message,
                });
                status.dirty();
            }
        }
        if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.minLength.message,
                });
                status.dirty();
            }
        }
        if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.maxLength.message,
                });
                status.dirty();
            }
        }
        if (ctx.common.async) {
            return Promise.all([...ctx.data].map((item, i) => {
                return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
            })).then((result) => {
                return ParseStatus.mergeArray(status, result);
            });
        }
        const result = [...ctx.data].map((item, i) => {
            return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray({
            ...this._def,
            minLength: { value: minLength, message: errorUtil.toString(message) },
        });
    }
    max(maxLength, message) {
        return new ZodArray({
            ...this._def,
            maxLength: { value: maxLength, message: errorUtil.toString(message) },
        });
    }
    length(len, message) {
        return new ZodArray({
            ...this._def,
            exactLength: { value: len, message: errorUtil.toString(message) },
        });
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
ZodArray.create = (schema, params) => {
    return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params),
    });
};
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
            ...schema._def,
            shape: () => newShape,
        });
    }
    else if (schema instanceof ZodArray) {
        return new ZodArray({
            ...schema._def,
            type: deepPartialify(schema.element),
        });
    }
    else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    }
    else {
        return schema;
    }
}
class ZodObject extends ZodType {
    constructor() {
        super(...arguments);
        this._cached = null;
        /**
         * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
         * If you want to pass through unknown properties, use `.passthrough()` instead.
         */
        this.nonstrict = this.passthrough;
        // extend<
        //   Augmentation extends ZodRawShape,
        //   NewOutput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
        //       ? Augmentation[k]["_output"]
        //       : k extends keyof Output
        //       ? Output[k]
        //       : never;
        //   }>,
        //   NewInput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
        //       ? Augmentation[k]["_input"]
        //       : k extends keyof Input
        //       ? Input[k]
        //       : never;
        //   }>
        // >(
        //   augmentation: Augmentation
        // ): ZodObject<
        //   extendShape<T, Augmentation>,
        //   UnknownKeys,
        //   Catchall,
        //   NewOutput,
        //   NewInput
        // > {
        //   return new ZodObject({
        //     ...this._def,
        //     shape: () => ({
        //       ...this._def.shape(),
        //       ...augmentation,
        //     }),
        //   }) as any;
        // }
        /**
         * @deprecated Use `.extend` instead
         *  */
        this.augment = this.extend;
    }
    _getCached() {
        if (this._cached !== null)
            return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        return (this._cached = { shape, keys });
    }
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever &&
            this._def.unknownKeys === "strip")) {
            for (const key in ctx.data) {
                if (!shapeKeys.includes(key)) {
                    extraKeys.push(key);
                }
            }
        }
        const pairs = [];
        for (const key of shapeKeys) {
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
                key: { status: "valid", value: key },
                value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                for (const key of extraKeys) {
                    pairs.push({
                        key: { status: "valid", value: key },
                        value: { status: "valid", value: ctx.data[key] },
                    });
                }
            }
            else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.unrecognized_keys,
                        keys: extraKeys,
                    });
                    status.dirty();
                }
            }
            else if (unknownKeys === "strip") ;
            else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        }
        else {
            // run catchall validation
            const catchall = this._def.catchall;
            for (const key of extraKeys) {
                const value = ctx.data[key];
                pairs.push({
                    key: { status: "valid", value: key },
                    value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key) //, ctx.child(key), value, getParsedType(value)
                    ),
                    alwaysSet: key in ctx.data,
                });
            }
        }
        if (ctx.common.async) {
            return Promise.resolve()
                .then(async () => {
                const syncPairs = [];
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    syncPairs.push({
                        key,
                        value,
                        alwaysSet: pair.alwaysSet,
                    });
                }
                return syncPairs;
            })
                .then((syncPairs) => {
                return ParseStatus.mergeObjectSync(status, syncPairs);
            });
        }
        else {
            return ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict(message) {
        errorUtil.errToObj;
        return new ZodObject({
            ...this._def,
            unknownKeys: "strict",
            ...(message !== undefined
                ? {
                    errorMap: (issue, ctx) => {
                        var _a, _b, _c, _d;
                        const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
                        if (issue.code === "unrecognized_keys")
                            return {
                                message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError,
                            };
                        return {
                            message: defaultError,
                        };
                    },
                }
                : {}),
        });
    }
    strip() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strip",
        });
    }
    passthrough() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "passthrough",
        });
    }
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
        return new ZodObject({
            ...this._def,
            shape: () => ({
                ...this._def.shape(),
                ...augmentation,
            }),
        });
    }
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge(merging) {
        const merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: () => ({
                ...this._def.shape(),
                ...merging._def.shape(),
            }),
            typeName: ZodFirstPartyTypeKind.ZodObject,
        });
        return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
        return this.augment({ [key]: schema });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
        return new ZodObject({
            ...this._def,
            catchall: index,
        });
    }
    pick(mask) {
        const shape = {};
        util.objectKeys(mask).forEach((key) => {
            if (mask[key] && this.shape[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    omit(mask) {
        const shape = {};
        util.objectKeys(this.shape).forEach((key) => {
            if (!mask[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    /**
     * @deprecated
     */
    deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key) => {
            const fieldSchema = this.shape[key];
            if (mask && !mask[key]) {
                newShape[key] = fieldSchema;
            }
            else {
                newShape[key] = fieldSchema.optional();
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    required(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key) => {
            if (mask && !mask[key]) {
                newShape[key] = this.shape[key];
            }
            else {
                const fieldSchema = this.shape[key];
                let newField = fieldSchema;
                while (newField instanceof ZodOptional) {
                    newField = newField._def.innerType;
                }
                newShape[key] = newField;
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    keyof() {
        return createZodEnum(util.objectKeys(this.shape));
    }
}
ZodObject.create = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
class ZodUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
            // return first issue-free validation if it exists
            for (const result of results) {
                if (result.result.status === "valid") {
                    return result.result;
                }
            }
            for (const result of results) {
                if (result.result.status === "dirty") {
                    // add issues from dirty option
                    ctx.common.issues.push(...result.ctx.common.issues);
                    return result.result;
                }
            }
            // return invalid
            const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union,
                unionErrors,
            });
            return INVALID;
        }
        if (ctx.common.async) {
            return Promise.all(options.map(async (option) => {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                return {
                    result: await option._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx,
                    }),
                    ctx: childCtx,
                };
            })).then(handleResults);
        }
        else {
            let dirty = undefined;
            const issues = [];
            for (const option of options) {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                const result = option._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: childCtx,
                });
                if (result.status === "valid") {
                    return result;
                }
                else if (result.status === "dirty" && !dirty) {
                    dirty = { result, ctx: childCtx };
                }
                if (childCtx.common.issues.length) {
                    issues.push(childCtx.common.issues);
                }
            }
            if (dirty) {
                ctx.common.issues.push(...dirty.ctx.common.issues);
                return dirty.result;
            }
            const unionErrors = issues.map((issues) => new ZodError(issues));
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union,
                unionErrors,
            });
            return INVALID;
        }
    }
    get options() {
        return this._def.options;
    }
}
ZodUnion.create = (types, params) => {
    return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params),
    });
};
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
const getDiscriminator = (type) => {
    if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
    }
    else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
    }
    else if (type instanceof ZodLiteral) {
        return [type.value];
    }
    else if (type instanceof ZodEnum) {
        return type.options;
    }
    else if (type instanceof ZodNativeEnum) {
        // eslint-disable-next-line ban/ban
        return util.objectValues(type.enum);
    }
    else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
    }
    else if (type instanceof ZodUndefined) {
        return [undefined];
    }
    else if (type instanceof ZodNull) {
        return [null];
    }
    else if (type instanceof ZodOptional) {
        return [undefined, ...getDiscriminator(type.unwrap())];
    }
    else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
    }
    else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
    }
    else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
    }
    else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
    }
    else {
        return [];
    }
};
class ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union_discriminator,
                options: Array.from(this.optionsMap.keys()),
                path: [discriminator],
            });
            return INVALID;
        }
        if (ctx.common.async) {
            return option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
        else {
            return option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
    }
    get discriminator() {
        return this._def.discriminator;
    }
    get options() {
        return this._def.options;
    }
    get optionsMap() {
        return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    static create(discriminator, options, params) {
        // Get all the valid discriminator values
        const optionsMap = new Map();
        // try {
        for (const type of options) {
            const discriminatorValues = getDiscriminator(type.shape[discriminator]);
            if (!discriminatorValues.length) {
                throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
            }
            for (const value of discriminatorValues) {
                if (optionsMap.has(value)) {
                    throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
                }
                optionsMap.set(value, type);
            }
        }
        return new ZodDiscriminatedUnion({
            typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
            discriminator,
            options,
            optionsMap,
            ...processCreateParams(params),
        });
    }
}
function mergeValues(a, b) {
    const aType = getParsedType(a);
    const bType = getParsedType(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
        const bKeys = util.objectKeys(b);
        const sharedKeys = util
            .objectKeys(a)
            .filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
        if (a.length !== b.length) {
            return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    else if (aType === ZodParsedType.date &&
        bType === ZodParsedType.date &&
        +a === +b) {
        return { valid: true, data: a };
    }
    else {
        return { valid: false };
    }
}
class ZodIntersection extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
            if (isAborted(parsedLeft) || isAborted(parsedRight)) {
                return INVALID;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_intersection_types,
                });
                return INVALID;
            }
            if (isDirty(parsedLeft) || isDirty(parsedRight)) {
                status.dirty();
            }
            return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
            ]).then(([left, right]) => handleParsed(left, right));
        }
        else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }));
        }
    }
}
ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
        left: left,
        right: right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params),
    });
};
class ZodTuple extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            status.dirty();
        }
        const items = [...ctx.data]
            .map((item, itemIndex) => {
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema)
                return null;
            return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        })
            .filter((x) => !!x); // filter nulls
        if (ctx.common.async) {
            return Promise.all(items).then((results) => {
                return ParseStatus.mergeArray(status, results);
            });
        }
        else {
            return ParseStatus.mergeArray(status, items);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple({
            ...this._def,
            rest,
        });
    }
}
ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params),
    });
};
class ZodRecord extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
            pairs.push({
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
                value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (ctx.common.async) {
            return ParseStatus.mergeObjectAsync(status, pairs);
        }
        else {
            return ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(third),
            });
        }
        return new ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second),
        });
    }
}
class ZodMap extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.map,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
            return {
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
                value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])),
            };
        });
        if (ctx.common.async) {
            const finalMap = new Map();
            return Promise.resolve().then(async () => {
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return INVALID;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return { status: status.value, value: finalMap };
            });
        }
        else {
            const finalMap = new Map();
            for (const pair of pairs) {
                const key = pair.key;
                const value = pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                    return INVALID;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                    status.dirty();
                }
                finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
        }
    }
}
ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params),
    });
};
class ZodSet extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.set,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: def.minSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.minSize.message,
                });
                status.dirty();
            }
        }
        if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: def.maxSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.maxSize.message,
                });
                status.dirty();
            }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements) {
            const parsedSet = new Set();
            for (const element of elements) {
                if (element.status === "aborted")
                    return INVALID;
                if (element.status === "dirty")
                    status.dirty();
                parsedSet.add(element.value);
            }
            return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
            return Promise.all(elements).then((elements) => finalizeSet(elements));
        }
        else {
            return finalizeSet(elements);
        }
    }
    min(minSize, message) {
        return new ZodSet({
            ...this._def,
            minSize: { value: minSize, message: errorUtil.toString(message) },
        });
    }
    max(maxSize, message) {
        return new ZodSet({
            ...this._def,
            maxSize: { value: maxSize, message: errorUtil.toString(message) },
        });
    }
    size(size, message) {
        return this.min(size, message).max(size, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
ZodSet.create = (valueType, params) => {
    return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params),
    });
};
class ZodFunction extends ZodType {
    constructor() {
        super(...arguments);
        this.validate = this.implement;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.function,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        function makeArgsIssue(args, error) {
            return makeIssue({
                data: args,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    getErrorMap(),
                    errorMap,
                ].filter((x) => !!x),
                issueData: {
                    code: ZodIssueCode.invalid_arguments,
                    argumentsError: error,
                },
            });
        }
        function makeReturnsIssue(returns, error) {
            return makeIssue({
                data: returns,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    getErrorMap(),
                    errorMap,
                ].filter((x) => !!x),
                issueData: {
                    code: ZodIssueCode.invalid_return_type,
                    returnTypeError: error,
                },
            });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return OK(async function (...args) {
                const error = new ZodError([]);
                const parsedArgs = await me._def.args
                    .parseAsync(args, params)
                    .catch((e) => {
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await Reflect.apply(fn, this, parsedArgs);
                const parsedReturns = await me._def.returns._def.type
                    .parseAsync(result, params)
                    .catch((e) => {
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        }
        else {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return OK(function (...args) {
                const parsedArgs = me._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
                }
                const result = Reflect.apply(fn, this, parsedArgs.data);
                const parsedReturns = me._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create()),
        });
    }
    returns(returnType) {
        return new ZodFunction({
            ...this._def,
            returns: returnType,
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    static create(args, returns, params) {
        return new ZodFunction({
            args: (args
                ? args
                : ZodTuple.create([]).rest(ZodUnknown.create())),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params),
        });
    }
}
class ZodLazy extends ZodType {
    get schema() {
        return this._def.getter();
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
}
ZodLazy.create = (getter, params) => {
    return new ZodLazy({
        getter: getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params),
    });
};
class ZodLiteral extends ZodType {
    _parse(input) {
        if (input.data !== this._def.value) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_literal,
                expected: this._def.value,
            });
            return INVALID;
        }
        return { status: "valid", value: input.data };
    }
    get value() {
        return this._def.value;
    }
}
ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
        value: value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params),
    });
};
function createZodEnum(values, params) {
    return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params),
    });
}
class ZodEnum extends ZodType {
    constructor() {
        super(...arguments);
        _ZodEnum_cache.set(this, void 0);
    }
    _parse(input) {
        if (typeof input.data !== "string") {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
                expected: util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodIssueCode.invalid_type,
            });
            return INVALID;
        }
        if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f")) {
            __classPrivateFieldSet(this, _ZodEnum_cache, new Set(this._def.values), "f");
        }
        if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f").has(input.data)) {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return INVALID;
        }
        return OK(input.data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    extract(values, newDef = this._def) {
        return ZodEnum.create(values, {
            ...this._def,
            ...newDef,
        });
    }
    exclude(values, newDef = this._def) {
        return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
            ...this._def,
            ...newDef,
        });
    }
}
_ZodEnum_cache = new WeakMap();
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
    constructor() {
        super(...arguments);
        _ZodNativeEnum_cache.set(this, void 0);
    }
    _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string &&
            ctx.parsedType !== ZodParsedType.number) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
                expected: util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodIssueCode.invalid_type,
            });
            return INVALID;
        }
        if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f")) {
            __classPrivateFieldSet(this, _ZodNativeEnum_cache, new Set(util.getValidEnumValues(this._def.values)), "f");
        }
        if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f").has(input.data)) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return INVALID;
        }
        return OK(input.data);
    }
    get enum() {
        return this._def.values;
    }
}
_ZodNativeEnum_cache = new WeakMap();
ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params),
    });
};
class ZodPromise extends ZodType {
    unwrap() {
        return this._def.type;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise &&
            ctx.common.async === false) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.promise,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise
            ? ctx.data
            : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
            return this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.common.contextualErrorMap,
            });
        }));
    }
}
ZodPromise.create = (schema, params) => {
    return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params),
    });
};
class ZodEffects extends ZodType {
    innerType() {
        return this._def.schema;
    }
    sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
            ? this._def.schema.sourceType()
            : this._def.schema;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
            addIssue: (arg) => {
                addIssueToContext(ctx, arg);
                if (arg.fatal) {
                    status.abort();
                }
                else {
                    status.dirty();
                }
            },
            get path() {
                return ctx.path;
            },
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data, checkCtx);
            if (ctx.common.async) {
                return Promise.resolve(processed).then(async (processed) => {
                    if (status.value === "aborted")
                        return INVALID;
                    const result = await this._def.schema._parseAsync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx,
                    });
                    if (result.status === "aborted")
                        return INVALID;
                    if (result.status === "dirty")
                        return DIRTY(result.value);
                    if (status.value === "dirty")
                        return DIRTY(result.value);
                    return result;
                });
            }
            else {
                if (status.value === "aborted")
                    return INVALID;
                const result = this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx,
                });
                if (result.status === "aborted")
                    return INVALID;
                if (result.status === "dirty")
                    return DIRTY(result.value);
                if (status.value === "dirty")
                    return DIRTY(result.value);
                return result;
            }
        }
        if (effect.type === "refinement") {
            const executeRefinement = (acc) => {
                const result = effect.refinement(acc, checkCtx);
                if (ctx.common.async) {
                    return Promise.resolve(result);
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.common.async === false) {
                const inner = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inner.status === "aborted")
                    return INVALID;
                if (inner.status === "dirty")
                    status.dirty();
                // return value is ignored
                executeRefinement(inner.value);
                return { status: status.value, value: inner.value };
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then((inner) => {
                    if (inner.status === "aborted")
                        return INVALID;
                    if (inner.status === "dirty")
                        status.dirty();
                    return executeRefinement(inner.value).then(() => {
                        return { status: status.value, value: inner.value };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.common.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (!isValid(base))
                    return base;
                const result = effect.transform(base.value, checkCtx);
                if (result instanceof Promise) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return { status: status.value, value: result };
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then((base) => {
                    if (!isValid(base))
                        return base;
                    return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
                });
            }
        }
        util.assertNever(effect);
    }
}
ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params),
    });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params),
    });
};
class ZodOptional extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
            return OK(undefined);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodOptional.create = (type, params) => {
    return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params),
    });
};
class ZodNullable extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
            return OK(null);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodNullable.create = (type, params) => {
    return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params),
    });
};
class ZodDefault extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    removeDefault() {
        return this._def.innerType;
    }
}
ZodDefault.create = (type, params) => {
    return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function"
            ? params.default
            : () => params.default,
        ...processCreateParams(params),
    });
};
class ZodCatch extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        // newCtx is used to not collect issues from inner types in ctx
        const newCtx = {
            ...ctx,
            common: {
                ...ctx.common,
                issues: [],
            },
        };
        const result = this._def.innerType._parse({
            data: newCtx.data,
            path: newCtx.path,
            parent: {
                ...newCtx,
            },
        });
        if (isAsync(result)) {
            return result.then((result) => {
                return {
                    status: "valid",
                    value: result.status === "valid"
                        ? result.value
                        : this._def.catchValue({
                            get error() {
                                return new ZodError(newCtx.common.issues);
                            },
                            input: newCtx.data,
                        }),
                };
            });
        }
        else {
            return {
                status: "valid",
                value: result.status === "valid"
                    ? result.value
                    : this._def.catchValue({
                        get error() {
                            return new ZodError(newCtx.common.issues);
                        },
                        input: newCtx.data,
                    }),
            };
        }
    }
    removeCatch() {
        return this._def.innerType;
    }
}
ZodCatch.create = (type, params) => {
    return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params),
    });
};
class ZodNaN extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.nan,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return { status: "valid", value: input.data };
    }
}
ZodNaN.create = (params) => {
    return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params),
    });
};
class ZodBranded extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    unwrap() {
        return this._def.type;
    }
}
class ZodPipeline extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
            const handleAsync = async () => {
                const inResult = await this._def.in._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inResult.status === "aborted")
                    return INVALID;
                if (inResult.status === "dirty") {
                    status.dirty();
                    return DIRTY(inResult.value);
                }
                else {
                    return this._def.out._parseAsync({
                        data: inResult.value,
                        path: ctx.path,
                        parent: ctx,
                    });
                }
            };
            return handleAsync();
        }
        else {
            const inResult = this._def.in._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
            if (inResult.status === "aborted")
                return INVALID;
            if (inResult.status === "dirty") {
                status.dirty();
                return {
                    status: "dirty",
                    value: inResult.value,
                };
            }
            else {
                return this._def.out._parseSync({
                    data: inResult.value,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
    }
    static create(a, b) {
        return new ZodPipeline({
            in: a,
            out: b,
            typeName: ZodFirstPartyTypeKind.ZodPipeline,
        });
    }
}
class ZodReadonly extends ZodType {
    _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
            if (isValid(data)) {
                data.value = Object.freeze(data.value);
            }
            return data;
        };
        return isAsync(result)
            ? result.then((data) => freeze(data))
            : freeze(result);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodReadonly.create = (type, params) => {
    return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params),
    });
};
({
    object: ZodObject.lazycreate,
});
var ZodFirstPartyTypeKind;
(function (ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
const stringType = ZodString.create;
const numberType = ZodNumber.create;
ZodNaN.create;
ZodBigInt.create;
const booleanType = ZodBoolean.create;
ZodDate.create;
ZodSymbol.create;
ZodUndefined.create;
ZodNull.create;
ZodAny.create;
ZodUnknown.create;
ZodNever.create;
ZodVoid.create;
ZodArray.create;
const objectType = ZodObject.create;
ZodObject.strictCreate;
ZodUnion.create;
ZodDiscriminatedUnion.create;
ZodIntersection.create;
ZodTuple.create;
ZodRecord.create;
ZodMap.create;
ZodSet.create;
ZodFunction.create;
ZodLazy.create;
ZodLiteral.create;
const enumType = ZodEnum.create;
ZodNativeEnum.create;
ZodPromise.create;
ZodEffects.create;
ZodOptional.create;
ZodNullable.create;
ZodEffects.createWithPreprocess;
ZodPipeline.create;

await importShared('react');
objectType({
  energyLevel: numberType().min(1).max(10),
  timeOfDay: enumType(["morning", "afternoon", "evening", "night"]),
  caffeineConsumed: booleanType(),
  caffeineAmountMg: numberType().min(0).optional(),
  physicalActivity: booleanType(),
  sleepHours: numberType().min(0).max(24),
  notes: stringType().optional()
});

await importShared('react');

await importShared('react');

const {useState: useState$5} = await importShared('react');

const {useNavigate: useNavigate$2} = await importShared('react-router-dom');
const gamesData$1 = [
  {
    id: "breathing-exercise",
    name: "Breathing Exercise",
    description: "Focus on your breath to reduce stress and cravings",
    category: "breathing",
    difficulty: "easy",
    thumbnail: "icon",
    playTime: 3,
    benefits: ["Reduces stress", "Manages cravings", "Improves focus"]
  },
  {
    id: "memory-cards",
    name: "Memory Match",
    description: "Test your memory by matching card pairs",
    category: "focus",
    difficulty: "medium",
    thumbnail: "icon",
    playTime: 5,
    benefits: ["Improves memory", "Enhances concentration", "Distracts from cravings"]
  },
  {
    id: "zen-garden",
    name: "Zen Garden",
    description: "Create a peaceful garden to calm your mind",
    category: "relaxation",
    difficulty: "easy",
    thumbnail: "icon",
    playTime: 10,
    benefits: ["Promotes relaxation", "Encourages creativity", "Reduces anxiety"]
  },
  {
    id: "word-scramble",
    name: "Word Scramble",
    description: "Unscramble letters to form words",
    category: "focus",
    difficulty: "medium",
    thumbnail: "icon",
    playTime: 5,
    benefits: ["Builds vocabulary", "Challenges the mind", "Improves cognition"]
  },
  {
    id: "pattern-match",
    name: "Pattern Match",
    description: "Find and match visual patterns quickly",
    category: "focus",
    difficulty: "hard",
    thumbnail: "icon",
    playTime: 3,
    benefits: ["Sharpens observation", "Trains visual processing", "Builds focus"]
  },
  {
    id: "balloon-journey",
    name: "Balloon Journey",
    description: "Guide a balloon with controlled breathing",
    category: "breathing",
    difficulty: "medium",
    thumbnail: "icon",
    playTime: 5,
    benefits: ["Regulates breathing", "Encourages mindfulness", "Enhances relaxation"]
  }
];
const GameHub = ({ session }) => {
  const navigate = useNavigate$2();
  const [activeTab, setActiveTab] = useState$5("all");
  const filteredGames = activeTab === "all" ? gamesData$1 : gamesData$1.filter((game) => game.category === activeTab);
  const getGameIcon = (category) => {
    switch (category) {
      case "breathing":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Wind$1, { className: "h-6 w-6 text-blue-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 93,
          columnNumber: 16
        }, globalThis);
      case "focus":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BrainCircuit, { className: "h-6 w-6 text-purple-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 95,
          columnNumber: 16
        }, globalThis);
      case "relaxation":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-6 w-6 text-green-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 97,
          columnNumber: 16
        }, globalThis);
      case "puzzle":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Puzzle, { className: "h-6 w-6 text-amber-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 99,
          columnNumber: 16
        }, globalThis);
      default:
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-6 w-6 text-primary" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 101,
          columnNumber: 16
        }, globalThis);
    }
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };
  const handleGameSelect = (gameId) => {
    navigate(`/app/games/${gameId}`);
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 py-6 mx-auto max-w-6xl", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold tracking-tight", children: "Game Hub" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 128,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Interactive games to help you manage cravings and improve wellbeing" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 129,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 127,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "w-full md:w-auto", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Avatar, { className: "h-10 w-10 bg-primary/10", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AvatarFallback, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-5 w-5 text-primary" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 139,
            columnNumber: 19
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 138,
            columnNumber: 17
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 137,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium", children: "Your achievements" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 143,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Play games to earn rewards" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 144,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 142,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 136,
          columnNumber: 13
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 135,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "pt-0 pb-4 px-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => navigate("/app/achievements"), children: "View All Achievements" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 149,
          columnNumber: 13
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 148,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 134,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
      lineNumber: 126,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "all", value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "w-full md:w-auto", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "all", className: "flex gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Activity, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 160,
            columnNumber: 15
          }, globalThis),
          "All Games"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 159,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "breathing", className: "flex gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Wind$1, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 164,
            columnNumber: 15
          }, globalThis),
          "Breathing"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 163,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "focus", className: "flex gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(BrainCircuit, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 168,
            columnNumber: 15
          }, globalThis),
          "Focus"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 167,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "relaxation", className: "flex gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 172,
            columnNumber: 15
          }, globalThis),
          "Relaxation"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 171,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "puzzle", className: "flex gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Puzzle, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 176,
            columnNumber: 15
          }, globalThis),
          "Puzzles"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 175,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 158,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 157,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "all", className: "mt-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredGames.map((game) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "aspect-video bg-muted relative", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-0 flex items-center justify-center bg-primary/5", children: getGameIcon(game.category) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 187,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 186,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: game.name }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 194,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: game.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 195,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 193,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: getDifficultyColor(game.difficulty), children: game.difficulty }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 197,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 192,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 191,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-2", children: game.benefits.map((benefit, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", className: "font-normal", children: benefit }, index, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 205,
          columnNumber: 23
        }, globalThis)) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 203,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 202,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: [
            "~",
            game.playTime,
            " min"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 212,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: () => handleGameSelect(game.id), children: [
            "Play",
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowRight, { className: "ml-2 h-4 w-4" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 217,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 215,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 211,
          columnNumber: 17
        }, globalThis)
      ] }, game.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 185,
        columnNumber: 15
      }, globalThis)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 183,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 182,
        columnNumber: 9
      }, globalThis),
      ["breathing", "focus", "relaxation", "puzzle"].map((category) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: category, className: "mt-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredGames.map((game) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "aspect-video bg-muted relative", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute inset-0 flex items-center justify-center bg-primary/5", children: getGameIcon(game.category) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 232,
          columnNumber: 21
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 231,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: game.name }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 239,
              columnNumber: 25
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: game.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 240,
              columnNumber: 25
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 238,
            columnNumber: 23
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: getDifficultyColor(game.difficulty), children: game.difficulty }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 242,
            columnNumber: 23
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 237,
          columnNumber: 21
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 236,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-2", children: game.benefits.map((benefit, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", className: "font-normal", children: benefit }, index, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 250,
          columnNumber: 25
        }, globalThis)) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 248,
          columnNumber: 21
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 247,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: [
            "~",
            game.playTime,
            " min"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 257,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: () => handleGameSelect(game.id), children: [
            "Play",
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowRight, { className: "ml-2 h-4 w-4" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
              lineNumber: 262,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
            lineNumber: 260,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
          lineNumber: 256,
          columnNumber: 19
        }, globalThis)
      ] }, game.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 230,
        columnNumber: 17
      }, globalThis)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 228,
        columnNumber: 13
      }, globalThis) }, category, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
        lineNumber: 227,
        columnNumber: 11
      }, globalThis))
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
      lineNumber: 156,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameHub.tsx",
    lineNumber: 125,
    columnNumber: 5
  }, globalThis);
};

const {useState: useState$4,useEffect: useEffect$5,useRef} = await importShared('react');
const BreathingGame = ({
  session,
  onComplete,
  difficulty = "medium",
  onBack
}) => {
  const [isPlaying, setIsPlaying] = useState$4(false);
  const [breathingPhase, setBreathingPhase] = useState$4("rest");
  const [timeRemaining, setTimeRemaining] = useState$4(0);
  const [totalSessionTime, setTotalSessionTime] = useState$4(0);
  const [sessionCount, setSessionCount] = useState$4(0);
  const [breathingRate, setBreathingRate] = useState$4(8);
  const [animationProgress, setAnimationProgress] = useState$4(0);
  const [calmScore, setCalmScore] = useState$4(0);
  const timerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const difficultySettings = {
    easy: { minDuration: 60, maxBreathCount: 6 },
    medium: { minDuration: 120, maxBreathCount: 12 },
    hard: { minDuration: 180, maxBreathCount: 18 }
  };
  const initializeGame = () => {
    if (timerRef.current)
      clearInterval(timerRef.current);
    if (sessionTimerRef.current)
      clearInterval(sessionTimerRef.current);
    setBreathingPhase("rest");
    setTimeRemaining(0);
    setTotalSessionTime(0);
    setSessionCount(0);
    setCalmScore(0);
    setAnimationProgress(0);
  };
  const startBreathing = () => {
    setIsPlaying(true);
    setSessionCount((prev) => prev + 1);
    const startTime = Date.now();
    sessionTimerRef.current = setInterval(() => {
      setTotalSessionTime(Math.floor((Date.now() - startTime) / 1e3));
    }, 1e3);
    startBreathingCycle();
  };
  const stopBreathing = () => {
    setIsPlaying(false);
    if (timerRef.current)
      clearInterval(timerRef.current);
    if (sessionTimerRef.current)
      clearInterval(sessionTimerRef.current);
    const settings = difficultySettings[difficulty];
    const percentageCompleted = Math.min(100, sessionCount / settings.maxBreathCount * 100);
    const newCalmScore = Math.round(percentageCompleted);
    setCalmScore(newCalmScore);
    if (onComplete)
      onComplete(newCalmScore);
    if (session?.user?.id) {
      saveGameProgress(session.user.id, newCalmScore);
    }
  };
  const startBreathingCycle = () => {
    setBreathingPhase("inhale");
    const cycleDuration = 60 / breathingRate;
    const inhaleDuration = cycleDuration * 0.4;
    setTimeRemaining(Math.round(inhaleDuration));
    startPhaseTimer(inhaleDuration, "hold");
  };
  const startPhaseTimer = (duration, nextPhase) => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1e3;
    if (timerRef.current)
      clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1e3));
      setTimeRemaining(remaining);
      if (breathingPhase === "inhale") {
        const progress = 1 - remaining / duration;
        setAnimationProgress(progress);
      } else if (breathingPhase === "exhale") {
        const progress = remaining / duration;
        setAnimationProgress(progress);
      }
      if (remaining === 0) {
        setBreathingPhase(nextPhase);
        clearInterval(timerRef.current);
        if (nextPhase === "hold") {
          const holdDuration = 60 / breathingRate * 0.1;
          setTimeRemaining(Math.round(holdDuration));
          startPhaseTimer(holdDuration, "exhale");
        } else if (nextPhase === "exhale") {
          const exhaleDuration = 60 / breathingRate * 0.4;
          setTimeRemaining(Math.round(exhaleDuration));
          startPhaseTimer(exhaleDuration, "rest");
        } else if (nextPhase === "rest") {
          const restDuration = 60 / breathingRate * 0.1;
          setTimeRemaining(Math.round(restDuration));
          startPhaseTimer(restDuration, "inhale");
        } else if (nextPhase === "inhale") {
          const settings = difficultySettings[difficulty];
          if (sessionCount >= settings.maxBreathCount) {
            stopBreathing();
          } else {
            startBreathingCycle();
            setSessionCount((prev) => prev + 1);
          }
        }
      }
    }, 100);
  };
  const saveGameProgress = async (userId, score) => {
    try {
      const { data, error } = await supabase$1.from("game_progress").insert({
        user_id: userId,
        game_id: "breathing-exercise",
        score,
        time_played: totalSessionTime,
        difficulty,
        completed_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error) {
        console.error("Error saving game progress:", error);
      } else {
        console.log("Game progress saved:", data);
      }
    } catch (error) {
      console.error("Error saving game progress:", error);
    }
  };
  useEffect$5(() => {
    return () => {
      if (timerRef.current)
        clearInterval(timerRef.current);
      if (sessionTimerRef.current)
        clearInterval(sessionTimerRef.current);
    };
  }, []);
  useEffect$5(() => {
    initializeGame();
  }, [difficulty]);
  const mainCircleVariants = {
    inhale: {
      scale: 1.5,
      transition: { duration: 60 / breathingRate * 0.4, ease: "easeInOut" }
    },
    hold: {
      scale: 1.5,
      transition: { duration: 60 / breathingRate * 0.1, ease: "linear" }
    },
    exhale: {
      scale: 1,
      transition: { duration: 60 / breathingRate * 0.4, ease: "easeInOut" }
    },
    rest: {
      scale: 1,
      transition: { duration: 60 / breathingRate * 0.1, ease: "linear" }
    }
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "w-full max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Breathing Exercise" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 229,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Focus on your breath to reduce stress and cravings" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 230,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
        lineNumber: 228,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: isPlaying ? "default" : "outline", children: isPlaying ? "In Progress" : "Ready" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
        lineNumber: 234,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
      lineNumber: 227,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
      lineNumber: 226,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative w-64 h-64 my-8 flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        motion.div,
        {
          className: "w-48 h-48 bg-primary/20 rounded-full flex items-center justify-center",
          variants: mainCircleVariants,
          animate: breathingPhase,
          children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-semibold text-primary", children: [
              breathingPhase === "inhale" && "Breathe In",
              breathingPhase === "hold" && "Hold",
              breathingPhase === "exhale" && "Breathe Out",
              breathingPhase === "rest" && "Rest"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
              lineNumber: 249,
              columnNumber: 15
            }, globalThis),
            timeRemaining > 0 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xl text-primary/70", children: [
              timeRemaining,
              "s"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
              lineNumber: 256,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 248,
            columnNumber: 13
          }, globalThis)
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 243,
          columnNumber: 11
        },
        globalThis
      ) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
        lineNumber: 242,
        columnNumber: 9
      }, globalThis),
      !isPlaying && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-full space-y-2 mt-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
            "Breathing Rate: ",
            breathingRate,
            " breaths/min"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 268,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
            Math.round(60 / breathingRate),
            " seconds/breath"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 269,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 267,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Slider,
          {
            value: [breathingRate],
            min: 4,
            max: 12,
            step: 1,
            onValueChange: (val) => setBreathingRate(val[0])
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 271,
            columnNumber: 13
          },
          globalThis
        ),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Slower" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 279,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Faster" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 280,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 278,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
        lineNumber: 266,
        columnNumber: 11
      }, globalThis),
      isPlaying && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-full grid grid-cols-3 gap-4 mt-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Session" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 289,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xl font-semibold", children: [
            sessionCount,
            " / ",
            difficultySettings[difficulty].maxBreathCount
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 290,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 288,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Time" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 293,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xl font-semibold", children: [
            totalSessionTime,
            "s"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 294,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 292,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Rate" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 297,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xl font-semibold", children: [
            breathingRate,
            "/min"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 298,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 296,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
        lineNumber: 287,
        columnNumber: 11
      }, globalThis),
      !isPlaying && calmScore > 0 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-full mt-6 p-4 bg-muted rounded-lg", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-semibold text-center mb-2", children: "Session Complete" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 306,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Calm Score" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
              lineNumber: 309,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold text-primary", children: calmScore }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
              lineNumber: 310,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 308,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Time" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
              lineNumber: 313,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold", children: [
              totalSessionTime,
              "s"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
              lineNumber: 314,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
            lineNumber: 312,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 307,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
        lineNumber: 305,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
      lineNumber: 240,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", onClick: onBack, children: "Back" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
        lineNumber: 322,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: isPlaying ? "destructive" : "default",
          onClick: isPlaying ? stopBreathing : startBreathing,
          children: isPlaying ? "Stop" : "Start Breathing"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
          lineNumber: 326,
          columnNumber: 9
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
      lineNumber: 321,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/BreathingGame.tsx",
    lineNumber: 225,
    columnNumber: 5
  }, globalThis);
};

const {useState: useState$3,useEffect: useEffect$4} = await importShared('react');
const cardContents = [
  "🍎",
  "🍏",
  "🍊",
  "🍋",
  "🍓",
  "🍒",
  "🍉",
  "🍇",
  "🥝",
  "🍍",
  "🥥",
  "🍅",
  "🥑",
  "🥦",
  "🥕",
  "🌽"
];
const MemoryCards = ({
  session,
  onComplete,
  difficulty = "medium",
  onBack,
  numberOfPairs
}) => {
  const [cards, setCards] = useState$3([]);
  const [flippedCards, setFlippedCards] = useState$3([]);
  const [matchedPairs, setMatchedPairs] = useState$3(0);
  const [moves, setMoves] = useState$3(0);
  const [gameStarted, setGameStarted] = useState$3(false);
  const [gameOver, setGameOver] = useState$3(false);
  const [score, setScore] = useState$3(0);
  const [timer, setTimer] = useState$3(0);
  const [timerInterval, setTimerInterval] = useState$3(null);
  const getPairsCount = () => {
    if (numberOfPairs)
      return numberOfPairs;
    switch (difficulty) {
      case "easy":
        return 6;
      case "medium":
        return 8;
      case "hard":
        return 12;
      default:
        return 8;
    }
  };
  const initializeGame = () => {
    const pairsCount = getPairsCount();
    const selectedContents = [...cardContents].slice(0, pairsCount);
    let cardPairs = [];
    selectedContents.forEach((content, index) => {
      cardPairs.push({
        id: index * 2,
        content,
        flipped: false,
        matched: false
      });
      cardPairs.push({
        id: index * 2 + 1,
        content,
        flipped: false,
        matched: false
      });
    });
    cardPairs = shuffleCards(cardPairs);
    setCards(cardPairs);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameOver(false);
    setScore(0);
    setTimer(0);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };
  const shuffleCards = (cards2) => {
    const shuffled = [...cards2];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const handleCardClick = (cardId) => {
    if (!gameStarted) {
      setGameStarted(true);
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1e3);
      setTimerInterval(interval);
    }
    if (flippedCards.length === 2)
      return;
    const cardIndex = cards.findIndex((card) => card.id === cardId);
    const clickedCard = cards[cardIndex];
    if (clickedCard.matched || clickedCard.flipped)
      return;
    const newCards = [...cards];
    newCards[cardIndex] = { ...clickedCard, flipped: true };
    setCards(newCards);
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const firstCardId = newFlippedCards[0];
      const secondCardId = newFlippedCards[1];
      const firstCard = cards.find((card) => card.id === firstCardId);
      const secondCard = cards.find((card) => card.id === secondCardId);
      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        setTimeout(() => {
          const matchedCards = cards.map((card) => {
            if (card.id === firstCardId || card.id === secondCardId) {
              return { ...card, matched: true };
            }
            return card;
          });
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(matchedPairs + 1);
          confetti({
            particleCount: 30,
            spread: 70,
            origin: { y: 0.6 }
          });
          if (matchedPairs + 1 === getPairsCount()) {
            endGame();
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = cards.map((card) => {
            if (card.id === firstCardId || card.id === secondCardId) {
              return { ...card, flipped: false };
            }
            return card;
          });
          setCards(resetCards);
          setFlippedCards([]);
        }, 1e3);
      }
    }
  };
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    const pairsCount = getPairsCount();
    const perfectMoves = pairsCount;
    const moveScore = Math.max(0, 100 - (moves - perfectMoves) * 5);
    const timeScore = Math.max(0, 100 - timer / 2);
    const finalScore = Math.round((moveScore + timeScore) / 2);
    setScore(finalScore);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (session?.user?.id) {
      saveGameProgress(session.user.id, finalScore);
    }
    if (onComplete) {
      onComplete(finalScore);
    }
  };
  const restartGame = () => {
    initializeGame();
    setGameStarted(false);
  };
  const saveGameProgress = async (userId, score2) => {
    try {
      const { data, error } = await supabase$1.from("game_progress").insert({
        user_id: userId,
        game_id: "memory-cards",
        score: score2,
        time_played: timer,
        difficulty,
        completed_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error) {
        console.error("Error saving game progress:", error);
      } else {
        console.log("Game progress saved:", data);
      }
    } catch (error) {
      console.error("Error saving game progress:", error);
    }
  };
  useEffect$4(() => {
    initializeGame();
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [difficulty, numberOfPairs]);
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "w-full max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Memory Match" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 285,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Test your memory by matching card pairs" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 286,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
        lineNumber: 284,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: gameStarted ? "default" : gameOver ? "secondary" : "outline", children: gameOver ? "Completed" : gameStarted ? "In Progress" : "Ready" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
        lineNumber: 290,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
      lineNumber: 283,
      columnNumber: 9
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
      lineNumber: 282,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mb-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm text-muted-foreground", children: "Moves:" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 300,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-1 font-semibold", children: moves }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 301,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 299,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm text-muted-foreground", children: "Matched:" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 304,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-1 font-semibold", children: [
            matchedPairs,
            "/",
            getPairsCount()
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 305,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 303,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm text-muted-foreground", children: "Time:" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 308,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-1 font-semibold", children: formatTime(timer) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 309,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 307,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
        lineNumber: 298,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: `grid gap-2 mb-4 ${getPairsCount() <= 6 ? "grid-cols-4" : "grid-cols-4 md:grid-cols-6"}`, children: cards.map((card) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        motion.div,
        {
          className: `relative h-20 rounded-md cursor-pointer ${card.matched ? "opacity-60" : ""}`,
          onClick: () => handleCardClick(card.id),
          initial: { rotateY: 0 },
          animate: { rotateY: card.flipped ? 180 : 0 },
          transition: { duration: 0.5 },
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              motion.div,
              {
                className: "absolute inset-0 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-md",
                style: { backfaceVisibility: "hidden" },
                animate: { opacity: card.flipped ? 0 : 1 },
                children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xl", children: "?" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
                  lineNumber: 329,
                  columnNumber: 17
                }, globalThis)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
                lineNumber: 324,
                columnNumber: 15
              },
              globalThis
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              motion.div,
              {
                className: "absolute inset-0 flex items-center justify-center bg-primary/20 dark:bg-primary/30 rounded-md",
                style: { backfaceVisibility: "hidden", rotateY: 180 },
                animate: { opacity: card.flipped ? 1 : 0 },
                children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-3xl", children: card.content }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
                  lineNumber: 336,
                  columnNumber: 17
                }, globalThis)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
                lineNumber: 331,
                columnNumber: 15
              },
              globalThis
            )
          ]
        },
        card.id,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 316,
          columnNumber: 13
        },
        globalThis
      )) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
        lineNumber: 314,
        columnNumber: 9
      }, globalThis),
      gameOver && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-full mt-4 p-4 bg-muted rounded-lg", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-semibold text-center mb-2", children: "Game Complete!" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 345,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Score" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
              lineNumber: 348,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold text-primary", children: score }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
              lineNumber: 349,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 347,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Moves" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
              lineNumber: 352,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold", children: moves }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
              lineNumber: 353,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 351,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Time" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
              lineNumber: 356,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-2xl font-bold", children: formatTime(timer) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
              lineNumber: 357,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
            lineNumber: 355,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 346,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
        lineNumber: 344,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
      lineNumber: 296,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", onClick: onBack, children: "Back" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
        lineNumber: 365,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: gameOver || !gameStarted ? "default" : "secondary",
          onClick: restartGame,
          children: gameOver ? "Play Again" : "Restart"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
          lineNumber: 369,
          columnNumber: 9
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
      lineNumber: 364,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/games/MemoryCards.tsx",
    lineNumber: 281,
    columnNumber: 5
  }, globalThis);
};

const {useState: useState$2,useEffect: useEffect$3} = await importShared('react');

const {useParams: useParams$1,useNavigate: useNavigate$1} = await importShared('react-router-dom');
const gamesData = [
  {
    id: "breathing-exercise",
    name: "Breathing Exercise",
    description: "Focus on your breath to reduce stress and cravings",
    category: "breathing",
    difficulty: "easy",
    thumbnail: "icon",
    playTime: 3,
    benefits: ["Reduces stress", "Manages cravings", "Improves focus"]
  },
  {
    id: "memory-cards",
    name: "Memory Match",
    description: "Test your memory by matching card pairs",
    category: "focus",
    difficulty: "medium",
    thumbnail: "icon",
    playTime: 5,
    benefits: ["Improves memory", "Enhances concentration", "Distracts from cravings"]
  }
];
const GameDetails = ({ session }) => {
  const { id } = useParams$1();
  const navigate = useNavigate$1();
  const [game, setGame] = useState$2(null);
  const [gameStats, setGameStats] = useState$2(null);
  const [isPlaying, setIsPlaying] = useState$2(false);
  const [activeTab, setActiveTab] = useState$2("details");
  useEffect$3(() => {
    const foundGame = gamesData.find((g) => g.id === id);
    if (foundGame) {
      setGame(foundGame);
      setGameStats({
        timesPlayed: 5,
        averageScore: 78,
        highScore: 95,
        totalTimePlayed: 840,
        // in seconds
        mostPlayed: foundGame.id === "breathing-exercise"
      });
    }
  }, [id]);
  const handlePlay = () => {
    setIsPlaying(true);
    setActiveTab("play");
  };
  const handleBack = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setActiveTab("details");
    } else {
      navigate("/app/games");
    }
  };
  const handleGameComplete = (score) => {
    setIsPlaying(false);
    setActiveTab("stats");
    if (gameStats) {
      setGameStats({
        ...gameStats,
        timesPlayed: gameStats.timesPlayed + 1,
        highScore: Math.max(gameStats.highScore, score),
        averageScore: Math.round((gameStats.averageScore * gameStats.timesPlayed + score) / (gameStats.timesPlayed + 1)),
        totalTimePlayed: gameStats.totalTimePlayed + (game?.playTime || 0) * 60
      });
    }
  };
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };
  if (!game) {
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 py-6 mx-auto max-w-3xl", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", onClick: () => navigate("/app/games"), className: "mb-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowLeft, { className: "mr-2 h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 128,
          columnNumber: 11
        }, globalThis),
        "Back to Games"
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 127,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(X, { className: "mx-auto h-12 w-12 text-muted-foreground mb-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 134,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-xl font-semibold mb-2", children: "Game Not Found" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 135,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground mb-6", children: "The game you're looking for doesn't exist or has been removed." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 136,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: () => navigate("/app/games"), children: "Return to Game Hub" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 139,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 133,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 132,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 131,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
      lineNumber: 126,
      columnNumber: 7
    }, globalThis);
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 py-6 mx-auto max-w-3xl", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", onClick: handleBack, className: "mb-4", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowLeft, { className: "mr-2 h-4 w-4" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 152,
        columnNumber: 9
      }, globalThis),
      isPlaying ? "Back to Details" : "Back to Games"
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
      lineNumber: 151,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-2xl font-bold", children: game.name }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 157,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => navigate("/app/achievements"),
          className: "flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 164,
              columnNumber: 11
            }, globalThis),
            "Achievements"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 158,
          columnNumber: 9
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
      lineNumber: 156,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "details", value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "mb-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "details", children: "Details" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 171,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "play", children: "Play" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 172,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "stats", children: "Stats" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 173,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 170,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "details", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-2xl", children: game.name }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 181,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: game.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 182,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 180,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: getDifficultyColor(game.difficulty), children: game.difficulty }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 184,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 179,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 178,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-5 w-5 text-primary" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 193,
                columnNumber: 21
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 192,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Estimated Time" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                  lineNumber: 196,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: [
                  game.playTime,
                  " minutes"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                  lineNumber: 197,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 195,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 191,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-5 w-5 text-primary" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 203,
                columnNumber: 21
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 202,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "High Score" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                  lineNumber: 206,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: gameStats?.highScore || "No score yet" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                  lineNumber: 207,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 205,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 201,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(User, { className: "h-5 w-5 text-primary" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 213,
                columnNumber: 21
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 212,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Games Played" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                  lineNumber: 216,
                  columnNumber: 21
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: gameStats?.timesPlayed || 0 }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                  lineNumber: 217,
                  columnNumber: 21
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 215,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 211,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 190,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-semibold mb-2", children: "Benefits" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 223,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-2", children: game.benefits.map((benefit, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", className: "font-normal", children: benefit }, index, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 226,
              columnNumber: 21
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 224,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 222,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-semibold mb-2", children: "How to Play" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 234,
              columnNumber: 17
            }, globalThis),
            game.id === "breathing-exercise" && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "1. Set your preferred breathing rate (breaths per minute)" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 237,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "2. Press start and follow the animated circle" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 238,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "3. Inhale when it expands, exhale when it contracts" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 239,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "4. Complete a full session to earn a calm score" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 240,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 236,
              columnNumber: 19
            }, globalThis),
            game.id === "memory-cards" && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "1. Flip cards by clicking on them" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 246,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "2. Find matching pairs of cards" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 247,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "3. Match all pairs to complete the game" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 248,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: "4. Faster completion with fewer moves earns a higher score" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 249,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 245,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 233,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 189,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: handlePlay, className: "w-full", children: [
          "Play ",
          game.name
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 255,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 254,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 177,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 176,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "play", className: "mt-6", children: [
        isPlaying && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
          game.id === "breathing-exercise" && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            BreathingGame,
            {
              session,
              onComplete: handleGameComplete,
              onBack: handleBack
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 266,
              columnNumber: 17
            },
            globalThis
          ),
          game.id === "memory-cards" && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            MemoryCards,
            {
              session,
              onComplete: handleGameComplete,
              onBack: handleBack
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 274,
              columnNumber: 17
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 264,
          columnNumber: 13
        }, globalThis),
        !isPlaying && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: handlePlay, size: "lg", children: [
          "Start ",
          game.name
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 285,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 284,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 262,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "stats", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Your Stats" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 295,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: [
            "Track your progress and achievements for ",
            game.name
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 296,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 294,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 bg-muted rounded-lg text-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Calendar, { className: "h-6 w-6 mx-auto mb-2 text-primary" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 303,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Times Played" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 304,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xl font-bold", children: gameStats?.timesPlayed || 0 }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 305,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 302,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 bg-muted rounded-lg text-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-6 w-6 mx-auto mb-2 text-amber-500" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 309,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "High Score" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 310,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xl font-bold", children: gameStats?.highScore || 0 }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 311,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 308,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 bg-muted rounded-lg text-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ChartNoAxesColumnIncreasing, { className: "h-6 w-6 mx-auto mb-2 text-blue-500" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 315,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Average Score" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 316,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xl font-bold", children: gameStats?.averageScore || 0 }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 317,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 314,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-4 bg-muted rounded-lg text-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-6 w-6 mx-auto mb-2 text-green-500" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 321,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Total Time" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 322,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xl font-bold", children: formatTime(gameStats?.totalTimePlayed || 0) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 323,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 320,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 301,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center py-6", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Brain, { className: "h-12 w-12 mx-auto mb-4 text-primary opacity-20" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 328,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground mb-4", children: "Playing games regularly helps reduce cravings and improves your overall wellbeing." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 329,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: handlePlay, children: "Play Again" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 333,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", onClick: () => navigate("/app/achievements"), children: "View Achievements" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
                lineNumber: 336,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
              lineNumber: 332,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
            lineNumber: 327,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
          lineNumber: 300,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 293,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
        lineNumber: 292,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
      lineNumber: 169,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameDetails.tsx",
    lineNumber: 150,
    columnNumber: 5
  }, globalThis);
};

const {useState: useState$1,useEffect: useEffect$2} = await importShared('react');
const GameAchievements = ({ session }) => {
  const [achievements, setAchievements] = useState$1([]);
  const [isLoading, setIsLoading] = useState$1(true);
  const [activeTab, setActiveTab] = useState$1("all");
  useEffect$2(() => {
    if (session?.user) {
      fetchAchievements();
    } else {
      setAchievements(getSampleAchievements());
      setIsLoading(false);
    }
  }, [session]);
  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      if (!session?.user?.id) {
        setAchievements(getSampleAchievements());
        setIsLoading(false);
        return;
      }
      const { data: gameProgress, error } = await supabase$1.from("game_progress").select("*", { eq: { user_id: session.user.id } });
      if (error) {
        console.error("Error fetching game progress:", error);
        setAchievements(getSampleAchievements());
      } else if (gameProgress) {
        const achievements2 = generateAchievementsFromProgress(gameProgress);
        setAchievements(achievements2);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setAchievements(getSampleAchievements());
    } finally {
      setIsLoading(false);
    }
  };
  const generateAchievementsFromProgress = (gameProgress) => {
    const achievements2 = getSampleAchievements();
    const gameProgressMap = {};
    gameProgress.forEach((progress) => {
      if (!gameProgressMap[progress.game_id]) {
        gameProgressMap[progress.game_id] = [];
      }
      gameProgressMap[progress.game_id].push(progress);
    });
    achievements2.forEach((achievement) => {
      if (achievement.game_id && gameProgressMap[achievement.game_id]) {
        const gameProgressItems = gameProgressMap[achievement.game_id];
        if (achievement.game_id === "memory-cards") {
          if (achievement.id === "memory-games-played") {
            const gamesPlayed = gameProgressItems.length;
            achievement.progress = Math.min(100, gamesPlayed / 10 * 100);
            achievement.completed = gamesPlayed >= 10;
            if (achievement.completed) {
              achievement.unlocked_at = (/* @__PURE__ */ new Date()).toISOString();
            }
          }
          if (achievement.id === "memory-master") {
            const highScore = Math.max(...gameProgressItems.map((p) => p.score || 0));
            achievement.progress = Math.min(100, highScore / 90 * 100);
            achievement.completed = highScore >= 90;
            if (achievement.completed) {
              achievement.unlocked_at = (/* @__PURE__ */ new Date()).toISOString();
            }
          }
        }
        if (achievement.game_id === "breathing-exercise") {
          if (achievement.id === "breathing-sessions") {
            const sessionsCompleted = gameProgressItems.length;
            achievement.progress = Math.min(100, sessionsCompleted / 5 * 100);
            achievement.completed = sessionsCompleted >= 5;
            if (achievement.completed) {
              achievement.unlocked_at = (/* @__PURE__ */ new Date()).toISOString();
            }
          }
          if (achievement.id === "zen-master") {
            const highScore = Math.max(...gameProgressItems.map((p) => p.score || 0));
            achievement.progress = Math.min(100, highScore / 95 * 100);
            achievement.completed = highScore >= 95;
            if (achievement.completed) {
              achievement.unlocked_at = (/* @__PURE__ */ new Date()).toISOString();
            }
          }
        }
      }
    });
    return achievements2;
  };
  const getSampleAchievements = () => {
    return [
      {
        id: "first-game",
        title: "First Steps",
        description: "Complete your first game",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-6 w-6 text-yellow-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 151,
          columnNumber: 15
        }, globalThis),
        progress: 100,
        completed: true,
        unlocked_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "breathing-sessions",
        title: "Deep Breather",
        description: "Complete 5 breathing exercise sessions",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Wind, { className: "h-6 w-6 text-blue-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 160,
          columnNumber: 15
        }, globalThis),
        progress: 60,
        completed: false,
        game_id: "breathing-exercise"
      },
      {
        id: "zen-master",
        title: "Zen Master",
        description: "Reach a calm score of 95 or higher",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Award$1, { className: "h-6 w-6 text-purple-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 169,
          columnNumber: 15
        }, globalThis),
        progress: 80,
        completed: false,
        game_id: "breathing-exercise"
      },
      {
        id: "memory-games-played",
        title: "Memory Champion",
        description: "Play the memory game 10 times",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Medal, { className: "h-6 w-6 text-amber-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 178,
          columnNumber: 15
        }, globalThis),
        progress: 30,
        completed: false,
        game_id: "memory-cards"
      },
      {
        id: "memory-master",
        title: "Perfect Match",
        description: "Score 90 or higher in Memory Match",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Star, { className: "h-6 w-6 text-yellow-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 187,
          columnNumber: 15
        }, globalThis),
        progress: 70,
        completed: false,
        game_id: "memory-cards"
      },
      {
        id: "perfect-streak",
        title: "Perfect Streak",
        description: "Complete 3 games in a row with a score of 85+",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-6 w-6 text-orange-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 196,
          columnNumber: 15
        }, globalThis),
        progress: 33,
        completed: false
      },
      {
        id: "daily-challenge",
        title: "Daily Challenger",
        description: "Complete a game every day for 7 days",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Flag, { className: "h-6 w-6 text-green-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 204,
          columnNumber: 15
        }, globalThis),
        progress: 45,
        completed: false
      },
      {
        id: "puzzle-master",
        title: "Puzzle Master",
        description: "Complete all puzzle games at least once",
        icon: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Crown, { className: "h-6 w-6 text-purple-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 212,
          columnNumber: 15
        }, globalThis),
        progress: 50,
        completed: false
      }
    ];
  };
  const getFilteredAchievements = () => {
    if (activeTab === "all")
      return achievements;
    if (activeTab === "unlocked")
      return achievements.filter((a) => a.completed);
    return achievements.filter((a) => !a.completed);
  };
  const formatDate = (dateString) => {
    if (!dateString)
      return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container px-4 py-6 mx-auto max-w-4xl", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold tracking-tight", children: "Your Achievements" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 236,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "Track your progress and unlock rewards as you play games" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 237,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 235,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex mb-6 overflow-auto pb-2", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: activeTab === "all" ? "default" : "outline",
          onClick: () => setActiveTab("all"),
          className: "mr-2",
          children: [
            "All (",
            achievements.length,
            ")"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 243,
          columnNumber: 9
        },
        globalThis
      ),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: activeTab === "unlocked" ? "default" : "outline",
          onClick: () => setActiveTab("unlocked"),
          className: "mr-2",
          children: [
            "Unlocked (",
            achievements.filter((a) => a.completed).length,
            ")"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 250,
          columnNumber: 9
        },
        globalThis
      ),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: activeTab === "locked" ? "default" : "outline",
          onClick: () => setActiveTab("locked"),
          children: [
            "In Progress (",
            achievements.filter((a) => !a.completed).length,
            ")"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 257,
          columnNumber: 9
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 242,
      columnNumber: 7
    }, globalThis),
    isLoading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 267,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 266,
      columnNumber: 9
    }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: getFilteredAchievements().map((achievement) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: achievement.completed ? "border-primary/30 bg-primary/5" : "", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: `rounded-full p-2 ${achievement.completed ? "bg-primary/20" : "bg-muted"}`, children: achievement.icon }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
            lineNumber: 276,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-lg", children: achievement.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
              lineNumber: 280,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: achievement.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
              lineNumber: 281,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
            lineNumber: 279,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 275,
          columnNumber: 19
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: achievement.completed ? "default" : "outline", children: achievement.completed ? "Unlocked" : "In Progress" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 284,
          columnNumber: 19
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 274,
        columnNumber: 17
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 273,
        columnNumber: 15
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
        !achievement.completed && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Progress" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
              lineNumber: 294,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: [
              achievement.progress,
              "%"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
              lineNumber: 295,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
            lineNumber: 293,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Progress, { value: achievement.progress, className: "h-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
            lineNumber: 297,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 292,
          columnNumber: 19
        }, globalThis),
        achievement.completed && achievement.unlocked_at && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground flex items-center", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-4 w-4 mr-1" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
            lineNumber: 303,
            columnNumber: 21
          }, globalThis),
          "Unlocked on ",
          formatDate(achievement.unlocked_at)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 302,
          columnNumber: 19
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 290,
        columnNumber: 15
      }, globalThis)
    ] }, achievement.id, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 272,
      columnNumber: 13
    }, globalThis)) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 270,
      columnNumber: 9
    }, globalThis),
    !isLoading && getFilteredAchievements().length === 0 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "text-center py-12", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Trophy, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 316,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-xl font-semibold mb-2", children: "No achievements found" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 317,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground mb-6", children: activeTab === "unlocked" ? "You haven't unlocked any achievements yet. Play more games to earn rewards!" : activeTab === "locked" ? "No in-progress achievements to display." : "No achievements found. Start playing games to earn rewards!" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 318,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { children: "Play Games" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
        lineNumber: 325,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 315,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 314,
      columnNumber: 9
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
    lineNumber: 234,
    columnNumber: 5
  }, globalThis);
};
function Wind(props) {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "svg",
    {
      ...props,
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 349,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M9.6 4.6A2 2 0 1 1 11 8H2" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 350,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M12.6 19.4A2 2 0 1 0 14 16H2" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
          lineNumber: 351,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GameAchievements.tsx",
      lineNumber: 337,
      columnNumber: 5
    },
    this
  );
}

const {useContext: useContext$1} = await importShared('react');
const GameHubWithSession = () => {
  const auth = useContext$1(AuthContext);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(GameHub, { session: auth?.session || null }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/routes/gameRoutes.tsx",
    lineNumber: 11,
    columnNumber: 10
  }, globalThis);
};
const GameDetailsWithSession = () => {
  const auth = useContext$1(AuthContext);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(GameDetails, { session: auth?.session || null }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/routes/gameRoutes.tsx",
    lineNumber: 16,
    columnNumber: 10
  }, globalThis);
};
const GameAchievementsWithSession = () => {
  const auth = useContext$1(AuthContext);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(GameAchievements, { session: auth?.session || null }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/routes/gameRoutes.tsx",
    lineNumber: 21,
    columnNumber: 10
  }, globalThis);
};
const gameRoutes = [
  {
    path: "/app/games",
    element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(GameHubWithSession, {}, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/routes/gameRoutes.tsx",
      lineNumber: 27,
      columnNumber: 14
    }, globalThis)
  },
  {
    path: "/app/games/:id",
    element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(GameDetailsWithSession, {}, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/routes/gameRoutes.tsx",
      lineNumber: 31,
      columnNumber: 14
    }, globalThis)
  },
  {
    path: "/app/achievements",
    element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(GameAchievementsWithSession, {}, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/routes/gameRoutes.tsx",
      lineNumber: 35,
      columnNumber: 14
    }, globalThis)
  }
];

const {useContext} = await importShared('react');

const {Routes,Route,useParams,useNavigate,Navigate} = await importShared('react-router-dom');
const {useEffect: useEffect$1,useState} = await importShared('react');
const withSession = (Component) => {
  return (props) => {
    const auth = useContext(AuthContext);
    if (!auth) {
      throw new Error("withSession must be used within an AuthProvider");
    }
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Component, { ...props, session: auth.session }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 51,
      columnNumber: 12
    }, globalThis);
  };
};
const DashboardWithSession = withSession(Dashboard);
const ProgressWithSession = withSession(Progress$1);
const ConsumptionLoggerWithSession = withSession(ConsumptionLogger);
const NRTDirectoryWithSession = withSession(NRTDirectory);
const AlternativeProductsWithSession = withSession(AlternativeProducts);
const GuidesHubWithSession = withSession(GuidesHub);
const WebToolsWithSession = withSession(WebTools);
const CommunityWithSession = withSession(Community);
const SettingsWithSession = withSession(Settings);
const TaskManagerWithSession = withSession(TaskManager);
const TriggerAnalysisWithSession = withSession(TriggerAnalysis);
const CommunityChallengesWithSession = withSession(CommunityChallenges);
const AchievementsWithSession = withSession(Achievements);
const ProtectedRoute = ({ children }) => {
  const auth = useContext(AuthContext);
  if (!auth?.session) {
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Navigate, { to: "/auth", replace: true }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 83,
      columnNumber: 12
    }, globalThis);
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
    lineNumber: 86,
    columnNumber: 10
  }, globalThis);
};
const ProductDetailsWrapper = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect$1(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const currentSession = await getCurrentSession();
        setSession(currentSession);
        const products = await getNicotineProducts({}, currentSession);
        const productId = params.productId;
        const foundProduct = products.find((p) => p.id === productId);
        if (!foundProduct) {
          throw new Error("Product not found");
        }
        setProduct(mapToNRTProduct(foundProduct));
      } catch (err) {
        console.error("Product loading error:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [params.productId]);
  if (loading)
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: "Loading product details..." }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 125,
      columnNumber: 23
    }, globalThis);
  if (error)
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: error }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 126,
      columnNumber: 21
    }, globalThis);
  if (!product)
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: "Product not found" }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 127,
      columnNumber: 24
    }, globalThis);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    ProductDetails,
    {
      product,
      session,
      onBack: () => navigate(-1)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 130,
      columnNumber: 5
    },
    globalThis
  );
};
const AppRouter = () => {
  const auth = useContext(AuthContext);
  const session = auth?.session || null;
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Routes, { children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "/", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LandingPage, { session }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 147,
      columnNumber: 34
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 147,
      columnNumber: 9
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "/auth", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LoginPage, {}, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 150,
      columnNumber: 38
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 150,
      columnNumber: 9
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "/app", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RootLayout, {}, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 153,
      columnNumber: 37
    }, globalThis), children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { index: true, element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(DashboardWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 156,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 155,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 154,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "dashboard", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(DashboardWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 162,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 161,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 160,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "deep-link-test", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(DeepLinkHandler, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 170,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 169,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 168,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "progress", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProgressWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 176,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 175,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 174,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "consumption-logger", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ConsumptionLoggerWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 182,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 181,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 180,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "nrt-directory", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(NRTDirectoryWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 188,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 187,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 186,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "alternative-products", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AlternativeProductsWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 194,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 193,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 192,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "guides", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(GuidesHubWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 200,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 199,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 198,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "web-tools", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(WebToolsWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 206,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 205,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 204,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "community", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CommunityWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 212,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 211,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 210,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "settings", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SettingsWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 218,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 217,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 216,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "task-manager", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TaskManagerWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 224,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 223,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 222,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "mood-tracking", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TriggerAnalysisWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 230,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 229,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 228,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "trigger-analysis", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TriggerAnalysisWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 236,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 235,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 234,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "products/:productId", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProductDetailsWrapper, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 242,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 241,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 240,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "challenges", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CommunityChallengesWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 248,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 247,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 246,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Route, { path: "achievements", element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AchievementsWithSession, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 254,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 253,
        columnNumber: 13
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
        lineNumber: 252,
        columnNumber: 11
      }, globalThis),
      gameRoutes.map((route) => route.path && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Route,
        {
          path: route.path.replace("/app/", ""),
          element: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ProtectedRoute, { children: route.element }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
            lineNumber: 265,
            columnNumber: 19
          }, globalThis)
        },
        route.path,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
          lineNumber: 261,
          columnNumber: 15
        },
        globalThis
      ))
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
      lineNumber: 153,
      columnNumber: 9
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
    lineNumber: 145,
    columnNumber: 7
  }, globalThis) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/router.tsx",
    lineNumber: 144,
    columnNumber: 5
  }, globalThis);
};

const {useEffect} = await importShared('react');
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
function MissionFreshApp({ session: externalSession }) {
  useEffect(() => {
    checkForStoredDeepLink();
    const handleDeepLinkEvent = (event) => {
      if (event.detail) {
        console.log("Deep link received:", event.detail);
      }
    };
    const unregister = registerDeepLinkHandler(handleDeepLinkEvent);
    initializeMobileIntegration().catch((error) => {
      console.error("Failed to initialize mobile integration:", error);
    });
    return () => {
      unregister();
    };
  }, []);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AuthProvider, { initialSession: externalSession, children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ErrorBoundary, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AppRouter, {}, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
      lineNumber: 60,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
      lineNumber: 59,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      Te,
      {
        position: "bottom-right",
        richColors: true,
        closeButton: true,
        toastOptions: {
          duration: 4e3,
          className: "toast-custom-class"
        }
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
        lineNumber: 62,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TestErrors, {}, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
        lineNumber: 73,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ConsoleErrorDisplay, { showOnlyErrors: true, position: "bottom-left" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
        lineNumber: 74,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
      lineNumber: 72,
      columnNumber: 11
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
    lineNumber: 58,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/MissionFreshApp.tsx",
    lineNumber: 57,
    columnNumber: 5
  }, this);
}

export { MissionFreshApp, MissionFreshApp as default };
