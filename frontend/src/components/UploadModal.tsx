// Upload modal for adding new clothing items with image preview
"use client";

import { useState, useRef } from "react";
import { uploadItem } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const categories = ["top", "bottom", "footwear", "accessory", "outerwear", "ethnic"];

export default function UploadModal({ isOpen, onClose, onUploaded }: UploadModalProps) {
  const { token } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category || !token) return;

    setLoading(true);
    setError("");
    try {
      logger.info(`UploadModal: Submitting new item (category: ${category})`);
      await uploadItem(token, file, category, color || undefined, tags.length > 0 ? tags : undefined);
      logger.info(`UploadModal: Upload successful`);
      onUploaded();
      onClose();
      // Reset form
      setFile(null);
      setPreview(null);
      setCategory("");
      setColor("");
      setTags([]);
    } catch (err) {
      logger.error(`UploadModal: Upload failed`, err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "24px" }}>
          Add Clothing Item
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* File upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              background: preview ? "transparent" : "var(--bg-primary)",
              transition: "border-color 0.2s ease",
              position: "relative",
              overflow: "hidden",
              minHeight: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxHeight: "200px",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div>
                <p style={{ fontSize: "2rem", marginBottom: "8px" }}>📷</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Click to upload a photo
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>
                  Background will be removed automatically
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Category *
            </label>
            <select
              className="select-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Color
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g., navy blue"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Tags
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="input-field"
                type="text"
                placeholder="e.g., casual, summer"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
              />
              <button type="button" onClick={handleAddTag} className="btn-ghost" style={{ whiteSpace: "nowrap" }}>
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {tags.map((tag) => (
                  <span key={tag} className="tag-chip" style={{ cursor: "pointer" }} onClick={() => handleRemoveTag(tag)}>
                    {tag} ✕
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!file || !category || loading}
              style={{ flex: 1 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: "18px", height: "18px" }} /> Processing...</>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
