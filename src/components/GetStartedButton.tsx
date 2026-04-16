"use client";

import { useState } from "react";
import { GetStartedModal } from "./GetStartedModal";

export function GetStartedButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <GetStartedModal onClose={() => setOpen(false)} />}
    </>
  );
}
