"""
Analysis pipeline orchestrator.

This module decides which analyzer to use and runs the analysis.
To plug in a real model:
  1. Implement BaseAnalyzer in a new module.
  2. Import and instantiate it here instead of DemoAnalyzer.
"""
import os
from .demo_analyzer import DemoAnalyzer

# Active analyzer instance — swap this to use a real model
_ANALYZER = DemoAnalyzer()


def run_analysis(upload) -> dict:
    """
    Run health analysis on a MediaUpload instance.

    Args:
        upload: MediaUpload model instance with .file, .media_type, .pet attributes.

    Returns:
        dict with keys: mode, overall_assessment, observations (list of dicts),
                        summary, recommendations, disclaimer
    """
    file_path = upload.file.path
    media_type = upload.media_type  # 'image' | 'video'
    breed_slug = upload.pet.breed.slug if upload.pet.breed else 'unknown'

    # For videos, extract first frame and analyse that
    if media_type == 'video':
        file_path = _extract_video_frame(file_path)

    result = _ANALYZER.analyze(file_path, media_type, breed_slug)

    # Convert dataclasses to plain dicts for the view layer
    return {
        'mode': result.mode,
        'overall_assessment': result.overall_assessment,
        'observations': [
            {
                'category': obs.category,
                'title': obs.title,
                'description': obs.description,
                'severity': obs.severity,
                'recommendation': obs.recommendation,
                'confidence': obs.confidence,
            }
            for obs in result.observations
        ],
        'summary': result.summary,
        'recommendations': result.recommendations,
        'disclaimer': result.disclaimer,
    }


def _extract_video_frame(video_path: str) -> str:
    """
    Extract the first usable frame from a video file for analysis.
    Returns the path to a temporary JPEG frame.
    Falls back to the original path on failure.
    """
    frame_path = video_path + '_frame.jpg'
    if os.path.exists(frame_path):
        return frame_path
    try:
        import cv2
        cap = cv2.VideoCapture(video_path)
        # Skip to 1 second in if possible
        fps = cap.get(cv2.CAP_PROP_FPS) or 24
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(fps))
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            success, frame = cap.read()
        cap.release()
        if success and frame is not None:
            cv2.imwrite(frame_path, frame)
            return frame_path
    except Exception:
        pass
    return video_path
