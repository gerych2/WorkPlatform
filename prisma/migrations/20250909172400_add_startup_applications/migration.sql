-- CreateTable
CREATE TABLE "public"."startup_applications" (
    "id" SERIAL NOT NULL,
    "startup_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "telegram" VARCHAR(100),
    "experience" TEXT,
    "motivation" TEXT,
    "skills" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_applications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."startup_applications" ADD CONSTRAINT "startup_applications_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
