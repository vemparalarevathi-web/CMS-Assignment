import { useState } from 'react';

/**
 * Editing state for the in-progress block list is kept local to this
 * component (not Redux) — it's transient UI state that only matters while
 * a form is open, and only gets pushed to Redux/the server on explicit Save.
 */

const BLOCK_LABELS = {
  header: 'Heading',
  paragraph: 'Paragraph',
  list: 'List',
  table: 'Table',
  equation: 'Equation',
  callout: 'Callout'
};

let uid = 0;
const tempId = () => `tmp-${Date.now()}-${uid++}`;

function defaultDataFor(type) {
  switch (type) {
    case 'header':
      return { text: '', level: 2 };
    case 'paragraph':
      return { text: '' };
    case 'list':
      return { ordered: false, items: [{ text: '', items: [] }] };
    case 'table':
      return { headers: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'equation':
      return { equation: '', displayMode: true };
    case 'callout':
      return { text: '', variant: 'info' };
    default:
      return {};
  }
}

export default function BlockEditor({ blocks, onChange }) {
  const [addType, setAddType] = useState('paragraph');

  const updateBlock = (id, data) => {
    onChange(blocks.map((b) => (b._id === id ? { ...b, data } : b)));
  };

  const removeBlock = (id) => {
    onChange(blocks.filter((b) => b._id !== id));
  };

  const moveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const copy = [...blocks];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    onChange(copy.map((b, i) => ({ ...b, order: i })));
  };

  const addBlock = () => {
    const newBlock = { _id: tempId(), type: addType, data: defaultDataFor(addType), order: blocks.length };
    onChange([...blocks, newBlock]);
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <div key={block._id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {BLOCK_LABELS[block.type] || block.type}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="px-2 py-1 rounded border border-gray-200 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
                className="px-2 py-1 rounded border border-gray-200 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block._id)}
                className="px-2 py-1 rounded border border-red-200 text-red-600"
              >
                Remove
              </button>
            </div>
          </div>

          <BlockFields block={block} onDataChange={(data) => updateBlock(block._id, data)} />
        </div>
      ))}

      <div className="flex items-center gap-2 pt-2">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-3 py-2"
        >
          {Object.entries(BLOCK_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addBlock}
          className="text-sm font-medium px-4 py-2 rounded-md border border-brand-600 text-brand-700 hover:bg-brand-50"
        >
          + Add block
        </button>
      </div>
    </div>
  );
}

function BlockFields({ block, onDataChange }) {
  const { type, data } = block;

  if (type === 'header') {
    return (
      <div className="flex gap-3">
        <select
          value={data.level || 2}
          onChange={(e) => onDataChange({ ...data, level: Number(e.target.value) })}
          className="border border-gray-300 rounded-md text-sm px-2"
        >
          {[1, 2, 3, 4].map((l) => (
            <option key={l} value={l}>
              H{l}
            </option>
          ))}
        </select>
        <input
          value={data.text || ''}
          onChange={(e) => onDataChange({ ...data, text: e.target.value })}
          placeholder="Heading text"
          className="flex-1 border border-gray-300 rounded-md text-sm px-3 py-2"
        />
      </div>
    );
  }

  if (type === 'paragraph') {
    return (
      <textarea
        value={data.text || ''}
        onChange={(e) => onDataChange({ ...data, text: e.target.value })}
        placeholder="Paragraph text. Supports inline $math$ and **bold**."
        rows={4}
        className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
      />
    );
  }

  if (type === 'callout') {
    return (
      <div className="space-y-2">
        <select
          value={data.variant || 'info'}
          onChange={(e) => onDataChange({ ...data, variant: e.target.value })}
          className="border border-gray-300 rounded-md text-sm px-2 py-1"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
        </select>
        <textarea
          value={data.text || ''}
          onChange={(e) => onDataChange({ ...data, text: e.target.value })}
          rows={2}
          className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
        />
      </div>
    );
  }

  if (type === 'equation') {
    return (
      <div className="space-y-2">
        <input
          value={data.equation || ''}
          onChange={(e) => onDataChange({ ...data, equation: e.target.value })}
          placeholder="Raw LaTeX, e.g. E = mc^2"
          className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 font-mono"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={!!data.displayMode}
            onChange={(e) => onDataChange({ ...data, displayMode: e.target.checked })}
          />
          Display as block equation (centered, larger)
        </label>
      </div>
    );
  }

  if (type === 'list') {
    return <ListEditor data={data} onDataChange={onDataChange} />;
  }

  if (type === 'table') {
    return <TableEditor data={data} onDataChange={onDataChange} />;
  }

  return <p className="text-xs text-gray-400">Unsupported block type.</p>;
}

