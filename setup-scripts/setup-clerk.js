// VetWraps Studios - Clerk Configuration
// Run this in your browser console on your Clerk dashboard

console.log('🚀 VetWraps Studios - Clerk Setup Helper');
console.log('Follow these steps to configure Clerk for VetWraps Studios:');

console.log('\n1. 📧 Email & Phone Configuration:');
console.log('   - Go to: Configure → Email, Phone, Username');
console.log('   - Enable: Email address');
console.log('   - Enable: Username');
console.log('   - Disable: Phone number (unless needed)');

console.log('\n2. 👤 User Metadata Configuration:');
console.log('   - User metadata is managed programmatically (not in dashboard)');
console.log('   - We\'ll set up the role system in our backend code');
console.log('   - The app will automatically assign roles when users sign up');
console.log('   - Roles: admin, employee, client');

console.log('\n3. 🔐 Authentication Configuration:');
console.log('   - Go to: Configure → Email, Phone, Username');
console.log('   - Username settings are automatically configured');
console.log('   - Email verification: Enable (recommended)');
console.log('   - Password requirements: Use default settings');

console.log('\n4. 🎨 Appearance Configuration:');
console.log('   - Go to: Customize → Appearance');
console.log('   - Brand colors:');
console.log('     • Primary: #1e40af (blue-600)');
console.log('     • Secondary: #f59e0b (amber-500)');
console.log('   - Logo: Upload VetWraps Studios logo (optional)');
console.log('   - Theme: Choose "Light" or "Dark" (or both)');

console.log('\n5. 🔗 Redirect URLs:');
console.log('   - Go to: Configure → Paths');
console.log('   - Add these URLs (replace with your actual domain):');
console.log('     • Sign-in redirect: https://your-domain.vercel.app/dashboard');
console.log('     • Sign-up redirect: https://your-domain.vercel.app/dashboard');
console.log('     • After sign-out: https://your-domain.vercel.app/');

console.log('\n6. 🛡️ Security Configuration:');
console.log('   - Go to: Configure → Security');
console.log('   - Session timeout: 7 days (default is fine)');
console.log('   - Rate limiting: Enable (recommended)');
console.log('   - Multi-factor authentication: Optional');

console.log('\n7. 📊 Webhooks Configuration:');
console.log('   - Go to: Configure → Webhooks');
console.log('   - Add endpoint: https://your-domain.vercel.app/api/auth/webhook');
console.log('   - Select events:');
console.log('     • user.created');
console.log('     • user.updated');
console.log('     • user.deleted');
console.log('   - Copy the webhook secret for your environment variables');

console.log('\n8. 🔑 API Keys:');
console.log('   - Go to: Configure → API Keys');
console.log('   - Copy these values for your Vercel environment variables:');
console.log('     • Publishable key → CLERK_PUBLISHABLE_KEY');
console.log('     • Secret key → CLERK_SECRET_KEY');

console.log('\n✅ Clerk setup complete!');
console.log('Next: Set up your Vercel environment variables with the API keys above.');

// Helper function to generate environment variables
function generateEnvVars() {
    const publishableKey = prompt('Enter your Clerk Publishable Key:');
    const secretKey = prompt('Enter your Clerk Secret Key:');
    
    if (publishableKey && secretKey) {
        console.log('\n📋 Add these to your Vercel environment variables:');
        console.log(`CLERK_PUBLISHABLE_KEY=${publishableKey}`);
        console.log(`CLERK_SECRET_KEY=${secretKey}`);
    }
}

// Uncomment the line below to run the helper
// generateEnvVars();
