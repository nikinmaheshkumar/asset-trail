"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Center,
  Card,
  Stack,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Loader,
  Box,
  Container,
  Divider,
} from "@mantine/core";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  };

  if (status === "loading") {
    return (
      <Center h="100vh" bg="var(--app-bg)">
        <Loader color="dark" />
      </Center>
    );
  }

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
      <Container size={460} w="100%">
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

              <Title order={1} fw={650} c="white">
                Asset Trail
              </Title>

              <Text size="md" c="white" fw={450}>
                Asset Management System
              </Text>
            </Stack>

            <Divider />

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  size="md"
                  radius="md"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                  styles={{
                    label: { color: "white", fontWeight: 450 },
                    input: { fontWeight: 450 },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  size="md"
                  radius="md"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  styles={{
                    label: { color: "white", fontWeight: 450 },
                    input: { fontWeight: 450 },
                  }}
                />

                {error && (
                  <Alert
                    color="orange"
                    variant="light"
                    styles={{
                      root: {
                        background: "color-mix(in srgb, var(--app-warning) 22%, transparent)",
                        borderColor: "color-mix(in srgb, var(--app-warning) 60%, white)",
                      },
                      message: { color: "white", fontWeight: 550 },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  radius="md"
                  color="brand"
                  style={{ height: "48px" }}
                >
                  Login
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