function ListEditor({ data, onDataChange }) {
  const items = data.items || [];

  const setItems = (items) => onDataChange({ ...data, items });

  const updateItem = (index, text) => {
    const copy = [...items];
    copy[index] = { ...copy[index], text };
    setItems(copy);
  };

  const addItem = () => setItems([...items, { text: '', items: [] }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const addChild = (index) => {
    const copy = [...items];
    copy[index] = { ...copy[index], items: [...(copy[index].items || []), { text: '' }] };
    setItems(copy);
  };
  const updateChild = (index, childIndex, text) => {
    const copy = [...items];
    const children = [...(copy[index].items || [])];
    children[childIndex] = { text };
    copy[index] = { ...copy[index], items: children };
    setItems(copy);
  };
  const removeChild = (index, childIndex) => {
    const copy = [...items];
    copy[index] = { ...copy[index], items: (copy[index].items || []).filter((_, i) => i !== childIndex) };
    setItems(copy);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={!!data.ordered}
          onChange={(e) => onDataChange({ ...data, ordered: e.target.checked })}
        />
        Numbered list
      </label>

      {items.map((item, index) => (
        <div key={index} className="border border-gray-100 rounded-md p-2">
          <div className="flex items-center gap-2">
            <input
              value={item.text || ''}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className="flex-1 border border-gray-300 rounded-md text-sm px-2 py-1"
            />
            <button type="button" onClick={() => addChild(index)} className="text-xs text-brand-700">
              + Nested
            </button>
            <button type="button" onClick={() => removeItem(index)} className="text-xs text-red-600">
              Remove
            </button>
          </div>

          {(item.items || []).length > 0 && (
            <div className="ml-6 mt-2 space-y-1">
              {item.items.map((child, childIndex) => (
                <div key={childIndex} className="flex items-center gap-2">
                  <span className="text-gray-300 text-xs">—</span>
                  <input
                    value={child.text || ''}
                    onChange={(e) => updateChild(index, childIndex, e.target.value)}
                    placeholder={`Sub-item ${childIndex + 1}`}
                    className="flex-1 border border-gray-300 rounded-md text-sm px-2 py-1"
                  />
                  <button type="button" onClick={() => removeChild(index, childIndex)} className="text-xs text-red-600">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={addItem} className="text-sm font-medium text-brand-700">
        + Add item
      </button>
    </div>
  );
}

function TableEditor({ data, onDataChange }) {
  const headers = data.headers || [];
  const rows = data.rows || [];

  const updateHeader = (index, value) => {
    const copy = [...headers];
    copy[index] = value;
    onDataChange({ ...data, headers: copy });
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const copy = rows.map((r) => [...r]);
    copy[rowIndex][colIndex] = value;
    onDataChange({ ...data, rows: copy });
  };

  const addColumn = () => {
    onDataChange({
      ...data,
      headers: [...headers, `Column ${headers.length + 1}`],
      rows: rows.map((r) => [...r, ''])
    });
  };

  const removeColumn = (colIndex) => {
    onDataChange({
      ...data,
      headers: headers.filter((_, i) => i !== colIndex),
      rows: rows.map((r) => r.filter((_, i) => i !== colIndex))
    });
  };

  const addRow = () => onDataChange({ ...data, rows: [...rows, headers.map(() => '')] });
  const removeRow = (rowIndex) => onDataChange({ ...data, rows: rows.filter((_, i) => i !== rowIndex) });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-1">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>
                <div className="flex items-center gap-1">
                  <input
                    value={h}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    className="w-32 border border-gray-300 rounded-md px-2 py-1 text-xs font-semibold"
                  />
                  <button type="button" onClick={() => removeColumn(i)} className="text-xs text-red-600">
                    ✕
                  </button>
                </div>
              </th>
            ))}
            <th>
              <button type="button" onClick={addColumn} className="text-xs text-brand-700">
                + Col
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex}>
                  <input
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    className="w-32 border border-gray-300 rounded-md px-2 py-1"
                  />
                </td>
              ))}
              <td>
                <button type="button" onClick={() => removeRow(rowIndex)} className="text-xs text-red-600">
                  Remove row
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addRow} className="text-sm font-medium text-brand-700 mt-2">
        + Add row
      </button>
    </div>
  );
}
