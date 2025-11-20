# Markman Group Wind-Down - Execution Tracker
**Created:** 2025-11-10
**Status:** In Progress
**Purpose:** Track real-life execution with visual proof of completion

---

## 🎯 EXECUTION PLAN WITH VISUAL PROOF REQUIREMENTS

### ✅ PHASE 1: DATA BACKUP (Week 1) - DO FIRST!

#### 1.1 SharePoint/OneDrive Backup
- **Status:** ✅ IN PROGRESS
- **Started:** 2025-11-10
- **Script:** `/Users/mike/markman-group-financial-reporting/download-sharepoint-documents.js`
- **Progress:** 46+ files backed up, majority of critical docs secured
- **Location:** `/Users/mike/markman-group-financial-reporting/data/projects/`

**Visual Proof Required:**
- [ ] Screenshot of backup completion log showing file count
- [ ] Screenshot of `/data/projects/` folder showing backed up files
- [ ] Confirmation that critical business files are readable/accessible

**Validation:**
```bash
# Run this to verify backup
find /Users/mike/markman-group-financial-reporting/data/projects -type f | wc -l
du -sh /Users/mike/markman-group-financial-reporting/data/projects
```

---

### 🔴 PHASE 2: CRITICAL ACTIONS (Week 1)

#### 2.1 Highland North Hills Office Rent
- **Status:** ⏳ NOT STARTED
- **Amount:** $8,730/month
- **Contact:** YSI Property Management
- **Action:** Move payment from Chase business card to personal credit card

**Steps to Execute:**
1. Call YSI Property Management or visit office
2. Request to update payment method
3. Provide personal credit card information
4. Confirm first charge will process on personal card
5. Cancel/remove business card from autopay

**Visual Proof Required:**
- [ ] Screenshot of email confirmation from YSI showing updated payment method
- [ ] OR: Photo of signed payment method update form
- [ ] Screenshot of first charge on personal credit card statement showing Highland/YSI
- [ ] Screenshot of business card showing NO future Highland charges scheduled

**Completion Date:** __________
**Verified By:** __________

---

#### 2.2 Duke Energy Transfer
- **Status:** ⏳ NOT STARTED
- **Amount:** $125/month
- **Contact:** Duke Energy (800-777-9898)
- **Action:** Transfer billing from business to personal account

**Steps to Execute:**
1. Call Duke Energy: 800-777-9898
2. Request account transfer to personal billing
3. Provide personal credit card
4. Confirm account number remains same (for continuity)
5. Request confirmation email

**Visual Proof Required:**
- [ ] Screenshot of Duke Energy account portal showing personal name/card
- [ ] Screenshot of confirmation email from Duke Energy
- [ ] Photo of first bill on personal account

**Completion Date:** __________
**Verified By:** __________

---

#### 2.3 Google Fiber Transfer
- **Status:** ⏳ NOT STARTED
- **Amount:** $70/month
- **Contact:** Google Fiber (866-777-7550)
- **Action:** Transfer billing from business to personal account

**Steps to Execute:**
1. Call Google Fiber: 866-777-7550
2. Request billing transfer to personal account
3. Update payment method to personal credit card
4. Confirm service address remains same
5. Request confirmation email

**Visual Proof Required:**
- [ ] Screenshot of Google Fiber account showing personal billing
- [ ] Screenshot of confirmation email
- [ ] Screenshot of first charge on personal card

**Completion Date:** __________
**Verified By:** __________

---

### 🟡 PHASE 3: MICROSOFT/AZURE AUDIT & CANCELLATION (Week 2-3)

#### 3.1 Microsoft 365 License Audit
- **Status:** ✅ COMPLETED (via Azure portal screenshots)
- **Current State:** 11 licenses × $22/mo = $259.60/month
- **Invoice:** G119381668 (10/17/2025 for $259.60)

**Findings:**
- 11 Microsoft 365 Business Premium licenses
- Billing period: Monthly (10/16-11/15/2025)
- Only 1 license needed for email preservation

---

#### 3.2 Cancel 10 Microsoft 365 Licenses
- **Status:** ⏳ NOT STARTED
- **Target State:** 1 license @ $22/mo (down from 11 @ $259.60/mo)
- **Savings:** $237.60/month = $2,851/year

