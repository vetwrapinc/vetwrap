import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Zap, Users, Shield, BarChart3, MessageSquare, FileText } from 'lucide-react'

export default function LandingPage() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VW</span>
          </div>
          <span className="text-white font-bold text-xl">VetWraps Studios</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-white hover:text-gray-300">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Get Started
                </Button>
              </SignUpButton>
            </>
          ) : (
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            AI-Enhanced
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Creative Agency
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Mission-ready design with veteran precision. Our AI-powered platform streamlines 
            creative workflows for agencies, employees, and clients.
          </p>
          
          {!isSignedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignUpButton>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Learn More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Three Powerful Dashboards
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Each role gets specialized AI-powered tools designed for their workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Admin Panel */}
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription className="text-gray-300">
                Complete agency management with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-blue-400 mr-2" />
                  AI Email Writer
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-400 mr-2" />
                  Quote Generator
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-400 mr-2" />
                  Performance Analytics
                </li>
                <li className="flex items-center">
                  <Users className="h-4 w-4 text-blue-400 mr-2" />
                  User Management
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Employee Panel */}
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Employee Panel</CardTitle>
              <CardDescription className="text-gray-300">
                AI-powered productivity tools for creatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-blue-400 mr-2" />
                  AI Design Assistant
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-400 mr-2" />
                  Task Summarizer
                </li>
                <li className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-blue-400 mr-2" />
                  Feedback Resolver
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-400 mr-2" />
                  Work Log Analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Client Panel */}
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-2xl">Client Panel</CardTitle>
              <CardDescription className="text-gray-300">
                Seamless project collaboration and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-blue-400 mr-2" />
                  AI Revision Interface
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-400 mr-2" />
                  Quote Viewer
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-400 mr-2" />
                  Project Tracker
                </li>
                <li className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-blue-400 mr-2" />
                  Chatbot Concierge
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Transform Your Creative Workflow?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join the future of AI-enhanced creative agency management
        </p>
        
        {!isSignedIn && (
          <SignUpButton mode="modal">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignUpButton>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2024 VetWraps Studios. Mission-ready design with veteran precision.
          </p>
        </div>
      </footer>
    </div>
  )
}

