import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Download, MessageSquare, FileText, Image, Video } from 'lucide-react'

export default function FileViewer() {
  const files = [
    {
      id: 1,
      name: 'logo-concepts-v1.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedDate: '2024-01-15',
      project: 'Brand Identity Package',
      version: 'v1.0',
      status: 'ready_for_review'
    },
    {
      id: 2,
      name: 'brand-guidelines.pdf',
      type: 'pdf',
      size: '5.1 MB',
      uploadedDate: '2024-01-14',
      project: 'Brand Identity Package',
      version: 'v2.1',
      status: 'approved'
    },
    {
      id: 3,
      name: 'social-templates.zip',
      type: 'archive',
      size: '12.3 MB',
      uploadedDate: '2024-01-13',
      project: 'Social Media Graphics',
      version: 'v1.2',
      status: 'ready_for_review'
    },
    {
      id: 4,
      name: 'website-mockup.jpg',
      type: 'image',
      size: '3.7 MB',
      uploadedDate: '2024-01-12',
      project: 'Website Redesign',
      version: 'v1.0',
      status: 'draft'
    }
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />
      case 'archive':
        return <FileText className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'ready_for_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">File Viewer</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{file.project}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">Version: {file.version}</span>
                      <span className="text-xs text-gray-500">Size: {file.size}</span>
                      <span className="text-xs text-gray-500">Uploaded: {file.uploadedDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                    {file.status.replace('_', ' ')}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload Guidelines</CardTitle>
          <CardDescription>
            Information about file types and upload limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported File Types</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Images: JPG, PNG, GIF, SVG (max 10MB)</li>
                <li>• Documents: PDF, DOC, DOCX (max 25MB)</li>
                <li>• Archives: ZIP, RAR (max 50MB)</li>
                <li>• Videos: MP4, MOV (max 100MB)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">File Status</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="text-green-600">Approved</span> - Ready for use</li>
                <li>• <span className="text-yellow-600">Ready for Review</span> - Awaiting your approval</li>
                <li>• <span className="text-gray-600">Draft</span> - Work in progress</li>
                <li>• <span className="text-red-600">Rejected</span> - Needs revision</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

