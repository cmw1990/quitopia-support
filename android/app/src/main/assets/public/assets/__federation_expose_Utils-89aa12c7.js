const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
};
const daysBetween = (startDate, endDate = /* @__PURE__ */ new Date()) => {
  const oneDay = 24 * 60 * 60 * 1e3;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
};
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};
const truncateString = (str, length = 50) => {
  if (!str)
    return "";
  if (str.length <= length)
    return str;
  return str.substring(0, length) + "...";
};
const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
};
const debounce = (func, wait) => {
  let timeout = null;
  return (...args) => {
    if (timeout)
      clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
const isEmpty = (value) => {
  if (value === null || value === void 0)
    return true;
  if (typeof value === "string" && value.trim() === "")
    return true;
  if (Array.isArray(value) && value.length === 0)
    return true;
  if (typeof value === "object" && Object.keys(value).length === 0)
    return true;
  return false;
};

export { daysBetween, debounce, formatCurrency, formatDate, generateUUID, isEmpty, truncateString };
