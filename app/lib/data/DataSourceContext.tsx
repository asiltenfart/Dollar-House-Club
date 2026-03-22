"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSource] = useState<DataSource>("mock");

  const toggleDataSource = useCallback(() => {
    setDataSource((prev) => (prev === "mock" ? "onchain" : "mock"));
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
