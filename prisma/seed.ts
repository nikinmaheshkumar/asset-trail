
import { PrismaClient, Role, ItemStatus, LoanStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Members ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const members = await Promise.all([
    prisma.member.upsert({
      where: { email: "master@assettrail.dev" },
      update: {},
      create: {
        name: "Alice Thornton",
        email: "master@assettrail.dev",
        password_hash: passwordHash,
        role: Role.MASTER_ADMIN,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "board1@assettrail.dev" },
      update: {},
      create: {
        name: "Brian Wallace",
        email: "board1@assettrail.dev",
        password_hash: passwordHash,
        role: Role.BOARD,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "board2@assettrail.dev" },
      update: {},
      create: {
        name: "Catherine Lee",
        email: "board2@assettrail.dev",
        password_hash: passwordHash,
        role: Role.BOARD,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "senior1@assettrail.dev" },
      update: {},
      create: {
        name: "Daniel Kim",
        email: "senior1@assettrail.dev",
        password_hash: passwordHash,
        role: Role.SENIOR_CORE,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "senior2@assettrail.dev" },
      update: {},
      create: {
        name: "Emma Patel",
        email: "senior2@assettrail.dev",
        password_hash: passwordHash,
        role: Role.SENIOR_CORE,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "senior3@assettrail.dev" },
      update: {},
      create: {
        name: "Frank Osei",
        email: "senior3@assettrail.dev",
        password_hash: passwordHash,
        role: Role.SENIOR_CORE,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "junior1@assettrail.dev" },
      update: {},
      create: {
        name: "Grace Nakamura",
        email: "junior1@assettrail.dev",
        password_hash: passwordHash,
        role: Role.JUNIOR_CORE,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "junior2@assettrail.dev" },
      update: {},
      create: {
        name: "Henry Santos",
        email: "junior2@assettrail.dev",
        password_hash: passwordHash,
        role: Role.JUNIOR_CORE,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "junior3@assettrail.dev" },
      update: {},
      create: {
        name: "Isla Ferreira",
        email: "junior3@assettrail.dev",
        password_hash: passwordHash,
        role: Role.JUNIOR_CORE,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "junior4@assettrail.dev" },
      update: {},
      create: {
        name: "James Nguyen",
        email: "junior4@assettrail.dev",
        password_hash: passwordHash,
        role: Role.JUNIOR_CORE,
        mustChangePwd: false,
      },
    }),
    prisma.member.upsert({
      where: { email: "junior5@assettrail.dev" },
      update: {},
      create: {
        name: "Karen Müller",
        email: "junior5@assettrail.dev",
        password_hash: passwordHash,
        role: Role.JUNIOR_CORE,
        mustChangePwd: false,
      },
    }),
  ]);
  console.log(`✅ ${members.length} members seeded`);

  const master   = members.find((m) => m.email === "master@assettrail.dev")!;
  const board1   = members.find((m) => m.email === "board1@assettrail.dev")!;
  const senior1  = members.find((m) => m.email === "senior1@assettrail.dev")!;
  const senior2  = members.find((m) => m.email === "senior2@assettrail.dev")!;
  const junior1  = members.find((m) => m.email === "junior1@assettrail.dev")!;
  const junior2  = members.find((m) => m.email === "junior2@assettrail.dev")!;
  const junior3  = members.find((m) => m.email === "junior3@assettrail.dev")!;
  const junior4  = members.find((m) => m.email === "junior4@assettrail.dev")!;

  // ── Items ────────────────────────────────────────────────────────────────────
  const itemsData = [
    { name: "MacBook Pro 14\"", category: "Laptop", quantity_total: 10, quantity_available: 7, location: "IT Rack A1", status: ItemStatus.WORKING },
    { name: "Dell XPS 15", category: "Laptop", quantity_total: 8, quantity_available: 1, location: "IT Rack A2", status: ItemStatus.WORKING },
    { name: "Sony A7 III Camera", category: "Camera", quantity_total: 5, quantity_available: 3, location: "Media Cabinet", status: ItemStatus.WORKING },
    { name: "Canon EOS R6", category: "Camera", quantity_total: 4, quantity_available: 0, location: "Media Cabinet", status: ItemStatus.NEEDS_TESTING },
    { name: "Rode NT-USB Microphone", category: "Audio", quantity_total: 6, quantity_available: 5, location: "Audio Room", status: ItemStatus.WORKING },
    { name: "Focusrite Scarlett 2i2", category: "Audio", quantity_total: 4, quantity_available: 4, location: "Audio Room", status: ItemStatus.WORKING },
    { name: "iPad Pro 12.9\"", category: "Tablet", quantity_total: 12, quantity_available: 9, location: "Shelf B1", status: ItemStatus.WORKING },
    { name: "Samsung Galaxy Tab S9", category: "Tablet", quantity_total: 6, quantity_available: 1, location: "Shelf B2", status: ItemStatus.WORKING },
    { name: "Logitech MX Master 3 Mouse", category: "Peripheral", quantity_total: 20, quantity_available: 15, location: "Storage Room", status: ItemStatus.WORKING },
    { name: "Keychron K2 Keyboard", category: "Peripheral", quantity_total: 15, quantity_available: 2, location: "Storage Room", status: ItemStatus.WORKING },
    { name: "LG UltraWide Monitor 34\"", category: "Monitor", quantity_total: 8, quantity_available: 5, location: "Monitor Bay", status: ItemStatus.WORKING },
    { name: "BenQ PD2700U Monitor", category: "Monitor", quantity_total: 6, quantity_available: 6, location: "Monitor Bay", status: ItemStatus.WORKING },
    { name: "DJI Mini 3 Pro Drone", category: "Drone", quantity_total: 3, quantity_available: 2, location: "Equipment Locker", status: ItemStatus.WORKING },
    { name: "GoPro Hero 12", category: "Camera", quantity_total: 5, quantity_available: 4, location: "Media Cabinet", status: ItemStatus.WORKING },
    { name: "Portable Projector BenQ", category: "AV Equipment", quantity_total: 4, quantity_available: 0, location: "Conference Room", status: ItemStatus.FAULTY },
  ];

  const items: { id: number; name: string }[] = [];
  for (const data of itemsData) {
    const existing = await prisma.item.findFirst({ where: { name: data.name } });
    const item = existing ?? await prisma.item.create({ data });
    items.push(item);
  }
  console.log(`✅ ${items.length} items seeded`);

  // ── Loans ────────────────────────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
  const daysFromNow = (n: number) => new Date(now.getTime() + n * 86_400_000);

  const loansData = [
    // APPROVED — active, on time
    {
      item_id: items[0].id, member_id: junior1.id, status: LoanStatus.APPROVED,
      requested_at: daysAgo(10), approved_at: daysAgo(8), approved_by: master.id,
      due_date: daysFromNow(6), purpose: "Presentation preparation for annual meet",
    },
    // APPROVED — overdue
    {
      item_id: items[1].id, member_id: junior2.id, status: LoanStatus.APPROVED,
      requested_at: daysAgo(20), approved_at: daysAgo(18), approved_by: board1.id,
      due_date: daysAgo(4), purpose: "Remote development sprint",
    },
    // APPROVED — active, on time
    {
      item_id: items[6].id, member_id: senior1.id, status: LoanStatus.APPROVED,
      requested_at: daysAgo(5), approved_at: daysAgo(4), approved_by: master.id,
      due_date: daysFromNow(3), purpose: "Design review session",
    },
    // APPROVED — overdue
    {
      item_id: items[9].id, member_id: junior3.id, status: LoanStatus.APPROVED,
      requested_at: daysAgo(15), approved_at: daysAgo(14), approved_by: board1.id,
      due_date: daysAgo(7), purpose: "Workshop keyboard setup",
    },
    // REQUESTED — pending
    {
      item_id: items[2].id, member_id: junior4.id, status: LoanStatus.REQUESTED,
      requested_at: daysAgo(2), purpose: "Event photography coverage",
    },
    // REQUESTED — pending
    {
      item_id: items[4].id, member_id: senior2.id, status: LoanStatus.REQUESTED,
      requested_at: daysAgo(1), purpose: "Podcast recording session",
    },
    // REQUESTED — pending
    {
      item_id: items[10].id, member_id: junior1.id, status: LoanStatus.REQUESTED,
      requested_at: daysAgo(3), purpose: "Extended screen space for project work",
    },
    // REJECTED
    {
      item_id: items[3].id, member_id: junior2.id, status: LoanStatus.REJECTED,
      requested_at: daysAgo(12), purpose: "Video shoot for club reel",
    },
    // REJECTED
    {
      item_id: items[14].id, member_id: junior3.id, status: LoanStatus.REJECTED,
      requested_at: daysAgo(7), purpose: "Presentation at conference hall",
    },
    // CLOSED
    {
      item_id: items[0].id, member_id: senior1.id, status: LoanStatus.CLOSED,
      requested_at: daysAgo(30), approved_at: daysAgo(28), approved_by: master.id,
      due_date: daysAgo(21), closed_at: daysAgo(22), purpose: "Thesis writing",
    },
    // CLOSED
    {
      item_id: items[5].id, member_id: junior4.id, status: LoanStatus.CLOSED,
      requested_at: daysAgo(25), approved_at: daysAgo(24), approved_by: board1.id,
      due_date: daysAgo(17), closed_at: daysAgo(18), purpose: "Music production workshop",
    },
    // CLOSED
    {
      item_id: items[12].id, member_id: senior2.id, status: LoanStatus.CLOSED,
      requested_at: daysAgo(40), approved_at: daysAgo(39), approved_by: master.id,
      due_date: daysAgo(32), closed_at: daysAgo(33), purpose: "Campus aerial photography",
    },
  ];

  const loans: { id: number }[] = [];
  for (const data of loansData) {
  const loan = await prisma.loan.create({
    data: {
      ...data,
      due_date: data.due_date ?? daysFromNow(7),
    },
  });

  loans.push(loan);
}
  console.log(`✅ ${loans.length} loans seeded`);

  // ── Activity Logs ────────────────────────────────────────────────────────────
  const activityData = [
    { action: "member_created", actor_id: master.id, target_id: junior1.id, created_at: daysAgo(45) },
    { action: "member_created", actor_id: master.id, target_id: junior2.id, created_at: daysAgo(44) },
    { action: "member_created", actor_id: master.id, target_id: senior1.id, created_at: daysAgo(43) },
    { action: "role_changed", actor_id: master.id, target_id: junior3.id, created_at: daysAgo(30) },
    { action: "item_updated", actor_id: board1.id, target_id: items[0].id, created_at: daysAgo(28) },
    { action: "item_updated", actor_id: board1.id, target_id: items[3].id, created_at: daysAgo(20) },
    { action: "loan_requested", actor_id: junior1.id, target_id: loans[0].id, created_at: daysAgo(10) },
    { action: "loan_approved", actor_id: master.id, target_id: loans[0].id, created_at: daysAgo(8) },
    { action: "loan_requested", actor_id: junior2.id, target_id: loans[1].id, created_at: daysAgo(20) },
    { action: "loan_approved", actor_id: board1.id, target_id: loans[1].id, created_at: daysAgo(18) },
    { action: "loan_requested", actor_id: junior2.id, target_id: loans[7].id, created_at: daysAgo(12) },
    { action: "loan_rejected", actor_id: master.id, target_id: loans[7].id, created_at: daysAgo(11) },
    { action: "loan_requested", actor_id: senior1.id, target_id: loans[9].id, created_at: daysAgo(30) },
    { action: "loan_approved", actor_id: master.id, target_id: loans[9].id, created_at: daysAgo(28) },
    { action: "loan_closed", actor_id: master.id, target_id: loans[9].id, created_at: daysAgo(22) },
    { action: "loan_requested", actor_id: junior4.id, target_id: loans[10].id, created_at: daysAgo(25) },
    { action: "loan_approved", actor_id: board1.id, target_id: loans[10].id, created_at: daysAgo(24) },
    { action: "loan_closed", actor_id: board1.id, target_id: loans[10].id, created_at: daysAgo(18) },
    { action: "loan_requested", actor_id: junior4.id, target_id: loans[4].id, created_at: daysAgo(2) },
    { action: "item_updated", actor_id: master.id, target_id: items[14].id, created_at: daysAgo(1) },
  ];

  await prisma.activityLog.createMany({ data: activityData });
  console.log(`✅ ${activityData.length} activity log entries seeded`);

  console.log("\n🎉 Seed complete!");
  // NOTE: These are development-only test credentials — do not use in production.
  console.log("\n📋 Test accounts (all use password: Password@123):");
  console.log("   master@assettrail.dev   — MASTER_ADMIN");
  console.log("   board1@assettrail.dev   — BOARD");
  console.log("   senior1@assettrail.dev  — SENIOR_CORE");
  console.log("   junior1@assettrail.dev  — JUNIOR_CORE");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
