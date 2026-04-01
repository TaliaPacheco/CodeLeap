import { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);

interface CodeHighlighterProps {
  code: string;
  language: string;
}

export default function CodeHighlighter({ code, language }: CodeHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.textContent = code;
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className="rounded-lg overflow-hidden bg-[#1E293B]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0F172A]">
        <span className="text-xs text-[#7494EC] font-medium bg-[rgba(116,148,236,0.2)] px-2 py-0.5 rounded">
          {language}
        </span>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code ref={codeRef} className={`language-${language} text-sm leading-relaxed`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
