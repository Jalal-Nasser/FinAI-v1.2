from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from core.models import User, Organization
from documents.models import Document, Transaction
from reports.models import Report, Insight
from django.db.models import Count, Sum

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            auth_login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid email or password')
    
    return render(request, 'login.html')

def logout_view(request):
    auth_logout(request)
    return redirect('login')

@login_required
def dashboard_view(request):
    user = request.user
    organization = user.organization
    
    if not organization:
        return render(request, 'no_organization.html')
    
    # Get statistics
    stats = {
        'total_documents': Document.objects.filter(organization=organization).count(),
        'pending_documents': Document.objects.filter(organization=organization, status='pending').count(),
        'total_transactions': Transaction.objects.filter(organization=organization).count(),
        'unresolved_insights': Insight.objects.filter(organization=organization, is_resolved=False).count(),
    }
    
    # Get recent documents
    recent_documents = Document.objects.filter(organization=organization).order_by('-uploaded_at')[:10]
    
    # Get unresolved insights
    insights = Insight.objects.filter(organization=organization, is_resolved=False).order_by('-created_at')[:5]
    
    context = {
        'stats': stats,
        'recent_documents': recent_documents,
        'insights': insights,
    }
    
    return render(request, 'dashboard.html', context)

@login_required
def documents_view(request):
    user = request.user
    organization = user.organization
    
    # Limit to 100 most recent documents for performance
    documents = Document.objects.filter(organization=organization).order_by('-uploaded_at')[:100]
    
    context = {
        'documents': documents,
    }
    
    return render(request, 'documents.html', context)

@login_required
def transactions_view(request):
    user = request.user
    organization = user.organization
    
    # Limit to 200 most recent transactions for performance
    transactions = Transaction.objects.filter(organization=organization).order_by('-transaction_date')[:200]
    
    context = {
        'transactions': transactions,
    }
    
    return render(request, 'transactions.html', context)

@login_required
def reports_list_view(request):
    user = request.user
    organization = user.organization
    
    reports = Report.objects.filter(organization=organization).order_by('-created_at')
    
    context = {
        'reports': reports,
    }
    
    return render(request, 'reports.html', context)

@login_required
def analytics_dashboard_view(request):
    user = request.user
    organization = user.organization
    
    # Get basic analytics data
    from datetime import datetime, timedelta
    from decimal import Decimal
    
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    transactions = Transaction.objects.filter(
        organization=organization,
        transaction_date__gte=thirty_days_ago
    )
    
    income = transactions.filter(transaction_type='income').aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0')
    
    expenses = transactions.filter(transaction_type='expense').aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0')
    
    insights = Insight.objects.filter(organization=organization, is_resolved=False)
    
    context = {
        'total_income': float(income),
        'total_expenses': float(expenses),
        'net_profit': float(income - expenses),
        'insights': insights,
    }
    
    return render(request, 'analytics.html', context)

@login_required
def resolve_insight_view(request, insight_id):
    insight = get_object_or_404(Insight, id=insight_id, organization=request.user.organization)
    
    if request.method == 'POST':
        insight.is_resolved = True
        insight.resolved_by = request.user
        insight.resolved_at = timezone.now()
        insight.save()
        messages.success(request, 'Insight resolved successfully')
    
    return redirect('dashboard')
