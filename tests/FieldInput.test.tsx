import { describe, test, expect, afterEach, rs } from '@rstest/core';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import FieldInput from '../src/components/SchemaComponents/FieldInput';

afterEach(() => {
  cleanup();
});

describe('FieldInput', () => {
  test('应该渲染初始值', () => {
    render(<FieldInput value="hello" />);
    const input = screen.getByDisplayValue('hello');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('hello');
  });

  test('应该渲染空值', () => {
    render(<FieldInput value="" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  test('输入时应更新内部状态但不触发 onChange', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="initial" onChange={onChange} />);
    const input = screen.getByDisplayValue('initial');

    await user.clear(input);
    await user.type(input, 'new value');

    expect(input).toHaveValue('new value');
    expect(onChange).not.toHaveBeenCalled();
  });

  test('按下 Enter 键且值发生变化时应触发 onChange', () => {
    const onChange = rs.fn();

    render(<FieldInput value="old" onChange={onChange} />);
    const input = screen.getByDisplayValue('old');

    // 模拟用户输入新值
    fireEvent.change(input, { target: { value: 'new' } });
    // 触发 Enter 键的 keyup 事件
    fireEvent.keyUp(input, { keyCode: 13 });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'new' }),
      }),
    );
  });

  test('按下 Enter 键但值未变化时不应触发 onChange', () => {
    const onChange = rs.fn();

    render(<FieldInput value="same" onChange={onChange} />);
    const input = screen.getByDisplayValue('same');

    // 值未改变时按 Enter
    fireEvent.keyUp(input, { keyCode: 13 });

    expect(onChange).not.toHaveBeenCalled();
  });

  test('失焦且值发生变化时应触发 onChange', () => {
    const onChange = rs.fn();

    render(<FieldInput value="old" onChange={onChange} />);
    const input = screen.getByDisplayValue('old');

    // 模拟用户输入新值
    fireEvent.change(input, { target: { value: 'changed' } });
    // 触发 blur 事件
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'changed' }),
      }),
    );
  });

  test('失焦但值未变化时不应触发 onChange', () => {
    const onChange = rs.fn();

    render(<FieldInput value="unchanged" onChange={onChange} />);
    const input = screen.getByDisplayValue('unchanged');

    // 值未改变时触发 blur
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
  });

  test('props.value 更新时应同步内部状态', () => {
    const { rerender } = render(<FieldInput value="first" />);
    const input = screen.getByDisplayValue('first');
    expect(input).toHaveValue('first');

    rerender(<FieldInput value="second" />);
    expect(input).toHaveValue('second');
  });

  test('值未改变时失焦不应触发 onChange', () => {
    const onChange = rs.fn();

    render(<FieldInput value="test" onChange={onChange} />);
    const input = screen.getByDisplayValue('test');

    fireEvent.blur(input);
    fireEvent.keyUp(input, { keyCode: 13 });

    expect(onChange).not.toHaveBeenCalled();
  });

  test('值发生变化时失焦应触发 onChange 并传递事件对象', () => {
    const onChange = rs.fn();

    render(<FieldInput value="test" onChange={onChange} />);
    const input = screen.getByDisplayValue('test');

    fireEvent.change(input, { target: { value: 'new' } });
    expect(input).toHaveValue('new');

    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'new' }),
      }),
    );
  });

  test('应该将额外的 props 透传给底层 Input 组件', () => {
    render(<FieldInput value="test" placeholder="请输入" disabled />);
    const input = screen.getByPlaceholderText('请输入');
    expect(input).toBeDisabled();
  });

  test('应该支持自定义 className', () => {
    const { container } = render(
      <FieldInput value="test" className="custom-class" />,
    );
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  test('多次输入后按 Enter 应触发 onChange 且值为最新输入', () => {
    const onChange = rs.fn();

    render(<FieldInput value="start" onChange={onChange} />);
    const input = screen.getByDisplayValue('start');

    // 模拟多次输入
    fireEvent.change(input, { target: { value: 'step1' } });
    fireEvent.change(input, { target: { value: 'step2' } });
    fireEvent.change(input, { target: { value: 'final' } });

    // 按 Enter 触发 onChange
    fireEvent.keyUp(input, { keyCode: 13 });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'final' }),
      }),
    );
  });

  test('输入后失焦触发 onChange，props 更新后再次失焦不应重复触发', () => {
    const onChange = rs.fn();

    const { rerender } = render(
      <FieldInput value="original" onChange={onChange} />,
    );
    const input = screen.getByDisplayValue('original');

    // 第一次改变值后失焦
    fireEvent.change(input, { target: { value: 'changed' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledTimes(1);

    // 模拟父组件收到 onChange 后更新 props
    rerender(<FieldInput value="changed" onChange={onChange} />);

    // props.value 已更新为 "changed"，再次失焦不应触发 onChange
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('非 Enter 键的 keyup 不应触发 onChange', () => {
    const onChange = rs.fn();

    render(<FieldInput value="test" onChange={onChange} />);
    const input = screen.getByDisplayValue('test');

    fireEvent.change(input, { target: { value: 'tests' } });
    // 按下其他键（如字母键 keyCode 83 代表 's'）
    fireEvent.keyUp(input, { keyCode: 83 });

    expect(onChange).not.toHaveBeenCalled();
  });
});
