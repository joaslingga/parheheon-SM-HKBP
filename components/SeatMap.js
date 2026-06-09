"use client";

import { formatPrice } from "../lib/seatData";

// Row letter labels: A, B, C, ... Z, AA, AB, ...
function getRowLabel(rowIndex) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (rowIndex < 26) return alphabet[rowIndex];
  const first = alphabet[Math.floor(rowIndex / 26) - 1];
  const second = alphabet[rowIndex % 26];
  return first + second;
}

// Render a single row of seats with aisles every 4 seats (for Kategori 1-3)
function ConcertSeatRow({ rowLabel, seats, bookedSet, pendingSet, selectedSet, onSeatClick, readOnly, catName, catPrice }) {
  // Group seats into chunks of 4 with aisle between groups
  const groups = [];
  for (let i = 0; i < seats.length; i += 4) {
    groups.push(seats.slice(i, i + 4));
  }

  return (
    <div className="concert-seat-row">
      <span className="concert-row-label">{rowLabel}</span>
      <div className="concert-row-groups">
        {groups.map((group, gi) => (
          <div key={gi} className="concert-seat-group">
            {group.map(({ seatId, seatNum }) => {
              const isBooked = bookedSet.has(seatId);   // approved
              const isPending = pendingSet.has(seatId); // pending approval
              const isSelected = selectedSet.has(seatId);
              let cls = "concert-seat";
              if (isBooked) cls += " concert-seat-booked";
              else if (isPending) cls += " concert-seat-pending";
              else if (isSelected) cls += " concert-seat-selected";
              else cls += " concert-seat-available";

              return (
                <button
                  key={seatId}
                  type="button"
                  className={cls}
                  onClick={() => {
                    if (!readOnly && !isBooked && !isPending && onSeatClick) onSeatClick(seatId);
                  }}
                  disabled={readOnly || isBooked || isPending}
                  title={
                    isBooked
                      ? `${catName} · Baris ${rowLabel} · Kursi ${seatNum} (Terkonfirmasi)`
                      : isPending
                      ? `${catName} · Baris ${rowLabel} · Kursi ${seatNum} (Menunggu Konfirmasi)`
                      : `${catName} · Baris ${rowLabel} · Kursi ${seatNum} · ${formatPrice(catPrice)}`
                  }
                  aria-label={`Kursi ${seatNum} Baris ${rowLabel} ${catName}`}
                  aria-pressed={isSelected}
                >
                  {seatNum}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <span className="concert-row-label">{rowLabel}</span>
    </div>
  );
}

// Concert-style block for Kategori 1, 2, 3
function ConcertCategoryBlock({ catKey, cat, bookedSet, pendingSet, selectedSet, onSeatClick, readOnly }) {
  const { seatsPerRow, rows } = cat.layout;
  let globalSeatCounter = 1;

  const rowsData = [];
  for (let ri = 0; ri < rows; ri++) {
    const rowLabel = getRowLabel(ri);
    const seats = [];
    for (let bi = 1; bi <= seatsPerRow; bi++) {
      const seatId = `${catKey}-S1-R${ri + 1}-B${bi}`;
      seats.push({ seatId, seatNum: globalSeatCounter++ });
    }
    rowsData.push({ rowLabel, seats });
  }

  const blockClass = catKey.toLowerCase().replace("kategori_", "concert-cat-");

  return (
    <div className={`concert-category-block ${blockClass}`}>
      <div className="concert-category-header">
        <div className="concert-category-badge">
          <span className="concert-category-name">{cat.name}</span>
          <span className="concert-cat-zone-indicator" />
        </div>
        <span className="concert-category-price">{formatPrice(cat.price)}</span>
      </div>

      <div className="concert-rows-wrapper">
        {rowsData.map(({ rowLabel, seats }) => (
          <ConcertSeatRow
            key={rowLabel}
            rowLabel={rowLabel}
            seats={seats}
            bookedSet={bookedSet}
            pendingSet={pendingSet}
            selectedSet={selectedSet}
            onSeatClick={onSeatClick}
            readOnly={readOnly}
            catName={cat.name}
            catPrice={cat.price}
          />
        ))}
      </div>
    </div>
  );
}

// Tribun block — original layout unchanged
function TribunBlock({ catKey, cat, bookedSet, pendingSet, selectedSet, onSeatClick, readOnly }) {
  const { seatsPerRow, rows, sections } = cat.layout;
  let seatCounter = 0;
  const blockClass = catKey.toLowerCase().replace("_", "-");

  return (
    <div className={`seat-category-block ${blockClass} tribun-block`}>
      <div className="seat-category-header">
        <span className="seat-category-name">{cat.name}</span>
        <span className="seat-category-price">{formatPrice(cat.price)}</span>
      </div>

      <div className="seat-category-sections">
        {Array.from({ length: sections }, (_, si) => {
          const sectionNum = si + 1;
          return (
            <div key={`${catKey}-s${sectionNum}`} className="seat-section">
              {sections > 1 && (
                <span className="seat-section-label">Blok {sectionNum}</span>
              )}
              <div className="seat-rows">
                {Array.from({ length: rows }, (_, ri) => {
                  const rowNum = ri + 1;
                  return (
                    <div key={`${catKey}-s${sectionNum}-r${rowNum}`} className="seat-row">
                      <span className="seat-row-label">{rowNum}</span>
                      <div className="seat-row-seats">
                        {Array.from({ length: seatsPerRow }, (_, bi) => {
                          const seatNum = bi + 1;
                          const seatId = `${catKey}-S${sectionNum}-R${rowNum}-B${seatNum}`;
                          const isBooked = bookedSet.has(seatId);   // approved
                          const isPending = pendingSet.has(seatId); // pending
                          const isSelected = selectedSet.has(seatId);
                          seatCounter++;

                          let cls = "seat";
                          if (isBooked) cls += " seat-booked";
                          else if (isPending) cls += " seat-pending";
                          else if (isSelected) cls += " seat-selected";
                          else cls += " seat-available";

                          return (
                            <button
                              key={seatId}
                              type="button"
                              className={cls}
                              onClick={() => {
                                if (!readOnly && !isBooked && !isPending && onSeatClick) onSeatClick(seatId);
                              }}
                              disabled={readOnly || isBooked || isPending}
                              title={
                                isBooked
                                  ? `${cat.name} · Kursi ${seatCounter} (Terkonfirmasi)`
                                  : isPending
                                  ? `${cat.name} · Kursi ${seatCounter} (Menunggu Konfirmasi)`
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
}

export default function SeatMap({
  categories,
  bookedSeatIds = [],
  pendingSeatIds = [],
  selectedSeatIds = [],
  onSeatClick,
  readOnly = false,
  showLegend = true,
  compact = false,
}) {
  const bookedSet = new Set(bookedSeatIds);   // approved seats
  const pendingSet = new Set(pendingSeatIds); // pending seats
  const selectedSet = new Set(selectedSeatIds);

  const CONCERT_CATS = ["KATEGORI_1", "KATEGORI_2", "KATEGORI_3"];
  const TRIBUN_CATS = ["TRIBUN_1", "TRIBUN_2"];

  const concertBlocks = CONCERT_CATS.filter((k) => categories[k]);
  const tribunBlocks = TRIBUN_CATS.filter((k) => categories[k]);

  return (
    <div className={`seat-map-wrapper ${compact ? "seat-map-compact" : "seat-map-fullwidth"}`}>
      {/* Mobile scroll indicator tip */}
      <div className="mobile-scroll-tip">
        <span>↔️ Geser ke kiri atau kanan untuk melihat seluruh kursi</span>
      </div>

      {/* Concert Main Seating Area */}
      <div className="concert-venue-wrapper">
        {concertBlocks.map((catKey) => (
          <ConcertCategoryBlock
            key={catKey}
            catKey={catKey}
            cat={categories[catKey]}
            bookedSet={bookedSet}
            pendingSet={pendingSet}
            selectedSet={selectedSet}
            onSeatClick={onSeatClick}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Tribun Section — original layout */}
      {tribunBlocks.length > 0 && (
        <div className="tribun-venue-wrapper">
          <div className="tribun-section-header">
            <span className="tribun-section-label">⬛ Area Tribun</span>
          </div>
          <div className="tribun-blocks-row">
            {tribunBlocks.map((catKey) => (
              <TribunBlock
                key={catKey}
                catKey={catKey}
                cat={categories[catKey]}
                bookedSet={bookedSet}
                pendingSet={pendingSet}
                selectedSet={selectedSet}
                onSeatClick={onSeatClick}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}


    </div>
  );
}
