import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, Clock, AlertCircle, Plus } from 'lucide-react'

export default function TaskBoard() {
  const tasks = [
    {
      id: 1,
      title: 'Logo Design - Initial Concepts',
      description: 'Create 3 initial logo concepts for TechStart',
      status: 'todo',
      priority: 'high',
      dueDate: '2024-01-20',
      project: 'TechStart Brand Identity'
    },
    {
      id: 2,
      title: 'Client Feedback Review',
      description: 'Review and implement client feedback on logo designs',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-01-18',
      project: 'TechStart Brand Identity'
    },
    {
      id: 3,
      title: 'Social Media Graphics',
      description: 'Design Instagram post templates for Fashion Brand',
      status: 'done',
      priority: 'low',
      dueDate: '2024-01-15',
      project: 'Fashion Brand Social Pack'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckSquare className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'todo':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'todo':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    { id: 'todo', title: 'To Do', tasks: tasks.filter(task => task.status === 'todo') },
    { id: 'in_progress', title: 'In Progress', tasks: tasks.filter(task => task.status === 'in_progress') },
    { id: 'done', title: 'Done', tasks: tasks.filter(task => task.status === 'done') }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <Card key={column.id} className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(column.id)}
                <span className="ml-2">{column.title}</span>
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {column.tasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {column.tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">{task.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{task.project}</span>
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tasks in this column</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

