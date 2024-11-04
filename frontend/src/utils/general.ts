// typechecking / type guards for primitive values
export function isUndefined(val: unknown): val is undefined {
  return typeof val === 'undefined';
}
export function isNull(val: unknown): val is null {
  return typeof val === 'object' && val === null;
}
export function isObject(val: unknown): val is object {
  return typeof val === "object" && !isNull(val);
}
export function isNullish(val: unknown): val is undefined | null {
  return isUndefined(val) || isNull(val);
}
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean';
}
export function isSymbol(val: unknown): val is symbol {
  return typeof val === 'symbol';
}
export function isNumber(val: unknown): val is number {
  return typeof val === 'number';
}
export function isBigInt(val: unknown): val is bigint {
  return typeof val === 'bigint';
}
export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

const toString: (val: object) => string = (val: object) => {
  return Object.prototype.toString.call(val);
};
const toTypeString: (val: object) => string = (val: object) => {
  const objString = toString(val);
  return objString.slice(8, objString.length-1);
};

// typechecking / type guards for object types
export type PlainObject = { [key: string | number | symbol ]: unknown };
export function isPlainObject(val: unknown): val is PlainObject {
  return isObject(val) && toTypeString(val) === "Object";
}
export function isArray(val: unknown): val is Array<any> {
  return isObject(val) && toTypeString(val) === "Array";
}
export function isMap(val: unknown): val is Map<any, any> {
  return isObject(val) && toTypeString(val) === "Map";
}
export function isWeakMap(val: unknown): val is WeakMap<any, any> {
  return isObject(val) && toTypeString(val) === "WeakMap";
}
export function isSet(val: unknown): val is Set<any> {
  return isObject(val) && toTypeString(val) === "Set";
}
export function isWeakSet(val: unknown): val is WeakSet<any> {
  return isObject(val) && toTypeString(val) === "WeakSet";
}
export function isFunction(val: unknown): val is Function {
  return typeof val === "function" || (isObject(val) && toTypeString(val) === "Function");
}

export function isOwnProperty<K extends keyof T, T extends object>(val: unknown, obj: T): val is K {
  if (!isString(val)) { return false; }
  return (Object.keys(obj).includes(val));
}