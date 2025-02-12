import { CSSProperties, useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  language?: string;
  readOnly?: boolean;
  padding?: number;
  className?: string;
  style?: CSSProperties;
}

const CodeEditor = ({ 
  value = '', 
  onChange, 
  placeholder,
  ...props
}: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = value;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      data-testid="code-editor"
      defaultValue={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default CodeEditor; 