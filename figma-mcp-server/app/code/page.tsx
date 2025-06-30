'use client'
import React, { useState, useRef } from 'react';

export default function CodePage() {
    const [input, setInput] = useState('');
    const [chat, setChat] = useState([
        { sender: 'system', text: '¡Hola! Describe tu idea para comenzar.' }
    ]);
    const [result, setResult] = useState('');
    const chatRef = useRef(chat);
    const chatContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        chatRef.current = chat;
    }, [chat]);

    React.useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chat]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userInput = input;
        setChat(prevChat => [...prevChat, { sender: 'user', text: userInput }]);
        setInput('');
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userInput }),
            });
            if (!response.ok) throw new Error('Error en la API');
            const data = await response.json();
            // Usamos el campo 'respuesta' de la API
            let respuesta = '';
            if (data.respuesta) {
                respuesta = data.respuesta;
            } else if (typeof data === 'string') {
                respuesta = data;
            } else {
                respuesta = '// Respuesta no reconocida';
            }
            setResult(respuesta);
            setChat(prev => [...prev, { sender: 'system', text: 'Código generado:' }]);
        } catch (err) {
            setChat(prev => [...prev, { sender: 'system', text: 'Error al conectar con la API.' }]);
            setResult('// Error al conectar con la API');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar solo con chat */}
            <aside className="w-full max-w-md bg-white border-r flex flex-col p-8 min-h-screen mx-auto">
                <div className="flex items-center mb-8">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                        {/* Icono de ejemplo */}
                        <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#E6F4EA" /><path d="M16 10v12M10 16h12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" /></svg>
                    </div>
                    <span className="font-bold text-xl text-gray-800">Code Prompt UI</span>
                </div>
                {/* Chat */}
                <div className="flex flex-col gap-4 bg-white rounded-xl shadow p-4 mb-6 min-h-[220px] max-h-96 overflow-y-auto">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Chat de código</h2>
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto"
                    >
                        {chat.map((msg, idx) => (
                            <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-3 py-2 rounded-lg text-base ${msg.sender === 'user' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-700'} break-all`}>{msg.text}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="mb-2 flex justify-start">
                                <div className="px-3 py-2 rounded-lg text-base bg-gray-100 text-gray-700 opacity-60">Pensando...</div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-auto">
                        <textarea
                            className="flex-1 border border-gray-300 rounded-lg p-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-green-400 resize-none text-black"
                            placeholder="Escribe tu prompt o código..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            rows={2}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            disabled={loading}
                        />
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 rounded-lg transition"
                            onClick={handleSend}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </div>
            </aside>
            {/* Main con editor de código para el resultado */}
            <main className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="w-full max-w-3xl">
                    <div className="mb-2 text-xl font-bold text-gray-700">Resultado</div>
                    <div className="rounded-2xl shadow-lg bg-[#f5f6f8] p-0">
                        <pre className="bg-[#23272f] text-green-100 text-base font-mono rounded-2xl p-6 overflow-x-auto min-h-[160px]">
                            {result || '// Aquí aparecerá el resultado de tu código o prompt'}
                        </pre>
                    </div>
                </div>
            </main>
        </div>
    );
} 