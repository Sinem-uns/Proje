import { PrismaClient, UserRole, ProjectStage, PostStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const sinem = await prisma.user.upsert({
    where: { email: "sinem@university.edu" },
    update: {
      passwordHash,
      isEmailVerified: true
    },
    create: {
      email: "sinem@university.edu",
      passwordHash,
      role: UserRole.ENGINEER,
      fullName: "Sinem",
      institution: "University",
      city: "Izmir",
      country: "Turkey",
      isEmailVerified: true
    }
  });

  console.log("Upserted user sinem@university.edu");

  // Create a fake other user
  const bob = await prisma.user.upsert({
    where: { email: "dr.bob@hospital.org" },
    update: {},
    create: {
      email: "dr.bob@hospital.org",
      passwordHash: "abc",
      role: UserRole.HEALTHCARE_PROFESSIONAL,
      fullName: "Dr. Bob Kelso",
      institution: "Sacred Heart Hospital",
      city: "Los Angeles",
      country: "USA",
      isEmailVerified: true
    }
  });

  // Create a post for Sinem
  const myPost = await prisma.post.create({
    data: {
      userId: sinem.id,
      title: "Telemedicine Platform Integration",
      shortExplanation: "Seeking healthcare professionals to test our new telemedicine platform.",
      workingDomain: "Software Engineering",
      requiredExpertise: "Clinical Experience, Telemedicine",
      projectStage: ProjectStage.PILOT_TESTING,
      commitmentLevel: "Medium",
      confidentiality: "NDA Required",
      city: "Remote",
      country: "Turkey",
      status: PostStatus.ACTIVE,
    }
  });

  // Create a meeting request ON Sinem's post from Bob (Incoming Meeting for Sinem)
  await prisma.meetingRequest.create({
    data: {
      postId: myPost.id,
      requesterId: bob.id,
      proposedTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
      message: "I am a senior doctor and I want to help test your platform.",
      status: "PENDING",
      ndaAccepted: true
    }
  });

  // Create a notification for Sinem about the incoming meeting
  await prisma.notification.create({
    data: {
      userId: sinem.id,
      type: "MEETING_REQUEST",
      message: `You have a new meeting request for your post: ${myPost.title}`
    }
  });

  // Create a post for Bob
  const bobPost = await prisma.post.create({
    data: {
      userId: bob.id,
      title: "Seeking Data Scientist for EMR Analytics",
      shortExplanation: "We have 10 years of anonymized EMR data and need an AI model to predict readmissions.",
      workingDomain: "Health AI",
      requiredExpertise: "Data Science, Machine Learning",
      projectStage: ProjectStage.IDEA,
      commitmentLevel: "High",
      confidentiality: "Strict NDA",
      city: "Los Angeles",
      country: "USA",
      status: PostStatus.ACTIVE,
    }
  });

  // Create a meeting request FROM Sinem ON Bob's post (Sent Request for Sinem)
  await prisma.meetingRequest.create({
    data: {
      postId: bobPost.id,
      requesterId: sinem.id,
      proposedTime: new Date(Date.now() + 86400000 * 5),
      message: "I am an engineer and can build this model for you.",
      status: "ACCEPTED",
      ndaAccepted: true
    }
  });

  // Notification for Sinem that Bob accepted
  await prisma.notification.create({
    data: {
      userId: sinem.id,
      type: "MEETING_RESPONSE",
      message: `Your meeting request for "${bobPost.title}" was accepted.`
    }
  });

  console.log("Successfully seeded mock data for Sinem.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
