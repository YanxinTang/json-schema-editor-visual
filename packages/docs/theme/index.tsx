import { Layout as BasicLayout } from '@rspress/core/theme-original';
import { useDark } from '@rspress/core/runtime';
import './index.css';
import { useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';

const Layout = () => {
  const [motion, setMotion] = useState(false);
  const isDark = useDark();

  useEffect(() => {
    document.documentElement.classList.add('hydrated');
    setMotion(true);
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: { motion },
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <BasicLayout />
    </ConfigProvider>
  );
};

export { Layout };
export * from '@rspress/core/theme-original';
