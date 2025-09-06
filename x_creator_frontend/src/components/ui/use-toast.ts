import * as React from "react";

type Toast = {
  id: string;
  message: string;
};

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = (message: string) => {
    const id = Date.now().toString();
    setToasts([...toasts, { id, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3000);
  };

  return { toasts, addToast };
}
