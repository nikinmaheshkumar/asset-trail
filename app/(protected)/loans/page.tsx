"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoansPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-loans");
  }, [router]);

  return null;
}