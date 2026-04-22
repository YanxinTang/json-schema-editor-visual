import { describe, test, expect, beforeAll, rs, afterAll } from '@rstest/core';
import {
  getData,
  setData,
  deleteData,
  getParentKeys,
  clearSomeFields,
  handleSchemaRequired,
  cloneObject,
  debounce,
} from '../src/utils';
import { JSONSchema } from '../src/types';

describe('utils', () => {
  describe('getData', () => {
    test('应该能正确获取嵌套对象的值', () => {
      const state = { a: { b: { c: 42 } } };
      expect(getData(state, ['a', 'b', 'c'])).toBe(42);
    });

    test('当路径不存在时应该返回 undefined', () => {
      const state = { a: { b: 1 } };
      expect(getData(state, ['a', 'c', 'd'])).toBeUndefined();
    });

    test('当 state 自身为空时应安全返回 undefined', () => {
      expect(getData(null, ['a'])).toBeUndefined();
    });
  });

  describe('setData', () => {
    test('应该能正确修改嵌套对象的值', () => {
      const state = { a: { b: { c: 1 } } };
      setData(state, ['a', 'b', 'c'], 2);
      expect(state.a.b.c).toBe(2);
    });

    test('当中间路径不存在时，应该自动创建对象', () => {
      const state: any = {};
      setData(state, ['a', 'b', 'c'], 'hello');
      expect(state.a.b.c).toBe('hello');
    });
  });

  describe('deleteData', () => {
    test('应该能正确删除嵌套对象中的字段', () => {
      const state = { a: { b: 1, c: 2 } };
      deleteData(state, ['a', 'b']);
      expect(state.a.b).toBeUndefined();
      expect(state.a.c).toBe(2);
    });

    test('当尝试删除不存在的路径时，不应该报错', () => {
      const state = { a: 1 };
      expect(() => deleteData(state, ['x', 'y'])).not.toThrow();
    });
  });

  describe('getParentKeys', () => {
    test('应该返回父级路径数组', () => {
      expect(getParentKeys(['a', 'b', 'c'])).toEqual(['a', 'b']);
    });

    test('当路径长度为 1 时，应该返回空数组', () => {
      expect(getParentKeys(['a'])).toEqual([]);
    });
  });

  describe('clearSomeFields', () => {
    test('应该清除指定的字段，且不改变原对象 (纯函数)', () => {
      const data = { a: 1, b: 2, c: 3 };
      const result = clearSomeFields(['a', 'c'], data);

      expect(result).toEqual({ b: 2 });
      // 确保原对象未被修改
      expect(data).toEqual({ a: 1, b: 2, c: 3 });
    });
  });

  describe('cloneObject', () => {
    test('应该深度克隆对象', () => {
      const original = { a: 1, b: { c: [1, 2, 3] } };
      const cloned = cloneObject(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.c).not.toBe(original.b.c);
    });

    test('应该正确处理基本数据类型', () => {
      expect(cloneObject(42)).toBe(42);
      expect(cloneObject('hello')).toBe('hello');
      expect(cloneObject(null)).toBe(null);
    });
  });

  describe('handleSchemaRequired', () => {
    test('checked 为 true 时，应该将 object 类型的所有属性设为 required', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };

      handleSchemaRequired(schema, true);
      expect(schema.required).toEqual(['name', 'age']);
    });

    test('checked 为 false 时，应该移除 required 字段', () => {
      const schema: JSONSchema = {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      };

      handleSchemaRequired(schema, false);
      expect(schema.required).toBeUndefined();
    });

    test('应该递归处理嵌套的 object 和 array', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
          },
        },
      };

      handleSchemaRequired(schema, true);

      // 顶层 required
      expect(schema.required).toEqual(['users']);
      // 嵌套 array 中的 items 对象的 required
      expect(schema.properties?.users.items?.required).toEqual(['id']);
    });
  });

  describe('debounce', () => {
    // 启用假定时器以测试异步的防抖逻辑
    beforeAll(() => {
      rs.useFakeTimers();
    });

    afterAll(() => {
      rs.useRealTimers();
    });

    test('应该在指定时间后才执行函数', () => {
      const mockFn = rs.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      // 此时不应该被调用
      expect(mockFn).not.toHaveBeenCalled();

      // 快进 1000 毫秒
      rs.advanceTimersByTime(1000);

      // 应该只被调用一次
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('应该正确传递参数和 this 上下文', () => {
      const mockFn = rs.fn();
      const context = { value: 42 };

      const debouncedFn = debounce(function (this: any, arg1: string) {
        mockFn(this.value, arg1);
      }, 500);

      debouncedFn.call(context, 'test');
      rs.advanceTimersByTime(500);

      expect(mockFn).toHaveBeenCalledWith(42, 'test');
    });
  });
});
