import { PrismaClient, UserRole, ProjectStage, PostStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Removed deleteMany so user data is not wiped on container restarts

  // Users
  const alice = await prisma.user.upsert({
    where: { email: "alice.smith@mit.edu" },
    update: {},
    create: {
      email: "alice.smith@mit.edu",
      passwordHash: "dev-only-placeholder",
      role: UserRole.ENGINEER,
      fullName: "Alice Smith",
      institution: "MIT",
      city: "Cambridge",
      country: "USA",
    },
  });

  const carlos = await prisma.user.upsert({
    where: { email: "carlos.gomez@stanford.edu" },
    update: {},
    create: {
      email: "carlos.gomez@stanford.edu",
      passwordHash: "dev-only-placeholder",
      role: UserRole.ENGINEER,
      fullName: "Carlos Gomez",
      institution: "Stanford University",
      city: "Palo Alto",
      country: "USA",
    },
  });

  const marie = await prisma.user.upsert({
    where: { email: "marie.dubois@parisdescartes.edu" },
    update: {},
    create: {
      email: "marie.dubois@parisdescartes.edu",
      passwordHash: "dev-only-placeholder",
      role: UserRole.HEALTHCARE_PROFESSIONAL,
      fullName: "Marie Dubois",
      institution: "Université Paris Cité",
      city: "Paris",
      country: "France",
    },
  });

  const ahmed = await prisma.user.upsert({
    where: { email: "ahmed.khan@kcl.edu" },
    update: {},
    create: {
      email: "ahmed.khan@kcl.edu",
      passwordHash: "dev-only-placeholder",
      role: UserRole.HEALTHCARE_PROFESSIONAL,
      fullName: "Ahmed Khan",
      institution: "King's College London",
      city: "London",
      country: "UK",
    },
  });

  const julia = await prisma.user.upsert({
    where: { email: "julia.admin@harvard.edu" },
    update: {},
    create: {
      email: "julia.admin@harvard.edu",
      passwordHash: "dev-only-placeholder",
      role: UserRole.ADMIN,
      fullName: "Julia Chen",
      institution: "Harvard University",
      city: "Boston",
      country: "USA",
    },
  });

  // Posts
  const p1 = await prisma.post.create({
    data: {
      userId: alice.id,
      title: "AI-Assisted Triage Tool for ER",
      shortExplanation: "Prototype AI triage assistant for emergency departments.",
      workingDomain: "Emergency Medicine",
      requiredExpertise: "Clinical data scientist, backend engineer",
      projectStage: ProjectStage.PROTOTYPE_DEVELOPED,
      commitmentLevel: "HIGH",
      confidentiality: "HIGH",
      city: "Cambridge",
      country: "USA",
      status: PostStatus.ACTIVE,
    },
  });

  const p3 = await prisma.post.create({
    data: {
      userId: marie.id,
      title: "AI-Powered Dermatology Decision Support",
      shortExplanation: "Clinical decision support tool for dermatology.",
      workingDomain: "Dermatology",
      requiredExpertise: "ML Engineer, UX Designer",
      projectStage: ProjectStage.PILOT_TESTING,
      commitmentLevel: "MEDIUM",
      confidentiality: "HIGH",
      city: "Paris",
      country: "France",
      status: PostStatus.ACTIVE,
    },
  });

  const p5 = await prisma.post.create({
    data: {
      userId: alice.id,
      title: "Predictive Clinic Appointment No-Show Model",
      shortExplanation: "ML model to predict appointment no-shows in primary care.",
      workingDomain: "Primary Care",
      requiredExpertise: "Data Scientist, Statistician",
      projectStage: ProjectStage.PROTOTYPE_DEVELOPED,
      commitmentLevel: "LOW",
      confidentiality: "LOW",
      city: "Cambridge",
      country: "USA",
      status: PostStatus.MEETING_SCHEDULED,
    },
  });

  // Meeting requests
  await prisma.meetingRequest.create({
    data: {
      postId: p1.id,
      requesterId: ahmed.id,
      proposedTime: new Date("2026-03-20T10:00:00Z"),
      message: "Interested in adapting for UK ED workflows.",
      status: "PENDING",
    },
  });

  await prisma.meetingRequest.create({
    data: {
      postId: p3.id,
      requesterId: carlos.id,
      proposedTime: new Date("2026-03-22T09:00:00Z"),
      message: "We have a dermatology imaging pipeline to integrate.",
      status: "ACCEPTED",
    },
  });

  await prisma.meetingRequest.create({
    data: {
      postId: p5.id,
      requesterId: marie.id,
      proposedTime: new Date("2026-03-24T14:00:00Z"),
      message: "We run a no-show reduction program that may align.",
      status: "ACCEPTED",
    },
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

