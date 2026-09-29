-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TALENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "TalentCategory" AS ENUM ('SPG', 'USHER', 'BOTH');

-- CreateEnum
CREATE TYPE "TalentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VideoValidation" AS ENUM ('PENDING', 'PASSED', 'FLAGGED', 'FAILED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ONGOING', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('CHECK_IN', 'CHECK_OUT');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('VALID', 'NEEDS_REVIEW', 'REJECTED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TALENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TalentProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "nikEncrypted" TEXT NOT NULL,
    "nikHash" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "instagram" TEXT,
    "category" "TalentCategory" NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "weightKg" INTEGER NOT NULL,
    "clothingSize" TEXT,
    "shoeSize" INTEGER,
    "experience" TEXT,
    "languages" TEXT[],
    "specialNotes" TEXT,
    "status" "TalentStatus" NOT NULL DEFAULT 'DRAFT',
    "consentAt" TIMESTAMP(3),
    "consentVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Verification" (
    "id" UUID NOT NULL,
    "talentId" UUID NOT NULL,
    "attemptNo" INTEGER NOT NULL DEFAULT 1,
    "ktpPath" TEXT NOT NULL,
    "selfiePath" TEXT NOT NULL,
    "nikValid" BOOLEAN NOT NULL DEFAULT false,
    "ocrMatch" BOOLEAN,
    "matchKtpSelfie" DOUBLE PRECISION,
    "matchVideoSelfie" DOUBLE PRECISION,
    "duplicateOfTalentId" UUID,
    "flags" TEXT[],
    "decision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CastingVideo" (
    "id" UUID NOT NULL,
    "verificationId" UUID NOT NULL,
    "storagePath" TEXT NOT NULL,
    "framePaths" TEXT[],
    "durationSec" DOUBLE PRECISION NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "validation" "VideoValidation" NOT NULL DEFAULT 'PENDING',
    "validationFlags" TEXT[],
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CastingVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "description" TEXT,
    "venueName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 100,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "checkInOpensMinutesBefore" INTEGER NOT NULL DEFAULT 60,
    "requiredCount" INTEGER NOT NULL,
    "category" "TalentCategory" NOT NULL,
    "fee" INTEGER,
    "requirements" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Application" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "talentId" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedById" UUID,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "type" "AttendanceType" NOT NULL,
    "serverTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracyMeters" DOUBLE PRECISION,
    "distanceMeters" DOUBLE PRECISION,
    "selfiePath" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION,
    "exifTakenAt" TIMESTAMP(3),
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'VALID',
    "flags" TEXT[],
    "adminNote" TEXT,
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "meta" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "TalentProfile_userId_key" ON "TalentProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TalentProfile_nikHash_key" ON "TalentProfile"("nikHash");
CREATE INDEX IF NOT EXISTS "TalentProfile_status_idx" ON "TalentProfile"("status");
CREATE INDEX IF NOT EXISTS "TalentProfile_city_idx" ON "TalentProfile"("city");
CREATE INDEX IF NOT EXISTS "Verification_decision_submittedAt_idx" ON "Verification"("decision", "submittedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Verification_talentId_attemptNo_key" ON "Verification"("talentId", "attemptNo");
CREATE UNIQUE INDEX IF NOT EXISTS "CastingVideo_verificationId_key" ON "CastingVideo"("verificationId");
CREATE INDEX IF NOT EXISTS "Event_status_startsAt_idx" ON "Event"("status", "startsAt");
CREATE INDEX IF NOT EXISTS "Application_talentId_idx" ON "Application"("talentId");
CREATE INDEX IF NOT EXISTS "Application_eventId_status_idx" ON "Application"("eventId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "Application_eventId_talentId_key" ON "Application"("eventId", "talentId");
CREATE INDEX IF NOT EXISTS "Attendance_status_idx" ON "Attendance"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_applicationId_type_key" ON "Attendance"("applicationId", "type");
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "TalentProfile" DROP CONSTRAINT IF EXISTS "TalentProfile_userId_fkey";
ALTER TABLE "TalentProfile" ADD CONSTRAINT "TalentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Verification" DROP CONSTRAINT IF EXISTS "Verification_talentId_fkey";
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Verification" DROP CONSTRAINT IF EXISTS "Verification_reviewedById_fkey";
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CastingVideo" DROP CONSTRAINT IF EXISTS "CastingVideo_verificationId_fkey";
ALTER TABLE "CastingVideo" ADD CONSTRAINT "CastingVideo_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_createdById_fkey";
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_eventId_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_talentId_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_decidedById_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_applicationId_fkey";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_reviewedById_fkey";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_actorId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Default Settings
INSERT INTO "AppSetting" ("key", "value", "updatedAt") 
VALUES 
  ('faceMatchThreshold', '85'::jsonb, CURRENT_TIMESTAMP),
  ('defaultGeofenceRadius', '100'::jsonb, CURRENT_TIMESTAMP),
  ('maxLateMinutes', '15'::jsonb, CURRENT_TIMESTAMP),
  ('maxReuploadPerDay', '3'::jsonb, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
