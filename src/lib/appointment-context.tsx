import { createContext, useContext, useState, type ReactNode } from "react";

interface AppointmentContextValue {
  isOpen: boolean;
  open: (prefillService?: string) => void;
  close: () => void;
  prefillService: string;
}

const AppointmentContext = createContext<AppointmentContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  prefillService: "",
});

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefillService, setPrefillService] = useState("");

  const open = (service = "") => {
    setPrefillService(service);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <AppointmentContext.Provider value={{ isOpen, open, close, prefillService }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointment() {
  return useContext(AppointmentContext);
}
