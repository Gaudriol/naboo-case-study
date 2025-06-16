import { Notification } from "@mantine/core";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { createContext, useEffect, useState } from "react";

interface SnackbarContextType {
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
}

interface Snackbar {
  message: string;
  type: "error" | "success" | "info";
}

export const SnackbarContext = createContext<SnackbarContextType>({
  error: () => {},
  success: () => {},
  info: () => {},
});

const colorMap: Record<Snackbar["type"], string> = {
  error: "red",
  success: "green",
  info: "blue",
};

const iconMap: Record<Snackbar["type"], React.ReactNode> = {
  error: <IconX size="1.1rem" />,
  success: <IconCheck size="1.1rem" />,
  info: <IconInfoCircle size="1.1rem" />,
};

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [snackbar, setSnackbar] = useState<Snackbar | null>(null);

  const error = (message: string) => {
    console.error(message);
    setSnackbar({ message, type: "error" });
  };

  const success = (message: string) => {
    setSnackbar({ message, type: "success" });
  };

  const info = (message: string) => {
    setSnackbar({ message, type: "info" });
  };

  useEffect(() => {
    if (snackbar) {
      setTimeout(() => {
        setSnackbar(null);
      }, 1000);
    }
  }, [snackbar]);

  return (
    <SnackbarContext.Provider value={{ success, error, info }}>
      {children}
      {snackbar && (
        <Notification
          icon={iconMap[snackbar.type]}
          color={colorMap[snackbar.type]}
          style={{ position: "fixed", right: 10, bottom: 10, zIndex: 999 }}
        >
          {snackbar.message}
        </Notification>
      )}
    </SnackbarContext.Provider>
  );
};
