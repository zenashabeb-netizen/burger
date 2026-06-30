import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, Settings, Code, Terminal, Cpu, Layers, Bot, Video, Mic, Copy, 
  ExternalLink, Sparkles, Plus, Play, Check, Eye, BookOpen, ShieldAlert,
  Menu, X, Home, Compass, Key, PlayCircle, Monitor, ArrowRight, User, Sparkle,
  Volume2, EyeOff
} from 'lucide-react';

interface AIStudioPlaygroundProps {
  onBackToFood: () => void;
}

export default function AIStudioPlayground({ onBackToFood }: AIStudioPlaygroundProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'playground' | 'build' | 'api-keys'>('playground');
  
  // Playground Modes
  const [playgroundMode, setPlaygroundMode] = useState<'chat' | 'stream' | 'build-vibe'>('chat');
  
  // Sidebar Toggles
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  // Model & Parameter States
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5 Flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [groundingEnabled, setGroundingEnabled] = useState(true);
  const [codeExecEnabled, setCodeExecEnabled] = useState(false);
  const [jsonModeEnabled, setJsonModeEnabled] = useState(false);
  
  // Code Hand-off Modal State
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'curl'>('python');
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Chat History & System Instructions
  const [systemInstruction, setSystemInstruction] = useState('You are a helpful, extremely creative culinary assistant expert in combining fast-casual street food with high-end gourmet plating techniques.');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string; thoughts?: string }>>([
    {
      role: 'user',
      content: 'Can you give me a rapid concept for a burger that represents Google AI Studio?'
    },
    {
      role: 'model',
      thoughts: 'The user wants an AI Studio themed burger. Need to combine high tech themes (neon, dark sleek style, developer tokens) with premium visual gastronomy.',
      content: 'Behold the **Vibe Coder Triple-Stack**: A sleek, dark activated charcoal bun symbolizing the dark mode interface, encasing triple prime-aged wagyu beef patties (representing multi-modal layered nodes), layered with luminous neon-yellow melted cheddar cheese sheets and a spicy hyper-parameter tomato-habanero reduction. Seasoned with crispy garlic-fried code tokens. Best paired with side-loaded neural-network onion rings.'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Audio Stream Mode simulation states
  const [audioStreaming, setAudioStreaming] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  // Build Mode interactive states
  const [builderPrompt, setBuilderPrompt] = useState('Build a clean, high-contrast dark mode pizza catalog app');
  const [builderProgress, setBuilderProgress] = useState(0);
  const [builderStatus, setBuilderStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle Simulated AI response
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const currentPrompt = userInput;
    setMessages(prev => [...prev, { role: 'user', content: currentPrompt }]);
    setUserInput('');
    setIsGenerating(true);

    setTimeout(() => {
      let botResponse = '';
      let thoughts = '';

      if (currentPrompt.toLowerCase().includes('pizza') || currentPrompt.toLowerCase().includes('burger')) {
        thoughts = 'Analyzing food query. Grounding on gourmet ingredients, applying high-contrast color scheme ideas.';
        botResponse = `**Culinary Playground Output:** Highly recommended match found! Grounding with custom food models suggests adding wood-fired crispy crust, fresh sliced heirloom tomatoes, and creamy burrata cheese. Dynamic parameter temperature of ${temperature} resulted in a delightful spicy kick.`;
      } else {
        thoughts = `Processing general text query. Adjusting creative range to temperature: ${temperature}. Verification search grounding: ${groundingEnabled ? 'active' : 'inactive'}.`;
        botResponse = `This is a live output from **${selectedModel}** inside the AI Studio Developer Playground. It has processed your input prompt with a creative temperature setting of ${temperature} and a limit of ${maxTokens} maximum tokens. It stands ready for advanced multi-modal visual prototyping!`;
      }

      setMessages(prev => [...prev, { role: 'model', content: botResponse, thoughts }]);
      setIsGenerating(false);
    }, 1500);
  };

  // Run Vibe coding builder simulation
  const handleStartVibeBuild = () => {
    setBuilderProgress(5);
    setBuilderStatus('Initializing container, reading metadata...');
    
    const interval = setInterval(() => {
      setBuilderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBuilderStatus('App compiled successfully! Serving preview on Port 3000.');
          return 100;
        }
        if (prev === 20) setBuilderStatus('Installing tailwindcss-vite plugin...');
        if (prev === 50) setBuilderStatus('Bundling server.ts and rendering modular dashboard...');
        if (prev === 80) setBuilderStatus('Injecting Lucide icons and checking tsconfig rules...');
        return prev + 15;
      });
    }, 600);
  };

  // Copy Code generator helper
  const getGeneratedCode = () => {
    if (selectedLanguage === 'python') {
      return `import google.generativeai as genai

# Setup your secret API Key securely
genai.configure(api_key="YOUR_GEMINI_API_KEY")

model = genai.GenerativeModel(
    model_name="${selectedModel === 'Gemini 2.5 Flash' ? 'gemini-2.5-flash' : 'gemini-2.5-pro'}",
    system_instruction="${systemInstruction}"
)

# Active Playground settings
config = genai.types.GenerationConfig(
    temperature=${temperature},
    max_output_tokens=${maxTokens},
    response_mime_type="${jsonModeEnabled ? 'application/json' : 'text/plain'}"
)

response = model.generate_content(
    "Suggest a spicy pizza sauce layout",
    generation_config=config
)

print(response.text)`;
    } else if (selectedLanguage === 'javascript') {
      return `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "${selectedModel === 'Gemini 2.5 Flash' ? 'gemini-2.5-flash' : 'gemini-2.5-pro'}",
  contents: "Suggest a spicy pizza sauce layout",
  config: {
    systemInstruction: "${systemInstruction}",
    temperature: ${temperature},
    maxOutputTokens: ${maxTokens},
    responseMimeType: "${jsonModeEnabled ? 'application/json' : 'text/plain'}"
  }
});

console.log(response.text);`;
    } else {
      return `curl https://generativelanguage.googleapis.com/v1beta/models/${selectedModel === 'Gemini 2.5 Flash' ? 'gemini-2.5-flash' : 'gemini-2.5-pro'}:generateContent?key=$GEMINI_API_KEY \\
  -H 'Content-Type: application/json' \\
  -d '{
    "contents": [{"parts":[{"text": "Suggest a spicy pizza sauce layout"}]}],
    "generationConfig": {
      "temperature": ${temperature},
      "maxOutputTokens": ${maxTokens}
    }
  }'`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0d0d0e] text-[#e3e3e3] font-mono text-sm overflow-hidden select-none">
      
      {/* 1. LEFT-HAND NAVIGATION SIDEBAR */}
      <aside className="w-[72px] md:w-[240px] bg-[#121214] border-r border-[#1f1f23] flex flex-col justify-between p-3 md:p-4 shrink-0">
        <div className="space-y-6">
          {/* Logo / Back to Food Menu Switcher */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={onBackToFood}
              className="flex items-center gap-2.5 px-3 py-2 text-tomato-orange hover:text-white bg-tomato-orange/10 hover:bg-[#da291c] rounded-xl transition-all font-sans font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              🍕 <span className="hidden md:inline">Food Menu</span>
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 pt-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-stone-500">Developer Space</span>
            </div>
          </div>

          <nav className="space-y-1.5 font-sans">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'home' ? 'bg-[#222226] text-white font-semibold' : 'text-stone-400 hover:bg-[#1a1a1d] hover:text-white'
              }`}
            >
              <Home className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline text-sm">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('playground')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'playground' ? 'bg-[#222226] text-white font-semibold' : 'text-stone-400 hover:bg-[#1a1a1d] hover:text-white'
              }`}
            >
              <Compass className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline text-sm">Playground</span>
            </button>

            <button
              onClick={() => setActiveTab('build')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'build' ? 'bg-[#222226] text-white font-semibold' : 'text-stone-400 hover:bg-[#1a1a1d] hover:text-white'
              }`}
            >
              <PlayCircle className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline text-sm">Build Mode</span>
            </button>
          </nav>
        </div>

        {/* Lower Sidebar Key Access */}
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-sans cursor-pointer ${
              activeTab === 'api-keys' ? 'bg-[#222226] text-white' : 'text-stone-400 hover:bg-[#1a1a1d] hover:text-stone-200'
            }`}
          >
            <Key className="h-5 w-5 shrink-0" />
            <span className="hidden md:inline text-xs">API Keys</span>
          </button>
          
          <div className="hidden md:block rounded-xl bg-white/5 border border-white/5 p-3 font-sans">
            <span className="text-[10px] font-bold text-stone-500 block uppercase">Workspace Status</span>
            <span className="text-xs font-semibold text-emerald-400 mt-1 block">● Connected to Live API</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0d0d0e]">
        
        {/* GLOBAL HEADER */}
        <header className="h-16 border-b border-[#1f1f23] flex items-center justify-between px-6 bg-[#121214] shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#da291c] text-white font-extrabold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
              Google AI Studio
            </div>
            <span className="text-stone-600 hidden sm:inline">|</span>
            <span className="text-xs text-stone-400 font-sans font-medium hidden sm:inline">Developer Console / Active Project</span>
          </div>

          <div className="flex items-center gap-3 font-sans">
            {/* Get Code button */}
            <button
              onClick={() => setCodeModalOpen(true)}
              className="flex items-center gap-2 bg-[#f2a900] text-tomato-dark font-extrabold text-xs tracking-wider uppercase px-4.5 py-2 rounded-lg hover:bg-opacity-95 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
            >
              <Code className="h-4 w-4" />
              <span>Get Code</span>
            </button>

            {/* Panel slider toggle */}
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f1f23] transition-all cursor-pointer ${
                rightSidebarOpen ? 'bg-[#222226] text-white' : 'hover:bg-[#1a1a1d] text-stone-400'
              }`}
              title="Toggle Run Settings"
            >
              <Sliders className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA ROUTER */}
        <div className="flex-1 flex overflow-hidden min-w-0">

          {/* 1. HOME DASHBOARD WORKSPACE */}
          {activeTab === 'home' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 font-sans">
              <div className="max-w-4xl space-y-3">
                <span className="text-xs font-bold text-tomato-orange tracking-widest uppercase block"> Central Console</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">AI Studio Developer Hub</h1>
                <p className="text-stone-400 leading-relaxed max-w-2xl text-sm">
                  Welcome to the multi-modal development dashboard. Start a quick prompt draft, customize system instructions, or build and deploy high-fidelity custom full-stack models directly.
                </p>
              </div>

              {/* Resource cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-5 hover:border-tomato-orange/30 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tomato-orange/10 text-tomato-orange mb-4">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">New Prompt Draft</h3>
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                    Instantly load a clear workspace to prototype custom rules and fine-tune creative settings.
                  </p>
                  <button onClick={() => setActiveTab('playground')} className="mt-4 flex items-center gap-1 text-xs text-tomato-orange font-bold hover:underline cursor-pointer">
                    <span>Open Playground</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-5 hover:border-[#da291c]/30 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#da291c]/10 text-[#da291c] mb-4">
                    <Play className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Active App Builds</h3>
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                    Check deployment states, view custom API endpoints, and monitor active containers.
                  </p>
                  <button onClick={() => setActiveTab('build')} className="mt-4 flex items-center gap-1 text-xs text-[#da291c] font-bold hover:underline cursor-pointer">
                    <span>Deploy Monitor</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-5 hover:border-stone-700 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-stone-400 mb-4">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">System Telemetry</h3>
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                    Active container hosting on Port 3000, secure proxy connections, and resource allocation graphs.
                  </p>
                  <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md w-fit">
                    <span>● Node Online</span>
                  </div>
                </div>
              </div>

              {/* Recent Drafts section */}
              <div className="max-w-5xl">
                <h3 className="font-bold text-stone-300 text-sm tracking-wider uppercase mb-4">Recent Project Hub</h3>
                <div className="border border-[#1f1f23] rounded-2xl divide-y divide-[#1f1f23] overflow-hidden bg-[#121214]">
                  <div className="p-4 flex items-center justify-between hover:bg-[#1a1a1d] transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍔</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Vibe Coder Triple-Stack Specification</p>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">Model: Gemini 2.5 Flash | Temp: 0.7 | Max Tokens: 2048</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('playground')} className="text-xs font-bold text-tomato-orange hover:underline cursor-pointer">Open</button>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-[#1a1a1d] transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍕</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Wood-Fired Pizza Dough Parameter Optimizer</p>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">Model: Gemini 2.5 Pro | Temp: 0.3 | Search Grounding: Active</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('playground')} className="text-xs font-bold text-tomato-orange hover:underline cursor-pointer">Open</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PLAYGROUND SPLIT-PANE WORKSPACE */}
          {activeTab === 'playground' && (
            <div className="flex-1 flex overflow-hidden min-w-0">
              
              {/* CENTRAL MAIN PANEL (Workspace & Modality tabs) */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-[#1f1f23] overflow-hidden">
                {/* Modality tab bar */}
                <div className="h-11 border-b border-[#1f1f23] bg-[#121214] flex items-center px-4 justify-between shrink-0">
                  <div className="flex gap-1.5 font-sans">
                    <button
                      onClick={() => setPlaygroundMode('chat')}
                      className={`text-xs font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        playgroundMode === 'chat' ? 'bg-[#222226] text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Chat Mode
                    </button>
                    <button
                      onClick={() => setPlaygroundMode('stream')}
                      className={`text-xs font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        playgroundMode === 'stream' ? 'bg-[#222226] text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Stream Mode
                    </button>
                    <button
                      onClick={() => setPlaygroundMode('build-vibe')}
                      className={`text-xs font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                        playgroundMode === 'build-vibe' ? 'bg-[#222226] text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Vibe Editor
                    </button>
                  </div>
                  
                  <div className="text-[10px] font-mono text-stone-500 font-semibold uppercase tracking-widest hidden sm:block">
                    Active: {selectedModel}
                  </div>
                </div>

                {/* --- CHAT MODE WORKSPACE --- */}
                {playgroundMode === 'chat' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* System Instructions block */}
                    <div className="border-b border-[#1f1f23] bg-[#121214] p-4 flex flex-col gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-tomato-orange tracking-widest uppercase">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>System Instructions</span>
                      </div>
                      <textarea
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        className="w-full bg-[#0d0d0e] border border-[#1f1f23] hover:border-stone-700 focus:border-tomato-orange focus:outline-none rounded-lg p-2.5 text-xs text-stone-300 placeholder:text-stone-600 resize-none h-14 font-mono leading-relaxed"
                        placeholder="Define rules, parameters, tone, and character bounds for the generative AI..."
                      />
                    </div>

                    {/* Chat messaging logs */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-5 bg-[#080809]">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                          {/* Avatar icon */}
                          <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                            msg.role === 'user' ? 'bg-[#da291c]/20 text-[#da291c]' : 'bg-[#f2a900]/20 text-[#f2a900]'
                          }`}>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : 'G'}
                          </div>

                          {/* Message Content Bubble */}
                          <div className="flex flex-col gap-2 max-w-[85%]">
                            {/* Thoughts expander for AI outputs (like Gemini reasoning) */}
                            {msg.thoughts && (
                              <details className="group bg-[#121214] border border-[#1f1f23] rounded-lg overflow-hidden">
                                <summary className="cursor-pointer text-[10px] font-bold text-stone-500 px-3 py-1.5 select-none hover:text-stone-300 flex items-center justify-between">
                                  <span>💭 View Model Internal Thoughts</span>
                                  <span className="text-[9px] font-mono group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="px-3 pb-2.5 pt-1 border-t border-[#1f1f23] text-[11px] text-stone-400 italic font-mono leading-relaxed bg-[#0d0d0e]">
                                  {msg.thoughts}
                                </div>
                              </details>
                            )}

                            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed font-sans ${
                              msg.role === 'user' 
                                ? 'bg-[#1e1e24] border-[#2c2c35] text-white rounded-tr-none' 
                                : 'bg-[#121214] border-[#1f1f23] text-stone-200 rounded-tl-none'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}

                      {isGenerating && (
                        <div className="flex gap-3 max-w-3xl">
                          <div className="h-8 w-8 rounded-lg bg-[#f2a900]/10 text-[#f2a900] shrink-0 flex items-center justify-center">
                            <Sparkle className="h-4 w-4 animate-spin" />
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                            <div className="text-[10px] text-stone-500 font-bold animate-pulse">Running model query...</div>
                            <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-4 w-3/4">
                              <div className="space-y-2">
                                <div className="h-2 bg-stone-700 rounded w-5/6 animate-pulse" />
                                <div className="h-2 bg-stone-700 rounded w-2/3 animate-pulse" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Footer query input area */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1f1f23] bg-[#121214] shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Type your developer prompt here (e.g. 'Generate spicy burger specs')..."
                          className="flex-grow bg-[#0d0d0e] border border-[#1f1f23] hover:border-stone-700 focus:border-tomato-orange focus:outline-none rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-stone-600 font-mono"
                          disabled={isGenerating}
                        />
                        <button
                          type="submit"
                          className="bg-[#da291c] hover:bg-opacity-95 text-white p-3.5 rounded-xl border border-white/5 shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                          disabled={isGenerating || !userInput.trim()}
                        >
                          <Play className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* --- STREAM MODE WORKSPACE (Animated waveform / Camera simulation) --- */}
                {playgroundMode === 'stream' && (
                  <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto bg-[#080809]">
                    
                    <div className="max-w-3xl space-y-2">
                      <span className="text-[10px] font-bold text-tomato-orange tracking-widest uppercase">Live Modality Stream</span>
                      <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Audio / Visual Port</h2>
                      <p className="text-xs text-stone-400 leading-relaxed max-w-xl">
                        Simulate the experimental Live API mode. Toggle inputs below to visualize audio telemetry and screenshare streams instantly inside the developer playground.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                      
                      {/* Audio telemetry feed */}
                      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-xs text-stone-300">Voice Telemetry Feed</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              audioStreaming ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-stone-500'
                            }`}>
                              {audioStreaming ? 'Streaming Live' : 'Muted'}
                            </span>
                          </div>
                          
                          {/* Animated voice wave simulation */}
                          <div className="h-28 bg-[#0d0d0e] border border-[#1f1f23] rounded-xl flex items-center justify-center px-4 overflow-hidden gap-1">
                            {audioStreaming ? (
                              [...Array(18)].map((_, idx) => (
                                <motion.div
                                  key={idx}
                                  animate={{
                                    height: [15, Math.floor(Math.random() * 80) + 20, 15]
                                  }}
                                  transition={{
                                    duration: 0.6 + idx * 0.03,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  className="w-1.5 bg-[#da291c] rounded-full"
                                />
                              ))
                            ) : (
                              <div className="flex flex-col items-center gap-1.5">
                                <Volume2 className="h-5 w-5 text-stone-600" />
                                <span className="text-[10px] text-stone-500">Audio stream offline</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setAudioStreaming(!audioStreaming)}
                          className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase transition-all cursor-pointer ${
                            audioStreaming 
                              ? 'bg-[#da291c]/20 border border-[#da291c]/40 text-[#da291c]' 
                              : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white'
                          }`}
                        >
                          <Mic className="h-4 w-4" />
                          <span>{audioStreaming ? 'Stop Audio Feed' : 'Start Audio Feed'}</span>
                        </button>
                      </div>

                      {/* Screen / Webcam feed */}
                      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-xs text-stone-300">Webcam Telemetry Port</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              webcamEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-stone-500'
                            }`}>
                              {webcamEnabled ? 'Active' : 'Offline'}
                            </span>
                          </div>

                          <div className="h-28 bg-[#0d0d0e] border border-[#1f1f23] rounded-xl flex items-center justify-center overflow-hidden relative">
                            {webcamEnabled ? (
                              <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240"
                                alt="Simulated Webcam Capture Feed"
                                className="h-full w-full object-cover blur-[0.5px]"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-1.5">
                                <Video className="h-5 w-5 text-stone-600" />
                                <span className="text-[10px] text-stone-500">Video telemetry unrequested</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setWebcamEnabled(!webcamEnabled)}
                          className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase transition-all cursor-pointer ${
                            webcamEnabled 
                              ? 'bg-[#da291c]/20 border border-[#da291c]/40 text-[#da291c]' 
                              : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white'
                          }`}
                        >
                          <Video className="h-4 w-4" />
                          <span>{webcamEnabled ? 'Kill Webcam Port' : 'Trigger Webcam Port'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* --- BUILD MODE VIBE WORKING AREA --- */}
                {playgroundMode === 'build-vibe' && (
                  <div className="flex-1 flex overflow-hidden min-w-0">
                    {/* Left Builder sidebar */}
                    <div className="w-[300px] border-r border-[#1f1f23] bg-[#121214] p-5 flex flex-col justify-between shrink-0">
                      <div className="space-y-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-tomato-orange tracking-widest uppercase">
                          <Bot className="h-4 w-4" />
                          <span>Vibe Code Assistant</span>
                        </div>
                        
                        <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                          Build real-time full-stack features using simple natural language instructions below.
                        </p>

                        <div className="space-y-2.5">
                          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Builder Directives</label>
                          <textarea
                            value={builderPrompt}
                            onChange={(e) => setBuilderPrompt(e.target.value)}
                            className="w-full bg-[#0d0d0e] border border-[#1f1f23] hover:border-stone-700 focus:border-tomato-orange focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-stone-600 resize-none h-24 font-mono leading-relaxed"
                          />
                        </div>

                        {/* Progress slider */}
                        {builderProgress > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-stone-400 font-sans">
                              <span>Building Assets...</span>
                              <span className="font-mono text-tomato-orange font-bold">{builderProgress}%</span>
                            </div>
                            <div className="h-2 bg-[#0d0d0e] rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                className="h-full bg-tomato-orange" 
                                initial={{ width: 0 }}
                                animate={{ width: `${builderProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            {builderStatus && (
                              <p className="text-[10px] text-stone-500 italic leading-normal font-mono">{builderStatus}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleStartVibeBuild}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-tomato-orange hover:bg-opacity-95 py-3 text-xs font-black uppercase text-tomato-dark tracking-wider shadow-md active:scale-95 cursor-pointer"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Run Vibe Builder</span>
                      </button>
                    </div>

                    {/* Right Browser Emulator Preview pane */}
                    <div className="flex-grow flex flex-col bg-[#080809] p-5 overflow-hidden">
                      <div className="h-9 border border-[#1f1f23] bg-[#121214] rounded-t-xl flex items-center px-4 justify-between shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                          <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                          <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                          <span className="text-[10px] text-stone-500 ml-4 font-sans">https://ais-dev-preview-port3000.run.app</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">Port 3000 Ingress</span>
                      </div>
                      
                      <div className="flex-grow bg-[#160505] border-l border-r border-b border-[#1f1f23] rounded-b-xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                        
                        {/* Simulated food preview rendering depending on builderProgress */}
                        {builderProgress === 0 ? (
                          <div className="space-y-4 max-w-sm">
                            <div className="text-4xl animate-bounce">⚡</div>
                            <h3 className="font-display text-lg text-white">Browser Sandbox Ready</h3>
                            <p className="font-sans text-xs text-stone-400 leading-relaxed">
                              Customize the builder prompt on the left and hit "Run Vibe Builder" to trigger automatic app code rewrite and instant Hot Module Replacement preview here.
                            </p>
                          </div>
                        ) : builderProgress < 100 ? (
                          <div className="space-y-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tomato-orange/10 text-tomato-orange mx-auto animate-spin">
                              <Sparkles className="h-6 w-6" />
                            </div>
                            <p className="text-xs text-stone-300 font-sans">Compiling live production bundle...</p>
                          </div>
                        ) : (
                          /* Rendered Spec sheet */
                          <div className="max-w-md w-full bg-[#121214] border-2 border-dashed border-tomato-orange/30 rounded-2xl p-6 text-left space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-white/5">
                              <span className="font-display text-sm tracking-wide text-tomato-orange">App: Spicy Pizza Catalog</span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">ONLINE</span>
                            </div>
                            <p className="text-xs text-stone-300 font-sans leading-relaxed">
                              Successfully generated an interactive grid with a full-stack responsive item list! Includes custom order tracking and checkout integrations fully compliant with Port 3000 specifications.
                            </p>
                            <div className="bg-[#0d0d0e] p-3 rounded-xl border border-white/5 font-mono text-[11px] text-stone-400 space-y-1">
                              <div>$ npm run dev</div>
                              <div className="text-emerald-400">&gt; server running on http://0.0.0.0:3000</div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* 2. RIGHT-HAND "RUN SETTINGS" SIDE PANEL (Togglable) */}
              <AnimatePresence>
                {rightSidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 310, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="h-full bg-[#121214] flex flex-col justify-between border-l border-[#1f1f23] shrink-0 overflow-y-auto"
                  >
                    <div className="p-5 space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-[#1f1f23]">
                        <span className="font-bold text-xs text-white uppercase tracking-wider">Run Settings</span>
                        <Settings className="h-4 w-4 text-stone-500" />
                      </div>

                      {/* Dropdown for Model Select */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Model Selection</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full bg-[#0d0d0e] border border-[#1f1f23] hover:border-stone-700 focus:border-tomato-orange focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white cursor-pointer font-sans"
                        >
                          <option>Gemini 2.5 Flash</option>
                          <option>Gemini 2.5 Pro</option>
                          <option>Gemini 2.5 Flash-Experimental</option>
                          <option>Gemini Live Multimodal 2.5</option>
                        </select>
                      </div>

                      {/* Temperature Slider */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Temperature</label>
                          <span className="font-mono text-xs font-bold text-tomato-orange">{temperature.toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#0d0d0e] hover:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#da291c]"
                        />
                        <div className="flex justify-between text-[9px] text-stone-600 font-sans">
                          <span>Rigid / Deterministic</span>
                          <span>Creative / Vibrant</span>
                        </div>
                      </div>

                      {/* Max Tokens Input */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Max Output Tokens</label>
                        <input
                          type="number"
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
                          className="w-full bg-[#0d0d0e] border border-[#1f1f23] hover:border-stone-700 focus:border-tomato-orange focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                        />
                      </div>

                      <hr className="border-[#1f1f23]" />

                      {/* Tool toggles */}
                      <div className="space-y-4">
                        <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Workspace Tools</span>
                        
                        <div className="flex items-center justify-between">
                          <div className="font-sans">
                            <p className="text-xs font-bold text-white">Search Grounding</p>
                            <p className="text-[10px] text-stone-500 mt-0.5">Injects active web validation</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={groundingEnabled}
                            onChange={(e) => setGroundingEnabled(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-[#1f1f23] text-[#da291c] focus:ring-[#da291c] cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="font-sans">
                            <p className="text-xs font-bold text-white">Code Execution</p>
                            <p className="text-[10px] text-stone-500 mt-0.5">Executes inline script tags</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={codeExecEnabled}
                            onChange={(e) => setCodeExecEnabled(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-[#1f1f23] text-[#da291c] focus:ring-[#da291c] cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="font-sans">
                            <p className="text-xs font-bold text-white">Strict JSON Schema</p>
                            <p className="text-[10px] text-stone-500 mt-0.5">Forces structured parameters</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={jsonModeEnabled}
                            onChange={(e) => setJsonModeEnabled(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-[#1f1f23] text-[#da291c] focus:ring-[#da291c] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lower container metadata info */}
                    <div className="p-5 bg-[#0a0a0b] border-t border-[#1f1f23]">
                      <div className="flex items-center gap-2 text-stone-500 text-[10px] font-sans">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-tomato-orange" />
                        <span>Changes apply immediately on next run</span>
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* 3. API KEYS SECTION */}
          {activeTab === 'api-keys' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl font-sans">
              <div className="space-y-2">
                <span className="text-xs font-bold text-tomato-orange tracking-widest uppercase block">Security Portal</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">API Key Management</h2>
                <p className="text-stone-400 text-sm max-w-2xl leading-relaxed">
                  Generate secure, localized tokens to authenticate your React application backends with active Gemini endpoints. Keep all tokens hidden from the client browser.
                </p>
              </div>

              <div className="border border-[#1f1f23] rounded-2xl bg-[#121214] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1f1f23]">
                  <div>
                    <span className="text-xs font-bold text-white block">GEMINI_API_KEY</span>
                    <span className="text-[11px] text-stone-500 font-mono mt-0.5">Required for Server-Side prompt integrations</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#da291c]/15 text-[#da291c] px-2.5 py-0.5 rounded border border-[#da291c]/25">SECRET</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-grow bg-[#0d0d0e] border border-[#1f1f23] px-4 py-3 rounded-xl font-mono text-xs flex items-center justify-between text-stone-400 select-all">
                    <span>••••••••••••••••••••••••••••••••••••••••</span>
                    <EyeOff className="h-4 w-4 text-stone-600 cursor-pointer" />
                  </div>
                  <button className="bg-white/5 border border-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-bold text-xs tracking-wide uppercase transition-all cursor-pointer">
                    Reveal Key
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-tomato-orange/10 border border-tomato-orange/15 p-4 flex gap-3 text-xs text-stone-300 leading-relaxed">
                <Sparkles className="h-5 w-5 text-tomato-orange shrink-0 animate-pulse" />
                <div>
                  <strong className="text-white">API Key Security Alert:</strong> To prevent token leaks, never prefix your keys with <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-tomato-orange">VITE_</code>. Access keys server-side via <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-tomato-orange">process.env.GEMINI_API_KEY</code>.
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* CODE HAND-OFF MODAL ("Get Code" overlay dialog) */}
      <AnimatePresence>
        {codeModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCodeModalOpen(false)}
              className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm"
            />

            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-2xl bg-[#121214] border border-[#1f1f23] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px]"
              >
                {/* Modal Header */}
                <div className="h-16 border-b border-[#1f1f23] px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-tomato-orange" />
                    <span className="font-sans font-bold text-white text-base">Get Workspace Code</span>
                  </div>
                  <button
                    onClick={() => setCodeModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Tab selector for language selection */}
                <div className="h-12 border-b border-[#1f1f23] bg-[#0d0d0e] flex items-center px-6 gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedLanguage('python')}
                    className={`text-xs font-bold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      selectedLanguage === 'python' ? 'bg-[#222226] text-white border border-[#1f1f23]' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Python SDK
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('javascript')}
                    className={`text-xs font-bold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      selectedLanguage === 'javascript' ? 'bg-[#222226] text-white border border-[#1f1f23]' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Node.js SDK
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('curl')}
                    className={`text-xs font-bold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      selectedLanguage === 'curl' ? 'bg-[#222226] text-white border border-[#1f1f23]' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    cURL Endpoint
                  </button>
                </div>

                {/* Main scrollable code viewport block */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#080809] font-mono text-xs text-stone-300 relative select-text">
                  <pre className="leading-relaxed whitespace-pre-wrap">{getGeneratedCode()}</pre>
                </div>

                {/* Footer Copy CTA section */}
                <div className="h-16 border-t border-[#1f1f23] px-6 flex items-center justify-between shrink-0 bg-[#0d0d0e]">
                  <span className="text-[10px] text-stone-500 font-sans">Compliant with @google/genai &gt;= 2.4.0</span>
                  
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 bg-[#da291c] hover:bg-opacity-95 text-white font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl border border-white/5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
