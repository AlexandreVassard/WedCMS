import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'

export const Route = createFileRoute('/_auth/announcements/')({
  component: AnnouncementsPage,
})

interface Announcement {
  id: number
  image: string
  content: string
  position: number
}

function SortableRow({
  item,
  onDelete,
  isDeleting,
}: {
  item: Announcement
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3 text-gray-500 text-xs">{item.id}</td>
      <td className="px-4 py-3">
        <img
          src={`/images/announcement/${item.image}`}
          alt={item.image}
          className="h-10 object-contain"
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-[250px]">{item.content}</td>
      <td className="px-4 py-3 w-24">
        <div className="flex gap-1">
          <Link to="/announcements/$announcementId" params={{ announcementId: String(item.id) }}>
            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={() => { if (confirm('Delete this announcement?')) onDelete(item.id) }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function AnnouncementsPage() {
  const qc = useQueryClient()
  const [items, setItems] = useState<Announcement[]>([])

  const { data } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get<Announcement[]>('/api/housekeeping/announcements'),
  })

  useEffect(() => {
    if (data) setItems(data)
  }, [data])

  const reorder = useMutation({
    mutationFn: (ids: number[]) =>
      api.patch('/api/housekeeping/announcements/reorder', { ids }),
    onSuccess: () => toast.success('Order saved'),
    onError: (e: Error) => {
      toast.error(e.message)
      qc.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/housekeeping/announcements/${id}`),
    onSuccess: () => {
      toast.success('Announcement deleted')
      qc.invalidateQueries({ queryKey: ['announcements'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    reorder.mutate(reordered.map((i) => i.id))
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <Link to="/announcements/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Announcement
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Content</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">
                      No announcements yet
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onDelete={(id) => remove.mutate(id)}
                      isDeleting={remove.isPending}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  )
}
