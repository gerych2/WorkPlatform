/*
  Warnings:

  - A unique constraint covering the columns `[referral_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "current_level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "daily_xp_earned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "experience_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_xp_earned" TIMESTAMP(3),
ADD COLUMN     "monthly_xp_earned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referral_code" VARCHAR(20),
ADD COLUMN     "referral_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referral_earnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "referred_by" INTEGER,
ADD COLUMN     "total_xp_earned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weekly_xp_earned" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."achievements" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50) NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "category" VARCHAR(50) NOT NULL,
    "rarity" VARCHAR(20) NOT NULL DEFAULT 'common',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_achievements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "is_notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."xp_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "xp_amount" INTEGER NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."levels" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50) NOT NULL,
    "xp_required" INTEGER NOT NULL,
    "benefits" JSONB,
    "color" VARCHAR(20) NOT NULL DEFAULT '#6B7280',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_rewards" (
    "id" SERIAL NOT NULL,
    "referrer_id" INTEGER NOT NULL,
    "referred_id" INTEGER NOT NULL,
    "rewardType" VARCHAR(50) NOT NULL,
    "reward_amount" DECIMAL(10,2) NOT NULL,
    "xp_amount" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "public"."user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "levels_level_key" ON "public"."levels"("level");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "public"."users"("referral_code");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."xp_history" ADD CONSTRAINT "xp_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_rewards" ADD CONSTRAINT "referral_rewards_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_rewards" ADD CONSTRAINT "referral_rewards_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
