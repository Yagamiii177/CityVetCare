import Logger from "../utils/logger.js";
import { pool } from "../config/database.js";

const logger = new Logger("NOTIFICATION_SERVICE");

/**
 * Send owner alert via multiple channels
 * @param {Object} params - Alert parameters
 * @param {string} params.ownerName - Owner's full name
 * @param {string} params.email - Owner's email
 * @param {string} params.contactNumber - Owner's contact number
 * @param {string} params.petName - Pet's name
 * @param {string} params.captureLocation - Location where pet was captured
 * @param {string} params.captureDate - Date pet was captured
 * @param {number} params.ownerId - Owner's ID for push notification
 * @returns {Promise<Object>} Notification results
 */
export async function sendOwnerAlert(params) {
  const {
    ownerName,
    email,
    contactNumber,
    petName,
    captureLocation,
    captureDate,
    ownerId,
    strayAnimalId,
  } = params;

  const results = {
    pushNotification: false,
    email: false,
    sms: false,
    errors: [],
  };

  const message = `Dear ${ownerName}, your pet ${petName} has been captured at ${captureLocation} on ${captureDate}. Please contact the City Veterinary Office to claim your pet.`;

  // 1. Push Notification (In-app)
  try {
    await createInAppNotification({
      ownerId,
      title: "Pet Captured",
      message,
      type: "pet_capture",
      strayAnimalId,
    });
    results.pushNotification = true;
    logger.info(`Push notification sent to owner ${ownerId}`);
  } catch (error) {
    logger.error("Failed to send push notification", error);
    results.errors.push({ channel: "push", error: error.message });
  }

  // 2. Email Notification
  try {
    await sendEmail({
      to: email,
      subject: `Alert: ${petName} Has Been Captured`,
      body: `
        <h2>Pet Capture Alert</h2>
        <p>Dear ${ownerName},</p>
        <p>We want to inform you that your pet <strong>${petName}</strong> has been captured by our team.</p>
        <p><strong>Capture Details:</strong></p>
        <ul>
          <li>Location: ${captureLocation}</li>
          <li>Date: ${captureDate}</li>
        </ul>
        <p>Please contact the City Veterinary Office as soon as possible to claim your pet.</p>
        <p>Thank you for your prompt attention to this matter.</p>
        <p>Best regards,<br>City Veterinary Office</p>
      `,
    });
    results.email = true;
    logger.info(`Email sent to ${email}`);
  } catch (error) {
    logger.error("Failed to send email", error);
    results.errors.push({ channel: "email", error: error.message });
  }

  // 3. SMS Notification
  try {
    await sendSMS({
      to: contactNumber,
      message: message.substring(0, 160), // SMS character limit
    });
    results.sms = true;
    logger.info(`SMS sent to ${contactNumber}`);
  } catch (error) {
    logger.error("Failed to send SMS", error);
    results.errors.push({ channel: "sms", error: error.message });
  }

  return results;
}

/**
 * Create in-app notification record
 */
async function createInAppNotification({
  ownerId,
  title,
  message,
  type,
  strayAnimalId,
}) {
  // Check if notifications table exists, if not, create it
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_type ENUM('owner', 'admin', 'catcher') NOT NULL DEFAULT 'owner',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        stray_animal_id INT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_notifications (user_id, user_type),
        INDEX idx_notification_read (is_read),
        INDEX idx_stray_notification (stray_animal_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    await pool.query(
      `INSERT INTO notifications (user_id, user_type, title, message, type, stray_animal_id) 
       VALUES (?, 'owner', ?, ?, ?, ?)`,
      [ownerId, title, message, type, strayAnimalId || null]
    );

    return true;
  } catch (error) {
    logger.error("Failed to create in-app notification", error);
    throw error;
  }
}

/**
 * Send email notification
 * NOTE: This is a placeholder. Implement with actual email service (Nodemailer, SendGrid, etc.)
 */
async function sendEmail({ to, subject, body }) {
  // TODO: Integrate with actual email service
  logger.info(`[EMAIL PLACEHOLDER] To: ${to}, Subject: ${subject}`);
  logger.debug(`[EMAIL BODY] ${body}`);

  // For development: just log the email
  // In production: use nodemailer or email service provider
  /*
  Example with Nodemailer:
  
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  await transporter.sendMail({
    from: '"City Vet Care" <noreply@cityvetcare.com>',
    to,
    subject,
    html: body,
  });
  */

  return true;
}

