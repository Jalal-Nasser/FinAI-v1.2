from django.urls import path
from . import web_views

urlpatterns = [
    path('', web_views.dashboard_view, name='dashboard'),
    path('login/', web_views.login_view, name='login'),
    path('logout/', web_views.logout_view, name='logout'),
    path('documents/', web_views.documents_view, name='documents'),
    path('transactions/', web_views.transactions_view, name='transactions'),
    path('reports/', web_views.reports_list_view, name='reports_list'),
    path('analytics/', web_views.analytics_dashboard_view, name='analytics_dashboard'),
    path('insights/<uuid:insight_id>/resolve/', web_views.resolve_insight_view, name='resolve_insight'),
]
