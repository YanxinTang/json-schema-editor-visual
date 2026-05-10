import { Format, JsonSchema } from './types';

export const JSONPATH_JOIN_CHAR = '.';

export let lang = 'en_US';

export function setLang(language: 'zh_CN' | 'en_US'): void {
  lang = language;
}

export const format: Format = [
  { name: 'date-time' },
  { name: 'date' },
  { name: 'email' },
  { name: 'hostname' },
  { name: 'ipv4' },
  { name: 'ipv6' },
  { name: 'uri' },
];

export const SCHEMA_TYPE = [
  'string',
  'number',
  'array',
  'object',
  'boolean',
  'integer',
] as const;

export const defaultSchema: Record<string, JsonSchema> = {
  string: {
    type: 'string',
  },
  number: {
    type: 'number',
  },
  array: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
  object: {
    type: 'object',
    properties: {},
  },
  boolean: {
    type: 'boolean',
  },
  integer: {
    type: 'integer',
  },
};

// 防抖函数，减少高频触发的函数执行的频率
// 修复了 args 和 this 指向，确保类型安全
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

export function getData(
  state: Record<string, unknown>,
  keys: PropertyKey[],
): unknown {
  let curState: unknown = state;
  for (let i = 0; i < keys.length; i++) {
    if (curState == null) return undefined;
    curState = (curState as Record<string, unknown>)[keys[i] as string];
  }
  return curState;
}

export function setData(
  state: Record<string, unknown>,
  keys: PropertyKey[],
  value: unknown,
): void {
  let curState: Record<string, unknown> = state;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string;
    if (curState[key] == null) {
      curState[key] = typeof keys[i + 1] === 'number' ? [] : {};
    }
    curState = curState[key] as Record<string, unknown>;
  }
  curState[keys[keys.length - 1] as string] = value;
}

export function deleteData(
  state: Record<string, unknown>,
  keys: PropertyKey[],
): void {
  let curState: Record<string, unknown> = state;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string;
    if (curState[key] == null) return;
    curState = curState[key] as Record<string, unknown>;
  }
  delete curState[keys[keys.length - 1] as string];
}

export function getParentKeys<T>(keys: T[]): T[] {
  if (keys.length <= 1) return [];
  const arr = [...keys];
  arr.splice(keys.length - 1, 1);
  return arr;
}

export function clearSomeFields<T extends Record<string, unknown>>(
  keys: string[],
  data: T,
): T {
  const newData = { ...data };
  keys.forEach((key) => {
    delete newData[key];
  });
  return newData;
}

function getFieldstitle(data: Record<string, unknown>): string[] {
  // 简化了原有 Object.keys().map() 的写法
  return Object.keys(data);
}

export function handleSchemaRequired(
  schema: JsonSchema,
  checked: boolean,
): JsonSchema | void {
  if (schema.type === 'object') {
    const requiredtitle = getFieldstitle(schema.properties || {});

    if (checked) {
      schema.required = [...requiredtitle];
    } else {
      delete schema.required;
    }

    if (schema.properties) {
      handleObject(schema.properties, checked);
    }
  } else if (schema.type === 'array' && schema.items) {
    handleSchemaRequired(schema.items, checked);
  } else {
    return schema;
  }
}

function handleObject(
  properties: Record<string, JsonSchema>,
  checked: boolean,
): void {
  for (const key in properties) {
    if (properties[key].type === 'array' || properties[key].type === 'object') {
      handleSchemaRequired(properties[key], checked);
    }
  }
}

/**
 * 检查值是否为 null 或 undefined
 * @param value - 要检查的值
 * @returns 当值为 null 或 undefined 时返回 true，否则返回 false
 * @example
 * isNil(null)      // true
 * isNil(undefined) // true
 * isNil(0)         // false
 * isNil('')        // false
 */
export function isNil(value: unknown): value is null | undefined {
  return value == null;
}

/**
 * 深度比较两个值是否相等
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns 两个值深度相等时返回 true
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (
        !Object.prototype.hasOwnProperty.call(b, key) ||
        !isEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        )
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
}

export function cloneObject<T>(obj: T): T {
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      const newArr: unknown[] = [];
      obj.forEach((item, index) => {
        newArr[index] = cloneObject(item);
      });
      return newArr as unknown as T;
    } else {
      const newObj = {} as Record<string, unknown>;
      for (const key in obj) {
        newObj[key] = cloneObject((obj as Record<string, unknown>)[key]);
      }
      return newObj as T;
    }
  } else {
    return obj;
  }
}
