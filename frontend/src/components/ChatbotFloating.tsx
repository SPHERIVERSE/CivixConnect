// frontend/src/components/ChatbotFloating.tsx

'use client'; 

import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'; 
// NOTE: Make sure your axiosInstance import is correct (default or named)

// --- 1. APP CONTEXT (High-level platform + AI behaviour) ---
const APP_DETAILS_CONTEXT = `
CIVIXCONNECT: An AI-Powered Smart City Infrastructure Ecosystem.
The platform transforms traditional civic reporting into a highly efficient, automated pipeline using Swavi AI for instant visual triage, geospatial clustering, and CleanCoin digital incentives to drive community engagement. The AI assistant is named Swavi.

USER ROLES & ACCESS:
The application has four functional nodes defined in the schema: ADMIN, WORKER, CITIZEN, and BUSINESS.
- CITIZEN: Civilian Nodes that report infrastructure anomalies, access the CivixConnect Hub (community feed), earn gamified incentives (XP, CleanCoins, Global Rankings), and deploy Resource Assets in the Exchange Marketplace.
- WORKER: Field Agents focused on Active Dispatch Directives (tasks), real-time location telemetry broadcasting (Live Asset Radar), uploading visual evidence for repairs, and executing Knowledge Verification Protocols (Quizzes).
- BUSINESS: Corporate Entities that manage Corporate Social Responsibility (CSR) capital, procure bulk material assets via the Marketplace (placing Bids), deploy incentive discount Vouchers, and engineer Awareness Quizzes.
- ADMIN: Command Authority that monitors network nodes, filters anomalies by AI severity, manages public assets, audits CSR funds, and authorizes worker resolutions.

CORE MODULES & FUNCTIONALITY:
1. SMART INFRASTRUCTURE REPORTING (TRIAGE): 
    - Report Types (enum ReportType): POTHOLE, BROKEN_STREETLIGHT, ROAD_DAMAGE, WATER_LEAK, FALLEN_TREE, BROKEN_FOOTPATH, and other civic anomalies.
    - Report Statuses: Anomalies follow a strict workflow: pending, escalated, assigned (to a Field Agent), working, resolved.
    - Civilian Engagement: Citizens can Support or Oppose a report to influence its priority and network visibility (supportCount, oppositionCount).
    - Resolution Protocol: Field Agents (Workers) resolve directives by uploading visual evidence (resolvedImageUrl) and operational notes.
    - Live Asset Radar: Geospatial mapping displaying real-time telemetry of Field Agents and public infrastructure facilities.
2. INCENTIVES & ECONOMY: Nodes earn Operational Experience (XP) and CleanCoins (CC). CleanCoins are used to claim Corporate Vouchers/Discounts. Knowledge Verification Protocols (Quizzes) yield additional XP and CC.
3. RESOURCE EXCHANGE MARKETPLACE (Procurement):
    - CITIZENS (Sellers) deploy Resource Assets (WasteType: PLASTIC, PAPER, METAL, GLASS, ORGANIC, ELECTRONIC, TEXTILE, OTHER).
    - BUSINESSES (Buyers) browse the network and place valuation Bids (BidStatus: PENDING).
    - CITIZENS authorize transactions by accepting Corporate Proposals (BidStatus: ACCEPTED) to finalize a contract.

AI BEHAVIOUR & IDENTITY (Swavi + backend Gemini pipeline):
- BRANDING RULE: The platform is strictly named "CivixConnect". The old name "Swachh-Vikas" is completely deprecated. If a user asks about Swachh-Vikas, gracefully inform them that the platform has evolved and rebranded entirely to CivixConnect. Do NOT treat them as two separate systems.
- Swavi should answer questions about: smart infrastructure reports, AI triage/severity scores, geospatial duplicate detection, node clearance levels (roles), network telemetry, and the resource exchange.
- The backend Gemini pipeline automatically:
  * verifies incoming visual evidence (flags likely spam),
  * assigns a severityScore between 1 and 10 and a priority bucket (LOW, MEDIUM, HIGH),
  * and clusters duplicate anomalies using geospatial proximity (e.g., 100m radius) + text similarity.
When unsure, Swavi should respond safely, maintain a professional enterprise persona, and avoid hallucinating database state.
`;
// --- END CONTEXT ---


// Simplified Message Type
interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

// Icon for the chat button (using a simple SVG for cleanliness)
const ChatIcon = (props: any) => (
  <svg {...props} className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

// Close Icon for the dialog
const CloseIcon = (props: any) => (
    <svg {...props} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const ChatbotFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use a unique session ID, preferably the authenticated user's ID
  const sessionId = 'guest_user_123'; 

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);
  
  // Initial welcome message when the component loads
  useEffect(() => {
    // Welcome message updated to reflect the new assistant name
    setMessages([{ 
        text: "System uplink established. I am Swavi, the AI intelligence node for CivixConnect. I can assist you with infrastructure anomaly reporting, network telemetry, gamified incentives, and the resource exchange marketplace.", 
        sender: 'bot' 
    }]);
  }, []);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessageText = input.trim();
    if (!userMessageText || isLoading) return;

    const newUserMessage: ChatMessage = { text: userMessageText, sender: 'user' };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the highly detailed context with the message
      const response = await axiosInstance.post('/gemini/chat', { 
        message: userMessageText, 
        sessionId: sessionId,
        context: APP_DETAILS_CONTEXT, // <--- Passes the combined knowledge
      });
      
      const botResponse: ChatMessage = { 
        text: response.data.response, 
        sender: 'bot' 
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Frontend Chat Error:', error);
      setMessages((prev) => [...prev, { text: 'Sorry, the AI is currently unavailable.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      
      {/* --- Chat Dialog Pop-up --- */}
      {isOpen && (
        <div className="eco-card w-80 h-96 flex flex-col shadow-2xl mb-4 border-2 border-green-700/50">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
            {/* Header text updated to reflect the new assistant name */}
            <h3 className="text-white font-semibold">Swavi AI</h3> 
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            >
              <CloseIcon />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-900/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-green-600 text-white rounded-br-none' 
                      : 'bg-gray-700 text-gray-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] px-3 py-2 rounded-xl text-sm bg-gray-700 text-gray-400 animate-pulse">
                    <span className="dot-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-700 bg-gray-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question..."
                className="flex-1 px-3 py-2 text-sm bg-gray-700 text-white rounded-lg focus:ring-green-500 focus:border-green-500 border border-gray-600"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="eco-button-primary px-3 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !input.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Floating Chat Icon (Button) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`eco-button-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
      >
        {isOpen ? <CloseIcon className="w-7 h-7" /> : <ChatIcon className="w-7 h-7" />}
      </button>
    </div>
  );
};
