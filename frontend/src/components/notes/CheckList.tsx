"use client";

import { useState, type KeyboardEvent } from "react";
import type { ChecklistItem } from "../../types/note";
import { useLanguage } from "../language/LanguageProvider";

type CheckListProps = {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readOnly?: boolean;
};

export default function CheckList({
  items,
  onChange,
  readOnly = false,
}: CheckListProps) {
  const { dict, language } = useLanguage();
  const t = dict.editor;
  const [newItemText, setNewItemText] = useState("");

  const handleToggle = (id: string) => {
    if (readOnly) return;
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onChange(updated);
  };

  const handleItemTextChange = (id: string, text: string) => {
    if (readOnly) return;
    const updated = items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    onChange(updated);
  };

  const handleRemove = (id: string) => {
    if (readOnly) return;
    onChange(items.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    if (readOnly || !newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false,
    };
    onChange([...items, newItem]);
    setNewItemText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddItem();
    }
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="checklist-container" lang={language}>
      {items.length > 0 && (
        <div className="checklist-progress">
          <small>
            {completedCount} / {items.length} {t.completed}
          </small>
          <div className="checklist-progress-bar">
            <div
              className="checklist-progress-fill"
              style={{
                width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <ul className="checklist-items" role="list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`checklist-item ${item.completed ? "is-completed" : ""}`}
          >
            <input
              type="checkbox"
              id={`check-${item.id}`}
              checked={item.completed}
              onChange={() => handleToggle(item.id)}
              disabled={readOnly}
              className="checklist-checkbox"
              aria-label={item.text || "Checklist item"}
            />

            {readOnly ? (
              <span className="checklist-text">{item.text}</span>
            ) : (
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                className="checklist-item-input"
                placeholder={t.checklistAdd}
              />
            )}

            {!readOnly && (
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="checklist-remove-button"
                aria-label={`Remove ${item.text || "item"}`}
                title="Remove item"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      {!readOnly && (
        <div className="checklist-new-item">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.checklistAdd}
            className="checklist-new-input"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="checklist-add-button"
          >
            + {t.addItemButton}
          </button>
        </div>
      )}
    </div>
  );
}
