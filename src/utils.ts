import { JSONSchema } from './types';

export const JSONPATH_JOIN_CHAR = '.';

export let lang = 'en_US';

export function setLang(language: 'zh_CN' | 'en_US'): void {
  lang = language;
}

export const format = [
  { name: 'date-time' },
  { name: 'date' },
  { name: 'email' },
  { name: 'hostname' },
  { name: 'ipv4' },
  { name: 'ipv6' },
  { name: 'uri' },
] as const;

export const SCHEMA_TYPE = [
  'string',
  'number',
  'array',
  'object',
  'boolean',
  'integer',
] as const;

export const defaultSchema: Record<string, JSONSchema> = {
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
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

export function getData(state: any, keys: PropertyKey[]): any {
  let curState = state;
  for (let i = 0; i < keys.length; i++) {
    if (curState == null) return undefined;
    curState = curState[keys[i]];
  }
  return curState;
}

export function setData(state: any, keys: PropertyKey[], value: any): void {
  let curState = state;
  for (let i = 0; i < keys.length - 1; i++) {
    if (curState[keys[i]] == null) {
      curState[keys[i]] = typeof keys[i + 1] === 'number' ? [] : {};
    }
    curState = curState[keys[i]];
  }
  curState[keys[keys.length - 1]] = value;
}

export function deleteData(state: any, keys: PropertyKey[]): void {
  let curState = state;
  for (let i = 0; i < keys.length - 1; i++) {
    if (curState[keys[i]] == null) return;
    curState = curState[keys[i]];
  }
  delete curState[keys[keys.length - 1]];
}

export function getParentKeys<T>(keys: T[]): T[] {
  if (keys.length <= 1) return [];
  const arr = [...keys];
  arr.splice(keys.length - 1, 1);
  return arr;
}

export function clearSomeFields<T extends Record<string, any>>(
  keys: string[],
  data: T,
): T {
  const newData = { ...data };
  keys.forEach((key) => {
    delete newData[key];
  });
  return newData;
}

function getFieldstitle(data: Record<string, any>): string[] {
  // 简化了原有 Object.keys().map() 的写法
  return Object.keys(data);
}

export function handleSchemaRequired(
  schema: JSONSchema,
  checked: boolean,
): JSONSchema | void {
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
  properties: Record<string, JSONSchema>,
  checked: boolean,
): void {
  for (const key in properties) {
    if (properties[key].type === 'array' || properties[key].type === 'object') {
      handleSchemaRequired(properties[key], checked);
    }
  }
}

export function cloneObject<T>(obj: T): T {
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      const newArr = [] as any[];
      obj.forEach((item, index) => {
        newArr[index] = cloneObject(item);
      });
      return newArr as unknown as T;
    } else {
      const newObj = {} as Record<string, any>;
      for (const key in obj) {
        newObj[key] = cloneObject((obj as Record<string, any>)[key]);
      }
      return newObj as T;
    }
  } else {
    return obj;
  }
}
