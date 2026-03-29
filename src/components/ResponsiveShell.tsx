import React from "react";

interface ResponsiveShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const ResponsiveShell = ({ children, fullWidth = false }: ResponsiveShellProps) => {
  if (fullWidth) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl min-h-screen bg-background md:shadow-2xl md:border-x md:border-border">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveShell;
