"use client";

import { useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Item } from "@/components/inventory/InventoryTable";

type Props = {
  opened: boolean;
  item: Item | null;
  onClose: () => void;
  onRequested: () => void;
};

export function RequestLoanModal({ opened, item, onClose, onRequested }: Props) {
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setPurpose("");
    setNotes("");
    setDueDate("");
    onClose();
  }

  async function handleSubmit() {
    if (!item) return;
    if (!purpose.trim()) {
      notifications.show({ color: "red", title: "Validation", message: "Purpose is required" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/loans/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          purpose: purpose.trim(),
          notes: notes.trim() || undefined,
          due_date: dueDate || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifications.show({
          color: "red",
          title: "Request Failed",
          message: data.error ?? "Request failed",
        });
        return;
      }

      notifications.show({
        color: "green",
        title: "Request Submitted",
        message: "Your loan request has been submitted for approval",
      });

      handleClose();
      onRequested();
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Failed to submit request" });
    } finally {
      setLoading(false);
    }
  }

  // Minimum date: today
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={700} size="lg">Request Item</Text>}
      centered
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Item"
          value={item?.name ?? ""}
          readOnly
          styles={{ input: { backgroundColor: "var(--app-readonly-bg)", cursor: "not-allowed" } }}
        />

        <TextInput
          label="Preferred Due Date"
          description="Optional — admin will set the final due date on approval"
          type="date"
          min={today}
          value={dueDate}
          onChange={(e) => setDueDate(e.currentTarget.value)}
        />

        <Textarea
          label="Purpose / Reason"
          placeholder="Why do you need this item?"
          required
          autosize
          minRows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.currentTarget.value)}
        />

        <Textarea
          label="Additional Notes"
          placeholder="Any extra details (optional)"
          autosize
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} color="ink">
            Submit Request
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
