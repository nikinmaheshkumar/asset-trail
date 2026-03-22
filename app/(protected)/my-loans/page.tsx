"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { MyLoansTable } from "@/components/loans/MyLoansTable";
import { IconClipboardList } from "@tabler/icons-react";

export default function MyLoansPage() {
  return (
    <>
      <PageHeader
        title="My Loans"
        subtitle="Track your asset loan requests and active borrowings"
        icon={<IconClipboardList size={20} />}
      />
      <MyLoansTable />
    </>
  );
}
