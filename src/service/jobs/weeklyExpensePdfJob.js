const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const userSchema = require("../../models/UserModel");
const expenseModel = require("../../models/ExpenseModel");
const mailSend = require("../../utils/MailUtil");

const runWeeklyExpensePdfJob = async () => {
  console.log("[WeeklyExpenseJob] Starting weekly expense PDF report generation...");
  try {
    const activeUsers = await userSchema.find({ status: "Active" });
    console.log(`[WeeklyExpenseJob] Found ${activeUsers.length} active users.`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const dateRangeStr = `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;

    // Create temp directory for PDFs if it doesn't exist
    const tempDir = path.join(__dirname, "../../../uploads/temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (const user of activeUsers) {
      console.log(`[WeeklyExpenseJob] Processing report for user: ${user.email}`);

      // Fetch expenses in the last 7 days
      const expenses = await expenseModel
        .find({
          userId: user._id,
          expenseDate: { $gte: startDate, $lte: endDate },
          income: { $exists: false },
        })
        .populate("expCategory")
        .sort({ expenseDate: 1 });

      const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const pdfFilename = `Weekly_Expense_Report_${user._id}_${Date.now()}.pdf`;
      const pdfPath = path.join(tempDir, pdfFilename);

      // Generate PDF
      await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // Header Background Banner
        doc
          .rect(0, 0, 595.28, 120)
          .fill("#1E3A8A"); // Navy Blue

        // Title
        doc
          .fillColor("#FFFFFF")
          .font("Helvetica-Bold")
          .fontSize(24)
          .text("WEEKLY EXPENSE REPORT", 40, 35);

        // Subtitle/Date Range
        doc
          .fillColor("#93C5FD") // Light blue
          .font("Helvetica")
          .fontSize(12)
          .text(dateRangeStr, 40, 70);

        // User Info Card on Right
        doc
          .fillColor("#FFFFFF")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(`Prepared For:`, 400, 35, { align: "right", width: 155 })
          .font("Helvetica")
          .text(`${user.firstName || ""} ${user.lastName || ""}`, 400, 50, { align: "right", width: 155 })
          .text(user.email, 400, 65, { align: "right", width: 155 });

        // Content Area Starting Y
        let y = 150;

        // Overview / Stats Section
        doc
          .fillColor("#1E293B")
          .font("Helvetica-Bold")
          .fontSize(16)
          .text("Weekly Overview", 40, y);

        y += 25;

        // Draw Overview Card Border
        doc
          .rect(40, y, 515, 60)
          .lineWidth(1)
          .strokeColor("#E2E8F0")
          .stroke();

        // Total Spent Label
        doc
          .fillColor("#475569")
          .font("Helvetica")
          .fontSize(10)
          .text("TOTAL SPENT", 60, y + 15);
        
        // Total Spent Value
        doc
          .fillColor("#0D9488") // Teal accent
          .font("Helvetica-Bold")
          .fontSize(18)
          .text(`Rs. ${totalExpense.toFixed(2)}`, 60, y + 30);

        // Transaction Count Label
        doc
          .fillColor("#475569")
          .font("Helvetica")
          .fontSize(10)
          .text("TRANSACTIONS", 260, y + 15);
        
        // Transaction Count Value
        doc
          .fillColor("#1E3A8A")
          .font("Helvetica-Bold")
          .fontSize(18)
          .text(`${expenses.length}`, 260, y + 30);

        // Average Expense Label
        const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
        doc
          .fillColor("#475569")
          .font("Helvetica")
          .fontSize(10)
          .text("AVG. PER TRANSACTION", 400, y + 15);
        
        // Average Expense Value
        doc
          .fillColor("#1E3A8A")
          .font("Helvetica-Bold")
          .fontSize(18)
          .text(`Rs. ${avgExpense.toFixed(2)}`, 400, y + 30);

        y += 90;

        // Expenses List Section
        doc
          .fillColor("#1E293B")
          .font("Helvetica-Bold")
          .fontSize(16)
          .text("Detailed Expense List", 40, y);

        y += 25;

        if (expenses.length === 0) {
          doc
            .fillColor("#64748B")
            .font("Helvetica-Oblique")
            .fontSize(11)
            .text("No expenses recorded during this period.", 40, y + 15, { align: "center", width: 515 });
          
          y += 50;
        } else {
          // Table Headers
          doc
            .rect(40, y, 515, 24)
            .fill("#F1F5F9"); // light gray header

          doc
            .fillColor("#475569")
            .font("Helvetica-Bold")
            .fontSize(10);

          doc.text("Date", 50, y + 7);
          doc.text("Category", 130, y + 7);
          doc.text("Title / Description", 230, y + 7);
          doc.text("Payment Mode", 400, y + 7);
          doc.text("Amount", 480, y + 7, { align: "right", width: 65 });

          y += 24;

          // Table Rows
          doc.font("Helvetica").fontSize(9);
          let rowColorToggle = false;

          for (const exp of expenses) {
            // Check if page overflow
            if (y > 750) {
              doc.addPage();
              y = 50;
              // Re-draw headers on new page
              doc
                .rect(40, y, 515, 24)
                .fill("#F1F5F9");

              doc
                .fillColor("#475569")
                .font("Helvetica-Bold")
                .fontSize(10);

              doc.text("Date", 50, y + 7);
              doc.text("Category", 130, y + 7);
              doc.text("Title / Description", 230, y + 7);
              doc.text("Payment Mode", 400, y + 7);
              doc.text("Amount", 480, y + 7, { align: "right", width: 65 });

              y += 24;
              doc.font("Helvetica").fontSize(9);
            }

            // Zebra striping
            if (rowColorToggle) {
              doc
                .rect(40, y, 515, 26)
                .fill("#F8FAFC");
            }
            rowColorToggle = !rowColorToggle;

            doc.fillColor("#334155");
            
            const expDate = exp.expenseDate
              ? new Date(exp.expenseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "N/A";
            
            const categoryName = exp.expCategory ? exp.expCategory.name : "Uncategorized";
            const expTitle = exp.title || "Untitled";
            const payMode = exp.paymentMode || "N/A";
            const amountText = `Rs. ${(exp.amount || 0).toFixed(2)}`;

            doc.text(expDate, 50, y + 8);
            doc.text(categoryName, 130, y + 8, { width: 90, ellipsis: true });
            doc.text(expTitle, 230, y + 8, { width: 160, ellipsis: true });
            doc.text(payMode, 400, y + 8);
            
            doc
              .font("Helvetica-Bold")
              .fillColor("#1E293B")
              .text(amountText, 480, y + 8, { align: "right", width: 65 })
              .font("Helvetica");

            // Row Bottom Border Line
            doc
              .moveTo(40, y + 26)
              .lineTo(555, y + 26)
              .lineWidth(0.5)
              .strokeColor("#E2E8F0")
              .stroke();

            y += 26;
          }
        }

        // Footer Section
        y = Math.min(y + 30, 750);
        doc
          .moveTo(40, y)
          .lineTo(555, y)
          .lineWidth(1)
          .strokeColor("#E2E8F0")
          .stroke();

        doc
          .fillColor("#94A3B8")
          .font("Helvetica")
          .fontSize(8)
          .text("This is an automatically generated system report. Please do not reply to this email.", 40, y + 10, { align: "center", width: 515 })
          .text("Expense Tracker App © 2026", 40, y + 22, { align: "center", width: 515 });

        doc.end();

        writeStream.on("finish", () => resolve());
        writeStream.on("error", (err) => reject(err));
      });

      console.log(`[WeeklyExpenseJob] PDF successfully generated at ${pdfPath}`);

      // Compose beautiful HTML email
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
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
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
            color: #bfdbfe;
          }
          .content {
            padding: 30px;
          }
          .salutation {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .summary-card {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border-left: 4px solid #0d9488;
          }
          .summary-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 32px;
            font-weight: 800;
            color: #0d9488;
          }
          .details {
            line-height: 1.6;
            font-size: 14px;
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
            <h1>Weekly Expense Report</h1>
            <p>${dateRangeStr}</p>
          </div>
          <div class="content">
            <div class="salutation">Hi ${user.firstName || "User"},</div>
            <div class="details">
              Your weekly expense analysis is ready! Here is a brief summary of your spending for the past 7 days:
            </div>
            
            <div class="summary-card">
              <div class="summary-label">Total Amount Spent</div>
              <div class="summary-value">Rs. ${totalExpense.toFixed(2)}</div>
            </div>

            <div class="details" style="margin-bottom: 25px;">
              We have attached a detailed, professional PDF report containing the comprehensive breakdown of all your transactions, categories, and payment modes for your review.
            </div>

            <div class="details">
              Tracking your expenses consistently is a great step towards financial security. Keep it up!
            </div>
          </div>
          <div class="footer">
            Expense Tracker App &copy; 2026. All rights reserved.<br>
            Please do not reply directly to this email.
          </div>
        </div>
      </body>
      </html>
      `;

      // Send Email
      await mailSend(
        user.email,
        `📊 Weekly Expense Report: ${dateRangeStr}`,
        `Your weekly expense report is attached. Total spent: Rs. ${totalExpense.toFixed(2)}`,
        [
          {
            filename: `Weekly_Expense_Report_${startDate.toISOString().split("T")[0]}.pdf`,
            path: pdfPath,
          },
        ],
        emailHtml
      );

      console.log(`[WeeklyExpenseJob] Email sent successfully to ${user.email}`);

      // Delete temp PDF file
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log(`[WeeklyExpenseJob] Cleaned up temporary PDF file: ${pdfPath}`);
      }
    }
    console.log("[WeeklyExpenseJob] Finished weekly expense PDF reports successfully.");
  } catch (error) {
    console.error("[WeeklyExpenseJob] Error during weekly PDF job execution:", error);
  }
};

module.exports = { runWeeklyExpensePdfJob };
