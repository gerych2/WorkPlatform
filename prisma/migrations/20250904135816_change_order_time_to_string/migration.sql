/*
  Warnings:

  - Changed the type of `order_time` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "cancellation_reason" VARCHAR(500),
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "completed_at" TIMESTAMP(3),
DROP COLUMN "order_time",
ADD COLUMN     "order_time" VARCHAR(10) NOT NULL;
