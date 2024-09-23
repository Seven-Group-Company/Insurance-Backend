-- AddForeignKey
ALTER TABLE "client_policy" ADD CONSTRAINT "client_policy_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;
