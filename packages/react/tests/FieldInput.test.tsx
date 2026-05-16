import { describe, test, expect, afterEach, rs } from '@rstest/core';
import { render, screen, cleanup } from '@testing-library/react';
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

  test('按下 Enter 键且值发生变化时应触发 onChange', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="old" onChange={onChange} />);
    const input = screen.getByDisplayValue('old');

    // 模拟用户输入新值
    await user.clear(input);
    await user.type(input, 'new{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'new' }),
      }),
    );
  });

  test('按下 Enter 键但值未变化时不应触发 onChange', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="same" onChange={onChange} />);
    const input = screen.getByDisplayValue('same');

    // 值未改变时按 Enter
    await user.type(input, '{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('失焦且值发生变化时应触发 onChange', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="old" onChange={onChange} />);
    const input = screen.getByDisplayValue('old');

    // 模拟用户输入新值
    await user.clear(input);
    await user.type(input, 'changed');
    // 触发 blur 事件
    await user.tab();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'changed' }),
      }),
    );
  });

  test('失焦但值未变化时不应触发 onChange', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="unchanged" onChange={onChange} />);
    const input = screen.getByDisplayValue('unchanged');

    // 值未改变时触发 blur
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
  });

  test('props.value 更新时应同步内部状态', () => {
    const { rerender } = render(<FieldInput value="first" />);
    const input = screen.getByDisplayValue('first');
    expect(input).toHaveValue('first');

    rerender(<FieldInput value="second" />);
    expect(input).toHaveValue('second');
  });

  test('值未改变时失焦不应触发 onChange', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="test" onChange={onChange} />);
    const input = screen.getByDisplayValue('test');

    await user.tab();
    await user.type(input, '{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('值发生变化时失焦应触发 onChange 并传递事件对象', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="test" onChange={onChange} />);
    const input = screen.getByDisplayValue('test');

    await user.clear(input);
    await user.type(input, 'new');
    expect(input).toHaveValue('new');

    await user.tab();

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

  test('输入后失焦触发 onChange，props 更新后再次失焦不应重复触发', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <FieldInput value="original" onChange={onChange} />,
    );
    const input = screen.getByDisplayValue('original');

    // 第一次改变值后失焦
    await user.clear(input);
    await user.type(input, 'changed');
    await user.tab();
    expect(onChange).toHaveBeenCalledTimes(1);

    // 模拟父组件收到 onChange 后更新 props
    rerender(<FieldInput value="changed" onChange={onChange} />);

    // props.value 已更新为 "changed"，再次失焦不应触发 onChange
    await user.click(input);
    await user.tab();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('非 Enter 键的 keyup 不应触发 onChange', async () => {
    const onChange = rs.fn();
    const user = userEvent.setup();

    render(<FieldInput value="test" onChange={onChange} />);
    const input = screen.getByDisplayValue('test');

    // 按下其他键（如字母键 's'）
    await user.type(input, 's');

    expect(onChange).not.toHaveBeenCalled();
  });
});
