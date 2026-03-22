"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type DataSource = "mock" | "onchain";

interface DataSourceContextValue {
  dataSource: DataSource;
  toggleDataSource: () => void;
  isMock: boolean;
  isOnChain: boolean;
  isHydrated: boolean;
}

const DataSourceContext = createContext<DataSourceContextValue>({
  dataSource: "mock",
  toggleDataSource: () => {},
  isMock: true,
  isOnChain: false,
  isHydrated: false,
});

export function useDataSource() {
  return useContext(DataSourceContext);
}

const STORAGE_KEY = "dhc-data-source";

function getStoredSource(): DataSource {
  if (typeof window === "undefined") return "mock";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "onchain" ? "onchain" : "mock";
}

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSource] = useState<DataSource>("mock");
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setDataSource(getStoredSource());
    setIsHydrated(true);
  }, []);

  const toggleDataSource = useCallback(() => {
    setDataSource((prev) => {
      const next = prev === "mock" ? "onchain" : "mock";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <DataSourceContext.Provider
      value={{
        dataSource,
        toggleDataSource,
        isMock: dataSource === "mock",
        isOnChain: dataSource === "onchain",
        isHydrated,
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}
