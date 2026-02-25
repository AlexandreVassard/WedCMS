import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { ImageIcon } from 'lucide-react'

interface Props {
  value: string
  onChange: (filename: string) => void
}

export function ImagePickerField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: images = [] } = useQuery<string[]>({
    queryKey: ['announcement-images'],
    queryFn: () => api.get<string[]>('/api/housekeeping/announcements/images'),
    enabled: open,
    staleTime: Infinity,
  })

  const filtered = images.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = (filename: string) => {
    onChange(filename)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="space-y-1.5">
      <Label>Image filename</Label>
      <div className="flex gap-2">
        <Input
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="banner.gif"
          className="flex-1"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon" title="Browse images">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select an image</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1"
              autoFocus
            />
            <div className="overflow-y-auto mt-2 grid grid-cols-4 gap-3 pr-1">
              {filtered.map((filename) => (
                <button
                  key={filename}
                  type="button"
                  onClick={() => handleSelect(filename)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-left hover:bg-gray-50 transition-colors ${
                    value === filename
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={`/images/announcement/${filename}`}
                    alt={filename}
                    className="h-16 w-full object-contain"
                    loading="lazy"
                  />
                  <span className="text-xs text-gray-600 break-all text-center leading-tight">
                    {filename}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-4 text-center text-sm text-gray-400 py-8">
                  No images found
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {value && (
        <img
          src={`/images/announcement/${value}`}
          alt="preview"
          className="mt-1 h-16 object-contain rounded border border-gray-200"
        />
      )}
    </div>
  )
}
