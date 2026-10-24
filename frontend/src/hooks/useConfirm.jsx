import { useCallback, useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

// Promise-based stand-in for window.confirm:
//   const { confirm, confirmDialog } = useConfirm();
//   if (!(await confirm({ title, message, danger: true }))) return;
// `confirmDialog` must be rendered somewhere in the component's output.
export function useConfirm() {
  const [options, setOptions] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback(
    (nextOptions) =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setOptions(nextOptions);
      }),
    [],
  );

  const settle = useCallback((answer) => {
    resolveRef.current?.(answer);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  const onConfirm = useCallback(() => settle(true), [settle]);
  const onCancel = useCallback(() => settle(false), [settle]);

  const confirmDialog = options ? (
    <ConfirmDialog {...options} onConfirm={onConfirm} onCancel={onCancel} />
  ) : null;

  return { confirm, confirmDialog };
}
