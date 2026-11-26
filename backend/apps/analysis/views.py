import django.utils.timezone as tz
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse
from django_filters.rest_framework import DjangoFilterBackend

from .models import HealthAnalysis, HealthReport
from .serializers import HealthAnalysisListSerializer, HealthAnalysisDetailSerializer
from apps.media_uploads.models import MediaUpload
from ai_pipeline.pipeline import run_analysis


class RunAnalysisView(APIView):
    """POST /api/analysis/run/ { "upload_id": <id> }"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        upload_id = request.data.get('upload_id')
        if not upload_id:
            return Response({'error': 'upload_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            upload = MediaUpload.objects.get(pk=upload_id, user=request.user)
        except MediaUpload.DoesNotExist:
            return Response({'error': 'Upload not found.'}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(upload, 'analysis'):
            analysis = upload.analysis
            return Response(
                HealthAnalysisDetailSerializer(analysis, context={'request': request}).data
            )

        # Create analysis record and run pipeline
        analysis = HealthAnalysis.objects.create(
            upload=upload,
            status='processing',
            started_at=tz.now(),
        )
        try:
            result = run_analysis(upload)
            analysis.status = 'completed'
            analysis.mode = result['mode']
            analysis.overall_assessment = result['overall_assessment']
            analysis.completed_at = tz.now()
            analysis.save()

            from .models import AnalysisObservation
            for obs in result['observations']:
                AnalysisObservation.objects.create(analysis=analysis, **obs)

            report = HealthReport.objects.create(
                analysis=analysis,
                summary=result['summary'],
                recommendations=result['recommendations'],
                disclaimer=result['disclaimer'],
            )

            # Generate PDF
            from .pdf_generator import generate_pdf
            pdf_path = generate_pdf(analysis)
            if pdf_path:
                report.pdf_file = pdf_path
                report.save()

        except Exception as e:
            analysis.status = 'failed'
            analysis.error_message = str(e)
            analysis.completed_at = tz.now()
            analysis.save()
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            HealthAnalysisDetailSerializer(analysis, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AnalysisListView(generics.ListAPIView):
    """GET /api/analysis/"""
    serializer_class = HealthAnalysisListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'mode']

    def get_queryset(self):
        qs = HealthAnalysis.objects.filter(
            upload__user=self.request.user
        ).select_related('upload__pet__breed')
        pet_id = self.request.query_params.get('pet')
        if pet_id:
            qs = qs.filter(upload__pet_id=pet_id)
        return qs


class AnalysisDetailView(generics.RetrieveAPIView):
    """GET /api/analysis/{id}/"""
    serializer_class = HealthAnalysisDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HealthAnalysis.objects.filter(upload__user=self.request.user)


class DownloadReportPDFView(APIView):
    """GET /api/analysis/{id}/download-pdf/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            analysis = HealthAnalysis.objects.get(pk=pk, upload__user=request.user)
        except HealthAnalysis.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            report = analysis.report
        except HealthReport.DoesNotExist:
            return Response({'error': 'Report not generated yet.'}, status=status.HTTP_404_NOT_FOUND)

        if not report.pdf_file:
            # Re-generate
            from .pdf_generator import generate_pdf
            pdf_path = generate_pdf(analysis)
            if pdf_path:
                report.pdf_file = pdf_path
                report.save()
            else:
                return Response({'error': 'PDF generation failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = FileResponse(
            report.pdf_file.open('rb'),
            content_type='application/pdf',
        )
        response['Content-Disposition'] = f'attachment; filename="petsense_report_{analysis.pk}.pdf"'
        return response
