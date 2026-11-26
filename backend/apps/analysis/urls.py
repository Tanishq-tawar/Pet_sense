from django.urls import path
from .views import RunAnalysisView, AnalysisListView, AnalysisDetailView, DownloadReportPDFView

urlpatterns = [
    path('', AnalysisListView.as_view(), name='analysis-list'),
    path('run/', RunAnalysisView.as_view(), name='analysis-run'),
    path('<int:pk>/', AnalysisDetailView.as_view(), name='analysis-detail'),
    path('<int:pk>/download-pdf/', DownloadReportPDFView.as_view(), name='analysis-download-pdf'),
]
