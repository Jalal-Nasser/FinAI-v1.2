"""
Core Views Package - حزمة وجهات النظر الأساسية

This package contains all web views split into focused modules:
- auth_views: Login, logout
- dashboard_views: Main dashboard
- compliance_views: ZATCA, VAT, Zakat compliance
- finding_views: Audit findings and AI explanations
- transaction_views: Transactions and accounts
- document_views: Document upload and OCR
- report_views: Reports and analytics
- settings_views: Organization settings
"""

# Auth views
from .auth_views import (
    login_view,
    logout_view,
)

# Dashboard views
from .dashboard_views import (
    dashboard_view,
)

# Compliance views
from .compliance_views import (
    compliance_overview_view,
    zatca_verification_view,
)

# Finding views
from .finding_views import (
    audit_findings_list_view,
    audit_finding_detail_view,
    generate_ai_explanation_view,
    review_ai_explanation_view,
)

# Transaction views
from .transaction_views import (
    transactions_view,
    transaction_detail_view,
    accounts_list_view,
    account_detail_view,
)

# Document views
from .document_views import (
    documents_view,
    document_upload_view,
    ocr_evidence_list_view,
    ocr_evidence_detail_view,
)

# Report views
from .report_views import (
    arabic_report_view,
    download_pdf_report_view,
    reports_list_view,
    analytics_dashboard_view,
    resolve_insight_view,
)

# Settings views
from .settings_views import (
    toggle_language_view,
    organization_settings_view,
)

__all__ = [
    # Auth
    'login_view',
    'logout_view',
    # Dashboard
    'dashboard_view',
    # Compliance
    'compliance_overview_view',
    'zatca_verification_view',
    # Findings
    'audit_findings_list_view',
    'audit_finding_detail_view',
    'generate_ai_explanation_view',
    'review_ai_explanation_view',
    # Transactions
    'transactions_view',
    'transaction_detail_view',
    'accounts_list_view',
    'account_detail_view',
    # Documents
    'documents_view',
    'document_upload_view',
    'ocr_evidence_list_view',
    'ocr_evidence_detail_view',
    # Reports
    'arabic_report_view',
    'download_pdf_report_view',
    'reports_list_view',
    'analytics_dashboard_view',
    'resolve_insight_view',
    # Settings
    'toggle_language_view',
    'organization_settings_view',
]
