// ReportPage - same as AnalysisResultsPage but reached via /report/:id
// This redirects to the analysis view for the report's linked analysis
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { analysisApi } from '../api/analysisApi'

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Report ID and Analysis ID are 1:1; just route to analysis view
    navigate(`/analysis/${id}`, { replace: true })
  }, [id, navigate])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
