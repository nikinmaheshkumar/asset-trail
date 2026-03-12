"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  Select,
  Button,
  Stack,
  CopyButton,
  ActionIcon,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy } from "@tabler/icons-react";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddMemberModal({ opened, onClose, onSuccess }: Props) {
  const DEFAULT_PASSWORD = "IEEERASvit@26";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [role, setRole] = useState<string | null>("JUNIOR_CORE");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name || !email || !password) {
      notifications.show({
        title: "Missing fields",
        message: "Please fill all required fields",
        color: "red",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      notifications.show({
        title: "Member Created",
        message: "User successfully added",
        color: "green",
      });

      onSuccess();
      onClose();

      // Reset form
      setName("");
      setEmail("");
      setPassword(DEFAULT_PASSWORD);
      setRole("JUNIOR_CORE");
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to create member",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add Member" centered>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Password"
          value={password}
          readOnly
          rightSection={
            <CopyButton value={password}>
              {({ copied, copy }) => (
                <ActionIcon
                  size="sm"
                  color={copied ? "teal" : "gray"}
                  variant="subtle"
                  onClick={copy}
                >
                  <IconCopy size={16} />
                </ActionIcon>
              )}
            </CopyButton>
          }
        />

        <Text size="xs" c="dimmed">
          Default password. User must change it on first login.
        </Text>

        <Select
          label="Role"
          placeholder="Select role"
          value={role}
          onChange={setRole}
          data={[
            { value: "MASTER_ADMIN", label: "Master Admin" },
            { value: "BOARD", label: "Board Member" },
            { value: "SENIOR_CORE", label: "Senior Core" },
            { value: "JUNIOR_CORE", label: "Junior Core" },
          ]}
        />

        <Button loading={loading} onClick={handleSubmit}>
          Create Member
        </Button>
      </Stack>
    </Modal>
  );
}
