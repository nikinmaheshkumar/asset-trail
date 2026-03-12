"use client";

import { useMemo, useState} from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Button,
  SimpleGrid,
  TextInput,
  Select,
  Pagination,
  Divider,
  Text,
  Center,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { DesktopUsersTable } from "./DesktopUsersTable";
import { MobileUsersCards } from "./MobileUserCards";

export type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Props = {
  members: Member[];
  onRoleChange: (id: number, role: string) => void;
  onDelete: (id: number) => void;
  onResetPassword: (id: number, name: string) => Promise<string>;
  currentUserId?: number;
};

export function UsersTable({
  members,
  onRoleChange,
  onDelete,
  onResetPassword,
  currentUserId,
}: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const isMobile = useMediaQuery("(max-width: 768px)");

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const searchMatch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());

      const roleMatch = roleFilter ? m.role === roleFilter : true;

      return searchMatch && roleMatch;
    });
  }, [members, search, roleFilter]);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, page]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);

  const startItem =
    filteredMembers.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(page * ITEMS_PER_PAGE, filteredMembers.length);

  const handleReset = () => {
    setSearch("");
    setRoleFilter(null);
    setPage(1);
  };

  const filtersActive = search || roleFilter;

  return (
    <Stack gap="xl">

      {/* FILTER PANEL */}
      <Paper withBorder radius="md" p="md" shadow="xs">
        <Group justify="space-between" mb="md">
          <Title order={5} fw={800}>
            Filters
          </Title>

          <Button
            variant="light"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={handleReset}
            disabled={!filtersActive}
          >
            Reset
          </Button>
        </Group>

        {/* SAME GRID STRUCTURE AS INVENTORY */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">

          <TextInput
            label="Search"
            placeholder="Search name or email..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
          />

          <Select
            label="Role"
            placeholder="All"
            data={[
              { value: "MASTER_ADMIN", label: "Master Admin" },
              { value: "BOARD", label: "Board" },
              { value: "SENIOR_CORE", label: "Senior Core" },
              { value: "JUNIOR_CORE", label: "Junior Core" },
            ]}
            size="sm"
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            clearable
          />

        </SimpleGrid>
      </Paper>

      {/* TABLE OR MOBILE CARDS */}
      {paginatedMembers.length === 0 ? (
        <Center py="lg">
          <Text c="dimmed">
            No members match your filters
          </Text>
        </Center>
      ) : isMobile ? (
        <MobileUsersCards
          members={paginatedMembers}
          onRoleChange={onRoleChange}
          onDelete={onDelete}
          onResetPassword={onResetPassword}
          currentUserId={currentUserId}
        />
      ) : (
        <DesktopUsersTable
          members={paginatedMembers}
          onRoleChange={onRoleChange}
          onDelete={onDelete}
          onResetPassword={onResetPassword}
          currentUserId={currentUserId}
        />
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <>
          <Divider />

          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>
              Showing {startItem}-{endItem} of {filteredMembers.length}
            </Text>

            <Group gap="xs" align="center">
              <Button
                size="sm"
                variant="default"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </Button>

              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                size="md"
                radius="md"
                withControls={false}
              />

              <Button
                size="sm"
                variant="default"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </Group>
          </Group>
        </>
      )}
    </Stack>
  );
}