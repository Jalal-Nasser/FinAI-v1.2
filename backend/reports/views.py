from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from .models import Report, Insight
from .serializers import ReportSerializer, InsightSerializer
from documents.models import Transaction
from datetime import datetime
from decimal import Decimal

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Report.objects.all()
        elif user.organization:
            return Report.objects.filter(organization=user.organization)
        return Report.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new financial report"""
        organization_id = request.data.get('organization_id')
        report_type = request.data.get('report_type')
        report_name = request.data.get('report_name')
        period_start = datetime.fromisoformat(request.data.get('period_start'))
        period_end = datetime.fromisoformat(request.data.get('period_end'))
        
        # Get transactions for the period
        transactions = Transaction.objects.filter(
            organization_id=organization_id,
            transaction_date__range=[period_start, period_end]
        )
        
        # Generate report data based on type
        report_data = {}
        
        if report_type == 'income_statement':
            income = transactions.filter(transaction_type='income').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0')
            
            expenses = transactions.filter(transaction_type='expense').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0')
            
            report_data = {
                'total_revenue': float(income),
                'total_expenses': float(expenses),
                'net_income': float(income - expenses),
                'transactions': transactions.count()
            }
        
        elif report_type == 'cash_flow':
            inflow = transactions.filter(transaction_type='income').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0')
            
            outflow = transactions.filter(transaction_type='expense').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0')
            
            report_data = {
                'total_inflow': float(inflow),
                'total_outflow': float(outflow),
                'net_cash_flow': float(inflow - outflow)
            }
        
        # Create report
        report = Report.objects.create(
            organization_id=organization_id,
            report_type=report_type,
            report_name=report_name,
            period_start=period_start,
            period_end=period_end,
            status='generated',
            data_json=report_data,
            generated_by=request.user
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update report status"""
        report = self.get_object()
        new_status = request.data.get('status')
        
        report.status = new_status
        
        if new_status == 'reviewed':
            report.reviewed_by = request.user
        elif new_status == 'approved':
            report.approved_by = request.user
        
        report.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)

class InsightViewSet(viewsets.ModelViewSet):
    queryset = Insight.objects.all()
    serializer_class = InsightSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Insight.objects.all() if user.role == 'admin' else Insight.objects.filter(organization=user.organization)
        
        # Filter by resolved status
        include_resolved = self.request.query_params.get('include_resolved', 'false').lower() == 'true'
        if not include_resolved:
            queryset = queryset.filter(is_resolved=False)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark insight as resolved"""
        insight = self.get_object()
        insight.is_resolved = True
        insight.resolved_by = request.user
        insight.resolved_at = timezone.now()
        insight.save()
        
        serializer = self.get_serializer(insight)
        return Response(serializer.data)
