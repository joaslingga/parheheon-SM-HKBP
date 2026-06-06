"use client";

import { useState } from "react";
import { 
  updateHeaderImageAction, 
  addHighlightAction, 
  deleteHighlightAction,
  addVotingCandidateAction,
  updateVotingCandidateAction,
  deleteVotingCandidateAction,
  updateQuickStatsAction
} from "../app/actions";
import { useRouter } from "next/navigation";
import { Image, Sparkles, Plus, Trash2, ArrowLeft, CheckCircle2, ShieldAlert, AlertCircle, Edit, Award } from "lucide-react";
import Link from "next/link";

export default function SuperadminDashboard({ 
  currentHeaderImage, 
  statsImageUrl,
  highlights,
  votingCategories = [],
  votingCandidates = []
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("banner-highlights"); // 'banner-highlights' or 'voting-candidates'
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
      setError("Gagal menambahkan kandidat.");
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
      setError("Gagal memperbarui data kandidat.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteCandidate(candidateId) {
    if (!confirm("Apakah Anda yakin ingin menghapus kandidat peserta ini?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await deleteVotingCandidateAction(candidateId);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Kandidat berhasil dihapus.");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal menghapus kandidat.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
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
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Ubah Banner Utama, Kelola Highlight, & Kelola Kandidat Peserta Voting
            </p>
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
        marginTop: "24px"
      }}>
        <button
          onClick={() => {
            setActiveTab("banner-highlights");
            setError("");
            setSuccess("");
          }}
          style={{
            background: "none",
            border: "none",
            padding: "8px 16px",
            fontSize: "1rem",
            fontWeight: 700,
            color: activeTab === "banner-highlights" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "banner-highlights" ? "3px solid var(--primary)" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Sparkles size={18} /> Banner & Highlight
        </button>
        <button
          onClick={() => {
            setActiveTab("voting-candidates");
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
            color: activeTab === "voting-candidates" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "voting-candidates" ? "3px solid var(--primary)" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Award size={18} /> Kelola Kandidat Voting
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

        {/* Tab 1: Banner & Highlights */}
        {activeTab === "banner-highlights" && (
          <>
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

              {/* Section 2: Add New Highlight Form */}
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
                      required 
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
                      required 
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
                    <label className="form-label" htmlFor="highlightImageFile">Atau Unggah Gambar dari Local</label>
                    <input 
                      id="highlightImageFile" 
                      name="imageFile" 
                      type="file" 
                      accept="image/*"
                      className="form-input" 
                    />
                    <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                      Gunakan URL gambar publik ATAU pilih file gambar dari local untuk diunggah.
                    </small>
                  </div>

                  <button type="submit" className="btn btn-secondary" disabled={formLoading} style={{ marginTop: "10px" }}>
                    <Plus size={18} style={{ marginRight: "6px" }} /> Tambahkan Highlight Acara
                  </button>
                </form>
              </div>
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
                  {highlights.map((item) => (
                    <div key={item.id} className="highlight-item">
                      <div className="highlight-item-info">
                        <img src={item.image_url} alt={item.title} className="highlight-item-thumb" />
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
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Quick Stats Manager */}
            <div className="card" style={{ marginTop: "40px" }}>
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
          </>
        )}

        {/* Tab 2: Manage Voting Candidates */}
        {activeTab === "voting-candidates" && (
          <div>
            <div className="suadmin-voting-grid">
              {/* Left Column: Categories List */}
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 className="highlight-title" style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Kategori Voting</h3>
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

              {/* Right Column: Candidate Management Panel */}
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
                      Kandidat Peserta — {votingCategories.find(c => c.id === selectedCategoryId)?.name || "Kategori"}
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
                    <Plus size={16} /> Tambah Peserta Baru
                  </button>
                </div>

                {/* Candidate Grid */}
                <div className="suadmin-candidate-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "20px"
                }}>
                  {votingCandidates.filter(c => c.category_id === selectedCategoryId).length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                      <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                      <p style={{ fontWeight: 600 }}>Belum ada kandidat peserta untuk kategori ini.</p>
                      <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Silakan klik tombol "Tambah Peserta Baru" di atas untuk menambahkan.</p>
                    </div>
                  ) : (
                    votingCandidates
                      .filter(c => c.category_id === selectedCategoryId)
                      .map((candidate) => (
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
                          <div style={{ height: "180px", position: "relative" }}>
                            <img
                              src={candidate.image_url}
                              alt={candidate.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
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
                              🗳️ {candidate.votes_count || 0} Suara
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
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* CSS styling override inline for split grid */}
            <style>{`
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
            `}</style>
          </div>
        )}
      </div>

      {/* Modal 1: Add New Candidate */}
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
              <Plus size={24} style={{ color: "var(--primary)" }} /> Tambah Kandidat Peserta Baru
            </h3>
            <form onSubmit={handleAddCandidate} encType="multipart/form-data">
              <div className="form-group">
                <label className="form-label" htmlFor="candName">Nama Kandidat / Peserta</label>
                <input
                  id="candName"
                  name="name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Kelompok A - Kelas Pratama"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="candDesc">Deskripsi / Detail</label>
                <textarea
                  id="candDesc"
                  name="description"
                  rows="3"
                  className="form-input"
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Contoh: Keterangan tambahan penampilan, anggota kelompok, dsb."
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="candImageUrl">URL Tautan Foto</label>
                <input
                  id="candImageUrl"
                  name="imageUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/foto-peserta.jpg"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="candImageFile">Atau Unggah Berkas Foto</label>
                <input
                  id="candImageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-danger" style={{ flex: 1 }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-secondary" style={{ flex: 2 }} disabled={formLoading}>
                  {formLoading ? "Menyimpan..." : "Simpan Peserta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Candidate */}
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
              <Edit size={24} style={{ color: "var(--primary)" }} /> Edit Informasi Peserta
            </h3>
            <form onSubmit={handleUpdateCandidate} encType="multipart/form-data">
              <div className="form-group">
                <label className="form-label" htmlFor="editCandName">Nama Peserta / Kandidat</label>
                <input
                  id="editCandName"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCandidate.name}
                  className="form-input"
                  placeholder="Contoh: Kelompok A - Kelas Pratama"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editCandDesc">Deskripsi / Detail</label>
                <textarea
                  id="editCandDesc"
                  name="description"
                  rows="3"
                  defaultValue={editingCandidate.description}
                  className="form-input"
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Keterangan tambahan..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Foto Saat Ini</label>
                <div style={{ marginBottom: "12px", borderRadius: "10px", overflow: "hidden", height: "140px", border: "1px solid var(--border)" }}>
                  <img 
                    src={editingCandidate.image_url} 
                    alt={editingCandidate.name} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editCandImageUrl">Tautan URL Foto Baru</label>
                <input
                  id="editCandImageUrl"
                  name="imageUrl"
                  type="url"
                  defaultValue={editingCandidate.image_url.startsWith("/uploads/") ? "" : editingCandidate.image_url}
                  className="form-input"
                  placeholder="https://example.com/foto-peserta-baru.jpg"
                />
                {editingCandidate.image_url.startsWith("/uploads/") && (
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Foto saat ini diunggah secara lokal. Masukkan URL jika ingin menggantinya dengan tautan URL eksternal.
                  </small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editCandImageFile">Atau Unggah Foto Baru dari Berkas</label>
                <input
                  id="editCandImageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setEditingCandidate(null)} className="btn btn-danger" style={{ flex: 1 }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-secondary" style={{ flex: 2 }} disabled={formLoading}>
                  {formLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
