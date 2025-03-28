import { c as createLucideIcon, j as jsxDevRuntimeExports, g as clsx } from './proxy-0fb2bf4b.js';
import { importShared } from './__federation_fn_import-078a81cf.js';
import { u as useToast } from './use-toast-614cf0bf.js';
import './smoke-free-counter-a4ff4a5c.js';
import { o as onAuthStateChange, g as getCurrentSession, a as signInWithEmail, b as signOut } from './supabase-client-9c0d55f4.js';
import { f as filterProps, p as polarToCartesian, i as isFunction, F as Dot, L as Layer, H as Polygon, A as Animate, d as interpolateNumber, e as isEqual, k as LabelList, G as Global, g as getValueByDataKey, I as last, a as isNil, u as uniqueId, l as findAllByType, C as Curve, J as isDotProps, K as getCateCoordinateOfLine, M as ErrorBar, r as generateCategoricalChart, X as XAxis, Y as YAxis, x as formatAxisMap, P as PolarAngleAxis, s as PolarRadiusAxis, t as formatAxisMap$1 } from './generateCategoricalChart-f1756715.js';
import { g as getDefaultExportFromCjs } from './index-c8f38012.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const BrainCircuit = createLucideIcon("BrainCircuit", [
  [
    "path",
    {
      d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      key: "l5xja"
    }
  ],
  ["path", { d: "M9 13a4.5 4.5 0 0 0 3-4", key: "10igwf" }],
  ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
  ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
  ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
  ["path", { d: "M12 13h4", key: "1ku699" }],
  ["path", { d: "M12 18h6a2 2 0 0 1 2 2v1", key: "105ag5" }],
  ["path", { d: "M12 8h8", key: "1lhi5i" }],
  ["path", { d: "M16 8V5a2 2 0 0 1 2-2", key: "u6izg6" }],
  ["circle", { cx: "16", cy: "13", r: ".5", key: "ry7gng" }],
  ["circle", { cx: "18", cy: "3", r: ".5", key: "1aiba7" }],
  ["circle", { cx: "20", cy: "21", r: ".5", key: "yhc1fs" }],
  ["circle", { cx: "20", cy: "8", r: ".5", key: "1e43v0" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const CalendarDays = createLucideIcon("CalendarDays", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Moon = createLucideIcon("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);

const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return (idbProxyableTypes ||
        (idbProxyableTypes = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
        ]));
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return (cursorAdvanceMethods ||
        (cursorAdvanceMethods = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
        ]));
}
const transactionDoneMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
        const unlisten = () => {
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = () => {
            resolve(wrap(request.result));
            unlisten();
        };
        const error = () => {
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    // This mapping exists in reverseTransformCache but doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx))
        return;
    const done = new Promise((resolve, reject) => {
        const unlisten = () => {
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = () => {
            resolve();
            unlisten();
        };
        const error = () => {
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get(target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done')
                return transactionDoneMap.get(target);
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1]
                    ? undefined
                    : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    },
    has(target, prop) {
        if (target instanceof IDBTransaction &&
            (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    },
};
function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) {
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap(this), args);
            return wrap(this.request);
        };
    }
    return function (...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function')
        return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction)
        cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
        return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest)
        return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value))
        return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', (event) => {
            upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
        });
    }
    if (blocked) {
        request.addEventListener('blocked', (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion, event.newVersion, event));
    }
    openPromise
        .then((db) => {
        if (terminated)
            db.addEventListener('close', () => terminated());
        if (blocking) {
            db.addEventListener('versionchange', (event) => blocking(event.oldVersion, event.newVersion, event));
        }
    })
        .catch(() => { });
    return openPromise;
}

const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop))
        return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    const method = async function (storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex)
            target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done,
        ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
}
replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
}));

const advanceMethodProps = ['continue', 'continuePrimaryKey', 'advance'];
const methodMap = {};
const advanceResults = new WeakMap();
const ittrProxiedCursorToOriginalProxy = new WeakMap();
const cursorIteratorTraps = {
    get(target, prop) {
        if (!advanceMethodProps.includes(prop))
            return target[prop];
        let cachedFunc = methodMap[prop];
        if (!cachedFunc) {
            cachedFunc = methodMap[prop] = function (...args) {
                advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
            };
        }
        return cachedFunc;
    },
};
async function* iterate(...args) {
    // tslint:disable-next-line:no-this-assignment
    let cursor = this;
    if (!(cursor instanceof IDBCursor)) {
        cursor = await cursor.openCursor(...args);
    }
    if (!cursor)
        return;
    cursor = cursor;
    const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
    // Map this double-proxy back to the original, so other cursor methods work.
    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
    while (cursor) {
        yield proxiedCursor;
        // If one of the advancing methods was not called, call continue().
        cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
        advanceResults.delete(proxiedCursor);
    }
}
function isIteratorProp(target, prop) {
    return ((prop === Symbol.asyncIterator &&
        instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor])) ||
        (prop === 'iterate' && instanceOfAny(target, [IDBIndex, IDBObjectStore])));
}
replaceTraps((oldTraps) => ({
    ...oldTraps,
    get(target, prop, receiver) {
        if (isIteratorProp(target, prop))
            return iterate;
        return oldTraps.get(target, prop, receiver);
    },
    has(target, prop) {
        return isIteratorProp(target, prop) || oldTraps.has(target, prop);
    },
}));

