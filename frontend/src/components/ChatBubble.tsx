import { useState } from 'react'

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! 👋 I\'m the Apex Planners AI assistant. How can I help you with your architectural plans today?' }
    ])
    const [input, setInput] = useState('')

    const quickActions = [
        'I need a compliance check',
        'How much does it cost?',
        'What documents do I need?',
        'Track my project',
    ]

    const handleSend = () => {
        if (!input.trim()) return
        setMessages([...messages, { role: 'user', content: input }])

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: getResponse(input)
            }])
        }, 800)
        setInput('')
    }

    const handleQuickAction = (action: string) => {
        setMessages([...messages, { role: 'user', content: action }])
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: getResponse(action)
            }])
        }, 800)
    }

    const getResponse = (query: string): string => {
        const q = query.toLowerCase()
        if (q.includes('compliance') || q.includes('check')) {
            return 'Great! A compliance check starts at R500. Simply click "Start Your Project" above, select "Compliance Check", and upload your plans. Our AI agents will analyze your drawings against SANS 10400, Johannesburg regulations, and National Building Regulations.'
        }
        if (q.includes('cost') || q.includes('price') || q.includes('how much')) {
            return 'Our pricing depends on the service:\n\n• **Compliance Check**: R500 – R2,000\n• **New Drawings**: R2,000 – R10,000\n• **Additions & Alterations**: R3,000 – R15,000\n• **Regulatory Queries**: R250 – R500\n\nExact pricing is calculated after we review your plans.'
        }
        if (q.includes('document') || q.includes('need') || q.includes('upload')) {
            return 'You can upload:\n\n• PDF architectural plans\n• CAD files (.dwg, .dxf)\n• Images and sketches\n• A brief project description\n\nOur system accepts most common file formats. The AI will extract metadata and classify your project automatically.'
        }
        if (q.includes('track') || q.includes('progress') || q.includes('status')) {
            return 'You can track your project in real-time from the Dashboard. After payment, you\'ll see live updates as your project moves through:\n\n1. AI Analysis\n2. Freelancer Assignment\n3. Compliance Review\n4. Final Report\n\nYou\'ll also receive email and SMS notifications at each stage.'
        }
        return 'Thanks for your question! For detailed assistance, please start a project or contact us at info@apexplanners.co.za. You can also call us at +27 11 123 4567.'
    }

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
                aria-label="Open chat"
                id="chat-bubble-toggle"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden" style={{ height: '500px' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-4 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Apex AI Assistant</h3>
                            <p className="text-xs text-primary-100">Online • Typically replies instantly</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-md'
                                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Quick Actions (only show if 1 message) */}
                        {messages.length === 1 && (
                            <div className="space-y-2 pt-2">
                                <p className="text-xs text-gray-400 px-1">Quick questions:</p>
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleQuickAction(action)}
                                        className="block w-full text-left px-4 py-2 text-sm text-primary-700 bg-primary-50 rounded-xl hover:bg-primary-100 transition"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-100 p-3">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                id="chat-input"
                            />
                            <button
                                onClick={handleSend}
                                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                                id="chat-send"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
