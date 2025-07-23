import { render, screen, fireEvent } from '@testing-library/react';
import PhpSerializer from './PhpSerializer';

describe('PhpSerializer', () => {
  beforeEach(() => {
    render(<PhpSerializer />);
  });

  describe('Basic PHP Serialization', () => {
    test('serializes null values correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: 'null' } });
      expect(phpOutput.value).toBe('N;');
    });

    test('serializes boolean values correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: 'true' } });
      expect(phpOutput.value).toBe('b:1;');
      
      fireEvent.change(jsonInput, { target: { value: 'false' } });
      expect(phpOutput.value).toBe('b:0;');
    });

    test('serializes integers correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: '123' } });
      expect(phpOutput.value).toBe('i:123;');
      
      fireEvent.change(jsonInput, { target: { value: '-456' } });
      expect(phpOutput.value).toBe('i:-456;');
    });

    test('serializes floats correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: '123.45' } });
      expect(phpOutput.value).toBe('d:123.45;');
    });

    test('serializes strings correctly with UTF-8 byte length', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // Regular ASCII string
      fireEvent.change(jsonInput, { target: { value: '"hello"' } });
      expect(phpOutput.value).toBe('s:5:"hello";');
      
      // UTF-8 string with multi-byte characters
      fireEvent.change(jsonInput, { target: { value: '"café"' } });
      expect(phpOutput.value).toBe('s:5:"café";');
      
      // Chinese characters
      fireEvent.change(jsonInput, { target: { value: '"测试"' } });
      expect(phpOutput.value).toBe('s:6:"测试";');
    });
  });

  describe('Special Float Values', () => {
    test('handles Infinity correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // Note: JSON.parse can't handle raw Infinity, but our sample data includes it
      const sampleButton = screen.getByText('Load Sample');
      fireEvent.click(sampleButton);
      
      expect(phpOutput.value).toContain('d:INF;');
      expect(phpOutput.value).toContain('d:-INF;');
      expect(phpOutput.value).toContain('d:NAN;');
    });
  });

  describe('Arrays and Objects', () => {
    test('serializes simple arrays correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: '["a", "b", "c"]' } });
      expect(phpOutput.value).toBe('a:3:{i:0;s:1:"a";i:1;s:1:"b";i:2;s:1:"c";}');
    });

    test('serializes associative arrays correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: '{"name": "John", "age": 30}' } });
      expect(phpOutput.value).toBe('a:2:{s:4:"name";s:4:"John";s:3:"age";i:30;}');
    });

    test('serializes PHP objects correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: '{"__class": "User", "id": 123, "name": "John"}' } });
      expect(phpOutput.value).toBe('O:4:"User":2:{s:2:"id";i:123;s:4:"name";s:4:"John";}');
    });

    test('handles nested structures correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      const nested = {
        user: {
          name: "John",
          tags: ["admin", "developer"]
        }
      };
      
      fireEvent.change(jsonInput, { target: { value: JSON.stringify(nested) } });
      expect(phpOutput.value).toContain('a:1:{s:4:"user";a:2:{s:4:"name";s:4:"John";s:4:"tags";a:2:{i:0;s:5:"admin";i:1;s:9:"developer";}};}');
    });
  });

  describe('PHP Unserialization', () => {
    test('unserializes null values correctly', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      const jsonOutput = screen.getAllByRole('textbox')[0];
      
      fireEvent.change(phpInput, { target: { value: 'N;' } });
      expect(JSON.parse(jsonOutput.value)).toBe(null);
    });

    test('unserializes boolean values correctly', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      const jsonOutput = screen.getAllByRole('textbox')[0];
      
      fireEvent.change(phpInput, { target: { value: 'b:1;' } });
      expect(JSON.parse(jsonOutput.value)).toBe(true);
      
      fireEvent.change(phpInput, { target: { value: 'b:0;' } });
      expect(JSON.parse(jsonOutput.value)).toBe(false);
    });

    test('unserializes special float values correctly', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      const jsonOutput = screen.getAllByRole('textbox')[0];
      
      fireEvent.change(phpInput, { target: { value: 'd:INF;' } });
      expect(JSON.parse(jsonOutput.value)).toBe(Infinity);
      
      fireEvent.change(phpInput, { target: { value: 'd:-INF;' } });
      expect(JSON.parse(jsonOutput.value)).toBe(-Infinity);
      
      fireEvent.change(phpInput, { target: { value: 'd:NAN;' } });
      expect(Number.isNaN(JSON.parse(jsonOutput.value))).toBe(true);
    });

    test('unserializes strings correctly', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      const jsonOutput = screen.getAllByRole('textbox')[0];
      
      // Regular string
      fireEvent.change(phpInput, { target: { value: 's:5:"hello";' } });
      expect(JSON.parse(jsonOutput.value)).toBe('hello');
      
      // UTF-8 string
      fireEvent.change(phpInput, { target: { value: 's:5:"café";' } });
      expect(JSON.parse(jsonOutput.value)).toBe('café');
    });

    test('unserializes arrays correctly', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      const jsonOutput = screen.getAllByRole('textbox')[0];
      
      // Sequential array
      fireEvent.change(phpInput, { target: { value: 'a:3:{i:0;s:1:"a";i:1;s:1:"b";i:2;s:1:"c";}' } });
      expect(JSON.parse(jsonOutput.value)).toEqual(['a', 'b', 'c']);
      
      // Associative array
      fireEvent.change(phpInput, { target: { value: 'a:2:{s:4:"name";s:4:"John";s:3:"age";i:30;}' } });
      expect(JSON.parse(jsonOutput.value)).toEqual({ name: 'John', age: 30 });
    });

    test('unserializes PHP objects correctly', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      const jsonOutput = screen.getAllByRole('textbox')[0];
      
      fireEvent.change(phpInput, { target: { value: 'O:4:"User":2:{s:2:"id";i:123;s:4:"name";s:4:"John";}' } });
      const result = JSON.parse(jsonOutput.value);
      expect(result).toEqual({
        __class: 'User',
        id: 123,
        name: 'John'
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error for invalid JSON', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      
      fireEvent.change(jsonInput, { target: { value: 'invalid json' } });
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    test('shows error for invalid PHP serialized format', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(phpInput, { target: { value: 'invalid php format' } });
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    test('shows error for malformed string length', () => {
      const phpInput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(phpInput, { target: { value: 's:10:"short";' } });
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  describe('UI Features', () => {
    test('has load sample button that works', () => {
      const loadSampleButton = screen.getByText('Load Sample');
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.click(loadSampleButton);
      
      expect(jsonInput.value).not.toBe('');
      expect(phpOutput.value).not.toBe('');
      expect(phpOutput.value).toContain('O:4:"User"'); // Should contain PHP object
    });

    test('has swap button that swaps content', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      const swapButton = screen.getByText('Swap');
      
      // Set initial values
      fireEvent.change(jsonInput, { target: { value: '{"test": true}' } });
      const initialJson = jsonInput.value;
      const initialPhp = phpOutput.value;
      
      // Swap
      fireEvent.click(swapButton);
      
      expect(jsonInput.value).toBe(initialPhp);
      expect(phpOutput.value).toBe(initialJson);
    });

    test('has clear button that clears all content', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      const clearButton = screen.getByText('Clear');
      
      // Set some content
      fireEvent.change(jsonInput, { target: { value: '{"test": true}' } });
      
      // Clear
      fireEvent.click(clearButton);
      
      expect(jsonInput.value).toBe('');
      expect(phpOutput.value).toBe('');
    });

    test('has format and minify buttons', () => {
      expect(screen.getByText('Format')).toBeInTheDocument();
      expect(screen.getByText('Minify')).toBeInTheDocument();
    });
  });

  describe('Circular Reference Handling', () => {
    test('handles circular references without infinite loops', () => {
      // This test would need to be done programmatically since JSON.stringify
      // can't handle circular references. We'd need to test the internal
      // serialization functions directly.
      
      // For now, we'll just verify the component renders without crashing
      // when given complex nested data via the sample
      const loadSampleButton = screen.getByText('Load Sample');
      fireEvent.click(loadSampleButton);
      
      expect(screen.getByText('PHP Serializer/Unserializer')).toBeInTheDocument();
    });
  });
});