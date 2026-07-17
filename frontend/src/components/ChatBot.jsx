import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react'
import api from '../api/axios'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis l'assistant IA de Mylta Academy. 🎓", sender: 'bot' },
    { id: 2, text: "Comment puis-je vous aider aujourd'hui ? Je peux vous conseiller sur nos formations.", sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.post('/chat', { message: userMsg.text })
      setMessages(prev => [...prev, { id: Date.now(), text: response.data.reply, sender: 'bot' }])
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Désolé, je rencontre des difficultés techniques.", sender: 'bot', error: true }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-neutral-800 text-white rotate-90 scale-90' 
            : 'bg-academy-primary text-white hover:scale-110 shadow-red-500/30'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[300px] sm:w-[380px] h-[400px] sm:h-[500px] max-h-[75vh] bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-up origin-bottom-right">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-academy-primary/20 flex items-center justify-center border border-academy-primary/30">
              <Bot size={20} className="text-academy-primary" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Assistant IA <Sparkles size={14} className="text-amber-400" />
              </h3>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> En ligne
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.sender === 'user' ? 'bg-neutral-800' : 'bg-academy-primary/20'
                }`}>
                  {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-academy-primary" />}
                </div>
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-academy-primary text-white rounded-tr-sm' 
                    : msg.error 
                      ? 'bg-red-950/50 text-red-200 border border-red-500/30 rounded-tl-sm'
                      : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-academy-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-academy-primary" />
                </div>
                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1">
                  <div className="w-2 h-2 bg-academy-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-academy-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-academy-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-academy-primary focus:bg-white/10 transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="w-12 rounded-xl bg-academy-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>

        </div>
      )}
    </div>
  )
}
