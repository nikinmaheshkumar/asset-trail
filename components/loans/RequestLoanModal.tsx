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
  NumberInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Item } from "@/components/inventory/InventoryTable";
import { PRIMARY_CTA_COLOR } from "@/lib/ui";

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
  const [quantity, setQuantity] = useState<number | "">(1);
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setPurpose("");
    setNotes("");
    setDueDate("");
    setQuantity(1);
    onClose();
  }

  async function handleSubmit() {
    if (!item) return;
    if (!purpose.trim()) {
      notifications.show({ color: "red", title: "Validation", message: "Purpose is required" });
      return;
    }

    if (!dueDate) {
      notifications.show({ color: "red", title: "Validation", message: "Due date is required" });
      return;
    }

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    const dueObj = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(dueObj.getTime()) || dueObj < todayObj) {
      notifications.show({ color: "red", title: "Validation", message: "Due date must be today or a future date" });
      return;
    }

    const available = item.quantity_available ?? 0;
    const qty = typeof quantity === "number" ? quantity : Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      notifications.show({ color: "red", title: "Validation", message: "Quantity must be at least 1" });
      return;
    }

    if (qty > available) {
      notifications.show({ color: "red", title: "Validation", message: `Quantity cannot exceed available (${available})` });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/loans/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          quantity: qty,
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

        <NumberInput
          label="Quantity"
          description={item ? `Available: ${item.quantity_available}` : undefined}
          min={1}
          max={item?.quantity_available ?? 1}
          step={1}
          allowDecimal={false}
          value={quantity}
          onChange={(v) => {
            if (typeof v === "number") {
              setQuantity(v);
              return;
            }

            if (v === "") {
              setQuantity("");
              return;
            }

            const n = Number(v);
            setQuantity(Number.isFinite(n) ? n : "");
          }}
          clampBehavior="strict"
          required
        />

        <TextInput
          label="Preferred Due Date"
          description="Required — choose when you will return the item"
          type="date"
          min={today}
          value={dueDate}
          onChange={(e) => setDueDate(e.currentTarget.value)}
          required
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
          <Button onClick={handleSubmit} loading={loading} color={PRIMARY_CTA_COLOR}>
            Submit Request
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
