-- VetWraps Studios Database Setup
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee', 'client')),
    company VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'design', 'review', 'delivered', 'completed')),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    budget DECIMAL(10,2),
    timeline_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    version VARCHAR(10) DEFAULT 'v1',
    is_final BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_feedback table
CREATE TABLE IF NOT EXISTS project_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feedback_text TEXT NOT NULL,
    feedback_type VARCHAR(50) DEFAULT 'general',
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_logs table
CREATE TABLE IF NOT EXISTS work_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    hours_worked DECIMAL(4,2) NOT NULL,
    work_description TEXT,
    date_worked DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_requests table
CREATE TABLE IF NOT EXISTS ai_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    tokens_used INTEGER,
    cost DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_employee_id ON projects(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_employee_id ON work_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_project_id ON work_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Create RLS policies for projects
CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.clerk_id = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Employees can view assigned projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.clerk_id = auth.uid()::text 
            AND users.id = projects.assigned_employee_id
        )
    );

CREATE POLICY "Clients can view their projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.clerk_id = auth.uid()::text 
            AND users.id = projects.client_id
        )
    );

-- Create RLS policies for project_files
CREATE POLICY "Project files access based on project access" ON project_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_files.project_id
            AND (
                projects.client_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
                OR projects.assigned_employee_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
                OR EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.clerk_id = auth.uid()::text 
                    AND users.role = 'admin'
                )
            )
        )
    );

-- Create RLS policies for project_feedback
CREATE POLICY "Feedback access based on project access" ON project_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_feedback.project_id
            AND (
                projects.client_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
                OR projects.assigned_employee_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
                OR EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.clerk_id = auth.uid()::text 
                    AND users.role = 'admin'
                )
            )
        )
    );

-- Create RLS policies for work_logs
CREATE POLICY "Employees can view their own work logs" ON work_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.clerk_id = auth.uid()::text 
            AND users.id = work_logs.employee_id
        )
    );

CREATE POLICY "Admins can view all work logs" ON work_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.clerk_id = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Create RLS policies for ai_requests
CREATE POLICY "Users can view their own AI requests" ON ai_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.clerk_id = auth.uid()::text 
            AND users.id = ai_requests.user_id
        )
    );

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (you'll need to update this with your actual Clerk ID)
-- First, get your Clerk user ID from the Clerk dashboard, then run:
-- INSERT INTO users (clerk_id, email, first_name, last_name, role, company)
-- VALUES ('your_clerk_user_id', 'your_email@example.com', 'Your', 'Name', 'admin', 'VetWraps Studios');

-- Success message
SELECT 'Database setup completed successfully! 🎉' as message;
