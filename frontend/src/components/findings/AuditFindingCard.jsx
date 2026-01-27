/**
 * Audit Finding Card - بطاقة ملاحظة التدقيق
 * Displays individual audit finding with AI explanation
 */
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Brain, 
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const AuditFindingCard = ({ finding, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatCurrency = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className={`finai-card transition-all ${expanded ? 'ring-1 ring-primary/50' : ''}`}
      data-testid={`finding-card-${finding.finding_number}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground font-mono en-text">
              {finding.finding_number}
            </span>
            <RiskBadge level={finding.risk_level} size="small" />
            {finding.is_resolved && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                تم الحل
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-1">
            {finding.title_ar}
          </h3>
          
          {finding.title_en && (
            <p className="text-sm text-muted-foreground en-text">
              {finding.title_en}
            </p>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          data-testid="expand-finding-btn"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
        {finding.financial_impact > 0 && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>التأثير المالي: </span>
            <span className="number text-foreground font-medium">
              {formatCurrency(finding.financial_impact)}
            </span>
          </div>
        )}
        
        {finding.created_at && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>التاريخ: </span>
            <span className="number">{formatDate(finding.created_at)}</span>
          </div>
        )}
        
        {finding.finding_type && (
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{finding.finding_type_display || finding.finding_type}</span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          {/* Description */}
          {finding.description_ar && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">الوصف</h4>
              <p className="text-ar-body">{finding.description_ar}</p>
            </div>
          )}

          {/* Impact */}
          {finding.impact_ar && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">التأثير</h4>
              <p className="text-ar-body">{finding.impact_ar}</p>
            </div>
          )}

          {/* AI Explanation */}
          {finding.ai_explanation_ar && (
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium text-primary">تحليل الذكاء الاصطناعي</h4>
                {finding.ai_confidence > 0 && (
                  <span className="mr-auto text-xs text-muted-foreground">
                    مستوى الثقة: <span className="number">{finding.ai_confidence}%</span>
                  </span>
                )}
              </div>
              <p className="text-sm">{finding.ai_explanation_ar}</p>
            </div>
          )}

          {/* Recommendation */}
          {finding.recommendation_ar && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">التوصية</h4>
              <p className="text-ar-body text-green-400/90">{finding.recommendation_ar}</p>
            </div>
          )}

          {/* Regulatory Reference */}
          {finding.regulatory_reference_detail && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">المرجع التنظيمي</h4>
              </div>
              <div className="text-sm">
                <div className="font-medium">
                  {finding.regulatory_reference_detail.article_number}
                </div>
                <div className="text-muted-foreground">
                  {finding.regulatory_reference_detail.title_ar}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onViewDetails?.(finding)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
              data-testid="view-details-btn"
            >
              عرض التفاصيل الكاملة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact finding row for tables
export const AuditFindingRow = ({ finding, onClick }) => {
  return (
    <tr 
      className="cursor-pointer hover:bg-secondary/20 transition-colors"
      onClick={() => onClick?.(finding)}
      data-testid={`finding-row-${finding.finding_number}`}
    >
      <td className="font-mono text-xs en-text">{finding.finding_number}</td>
      <td>{finding.title_ar}</td>
      <td><RiskBadge level={finding.risk_level} size="small" showIcon={false} /></td>
      <td className="number">
        {finding.financial_impact > 0 ? 
          new Intl.NumberFormat('ar-SA').format(finding.financial_impact) : '-'}
      </td>
      <td>
        {finding.is_resolved ? (
          <span className="text-green-400 text-xs">تم الحل</span>
        ) : (
          <span className="text-yellow-400 text-xs">قيد المراجعة</span>
        )}
      </td>
    </tr>
  );
};

export default AuditFindingCard;
