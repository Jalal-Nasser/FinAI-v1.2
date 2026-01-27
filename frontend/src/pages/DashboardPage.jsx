/**
 * Dashboard Page - صفحة لوحة المعلومات
 * Main compliance overview dashboard
 */
import React from 'react';
import { 
  Receipt, 
  Calculator, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Building2,
  Shield
} from 'lucide-react';
import { ComplianceScoreCard, ComplianceProgressBar } from '../components/dashboard/ComplianceScore';
import { RiskSummaryCard, RiskDistributionBar } from '../components/dashboard/RiskBadge';
import { AuditFindingCard } from '../components/findings/AuditFindingCard';
import { 
  useComplianceDashboard, 
  useAuditFindingsDashboard, 
  useAuditFindings 
} from '../lib/hooks';

const DashboardPage = ({ organizationId }) => {
  // Fetch data
  const { data: complianceData, isLoading: loadingCompliance } = useComplianceDashboard(organizationId);
  const { data: findingsDashboard, isLoading: loadingFindingsDash } = useAuditFindingsDashboard();
  const { data: findingsData, isLoading: loadingFindings } = useAuditFindings({ 
    is_resolved: 'false',
    limit: 5 
  });

  if (loadingCompliance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  const compliance = complianceData || {};
  const riskCounts = findingsDashboard?.by_risk_level || {};
  const recentFindings = findingsData?.results || [];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Page Header */}
      <div>
        <h1 className="text-ar-title">لوحة المعلومات</h1>
        <p className="text-muted-foreground">نظرة عامة على حالة الامتثال والتدقيق</p>
      </div>

      {/* Overall Compliance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <ComplianceScoreCard
            score={compliance.overall_compliance_score || 0}
            title_ar="درجة الامتثال العام"
            title_en="Overall Compliance"
            icon={Shield}
            size="large"
          />
        </div>
        
        {/* Sub-scores */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComplianceScoreCard
            score={compliance.vat_compliance?.score || 0}
            title_ar="ضريبة القيمة المضافة"
            title_en="VAT Compliance"
            subtitle_ar={`${compliance.vat_compliance?.reconciliations || 0} تسوية`}
            icon={Receipt}
          />
          <ComplianceScoreCard
            score={compliance.zakat_compliance?.score || 0}
            title_ar="الزكاة"
            title_en="Zakat Compliance"
            subtitle_ar={`${compliance.zakat_compliance?.calculations || 0} حساب`}
            icon={Calculator}
          />
          <ComplianceScoreCard
            score={compliance.zatca_compliance?.score || 0}
            title_ar="الفواتير الإلكترونية"
            title_en="ZATCA E-Invoicing"
            subtitle_ar={`${compliance.zatca_compliance?.validated || 0}/${compliance.zatca_compliance?.total_invoices || 0} معتمدة`}
            icon={FileText}
          />
        </div>
      </div>

      {/* Risk Level Summary */}
      <div className="finai-card">
        <div className="finai-card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h2 className="finai-card-title">ملخص المخاطر</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            <span className="number">{findingsDashboard?.unresolved_findings || 0}</span> ملاحظة غير محلولة
          </span>
        </div>
        
        <RiskSummaryCard counts={riskCounts} />
        
        <div className="mt-4">
          <RiskDistributionBar counts={riskCounts} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Findings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              أحدث ملاحظات التدقيق
            </h2>
            <a href="/findings" className="text-sm text-primary hover:underline">
              عرض الكل ←
            </a>
          </div>
          
          {loadingFindings ? (
            <div className="text-muted-foreground">جاري التحميل...</div>
          ) : recentFindings.length === 0 ? (
            <div className="finai-card text-center text-muted-foreground py-8">
              لا توجد ملاحظات غير محلولة
            </div>
          ) : (
            <div className="space-y-3">
              {recentFindings.slice(0, 3).map((finding) => (
                <AuditFindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </div>

        {/* Compliance Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            تفاصيل الامتثال
          </h2>
          
          <div className="finai-card space-y-4">
            <ComplianceProgressBar 
              score={compliance.vat_compliance?.score || 0} 
              label_ar="ض.ق.م - تسوية الضريبة" 
            />
            <ComplianceProgressBar 
              score={compliance.zakat_compliance?.score || 0} 
              label_ar="الزكاة - الحساب السنوي" 
            />
            <ComplianceProgressBar 
              score={compliance.zatca_compliance?.score || 0} 
              label_ar="فاتورة - التحقق الإلكتروني" 
            />
            
            {/* Risk Level Indicator */}
            {compliance.risk_level && (
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">مستوى المخاطر العام</span>
                  <span className={`text-lg font-bold ${
                    compliance.risk_level.level === 'critical' ? 'text-red-400' :
                    compliance.risk_level.level === 'high' ? 'text-orange-400' :
                    compliance.risk_level.level === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {compliance.risk_level.level_ar}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Audit Stats */}
          <div className="finai-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">إحصائيات التدقيق</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold number text-foreground">
                  {findingsDashboard?.total_findings || 0}
                </div>
                <div className="text-xs text-muted-foreground">إجمالي الملاحظات</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold number text-yellow-400">
                  {findingsDashboard?.unresolved_findings || 0}
                </div>
                <div className="text-xs text-muted-foreground">غير محلولة</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold number text-red-400">
                  {riskCounts.critical || 0}
                </div>
                <div className="text-xs text-muted-foreground">حرجة</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold number text-green-400">
                  {(findingsDashboard?.total_findings || 0) - (findingsDashboard?.unresolved_findings || 0)}
                </div>
                <div className="text-xs text-muted-foreground">تم حلها</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
