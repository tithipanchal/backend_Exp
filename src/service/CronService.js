const cron = require("node-cron");
const { runWeeklyExpensePdfJob } = require("./jobs/weeklyExpensePdfJob");
const { runIncomeReminderJob } = require("./jobs/incomeReminderJob");
const { runDatabaseBackupJob } = require("./jobs/databaseBackupJob");

const initCronJobs = () => {
  console.log("[CronService] Initializing automated cron jobs...");

  // 1. Weekly Expense PDF Report: Every Monday morning at 8:00 AM
  // Pattern: '0 8 * * 1'
  cron.schedule("0 8 * * 1", async () => {
    console.log("[CronService] Triggered: Weekly Expense PDF Report Job");
    await runWeeklyExpensePdfJob();
  });
  console.log("[CronService] Scheduled: Weekly Expense PDF Report (Every Monday at 8:00 AM)");

  // 2. Income Addition Reminder: Every day from 1st to 7th of the month at 9:00 AM
  // Pattern: '0 9 1-7 * *'
  cron.schedule("0 9 1-7 * *", async () => {
    console.log("[CronService] Triggered: Income Addition Reminder Job");
    await runIncomeReminderJob();
  });
  console.log("[CronService] Scheduled: Income Addition Reminder (Every 1st-7th of the month at 9:00 AM)");

  // 3. Database Backup & Zip: Every Sunday night at 11:00 PM
  // Pattern: '0 23 * * 0'
  cron.schedule("0 23 * * 0", async () => {
    console.log("[CronService] Triggered: Weekly Database Backup Job");
    await runDatabaseBackupJob();
  });
  console.log("[CronService] Scheduled: Weekly Database Backup (Every Sunday at 11:00 PM)");
};

module.exports = {
  initCronJobs,
  runWeeklyExpensePdfJob,
  runIncomeReminderJob,
  runDatabaseBackupJob,
};
