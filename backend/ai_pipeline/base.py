"""
Abstract base interface for all Pet Sense health analyzers.

To integrate a real model:
1. Create a subclass of BaseAnalyzer.
2. Implement preprocess(), analyze(), and get_mode().
3. Update ai_pipeline/pipeline.py to use your subclass.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Observation:
    """Represents a single visual observation from the analysis."""
    category: str           # Must be one of AnalysisObservation.CATEGORY_CHOICES keys
    title: str
    description: str
    severity: str           # normal | watch | concern | urgent
    recommendation: str = ''
    confidence: Optional[float] = None  # Only set by calibrated models


@dataclass
class AnalysisResult:
    """Full result returned by an analyzer."""
    mode: str               # 'demo' | 'model_v1' etc.
    overall_assessment: str
    observations: List[Observation] = field(default_factory=list)
    summary: str = ''
    recommendations: str = ''
    disclaimer: str = ''


class BaseAnalyzer(ABC):
    """Abstract analyzer — all concrete analyzers must implement this interface."""

    @abstractmethod
    def get_mode(self) -> str:
        """Return a short mode identifier string (e.g. 'demo', 'model_v1')."""

    @abstractmethod
    def analyze(self, file_path: str, media_type: str, breed_slug: str) -> AnalysisResult:
        """
        Run analysis on the given file.

        Args:
            file_path:  Absolute path to the uploaded file.
            media_type: 'image' or 'video'.
            breed_slug: Breed identifier from the Breed model.

        Returns:
            AnalysisResult with observations and assessment.
        """
