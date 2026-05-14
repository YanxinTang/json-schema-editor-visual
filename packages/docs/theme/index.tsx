import { Layout as BasicLayout } from '@rspress/core/theme-original';
import './index.css';
import { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';

const Layout = () => {
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    document.documentElement.classList.add('hydrated');
    setMotion(true);
  }, []);

  return (
    <ConfigProvider theme={{ token: { motion } }}>
      <BasicLayout />
    </ConfigProvider>
  );
};

export { Layout };
export * from '@rspress/core/theme-original';
