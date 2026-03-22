"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

import {
  Box,
  Card,
  Stack,
  Title,
  Text,
  PasswordInput,
  Button,
  Alert,
  Container,
  Divider,
} from "@mantine/core";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/members/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to update password");
      return;
    }

    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3f5ed 0%, #e9ece3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container size={420} w="100%">
        <Card
          shadow="xl"
          padding="40px"
          radius="lg"
          style={{
            borderRadius: "20px",
            background: "linear-gradient(180deg, var(--app-chrome) 0%, color-mix(in srgb, var(--app-chrome) 82%, black) 100%)",
            border: "1px solid color-mix(in srgb, var(--app-chrome) 72%, white)",
          }}
        >
          <Stack gap="lg">
            {/* Logo */}
            <Stack align="center" gap={8}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src="/logo.png"
                  alt="IEEE Robotics & Automation Society"
                  width={140}
                  height={56}
                  loading="eager"
                  decoding="async"
                  style={{
                    width: 140,
                    height: 56,
                    objectFit: "contain",
                  }}
                />
              </Box>

              <Title order={2} c="white" fw={750}>Change Password</Title>

              <Text size="sm" c="white" fw={600}>
                Update your password to continue using AssetTrail
              </Text>
            </Stack>

            <Divider />

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  size="md"
                  radius="md"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  styles={{ label: { color: "white", fontWeight: 600 } }}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  size="md"
                  radius="md"
                  value={confirm}
                  onChange={(e) => setConfirm(e.currentTarget.value)}
                  required
                  styles={{ label: { color: "white", fontWeight: 600 } }}
                />

                {error && (
                  <Alert color="red" variant="light">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  loading={loading}
                  color="brand"
                  style={{ height: "44px" }}
                >
                  Update Password
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
