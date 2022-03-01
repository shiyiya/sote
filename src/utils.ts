export const isFunction = (fn: any): fn is Function => typeof fn === 'function'

export const isPromise = (value: any): value is Promise<any> => value && isFunction(value.then)

export const isObject = (value) => typeof value === 'object' && value !== null
