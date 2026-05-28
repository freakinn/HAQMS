CREATE INDEX "Doctor_department_idx" ON "Doctor"("department");
CREATE INDEX "Doctor_specialization_idx" ON "Doctor"("specialization");
CREATE INDEX "Appointment_doctorId_status_idx" ON "Appointment"("doctorId", "status");
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");
CREATE INDEX "QueueToken_doctorId_createdAt_idx" ON "QueueToken"("doctorId", "createdAt");
CREATE INDEX "QueueToken_status_idx" ON "QueueToken"("status");