**Steps to Execute:**
1. Go to Azure Portal → portal.azure.com
2. Navigate to: Cost Management + Billing → Billing scopes → Markman Associates
3. Click "Go to Microsoft 365 admin center"
4. Go to: Billing → Your products → Microsoft 365 Business Premium
5. Click "Remove licenses"
6. Reduce from 11 to 1 license
7. Confirm which email account keeps the 1 license (recommend: mike@markman-group.com or primary)
8. Click "Save" and confirm cancellation

**Visual Proof Required:**
- [ ] Screenshot of Microsoft 365 admin center showing LICENSE COUNT BEFORE (11 licenses)
- [ ] Screenshot during cancellation showing reduction to 1 license
- [ ] Screenshot of confirmation page showing successful cancellation
- [ ] Screenshot of Microsoft 365 admin center showing LICENSE COUNT AFTER (1 license)
- [ ] Screenshot of next invoice showing $22/month (not $259.60)
- [ ] Screenshot of email addresses showing which account has the remaining license

**Completion Date:** __________
**Monthly Savings Achieved:** $237.60
**Verified By:** __________

---

#### 3.3 Backup Validation (Before Cancellation)
**CRITICAL:** Verify all data is backed up before reducing licenses!

**Visual Proof Required:**
- [ ] Screenshot of OneDrive showing all personal files downloaded
- [ ] Screenshot of local backup folder: `/data/projects/` with file count
- [ ] Confirmation that all critical documents (SOWs, contracts, proposals) are accessible locally

---

### 🟡 PHASE 4: AI SUBSCRIPTIONS (Week 2-3)

#### 4.1 Anthropic/Claude Cancellation
- **Status:** ⏳ NOT STARTED
- **Amount:** $20/day = ~$600/month
- **Action:** Cancel business subscription

**Steps to Execute:**
1. Go to console.anthropic.com
2. Navigate to Settings → Billing
3. Click "Cancel subscription" or "Remove payment method"
4. Confirm cancellation
5. Screenshot confirmation

**Visual Proof Required:**
- [ ] Screenshot of Anthropic billing page showing BEFORE state (active subscription)
- [ ] Screenshot of cancellation confirmation
- [ ] Screenshot showing "No active subscription" or payment method removed
- [ ] Screenshot of final invoice/charge

**Completion Date:** __________
**Monthly Savings Achieved:** $600
**Verified By:** __________

---

#### 4.2 OpenAI/ChatGPT Cancellation
- **Status:** ⏳ NOT STARTED
- **Amount:** ~$200/month
- **Action:** Cancel or move to personal account

**Steps to Execute:**
1. Go to platform.openai.com/settings/organization/billing
2. Click "Cancel subscription" or update payment method
3. If keeping personally: Switch to personal credit card
4. If canceling: Remove payment method and confirm

**Visual Proof Required:**
- [ ] Screenshot of OpenAI billing page showing current subscription
- [ ] Screenshot of cancellation OR personal card update confirmation
- [ ] Screenshot of final invoice

**Completion Date:** __________
**Monthly Savings Achieved:** $200 (if cancelled) or $0 (if moved to personal)
**Verified By:** __________

---

### 🟢 PHASE 5: OTHER SUBSCRIPTIONS (Week 4-5)

#### 5.1 GitHub - Move to Personal
- **Status:** ⏳ NOT STARTED
- **Amount:** $32/month
- **Action:** Transfer billing to personal account (keep active)

**Steps to Execute:**
1. Go to github.com/settings/billing
2. Update payment method to personal credit card
3. Verify all repositories are still accessible
4. Update organization billing if needed

**Visual Proof Required:**
- [ ] Screenshot of GitHub billing showing personal card
- [ ] Screenshot of confirmation email

**Completion Date:** __________
**Verified By:** __________

---

#### 5.2 Vercel - Move or Cancel
- **Status:** ⏳ NOT STARTED
- **Amount:** $20/month
- **Decision:** Move to personal OR cancel
- **Action:** TBD based on usage

**Visual Proof Required:**
- [ ] Screenshot of decision and confirmation

