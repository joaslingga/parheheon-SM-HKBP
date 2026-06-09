"use client";

import { useState } from "react";
import { Film, Image as ImageIcon, Layers } from "lucide-react";

export default function ContentList({ categories = [], items = [] }) {
  const [selectedCatId, setSelectedCatId] = useState("all");

  const filteredItems = selectedCatId === "all"
    ? items
    : items.filter(item => item.category_id === parseInt(selectedCatId, 10));

  const isVideo = (url) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
    return (
      cleanUrl.endsWith(".mp4") ||
      cleanUrl.endsWith(".webm") ||
      cleanUrl.endsWith(".ogg") ||
      cleanUrl.endsWith(".mov") ||
      (url.includes("/uploads/candidate-") && (cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".mov") || cleanUrl.endsWith(".webm"))) ||
      (url.includes("/uploads/highlight-") && (cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".mov") || cleanUrl.endsWith(".webm")))
    );
  };

  return (
    <div className="content-list-wrapper">
      {/* Category Tabs */}
      <div className="content-tabs">
        <button
          onClick={() => setSelectedCatId("all")}
          className={`content-tab-btn ${selectedCatId === "all" ? "active" : ""}`}
        >
          <Layers size={16} />
          <span>Semua</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCatId(cat.id)}
            className={`content-tab-btn ${selectedCatId === cat.id ? "active" : ""}`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid-3" style={{ marginTop: "32px" }}>
        {filteredItems.length === 0 ? (
          <div className="no-content-message">
            <p>Belum ada content pada kategori ini.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const hasVideo = isVideo(item.image_url);
            return (
              <div key={item.id} className="content-item-card">
                <div className="content-media-container">
                  {hasVideo ? (
                    <video
                      src={item.image_url}
                      controls
                      playsInline
                      className="content-media"
                    />
                  ) : (
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop"}
                      alt={item.name}
                      className="content-media"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                  )}
                  <div className="media-badge">
                    {hasVideo ? <Film size={12} /> : <ImageIcon size={12} />}
                    <span>{hasVideo ? "Video" : "Foto"}</span>
                  </div>
                </div>
                <div className="content-item-body">
                  <h3 className="content-item-title">{item.name}</h3>
                  <p className="content-item-description">{item.description || "Tidak ada deskripsi."}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .content-list-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .content-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          padding: 8px;
          background: rgba(30, 58, 138, 0.03);
          border-radius: 100px;
          border: 1px solid var(--border);
          max-width: fit-content;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .content-tabs {
            border-radius: 20px;
            max-width: 100%;
            justify-content: flex-start;
          }
        }
        .content-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 100px;
          border: none;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: var(--text-muted);
        }
        .content-tab-btn:hover {
          color: var(--primary);
          background: rgba(30, 58, 138, 0.05);
        }
        .content-tab-btn.active {
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          box-shadow: 0 4px 14px rgba(30, 58, 138, 0.25);
        }
        .content-item-card {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 20px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        .content-item-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(30, 58, 138, 0.1);
        }
        .content-media-container {
          position: relative;
          width: 100%;
          height: auto;
          overflow: hidden;
          background: #0f172a;
        }
        .content-media {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          transition: transform 0.5s ease;
        }
        .content-item-card:hover .content-media {
          transform: scale(1.02);
        }
        .media-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: white;
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: none;
        }
        .content-item-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .content-item-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .content-item-description {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .no-content-message {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
          background: rgba(30, 58, 138, 0.02);
          border-radius: 16px;
          border: 1px dashed var(--border);
        }
        .no-content-message p {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
        }
      ` }} />
    </div>
  );
}
