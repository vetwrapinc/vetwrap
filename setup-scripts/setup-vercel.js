// VetWraps Studios - Vercel Setup Helper
// Run this in your browser console on your Vercel dashboard

console.log('🚀 VetWraps Studios - Vercel Setup Helper');
console.log('Follow these steps to configure Vercel for VetWraps Studios:');

console.log('\n1. 📁 Project Configuration:');
console.log('   - Framework Preset: Vite');
console.log('   - Root Directory: frontend');
console.log('   - Build Command: npm run build');
console.log('   - Output Directory: dist');
console.log('   - Install Command: npm install --prefix frontend && pip install -r backend/requirements.txt');

console.log('\n2. 🔧 Environment Variables:');
console.log('   - Go to: Settings → Environment Variables');
console.log('   - Add these variables (replace with your actual values):');

const envVars = [
    { name: 'SUPABASE_URL', description: 'Your Supabase project URL' },
    { name: 'SUPABASE_KEY', description: 'Your Supabase anon public key' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Your Supabase service role key' },
    { name: 'OPENAI_API_KEY', description: 'Your OpenAI API key' },
    { name: 'CLERK_SECRET_KEY', description: 'Your Clerk secret key' },
    { name: 'CLERK_PUBLISHABLE_KEY', description: 'Your Clerk publishable key' },
    { name: 'STRIPE_SECRET_KEY', description: 'Your Stripe secret key (optional)' },
    { name: 'STRIPE_PUBLISHABLE_KEY', description: 'Your Stripe publishable key (optional)' },
    { name: 'SENDGRID_API_KEY', description: 'Your SendGrid API key (optional)' },
    { name: 'RESEND_API_KEY', description: 'Your Resend API key (optional)' },
    { name: 'DEBUG', value: 'False', description: 'Debug mode (set to False for production)' },
    { name: 'ENVIRONMENT', value: 'production', description: 'Environment (set to production)' }
];

envVars.forEach((env, index) => {
    console.log(`   ${index + 1}. ${env.name}`);
    console.log(`      Description: ${env.description}`);
    if (env.value) {
        console.log(`      Value: ${env.value}`);
    } else {
        console.log(`      Value: [Enter your ${env.name} here]`);
    }
    console.log('');
});

console.log('\n3. 🌐 Domain Configuration:');
console.log('   - Go to: Settings → Domains');
console.log('   - Add your custom domain (optional)');
console.log('   - Vercel will provide a default domain: your-project.vercel.app');

console.log('\n4. 🔄 Build Settings:');
console.log('   - Go to: Settings → General');
console.log('   - Node.js Version: 18.x (recommended)');
console.log('   - Python Version: 3.9 (for serverless functions)');

console.log('\n5. 📊 Analytics:');
console.log('   - Go to: Analytics');
console.log('   - Enable Vercel Analytics (free tier)');
console.log('   - Enable Web Vitals monitoring');

console.log('\n6. 🚀 Deployment:');
console.log('   - Click "Deploy" button');
console.log('   - Wait for build to complete');
console.log('   - Test your deployment');

console.log('\n7. 🔍 Post-Deployment Testing:');
console.log('   - Visit your deployed URL');
console.log('   - Test Clerk authentication');
console.log('   - Test AI features');
console.log('   - Check database connections');

console.log('\n✅ Vercel setup complete!');
console.log('Your VetWraps Studios platform should now be live! 🎉');

// Helper function to generate environment variables
function generateEnvVars() {
    console.log('\n📋 Copy and paste these into Vercel Environment Variables:');
    console.log('(Replace the placeholder values with your actual API keys)');
    console.log('');
    
    envVars.forEach(env => {
        const value = env.value || `your_${env.name.toLowerCase()}`;
        console.log(`${env.name}=${value}`);
    });
    
    console.log('\n💡 Tip: You can copy all of these at once and paste them into Vercel!');
}

// Uncomment the line below to run the helper
// generateEnvVars();
