"use client";

import { formatPrice } from "../lib/seatData";

export default function SeatMap({
  categories,
  bookedSeatIds = [],
  selectedSeatIds = [],
  onSeatClick,
  readOnly = false,
  showLegend = true,
  compact = false,
}) {
  const bookedSet = new Set(bookedSeatIds);
  const selectedSet = new Set(selectedSeatIds);

  function getSeatClass(seatId) {
    if (bookedSet.has(seatId)) return "seat seat-booked";
    if (selectedSet.has(seatId)) return "seat seat-selected";
    return "seat seat-available";
  }

  function handleClick(seatId) {
    if (readOnly || bookedSet.has(seatId) || !onSeatClick) return;
    onSeatClick(seatId);
  }

  const categoryKeys = Object.keys(categories).sort(
    (a, b) => (categories[a].order || 0) - (categories[b].order || 0)
  );

  return (
    <div className={`seat-map-wrapper ${compact ? "seat-map-compact" : "seat-map-fullwidth"}`}>
      <div className="seat-map-venue">
        {categoryKeys.map((key) => {
          const cat = categories[key];
          const { seatsPerRow, rows, sections } = cat.layout;
          const blockClass = key.toLowerCase().replace('kategori_', 'category-').replace('_', '-');
          let seatCounter = 0;

          return (
            <div key={key} className={`seat-category-block ${blockClass}`}>
              <div className="seat-category-header">
                <span className="seat-category-name">{cat.name}</span>
                <span className="seat-category-price">{formatPrice(cat.price)}</span>
              </div>

              <div className="seat-category-sections">
                {Array.from({ length: sections }, (_, si) => {
                  const sectionNum = si + 1;
                  return (
                    <div key={`${key}-s${sectionNum}`} className="seat-section">
                      {sections > 1 && (
                        <span className="seat-section-label">Blok {sectionNum}</span>
                      )}
                      <div className="seat-rows">
                        {Array.from({ length: rows }, (_, ri) => {
                          const rowNum = ri + 1;
                          return (
                            <div key={`${key}-s${sectionNum}-r${rowNum}`} className="seat-row">
                              <span className="seat-row-label">{rowNum}</span>
                              <div className="seat-row-seats">
                                {Array.from({ length: seatsPerRow }, (_, bi) => {
                                  const seatNum = bi + 1;
                                  const seatId = `${key}-S${sectionNum}-R${rowNum}-B${seatNum}`;
                                  const isBooked = bookedSet.has(seatId);
                                  const isSelected = selectedSet.has(seatId);

                                  seatCounter++;

                                  return (
                                    <button
                                      key={seatId}
                                      type="button"
                                      className={getSeatClass(seatId)}
                                      onClick={() => handleClick(seatId)}
                                      disabled={readOnly || isBooked}
                                      title={
                                        isBooked
                                          ? `${cat.name} · Kursi ${seatCounter} (Terbeli)`
                                          : `${cat.name} · Baris ${rowNum} · Kursi ${seatCounter} · ${formatPrice(cat.price)}`
                                      }
                                      aria-label={`Kursi ${seatCounter} baris ${rowNum} ${cat.name}`}
                                      aria-pressed={isSelected}
                                    >
                                      {seatCounter}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showLegend && (
        <div className="seat-legend">
          <div className="seat-legend-item">
            <span className="seat seat-available seat-legend-swatch" />
            <span>Tersedia</span>
          </div>
          <div className="seat-legend-item">
            <span className="seat seat-selected seat-legend-swatch" />
            <span>Dipilih</span>
          </div>
          <div className="seat-legend-item">
            <span className="seat seat-booked seat-legend-swatch" />
            <span>Terbeli</span>
          </div>
        </div>
      )}
    </div>
  );
}
