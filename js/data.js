/* Taxflow AI — Centralized Mock Data & Initial State */

const CLIENTS = [
  { name: "Nimbus Retail Pvt Ltd", gstin: "27AAACN1234F1Z5", category: "Private Limited · Retail", docs: 14, status: "Ready to file", health: "ok" },
  { name: "Ramesh Textiles", gstin: "27ABCDE5678G2Z3", category: "Proprietorship · Mfg", docs: 8, status: "Bank st. missing", health: "warn" },
  { name: "Anand Traders", gstin: "27AABCA9012H1Z1", category: "Partnership · Wholesale", docs: 12, status: "Recon pending", health: "warn" },
  { name: "Kaveri Foods LLP", gstin: "27AAACK3456J1Z9", category: "LLP · Food & Bev", docs: 19, status: "Ready to file", health: "ok" },
  { name: "Om Sai Traders", gstin: "27AABCO7890K1Z4", category: "Proprietorship · Trading", docs: 2, status: "Docs overdue", health: "bad" },
  { name: "Green Leaf Exports", gstin: "27AAACG2345L1Z8", category: "Private Limited · Export", docs: 6, status: "3 bills pending", health: "warn" }
];

const REMINDERS_CLIENTS = [
  { name: "Om Sai Traders", missing: "Aug sales invoices & bank statement", last: "Yesterday, 9:30 AM", channel: "WhatsApp", status: "Overdue 2d", statusClass: "bad" },
  { name: "Ramesh Textiles", missing: "Aug bank statement (HDFC)", last: "Today, 9:41 AM", channel: "WhatsApp", status: "Delivered", statusClass: "ok" },
  { name: "Green Leaf Exports", missing: "3 purchase bills (import duty)", last: "12 Sep, 4:15 PM", channel: "Email", status: "Read", statusClass: "ok" },
  { name: "Anand Traders", missing: "Bank recon confirmation", last: "11 Sep, 11:00 AM", channel: "WhatsApp", status: "Delivered", statusClass: "ok" },
  { name: "Shree Ganesh Auto", missing: "TDS challans Q2", last: "10 Sep, 3:00 PM", channel: "Email + WA", status: "Pending", statusClass: "warn" }
];

const RECON_ROWS = [
  { date: "02 Aug 2026", desc: "NEFT / Nimbus Retail Pvt Ltd", bank: "₹1,84,200", book: "₹1,84,200", status: "ok" },
  { date: "05 Aug 2026", desc: "UPI / Ramesh Textiles", bank: "₹45,000", book: "₹45,000", status: "ok" },
  { date: "08 Aug 2026", desc: "Bank charges / HDFC Bank", bank: "₹350", book: "₹0", status: "warn" },
  { date: "12 Aug 2026", desc: "IMPS / Shivam Industries", bank: "₹92,400", book: "₹92,000", status: "warn" },
  { date: "15 Aug 2026", desc: "Cheque 00412 / Anand Traders", bank: "₹2,10,000", book: "₹2,10,000", status: "ok" },
  { date: "22 Aug 2026", desc: "Cash deposit / Branch", bank: "₹50,000", book: "—", status: "bad" },
  { date: "28 Aug 2026", desc: "Interest credit / Q2", bank: "₹640", book: "—", status: "warn" }
];

const VAULT_TREE = {
  "Clients": {
    "Nimbus Retail Pvt Ltd": {
      "Data": {
        "2026": {
          "Aug": {
            "Raw": 9,
            "Extracted": 8,
            "Reconciled": 8
          },
          "Jul": { "Raw": 11, "Extracted": 11 }
        }
      },
      "Permanent": { "GST Registration": 1, "PAN & Incorporation": 2 }
    },
    "Ramesh Textiles": { "2026": { "Aug": { "Raw": 6, "Extracted": 5 } } },
    "Anand Traders": { "2026": { "Aug": { "Raw": 12, "Extracted": 10 } } }
  }
};

const FILES_EXAMPLE = [
  { name: "INV-2291_NimbusRetail_Aug2026.pdf", type: "pdf" },
  { name: "INV-2292_NimbusRetail_Aug2026.pdf", type: "pdf" },
  { name: "PurchaseBill_Vendor_Sigma_08.pdf", type: "pdf" },
  { name: "BankStatement_HDFC_Aug2026.xlsx", type: "xls" },
  { name: "GSTR2A_Aug2026_AutoDownload.xlsx", type: "xls" }
];

const SETTINGS_DEFAULT = {
  theme: "light",
  firmName: "Shreya & Co., Chartered Accountants",
  membershipNo: "CA-104928",
  gstin: "27AAACS1234F1Z2",
  financialYear: "FY 2026-27 (AY 2027-28)",
  currency: "INR (₹)",
  whatsappChannel: "WhatsApp Business API",
  autoReminderDays: 4,
  autoReconThreshold: 90,
  aiModel: "gemini-2.0-flash",
  ocrTemperature: 0.1,
  autoSaveToVault: true,
  storagePath: "C:\\Users\\Shreya\\TaxflowVault"
};
