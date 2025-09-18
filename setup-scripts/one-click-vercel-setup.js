// VetWraps Studios - One-Click Vercel Environment Setup
// Run this in your browser console on your Vercel project dashboard

console.log('🚀 VetWraps Studios - One-Click Vercel Setup');
console.log('This script will help you set up all environment variables quickly!');

// Environment variables template
const envVars = [
    {
        name: 'SUPABASE_URL',
        description: 'Your Supabase project URL',
        example: 'https://your-project-id.supabase.co',
        required: true
    },
    {
        name: 'SUPABASE_KEY',
        description: 'Your Supabase anon public key',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true
    },
    {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Your Supabase service role key',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true
    },
    {
        name: 'OPENAI_API_KEY',
        description: 'Your OpenAI API key',
        example: 'sk-...',
        required: true
    },
    {
        name: 'CLERK_SECRET_KEY',
        description: 'Your Clerk secret key',
        example: 'sk_test_...',
        required: true
    },
    {
        name: 'CLERK_PUBLISHABLE_KEY',
        description: 'Your Clerk publishable key',
        example: 'pk_test_...',
        required: true
    },
    {
        name: 'STRIPE_SECRET_KEY',
        description: 'Your Stripe secret key (optional)',
        example: 'sk_test_...',
        required: false
    },
    {
        name: 'STRIPE_PUBLISHABLE_KEY',
        description: 'Your Stripe publishable key (optional)',
        example: 'pk_test_...',
        required: false
    },
    {
        name: 'SENDGRID_API_KEY',
        description: 'Your SendGrid API key (optional)',
        example: 'SG...',
        required: false
    },
    {
        name: 'RESEND_API_KEY',
        description: 'Your Resend API key (optional)',
        example: 're_...',
        required: false
    },
    {
        name: 'DEBUG',
        description: 'Debug mode',
        example: 'False',
        required: true,
        defaultValue: 'False'
    },
    {
        name: 'ENVIRONMENT',
        description: 'Environment',
        example: 'production',
        required: true,
        defaultValue: 'production'
    }
];

console.log('\n📋 Environment Variables Checklist:');
console.log('Copy each value and paste it into Vercel → Settings → Environment Variables\n');

envVars.forEach((env, index) => {
    const status = env.required ? '🔴 REQUIRED' : '🟡 OPTIONAL';
    console.log(`${index + 1}. ${env.name} ${status}`);
    console.log(`   Description: ${env.description}`);
    console.log(`   Example: ${env.example}`);
    if (env.defaultValue) {
        console.log(`   Default Value: ${env.defaultValue}`);
    }
    console.log('');
});

console.log('🎯 Quick Setup Steps:');
console.log('1. Go to your Vercel project dashboard');
console.log('2. Click "Settings" → "Environment Variables"');
console.log('3. Click "Add New" for each variable above');
console.log('4. Copy the name and value for each variable');
console.log('5. Click "Save" after adding each one');

console.log('\n💡 Pro Tip: You can copy all the variable names at once:');
const varNames = envVars.map(env => env.name).join(', ');
console.log(varNames);

console.log('\n✅ After adding all variables:');
console.log('- Click "Redeploy" to apply changes');
console.log('- Test your deployment');
console.log('- Check function logs for any errors');

// Helper function to generate a quick copy-paste list
function generateQuickList() {
    console.log('\n📋 Quick Copy-Paste List:');
    console.log('Copy these lines and paste them one by one into Vercel:');
    console.log('');
    
    envVars.forEach(env => {
        const value = env.defaultValue || `your_${env.name.toLowerCase()}_here`;
        console.log(`${env.name}=${value}`);
    });
    
    console.log('\n💡 Replace the placeholder values with your actual API keys!');
}

// Uncomment the line below to generate the quick list
// generateQuickList();

console.log('\n🚀 Ready to deploy! Your VetWraps Studios platform will be live soon!');
