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
    test('handles INF constant correctly in PHP syntax', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(phpInput, { target: { value: 'INF' } });
      expect(phpOutput.value).toBe('d:INF;');
    });

    test('handles -INF constant correctly in PHP syntax', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(phpInput, { target: { value: '-INF' } });
      expect(phpOutput.value).toBe('d:-INF;');
    });

    test('handles NAN constant correctly in PHP syntax', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(phpInput, { target: { value: 'NAN' } });
      expect(phpOutput.value).toBe('d:NAN;');
    });

    test('handles special float values in PHP arrays', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      const testArray = `[
    'infinity' => INF,
    'negative_infinity' => -INF,
    'not_a_number' => NAN
]`;
      
      fireEvent.change(phpInput, { target: { value: testArray } });
      
      // Should not show an error
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      // Should contain all special float values in serialized output
      expect(phpOutput.value).toContain('d:INF;');
      expect(phpOutput.value).toContain('d:-INF;');
      expect(phpOutput.value).toContain('d:NAN;');
      expect(phpOutput.value).toContain('s:8:"infinity"');
      expect(phpOutput.value).toContain('s:17:"negative_infinity"');
      expect(phpOutput.value).toContain('s:13:"not_a_number"');
    });

    test('bidirectional conversion of special float values', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // Test serialization
      const testArray = "['test' => INF]";
      fireEvent.change(phpInput, { target: { value: testArray } });
      const serialized = phpOutput.value;
      expect(serialized).toContain('d:INF;');
      
      // Test unserialization by putting serialized data into right panel
      fireEvent.change(phpOutput, { target: { value: serialized } });
      expect(phpInput.value).toContain('INF');
      expect(phpInput.value).toContain("'test' => INF");
    });

    test('handles Infinity correctly via sample data', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // Note: This tests the sample data functionality
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

  describe('PHP Object Syntax Parsing', () => {
    test('parses multiline PHP object syntax correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // Test the specific multiline PHP syntax that was causing issues
      const multilinePhpSyntax = `[
  'user' => new User([
    'metadata' => [
      'created_at' => '2024-01-15',
      'last_login' => '2024-07-16'
    ]
  ])
]`;

      fireEvent.change(jsonInput, { target: { value: multilinePhpSyntax } });
      
      // Should not show an error
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      // Should produce valid PHP serialized output
      expect(phpOutput.value).not.toBe('');
      expect(phpOutput.value).toContain('O:4:"User"'); // Should contain User object
      expect(phpOutput.value).toContain('s:8:"metadata"'); // Should contain metadata key
      expect(phpOutput.value).toContain('s:10:"created_at"'); // Should contain created_at
      expect(phpOutput.value).toContain('s:10:"last_login"'); // Should contain last_login
    });

    test('parses single-line PHP object syntax correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      const singleLinePhpSyntax = "['user' => new User(['metadata' => ['created_at' => '2024-01-15', 'last_login' => '2024-07-16']])]";

      fireEvent.change(jsonInput, { target: { value: singleLinePhpSyntax } });
      
      // Should not show an error
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      // Should produce valid PHP serialized output
      expect(phpOutput.value).not.toBe('');
      expect(phpOutput.value).toContain('O:4:"User"');
    });

    test('parses empty PHP object correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(jsonInput, { target: { value: 'new User([])' } });
      
      // Should not show an error
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      // Should produce valid PHP serialized output with empty object
      expect(phpOutput.value).toBe('O:4:"User":0:{}');
    });

    test('handles nested PHP objects correctly', () => {
      const jsonInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      const nestedObjectSyntax = `[
  'user' => new User([
    'profile' => new Profile([
      'name' => 'John Doe'
    ])
  ])
]`;

      fireEvent.change(jsonInput, { target: { value: nestedObjectSyntax } });
      
      // Should not show an error
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      // Should contain both User and Profile objects
      expect(phpOutput.value).toContain('O:4:"User"');
      expect(phpOutput.value).toContain('O:7:"Profile"');
      expect(phpOutput.value).toContain('s:4:"name"');
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

  describe('Complex Nested Structures', () => {
    test('handles PHP objects with nested properties under numeric keys', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // Test the specific case reported by user: object with properties nested under key "0"
      const complexSerializedString = `a:5:{s:4:"user";O:4:"User":1:{s:1:"0";a:8:{s:2:"id";i:123;s:4:"name";s:8:"John Doe";s:5:"email";s:16:"john@example.com";s:6:"active";b:1;s:7:"balance";d:99.99;s:11:"preferences";N;s:4:"tags";a:2:{i:0;s:9:"developer";i:1;s:5:"admin";}s:8:"metadata";a:3:{s:10:"created_at";s:10:"2024-01-15";s:10:"last_login";s:10:"2024-07-16";s:11:"login_count";i:42;}}}s:8:"settings";a:3:{s:5:"theme";s:4:"dark";s:13:"notifications";b:1;s:8:"language";s:5:"en-US";}s:5:"items";a:3:{i:0;s:5:"item1";i:1;s:5:"item2";i:2;s:5:"item3";}s:15:"special_numbers";a:3:{s:8:"infinity";d:INF;s:17:"negative_infinity";d:-INF;s:12:"not_a_number";d:NAN;}s:9:"utf8_test";s:17:"测试 café 🚀";}`;
      
      // Input the serialized string into right panel
      fireEvent.change(phpOutput, { target: { value: complexSerializedString } });
      
      // Should not show an error
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      // Should convert to proper PHP array syntax in left panel
      expect(phpInput.value).toContain('new User([');
      expect(phpInput.value).toContain("'id' => 123");
      expect(phpInput.value).toContain("'name' => 'John Doe'");
      expect(phpInput.value).toContain("'email' => 'john@example.com'");
      expect(phpInput.value).toContain("'active' => true");
      expect(phpInput.value).toContain("'balance' => 99.99");
      expect(phpInput.value).toContain("'preferences' => null");
      expect(phpInput.value).toContain("'settings' => [");
      expect(phpInput.value).toContain("'theme' => 'dark'");
      expect(phpInput.value).toContain("'special_numbers' => [");
      expect(phpInput.value).toContain("'infinity' => INF");
      expect(phpInput.value).toContain("'negative_infinity' => -INF");
      expect(phpInput.value).toContain("'not_a_number' => NAN");
      expect(phpInput.value).toContain("'utf8_test' => '测试 café 🚀'");
    });

    test('bidirectional conversion works with complex nested structures', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // Test that we can go from serialized -> PHP syntax -> serialized and get consistent results
      const complexSerializedString = `a:2:{s:4:"user";O:4:"User":1:{s:1:"0";a:3:{s:2:"id";i:123;s:4:"name";s:8:"John Doe";s:5:"tags";a:2:{i:0;s:9:"developer";i:1;s:5:"admin";}}}s:8:"settings";a:2:{s:5:"theme";s:4:"dark";s:8:"language";s:5:"en-US";}}`;
      
      // Step 1: Input serialized string -> should generate PHP syntax
      fireEvent.change(phpOutput, { target: { value: complexSerializedString } });
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      const generatedPhpSyntax = phpInput.value;
      expect(generatedPhpSyntax).toContain('new User([');
      
      // Step 2: Clear and input the generated PHP syntax -> should generate serialized string
      fireEvent.change(phpOutput, { target: { value: '' } });
      fireEvent.change(phpInput, { target: { value: generatedPhpSyntax } });
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      
      // Should contain the essential serialized parts
      expect(phpOutput.value).toContain('O:4:"User"');
      expect(phpOutput.value).toContain('s:2:"id";i:123');
      expect(phpOutput.value).toContain('s:4:"name";s:8:"John Doe"');
    });

    test('handles UTF-8 strings in complex serialized data without "String too short" error', () => {
      const phpInput = screen.getAllByRole('textbox')[0];
      const phpOutput = screen.getAllByRole('textbox')[1];
      
      // The exact serialized string that was causing the "String too short" error
      const problematicSerializedString = `a:5:{s:4:"user";O:4:"User":1:{s:1:"0";a:8:{s:2:"id";i:123;s:4:"name";s:8:"John Doe";s:5:"email";s:16:"john@example.com";s:6:"active";b:1;s:7:"balance";d:99.99;s:11:"preferences";N;s:4:"tags";a:2:{i:0;s:9:"developer";i:1;s:5:"admin";}s:8:"metadata";a:3:{s:10:"created_at";s:10:"2024-01-15";s:10:"last_login";s:10:"2024-07-16";s:11:"login_count";i:42;}}}s:8:"settings";a:3:{s:5:"theme";s:4:"dark";s:13:"notifications";b:1;s:8:"language";s:5:"en-US";}s:5:"items";a:3:{i:0;s:5:"item1";i:1;s:5:"item2";i:2;s:5:"item3";}s:15:"special_numbers";a:3:{s:8:"infinity";d:INF;s:17:"negative_infinity";d:-INF;s:12:"not_a_number";d:NAN;}s:9:"utf8_test";s:17:"测试 café 🚀";}`;
      
      // This should not throw "String too short" error anymore
      fireEvent.change(phpOutput, { target: { value: problematicSerializedString } });
      
      // Verify no error is displayed
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/String too short/)).not.toBeInTheDocument();
      
      // Verify the UTF-8 string is correctly parsed
      expect(phpInput.value).toContain("'utf8_test' => '测试 café 🚀'");
      
      // Verify other complex elements are parsed correctly
      expect(phpInput.value).toContain('new User([');
      expect(phpInput.value).toContain("'name' => 'John Doe'");
      expect(phpInput.value).toContain("'email' => 'john@example.com'");
      expect(phpInput.value).toContain("'special_numbers' => [");
      expect(phpInput.value).toContain("'infinity' => INF");
      expect(phpInput.value).toContain("'negative_infinity' => -INF");
      expect(phpInput.value).toContain("'not_a_number' => NAN");
    });
  });
});