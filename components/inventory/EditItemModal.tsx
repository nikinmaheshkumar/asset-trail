"use client";

import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Stack,
  Select,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { Item } from "./InventoryTable";

type Props = {
  opened: boolean
  onClose: () => void
  item: Item | null
  onUpdated: () => void
}

export function EditItemModal({ opened, onClose, item, onUpdated }: Props) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState<string | null>("WORKING")
  const [quantityTotal, setQuantityTotal] = useState<number | "">("")
  const [loading, setLoading] = useState(false)

  const borrowed =
    item ? item.quantity_total - item.quantity_available : 0

  useEffect(() => {
    if (item) {
      setName(item.name)
      setCategory(item.category)
      setLocation(item.location)
      setQuantityTotal(item.quantity_total)
      setStatus(item.status)
    }
  }, [item])

  const handleUpdate = async () => {
    if (!item) return

    if (!name || !category || quantityTotal === "" || !location || !status) {
      notifications.show({
        color: "red",
        title: "Missing fields",
        message: "Please fill all fields",
      })
      return
    }

    if (typeof quantityTotal === "number" && quantityTotal < borrowed) {
      notifications.show({
        color: "red",
        title: "Invalid Quantity",
        message: `Total quantity cannot be less than borrowed (${borrowed})`,
      })
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          quantity_total: quantityTotal,
          location,
          status,
        }),
      })

      if (!res.ok) throw new Error()

      notifications.show({
        color: "green",
        title: "Item Updated",
        message: `${name} updated successfully`,
      })

      onUpdated()
      onClose()
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to update item",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Item">
      <Stack>

        <TextInput
          label="Item Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.currentTarget.value)}
          required
        />

        <NumberInput
          label="Total Quantity"
          min={borrowed}
          value={quantityTotal}
          onChange={(value) => {
            if (value === "" || typeof value === "number") {
              setQuantityTotal(value)
            }
          }}
        />

        <Text size="sm" c="dimmed">
          Borrowed items: {borrowed}
        </Text>

        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          data={[
            { value: "WORKING", label: "Working" },
            { value: "NEEDS_TESTING", label: "Needs Testing" },
            { value: "FAULTY", label: "Faulty" },
          ]}
        />

        <Button loading={loading} onClick={handleUpdate}>
          Update Item
        </Button>

      </Stack>
    </Modal>
  )
}