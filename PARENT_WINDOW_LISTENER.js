/**
 * Parent Window Message Listener
 * 
 * Add this code to your PARENT APPLICATION (the one hosting the chatbot iframe)
 * This handles messages sent from the chatbot iframe via postMessage API
 * 
 * IMPORTANT: This must be added to the parent window, NOT the chatbot iframe!
 */

// Listen for messages from the chatbot iframe
window.addEventListener('message', (event) => {
  // Security: Validate the origin in production
  // Uncomment and modify these lines for production:
  // const allowedOrigins = ['http://localhost:3002', 'https://stagingrchat.mytrip.ai'];
  // if (!allowedOrigins.includes(event.origin)) {
  //   console.warn('Rejected message from unauthorized origin:', event.origin);
  //   return;
  // }

  // Check if message is from our chatbot
  if (event.data && event.data.source === 'react-chatbotify' && event.data.type === 'CHATBOT_ACTION') {
    console.log('📨 Received chatbot action:', event.data.action);

    // Handle different actions
    switch (event.data.action) {
      case 'CLICK_HOME':
        console.log('🏠 Chatbot requested: Click Home');
        
        // Find and click the home link
        const homeLink = document.querySelector('a[href="/"]');
        if (homeLink) {
          homeLink.click();
          console.log('✅ Clicked home link');
        } else {
          console.warn('⚠️ Home link not found');
          // Fallback: navigate directly
          window.location.href = '/';
        }
        break;

      case 'NAVIGATE':
        console.log('🧭 Chatbot requested: Navigate to', event.data.path);
        
        // Navigate to the specified path
        if (event.data.path) {
          window.location.href = event.data.path;
          console.log('✅ Navigating to:', event.data.path);
        } else {
          console.warn('⚠️ No path specified for navigation');
        }
        break;

      default:
        console.warn('⚠️ Unknown chatbot action:', event.data.action);
    }
  }
});

console.log('✅ Chatbot message listener registered');