const DB_NAME = "missionFreshOfflineDB";
const DB_VERSION = 1;
const STORES = {
  PROGRESS: "progress",
  CRAVINGS: "cravings",
  TASKS: "tasks",
  LOGS: "consumptionLogs",
  SYNC_QUEUE: "syncQueue"
};
class OfflineStorageService {
  db = null;
  isOnline = navigator.onLine;
  syncInProgress = false;
  syncQueue = [];
  offlineStatusListeners = [];
  constructor() {
    this.initDB();
    this.setupNetworkListeners();
  }
  // Initialize the IndexedDB database
  async initDB() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
            const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: "localId" });
            progressStore.createIndex("user_id", "user_id");
            progressStore.createIndex("date", "date");
            progressStore.createIndex("synced", "synced");
          }
          if (!db.objectStoreNames.contains(STORES.CRAVINGS)) {
            const cravingsStore = db.createObjectStore(STORES.CRAVINGS, { keyPath: "localId" });
            cravingsStore.createIndex("user_id", "user_id");
            cravingsStore.createIndex("timestamp", "timestamp");
            cravingsStore.createIndex("synced", "synced");
          }
          if (!db.objectStoreNames.contains(STORES.TASKS)) {
            const tasksStore = db.createObjectStore(STORES.TASKS, { keyPath: "localId" });
            tasksStore.createIndex("user_id", "user_id");
            tasksStore.createIndex("due_date", "due_date");
            tasksStore.createIndex("completed", "completed");
            tasksStore.createIndex("synced", "synced");
          }
          if (!db.objectStoreNames.contains(STORES.LOGS)) {
            const logsStore = db.createObjectStore(STORES.LOGS, { keyPath: "localId" });
            logsStore.createIndex("user_id", "user_id");
            logsStore.createIndex("product_id", "product_id");
            logsStore.createIndex("timestamp", "timestamp");
            logsStore.createIndex("synced", "synced");
          }
          if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
            const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: "id" });
            syncStore.createIndex("store", "store");
            syncStore.createIndex("synced", "synced");
            syncStore.createIndex("timestamp", "timestamp");
          }
        }
      });
      console.log("IndexedDB initialized successfully");
      this.loadSyncQueue();
    } catch (error) {
      console.error("Error initializing IndexedDB:", error);
    }
  }
  // Setup network status listeners
  setupNetworkListeners() {
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }
  // Handle going online
  handleOnline = async () => {
    console.log("Device is online, starting sync process");
    this.isOnline = true;
    this.notifyStatusListeners(true);
    this.syncData();
  };
  // Handle going offline
  handleOffline = () => {
    console.log("Device is offline, pausing sync process");
    this.isOnline = false;
    this.notifyStatusListeners(false);
    this.syncInProgress = false;
  };
  // Notify listeners about network status changes
  notifyStatusListeners(isOnline) {
    this.offlineStatusListeners.forEach((listener) => listener(isOnline));
  }
  // Add a listener for network status changes
  addOfflineStatusListener(listener) {
    this.offlineStatusListeners.push(listener);
    listener(this.isOnline);
  }
  // Remove a network status listener
  removeOfflineStatusListener(listener) {
    this.offlineStatusListeners = this.offlineStatusListeners.filter((l) => l !== listener);
  }
  // Get current online status
  isNetworkOnline() {
    return this.isOnline;
  }
  // Load sync queue from IndexedDB
  async loadSyncQueue() {
    if (!this.db)
      await this.initDB();
    if (!this.db) {
      console.error("Database not initialized");
      return;
    }
    try {
      const items = await this.db.getAll(STORES.SYNC_QUEUE);
      this.syncQueue = items.filter((item) => item.synced === false);
      console.log(`Loaded ${this.syncQueue.length} items to sync queue`);
    } catch (error) {
      console.error("Error loading sync queue:", error);
    }
  }
  // Add item to sync queue
  async addToSyncQueue(store, data, operation) {
    if (!this.db)
      await this.initDB();
    if (!this.db) {
      console.error("Database not initialized");
      return;
    }
    const queueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      store,
      data,
      operation,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      attempts: 0,
      synced: false
    };
    try {
      await this.db.add(STORES.SYNC_QUEUE, queueItem);
      this.syncQueue.push(queueItem);
      console.log(`Added item to sync queue: ${store} - ${operation}`);
      if (this.isOnline && !this.syncInProgress) {
        this.syncData();
      }
    } catch (error) {
      console.error("Error adding to sync queue:", error);
    }
  }
  // Generate a local ID
  generateLocalId() {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  // Save progress entry
  async saveProgress(entry) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    entry.synced = false;
    entry.operation = entry.id ? "UPDATE" : "CREATE";
    entry.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    try {
      await this.db.put(STORES.PROGRESS, entry);
      await this.addToSyncQueue(STORES.PROGRESS, entry, entry.operation);
      return entry;
    } catch (error) {
      console.error("Error saving progress entry:", error);
      throw error;
    }
  }
  // Get progress entries
  async getProgressEntries(userId, startDate, endDate) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      const entries = await this.db.getAllFromIndex(STORES.PROGRESS, "user_id", userId);
      if (startDate && endDate) {
        return entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
      return entries;
    } catch (error) {
      console.error("Error getting progress entries:", error);
      throw error;
    }
  }
  // Save craving entry
  async saveCraving(entry) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    entry.synced = false;
    entry.operation = entry.id ? "UPDATE" : "CREATE";
    try {
      await this.db.put(STORES.CRAVINGS, entry);
      await this.addToSyncQueue(STORES.CRAVINGS, entry, entry.operation);
      return entry;
    } catch (error) {
      console.error("Error saving craving entry:", error);
      throw error;
    }
  }
  // Get craving entries
  async getCravingEntries(userId, startDate, endDate) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      const entries = await this.db.getAllFromIndex(STORES.CRAVINGS, "user_id", userId);
      if (startDate && endDate) {
        return entries.filter((entry) => {
          const entryDate = new Date(entry.timestamp);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
      return entries;
    } catch (error) {
      console.error("Error getting craving entries:", error);
      throw error;
    }
  }
  // Save task entry
  async saveTask(entry) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    entry.synced = false;
    entry.operation = entry.id ? "UPDATE" : "CREATE";
    try {
      await this.db.put(STORES.TASKS, entry);
      await this.addToSyncQueue(STORES.TASKS, entry, entry.operation);
      return entry;
    } catch (error) {
      console.error("Error saving task entry:", error);
      throw error;
    }
  }
  // Get task entries
  async getTasks(userId, includeCompleted = true) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      const entries = await this.db.getAllFromIndex(STORES.TASKS, "user_id", userId);
      if (!includeCompleted) {
        return entries.filter((entry) => !entry.completed);
      }
      return entries;
    } catch (error) {
      console.error("Error getting task entries:", error);
      throw error;
    }
  }
  // Save consumption log
  async saveConsumptionLog(entry) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    entry.synced = false;
    entry.operation = entry.id ? "UPDATE" : "CREATE";
    try {
      await this.db.put(STORES.LOGS, entry);
      await this.addToSyncQueue(STORES.LOGS, entry, entry.operation);
      return entry;
    } catch (error) {
      console.error("Error saving consumption log:", error);
      throw error;
    }
  }
  // Get consumption logs
  async getConsumptionLogs(userId, startDate, endDate) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      const entries = await this.db.getAllFromIndex(STORES.LOGS, "user_id", userId);
      if (startDate && endDate) {
        return entries.filter((entry) => {
          const entryDate = new Date(entry.timestamp);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
      return entries;
    } catch (error) {
      console.error("Error getting consumption logs:", error);
      throw error;
    }
  }
  // Delete an item from any store
  async deleteItem(store, localId, id) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      const item = await this.db.get(store, localId);
      if (!item) {
        throw new Error(`Item not found in ${store} with localId ${localId}`);
      }
      if (id) {
        item.operation = "DELETE";
        item.synced = false;
        await this.db.put(store, item);
        await this.addToSyncQueue(store, item, "DELETE");
      } else {
        await this.db.delete(store, localId);
      }
    } catch (error) {
      console.error(`Error deleting item from ${store}:`, error);
      throw error;
    }
  }
  // Sync data with the server
  async syncData(progressCallback) {
    if (!this.isOnline || this.syncInProgress) {
      return false;
    }
    this.syncInProgress = true;
    try {
      if (this.syncQueue.length === 0) {
        await this.loadSyncQueue();
      }
      const totalItems = this.syncQueue.length;
      let completedItems = 0;
      if (totalItems === 0) {
        this.syncInProgress = false;
        return true;
      }
      if (progressCallback) {
        progressCallback(totalItems, completedItems);
      }
      const itemsToSync = [...this.syncQueue].filter((item) => !item.synced).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      for (const item of itemsToSync) {
        if (!this.isOnline) {
          this.syncInProgress = false;
          return false;
        }
        try {
          const success = true;
          if (success) {
            item.synced = true;
            await this.db?.put(STORES.SYNC_QUEUE, item);
            const localId = item.data.localId;
            if (localId) {
              const storeType = item.store;
              const dataItem = await this.db?.get(storeType, localId);
              if (dataItem) {
                dataItem.synced = true;
                if (item.operation === "CREATE" && item.data.id) {
                  dataItem.id = item.data.id;
                }
                await this.db?.put(storeType, dataItem);
              }
              if (item.operation === "DELETE" && success) {
                await this.db?.delete(storeType, localId);
              }
            }
          }
        } catch (error) {
          console.error("Error syncing item:", error, item);
          item.attempts += 1;
          await this.db?.put(STORES.SYNC_QUEUE, item);
        }
        completedItems++;
        if (progressCallback) {
          progressCallback(totalItems, completedItems);
        }
      }
      await this.loadSyncQueue();
      this.syncInProgress = false;
      return true;
    } catch (error) {
      console.error("Error during sync process:", error);
      this.syncInProgress = false;
      return false;
    }
  }
  // Get sync status
  async getSyncStatus() {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      const allItems = await this.db.getAll(STORES.SYNC_QUEUE);
      const pending = allItems.filter((item) => !item.synced).length;
      const failed = allItems.filter((item) => !item.synced && item.attempts >= 5).length;
      return {
        total: allItems.length,
        pending,
        failed
      };
    } catch (error) {
      console.error("Error getting sync status:", error);
      throw error;
    }
  }
  // Check if there's data that needs to be synced
  async hasPendingSyncData() {
    const status = await this.getSyncStatus();
    return status.pending > 0;
  }
  // Clear all data (for testing or user logout)
  async clearAllData() {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      await this.db.clear(STORES.PROGRESS);
      await this.db.clear(STORES.CRAVINGS);
      await this.db.clear(STORES.TASKS);
      await this.db.clear(STORES.LOGS);
      await this.db.clear(STORES.SYNC_QUEUE);
      this.syncQueue = [];
      console.log("All offline data cleared");
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }
  // Clean up old sync items
  async cleanupOldSyncItems(olderThanDays = 30) {
    if (!this.db)
      await this.initDB();
    if (!this.db)
      throw new Error("Database not initialized");
    try {
      const allItems = await this.db.getAll(STORES.SYNC_QUEUE);
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      let deletedCount = 0;
      for (const item of allItems) {
        if (item.synced && new Date(item.timestamp) < cutoffDate) {
          await this.db.delete(STORES.SYNC_QUEUE, item.id);
          deletedCount++;
        }
      }
      console.log(`Cleaned up ${deletedCount} old sync items`);
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old sync items:", error);
      throw error;
    }
  }
  // Dispose event listeners when no longer needed
  dispose() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    this.offlineStatusListeners = [];
  }
}
new OfflineStorageService();