**Completion Date:** __________
**Verified By:** __________

---

#### 5.3 AT&T Business Phone
- **Status:** ⏳ NOT STARTED
- **Amount:** $74/month
- **Action:** Port to personal OR cancel

**Visual Proof Required:**
- [ ] Screenshot of port confirmation OR cancellation
- [ ] Screenshot showing number status

**Completion Date:** __________
**Verified By:** __________

---

#### 5.4 YouTube TV
- **Status:** ⏳ NOT STARTED
- **Amount:** $112/month
- **Action:** Cancel

**Steps to Execute:**
1. Go to tv.youtube.com/settings
2. Navigate to Membership
3. Click "Cancel membership"
4. Confirm cancellation

**Visual Proof Required:**
- [ ] Screenshot of cancellation confirmation
- [ ] Screenshot showing "Membership ends on [date]"

**Completion Date:** __________
**Monthly Savings Achieved:** $112
**Verified By:** __________

---

### ✅ PHASE 6: COMPLETED ITEMS

#### 6.1 Midjourney - CANCELLED ✅
- **Status:** ✅ COMPLETED
- **Date:** 2025-11-10
- **Amount:** $30/month
- **Savings:** $30/month

---

## 📊 SAVINGS TRACKER

| Action | Status | Monthly Savings | Annual Savings |
|--------|--------|-----------------|----------------|
| Microsoft (10 licenses) | ⏳ Pending | $237.60 | $2,851.20 |
| Anthropic/Claude | ⏳ Pending | $600.00 | $7,200.00 |
| OpenAI ChatGPT | ⏳ Pending | $200.00 | $2,400.00 |
| YouTube TV | ⏳ Pending | $112.00 | $1,344.00 |
| Midjourney | ✅ Done | $30.00 | $360.00 |
| **TOTAL ACHIEVED** | | **$30.00** | **$360.00** |
| **TARGET TOTAL** | | **$1,179.60** | **$14,155.20** |
| **PROGRESS** | | **2.5%** | |

---

## 🎯 VISUAL PROOF SUBMISSION CHECKLIST

### Critical Actions (Do These First)
- [ ] Highland rent transfer confirmation
- [ ] Duke Energy transfer confirmation
- [ ] Google Fiber transfer confirmation

### High Priority (Week 2-3)
- [ ] Microsoft license reduction (11→1) confirmation
- [ ] Anthropic cancellation confirmation
- [ ] OpenAI cancellation/transfer confirmation

### Medium Priority (Week 4-5)
- [ ] GitHub transfer confirmation
- [ ] YouTube TV cancellation confirmation

---

## 📝 INSTRUCTIONS FOR VISUAL PROOF

**For each action:**
1. **BEFORE**: Take screenshot showing current state
2. **DURING**: Take screenshot of confirmation/completion page
3. **AFTER**: Take screenshot showing updated state
4. Save screenshots to: `/Users/mike/markman-group-financial-reporting/data/wind-down-proof/`
5. Name format: `[date]-[action]-[status].png`
   - Example: `2025-11-10-microsoft-licenses-before.png`
   - Example: `2025-11-10-microsoft-licenses-after.png`

**Minimum Required:**
- 3 screenshots per action (before, during, after)
- Clear visibility of amounts, dates, confirmation numbers
- Full page screenshots (not cropped)

---

## ⚠️ CRITICAL REMINDERS

1. **BACKUP FIRST** - Complete SharePoint backup before canceling Microsoft
2. **Highland First** - Move rent payment before anything else ($8,730/mo!)
3. **Credit Card Last** - Don't cancel card until all recurring payments moved
4. **Bank Accounts Last** - Close checking/card after everything else is complete

---

## 📞 EMERGENCY CONTACTS

| Service | Phone | Hours |
|---------|-------|-------|
| YSI Property Mgmt | TBD | Business hours |
| Duke Energy | 800-777-9898 | 24/7 |
| Google Fiber | 866-777-7550 | 8am-11pm ET |
| Chase Business | 800-935-9935 | 24/7 |
| Microsoft Support | 800-865-9408 | 24/7 |

---

**Last Updated:** 2025-11-10
**Next Review:** 2025-11-17 (Weekly)
