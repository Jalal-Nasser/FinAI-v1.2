/**
 * VAT Reconciliation Page - صفحة تسوية ضريبة القيمة المضافة
 * View VAT reconciliations and discrepancies
 */
import React from 'react';
import { Receipt, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useVATReconciliations, useVATVarianceReport } from '../lib/hooks';
import { ComplianceProgressBar } from '../components/dashboard/ComplianceScore';

const VATPage = ({ organizationId }) => {
  const { data: reconciliationsData, isLoading } = useVATReconciliations({
    organization_id: organizationId,
  });
  const { data: varianceReport } = useVATVarianceReport(organizationId);

  const reconciliations = reconciliationsData?.results || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6" data-testid="vat-page">
      {/* Header */}
      <div>
        <h1 className="text-ar-title flex items-center gap-3">
          <Receipt className="w-8 h-8 text-primary" />
          ضريبة القيمة المضافة
        </h1>
        <p className="text-muted-foreground">
          تسوية ومطابقة ضريبة القيمة المضافة
        </p>
      </div>

      {/* Summary Cards */}
      {varianceReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="finai-card">
            <div className="text-sm text-muted-foreground mb-1">إجمالي التسويات</div>
            <div className="text-2xl font-bold number">{varianceReport.total_reconciliations}</div>
          </div>
          <div className="finai-card">
            <div className="text-sm text-muted-foreground mb-1">تسويات بها فروقات</div>
            <div className="text-2xl font-bold number text-yellow-400">{varianceReport.with_variance}</div>
          </div>
          <div className="finai-card">
            <div className="text-sm text-muted-foreground mb-1">فروقات موجبة</div>
            <div className="text-2xl font-bold number text-red-400">
              {formatCurrency(varianceReport.total_positive_variance)}
            </div>
          </div>
          <div className="finai-card">
            <div className="text-sm text-muted-foreground mb-1">فروقات سالبة</div>
            <div className="text-2xl font-bold number text-green-400">
              {formatCurrency(varianceReport.total_negative_variance)}
            </div>
          </div>
        </div>
      )}

      {/* Reconciliations List */}
      <div className="finai-card">
        <h2 className="text-lg font-semibold mb-4">سجل التسويات</h2>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : reconciliations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد تسويات مسجلة
          </div>
        ) : (
          <div className="space-y-4">
            {reconciliations.map((recon) => (
              <div 
                key={recon.id} 
                className="p-4 bg-secondary/30 rounded-lg border border-border"
                data-testid={`vat-recon-${recon.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      الفترة: {formatDate(recon.period_start)} - {formatDate(recon.period_end)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {recon.period_type_display || recon.period_type}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    recon.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    recon.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {recon.status_display || recon.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">ضريبة المخرجات</div>
                    <div className="text-lg font-bold number flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      {formatCurrency(recon.total_output_vat)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">ضريبة المدخلات</div>
                    <div className="text-lg font-bold number flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      {formatCurrency(recon.total_input_vat)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">صافي الضريبة</div>
                    <div className="text-lg font-bold number">
                      {formatCurrency(recon.net_vat_due)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">الفرق</div>
                    <div className={`text-lg font-bold number ${
                      Math.abs(recon.total_variance) > 0 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {formatCurrency(recon.total_variance)}
                    </div>
                  </div>
                </div>

                {/* Compliance Score */}
                <ComplianceProgressBar 
                  score={recon.compliance_score || 0} 
                  label_ar="درجة الامتثال" 
                  size="small"
                />

                {/* Variance Explanation */}
                {recon.variance_explanation_ar && Math.abs(recon.total_variance) > 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-400 mb-1">شرح الفروقات</div>
                        <div className="text-sm">{recon.variance_explanation_ar}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discrepancy Count */}
                {recon.discrepancy_count > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <span className="number text-yellow-400">{recon.discrepancy_count}</span> تفاوت مكتشف
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VATPage;
