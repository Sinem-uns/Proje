import { PrismaClient, UserRole, ProjectStage, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  // ── Mevcut kullanıcılar ───────────────────────────────────────────────────
  const alice = await prisma.user.upsert({
    where: { email: "alice.smith@mit.edu" }, update: {},
    create: { email: "alice.smith@mit.edu", passwordHash: hash, role: UserRole.ENGINEER, fullName: "Alice Smith", institution: "MIT", city: "Cambridge", country: "USA", isEmailVerified: true },
  });

  const carlos = await prisma.user.upsert({
    where: { email: "carlos.gomez@stanford.edu" }, update: {},
    create: { email: "carlos.gomez@stanford.edu", passwordHash: hash, role: UserRole.ENGINEER, fullName: "Carlos Gomez", institution: "Stanford University", city: "Palo Alto", country: "USA", isEmailVerified: true },
  });

  const marie = await prisma.user.upsert({
    where: { email: "marie.dubois@parisdescartes.edu" }, update: {},
    create: { email: "marie.dubois@parisdescartes.edu", passwordHash: hash, role: UserRole.HEALTHCARE_PROFESSIONAL, fullName: "Marie Dubois", institution: "Université Paris Cité", city: "Paris", country: "France", isEmailVerified: true },
  });

  const ahmed = await prisma.user.upsert({
    where: { email: "ahmed.khan@kcl.edu" }, update: {},
    create: { email: "ahmed.khan@kcl.edu", passwordHash: hash, role: UserRole.HEALTHCARE_PROFESSIONAL, fullName: "Ahmed Khan", institution: "King's College London", city: "London", country: "UK", isEmailVerified: true },
  });

  const julia = await prisma.user.upsert({
    where: { email: "julia.admin@harvard.edu" }, update: {},
    create: { email: "julia.admin@harvard.edu", passwordHash: hash, role: UserRole.ADMIN, fullName: "Julia Chen", institution: "Harvard University", city: "Boston", country: "USA", isEmailVerified: true },
  });

  // ── Yeni test kullanıcıları ───────────────────────────────────────────────
  const yuki = await prisma.user.upsert({
    where: { email: "yuki.tanaka@tohoku.edu" }, update: {},
    create: { email: "yuki.tanaka@tohoku.edu", passwordHash: hash, role: UserRole.ENGINEER, fullName: "Yuki Tanaka", institution: "Tohoku University", city: "Sendai", country: "Japan", isEmailVerified: true },
  });

  const fatima = await prisma.user.upsert({
    where: { email: "fatima.al-rashid@kau.edu" }, update: {},
    create: { email: "fatima.al-rashid@kau.edu", passwordHash: hash, role: UserRole.HEALTHCARE_PROFESSIONAL, fullName: "Fatima Al-Rashid", institution: "King Abdulaziz University", city: "Jeddah", country: "Saudi Arabia", isEmailVerified: true },
  });

  const luca = await prisma.user.upsert({
    where: { email: "luca.ferrari@unibo.edu" }, update: {},
    create: { email: "luca.ferrari@unibo.edu", passwordHash: hash, role: UserRole.ENGINEER, fullName: "Luca Ferrari", institution: "University of Bologna", city: "Bologna", country: "Italy", isEmailVerified: true },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya.sharma@iitb.edu" }, update: {},
    create: { email: "priya.sharma@iitb.edu", passwordHash: hash, role: UserRole.HEALTHCARE_PROFESSIONAL, fullName: "Priya Sharma", institution: "IIT Bombay", city: "Mumbai", country: "India", isEmailVerified: true },
  });

  const test_delete = await prisma.user.upsert({
    where: { email: "test.delete@example.edu" }, update: {},
    create: { email: "test.delete@example.edu", passwordHash: hash, role: UserRole.ENGINEER, fullName: "Test Delete User", institution: "Test University", city: "Test City", country: "Test Country", isEmailVerified: true },
  });

  const suspended_user = await prisma.user.upsert({
    where: { email: "suspended.user@oxford.edu" }, update: {},
    create: { email: "suspended.user@oxford.edu", passwordHash: hash, role: UserRole.ENGINEER, fullName: "Suspended User", institution: "University of Oxford", city: "Oxford", country: "UK", isEmailVerified: true, isActive: false },
  });

  const unverified_user = await prisma.user.upsert({
    where: { email: "unverified.user@cambridge.edu" }, update: {},
    create: { email: "unverified.user@cambridge.edu", passwordHash: hash, role: UserRole.HEALTHCARE_PROFESSIONAL, fullName: "Unverified User", institution: "University of Cambridge", city: "Cambridge", country: "UK", isEmailVerified: false },
  });

  // ── Postlar ───────────────────────────────────────────────────────────────
  const p1 = await prisma.post.upsert({
    where: { id: "seed-post-1" }, update: {},
    create: { id: "seed-post-1", userId: alice.id, title: "AI-Assisted Triage Tool for ER", shortExplanation: "Prototype AI triage assistant for emergency departments.", workingDomain: "Emergency Medicine", requiredExpertise: "Clinical data scientist, backend engineer", projectStage: ProjectStage.PROTOTYPE_DEVELOPED, commitmentLevel: "HIGH", confidentiality: "HIGH", city: "Cambridge", country: "USA", status: PostStatus.ACTIVE },
  });

  const p3 = await prisma.post.upsert({
    where: { id: "seed-post-3" }, update: {},
    create: { id: "seed-post-3", userId: marie.id, title: "AI-Powered Dermatology Decision Support", shortExplanation: "Clinical decision support tool for dermatology.", workingDomain: "Dermatology", requiredExpertise: "ML Engineer, UX Designer", projectStage: ProjectStage.PILOT_TESTING, commitmentLevel: "MEDIUM", confidentiality: "HIGH", city: "Paris", country: "France", status: PostStatus.ACTIVE },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-5" }, update: {},
    create: { id: "seed-post-5", userId: alice.id, title: "Predictive Clinic Appointment No-Show Model", shortExplanation: "ML model to predict appointment no-shows in primary care.", workingDomain: "Primary Care", requiredExpertise: "Data Scientist, Statistician", projectStage: ProjectStage.PROTOTYPE_DEVELOPED, commitmentLevel: "LOW", confidentiality: "LOW", city: "Cambridge", country: "USA", status: PostStatus.MEETING_SCHEDULED },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-6" }, update: {},
    create: { id: "seed-post-6", userId: yuki.id, title: "Wearable ECG Anomaly Detection", shortExplanation: "Real-time arrhythmia detection using consumer wearables and edge ML models.", workingDomain: "Cardiology", requiredExpertise: "Embedded Systems Engineer, Cardiologist", projectStage: ProjectStage.IDEA, commitmentLevel: "MEDIUM", confidentiality: "LOW", city: "Sendai", country: "Japan", status: PostStatus.ACTIVE },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-7" }, update: {},
    create: { id: "seed-post-7", userId: luca.id, title: "NLP-Based Clinical Note Summarization", shortExplanation: "Summarizing unstructured clinical notes using transformer models for faster handover.", workingDomain: "Health Informatics", requiredExpertise: "NLP Engineer, Internist", projectStage: ProjectStage.CONCEPT_VALIDATION, commitmentLevel: "HIGH", confidentiality: "HIGH", city: "Bologna", country: "Italy", status: PostStatus.ACTIVE },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-8" }, update: {},
    create: { id: "seed-post-8", userId: carlos.id, title: "Retinal Imaging AI for Diabetic Retinopathy", shortExplanation: "Deep learning pipeline for early diabetic retinopathy screening from fundus images.", workingDomain: "Ophthalmology", requiredExpertise: "Computer Vision Engineer, Ophthalmologist", projectStage: ProjectStage.PILOT_TESTING, commitmentLevel: "HIGH", confidentiality: "MEDIUM", city: "Palo Alto", country: "USA", status: PostStatus.PARTNER_FOUND },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-9" }, update: {},
    create: { id: "seed-post-9", userId: luca.id, title: "Draft: Remote Patient Monitoring Platform", shortExplanation: "IoT-based platform to monitor chronic disease patients remotely.", workingDomain: "Chronic Disease", requiredExpertise: "IoT Engineer, Nurse Practitioner", projectStage: ProjectStage.IDEA, commitmentLevel: "LOW", confidentiality: "LOW", city: "Bologna", country: "Italy", status: PostStatus.DRAFT },
  });

  // ── Meeting requests ───────────────────────────────────────────────────────
  await prisma.meetingRequest.upsert({
    where: { id: "seed-meeting-1" }, update: {},
    create: { id: "seed-meeting-1", postId: p1.id, requesterId: ahmed.id, proposedTime: new Date("2026-03-20T10:00:00Z"), message: "Interested in adapting for UK ED workflows.", ndaAccepted: true, status: "PENDING" },
  });

  await prisma.meetingRequest.upsert({
    where: { id: "seed-meeting-2" }, update: {},
    create: { id: "seed-meeting-2", postId: p3.id, requesterId: carlos.id, proposedTime: new Date("2026-03-22T09:00:00Z"), message: "We have a dermatology imaging pipeline to integrate.", ndaAccepted: true, status: "ACCEPTED" },
  });

  await prisma.meetingRequest.upsert({
    where: { id: "seed-meeting-3" }, update: {},
    create: { id: "seed-meeting-3", postId: p1.id, requesterId: priya.id, proposedTime: new Date("2026-04-05T14:00:00Z"), message: "Our hospital in Mumbai has similar triage challenges.", ndaAccepted: true, status: "PENDING" },
  });

  await prisma.meetingRequest.upsert({
    where: { id: "seed-meeting-4" }, update: {},
    create: { id: "seed-meeting-4", postId: p3.id, requesterId: fatima.id, proposedTime: new Date("2026-04-10T11:00:00Z"), message: "Interested in deployment for Middle East clinics.", ndaAccepted: true, status: "REJECTED" },
  });

  console.log("\n✅ Seed data created successfully!\n");
  console.log("=== Test Kullanıcıları (hepsi: password123) ===");
  console.log("ADMIN:  julia.admin@harvard.edu");
  console.log("");
  console.log("Engineers:");
  console.log("  alice.smith@mit.edu");
  console.log("  carlos.gomez@stanford.edu");
  console.log("  yuki.tanaka@tohoku.edu");
  console.log("  luca.ferrari@unibo.edu");
  console.log("  test.delete@example.edu       ← silmek için");
  console.log("");
  console.log("Healthcare Professionals:");
  console.log("  marie.dubois@parisdescartes.edu");
  console.log("  ahmed.khan@kcl.edu");
  console.log("  fatima.al-rashid@kau.edu");
  console.log("  priya.sharma@iitb.edu");
  console.log("");
  console.log("Özel durumlar:");
  console.log("  suspended.user@oxford.edu     ← zaten suspended");
  console.log("  unverified.user@cambridge.edu ← email doğrulanmamış");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
