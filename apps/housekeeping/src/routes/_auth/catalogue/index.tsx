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
import { Badge } from '../../../components/ui/badge'
import { GripVertical, Pencil } from 'lucide-react'
import { Button } from '../../../components/ui/button'

export const Route = createFileRoute('/_auth/catalogue/')({
  component: CataloguePagesPage,
})

interface CataloguePage {
  id: number
  orderId: number
  name: string
  nameIndex: string
  layout: string
  minRole: number
  indexVisible: number
  isClubOnly: number
}

interface Rank {
  id: number
  name: string
}

function SortableRow({ page, rankName }: { page: CataloguePage; rankName: (id: number) => string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id })

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
      <td className="px-4 py-3 text-gray-500 text-xs">{page.id}</td>
      <td className="px-4 py-3 font-medium">{page.name}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{page.nameIndex}</td>
      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{page.layout}</td>
      <td className="px-4 py-3 text-sm">{rankName(page.minRole)} ({page.minRole})</td>
      <td className="px-4 py-3">
        {page.indexVisible ? (
          <Badge variant="success">Visible</Badge>
        ) : (
          <Badge variant="secondary">Hidden</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        {page.isClubOnly ? (
          <Badge variant="outline">Club</Badge>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3 w-12">
        <Link to="/catalogue/$pageId" params={{ pageId: String(page.id) }}>
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
        </Link>
      </td>
    </tr>
  )
}

function CataloguePagesPage() {
  const qc = useQueryClient()
  const [items, setItems] = useState<CataloguePage[]>([])

  const { data } = useQuery({
    queryKey: ['catalogue-pages'],
    queryFn: () => api.get<CataloguePage[]>('/api/housekeeping/catalogue/pages'),
  })

  const { data: ranks = [] } = useQuery({
    queryKey: ['ranks'],
    queryFn: () => api.get<Rank[]>('/api/housekeeping/ranks'),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (data) setItems(data)
  }, [data])

  const rankName = (id: number) => ranks.find((r) => r.id === id)?.name ?? `Rank ${id}`

  const reorder = useMutation({
    mutationFn: (ids: number[]) =>
      api.patch('/api/housekeeping/catalogue/pages/reorder', { ids }),
    onSuccess: () => toast.success('Order saved'),
    onError: (e: Error) => {
      toast.error(e.message)
      qc.invalidateQueries({ queryKey: ['catalogue-pages'] })
    },
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue Pages</h1>
        <p className="text-sm text-gray-500 mt-1">{items.length} pages</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Index</th>
              <th className="px-4 py-3">Layout</th>
              <th className="px-4 py-3">Min Role</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3">Club Only</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8">
                      No catalogue pages found
                    </td>
                  </tr>
                ) : (
                  items.map((page) => (
                    <SortableRow key={page.id} page={page} rankName={rankName} />
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
