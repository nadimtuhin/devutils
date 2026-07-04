import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { ProcessingResult, XmlSettings } from '../types/formatters';
import { 
  createProcessingResult, 
  createFormatError, 
  parseErrorWithLocation,
  calculateSizeMetrics,
  withErrorHandling 
} from './errorHandling';

/**
 * Default XML processing settings
 */
export const defaultXmlSettings: XmlSettings = {
  indentSize: 2,
  preserveComments: true,
  preserveWhitespace: false,
  sortAttributes: false,
  minify: false,
  validateSchema: false,
};

/**
 * Validates XML syntax
 */
export function validateXml(xmlContent: string): { isValid: boolean; error?: string } {
  try {
    const result = XMLValidator.validate(xmlContent, {
      allowBooleanAttributes: true,
    });
    
    if (result === true) {
      return { isValid: true };
    }
    
    return { 
      isValid: false, 
      error: typeof result === 'object' ? result.err.msg : 'Invalid XML' 
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'XML validation failed' 
    };
  }
}

/**
 * Parses XML content into a JavaScript object
 */
export function parseXml(xmlContent: string, settings: XmlSettings) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    ignoreNameSpace: false,
    removeNSPrefix: false,
    parseAttributeValue: true,
    parseTagValue: true,
    trimValues: !settings.preserveWhitespace,
    parseTrueNumberOnly: false,
    arrayMode: false,
    alwaysCreateTextNode: false,
    isArray: () => false,
    commentPropName: settings.preserveComments ? '#comment' : false,
    cdataPropName: '#cdata',
    processEntities: true,
    htmlEntities: false,
  });

  return parser.parse(xmlContent);
}

/**
 * Converts JavaScript object back to XML
 */
export function buildXml(obj: any, settings: XmlSettings): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    format: !settings.minify,
    indentBy: settings.minify ? '' : ' '.repeat(settings.indentSize),
    suppressEmptyNode: false,
    suppressBooleanAttributes: false,
    suppressUnpairedNode: true,
    tagValueProcessor: (tagName, tagValue) => tagValue,
    attributeValueProcessor: (attrName, attrValue) => attrValue,
    commentPropName: settings.preserveComments ? '#comment' : false,
    cdataPropName: '#cdata',
    processEntities: true,
    oneListGroup: false,
  });

  return builder.build(obj);
}

/**
 * Sorts XML attributes alphabetically
 */
export function sortXmlAttributes(xmlContent: string, settings: XmlSettings): string {
  if (!settings.sortAttributes) {
    return xmlContent;
  }

  // This is a simplified implementation
  // In a production environment, you'd want a more robust XML attribute sorter
  return xmlContent.replace(
    /<([^>]+)>/g,
    (match, content) => {
      if (content.includes('=')) {
        const parts = content.split(' ');
        const tagName = parts[0];
        const attributes = parts.slice(1).filter(part => part.includes('='));
        
        if (attributes.length > 1) {
          attributes.sort();
          return `<${tagName} ${attributes.join(' ')}>`;
        }
      }
      return match;
    }
  );
}

/**
 * Minifies XML by removing unnecessary whitespace
 */
export function minifyXml(xmlContent: string): string {
  return xmlContent
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Formats XML with proper indentation
 */
export function formatXml(xmlContent: string, settings: XmlSettings): string {
  try {
    const parsed = parseXml(xmlContent, settings);
    let formatted = buildXml(parsed, settings);
    
    if (settings.sortAttributes) {
      formatted = sortXmlAttributes(formatted, settings);
    }
    
    if (settings.minify) {
      formatted = minifyXml(formatted);
    }
    
    return formatted;
  } catch (error) {
    throw new Error(`XML formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyzes XML structure
 */
export function analyzeXmlStructure(xmlContent: string) {
  try {
    const parsed = parseXml(xmlContent, defaultXmlSettings);
    
    function countElements(obj: any, depth = 0): { elements: number; maxDepth: number; attributes: number } {
      let elements = 0;
      let maxDepth = depth;
      let attributes = 0;
      
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (key.startsWith('@_')) {
            attributes++;
          } else if (key !== '#text' && key !== '#comment') {
            elements++;
            const childResult = countElements(obj[key], depth + 1);
            elements += childResult.elements;
            maxDepth = Math.max(maxDepth, childResult.maxDepth);
            attributes += childResult.attributes;
          }
        }
      }
      
      return { elements, maxDepth, attributes };
    }
    
    const analysis = countElements(parsed);
    
    return {
      format: 'XML',
      encoding: 'UTF-8', // Assume UTF-8 for now
      lineCount: xmlContent.split('\n').length,
      characterCount: xmlContent.length,
      structure: {
        depth: analysis.maxDepth,
        elements: analysis.elements,
        attributes: analysis.attributes,
      },
    };
  } catch (error) {
    throw new Error(`XML analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main XML processing function
 */
export async function processXml(
  xmlContent: string, 
  settings: XmlSettings
): Promise<ProcessingResult> {
  return withErrorHandling(() => {
    if (!xmlContent.trim()) {
      return createProcessingResult(true, '', []);
    }

    // Validate XML first
    const validation = validateXml(xmlContent);
    if (!validation.isValid) {
      const error = parseErrorWithLocation(
        validation.error || 'Invalid XML syntax',
        'XML validation failed'
      );
      return createProcessingResult(false, '', [error]);
    }

    // Format the XML
    const formatted = formatXml(xmlContent, settings);
    const metadata = calculateSizeMetrics(xmlContent, formatted);
    
    return createProcessingResult(true, formatted, [], metadata);
  }, 'XML processing');
}

/**
 * Extracts namespaces from XML content
 */
export function extractXmlNamespaces(xmlContent: string): { prefix: string; uri: string }[] {
  const namespaces: { prefix: string; uri: string }[] = [];
  const nsRegex = /xmlns(?::([^=]+))?="([^"]+)"/g;
  
  let match;
  while ((match = nsRegex.exec(xmlContent)) !== null) {
    namespaces.push({
      prefix: match[1] || 'default',
      uri: match[2],
    });
  }
  
  return namespaces;
}

/**
 * Validates XML against a basic schema (simplified)
 */
export function validateXmlSchema(xmlContent: string): ProcessingResult {
  // This is a placeholder for schema validation
  // In a real implementation, you'd use a proper XML schema validator
  try {
    const validation = validateXml(xmlContent);
    if (!validation.isValid) {
      const error = createFormatError(
        validation.error || 'Schema validation failed',
        undefined,
        undefined,
        'error'
      );
      return createProcessingResult(false, '', [error]);
    }
    
    return createProcessingResult(true, 'XML is valid', []);
  } catch (error) {
    const formatError = createFormatError(
      `Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      undefined,
      'error'
    );
    return createProcessingResult(false, '', [formatError]);
  }
}