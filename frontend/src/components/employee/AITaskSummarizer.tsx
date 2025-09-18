import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, RefreshCw, Download, BarChart3, Clock, Target } from 'lucide-react'
import { api, apiEndpoints } from '@/lib/api'
import { TaskSummarizerRequest } from '@/types'
import toast from 'react-hot-toast'

export default function AITaskSummarizer() {
  const [workLogs, setWorkLogs] = useState([
    { task: 'Logo Design - Initial Concepts', duration: 2.5, description: 'Created 3 initial logo concepts for client', date: '2024-01-15' },
    { task: 'Brand Guidelines - Color Palette', duration: 1.5, description: 'Developed color palette and typography guidelines', date: '2024-01-15' },
    { task: 'Client Meeting - Feedback Session', duration: 1, description: 'Presented concepts and gathered client feedback', date: '2024-01-15' },
    { task: 'Social Media Graphics - Instagram Posts', duration: 3, description: 'Designed 5 Instagram post templates', date: '2024-01-14' },
    { task: 'Website Mockup - Homepage', duration: 4, description: 'Created homepage wireframe and visual mockup', date: '2024-01-14' },
  ])
  const [summary, setSummary] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [dateRange, setDateRange] = useState('This Week')
  const [includeInsights, setIncludeInsights] = useState(true)

  const generateSummary = async () => {
    setIsGenerating(true)
    try {
      const requestData: TaskSummarizerRequest = {
        work_logs: workLogs,
        date_range: dateRange,
        include_insights: includeInsights
      }

      const response = await api.post(apiEndpoints.ai.taskSummarizer, requestData)
      setSummary(response.data)
      toast.success('Task summary generated successfully!')
    } catch (error) {
      console.error('Failed to generate summary:', error)
      toast.error('Failed to generate summary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const addWorkLog = () => {
    setWorkLogs([...workLogs, {
      task: '',
      duration: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    }])
  }

  const updateWorkLog = (index: number, field: string, value: any) => {
    const updated = [...workLogs]
    updated[index] = { ...updated[index], [field]: value }
    setWorkLogs(updated)
  }

  const removeWorkLog = (index: number) => {
    setWorkLogs(workLogs.filter((_, i) => i !== index))
  }

  const totalHours = workLogs.reduce((sum, log) => sum + log.duration, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Work Log Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            AI Task Summarizer
          </CardTitle>
          <CardDescription>
            Log your work and get AI-powered insights and summaries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 7 Days">Last 7 Days</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeInsights"
                checked={includeInsights}
                onChange={(e) => setIncludeInsights(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="includeInsights" className="text-sm font-medium text-gray-700">
                Include AI Insights
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Work Logs</h3>
              <Button onClick={addWorkLog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {workLogs.map((log, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      placeholder="Task name"
                      value={log.task}
                      onChange={(e) => updateWorkLog(index, 'task', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Duration (hours)"
                      value={log.duration}
                      onChange={(e) => updateWorkLog(index, 'duration', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    value={log.description}
                    onChange={(e) => updateWorkLog(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    rows={2}
                  />
                  <div className="flex justify-between items-center">
                    <input
                      type="date"
                      value={log.date}
                      onChange={(e) => updateWorkLog(index, 'date', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={() => removeWorkLog(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Hours: {totalHours.toFixed(1)}</span>
                <span className="text-sm text-gray-500">{workLogs.length} entries</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={generateSummary} 
            disabled={isGenerating || workLogs.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate AI Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Summary</CardTitle>
          <CardDescription>
            Insights and analysis of your work patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-6">
              {/* Daily Summary */}
              {summary.daily_summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Daily Summary
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {summary.daily_summary}
                  </p>
                </div>
              )}

              {/* Time Breakdown */}
              {summary.time_breakdown && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Time Breakdown
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(summary.time_breakdown, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Productivity Insights */}
              {summary.productivity_insights && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Productivity Insights
                  </h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
                    {summary.productivity_insights}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {summary.recommendations && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-md">
                    {summary.recommendations}
                  </p>
                </div>
              )}

              {/* Next Priorities */}
              {summary.next_priorities && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Next Priorities</h4>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-md">
                    {summary.next_priorities}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const summaryText = JSON.stringify(summary, null, 2)
                    navigator.clipboard.writeText(summaryText)
                    toast.success('Summary copied to clipboard!')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Copy Summary
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Add work logs and click "Generate AI Summary" to get insights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

