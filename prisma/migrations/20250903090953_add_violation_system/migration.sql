-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "block_end_date" TIMESTAMP(3),
ADD COLUMN     "block_reason" VARCHAR(255),
ADD COLUMN     "block_start_date" TIMESTAMP(3),
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_violation_date" TIMESTAMP(3),
ADD COLUMN     "violations_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."violations" (
    "id" SERIAL NOT NULL,
    "executor_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "reason" TEXT,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_executor_id_fkey" FOREIGN KEY ("executor_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."violations" ADD CONSTRAINT "violations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