await importShared('react');

await importShared('react');

await importShared('react');

await importShared('react-router-dom');

const React$3 = await importShared('react');
const {createContext,useContext,useEffect,useState} = React$3;

const {Navigate,useNavigate} = await importShared('react-router-dom');
const AuthContext = createContext(null);
const AuthProvider = ({ children, initialSession }) => {
  const [session, setSession] = useState(initialSession || null);
  const [isLoading, setIsLoading] = useState(!initialSession);
  const { toast: toast2 } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (initialSession) {
      setIsLoading(false);
      return;
    }
    const getInitialSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        setSession(currentSession);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getInitialSession();
    const subscription = onAuthStateChange((_event, session2) => {
      setSession(session2);
      setIsLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [initialSession]);
  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmail(email, password);
      if (result.session) {
        localStorage.setItem("supabase.auth.token", JSON.stringify({
          currentSession: result.session,
          expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1e3).getTime()
          // ~10 years
        }));
        setSession(result.session);
        toast2.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast2.error("An error occurred during sign in");
    }
  };
  const signOut$1 = async () => {
    try {
      if (session) {
        await signOut(session);
      }
      localStorage.removeItem("supabase.auth.token");
      setSession(null);
      toast2.success("Signed out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast2.error("An error occurred during sign out");
    }
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AuthContext.Provider, { value: { session, setSession, isLoading, signIn, signOut: signOut$1 }, children }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AuthProvider.tsx",
    lineNumber: 107,
    columnNumber: 5
  }, globalThis);
};
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

