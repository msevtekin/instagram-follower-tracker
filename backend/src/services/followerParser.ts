/**
 * FollowerParser Service
 * 
 * Parses and validates Instagram follower usernames from text input.
 * Instagram username rules: alphanumeric, underscore, period, 1-30 characters.
 */

export interface FollowerParser {
  parse(input: string): string[];
  parseFile(fileContent: string): string[];
  parseCSV(csvContent: string): string[];
  validateUsername(username: string): boolean;
}

/**
 * Validates an Instagram username according to Instagram rules:
 * - 1-30 characters
 * - Alphanumeric characters (a-z, A-Z, 0-9)
 * - Underscores (_)
 * - Periods (.)
 * - Cannot start or end with a period
 * - Cannot have consecutive periods
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }

  const trimmed = username.trim();
  
  // Check length: 1-30 characters
  if (trimmed.length < 1 || trimmed.length > 30) {
    return false;
  }

  // Check for valid characters only: alphanumeric, underscore, period
  const validPattern = /^[a-zA-Z0-9_.]+$/;
  if (!validPattern.test(trimmed)) {
    return false;
  }

  // Cannot start or end with a period
  if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return false;
  }

  // Cannot have consecutive periods
  if (trimmed.includes('..')) {
    return false;
  }

  return true;
}

/**
 * Parses text input and extracts all valid Instagram usernames.
 * Handles various separators: newlines, commas, spaces, tabs.
 * Filters out invalid entries and empty lines.
 */
export function parse(input: string): string[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  // Split by common separators: newline, comma, tab, multiple spaces
  const separatorPattern = /[\n\r,\t]+|\s{2,}/;
  const entries = input.split(separatorPattern);

  const validUsernames: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const trimmed = entry.trim();
    
    // Skip empty entries
    if (!trimmed) {
      continue;
    }

    // Validate and add unique usernames (case-insensitive deduplication)
    if (validateUsername(trimmed)) {
      const lowerCase = trimmed.toLowerCase();
      if (!seen.has(lowerCase)) {
        seen.add(lowerCase);
        validUsernames.push(trimmed);
      }
    }
  }

  return validUsernames;
}

/**
 * Parses CSV content and extracts usernames from the "Username" column.
 * Handles CSV files with headers like: Profile Id, Username, Link, Full Name, etc.
 */
export function parseCSV(csvContent: string): string[] {
  if (!csvContent || typeof csvContent !== 'string') {
    return [];
  }

  const lines = csvContent.split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  // Find the header line and locate the Username column index
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  
  // Find Username column (case-insensitive)
  const usernameIndex = headers.findIndex(
    (h) => h.toLowerCase().trim() === 'username'
  );

  // If no Username column found, fall back to regular parse
  if (usernameIndex === -1) {
    return parse(csvContent);
  }

  const validUsernames: string[] = [];
  const seen = new Set<string>();

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = parseCSVLine(line);
    if (columns.length > usernameIndex) {
      const username = columns[usernameIndex].trim();
      
      if (validateUsername(username)) {
        const lowerCase = username.toLowerCase();
        if (!seen.has(lowerCase)) {
          seen.add(lowerCase);
          validUsernames.push(username);
        }
      }
    }
  }

  return validUsernames;
}

/**
 * Parses a single CSV line, handling quoted values with commas inside.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Parses file content and extracts all valid Instagram usernames.
 * Automatically detects CSV format and uses appropriate parser.
 */
export function parseFile(fileContent: string): string[] {
  // Check if content looks like CSV (has comma-separated header with Username)
  const firstLine = fileContent.split(/\r?\n/)[0] || '';
  if (firstLine.toLowerCase().includes('username') && firstLine.includes(',')) {
    return parseCSV(fileContent);
  }
  
  return parse(fileContent);
}

// Export as an object implementing the interface for dependency injection
export const followerParser: FollowerParser = {
  parse,
  parseFile,
  parseCSV,
  validateUsername,
};

export default followerParser;
