"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type DataSource = "mock" | "onchain";

interface DataSourceContextValue {
  dataSource: DataSource;
  toggleDataSource: () => void;
  isMock: boolean;
  isOnChain: boolean;
}

const DataSourceContext = createContext<DataSourceContextValue>({
  dataSource: "mock",
  toggleDataSource: () => {},
  isMock: true,
  isOnChain: false,
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

  // Hydrate from localStorage on mount
  useEffect(() => {
    setDataSource(getStoredSource());
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
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}
