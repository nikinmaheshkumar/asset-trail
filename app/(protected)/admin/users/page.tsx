"use client";

import { useEffect, useState } from "react";
import { Button, Center, Loader } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { IconPlus } from "@tabler/icons-react";
import { UsersTable } from "@/components/users/UsersTable";
import { useDisclosure } from "@mantine/hooks";
import { AddMemberModal } from "@/components/users/AddMemberModal";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [opened, { open, close }] = useDisclosure(false);

  const userRole = session?.user?.role;
  const currentUserId = session?.user?.id;

  const DEFAULT_PASSWORD = "Temp@123";

  useEffect(() => {
    if (status === "loading") return;

    if (userRole !== "MASTER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [userRole, status, router]);

  async function fetchMembers() {
    try {
      setLoading(true);

      const res = await fetch("/api/members");
      const data = await res.json();

      setMembers(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(id: number, role: string) {
    await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    fetchMembers();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/members/${id}`, {
      method: "DELETE",
    });

    fetchMembers();
  }

  async function handleResetPassword(id: number) {
    if (id === currentUserId) {
      throw new Error("You cannot reset your own password");
    }

    const res = await fetch(`/api/members/${id}/reset-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: DEFAULT_PASSWORD }),
    });

    if (!res.ok) {
      throw new Error("Reset failed");
    }

    return DEFAULT_PASSWORD;
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <>
      <PageHeader
        title="Members"
        subtitle="Manage system users and permissions"
        rightSection={
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Member
          </Button>
        }
      />

      {loading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : (
        <UsersTable
          members={members}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
          currentUserId={currentUserId}
        />
      )}

      <AddMemberModal
        opened={opened}
        onClose={close}
        onSuccess={fetchMembers}
      />
    </>
  );
}