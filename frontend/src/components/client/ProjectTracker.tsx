import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock, CheckCircle, AlertCircle, Eye, MessageSquare } from 'lucide-react'

export default function ProjectTracker() {
  const projects = [
    {
      id: 1,
      title: 'Brand Identity Package',
      status: 'design',
      progress: 65,
      deadline: '2024-01-25',
      assignedTo: 'Sarah Johnson',
      description: 'Complete brand identity package including logo, color palette, and typography guidelines',
      steps: [
        { name: 'Initial Concepts', status: 'completed', date: '2024-01-10' },
        { name: 'Client Review', status: 'completed', date: '2024-01-12' },
        { name: 'Refinements', status: 'in_progress', date: '2024-01-15' },
        { name: 'Final Delivery', status: 'pending', date: '2024-01-25' }
      ]
    },
    {
      id: 2,
      title: 'Social Media Graphics',
      status: 'review',
      progress: 90,
      deadline: '2024-01-20',
      assignedTo: 'John Smith',
      description: 'Instagram post templates and story graphics for product launch',
      steps: [
        { name: 'Design Concepts', status: 'completed', date: '2024-01-08' },
        { name: 'Client Feedback', status: 'completed', date: '2024-01-12' },
        { name: 'Final Revisions', status: 'completed', date: '2024-01-15' },
        { name: 'Client Approval', status: 'in_progress', date: '2024-01-18' }
      ]
    },
    {
      id: 3,
      title: 'Website Redesign',
      status: 'inquiry',
      progress: 10,
      deadline: '2024-02-15',
      assignedTo: 'TBD',
      description: 'Complete website redesign with modern UI/UX principles',
      steps: [
        { name: 'Discovery Phase', status: 'in_progress', date: '2024-01-20' },
        { name: 'Wireframes', status: 'pending', date: '2024-01-30' },
        { name: 'Design Mockups', status: 'pending', date: '2024-02-05' },
        { name: 'Development', status: 'pending', date: '2024-02-10' }
      ]
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'review':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'design':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'inquiry':
        return <FileText className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      case 'design':
        return 'bg-blue-100 text-blue-800'
      case 'inquiry':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(project.status)}
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Progress</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Assigned to:</span>
                    <span className="text-gray-900">{project.assignedTo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deadline:</span>
                    <span className="text-gray-900">{project.deadline}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Project Steps</h4>
                  {project.steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {getStepStatusIcon(step.status)}
                      <span className={`flex-1 ${step.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {step.name}
                      </span>
                      <span className="text-xs text-gray-400">{step.date}</span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

