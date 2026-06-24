import { useEffect, useRef } from "react"
import { X } from "lucide-react"

type VideoModalProps = {
  youtubeId: string | null
  onClose: () => void
}

export function VideoModal({ youtubeId, onClose }: VideoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (youtubeId && !el.open) {
      el.showModal()
    } else if (!youtubeId && el.open) {
      el.close()
    }
  }, [youtubeId])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault()
    }
    el.addEventListener("keydown", handler)
    return () => el.removeEventListener("keydown", handler)
  }, [])

  if (!youtubeId) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto h-full w-full max-h-full max-w-full bg-black/70 backdrop-blur-sm open:flex open:items-center open:justify-center border-0 p-0"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="relative mx-4 w-full max-w-4xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </dialog>
  )
}
