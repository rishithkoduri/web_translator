'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [status, setStatus] = useState('Ready');
  const [targetLang, setTargetLang] = useState('es');

  // References for Speech API
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        handleTranslate(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onerror = (event) => {
        setStatus('Error: ' + event.error);
        setIsListening(false);
      };
    } else {
      setStatus('Browser not supported. Use Chrome/Edge.');
    }
  }, [targetLang]);

  const handleTranslate = async (inputText) => {
    setStatus('Translating...');
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, target_lang: targetLang }),
      });
      
      const data = await response.json();
      if (data.translated_text) {
        setTranslatedText(data.translated_text);
        setStatus('Done');
        speak(data.translated_text);
      }
    } catch (error) {
      setStatus('Translation failed');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang; // e.g., 'es-ES'
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setStatus('Listening...');
      setText('');
      setTranslatedText('');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>🎙️ Web Voice Translator</h1>
      
      <div style={{ margin: '20px 0' }}>
        <select 
          value={targetLang} 
          onChange={(e) => setTargetLang(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          <option value="es">Spanish (Español)</option>
          <option value="fr">French (Français)</option>
          <option value="de">German (Deutsch)</option>
          <option value="ja">Japanese (日本語)</option>
        </select>
      </div>

      <button 
        onClick={toggleListening}
        style={{ 
          padding: '20px', 
          borderRadius: '50%', 
          backgroundColor: isListening ? '#ff4444' : '#0070f3',
          color: 'white', 
          border: 'none',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
      </button>

      <p style={{ color: '#666' }}>{status}</p>

      <div style={{ display: 'grid', gap: '20px', textAlign: 'left' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <strong>You said:</strong>
          <p>{text || '...'}</p>
        </div>
        
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f0f9ff' }}>
          <strong>Translation:</strong>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>{translatedText || '...'}</p>
            {translatedText && (
              <button onClick={() => speak(translatedText)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Volume2 size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}