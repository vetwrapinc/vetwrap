import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Send, Copy, RefreshCw } from 'lucide-react'
import { api, apiEndpoints } from '@/lib/api'
import { EmailWriterRequest } from '@/types'
import toast from 'react-hot-toast'

export default function AIEmailWriter() {
  const [formData, setFormData] = useState<EmailWriterRequest>({
    recipient_name: '',
    recipient_email: '',
    email_type: 'update',
    project_context: '',
    tone: 'professional',
    additional_notes: ''
  })
  const [generatedEmail, setGeneratedEmail] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateEmail = async () => {
    if (!formData.recipient_name || !formData.recipient_email) {
      toast.error('Please fill in recipient name and email')
      return
    }

    setIsGenerating(true)
    try {
      const response = await api.post(apiEndpoints.ai.emailWriter, formData)
      setGeneratedEmail(response.data)
      toast.success('Email generated successfully!')
    } catch (error) {
      console.error('Failed to generate email:', error)
      toast.error('Failed to generate email. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            AI Email Writer
          </CardTitle>
          <CardDescription>
            Generate professional emails with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name
              </label>
              <input
                type="text"
                name="recipient_name"
                value={formData.recipient_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                name="recipient_email"
                value={formData.recipient_email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Type
            </label>
            <select
              name="email_type"
              value={formData.email_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="update">Project Update</option>
              <option value="quote">Quote Request</option>
              <option value="follow_up">Follow Up</option>
              <option value="proposal">Proposal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="urgent">Urgent</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Context
            </label>
            <textarea
              name="project_context"
              value={formData.project_context}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the project or context..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific requirements or notes..."
            />
          </div>

          <Button 
            onClick={generateEmail} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Email */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Email</CardTitle>
          <CardDescription>
            AI-generated email content ready to send
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedEmail ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generatedEmail.subject || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedEmail.subject || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body (HTML)
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: generatedEmail.body || '' }} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => copyToClipboard(generatedEmail.body || '')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
              </div>

              {generatedEmail.plain_text && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plain Text Version
                  </label>
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{generatedEmail.plain_text}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(generatedEmail.plain_text || '')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Plain Text
                  </Button>
                </div>
              )}

              {generatedEmail.suggested_follow_up && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Suggested Follow-up</h4>
                  <p className="text-sm text-blue-700">{generatedEmail.suggested_follow_up}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Fill in the form and click "Generate Email" to create AI-powered content</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

