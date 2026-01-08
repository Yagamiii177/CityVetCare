ALTER TABLE adoption_request
  ADD COLUMN applicant_details JSON NULL AFTER status;
