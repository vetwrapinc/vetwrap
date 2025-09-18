import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Plus, Edit, Trash2 } from 'lucide-react'

export default function WorkLog() {
  const workLogs = [
    {
      id: 1,
      task: 'Logo Design - Initial Concepts',
      description: 'Created 3 initial logo concepts for TechStart brand identity project',
      duration: 2.5,
      date: '2024-01-15',
      project: 'TechStart Brand Identity'
    },
    {
      id: 2,
      task: 'Client Meeting - Feedback Session',
      description: 'Presented concepts and gathered detailed feedback from client',
      duration: 1.0,
      date: '2024-01-15',
      project: 'TechStart Brand Identity'
    },
    {
      id: 3,
      task: 'Social Media Graphics',
      description: 'Designed 5 Instagram post templates for Fashion Brand',
      duration: 3.0,
      date: '2024-01-14',
      project: 'Fashion Brand Social Pack'
    }
  ]

  const totalHours = workLogs.reduce((sum, log) => sum + log.duration, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Work Log</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-bold text-gray-900">6.5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Entries</p>
                <p className="text-2xl font-bold text-gray-900">{workLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Work Logs</CardTitle>
          <CardDescription>
            Track your daily work activities and time spent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{log.task}</h4>
                    <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">{log.project}</span>
                      <span className="text-xs text-gray-500">{log.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{log.duration}h</p>
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

