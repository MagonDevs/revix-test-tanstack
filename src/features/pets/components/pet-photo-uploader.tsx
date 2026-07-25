import { GripVertical, RotateCw, X } from 'lucide-react'
import { useRef } from 'react'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PET_PHOTOS,
  MAX_UPLOAD_BYTES,
} from '~/shared/config/app'
import { toast } from '~/shared/ui/toast'
import { MonoLabel } from '~/shared/ui/mono-label'
import { Progress } from '~/shared/ui/progress'

import { useUploadPhoto } from '../api/pets.mutations'

import type { PetPhotoFormValue } from '../schemas/pet-form.schema'

export interface PetPhotoUploaderProps {
  photos: PetPhotoFormValue[]
  onChange: (photos: PetPhotoFormValue[]) => void
}

function createLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Multi-select + drag-drop up to MAX_PET_PHOTOS. Because uploads go through a
 * TanStack Start server function (fetch()-based), there's no reliable
 * upload-progress event stream in this stack — so per-file progress is
 * indeterminate (pending -> uploaded/error) rather than a real byte percentage.
 * This is a deliberate simplification, not an oversight.
 */
export function PetPhotoUploader({ photos, onChange }: PetPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fileMapRef = useRef<Map<string, File>>(new Map())
  const uploadPhoto = useUploadPhoto()

  function validateFile(file: File): string | undefined {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as never)) {
      return 'Only JPEG, PNG or WebP photos are allowed.'
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return 'Photos must be 5MB or smaller.'
    }
    return undefined
  }

  function startUpload(localId: string, file: File) {
    onChange(
      photos.map((photo) =>
        photo.localId === localId
          ? { ...photo, status: 'uploading', errorMessage: undefined }
          : photo,
      ),
    )
    uploadPhoto.mutate(file, {
      onSuccess: (dto) => {
        onChange(
          photos.map((photo) =>
            photo.localId === localId
              ? {
                  ...photo,
                  status: 'uploaded',
                  uploadId: dto.id,
                  previewUrl: dto.url,
                }
              : photo,
          ),
        )
      },
      onError: () => {
        onChange(
          photos.map((photo) =>
            photo.localId === localId
              ? { ...photo, status: 'error', errorMessage: 'Upload failed.' }
              : photo,
          ),
        )
      },
    })
  }

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
    const room = MAX_PET_PHOTOS - photos.length
    if (room <= 0) {
      toast.error(`Up to ${MAX_PET_PHOTOS} photos.`)
      return
    }
    const accepted = files.slice(0, room)
    if (files.length > accepted.length) {
      toast.error(`Only added the first ${room} photo(s) — 6 max.`)
    }

    const filesByLocalId = new Map<string, File>()
    const next: PetPhotoFormValue[] = [...photos]
    for (const file of accepted) {
      const error = validateFile(file)
      const localId = createLocalId()
      if (error) {
        toast.error(error)
        continue
      }
      next.push({
        localId,
        uploadId: null,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      })
      filesByLocalId.set(localId, file)
      fileMapRef.current.set(localId, file)
    }
    onChange(next)
    for (const [localId, file] of filesByLocalId) {
      startUpload(localId, file)
    }
  }

  function removePhoto(localId: string) {
    fileMapRef.current.delete(localId)
    onChange(photos.filter((photo) => photo.localId !== localId))
  }

  function retryPhoto(localId: string) {
    const file = fileMapRef.current.get(localId)
    if (!file) return
    startUpload(localId, file)
  }

  function movePhoto(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= photos.length) return
    const next = [...photos]
    const [moved] = next.splice(index, 1)
    if (!moved) return
    next.splice(targetIndex, 0, moved)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-wrap gap-3"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (event.dataTransfer.files.length > 0) {
            addFiles(event.dataTransfer.files)
          }
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.localId}
            className="relative flex size-24 flex-col items-center justify-center rounded-md border border-hairline bg-surface"
          >
            {index === 0 ? (
              <MonoLabel className="absolute left-1 top-1 rounded-sm bg-ink/80 px-1 py-0.5 text-white">
                Cover
              </MonoLabel>
            ) : null}

            {photo.previewUrl ? (
              <img
                src={photo.previewUrl}
                alt=""
                className="size-full rounded-md object-cover"
              />
            ) : null}

            {photo.status === 'uploading' || photo.status === 'pending' ? (
              <div className="absolute inset-x-1 bottom-1">
                <Progress value={60} aria-label="Uploading" />
              </div>
            ) : null}

            {photo.status === 'error' ? (
              <button
                type="button"
                onClick={() => retryPhoto(photo.localId)}
                aria-label="Retry upload"
                className="absolute inset-0 flex items-center justify-center rounded-md bg-status-declined/80 text-white"
              >
                <RotateCw className="size-4" aria-hidden="true" />
              </button>
            ) : null}

            <div className="absolute -right-2 -top-2 flex gap-1">
              <button
                type="button"
                onClick={() => removePhoto(photo.localId)}
                aria-label="Remove photo"
                className="flex size-6 items-center justify-center rounded-full border border-hairline bg-surface text-mute outline-none hover:text-status-declined focus-visible:ring-2 focus-visible:ring-pine"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>

            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => movePhoto(index, -1)}
                aria-label="Move photo earlier"
                className="flex size-6 items-center justify-center rounded-full border border-hairline bg-surface text-mute outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pine disabled:pointer-events-none disabled:opacity-40"
              >
                <GripVertical className="size-3 rotate-90" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={index === photos.length - 1}
                onClick={() => movePhoto(index, 1)}
                aria-label="Move photo later"
                className="flex size-6 items-center justify-center rounded-full border border-hairline bg-surface text-mute outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pine disabled:pointer-events-none disabled:opacity-40"
              >
                <GripVertical
                  className="size-3 -rotate-90"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        ))}

        {photos.length < MAX_PET_PHOTOS ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-hairline text-xs text-mute outline-none hover:border-ink/40 hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
          >
            Add photo
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <p className="text-xs text-mute">
        Up to {MAX_PET_PHOTOS} photos, JPEG/PNG/WebP, 5MB max each. The first
        photo is the cover.
      </p>
    </div>
  )
}
