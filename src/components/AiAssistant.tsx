import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Languages,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { OIMLTestReport } from '../types/oiml';

interface AiAssistantProps {
  report: OIMLTestReport;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  modelUsed?: string;
  timestamp: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ report }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Namaste! I am your WeighSure Metrological AI Assistant. I have analyzed OIML Test Report **#${report.id}** for ${report.instrument.manufacturer} ${report.instrument.model} (${report.instrument.accuracyClass}).\n\nI can explain error causes, summarize compliance in English or Hindi, or identify where any limits were breached. How can I assist you?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');

  const isPass = report.overallVerdict === 'PASS';

  const quickPromptsByLanguage = {
    en: [
      {
        label: 'Where did the scale fail and why?',
        query: 'Where did the scale fail and why? Provide detailed corner and load error points.',
      },
      {
        label: 'Overall compliance summary',
        query: 'Provide a concise technical summary of this OIML R-76 test report.',
      },
      {
        label: 'Which test had the highest error?',
        query: 'Which test and load point exhibited the highest relative or absolute measurement error?',
      },
      {
        label: 'Recommended calibration adjustments',
        query: 'What mechanical leveling, load cell corner trimming, or span calibration is recommended?',
      },
    ],
    hi: [
      {
        label: 'विफलता (Failure) किस पॉइंट पर आई?',
        query: 'इस तोलन यंत्र में विफलता किस टेस्ट और पॉइंट पर आई? कॉर्नर और लोड एरर विस्तार से बताएं।',
      },
      {
        label: 'तकनीकी सारांश (Summary)',
        query: 'इस टेस्ट रिपोर्ट का आधिकारिक हिंदी तकनीकी सारांश दें।',
      },
      {
        label: 'अधिकतम एरर कहाँ दर्ज हुआ?',
        query: 'किस परीक्षण और लोड पॉइंट पर सबसे अधिक एरर पाया गया?',
      },
      {
        label: 'कैलिब्रेशन और ट्रिमिंग सुझाव',
        query: 'इस तोलन यंत्र को पास करने के लिए क्या मैकेनिकल या कैलिब्रेशन सुधार आवश्यक हैं?',
      },
    ],
    hinglish: [
      {
        label: 'Is scale mein failure kis point par aaya?',
        query: 'Is scale mein failure kis point par aaya? Detailed corner and load error batayein.',
      },
      {
        label: 'Overall summary batayein',
        query: 'Is test report ki 2-3 line ki summary hindi/hinglish mein dijiye.',
      },
      {
        label: 'Highest error kahan aaya?',
        query: 'Sabse zyada measurement error kis test aur load point par aaya?',
      },
      {
        label: 'Recommended calibration adjustments',
        query: 'What mechanical leveling, load cell corner trimming, or span calibration is recommended?',
      },
    ],
  };

  const quickPrompts = quickPromptsByLanguage[language] || quickPromptsByLanguage.en;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          reportData: report,
          language,
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: 'assistant',
        text: data.text || 'Unable to generate explanation.',
        source: data.source,
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Error contacting AI assistant. Please check your connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Architectural Guardrail Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Step 5: Lightweight AI Metrology Assistant (Explainability Layer)
                </h2>
                <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  Gemini API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI reads verified report data and provides plain-language explanations. Does not calculate Pass/Fail.
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-purple-600" />
              Language:
            </span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'en' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'hi' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'hinglish' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* SIH / OIML Architecture Mandate Box */}
        <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>OIML Non-Discretionary Architecture:</strong> The deterministic Pass/Fail compliance verdict is calculated strictly by the mathematical engine under OIML R-76 Table 6 rules. The AI assistant serves purely as an explainability and diagnostic aid for lab technicians, eliminating hallucination in statutory compliance decisions.
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Chat Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-700 text-white'
                }`}
              >
                {msg.role === 'user' ? 'LM' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-1 shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div
                  className={`text-[10px] flex items-center justify-between gap-3 pt-1 ${
                    msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                      {msg.source === 'gemini_api'
                        ? msg.modelUsed === 'gemini-3.1-flash-lite'
                          ? 'Gemini 3.1 Flash Lite'
                          : 'Gemini 3.8 Flash'
                        : 'OIML Deterministic Engine'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 shadow-2xs">
                Analyzing OIML test matrices and calculating diagnostic explanation...
              </div>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Quick Prompts:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q.query)}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={
              language === 'hi'
                ? 'इस स्केल के बारे में कोई भी प्रश्न पूछें (उदा. "फेलियर का कारण क्या है?")...'
                : 'Ask anything about this test report (e.g. "Where did the scale fail and why?")...'
            }
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition-all"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
