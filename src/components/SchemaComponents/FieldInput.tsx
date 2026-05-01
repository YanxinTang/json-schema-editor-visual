import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';

interface FieldInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FieldInput({
  value: propsValue = '',
  onChange,
  ...restProps
}: FieldInputProps) {
  const [internalValue, setInternalValue] = useState<string>(propsValue);
  const propsValueRef = useRef<string>(propsValue);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    propsValueRef.current = propsValue;
    setInternalValue(propsValue);
  }, [propsValue]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setInternalValue(e.target.value);
    },
    [],
  );

  const handlePressEnter: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback((e) => {
      if ((e.target as HTMLInputElement).value !== propsValueRef.current) {
        onChangeRef.current?.(
          e as unknown as React.ChangeEvent<HTMLInputElement>,
        );
      }
    }, []);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if ((e.target as HTMLInputElement).value !== propsValueRef.current) {
        onChangeRef.current?.(
          e as unknown as React.ChangeEvent<HTMLInputElement>,
        );
      }
    },
    [],
  );

  return (
    <Input
      {...restProps}
      value={internalValue}
      onChange={handleChange}
      onPressEnter={handlePressEnter}
      onBlur={handleBlur}
    />
  );
}
