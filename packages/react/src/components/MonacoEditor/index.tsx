import { lazy, Suspense, useContext } from 'react';
import { MocanoEditorProps } from './Editor';
import MonacoSkeleton from './MonacoSkeleton';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { THEME } from '../../constant';

const Editor = lazy(() => import('./Editor'));

export default function (props: Omit<MocanoEditorProps, 'theme'>) {
  const { theme: userTheme } = useContext(ConfigProvider.ConfigContext);
  const isDark = userTheme.algorithm === antdTheme.darkAlgorithm;
  const theme = isDark ? THEME.DARK : THEME.LIGHT;

  return (
    <Suspense fallback={<MonacoSkeleton theme={theme} />}>
      <Editor theme={theme} {...props} />
    </Suspense>
  );
}