/**
 * Send SMS notification
 * NOTE: This is a placeholder. Implement with actual SMS service (Twilio, Semaphore, etc.)
 */
async function sendSMS({ to, message }) {
  // TODO: Integrate with actual SMS service
  logger.info(`[SMS PLACEHOLDER] To: ${to}, Message: ${message}`);

  // For development: just log the SMS
  // In production: use SMS service provider
  /*
  Example with Twilio:
  
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to,
  });
  */

  return true;
}

/**
 * Create incident notification for pet owner
 * @param {Object} params - Notification parameters
 * @param {number} params.ownerId - Pet owner ID
 * @param {number} params.incidentId - Incident report ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type
 */
export async function createIncidentNotification({
  ownerId,
  incidentId,
  title,
  message,
  type,
}) {
  try {
    // Ensure the notifications table exists and has the correct schema
    await pool.query(
      `CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_type ENUM('owner', 'admin', 'catcher') NOT NULL DEFAULT 'owner',
        owner_id INT NULL COMMENT 'FK to pet_owner.owner_id for authenticated pet owners',
        incident_id INT NULL COMMENT 'FK to incident_report.report_id',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        stray_animal_id INT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_notifications (user_id, user_type),
        INDEX idx_notification_read (is_read),
        INDEX idx_stray_notification (stray_animal_id),
        INDEX idx_owner_notifications (owner_id),
        INDEX idx_incident_notifications (incident_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    // Check if owner_id and incident_id columns exist
    try {
      await pool.query(
        `ALTER TABLE notifications 
         ADD COLUMN IF NOT EXISTS owner_id INT NULL COMMENT 'FK to pet_owner.owner_id' AFTER user_type,
         ADD COLUMN IF NOT EXISTS incident_id INT NULL COMMENT 'FK to incident_report.report_id' AFTER owner_id,
         ADD INDEX IF NOT EXISTS idx_owner_notifications (owner_id),
         ADD INDEX IF NOT EXISTS idx_incident_notifications (incident_id)`
      );
    } catch (alterError) {
      // Columns may already exist, continue
      logger.debug("Notification table columns already exist or couldn't be altered");
    }

    // Insert notification record
    const [result] = await pool.query(
      `INSERT INTO notifications 
       (user_id, user_type, owner_id, incident_id, title, message, type) 
       VALUES (?, 'owner', ?, ?, ?, ?, ?)`,
      [ownerId, ownerId, incidentId, title, message, type]
    );

    logger.info(`✅ Incident notification created for owner ${ownerId}, incident ${incidentId}, type: ${type}`);
    
    return {
      success: true,
      notificationId: result.insertId
    };
  } catch (error) {
    logger.error("❌ Failed to create incident notification", error);
    throw error;
  }
}

/**
 * Create notification on incident submission (authenticated users only)
 */
export async function notifyIncidentSubmitted({ ownerId, incidentId, reportType }) {
  return await createIncidentNotification({
    ownerId,
    incidentId,
    title: "Incident Report Submitted",
    message: `Your incident report was submitted successfully. Please wait while it is being verified.`,
    type: "submission",
  });
}

/**
 * Create notification on incident status change
 */
export async function notifyIncidentStatusChange({ ownerId, incidentId, status, rejectionReason }) {
  let title, message, type;

  switch (status) {
    case "Verified":
      title = "Report Verified";
      message = "Your report has been verified and is being processed.";
      type = "status_update";
      break;

    case "Scheduled":
      title = "Report Scheduled";
      message = "Your report has been scheduled for patrol action.";
      type = "status_update";
      break;

    case "In Progress":
      title = "Patrol In Progress";
      message = "A patrol team is currently responding to your report.";
      type = "status_update";
      break;

    case "Resolved":
      title = "Report Resolved";
      message = "Your reported incident has been resolved. Thank you.";
      type = "status_update";
      break;

    case "Rejected":
      title = "Report Rejected";
      message = rejectionReason 
        ? `Your report was rejected. Reason: ${rejectionReason}`
        : "Your report was rejected. Tap to view the reason.";
      type = "rejection";
      break;

    default:
      // Don't send notification for other status changes
      return null;
  }

  return await createIncidentNotification({
    ownerId,
    incidentId,
    title,
    message,
    type,
  });
}

export default {
  sendOwnerAlert,
  createInAppNotification,
  sendEmail,
  sendSMS,
  createIncidentNotification,
  notifyIncidentSubmitted,
  notifyIncidentStatusChange,
};
