import React, { useState, useRef, useEffect } from 'react';
import { Play, Code2, Clock } from 'lucide-react';

const CodeEditor = () => {
  const [code, setCode] = useState(`// Write your code here
console.log("Hello, World!");
for (let i = 1; i <= 5; i++) {
  console.log("Count:", i);
}`);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [executionTime, setExecutionTime] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [linesExecuted, setLinesExecuted] = useState(0);
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'cpp', name: 'C++' },
    { id: 'python', name: 'Python' }
  ];

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    
    if (newPosition > 20 && newPosition < 80) {
      setSplitPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const runCode = async () => {
    setIsRunning(true);
    setExecutionTime(0);
    const now = new Date();
    setStartTime(now.toLocaleTimeString());
    
    const codeLines = code.split('\n').filter(line => 
      line.trim() !== '' && !line.trim().startsWith('//')
    );
    setLinesExecuted(codeLines.length);

    const startExecution = Date.now();

    try {
      // Replace this URL with your actual backend endpoint
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const executionDuration = Date.now() - startExecution;
      setExecutionTime(executionDuration);
      setOutput(data.output || data.result || 'No output');
      
    } catch (error) {
      const executionDuration = Date.now() - startExecution;
      setExecutionTime(executionDuration);
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setOutput('');
    setExecutionTime(0);
    setStartTime('');
    setLinesExecuted(0);
  };

  const formatTime = (ms) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const seconds = (ms / 1000).toFixed(3);
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code2 className="text-blue-400" size={24} />
          <h1 className="text-xl font-semibold text-white">Code Editor</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          
          <button 
            onClick={runCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Play size={18} />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex relative overflow-hidden">
        {/* Code Editor Panel */}
        <div style={{ width: `${splitPosition}%` }} className="flex flex-col bg-gray-900">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <span className="text-gray-300 text-sm font-medium">Editor</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="Write your code here..."
            style={{ 
              tabSize: 2,
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Resizer */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* Output Panel */}
        <div style={{ width: `${100 - splitPosition}%` }} className="flex flex-col bg-gray-850">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
            <span className="text-gray-300 text-sm font-medium">Output</span>
            
            {/* Execution Info */}
            {startTime && (
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatTime(executionTime)}</span>
                </div>
                <div>Started: {startTime}</div>
                <div>Lines: {linesExecuted}</div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto">
            {output ? (
              language === 'html' && !output.startsWith('Error:') ? (
                <div className="h-full flex flex-col">
                  <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                    Live Preview
                  </div>
                  <iframe
                    srcDoc={code}
                    className="flex-1 w-full bg-white border-0"
                    title="HTML Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <pre className="text-gray-100 p-4 font-mono text-sm whitespace-pre-wrap">
                  {output}
                </pre>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Play size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Click "Run Code" to see output</p>
                </div>
              </div>
            )}
          </div>

          {/* Execution Stats Footer */}
          {output && (
            <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Execution Complete</span>
              </div>
              <div>Total Time: {formatTime(executionTime)}</div>
              <div>Lines Executed: {linesExecuted}</div>
              <div>Started at: {startTime}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;