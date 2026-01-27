/**
 * Risk Level Badge - شارة مستوى المخاطر
 * Arabic-first risk indicator component
 */
import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const riskConfig = {
  critical: {
    label_ar: 'حرج',
    label_en: 'Critical',
    icon: AlertTriangle,
    className: 'risk-critical',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
  },
  high: {
    label_ar: 'مرتفع',
    label_en: 'High',
    icon: AlertCircle,
    className: 'risk-high',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
  },
  medium: {
    label_ar: 'متوسط',
    label_en: 'Medium',
    icon: Info,
    className: 'risk-medium',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/30',
  },
  low: {
    label_ar: 'منخفض',
    label_en: 'Low',
    icon: CheckCircle,
    className: 'risk-low',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400',
    borderClass: 'border-green-500/30',
  },
};

export const RiskBadge = ({ level, showIcon = true, size = 'default' }) => {
  const config = riskConfig[level] || riskConfig.medium;
  const Icon = config.icon;
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`risk-badge ${config.className} ${sizeClasses[size]} inline-flex items-center gap-1.5`}
      data-testid={`risk-badge-${level}`}
    >
      {showIcon && <Icon className={`w-3.5 h-3.5 ${config.textClass}`} />}
      <span>{config.label_ar}</span>
    </span>
  );
};

// Risk Summary Cards
export const RiskSummaryCard = ({ counts = {} }) => {
  const levels = ['critical', 'high', 'medium', 'low'];
  
  return (
    <div className="flex items-center gap-4 flex-wrap" data-testid="risk-summary">
      {levels.map((level) => {
        const config = riskConfig[level];
        const count = counts[level] || 0;
        
        return (
          <div 
            key={level}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgClass} border ${config.borderClass}`}
          >
            <config.icon className={`w-4 h-4 ${config.textClass}`} />
            <span className={config.textClass}>{config.label_ar}</span>
            <span className={`font-bold number ${config.textClass}`}>({count})</span>
          </div>
        );
      })}
    </div>
  );
};

// Risk Distribution Bar
export const RiskDistributionBar = ({ counts = {} }) => {
  const total = Object.values(counts).reduce((sum, c) => sum + (c || 0), 0);
  if (total === 0) return null;
  
  const levels = ['critical', 'high', 'medium', 'low'];
  
  return (
    <div className="space-y-2">
      <div className="h-3 rounded-full overflow-hidden flex bg-secondary">
        {levels.map((level) => {
          const count = counts[level] || 0;
          const percentage = (count / total) * 100;
          const config = riskConfig[level];
          
          if (percentage === 0) return null;
          
          return (
            <div
              key={level}
              className={`h-full ${config.bgClass.replace('/10', '')}`}
              style={{ width: `${percentage}%` }}
              title={`${config.label_ar}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>الإجمالي: <span className="number">{total}</span></span>
        <span>
          {counts.critical > 0 && <span className="text-red-400 ml-2">حرج: {counts.critical}</span>}
          {counts.high > 0 && <span className="text-orange-400 ml-2">مرتفع: {counts.high}</span>}
        </span>
      </div>
    </div>
  );
};

export default RiskBadge;
