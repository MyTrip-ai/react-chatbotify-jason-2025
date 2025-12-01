import { Button } from './constants/Button';

const chatbotConfig = {
    coastlinetravel: {
        message: "Hi, I'm the Coastline Travel AI Assistant. Can I help you find contacts for exquisite lodging and journeys from our top-shelf providers? Where would your clients like to go?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://travelpro365.com/Images/LandingPage/TravelPro365Favicon.png',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
                chatButton: {
                icon: 'https://travelpro365.com/Images/LandingPage/TravelPro365Favicon.png'
            },
                chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#c16663',
                secondaryColor: '#c16663',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Travel Pro 365",
                showAvatar: true,
                avatar: 'https://travelpro365.com/Images/LandingPage/TravelPro365Favicon.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Find a provider with our AI Assistant!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    amalia: {
        message: "Hello there! I'm Amalia, your travel assistant. How can I help you plan your next unforgettable trip?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/03/amalia.webp',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png'
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
                primaryColor: '#11012f',
                secondaryColor: '#11012f',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Amalia",
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to plan your trip? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    assistant: {
        message: "Hello! I'm the MyTrip.AI Assistant Designer. May I know your name? Also, are you here to design an AI assistant for your travel company, or are you planning a trip?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png'
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
                primaryColor: '#11012f',
                secondaryColor: '#11012f',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "MyTrip.AI Assistant Designer",
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Let\'s build your AI Agent!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    antarctica: {
        message: "Hello there! I'm Sir Ernest Shackleton, your trusty travel agent for all things Antarctic. Can I help you plan an unforgettable trip to Antarctica?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://tiledesk.mytrip.ai/api/images?path=uploads/users/6759bb324915510012d06780/images/photo.jpg',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://antarcticacruise.au/wp-content/uploads/2024/08/cropped-Pinguin-Logo-32x32.png'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#11012f',
                secondaryColor: '#11012f',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Antarctica Cruise",
                showAvatar: true,
                avatar: 'https://antarcticacruise.au/wp-content/uploads/2024/08/cropped-Pinguin-Logo-32x32.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to plan your trip? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    luxurycruisecollection: {
        message: "Hi there! I'm your friendly travel agent assistant from Luxury Cruise Collection. What's your name, and are you interested in planning a luxury cruise today?",
        settings: {
            botBubble: {
                showAvatar: false,
                avatar: 'https://tiledesk.mytrip.ai/api/images?path=uploads/users/6759bb324915510012d06780/images/photo.jpg',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                // icon: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtransparent.png'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#827655',
                secondaryColor: '#827655',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Luxury Cruise Collection",
                showAvatar: false,
                avatar: 'https://antarcticacruise.au/wp-content/uploads/2024/08/cropped-Pinguin-Logo-32x32.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to plan your trip? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    southamericatours: {
        message: "Hi there! I'm your friendly travel agent assistant from Luxury Cruise Collection. What's your name, and are you interested in planning a luxury cruise today?",
        settings: {
            botBubble: {
                showAvatar: false,
                avatar: 'https://tiledesk.mytrip.ai/api/images?path=uploads/users/6759bb324915510012d06780/images/photo.jpg',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                // icon: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtransparent.png'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#827655',
                secondaryColor: '#827655',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Luxury Cruise Collection",
                showAvatar: false,
                avatar: 'https://antarcticacruise.au/wp-content/uploads/2024/08/cropped-Pinguin-Logo-32x32.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to plan your trip? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    chatdarwin: {
        message: "Hello! I'm Charles Darwin, your guide to unforgettable travel experiences. What's your name, traveler?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/darwin_assistant.png',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://mytrip.ai/wp-content/uploads/2024/02/ai-assistant-darwinesp.png'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#11012f',
                secondaryColor: '#11012f',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Chat Darwin",
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/ai-assistant-darwin.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to plan your trip? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    latinexcursions: {
        message: "Hello! Welcome to Latin Excursions. My name is your AI travel assistant, and I'm here to help you plan your next amazing trip to Latin America. May I know your name to get started?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3CfZ1I7P0TDXyNccbkGIu7-SIl_eC9u3JCA&s',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3CfZ1I7P0TDXyNccbkGIu7-SIl_eC9u3JCA&s'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#d84775',
                secondaryColor: '#d84775',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Latin Excursions",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3CfZ1I7P0TDXyNccbkGIu7-SIl_eC9u3JCA&s',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to plan your trip? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    widgety: {
        message: "Welcome to Widgety! How can I assist you with your cruise plans today?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7zejO53FmvAoMkRob5p7yeHRp5M0d_e8DZQ&s',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7zejO53FmvAoMkRob5p7yeHRp5M0d_e8DZQ&s'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#000000',
                secondaryColor: '#000000',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Widgety",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7zejO53FmvAoMkRob5p7yeHRp5M0d_e8DZQ&s',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to plan your trip? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    shiparticle: {
        message: "Hello! I'm your Ship Article Assistant, send me a message to get started.",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false,
                // streamSpeed: 20
            },
            chatButton: {
                icon: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#11012f',
                secondaryColor: '#11012f',
                fontFamily: 'BlinkMacSystemFont',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Ship Article Assistant",
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Ready to write your ship article? Let\'s chat!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    galapagosinsiders: {
        message: "Welcome to Galapagos Insiders! Ready to plan your next adventure?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsB3CuBneccsXzKLtLA7Dg7dirwL1KLMC5Yw&s',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsB3CuBneccsXzKLtLA7Dg7dirwL1KLMC5Yw&s'
            },
            chatWindow: {
                showScrollbar:true,
                autoJumpToBottom:false,
                showMessagePrompt: true,
                messagePromptText: "New Messages ↓",
                defaultOpen:false,
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
                primaryColor: '#5bc9d3',
                secondaryColor: '#5bc9d3',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Galapagos Insiders AI",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsB3CuBneccsXzKLtLA7Dg7dirwL1KLMC5Yw&s',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: "AI Assistant"
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    vitustravel: {
        message: "Velkommen til Vitus Travel! Klar for et nytt eventyr? Hvor vil du reise?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://cdn.prod.website-files.com/6347df63e6a5be722ca8395f/63480006fa499b403f7b78cf_62b5be49c9f9c72b23ac9b2b_faviconV2.png',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://cdn.prod.website-files.com/6347df63e6a5be722ca8395f/63480006fa499b403f7b78cf_62b5be49c9f9c72b23ac9b2b_faviconV2.png'
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
                storageType: 'SESSION_STORAGE',
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
                primaryColor: '#4e6d63',
                secondaryColor: '#4e6d63',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Vitus Reiser AI Assistant",
                showAvatar: true,
                avatar: 'https://cdn.prod.website-files.com/6347df63e6a5be722ca8395f/63480006fa499b403f7b78cf_62b5be49c9f9c72b23ac9b2b_faviconV2.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: "Let's plan your next adventure!"
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    riverpeople: {
        message: "Welcome to River People Ecuador! Ready to plan your next adventure?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbpPRFvVOgiK_zgjq8y_EPKWbNvVmYQ9NFvg&s',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbpPRFvVOgiK_zgjq8y_EPKWbNvVmYQ9NFvg&s'
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
                primaryColor: '#5f7953',
                secondaryColor: '#5f7953',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "River People AI Assistant",
                showAvatar: true,
                avatar: 'https://riverpeopleecuador.com/wp-content/uploads/sites/2090/2023/02/WhatsApp-Image-2023-02-14-at-09.06.01.jpeg?h=120&zoom=2',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: "Let's plan your next adventure!"
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    santoriniwinetour: {
        message: "Welcome to River People Ecuador! Ready to plan your next adventure?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://santoriniwinetour.com/wp-content/uploads/2018/09/LOGO-kamara1.png',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://santoriniwinetour.com/wp-content/uploads/2018/09/LOGO-kamara1.png'
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
                primaryColor: '#bf9535',
                secondaryColor: '#bf9535',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Santorini Wine Tour AI Assistant",
                showAvatar: true,
                avatar: 'https://santoriniwinetour.com/wp-content/uploads/2018/09/LOGO-kamara1.png',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: "Let's plan your next adventure!"
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    dnatatravel: {
        message: "Welcome to River People Ecuador! Ready to plan your next adventure?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://logodix.com/logo/1843184.jpg',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://logodix.com/logo/1843184.jpg'
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
                primaryColor: '#0088ce',
                secondaryColor: '#0088ce',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "dnata Travel AI Assistant",
                showAvatar: true,
                avatar: 'https://logodix.com/logo/1843184.jpg',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: "Let's chat!"
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    assistantdev: {
        message: "Hello! I'm the MyTrip.AI Assistant Designer. May I know your name? Also, are you here to design an AI assistant for your travel company, or are you planning a trip?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png'
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
                primaryColor: '#11012f',
                secondaryColor: '#11012f',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "My Trip UI Bot",
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                buttons: []

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Let\'s build your AI Agent!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    stagingassistantdev: {
        message: "Hello! I'm the MyTrip.AI Assistant Designer. May I know your name? Also, are you here to design an AI assistant for your travel company, or are you planning a trip?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: true,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png'
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
                primaryColor: '#11012f',
                secondaryColor: '#11012f',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Staging Onboarding Assistant",
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                buttons: []

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Let\'s build your AI Agent!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    usparks: {
        message: "Hello! I'm the MyTrip.AI Assistant Designer. May I know your name? Also, are you here to design an AI assistant for your travel company, or are you planning a trip?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4VWjHNnEQe-xnfUoAeheR2Rg0kyCniQXwdA&s',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4VWjHNnEQe-xnfUoAeheR2Rg0kyCniQXwdA&s'
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
                primaryColor: '#7699b4',
                secondaryColor: '#7699b4',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Route 66 AI Trip Planner",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4VWjHNnEQe-xnfUoAeheR2Rg0kyCniQXwdA&s',
                buttons: [Button.CLOSE_CHAT_BUTTON]

            },
            notification: {
                volume: 1,
                showCount: true
            },
            tooltip:{
                mode: 'CLOSE',
                text: 'Let\'s plan your trip!'
            },
            userBubble: {
                animate: true,
                showAvatar: true,
                avatar: 'https://mytrip.ai/wp-content/uploads/2024/02/logoheadtranslucent.png',
                simStream: false
            },
        }
    },
    undiscoveredmountains: {
        message: "Hello! I'm Heidi, your AI Trip Planner. How can I assist you in planning your next adventure? Are you interested in exploring the Southern French Alsp?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvkygolUe2pTAKYs55ev49eHhONJMbC0uQ3A&s',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvkygolUe2pTAKYs55ev49eHhONJMbC0uQ3A&s'
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
                primaryColor: '#4da785',
                secondaryColor: '#4da785',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Your AI Travel Planner",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvkygolUe2pTAKYs55ev49eHhONJMbC0uQ3A&s',
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
    },
    undiscoveredmountainschatbotify: {
        message: "Hello! I'm Heidi, your AI Trip Planner. How can I assist you in planning your next adventure? Are you interested in exploring the Southern French Alsp?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvkygolUe2pTAKYs55ev49eHhONJMbC0uQ3A&s',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvkygolUe2pTAKYs55ev49eHhONJMbC0uQ3A&s'
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
                primaryColor: '#4da785',
                secondaryColor: '#4da785',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Your AI Travel Planner",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvkygolUe2pTAKYs55ev49eHhONJMbC0uQ3A&s',
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
    },
    uscoachways: {
        message: "Welcome to US Coachways! How can I assist you today?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/4be2af1d0000640005084f13/0x0.png',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/4be2af1d0000640005084f13/0x0.png'
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
                primaryColor: '#7fb851',
                secondaryColor: '#7fb851',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "US Coachways AI",
                showAvatar: true,
                avatar: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/4be2af1d0000640005084f13/0x0.png',
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
    },
    happygringoemails: {
        message: "Hi there! How can I assist you today? If you need help drafting a traveler email or have a question about our processes, just let me know.",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzrbjlGvdiyKl7xIvzICpzseKO_8piA4jHTQ&s',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzrbjlGvdiyKl7xIvzICpzseKO_8piA4jHTQ&s'
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
            footer: {   // Displays the MyTrip info
                text: <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#666' }}>
                <img 
                    src="https://mytrip.ai/wp-content/uploads/2024/02/mytripailogoheadround20x20.png" 
                    alt="MyTrip.ai logo" 
                    style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '50%' }}
                />
                <span>Powered by MyTrip.AI</span>
                </div>,
                buttons: []
            },
            general: {
                primaryColor: '#d03c34',
                secondaryColor: '#d03c34',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Emails AI Assistant",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzrbjlGvdiyKl7xIvzICpzseKO_8piA4jHTQ&s',
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
    },
    happygringo: {
        message: "Hi there! How can I assist you today? If you need help drafting a traveler email or have a question about our processes, just let me know.",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzrbjlGvdiyKl7xIvzICpzseKO_8piA4jHTQ&s',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzrbjlGvdiyKl7xIvzICpzseKO_8piA4jHTQ&s'
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
            footer: {   // Displays the MyTrip info
                text: <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#666' }}>
                <img 
                    src="https://mytrip.ai/wp-content/uploads/2024/02/mytripailogoheadround20x20.png" 
                    alt="MyTrip.ai logo" 
                    style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '50%' }}
                />
                <span>Powered by MyTrip.AI</span>
                </div>,
                buttons: []
            },
            general: {
                primaryColor: '#d03c34',
                secondaryColor: '#d03c34',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Happy Gringo Chat",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzrbjlGvdiyKl7xIvzICpzseKO_8piA4jHTQ&s',
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
    },
    inspirationaladventures: {
        message: "Hi there! How can I assist you today? If you need help drafting a traveler email or have a question about our processes, just let me know.",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/5cf49e8a9cdb4c0001112db5/0x0.png',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/5cf49e8a9cdb4c0001112db5/0x0.png'
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
            footer: {   // Displays the MyTrip info
                text: <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#666' }}>
                <img 
                    src="https://mytrip.ai/wp-content/uploads/2024/02/mytripailogoheadround20x20.png" 
                    alt="MyTrip.ai logo" 
                    style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '50%' }}
                />
                <span>Powered by MyTrip.AI</span>
                </div>,
                buttons: []
            },
            general: {
                primaryColor: '#95b65d',
                secondaryColor: '#95b65d',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Inspirational Adventures AI",
                showAvatar: true,
                avatar: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/5cf49e8a9cdb4c0001112db5/0x0.png',
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
    },
    travelcare: {
        message: "Hello! I'm Heidi, your AI Trip Planner. How can I assist you in planning your next adventure? Are you interested in exploring the Southern French Alsp?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEGBr-WOzZCw2mlL1JNMO7qK4GaTORDS39xA&s',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEGBr-WOzZCw2mlL1JNMO7qK4GaTORDS39xA&s'
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
                primaryColor: '#dd4334',
                secondaryColor: '#dd4334',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'		// ON_LOAD || ON_CHATBOT_INTERACT || ON_PAGE_INTERACT
            },
            header: {
                title: "Travel Care AI Assistant",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEGBr-WOzZCw2mlL1JNMO7qK4GaTORDS39xA&s',
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
    },
    jdtravelcare: {
        message: "Hello! I'm Heidi, your AI Trip Planner. How can I assist you in planning your next adventure? Are you interested in exploring the Southern French Alsp?",
        settings: {
            botBubble: {
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEGBr-WOzZCw2mlL1JNMO7qK4GaTORDS39xA&s',
                simStream: false,
                streamSpeed: 20,
                dangerouslySetInnerHtml: true
            },
            chatButton: {
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEGBr-WOzZCw2mlL1JNMO7qK4GaTORDS39xA&s'
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
                storageKey: 'rcb-history',
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
                blockSpam: true,
                buttons: [Button.SEND_MESSAGE_BUTTON]
            },
            device: {
                desktopEnabled: true,
                mobileEnabled: true,
                applyMobileOptimizations: false
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
                primaryColor: '#dd4334',
                secondaryColor: '#dd4334',
                fontFamily: 'sans-serif',
                showHeader: true,
                showFooter: true,
                embedded: false,
                flowStartTrigger: 'ON_LOAD'
            },
            header: {
                title: "Travel Care AI Assistant",
                showAvatar: true,
                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEGBr-WOzZCw2mlL1JNMO7qK4GaTORDS39xA&s',
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
    },
};
  
  export default chatbotConfig;
  