import { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function Edit() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!";
    return 0;
}`);

  const sentRequestToBackend = async () => {
    const data = {
      'language': language,
      'code': code,
      input: '',
    }

    const req = axios.post('http://localhost:8081/run', data)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });

  }

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value
    if (value == 'cpp') {
      setCode(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!";
    return 0;
}`)
    } else {
      setCode('');
    }
    setLanguage(value);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white  flex flex-col">
      <div className="p-4 flex  items-center bg-gray-800">

        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      <div className="flex-1">
        <Editor
          height="80vh"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="p-4 bg-gray-800 text-right">
        <button
          onClick={sentRequestToBackend}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Run
        </button>
      </div>
    </div>
  );
}

export default Edit;