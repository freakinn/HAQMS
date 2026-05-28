CREATE UNIQUE INDEX "Appointment_doctorId_appointmentDate_key" ON "Appointment"("doctorId", "appointmentDate");
CREATE INDEX "Patient_createdAt_idx" ON "Patient"("createdAt");
CREATE INDEX "Patient_gender_idx" ON "Patient"("gender");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
CREATE INDEX "QueueToken_patientId_idx" ON "QueueToken"("patientId");
CREATE INDEX "QueueToken_appointmentId_idx" ON "QueueToken"("appointmentId");
