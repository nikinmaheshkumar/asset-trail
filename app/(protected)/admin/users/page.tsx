"use client";

import { useEffect, useState } from "react";
import { Title, Paper } from "@mantine/core";
import { DesktopUsersTable } from "@/components/users/DesktopUsersTable";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);

  // Fetch members
  async function fetchMembers() {
    const res = await fetch("/api/members");
    const data = await res.json();
    setMembers(data);
  }

  // Change role
  async function handleRoleChange(id: number, role: string) {
    await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    fetchMembers();
  }

  // Delete user
  async function handleDelete(id: number) {
    await fetch(`/api/members/${id}`, {
      method: "DELETE",
    });

    fetchMembers();
  }

  useEffect(() => {
    (async () => {
      await fetchMembers();
    })();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <Title order={2} mb="lg">
        Members
      </Title>

      <Paper withBorder radius="md" p="md">
        <DesktopUsersTable
          members={members}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />
      </Paper>
    </div>
  );
}