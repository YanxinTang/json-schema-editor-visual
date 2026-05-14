import { lazy, Suspense } from 'react';
import { MocanoEditorProps } from './Editor';
import MonacoSkeleton from './MonacoSkeleton';

const Editor = lazy(() => import('./Editor'));

export default function (props: MocanoEditorProps) {
  return (
    <Suspense fallback={<MonacoSkeleton />}>
      <Editor {...props} />
    </Suspense>
  );
}