var _excluded$1 = ["cx", "cy", "innerRadius", "outerRadius", "gridType", "radialLines"];
function _typeof$2(o) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$2(o); }
function _objectWithoutProperties$1(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$1(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose$1(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _extends$2() { _extends$2 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }
function ownKeys$2(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$2(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$2(Object(t), !0).forEach(function (r) { _defineProperty$2(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty$2(obj, key, value) { key = _toPropertyKey$2(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey$2(t) { var i = _toPrimitive$2(t, "string"); return "symbol" == _typeof$2(i) ? i : String(i); }
function _toPrimitive$2(t, r) { if ("object" != _typeof$2(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof$2(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Polar Grid
 */
const React$2 = await importShared('react');
var getPolygonPath = function getPolygonPath(radius, cx, cy, polarAngles) {
  var path = '';
  polarAngles.forEach(function (angle, i) {
    var point = polarToCartesian(cx, cy, radius, angle);
    if (i) {
      path += "L ".concat(point.x, ",").concat(point.y);
    } else {
      path += "M ".concat(point.x, ",").concat(point.y);
    }
  });
  path += 'Z';
  return path;
};

// Draw axis of radial line
var PolarAngles = function PolarAngles(props) {
  var cx = props.cx,
    cy = props.cy,
    innerRadius = props.innerRadius,
    outerRadius = props.outerRadius,
    polarAngles = props.polarAngles,
    radialLines = props.radialLines;
  if (!polarAngles || !polarAngles.length || !radialLines) {
    return null;
  }
  var polarAnglesProps = _objectSpread$2({
    stroke: '#ccc'
  }, filterProps(props, false));
  return /*#__PURE__*/React$2.createElement("g", {
    className: "recharts-polar-grid-angle"
  }, polarAngles.map(function (entry) {
    var start = polarToCartesian(cx, cy, innerRadius, entry);
    var end = polarToCartesian(cx, cy, outerRadius, entry);
    return /*#__PURE__*/React$2.createElement("line", _extends$2({}, polarAnglesProps, {
      key: "line-".concat(entry),
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y
    }));
  }));
};

// Draw concentric circles
var ConcentricCircle = function ConcentricCircle(props) {
  var cx = props.cx,
    cy = props.cy,
    radius = props.radius,
    index = props.index;
  var concentricCircleProps = _objectSpread$2(_objectSpread$2({
    stroke: '#ccc'
  }, filterProps(props, false)), {}, {
    fill: 'none'
  });
  return /*#__PURE__*/React$2.createElement("circle", _extends$2({}, concentricCircleProps, {
    className: clsx('recharts-polar-grid-concentric-circle', props.className),
    key: "circle-".concat(index),
    cx: cx,
    cy: cy,
    r: radius
  }));
};

// Draw concentric polygons
var ConcentricPolygon = function ConcentricPolygon(props) {
  var radius = props.radius,
    index = props.index;
  var concentricPolygonProps = _objectSpread$2(_objectSpread$2({
    stroke: '#ccc'
  }, filterProps(props, false)), {}, {
    fill: 'none'
  });
  return /*#__PURE__*/React$2.createElement("path", _extends$2({}, concentricPolygonProps, {
    className: clsx('recharts-polar-grid-concentric-polygon', props.className),
    key: "path-".concat(index),
    d: getPolygonPath(radius, props.cx, props.cy, props.polarAngles)
  }));
};

// Draw concentric axis
// TODO Optimize the name
var ConcentricPath = function ConcentricPath(props) {
  var polarRadius = props.polarRadius,
    gridType = props.gridType;
  if (!polarRadius || !polarRadius.length) {
    return null;
  }
  return /*#__PURE__*/React$2.createElement("g", {
    className: "recharts-polar-grid-concentric"
  }, polarRadius.map(function (entry, i) {
    var key = i;
    if (gridType === 'circle') return /*#__PURE__*/React$2.createElement(ConcentricCircle, _extends$2({
      key: key
    }, props, {
      radius: entry,
      index: i
    }));
    return /*#__PURE__*/React$2.createElement(ConcentricPolygon, _extends$2({
      key: key
    }, props, {
      radius: entry,
      index: i
    }));
  }));
};
var PolarGrid = function PolarGrid(_ref) {
  var _ref$cx = _ref.cx,
    cx = _ref$cx === void 0 ? 0 : _ref$cx,
    _ref$cy = _ref.cy,
    cy = _ref$cy === void 0 ? 0 : _ref$cy,
    _ref$innerRadius = _ref.innerRadius,
    innerRadius = _ref$innerRadius === void 0 ? 0 : _ref$innerRadius,
    _ref$outerRadius = _ref.outerRadius,
    outerRadius = _ref$outerRadius === void 0 ? 0 : _ref$outerRadius,
    _ref$gridType = _ref.gridType,
    gridType = _ref$gridType === void 0 ? 'polygon' : _ref$gridType,
    _ref$radialLines = _ref.radialLines,
    radialLines = _ref$radialLines === void 0 ? true : _ref$radialLines,
    props = _objectWithoutProperties$1(_ref, _excluded$1);
  if (outerRadius <= 0) {
    return null;
  }
  return /*#__PURE__*/React$2.createElement("g", {
    className: "recharts-polar-grid"
  }, /*#__PURE__*/React$2.createElement(PolarAngles, _extends$2({
    cx: cx,
    cy: cy,
    innerRadius: innerRadius,
    outerRadius: outerRadius,
    gridType: gridType,
    radialLines: radialLines
  }, props)), /*#__PURE__*/React$2.createElement(ConcentricPath, _extends$2({
    cx: cx,
    cy: cy,
    innerRadius: innerRadius,
    outerRadius: outerRadius,
    gridType: gridType,
    radialLines: radialLines
  }, props)));
};
PolarGrid.displayName = 'PolarGrid';

/**
 * Gets the first element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias first
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the first element of `array`.
 * @example
 *
 * _.head([1, 2, 3]);
 * // => 1
 *
 * _.head([]);
 * // => undefined
 */

function head(array) {
  return (array && array.length) ? array[0] : undefined;
}

var head_1 = head;

var first = head_1;

const first$1 = /*@__PURE__*/getDefaultExportFromCjs(first);

function _typeof$1(o) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$1(o); }
function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty$1(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor); } }
function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _callSuper$1(t, o, e) { return o = _getPrototypeOf$1(o), _possibleConstructorReturn$1(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf$1(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$1(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$1(self); }
function _isNativeReflectConstruct$1() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }
function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$1(subClass, superClass); }
function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }
function _defineProperty$1(obj, key, value) { key = _toPropertyKey$1(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey$1(t) { var i = _toPrimitive$1(t, "string"); return "symbol" == _typeof$1(i) ? i : String(i); }
function _toPrimitive$1(t, r) { if ("object" != _typeof$1(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof$1(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Radar
 */
const React$1 = await importShared('react');
const {PureComponent: PureComponent$1} = React$1;
var Radar = /*#__PURE__*/function (_PureComponent) {
  _inherits$1(Radar, _PureComponent);
  function Radar() {
    var _this;
    _classCallCheck$1(this, Radar);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper$1(this, Radar, [].concat(args));
    _defineProperty$1(_assertThisInitialized$1(_this), "state", {
      isAnimationFinished: false
    });
    _defineProperty$1(_assertThisInitialized$1(_this), "handleAnimationEnd", function () {
      var onAnimationEnd = _this.props.onAnimationEnd;
      _this.setState({
        isAnimationFinished: true
      });
      if (isFunction(onAnimationEnd)) {
        onAnimationEnd();
      }
    });
    _defineProperty$1(_assertThisInitialized$1(_this), "handleAnimationStart", function () {
      var onAnimationStart = _this.props.onAnimationStart;
      _this.setState({
        isAnimationFinished: false
      });
      if (isFunction(onAnimationStart)) {
        onAnimationStart();
      }
    });
    _defineProperty$1(_assertThisInitialized$1(_this), "handleMouseEnter", function (e) {
      var onMouseEnter = _this.props.onMouseEnter;
      if (onMouseEnter) {
        onMouseEnter(_this.props, e);
      }
    });
    _defineProperty$1(_assertThisInitialized$1(_this), "handleMouseLeave", function (e) {
      var onMouseLeave = _this.props.onMouseLeave;
      if (onMouseLeave) {
        onMouseLeave(_this.props, e);
      }
    });
    return _this;
  }
  _createClass$1(Radar, [{
    key: "renderDots",
    value: function renderDots(points) {
      var _this$props = this.props,
        dot = _this$props.dot,
        dataKey = _this$props.dataKey;
      var baseProps = filterProps(this.props, false);
      var customDotProps = filterProps(dot, true);
      var dots = points.map(function (entry, i) {
        var dotProps = _objectSpread$1(_objectSpread$1(_objectSpread$1({
          key: "dot-".concat(i),
          r: 3
        }, baseProps), customDotProps), {}, {
          dataKey: dataKey,
          cx: entry.x,
          cy: entry.y,
          index: i,
          payload: entry
        });
        return Radar.renderDotItem(dot, dotProps);
      });
      return /*#__PURE__*/React$1.createElement(Layer, {
        className: "recharts-radar-dots"
      }, dots);
    }
  }, {
    key: "renderPolygonStatically",
    value: function renderPolygonStatically(points) {
      var _this$props2 = this.props,
        shape = _this$props2.shape,
        dot = _this$props2.dot,
        isRange = _this$props2.isRange,
        baseLinePoints = _this$props2.baseLinePoints,
        connectNulls = _this$props2.connectNulls;
      var radar;
      if ( /*#__PURE__*/React$1.isValidElement(shape)) {
        radar = /*#__PURE__*/React$1.cloneElement(shape, _objectSpread$1(_objectSpread$1({}, this.props), {}, {
          points: points
        }));
      } else if (isFunction(shape)) {
        radar = shape(_objectSpread$1(_objectSpread$1({}, this.props), {}, {
          points: points
        }));
      } else {
        radar = /*#__PURE__*/React$1.createElement(Polygon, _extends$1({}, filterProps(this.props, true), {
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
          points: points,
          baseLinePoints: isRange ? baseLinePoints : null,
          connectNulls: connectNulls
        }));
      }
      return /*#__PURE__*/React$1.createElement(Layer, {
        className: "recharts-radar-polygon"
      }, radar, dot ? this.renderDots(points) : null);
    }
  }, {
    key: "renderPolygonWithAnimation",
    value: function renderPolygonWithAnimation() {
      var _this2 = this;
      var _this$props3 = this.props,
        points = _this$props3.points,
        isAnimationActive = _this$props3.isAnimationActive,
        animationBegin = _this$props3.animationBegin,
        animationDuration = _this$props3.animationDuration,
        animationEasing = _this$props3.animationEasing,
        animationId = _this$props3.animationId;
      var prevPoints = this.state.prevPoints;
      return /*#__PURE__*/React$1.createElement(Animate, {
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
        key: "radar-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function (_ref) {
        var t = _ref.t;
        var prevPointsDiffFactor = prevPoints && prevPoints.length / points.length;
        var stepData = points.map(function (entry, index) {
          var prev = prevPoints && prevPoints[Math.floor(index * prevPointsDiffFactor)];
          if (prev) {
            var _interpolatorX = interpolateNumber(prev.x, entry.x);
            var _interpolatorY = interpolateNumber(prev.y, entry.y);
            return _objectSpread$1(_objectSpread$1({}, entry), {}, {
              x: _interpolatorX(t),
              y: _interpolatorY(t)
            });
          }
          var interpolatorX = interpolateNumber(entry.cx, entry.x);
          var interpolatorY = interpolateNumber(entry.cy, entry.y);
          return _objectSpread$1(_objectSpread$1({}, entry), {}, {
            x: interpolatorX(t),
            y: interpolatorY(t)
          });
        });
        return _this2.renderPolygonStatically(stepData);
      });
    }
  }, {
    key: "renderPolygon",
    value: function renderPolygon() {
      var _this$props4 = this.props,
        points = _this$props4.points,
        isAnimationActive = _this$props4.isAnimationActive,
        isRange = _this$props4.isRange;
      var prevPoints = this.state.prevPoints;
      if (isAnimationActive && points && points.length && !isRange && (!prevPoints || !isEqual(prevPoints, points))) {
        return this.renderPolygonWithAnimation();
      }
      return this.renderPolygonStatically(points);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props,
        hide = _this$props5.hide,
        className = _this$props5.className,
        points = _this$props5.points,
        isAnimationActive = _this$props5.isAnimationActive;
      if (hide || !points || !points.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var layerClass = clsx('recharts-radar', className);
      return /*#__PURE__*/React$1.createElement(Layer, {
        className: layerClass
      }, this.renderPolygon(), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points));
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
    key: "renderDotItem",
    value: function renderDotItem(option, props) {
      var dotItem;
      if ( /*#__PURE__*/React$1.isValidElement(option)) {
        dotItem = /*#__PURE__*/React$1.cloneElement(option, props);
      } else if (isFunction(option)) {
        dotItem = option(props);
      } else {
        dotItem = /*#__PURE__*/React$1.createElement(Dot, _extends$1({}, props, {
          className: clsx('recharts-radar-dot', typeof option !== 'boolean' ? option.className : '')
        }));
      }
      return dotItem;
    }
  }]);
  return Radar;
}(PureComponent$1);
_defineProperty$1(Radar, "displayName", 'Radar');
_defineProperty$1(Radar, "defaultProps", {
  angleAxisId: 0,
  radiusAxisId: 0,
  hide: false,
  activeDot: true,
  dot: false,
  legendType: 'rect',
  isAnimationActive: !Global.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease'
});
_defineProperty$1(Radar, "getComposedData", function (_ref2) {
  var radiusAxis = _ref2.radiusAxis,
    angleAxis = _ref2.angleAxis,
    displayedData = _ref2.displayedData,
    dataKey = _ref2.dataKey,
    bandSize = _ref2.bandSize;
  var cx = angleAxis.cx,
    cy = angleAxis.cy;
  var isRange = false;
  var points = [];
  var angleBandSize = angleAxis.type !== 'number' ? bandSize !== null && bandSize !== void 0 ? bandSize : 0 : 0;
  displayedData.forEach(function (entry, i) {
    var name = getValueByDataKey(entry, angleAxis.dataKey, i);
    var value = getValueByDataKey(entry, dataKey);
    var angle = angleAxis.scale(name) + angleBandSize;
    var pointValue = Array.isArray(value) ? last(value) : value;
    var radius = isNil(pointValue) ? undefined : radiusAxis.scale(pointValue);
    if (Array.isArray(value) && value.length >= 2) {
      isRange = true;
    }
    points.push(_objectSpread$1(_objectSpread$1({}, polarToCartesian(cx, cy, radius, angle)), {}, {
      name: name,
      value: value,
      cx: cx,
      cy: cy,
      radius: radius,
      angle: angle,
      payload: entry
    }));
  });
  var baseLinePoints = [];
  if (isRange) {
    points.forEach(function (point) {
      if (Array.isArray(point.value)) {
        var baseValue = first$1(point.value);
        var radius = isNil(baseValue) ? undefined : radiusAxis.scale(baseValue);
        baseLinePoints.push(_objectSpread$1(_objectSpread$1({}, point), {}, {
          radius: radius
        }, polarToCartesian(cx, cy, radius, point.angle)));
      } else {
        baseLinePoints.push(point);
      }
    });
  }
  return {
    points: points,
    isRange: isRange,
    baseLinePoints: baseLinePoints
  };
});

var _excluded = ["type", "layout", "connectNulls", "ref"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
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
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Line
 */
const React = await importShared('react');
const {PureComponent} = React;
var Line = /*#__PURE__*/function (_PureComponent) {
  _inherits(Line, _PureComponent);
  function Line() {
    var _this;
    _classCallCheck(this, Line);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Line, [].concat(args));
    _defineProperty(_assertThisInitialized(_this), "state", {
      isAnimationFinished: true,
      totalLength: 0
    });
    _defineProperty(_assertThisInitialized(_this), "generateSimpleStrokeDasharray", function (totalLength, length) {
      return "".concat(length, "px ").concat(totalLength - length, "px");
    });
    _defineProperty(_assertThisInitialized(_this), "getStrokeDasharray", function (length, totalLength, lines) {
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
    _defineProperty(_assertThisInitialized(_this), "id", uniqueId('recharts-line-'));
    _defineProperty(_assertThisInitialized(_this), "pathRef", function (node) {
      _this.mainCurve = node;
    });
    _defineProperty(_assertThisInitialized(_this), "handleAnimationEnd", function () {
      _this.setState({
        isAnimationFinished: true
      });
      if (_this.props.onAnimationEnd) {
        _this.props.onAnimationEnd();
      }
    });
    _defineProperty(_assertThisInitialized(_this), "handleAnimationStart", function () {
      _this.setState({
        isAnimationFinished: false
      });
      if (_this.props.onAnimationStart) {
        _this.props.onAnimationStart();
      }
    });
    return _this;
  }
  _createClass(Line, [{
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
      var _ref3 = isDotProps(dot) ? dot : {},
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
        var className = clsx('recharts-line-dot', typeof option !== 'boolean' ? option.className : '');
        dotItem = /*#__PURE__*/React.createElement(Dot, _extends({}, props, {
          className: className
        }));
      }
      return dotItem;
    }
  }]);
  return Line;
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

/**
 * @fileOverview Radar Chart
 */
var RadarChart = generateCategoricalChart({
  chartName: 'RadarChart',
  GraphicalChild: Radar,
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
    startAngle: 90,
    endAngle: -270,
    cx: '50%',
    cy: '50%',
    innerRadius: 0,
    outerRadius: '80%'
  }
});

export { AuthContext as A, BrainCircuit as B, CalendarDays as C, LineChart as L, Moon as M, PolarGrid as P, RadarChart as R, Line as a, Radar as b, AuthProvider as c, useAuth as u };
