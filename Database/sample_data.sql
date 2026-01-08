USE cityvetcare_db;
SET FOREIGN_KEY_CHECKS=0;
INSERT INTO administrator (admin_id, full_name, role, username, password) VALUES
(1,'Dr. Alicia Reyes','veterinarian','vet1','password123'),
(2,'Mark Santos','staff','staff1','password123');;
INSERT INTO pet_owner (owner_id, full_name, address, contact_number, email, password, pet_count) VALUES
(1,'Juan Dela Cruz','123 Mabini St','09170000001','owner1@example.com','password123',1),
(2,'Maria Clara','456 Luna St','09170000002','owner2@example.com','password123',1),
(3,'Pedro Penduko','789 Rizal Ave','09170000003','owner3@example.com','password123',0);;
INSERT INTO dog_catcher (catcher_id, full_name, contact_number) VALUES
(1,'Ramon Cruz','09171234567'),
(2,'Leo Garcia','09179876543');;
INSERT INTO pet (pet_id, owner_id, rfid, name, species, breed, age, sex, photo, status) VALUES
(1,1,'123456789','Buddy','Dog','Aspin',3,'Male',NULL,'active'),
(2,2,'987654321','Mittens','Cat','Puspin',2,'Female',NULL,'active');;
INSERT INTO incident_report (report_id, owner_id, report_type, description, location, status) VALUES
(1,1,'lost_pet','Lost brown dog near park','City Park','pending');;
INSERT INTO stray_animals (
  animal_id,
  rfid,
  name,
  breed,
  species,
  sex,
  color,
  markings,
  sprayed_neutered,
  captured_by,
  date_captured,
  registration_date,
  location_captured,
  images
) VALUES
(1,'123456789','Stray Dog #1','Aspin','Dog','Male','Brown','White chest',1,'Ramon Cruz','2024-11-01','2024-11-01','Zone 1',NULL),
(2,'987654321','Stray Cat #1','Puspin','Cat','Female','Gray','Tabby stripes',0,'Leo Garcia','2024-11-03','2024-11-03','Zone 2',NULL),
(3,NULL,'Stray Dog #2','Aspin','Dog','Male','Black','None',0,'Leo Garcia','2024-11-05','2024-11-05','Zone 3',NULL);;
INSERT INTO adoption_request (adoption_id, stray_id, adopter_id, status) VALUES
(1,1,2,'pending');;
INSERT INTO redemption_request (redemption_id, stray_id, owner_id, status, remarks, attempt_count) VALUES
(1,2,1,'pending','Owner claims cat','1');;
INSERT INTO private_clinic (clinic_id, clinic_name, address, contact_number, status) VALUES
(1,'Happy Paws Clinic','789 Veterinary Rd','09220000000','approved');;
INSERT INTO vaccination_record (record_id, pet_id, clinic_id, vaccine_type, date_administered, next_due_date, source) VALUES
(1,1,1,'Anti-Rabies','2024-10-15','2025-10-15','clinic');;
INSERT INTO clinic_vaccination_submission (submission_id, clinic_id, owner_name, pet_name, species, vaccine_type, date_administered, status, verified_by) VALUES
(1,1,'Carlos Ramos','Buddy','Dog','Anti-Rabies','2024-10-15','approved',1);;
INSERT INTO announcement (announcement_id, admin_id, title, content, language, status) VALUES
(1,1,'Vaccination Drive','Free anti-rabies vaccination this weekend.','en','published');;
SET FOREIGN_KEY_CHECKS=1;
