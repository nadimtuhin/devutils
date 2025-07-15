# Design Document

## Overview

The enhanced Base64 Encoder/Decoder will feature a side-by-side layout with real-time bidirectional conversion. The component will use React hooks for state management and implement debounced conversion to optimize performance during rapid typing.

## Architecture

The component will maintain a single state structure with separate values for plain text and Base64, along with error states. Conversion logic will be triggered by useEffect hooks that watch for changes in either input field.

```
┌─────────────────────────────────────────────────────────────┐
│                    Base64 Converter                         │
├─────────────────────────────────────────────────────────────┤
│  [Clear All]                                                │
├──────────────────────────┬──────────────────────────────────┤
│     Plain Text           │         Base64                   │
│  ┌─────────────────────┐ │  ┌─────────────────────────────┐ │
│  │                     │ │  │                             │ │
│  │   Text Area         │ │  │      Text Area              │ │
│  │                     │ │  │                             │ │
│  └─────────────────────┘ │  └─────────────────────────────┘ │
│  [Copy]                  │  [Copy]                          │
└──────────────────────────┴──────────────────────────────────┘
```

## Components and Interfaces

### Main Component Structure

```typescript
interface Base64ConverterState {
  plainText: string;
  base64Text: string;
  error: string | null;
  lastModified: 'plain' | 'base64' | null;
}

interface CopyButtonProps {
  text: string;
  label: string;
}
```

### Component Breakdown

1. **Base64Encoder Component** - Main container component
2. **TextAreaWithCopy** - Reusable text area with integrated copy functionality
3. **CopyButton** - Standalone copy button component
4. **ErrorDisplay** - Error message display component

## Data Models

### State Management

The component will use a single useState hook with a comprehensive state object:

```typescript
const [state, setState] = useState<Base64ConverterState>({
  plainText: '',
  base64Text: '',
  error: null,
  lastModified: null
});
```

### Conversion Logic

- **Encoding**: Uses browser's native `btoa()` function
- **Decoding**: Uses browser's native `atob()` function with try-catch for error handling
- **Debouncing**: 300ms delay to prevent excessive conversions during rapid typing

## Error Handling

### Error Types and Responses

1. **Invalid Base64 Input**
   - Trigger: `atob()` throws exception
   - Response: Display "Invalid Base64" in plain text area
   - Visual: Red border on Base64 text area

2. **Copy Operation Failure**
   - Trigger: `navigator.clipboard.writeText()` fails
   - Response: Show temporary error toast
   - Fallback: Use deprecated `document.execCommand('copy')`

3. **Encoding Errors**
   - Trigger: `btoa()` fails with non-Latin characters
   - Response: Display encoding error message
   - Solution: Use TextEncoder for UTF-8 support

### Error Recovery

- Errors are automatically cleared when valid input is provided
- Component remains functional even when one conversion fails
- No error states persist across component re-renders

## Testing Strategy

### Unit Tests

1. **Conversion Logic Tests**
   - Test encoding of various text inputs
   - Test decoding of valid Base64 strings
   - Test error handling for invalid Base64

2. **State Management Tests**
   - Test state updates when typing in either field
   - Test error state management
   - Test debouncing behavior

3. **User Interaction Tests**
   - Test copy functionality
   - Test clear functionality
   - Test responsive layout behavior

### Integration Tests

1. **Real-time Conversion Flow**
   - Type in plain text → verify Base64 updates
   - Type in Base64 → verify plain text updates
   - Test rapid typing scenarios

2. **Error Handling Flow**
   - Enter invalid Base64 → verify error display
   - Correct invalid input → verify error clearing

### Accessibility Tests

1. **Keyboard Navigation**
   - Tab order through all interactive elements
   - Enter/Space activation of buttons

2. **Screen Reader Support**
   - Proper labeling of text areas
   - Error message announcements
   - Copy success/failure announcements

## Implementation Notes

### Performance Considerations

- Use `useCallback` for conversion functions to prevent unnecessary re-renders
- Implement debouncing to reduce conversion frequency during typing
- Consider `useMemo` for expensive validation operations

### Browser Compatibility

- `btoa()`/`atob()` are supported in all modern browsers
- Clipboard API requires HTTPS in production
- Fallback to `execCommand` for older browsers

### Responsive Design

- Side-by-side layout on desktop (min-width: 768px)
- Stacked layout on mobile devices
- Consistent spacing and touch targets for mobile