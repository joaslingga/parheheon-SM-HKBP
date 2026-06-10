"use client";

import { useState } from "react";
import { 
  updateHeaderImageAction, 
  addHighlightAction, 
  deleteHighlightAction,
  addVotingCandidateAction,
  updateVotingCandidateAction,
  deleteVotingCandidateAction,
  updateQuickStatsAction,
  restartServerAction,
  shutdownServerAction
} from "../app/actions";
import { useRouter } from "next/navigation";
import { Image, Sparkles, Plus, Trash2, ArrowLeft, CheckCircle2, ShieldAlert, AlertCircle, Edit, Award, Power } from "lucide-react";
import Link from "next/link";

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

export default function SuperadminDashboard({ 
  currentHeaderImage, 
  statsImageUrl,
  highlights,
  votingCategories = [],
  votingCandidates = []
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("banner"); // 'banner', 'highlight', 'content', 'system-control'
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(currentHeaderImage);
  const [statsImagePreview, setStatsImagePreview] = useState(statsImageUrl);
  const [formLoading, setFormLoading] = useState(false);

  async function handleUpdateQuickStats(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await updateQuickStatsAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        router.refresh();
      }
    } catch (err) {
      setError("Gagal memperbarui Quick Stats.");
    } finally {
      setFormLoading(false);
    }
  }
  
  // Voting Candidate Management States
  const [selectedCategoryId, setSelectedCategoryId] = useState(votingCategories[0]?.id || null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  async function handleUpdateHeader(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await updateHeaderImageAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        router.refresh();
      }
    } catch (err) {
      setError("Gagal memperbarui gambar header.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleAddHighlight(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await addHighlightAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        event.target.reset();
        router.refresh();
      }
    } catch (err) {
      setError("Gagal menambahkan highlight.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteHighlight(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus highlight acara ini?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await deleteHighlightAction(id);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Highlight berhasil dihapus.");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal menghapus highlight.");
    }
  }

  // Voting Candidates handlers
  async function handleAddCandidate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("categoryId", selectedCategoryId);

    try {
      const res = await addVotingCandidateAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        setIsAddModalOpen(false);
        event.target.reset();
        router.refresh();
      }
    } catch (err) {
      setError("Gagal menambahkan content.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdateCandidate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("candidateId", editingCandidate.id);

    try {
      const res = await updateVotingCandidateAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        setEditingCandidate(null);
        router.refresh();
      }
    } catch (err) {
      setError("Gagal memperbarui data content.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteCandidate(candidateId) {
    if (!confirm("Apakah Anda yakin ingin menghapus content ini?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await deleteVotingCandidateAction(candidateId);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Content berhasil dihapus.");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal menghapus content.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      {/* Premium Glassmorphism Upload Loading Overlay */}
      {formLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          color: "white",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "24px",
            padding: "40px 60px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            maxWidth: "90%",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          }}>
            <div className="upload-spinner" style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              border: "4px solid rgba(255, 255, 255, 0.1)",
              borderTopColor: "var(--secondary)",
              borderRightColor: "var(--secondary)",
              animation: "spin 1s linear infinite"
            }} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", margin: 0, fontFamily: "var(--font-title)" }}>
                Sedang Mengunggah & Memproses...
              </h3>
              <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.95rem", maxWidth: "320px", lineHeight: "1.5" }}>
                Mohon tunggu beberapa saat. Berkas media Anda sedang diunggah ke server dan disimpan ke database.
              </p>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          ` }} />
        </div>
      )}

      {/* Superadmin Header */}
      <div className="admin-header">
        <div className="admin-header-container">
          <div>
            <Link href="/" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "10px", fontSize: "0.85rem", padding: "4px 8px" }}>
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
            <h1 style={{ color: "var(--primary)", fontFamily: "var(--font-title)", fontSize: "2rem" }}>
              Panel Super Admin<span style={{ color: "var(--secondary)" }}>.</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: "flex",
        gap: "16px",
        maxWidth: "1200px",
        margin: "0 auto 24px",
        borderBottom: "2px solid var(--border)",
        padding: "0 24px 8px",
        marginTop: "24px",
        alignItems: "center"
      }}>
        <button
          onClick={() => {
            setActiveTab("banner");
            setError("");
            setSuccess("");
          }}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "1rem",
            fontWeight: 700,
            color: activeTab === "banner" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "banner" ? "3px solid var(--primary)" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Image size={18} /> Banner
        </button>
        <button
          onClick={() => {
            setActiveTab("highlight");
            setError("");
            setSuccess("");
          }}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "1rem",
            fontWeight: 700,
            color: activeTab === "highlight" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "highlight" ? "3px solid var(--primary)" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Sparkles size={18} /> Highlight
        </button>
        <button
          onClick={() => {
            setActiveTab("content");
            setError("");
            setSuccess("");
            if (!selectedCategoryId && votingCategories.length > 0) {
              setSelectedCategoryId(votingCategories[0].id);
            }
          }}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "1rem",
            fontWeight: 700,
            color: activeTab === "content" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "content" ? "3px solid var(--primary)" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Award size={18} /> Content
        </button>
        <button
          onClick={() => {
            setActiveTab("system-control");
            setError("");
            setSuccess("");
          }}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "1rem",
            fontWeight: 700,
            color: activeTab === "system-control" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "system-control" ? "3px solid var(--primary)" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
            marginLeft: "auto"
          }}
        >
          <Power size={18} /> Kontrol Sistem
        </button>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        {error && (
          <div className="alert alert-danger" style={{ maxWidth: "1200px", margin: "0 auto 24px" }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ maxWidth: "1200px", margin: "0 auto 24px" }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Tab 1: Banner */}
        {activeTab === "banner" && (
          <div className="grid-2">
            {/* Section 1: Change Header Image */}
            <div className="card">
              <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Image size={24} style={{ color: "var(--primary)" }} /> Pengaturan Gambar Header Banner
              </h3>

              <form onSubmit={handleUpdateHeader} encType="multipart/form-data">
                <div className="form-group">
                  <label className="form-label" htmlFor="imageUrl">URL Gambar Banner Utama</label>
                  <input 
                    id="imageUrl" 
                    name="imageUrl" 
                    type="url" 
                    defaultValue={currentHeaderImage}
                    onChange={(e) => setImagePreview(e.target.value)}
                    className="form-input" 
                    placeholder="https://example.com/gambar-banner.jpg"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="imageFile">Atau Unggah Gambar dari Local</label>
                  <input 
                    id="imageFile" 
                    name="imageFile" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pratinjau Banner Saat Ini</label>
                  <div className="current-header-preview">
                    <img 
                      src={imagePreview || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop"} 
                      alt="Pratinjau Banner"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-secondary" disabled={formLoading} style={{ marginTop: "10px" }}>
                  {formLoading ? "Menyimpan Gambar..." : "Perbarui Gambar Banner"}
                </button>
              </form>
            </div>

            {/* Section 4: Quick Stats Manager */}
            <div className="card">
              <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Image size={24} style={{ color: "var(--primary)" }} /> Pengaturan Banner Statistik Beranda (1 Gambar Tanpa Teks)
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
                Kustomisasi gambar banner statistik yang muncul di halaman utama beranda. Bagian ini hanya menampilkan satu gambar banner bersih tanpa teks.
              </p>

              <form onSubmit={handleUpdateQuickStats} encType="multipart/form-data">
                <div className="form-group">
                  <label className="form-label" htmlFor="stats_imageUrl">URL Gambar Banner</label>
                  <input 
                    id="stats_imageUrl" 
                    name="stats_imageUrl" 
                    type="url" 
                    defaultValue={statsImageUrl?.startsWith("/uploads/") ? "" : (statsImageUrl || "")}
                    onChange={(e) => setStatsImagePreview(e.target.value)}
                    className="form-input" 
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stats_imageFile">Atau Unggah Gambar dari Local</label>
                  <input 
                    id="stats_imageFile" 
                    name="stats_imageFile" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setStatsImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pratinjau Banner Statistik Saat Ini</label>
                  <div className="current-header-preview" style={{ maxHeight: "250px", overflow: "hidden", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <img 
                      src={statsImagePreview || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop"} 
                      alt="Pratinjau Banner Statistik"
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-secondary" disabled={formLoading} style={{ marginTop: "10px" }}>
                  {formLoading ? "Menyimpan Gambar..." : "Perbarui Gambar Banner Stats"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 1b: Highlight */}
        {activeTab === "highlight" && (
          <>
            <div className="card">
              <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Sparkles size={24} style={{ color: "var(--primary)" }} /> Tambah Highlight Acara Baru
              </h3>

              <form onSubmit={handleAddHighlight} encType="multipart/form-data">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Judul Acara / Highlight</label>
                  <input 
                    id="title" 
                    name="title" 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Pentas Seni Anak Sekolah Minggu"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Deskripsi Acara</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows="3"
                    className="form-input" 
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                    placeholder="Tuliskan keterangan detail mengenai acara yang diadakan..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="highlightImageUrl">URL Gambar Acara</label>
                  <input 
                    id="highlightImageUrl" 
                    name="imageUrl" 
                    type="url" 
                    className="form-input" 
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="highlightImageFile">Atau Unggah Gambar/Video dari Local</label>
                  <input 
                    id="highlightImageFile" 
                    name="imageFile" 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > 104857600) {
                        alert("Ukuran file tidak boleh melebihi 100MB.");
                        e.target.value = "";
                      }
                    }}
                    className="form-input" 
                  />
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Gunakan URL gambar/video publik ATAU pilih file dari local untuk diunggah.
                  </small>
                </div>

                <button type="submit" className="btn btn-secondary" disabled={formLoading} style={{ marginTop: "10px" }}>
                  <Plus size={18} style={{ marginRight: "6px" }} /> Tambahkan Highlight Acara
                </button>
              </form>
            </div>

            {/* Section 3: Highlight List Manager */}
            <div className="card" style={{ marginTop: "40px" }}>
              <h3 className="highlight-title" style={{ marginBottom: "20px" }}>Daftar Highlight Acara Saat Ini</h3>
              
              {highlights.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
                  <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                  <p>Belum ada highlight acara yang terdaftar.</p>
                </div>
              ) : (
                <div className="highlight-list">
                  {highlights.map((item) => {
                    const isVid = isVideo(item.image_url);
                    return (
                      <div key={item.id} className="highlight-item">
                        <div className="highlight-item-info">
                          {isVid ? (
                            <video src={item.image_url} controls playsInline preload="metadata" className="highlight-item-thumb" style={{ objectFit: "cover" }} />
                          ) : (
                            <img src={item.image_url} alt={item.title} className="highlight-item-thumb" />
                          )}
                          <div className="highlight-item-details">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                          </div>
                        </div>
                      <button 
                        onClick={() => handleDeleteHighlight(item.id)} 
                        className="btn btn-danger" 
                        style={{ width: "auto", padding: "8px 16px", display: "inline-flex", gap: "6px" }}
                      >
                        <Trash2 size={16} /> Hapus
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 3: Manage Content */}
        {activeTab === "content" && (
          <div>
            <div className="suadmin-voting-grid">
              {/* Left Column: Categories List */}
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 className="highlight-title" style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Kategori Content</h3>
                <div className="categories-sidebar-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {votingCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setError("");
                        setSuccess("");
                      }}
                      className={`sidebar-cat-btn ${selectedCategoryId === cat.id ? "active" : ""}`}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        backgroundColor: selectedCategoryId === cat.id ? "var(--primary)" : "var(--bg-light)",
                        color: selectedCategoryId === cat.id ? "white" : "var(--text-main)",
                        transition: "all 0.2s ease",
                        boxShadow: selectedCategoryId === cat.id ? "0 4px 12px rgba(30,58,138,0.2)" : "none"
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Content Management Panel */}
              <div className="card" style={{ padding: "24px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  borderBottom: "2px solid var(--border)",
                  paddingBottom: "16px"
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.4rem", color: "var(--primary)", fontFamily: "var(--font-title)", fontWeight: 800 }}>
                      Daftar Content — {votingCategories.find(c => c.id === selectedCategoryId)?.name || "Kategori"}
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                      {votingCategories.find(c => c.id === selectedCategoryId)?.description || "Kategori deskripsi"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setIsAddModalOpen(true);
                    }}
                    className="btn btn-secondary"
                    style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Plus size={16} /> Tambah Content Baru
                  </button>
                </div>

                {/* Content Grid */}
                <div className="suadmin-candidate-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "20px"
                }}>
                  {votingCandidates.filter(c => c.category_id === selectedCategoryId).length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                      <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                      <p style={{ fontWeight: 600 }}>Belum ada content untuk kategori ini.</p>
                      <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Silakan klik tombol "Tambah Content Baru" di atas untuk menambahkan.</p>
                    </div>
                  ) : (
                    votingCandidates
                      .filter(c => c.category_id === selectedCategoryId)
                      .map((candidate) => {
                        const isVid = isVideo(candidate.image_url);
                        return (
                          <div
                            key={candidate.id}
                            style={{
                              border: "1px solid var(--border)",
                              borderRadius: "14px",
                              overflow: "hidden",
                              display: "flex",
                              flexDirection: "column",
                              backgroundColor: "var(--bg-light)",
                              transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                          >
                            <div style={{ height: "auto", minHeight: "150px", position: "relative", backgroundColor: "#0f172a" }}>
                              {isVid ? (
                                <video
                                  src={candidate.image_url}
                                  controls
                                  style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                                />
                              ) : (
                                <img
                                  src={candidate.image_url}
                                  alt={candidate.name}
                                  style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop";
                                  }}
                                />
                              )}
                              <div style={{
                                position: "absolute",
                                bottom: "12px",
                                right: "12px",
                                backgroundColor: "rgba(15, 23, 42, 0.85)",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                backdropFilter: "blur(4px)"
                              }}>
                                {isVid ? "🎥 Video" : "🖼️ Foto"}
                              </div>
                            </div>
                            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                              <h4 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                                {candidate.name}
                              </h4>
                              <p style={{
                                fontSize: "0.88rem",
                                color: "var(--text-muted)",
                                margin: "0 0 20px 0",
                                flex: 1,
                                lineHeight: 1.5
                              }}>
                                {candidate.description || "Tidak ada penjelasan tambahan."}
                              </p>
                              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                                <button
                                  onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    setEditingCandidate(candidate);
                                  }}
                                  className="btn btn-secondary"
                                  style={{
                                    flex: 1,
                                    padding: "10px",
                                    fontSize: "0.88rem",
                                    display: "inline-flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                >
                                  <Edit size={14} /> Ubah
                                </button>
                                <button
                                  onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    handleDeleteCandidate(candidate.id);
                                  }}
                                  className="btn btn-danger"
                                  style={{
                                    flex: 1,
                                    padding: "10px",
                                    fontSize: "0.88rem",
                                    display: "inline-flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                >
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            {/* CSS styling override inline for split grid */}
            <style dangerouslySetInnerHTML={{ __html: `
              .suadmin-voting-grid {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: 24px;
                align-items: start;
                max-width: 1200px;
                margin: 0 auto;
              }
              @media (max-width: 768px) {
                .suadmin-voting-grid {
                  grid-template-columns: 1fr;
                }
              }
              .sidebar-cat-btn:hover {
                transform: translateX(4px);
              }
            ` }} />
          </div>
        )}

        {/* Tab 3: System Control Panel */}
        {activeTab === "system-control" && (
          <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "30px" }}>
            <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Power size={24} style={{ color: "var(--primary)" }} /> Kontrol Sistem Server
            </h3>
            
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "24px", lineHeight: "1.6" }}>
              Menu ini digunakan untuk merestart atau mematikan (shutdown) server aplikasi Parheheon. Hanya lakukan tindakan ini jika diperlukan (misalnya saat terjadi penyesuaian sistem atau rilis pembaruan).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Restart Section */}
              <div style={{ padding: "20px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "var(--bg-light)" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--text-main)", fontWeight: 700 }}>Mulai Ulang (Restart) Aplikasi</h4>
                <p style={{ margin: "0 0 16px 0", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: "1.5" }}>
                  Tindakan ini akan menghentikan proses aplikasi sementara dan menyalakannya kembali dalam hitungan detik. Direkomendasikan jika server mengalami kelambatan atau setelah ada perubahan konfigurasi tertentu.
                </p>
                <button
                  onClick={async () => {
                    if (confirm("Apakah Anda yakin ingin MERESTART server aplikasi Parheheon?")) {
                      setError("");
                      setSuccess("");
                      setFormLoading(true);
                      try {
                        const res = await restartServerAction();
                        if (res?.error) {
                          setError(res.error);
                        } else {
                          setSuccess(res.message);
                          setTimeout(() => {
                            window.location.reload();
                          }, 5000);
                        }
                      } catch (err) {
                        setError("Gagal mengirim perintah restart.");
                      } finally {
                        setFormLoading(false);
                      }
                    }
                  }}
                  disabled={formLoading}
                  className="btn btn-secondary"
                  style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Power size={16} /> Restart Server
                </button>
              </div>

              {/* Shutdown Section */}
              <div style={{ padding: "20px", border: "1px solid var(--border)", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--danger)", fontWeight: 700 }}>Matikan (Shutdown) Aplikasi</h4>
                <p style={{ margin: "0 0 16px 0", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: "1.5" }}>
                  Tindakan ini akan menghentikan total proses aplikasi. Jika aplikasi berjalan dengan PM2, server PM2 akan dihentikan secara permanen dan aplikasi tidak dapat diakses sebelum Anda masuk ke SSH VPS dan menyalakannya kembali secara manual.
                </p>
                <button
                  onClick={async () => {
                    if (confirm("PERINGATAN: Tindakan ini akan mematikan aplikasi secara total. Server TIDAK akan menyala kembali otomatis. Apakah Anda yakin ingin mematikan server?")) {
                      setError("");
                      setSuccess("");
                      setFormLoading(true);
                      try {
                        const res = await shutdownServerAction();
                        if (res?.error) {
                          setError(res.error);
                        } else {
                          setSuccess(res.message);
                        }
                      } catch (err) {
                        setError("Gagal mengirim perintah shutdown.");
                      } finally {
                        setFormLoading(false);
                      }
                    }
                  }}
                  disabled={formLoading}
                  className="btn btn-danger"
                  style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Power size={16} /> Shutdown Server
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Add New Content */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div className="card" style={{
            maxWidth: "500px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Plus size={24} style={{ color: "var(--primary)" }} /> Tambah Content Baru
            </h3>
            <form onSubmit={handleAddCandidate} encType="multipart/form-data">
              <div className="form-group">
                <label className="form-label" htmlFor="candName">Nama Group / Judul Content</label>
                <input
                  id="candName"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Tor-Tor Kelas Besar"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="candDesc">Deskripsi Content</label>
                <textarea
                  id="candDesc"
                  name="description"
                  rows="3"
                  className="form-input"
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Contoh: Deskripsi singkat karya/tarian anak."
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="candImageUrl">URL Tautan Foto/Video</label>
                <input
                  id="candImageUrl"
                  name="imageUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/video-or-foto.mp4"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="candImageFile">Atau Unggah Berkas Foto/Video</label>
                <input
                  id="candImageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size > 104857600) {
                      alert("Ukuran file tidak boleh melebihi 100MB.");
                      e.target.value = "";
                    }
                  }}
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-danger" style={{ flex: 1 }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-secondary" style={{ flex: 2 }} disabled={formLoading}>
                  {formLoading ? "Menyimpan..." : "Simpan Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Content */}
      {editingCandidate && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div className="card" style={{
            maxWidth: "500px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Edit size={24} style={{ color: "var(--primary)" }} /> Edit Informasi Content
            </h3>
            <form onSubmit={handleUpdateCandidate} encType="multipart/form-data">
              <div className="form-group">
                <label className="form-label" htmlFor="editCandName">Nama Group / Judul Content</label>
                <input
                  id="editCandName"
                  name="name"
                  type="text"
                  defaultValue={editingCandidate.name}
                  className="form-input"
                  placeholder="Contoh: Tor-Tor Kelas Besar"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editCandDesc">Deskripsi Content</label>
                <textarea
                  id="editCandDesc"
                  name="description"
                  rows="3"
                  defaultValue={editingCandidate.description}
                  className="form-input"
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Deskripsi singkat..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Foto/Video Saat Ini</label>
                <div style={{ marginBottom: "12px", borderRadius: "10px", overflow: "hidden", height: "140px", border: "1px solid var(--border)", backgroundColor: "#0f172a" }}>
                  {isVideo(editingCandidate.image_url) ? (
                    <video
                      src={editingCandidate.image_url}
                      controls
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <img 
                      src={editingCandidate.image_url} 
                      alt={editingCandidate.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editCandImageUrl">Tautan URL Foto/Video Baru</label>
                <input
                  id="editCandImageUrl"
                  name="imageUrl"
                  type="url"
                  defaultValue={editingCandidate.image_url.startsWith("/uploads/") ? "" : editingCandidate.image_url}
                  className="form-input"
                  placeholder="https://example.com/video-or-foto-baru.mp4"
                />
                {editingCandidate.image_url.startsWith("/uploads/") && (
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Media saat ini diunggah secara lokal. Masukkan URL jika ingin menggantinya dengan tautan URL eksternal.
                  </small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editCandImageFile">Atau Unggah Foto/Video Baru dari Berkas</label>
                <input
                  id="editCandImageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size > 104857600) {
                      alert("Ukuran file tidak boleh melebihi 100MB.");
                      e.target.value = "";
                    }
                  }}
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setEditingCandidate(null)} className="btn btn-danger" style={{ flex: 1 }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-secondary" style={{ flex: 2 }} disabled={formLoading}>
                  {formLoading ? "Simpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
