/* eslint-disable */
"use client";

export function SimpleMarkdown({ content }: { content: string }) {
  if (!content) return null;
  
  // Split into lines for processing
  const lines = content.split('\n');
  const result: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Horizontal rule
    if (line === '---') {
      if (inTable) {
        // Close table
        result.push(buildTable(tableRows));
        tableRows = [];
        inTable = false;
      }
      result.push('<hr class="my-4 border-border" />');
      continue;
    }
    
    // Table row
    if (line.startsWith('|') && line.endsWith('|')) {
      const cols = line.slice(1, -1).split('|').map(c => c.trim());
      
      // Check if separator row
      if (cols.every(c => /^[-:]+$/.test(c))) continue;
      
      if (!inTable) {
        if (tableRows.length > 0) {
          result.push(buildTable(tableRows));
          tableRows = [];
        }
        inTable = true;
      }
      tableRows.push(line);
      continue;
    } else {
      // Not a table row
      if (inTable && tableRows.length > 0) {
        result.push(buildTable(tableRows));
        tableRows = [];
        inTable = false;
      }
      
      // Process regular line with inline markdown
      result.push(processInline(line));
    }
  }
  
  // Close any remaining table
  if (inTable && tableRows.length > 0) {
    result.push(buildTable(tableRows));
  }
  
  return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: result.join('') }} />;
}

function buildTable(rows: string[]): string {
  if (rows.length === 0) return '';
  
  const thead = rows[0].slice(1, -1).split('|')
    .map(c => `<th class="border border-border px-3 py-2 bg-muted font-medium">${processCell(c.trim())}</th>`)
    .join('');
  
  const tbody = rows.slice(1).map(row => {
    const cells = row.slice(1, -1).split('|').map(c => c.trim());
    return `<tr>${cells.map(c => `<td class="border border-border px-3 py-2">${processCell(c)}</td>`).join('')}</tr>`;
  }).join('');
  
  return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse">${rows.length > 1 ? `<thead><tr>${thead}</tr></thead>` : ''}<tbody>${tbody}</tbody></table></div>`;
}

function processInline(text: string): string {
  // Escape HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener">$1</a>')
    // Hashtags
    .replace(/#([a-zA-Z0-9_]+)/g, '<a href="/hashtag/$1" onclick="event.stopPropagation()" class="text-primary hover:underline font-medium cursor-pointer">#$1</a>');
  
  return html + '<br />';
}

function processCell(text: string): string {
  // Process inline markdown for table cells (bold, italic, code, hashtags)
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
    .replace(/#([a-zA-Z0-9_]+)/g, '<span class="text-primary font-medium">#$1</span>');
}
