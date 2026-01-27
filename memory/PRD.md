# FinAI - AI-Powered Financial Audit Platform
## Product Requirements Document (PRD)

**Version**: 2.0  
**Last Updated**: January 27, 2026  
**Status**: Phase 2 Complete (ZATCA/VAT/Zakat/Arabic Reports)

---

## 1. Original Problem Statement

Build an AI-Powered Financial Audit Platform (FinAI) targeting the GCC market with:
- Django REST API backend
- SQLite database
- AI/LLM-based analysis
- Document processing with OCR
- Multi-country GCC compliance
- Financial analytics and reporting
- Audit trail and traceability
- **ZATCA e-invoicing compliance (Saudi Arabia)**
- **VAT reconciliation and audit**
- **Zakat calculation and comparison**
- **Arabic-first reporting**

---

## 2. User Personas

### 2.1 Auditor (المدقق)
- Reviews flagged transactions
- Investigates anomalies
- Resolves compliance issues
- Generates Arabic audit reports

### 2.2 Accountant (المحاسب)
- Uploads and processes documents
- Creates transactions and journal entries
- Validates extracted data
- Prepares VAT reconciliations

### 2.3 Finance Manager (المدير المالي)
- Monitors KPIs and trends
- Reviews compliance scores
- Approves reports
- Oversees Zakat calculations

### 2.4 Admin (المشرف)
- Manages users and organizations
- System-wide configuration
- Full access to all features

---

## 3. Core Requirements

### 3.1 Document Processing ✅
- [x] Upload documents (PDF, JPG, PNG, TIFF)
- [x] Batch upload support
- [x] AI-powered OCR with Arabic/English support
- [x] Confidence scoring
- [x] Manual validation workflow
- [x] 50MB file limit

### 3.2 Financial Data Management ✅
- [x] Chart of Accounts
- [x] Transaction management
- [x] Journal entries (double-entry)
- [x] VAT calculation and tracking
- [x] Multi-currency support

### 3.3 ZATCA Compliance (Saudi Arabia) ✅ NEW
- [x] E-Invoice validation service
- [x] Mandatory field checks
- [x] VAT number format validation (15-digit)
- [x] UUID validation
- [x] VAT calculation verification
- [x] Invoice date validation
- [x] Hash calculation for integrity
- [x] Validation results storage

### 3.4 VAT Reconciliation ✅ NEW
- [x] Output VAT (sales) calculation
- [x] Input VAT (purchases) calculation
- [x] GL balance comparison
- [x] Variance detection and reporting
- [x] Discrepancy categorization
- [x] Compliance scoring

### 3.5 Zakat Calculation ✅ NEW
- [x] Positive Zakat base components
- [x] Deductions (fixed assets, losses)
- [x] Net Zakat base calculation
- [x] 2.5% rate application
- [x] Zakat vs Tax comparison
- [x] Discrepancy detection
- [x] Arabic explanations

### 3.6 Arabic Reporting ✅ NEW
- [x] Formal Arabic audit reports
- [x] Executive summary generation
- [x] Risk level in Arabic (حرج، مرتفع، متوسط، منخفض)
- [x] Regulatory reference mapping
- [x] Recommendations in Arabic
- [x] Professional conclusion

### 3.7 Regulatory Mapping ✅ NEW
- [x] RegulatoryReference model
- [x] Article/clause identification
- [x] Bilingual content (Arabic primary)
- [x] Penalty information
- [x] Finding linkage

---

## 4. What's Been Implemented

### Phase 1 (January 27, 2026)
- Account, JournalEntry, ComplianceCheck, AuditFlag models
- 8 new API endpoints for accounts, compliance, audit flags
- Test dataset seeding (300 transactions)

### Phase 2 (January 27, 2026)
**New Compliance App** (`/app/backend/compliance/`):
- **Models**: RegulatoryReference, ZATCAInvoice, ZATCAValidationResult, VATReconciliation, VATDiscrepancy, ZakatCalculation, ZakatDiscrepancy, AuditFinding
- **Services**: ZATCAValidationService, VATReconciliationService, ZakatCalculationService, ArabicReportService
- **API Endpoints**:
  - `/api/compliance/dashboard/overview/`
  - `/api/compliance/regulatory-references/`
  - `/api/compliance/zatca-invoices/` (with validation)
  - `/api/compliance/vat-reconciliations/` (with calculate)
  - `/api/compliance/zakat-calculations/` (with calculate)
  - `/api/compliance/audit-findings/` (with Arabic report)

**Test Data**:
- 6 regulatory references (ZATCA articles)
- 20 ZATCA invoices
- 2 VAT reconciliations
- 2 Zakat calculations
- 8 audit findings with Arabic content

---

## 5. API Summary

### Authentication
```
POST /api/auth/token/
POST /api/auth/token/refresh/
```

### Core
```
GET  /api/core/organizations/
GET  /api/core/users/
```

### Documents
```
GET  /api/documents/documents/
POST /api/documents/documents/upload/
POST /api/documents/documents/batch_upload/
GET  /api/documents/transactions/
GET  /api/documents/accounts/
GET  /api/documents/journal-entries/
GET  /api/documents/compliance-checks/
GET  /api/documents/audit-flags/
```

### Compliance (NEW)
```
GET  /api/compliance/dashboard/overview/
GET  /api/compliance/regulatory-references/
GET  /api/compliance/zatca-invoices/
GET  /api/compliance/zatca-invoices/{id}/validate/
GET  /api/compliance/zatca-invoices/compliance_summary/
GET  /api/compliance/vat-reconciliations/
POST /api/compliance/vat-reconciliations/calculate/
GET  /api/compliance/vat-reconciliations/variance_report/
GET  /api/compliance/zakat-calculations/
POST /api/compliance/zakat-calculations/calculate/
GET  /api/compliance/audit-findings/
GET  /api/compliance/audit-findings/dashboard/
GET  /api/compliance/audit-findings/generate_report_ar/
```

---

## 6. Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] React frontend dashboard (Arabic-first, RTL)
- [ ] Compliance score widgets
- [ ] Audit flag resolution UI
- [ ] Arabic report viewer/export

### P1 - High Priority
- [ ] Live ZATCA API integration (Phase 3)
- [ ] Automated VAT return generation
- [ ] Email notifications for critical flags
- [ ] Shariah compliance rules

### P2 - Medium Priority
- [ ] Balance sheet report
- [ ] Currency conversion service
- [ ] Bulk transaction import

---

## 7. Test Credentials

- **Admin**: `admin@finai.com` / `admin123`
- **Auditor**: `test.auditor@al-faisaltradingcompany.com` / `auditor123`

### Seed Commands
```bash
python manage.py seed_test_data
python manage.py seed_compliance_data
```

---

*Document maintained by FinAI Development Team*
