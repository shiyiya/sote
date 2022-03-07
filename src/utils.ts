export const isFunction = (fn: any): fn is Function => typeof fn === 'function'

export const isPromise = (value: any): value is Promise<any> => value && isFunction(value.then)

export const isObject = (value: any): value is Object =>
  Object.prototype.toString.call(value) == '[object Object]'

export const isArray = (value: any): value is any[] => Array.isArray(value)
