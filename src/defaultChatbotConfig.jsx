import { Button } from './constants/Button';

const defaultChatbotConfig = {
    message: "Hello! This is a generic chatbot",
    settings: {
        botBubble: {
            showAvatar: true,
            avatar: 'https://mytrip.ai/wp-content/uploads/2023/02/square400logomytripai.png',
            simStream: false,
            streamSpeed: 20,
            dangerouslySetInnerHtml: true
        },
        chatButton: {
            icon: 'https://mytrip.ai/wp-content/uploads/2023/02/square400logomytripai.png'
        },
        chatWindow: {
            showScrollbar:true,
            autoJumpToBottom:false,
            showMessagePrompt: true,
            messagePromptText: "New Messages ↓",
            defaultOpen:true,
        },
        chatHistory: {
            disabled: true,
            maxEntries: 100,
            storageKey: 'rcb-history', // The key to use for storing chat history. Can be ignored if you only have a single instance of the chatbot on your website. Otherwise, if multiple chatbots share the same storage key, their chat history will overlap.
            storageType: 'LOCAL_STORAGE',
            viewChatHistoryButtonText: 'See Previous Messages',
            chatHistoryLineBreakText: '----- Previous Chat History -----',
            autoLoad: true
        },
        chatInput: {
            disabled: false,
            allowNewline: true,
            enabledPlaceholderText: 'Type your message...',
            showCharacterCount: false,
            characterLimit: -1,
            botDelay: 0,
            // sendButtonIcon: 'https://static-00.iconduck.com/assets.00/send-icon-1024x997-8nyscgy3.png',
            blockSpam: true,	// Blocks input while bot is processing message
            buttons: [Button.SEND_MESSAGE_BUTTON]
        },
        device: {
            desktopEnabled: true,
            mobileEnabled: true,
            applyMobileOptimizations: false		// With this as False, it's possible to see it in mobile
        },
        footer: {
            text: <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#666' }}>
            <img 
                src="https://mytrip.ai/wp-content/uploads/2024/02/mytripailogoheadround20x20.png" 
                alt="MyTrip.ai logo" 
                style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '50%' }}
            />
            <span>Powered by MyTrip.ai</span>
            </div>,
            buttons: []
        },
        general: {
            primaryColor: '#030842',
            secondaryColor: '#030842',
            fontFamily: 'sans-serif',
            showHeader: true,
            showFooter: true,
            embedded: false,
            flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
        },
        header: {
            title: <div style={{ cursor: 'pointer', margin: '0px', fontSize: '20px', fontWeight: 'bold' }}>Default Setting AI</div>,
            showAvatar: true,
            avatar: 'https://mytrip.ai/wp-content/uploads/2023/02/square400logomytripai.png',
            buttons: [Button.CLOSE_CHAT_BUTTON]

        },
        notification: {
            volume: 1,
            showCount: true
        },
        tooltip:{
            mode: 'NEVER',
        },
        userBubble: {
            animate: true,
            showAvatar: true,
            avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
            simStream: false
        },
    }
};
  
export default defaultChatbotConfig;