
require('dotenv').config();
const express = require('express');
const { supabasePool  } = require('../config/database');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const mime = require('mime-types');
const router = express.Router();

// Create a Supabase client instance
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Set up multer to store file in memory (not on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CREATE an event with direct file upload to Supabase
router.post("/create_event", upload.single('certificateFile'), async (req, res) => {
  try {
   const { name, host, description, start_date, end_date, active, required_receipt, venue } = req.body;

  

    if (req.file) {
      const fileBuffer = req.file.buffer; // File data from memory
      const mimeType = mime.lookup(req.file.originalname);

      // Upload the file directly to Supabase Storage
      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(`event_certificates/${name}-${Date.now()}${path.extname(req.file.originalname)}`, fileBuffer, {
          contentType: mimeType
        });

      if (error) {
        return res.status(500).json({ error: "Failed to upload certificate file." });
      }

      // Get the URL of the uploaded file
      const certificateUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/certificates/${data.path}`;

      // Insert the event record with the certificate URL
      const query = `
        INSERT INTO rael.events (name, host, description, start_date, end_date, active, required_reciept, venue, certificates_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [name, host, description, start_date, end_date, active, required_receipt, venue, certificateUrl];

      const result = await supabasePool.query(query, values);

      res.status(200).json({ message: "Event created successfully", event: result.rows[0] });
    } else {
      return res.status(400).json({ error: "Certificate file is required." });
    }
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET all events
router.get("/get_event", async (req, res) => {
  try {
    const query = `
      SELECT id, name, host, description, start_date, end_date, active, required_reciept, venue, certificates_url
      FROM rael.events
    `;
    const result = await supabasePool.query(query);

    const formatted = result.rows.map(row => ({
      ...row,
      start_date: row.start_date ? new Date(row.start_date).toLocaleDateString('en-US') : "",
      end_date: row.end_date ? new Date(row.end_date).toLocaleDateString('en-US') : ""
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET only active events
router.get("/get_active_events", async (req, res) => {
  try {
    const query = `
      SELECT id, name, description, start_date, end_date, active, required_reciept, venue, certificates_url
      FROM rael.events
      WHERE active = true
    `;
    const result = await supabasePool.query(query);

    const formatted = result.rows.map(row => ({
      ...row,
      start_date: row.start_date ? new Date(row.start_date).toLocaleDateString('en-US') : "",
      end_date: row.end_date ? new Date(row.end_date).toLocaleDateString('en-US') : ""
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching active events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE an event

// UPDATE an event (direct upload to Supabase Storage)

router.put("/update_event/:id", upload.single('certificateFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, host, description, start_date, end_date, active, required_reciept, venue } = req.body;

    if (!name || !host || !description || !start_date || !end_date || active === undefined || required_reciept === undefined || !venue) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let certificateUrl = null;

    // Get the existing certificate URL
    const existing = await supabasePool.query(
      `SELECT certificates_url FROM rael.events WHERE id = $1`,
      [id]
    );

    let oldCertificatePath = null;

    if (existing.rows.length > 0 && existing.rows[0].certificates_url) {
      const fullUrl = existing.rows[0].certificates_url;
      const publicUrlPrefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/certificates/`;
      if (fullUrl.startsWith(publicUrlPrefix)) {
        oldCertificatePath = fullUrl.replace(publicUrlPrefix, '');
      }
    }

    // Upload new certificate if provided
    if (req.file) {
      // Delete old file if it exists
      if (oldCertificatePath) {
        await supabase.storage.from('certificates').remove([oldCertificatePath]);
      }

      const fileBuffer = req.file.buffer;
      const mimeType = mime.lookup(req.file.originalname);
      const filename = `event_certificates/${name}-${Date.now()}${path.extname(req.file.originalname)}`;

      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(filename, fileBuffer, {
          contentType: mimeType,
        });

      if (error) {
        return res.status(500).json({ error: "Failed to upload new certificate file." });
      }

      certificateUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/certificates/${data.path}`;
    } else {
      // No new file uploaded, retain old URL
      certificateUrl = existing.rows[0]?.certificates_url || null;
    }

    const query = `
      UPDATE rael.events
      SET name = $1, host = $2, description = $3, start_date = $4, end_date = $5, active = $6, required_reciept = $7, venue = $8, certificates_url = $9
      WHERE id = $10
      RETURNING *
    `;
    const values = [
      name,
      host,
      description,
      start_date,
      end_date,
      active,
      required_reciept,
      venue,
      certificateUrl,
      id,
    ];

    const result = await supabasePool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// DELETE an event
// DELETE an event
router.delete("/delete_event/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the certificate URL
    const selectQuery = `SELECT certificates_url FROM rael.events WHERE id = $1`;
    const selectResult = await supabasePool.query(selectQuery, [id]);

    if (selectResult.rowCount === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    const certificateUrl = selectResult.rows[0].certificates_url;

    // Delete the event from the database
    const deleteQuery = `DELETE FROM rael.events WHERE id = $1 RETURNING *`;
    const deleteResult = await supabasePool.query(deleteQuery, [id]);

    // If there's a certificate URL, delete the file from Supabase Storage
    if (certificateUrl) {
      const publicUrlPrefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/certificates/`;
      const filePath = certificateUrl.replace(publicUrlPrefix, ''); // Extract relative path

      console.log("Deleting file from storage:", filePath); // Optional: log for debugging

      const { error: deleteError } = await supabase.storage.from('certificates').remove([filePath]);

      if (deleteError) {
        console.error("Failed to delete file from storage:", deleteError.message);
        // File deletion failed, but do not block the main response
      }
    }

    res.status(200).json({ message: "Event and associated certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;


router.get("/get_all_id", async (req, res) => {
  try {
    const query = `
      SELECT 
        registration.id,
        TRIM(CONCAT_WS(' ',
          registration.f_name,
          CASE
            WHEN registration.m_name IS NOT NULL AND registration.m_name <> ''
              THEN CONCAT(LEFT(registration.m_name, 1), '.')
            ELSE NULL
          END,
          registration.l_name,
          registration.suffix
        )) AS full_name,
        rael.registration.phone_number,
        rael.registration.position,
        rael.events.name AS event_name,
        CASE 
          WHEN EXTRACT(MONTH FROM events.start_date) = EXTRACT(MONTH FROM events.end_date)
               AND EXTRACT(YEAR FROM events.start_date) = EXTRACT(YEAR FROM events.end_date)
          THEN 
            TO_CHAR(events.start_date, 'FMMonth') || ' ' ||
            TO_CHAR(events.start_date, 'DD') || '-' ||
            TO_CHAR(events.end_date, 'DD, YYYY')
          ELSE
            TO_CHAR(events.start_date, 'FMMonth DD, YYYY') || ' – ' ||
            TO_CHAR(events.end_date, 'FMMonth DD, YYYY')
        END AS formatted_event_date,
        rael.events.description AS event_description,
        schools.name AS school,
        section.name AS office,
        COALESCE(registration.f_name, 'N/A') AS name,
        COALESCE(registration.participant_image_url, '') AS participant_image_url,
        COALESCE(district.district_name, functional_division.name) AS district_name,
        COALESCE(school_div.division_name, office_div.division_name) AS division_name,
        COALESCE(registration.participant_type, 'N/A') AS participant_type

      FROM rael.registration
      INNER JOIN rael.events 
        ON registration.event_id = events.id
      LEFT JOIN rael.office 
        ON registration.office_id = office.id
      LEFT JOIN rael.functional_division 
        ON office.functional_division = functional_division.id
      LEFT JOIN rael.section 
        ON office.section = section.id
      LEFT JOIN rael.schools 
        ON registration.school = schools.school_id
      LEFT JOIN rael.district 
        ON schools.district_id = district.id
      LEFT JOIN rael.divisions AS school_div 
        ON district.division_id = school_div.id
      LEFT JOIN rael.divisions AS office_div 
        ON office.division = office_div.id;
    `;

    const result = await supabaseClient.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

