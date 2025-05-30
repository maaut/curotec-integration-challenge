-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "inviteeId" TEXT;

-- CreateIndex
CREATE INDEX "Task_inviteeId_idx" ON "Task"("inviteeId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
