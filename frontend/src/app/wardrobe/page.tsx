// Wardrobe page - grid of clothing items with filters and upload
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getItems, updateItemStatus, deleteItem } from "@/services/api";
import ItemCard from "@/components/ItemCard";
import UploadModal from "@/components/UploadModal";
import DemoModal from "@/components/DemoModal";
import { logger } from "@/utils/logger";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface Item {
  id: string;
  image_url: string;
  category: string;
  color: string | null;
  tags: string[];
  status: string;
  created_at: string;
}

export default function WardrobePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    logger.info("WardrobePage mounted");
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    setFetching(true);
    try {
      logger.info(`Fetching items (statusFilter: ${statusFilter}, categoryFilter: ${categoryFilter})`);
      const data = await getItems(token, statusFilter || undefined, categoryFilter || undefined);
      logger.info(`Successfully fetched ${data.length} items`);
      setItems(data);
    } catch {
      logger.error("Failed to fetch items from API");
      console.error("Failed to fetch items");
    } finally {
      setFetching(false);
    }
  }, [token, statusFilter, categoryFilter]);

  useEffect(() => {
    if (token) fetchItems();
  }, [token, fetchItems]);

  const handleStatusChange = async (id: string, status: string) => {
    if (!token) return;
    try {
      logger.info(`Updating item ${id} status to ${status}`);
      await updateItemStatus(token, id, status);
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
    } catch {
      logger.error(`Failed to update status for item ${id}`);
      console.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Remove this item from your wardrobe?")) return;
    try {
      logger.info(`Deleting item ${id}`);
      await deleteItem(token, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      logger.info(`Successfully deleted item ${id}`);
    } catch {
      logger.error(`Failed to delete item ${id}`);
      console.error("Failed to delete item");
    }
  };

  if (loading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  const categories = ["top", "bottom", "footwear", "accessory", "outerwear", "ethnic"];
  const statusCounts = {
    all: items.length,
    CLEAN: items.filter((i) => i.status === "CLEAN").length,
    WORN: items.filter((i) => i.status === "WORN").length,
    LAUNDRY: items.filter((i) => i.status === "LAUNDRY").length,
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>My Wardrobe</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            {items.length} item{items.length !== 1 ? "s" : ""} in your collection
          </p>
        </div>
        <button
          onClick={() => IS_DEMO_MODE ? setDemoModalOpen(true) : setUploadOpen(true)}
          className="btn-primary"
          style={IS_DEMO_MODE ? { opacity: 0.7 } : {}}
        >
          + Add Item
        </button>
      </div>

      {/* Status tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "20px",
        overflowX: "auto",
        paddingBottom: "4px",
      }}>
        {[
          { key: "", label: "All", count: statusCounts.all },
          { key: "CLEAN", label: "Clean", count: statusCounts.CLEAN },
          { key: "WORN", label: "Worn", count: statusCounts.WORN },
          { key: "LAUNDRY", label: "Laundry", count: statusCounts.LAUNDRY },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-full)",
              border: statusFilter === tab.key ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
              background: statusFilter === tab.key ? "rgba(124, 58, 237, 0.12)" : "transparent",
              color: statusFilter === tab.key ? "var(--color-primary-light)" : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ marginBottom: "28px" }}>
        <select
          className="select-field"
          style={{ maxWidth: "200px" }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Items grid */}
      {fetching ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ width: "40px", height: "40px" }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 24px",
          color: "var(--text-secondary)",
        }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>🧥</span>
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Your wardrobe is empty</p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Start by uploading photos of your clothing items
          </p>
          <button onClick={() => setUploadOpen(true)} className="btn-primary" style={{ marginTop: "24px" }}>
            + Add Your First Item
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px",
        }}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={fetchItems}
      />

      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
}
