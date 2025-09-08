/*
  Warnings:

  - Added the required column `reviewed_id` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewer_id` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - сначала добавляем поля как nullable
ALTER TABLE "public"."reviews" ADD COLUMN     "reviewed_id" INTEGER,
ADD COLUMN     "reviewer_id" INTEGER;

-- Заполняем существующие данные
UPDATE "public"."reviews" 
SET "reviewer_id" = "client_id", 
    "reviewed_id" = "executor_id";

-- Теперь делаем поля NOT NULL
ALTER TABLE "public"."reviews" ALTER COLUMN "reviewed_id" SET NOT NULL;
ALTER TABLE "public"."reviews" ALTER COLUMN "reviewer_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "client_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "client_reviews_count" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_reviewed_id_fkey" FOREIGN KEY ("reviewed_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
