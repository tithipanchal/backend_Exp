const userSchema = require("../../models/UserModel");
const mailSend = require("../../utils/MailUtil");

const runIncomeReminderJob = async () => {
  console.log("[IncomeReminderJob] Starting monthly income addition reminder...");
  try {
    const activeUsers = await userSchema.find({ status: "Active" });
    console.log(`[IncomeReminderJob] Found ${activeUsers.length} active users.`);

    for (const user of activeUsers) {
      console.log(`[IncomeReminderJob] Sending reminder to: ${user.email}`);

      // Compose beautifully styled HTML reminder email
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
            background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
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
            color: #e0e7ff;
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
          .highlight-card {
            background: #f8fafc;
            border: 1px dashed #c7d2fe;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .highlight-title {
            font-size: 16px;
            font-weight: 700;
            color: #4f46e5;
            margin-bottom: 8px;
          }
          .highlight-text {
            font-size: 13px;
            color: #64748b;
          }
          .button-container {
            text-align: center;
            margin: 30px 0 10px;
          }
          .btn {
            background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
            color: #ffffff !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
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
            <h1>💰 Start of Month Reminder</h1>
            <p>Don't forget to track your earnings!</p>
          </div>
          <div class="content">
            <div class="salutation">Hi ${user.firstName || "User"},</div>
            <div class="details">
              A brand new month has begun! Setting up your monthly tracking early is the secret to successful financial planning and staying well within your budget boundaries.
            </div>

            <div class="highlight-card">
              <div class="highlight-title">Log Your New Income</div>
              <div class="highlight-text">
                Got a paycheck, dividend, freelance payment, or any other income this month? Log it right away to unlock accurate budget pacing and metrics.
              </div>
            </div>

            <div class="details">
              By keeping your income logs current, our smart dashboard can calculate your real-time savings potential, set budget thresholds, and prevent overspending.
            </div>

            <div class="button-container">
              <a href="#" class="btn">Add Income Now</a>
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

      await mailSend(
        user.email,
        "💰 Monthly Reminder: Keep Your Income Updated!",
        "Don't forget to add your monthly income to keep your budgets accurate!",
        [],
        emailHtml
      );
      
      console.log(`[IncomeReminderJob] Reminder successfully emailed to ${user.email}`);
    }
    console.log("[IncomeReminderJob] Finished monthly income reminders successfully.");
  } catch (error) {
    console.error("[IncomeReminderJob] Error during income reminder job execution:", error);
  }
};

module.exports = { runIncomeReminderJob };
