import openai
from typing import Dict, Any, Optional
from config.settings import get_settings
import json
import logging

settings = get_settings()
client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

logger = logging.getLogger(__name__)

class AIClient:
    def __init__(self):
        self.client = client
        self.model = "gpt-4-turbo-preview"
    
    async def generate_email(
        self, 
        recipient_name: str,
        recipient_email: str,
        email_type: str,
        project_context: Optional[str] = None,
        tone: str = "professional",
        additional_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI-powered email content"""
        try:
            system_prompt = f"""You are a professional email writer for VetWraps Studios, a veteran-owned creative agency. 
            Generate a {email_type} email that is {tone} and professional.
            
            Context: {project_context or 'No specific project context'}
            Additional notes: {additional_notes or 'None'}
            
            Return a JSON response with:
            - subject: Email subject line
            - body: Email body (HTML formatted)
            - plain_text: Plain text version
            - suggested_follow_up: Optional follow-up action
            """
            
            user_prompt = f"Write a {email_type} email to {recipient_name} ({recipient_email})"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error generating email: {e}")
            raise
    
    async def generate_quote(
        self,
        project_brief: str,
        project_type: str,
        complexity_level: str = "medium",
        timeline: str = "standard",
        client_budget_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI-powered project quote with pricing breakdown"""
        try:
            system_prompt = f"""You are a pricing expert for VetWraps Studios. Generate a detailed quote for a {project_type} project.
            
            Project Brief: {project_brief}
            Complexity: {complexity_level}
            Timeline: {timeline}
            Budget Range: {client_budget_range or 'Not specified'}
            
            Return a JSON response with:
            - base_price: Base project price
            - breakdown: Array of line items with description, hours, rate, total
            - upsells: Array of suggested add-ons with prices
            - timeline: Estimated delivery timeline
            - payment_terms: Payment structure
            - total_price: Final total price
            """
            
            user_prompt = f"Create a quote for this {project_type} project: {project_brief}"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error generating quote: {e}")
            raise
    
    async def summarize_tasks(
        self,
        work_logs: list,
        date_range: str,
        include_insights: bool = True
    ) -> Dict[str, Any]:
        """Generate AI-powered task summaries and insights"""
        try:
            system_prompt = f"""You are a project management AI assistant. Analyze work logs and generate summaries.
            
            Date Range: {date_range}
            Include Insights: {include_insights}
            
            Return a JSON response with:
            - daily_summary: Summary of work completed
            - time_breakdown: Time spent on different activities
            - productivity_insights: Key insights about work patterns
            - recommendations: Suggestions for improvement
            - next_priorities: Recommended next tasks
            """
            
            user_prompt = f"Analyze these work logs: {json.dumps(work_logs)}"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error summarizing tasks: {e}")
            raise
    
    async def resolve_feedback(
        self,
        client_feedback: str,
        project_context: str,
        current_design_stage: str
    ) -> Dict[str, Any]:
        """Convert vague client feedback into clear, actionable tasks"""
        try:
            system_prompt = f"""You are a design project manager. Convert vague client feedback into specific, actionable tasks.
            
            Project Context: {project_context}
            Current Stage: {current_design_stage}
            
            Return a JSON response with:
            - interpreted_feedback: Clear interpretation of what client wants
            - specific_tasks: Array of actionable tasks with priorities
            - design_direction: Suggested design direction
            - questions_for_client: Questions to clarify requirements
            - estimated_effort: Time estimate for each task
            """
            
            user_prompt = f"Client feedback: {client_feedback}"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=800
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error resolving feedback: {e}")
            raise
    
    async def translate_revision(
        self,
        client_feedback: str,
        design_type: str,
        current_version: str,
        project_requirements: Optional[str] = None
    ) -> Dict[str, Any]:
        """Translate client feedback into design language and specific changes"""
        try:
            system_prompt = f"""You are a design translator. Convert client feedback into specific design changes.
            
            Design Type: {design_type}
            Current Version: {current_version}
            Project Requirements: {project_requirements or 'Not specified'}
            
            Return a JSON response with:
            - design_changes: Specific design modifications needed
            - technical_requirements: Technical specifications
            - visual_examples: Description of visual changes
            - file_requirements: What files need to be updated
            - client_communication: How to explain changes to client
            """
            
            user_prompt = f"Client feedback: {client_feedback}"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.6,
                max_tokens=800
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error translating revision: {e}")
            raise

# Global AI client instance
ai_client = AIClient()
