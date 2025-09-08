-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "price_type" VARCHAR(20) NOT NULL DEFAULT 'fixed',
ALTER COLUMN "total_price" DROP NOT NULL;
