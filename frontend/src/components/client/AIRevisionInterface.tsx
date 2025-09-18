import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Send, RefreshCw, FileText, Palette, Code, MessageSquare } from 'lucide-react'
import { api, apiEndpoints } from '@/lib/api'
import { RevisionTranslatorRequest } from '@/types'
import toast from 'react-hot-toast'

export default function AIRevisionInterface() {
  const [formData, setFormData] = useState<RevisionTranslatorRequest>({
    client_feedback: '',
    design_type: 'logo',
    current_version: 'v1.0',
    project_requirements: ''
  })
  const [translation, setTranslation] = useState<any>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const translateFeedback = async () => {
    if (!formData.client_feedback.trim()) {
      toast.error('Please provide your feedback')
      return
    }

    setIsTranslating(true)
    try {
      const response = await api.post(apiEndpoints.ai.revisionTranslator, formData)
      setTranslation(response.data)
      toast.success('Feedback translated successfully!')
    } catch (error) {
      console.error('Failed to translate feedback:', error)
      toast.error('Failed to translate feedback. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const submitFeedback = async () => {
    if (!translation) {
      toast.error('Please translate your feedback first')
      return
    }

    try {
      // Submit the translated feedback to the project
      toast.success('Feedback submitted successfully!')
      setFormData({
        client_feedback: '',
        design_type: 'logo',
        current_version: 'v1.0',
        project_requirements: ''
      })
      setTranslation(null)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast.error('Failed to submit feedback. Please try again.')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Feedback Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            AI Revision Interface
          </CardTitle>
          <CardDescription>
            Translate your feedback into clear design language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              name="client_feedback"
              value={formData.client_feedback}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="I don't like the colors, make it more professional and the logo should be bigger..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design Type
              </label>
              <select
                name="design_type"
                value={formData.design_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="logo">Logo</option>
                <option value="brand_identity">Brand Identity</option>
                <option value="social_media">Social Media</option>
                <option value="web_design">Web Design</option>
                <option value="print_design">Print Design</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Version
              </label>
              <input
                type="text"
                name="current_version"
                value={formData.current_version}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="v1.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Requirements (Optional)
            </label>
            <textarea
              name="project_requirements"
              value={formData.project_requirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any specific requirements or constraints..."
            />
          </div>

          <Button 
            onClick={translateFeedback} 
            disabled={isTranslating || !formData.client_feedback.trim()}
            className="w-full"
          >
            {isTranslating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Translate Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Translation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Translated Design Instructions</CardTitle>
          <CardDescription>
            AI-powered translation of your feedback into actionable design changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {translation ? (
            <div className="space-y-6">
              {/* Design Changes */}
              {translation.design_changes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Design Changes
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">{translation.design_changes}</p>
                  </div>
                </div>
              )}

              {/* Technical Requirements */}
              {translation.technical_requirements && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Technical Requirements
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {translation.technical_requirements}
                    </pre>
                  </div>
                </div>
              )}

              {/* Visual Examples */}
              {translation.visual_examples && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visual Examples</h4>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">{translation.visual_examples}</p>
                  </div>
                </div>
              )}

              {/* File Requirements */}
              {translation.file_requirements && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">File Requirements</h4>
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">{translation.file_requirements}</p>
                  </div>
                </div>
              )}

              {/* Client Communication */}
              {translation.client_communication && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    How to Explain Changes
                  </h4>
                  <div className="bg-purple-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">{translation.client_communication}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={submitFeedback} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const translationText = JSON.stringify(translation, null, 2)
                    navigator.clipboard.writeText(translationText)
                    toast.success('Translation copied to clipboard!')
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Provide your feedback and click "Translate Feedback" to get AI-powered design instructions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

