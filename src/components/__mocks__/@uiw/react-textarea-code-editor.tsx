interface CodeEditorProps {
  value: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  language?: string;
  readOnly?: boolean;
  padding?: number;
  className?: string;
  style?: React.CSSProperties;
}

const CodeEditor = ({ 
  value, 
  onChange, 
  placeholder,
  ...props
}: CodeEditorProps) => (
  <textarea
    data-testid="code-editor"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    {...props}
  />
);

export default CodeEditor; 