"""
PDF report generator for Pet Sense health analysis reports.
Uses ReportLab to produce professional PDF documents.
"""
import os
from datetime import datetime
from django.conf import settings


def generate_pdf(analysis) -> str | None:
    """
    Generate a PDF report for a HealthAnalysis instance.

    Args:
        analysis: HealthAnalysis model instance (with related report and observations).

    Returns:
        Relative path within MEDIA_ROOT suitable for saving to report.pdf_file,
        or None if generation fails.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
            HRFlowable,
        )

        pet = analysis.upload.pet
        breed_name = pet.breed.name if pet.breed else 'Unknown breed'

        # Build output path
        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'reports', 'pdf')
        os.makedirs(pdf_dir, exist_ok=True)
        filename = f'petsense_report_{analysis.pk}.pdf'
        pdf_path = os.path.join(pdf_dir, filename)
        relative_path = os.path.join('reports', 'pdf', filename)

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = getSampleStyleSheet()
        teal = colors.HexColor('#0d9488')
        dark = colors.HexColor('#134e4a')
        warn = colors.HexColor('#f59e0b')

        title_style = ParagraphStyle('Title', parent=styles['Title'],
                                     textColor=dark, fontSize=22, spaceAfter=4)
        h2_style = ParagraphStyle('H2', parent=styles['Heading2'],
                                  textColor=teal, fontSize=13, spaceAfter=4)
        body_style = ParagraphStyle('Body', parent=styles['Normal'],
                                    fontSize=10, spaceAfter=4, leading=14)
        warn_style = ParagraphStyle('Warn', parent=styles['Normal'],
                                    fontSize=9, textColor=colors.HexColor('#92400e'),
                                    backColor=colors.HexColor('#fef3c7'),
                                    borderPad=6, spaceAfter=8, leading=13)
        label_style = ParagraphStyle('Label', parent=styles['Normal'],
                                     fontSize=9, textColor=colors.grey)

        story = []

        # Header
        story.append(Paragraph('Pet Sense', title_style))
        story.append(Paragraph('Preliminary Health Observation Report', h2_style))
        story.append(HRFlowable(width='100%', thickness=1, color=teal))
        story.append(Spacer(1, 0.3 * cm))

        # Disclaimer banner
        try:
            disclaimer_text = analysis.report.disclaimer
        except Exception:
            disclaimer_text = (
                'Veterinary Health Analysis Report — This report contains preliminary observations only. '
                'It is NOT a veterinary diagnosis. Always consult a qualified veterinarian.'
            )
        story.append(Paragraph(disclaimer_text, warn_style))

        # Pet & analysis metadata
        story.append(Paragraph('Report Details', h2_style))
        mode_label = 'Standard' if analysis.mode in ('demo', 'standard') else analysis.mode.title()
        meta_data = [
            ['Pet Name', pet.name, 'Breed', breed_name],
            ['Gender', pet.get_gender_display(), 'Weight', f'{pet.weight_kg} kg' if pet.weight_kg else '—'],
            ['Analysis Date', analysis.created_at.strftime('%Y-%m-%d %H:%M UTC'), 'Mode', mode_label.upper()],
            ['Report ID', f'#{analysis.pk}', 'Status', analysis.status.title()],
        ]
        tbl = Table(meta_data, colWidths=[3.5 * cm, 5 * cm, 3.5 * cm, 5 * cm])
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0fdfa')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f0fdfa')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 0.4 * cm))

        # Overall assessment
        story.append(Paragraph('Overall Assessment', h2_style))
        story.append(Paragraph(analysis.overall_assessment or '—', body_style))
        story.append(Spacer(1, 0.3 * cm))

        # Observations
        story.append(Paragraph('Observations', h2_style))
        severity_colors = {
            'normal': colors.HexColor('#16a34a'),
            'watch': colors.HexColor('#ca8a04'),
            'concern': colors.HexColor('#ea580c'),
            'urgent': colors.HexColor('#dc2626'),
        }
        for obs in analysis.observations.all():
            sev_color = severity_colors.get(obs.severity, colors.grey)
            # Convert HexColor to CSS hex string (hexval returns '0x...' prefix form)
            hex_str = f'#{int(sev_color.hexval(), 16):06x}'
            story.append(Paragraph(
                f'<b>{obs.get_category_display()}</b> — {obs.title} '
                f'<font color="{hex_str}">[{obs.severity.upper()}]</font>',
                ParagraphStyle('ObsTitle', parent=styles['Normal'], fontSize=11,
                               textColor=dark, spaceAfter=2),
            ))
            story.append(Paragraph(obs.description, body_style))
            if obs.recommendation:
                story.append(Paragraph(f'<i>Recommendation: {obs.recommendation}</i>', label_style))
            story.append(Spacer(1, 0.2 * cm))

        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.lightgrey))
        story.append(Spacer(1, 0.3 * cm))

        # Recommendations
        try:
            recs = analysis.report.recommendations
        except Exception:
            recs = ''
        if recs:
            story.append(Paragraph('Recommendations', h2_style))
            for line in recs.split('\n'):
                if line.strip():
                    story.append(Paragraph(line.strip(), body_style))
            story.append(Spacer(1, 0.3 * cm))

        # Footer disclaimer
        story.append(HRFlowable(width='100%', thickness=1, color=teal))
        story.append(Spacer(1, 0.2 * cm))
        story.append(Paragraph(
            f'Generated by Pet Sense on {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}. '
            'This document is for informational purposes only and does not constitute '
            'veterinary advice or a medical diagnosis.',
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey),
        ))

        doc.build(story)
        return relative_path

    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f'PDF generation failed: {e}')
        return None
