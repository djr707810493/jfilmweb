import { useState, type ReactNode } from "react";

type GalleryTileActionsProps = {
  previewSrc?: string;
  previewAlt?: string;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  curated?: boolean;
  showCurated?: boolean;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onRemove: () => void;
  onToggleCurated?: () => void;
  onEdit?: () => void;
};

export function GalleryTileActions({
  previewSrc = "",
  previewAlt = "",
  canMoveEarlier,
  canMoveLater,
  curated = false,
  showCurated = false,
  onMoveEarlier,
  onMoveLater,
  onRemove,
  onToggleCurated,
  onEdit,
}: GalleryTileActionsProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center bg-soft-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="flex flex-wrap items-center justify-center gap-1 px-1">
          <ActionButton label="Move earlier" disabled={!canMoveEarlier} onClick={onMoveEarlier}>
            <ChevronLeftIcon />
          </ActionButton>
          <ActionButton label="Move later" disabled={!canMoveLater} onClick={onMoveLater}>
            <ChevronRightIcon />
          </ActionButton>
          <ActionButton label="Delete" onClick={onRemove} tone="danger">
            <TrashIcon />
          </ActionButton>
          {showCurated && onToggleCurated ? (
            <ActionButton
              label={curated ? "Remove from featured" : "Add to featured"}
              onClick={onToggleCurated}
              tone={curated ? "active" : "default"}
            >
              <StarIcon filled={curated} />
            </ActionButton>
          ) : null}
          <ActionButton
            label="Zoom"
            disabled={!previewSrc}
            onClick={() => setZoomed(true)}
          >
            <ZoomIcon />
          </ActionButton>
          {onEdit ? (
            <ActionButton label="Edit" onClick={onEdit}>
              <PencilIcon />
            </ActionButton>
          ) : null}
        </div>
      </div>

      {zoomed && previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-soft-black/80 p-6"
          onClick={() => setZoomed(false)}
          role="presentation"
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close"
            className="absolute top-4 right-4 flex size-10 items-center justify-center bg-ivory text-soft-black"
          >
            <CloseIcon />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={previewAlt}
            className="max-h-[88vh] max-w-[92vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function ActionButton({
  label,
  disabled,
  onClick,
  tone = "default",
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  tone?: "default" | "danger" | "active";
  children: ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "bg-ivory text-red-800 hover:bg-red-50"
      : tone === "active"
        ? "bg-soft-black text-ivory"
        : "bg-ivory text-soft-black hover:bg-ivory-dark";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`flex size-7 items-center justify-center disabled:opacity-35 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 6 9 12l6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.2 6.6 19.8l1-6.1L3.2 9.4l6.1-.9L12 3z" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h4l10-10-4-4L4 16v4zM13 7l4 4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
