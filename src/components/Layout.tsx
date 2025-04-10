import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "./ui/toaster";

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-4">
        {children || <Outlet />}
      </main>
      <Toaster />
    </div>
  );
};
