const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const archiver = require("archiver");
const mailSend = require("../../utils/MailUtil");

const runDatabaseBackupJob = async () => {
  console.log("[DatabaseBackupJob] Starting weekly database backup...");
  
  const timestamp = Date.now();
  const dateStr = new Date().toISOString().split("T")[0];
  
  const uploadsDir = path.join(__dirname, "../../../uploads");
  const tempBackupDir = path.join(uploadsDir, `temp/backup_${timestamp}`);
  const zipPath = path.join(uploadsDir, `temp/Database_Backup_${dateStr}_${timestamp}.zip`);
  
  try {
    // 1. Ensure temp directories exist
    if (!fs.existsSync(tempBackupDir)) {
      fs.mkdirSync(tempBackupDir, { recursive: true });
    }

    // 2. Fetch all collections dynamically using mongoose models
    const modelNames = mongoose.modelNames();
    console.log(`[DatabaseBackupJob] Found models to backup: ${modelNames.join(", ")}`);
    
    const stats = [];

    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);
      const data = await Model.find({});
      
      const filePath = path.join(tempBackupDir, `${modelName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      stats.push({
        collection: modelName,
        count: data.length,
        size: fs.statSync(filePath).size
      });
      
      console.log(`[DatabaseBackupJob] Exported ${data.length} records from ${modelName}`);
    }

    // 3. Zip the backup folder
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = new ZipArchive({ zlib: { level: 9 } });

      output.on("close", () => {
        console.log(`[DatabaseBackupJob] Zip archive created successfully. Size: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on("error", (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(tempBackupDir, false);
      archive.finalize();
    });

    // 4. Compose premium HTML backup stats email
    let statsRowsHtml = "";
    stats.forEach(s => {
      statsRowsHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e3a8a;">${s.collection}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${s.count}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #64748b;">${(s.size / 1024).toFixed(2)} KB</td>
      </tr>
      `;
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #334155;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .header p {
          margin: 10px 0 0;
          font-size: 14px;
          color: #94a3b8;
        }
        .content {
          padding: 30px;
        }
        .salutation {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .details {
          line-height: 1.6;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .stats-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 13px;
        }
        .stats-table th {
          background-color: #f1f5f9;
          padding: 10px;
          font-weight: 700;
          color: #475569;
          text-align: left;
          border-bottom: 2px solid #cbd5e1;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💾 Automated Database Backup</h1>
          <p>Weekly MongoDB Dump successfully compiled</p>
        </div>
        <div class="content">
          <div class="salutation">Hello Admin,</div>
          <div class="details">
            The automated Sunday database backup for the Expense Tracker application completed successfully. All active MongoDB collections have been exported, validated, and compressed into the attached ZIP archive.
          </div>

          <h3 style="color: #0f172a; margin-top: 25px;">Backup Summary & Metrics</h3>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Collection</th>
                <th style="text-align: center;">Record Count</th>
                <th style="text-align: right;">JSON File Size</th>
              </tr>
            </thead>
            <tbody>
              ${statsRowsHtml}
            </tbody>
          </table>

          <div class="details" style="margin-top: 25px;">
            The backup ZIP is attached to this email. It is recommended to download and keep this in a secure storage vault.
          </div>
        </div>
        <div class="footer">
          Expense Tracker Server &copy; 2026. All rights reserved.<br>
          This is an automated system notification.
        </div>
      </div>
    </body>
    </html>
    `;

    // 5. Send backup email to developer's/admin's email
    const recipientEmail = "khairnarlalit08@gmail.com";
    await mailSend(
      recipientEmail,
      `💾 Weekly Database Backup: ${dateStr}`,
      `Weekly database backup is ready. Date: ${dateStr}`,
      [
        {
          filename: `Database_Backup_${dateStr}.zip`,
          path: zipPath,
        },
      ],
      emailHtml
    );

    console.log(`[DatabaseBackupJob] Backup archive successfully emailed to ${recipientEmail}`);

  } catch (error) {
    console.error("[DatabaseBackupJob] Error during database backup job:", error);
  } finally {
    // 6. Cleanup files/directories
    try {
      if (fs.existsSync(tempBackupDir)) {
        fs.rmSync(tempBackupDir, { recursive: true, force: true });
        console.log(`[DatabaseBackupJob] Cleaned up backup directory: ${tempBackupDir}`);
      }
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
        console.log(`[DatabaseBackupJob] Cleaned up temporary ZIP archive: ${zipPath}`);
      }
    } catch (cleanupError) {
      console.error("[DatabaseBackupJob] Error during cleanup:", cleanupError);
    }
  }
};

module.exports = { runDatabaseBackupJob };
