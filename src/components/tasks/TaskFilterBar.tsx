import * as React from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { STATUS, URGENCY, URGENCY_ORDER } from '@/lib/constants'
import { countActiveFilters, defaultFilters } from '@/utils/task'
import { useCategories } from '@/features/categories/hooks'
import type { GroupBy, SortBy, TaskFilters, TaskStatus, TaskUrgency } from '@/types'

interface Props {
  filters: TaskFilters
  onChange: (next: TaskFilters) => void
  resultCount: number
}

const STATUS_KEYS: TaskStatus[] = ['todo', 'in_progress', 'completed']

export function TaskFilterBar({ filters, onChange, resultCount }: Props) {
  const [expanded, setExpanded] = React.useState(false)
  const { data: categories = [] } = useCategories()
  const activeCount = countActiveFilters(filters)

  function toggleUrgency(urgency: TaskUrgency) {
    const next = filters.urgency.includes(urgency)
      ? filters.urgency.filter((item) => item !== urgency)
      : [...filters.urgency, urgency]
    onChange({ ...filters, urgency: next })
  }

  function toggleStatus(status: TaskStatus) {
    const next = filters.status.includes(status)
      ? filters.status.filter((item) => item !== status)
      : [...filters.status, status]
    onChange({ ...filters, status: next })
  }

  return (
    <section className="border border-ink bg-paper" aria-label="Filters">
      <div className="flex flex-col gap-3 border-b border-ink p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 border-b-2 border-ink">
          <Search className="h-4 w-4 shrink-0 text-neutral-600" strokeWidth={1.5} aria-hidden />
          <Input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search tasks"
            aria-label="Search tasks"
            className="border-b-0 px-0"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: '' })}
              aria-label="Clear search"
              className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={expanded ? 'primary' : 'outline'}
            size="sm"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Filters{activeCount ? ` (${activeCount})` : ''}
          </Button>
          <span className="label-meta whitespace-nowrap">{resultCount} shown</span>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-4 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <fieldset>
              <legend className="label-meta mb-2">Urgency</legend>
              <div className="flex flex-wrap gap-1.5">
                {URGENCY_ORDER.map((key) => {
                  const active = filters.urgency.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleUrgency(key)}
                      className={`min-h-[36px] border px-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-neutral-400 hover:bg-rule'}`}
                    >
                      {URGENCY[key].label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label-meta mb-2">Status</legend>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_KEYS.map((key) => {
                  const active = filters.status.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleStatus(key)}
                      className={`min-h-[36px] border px-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-neutral-400 hover:bg-rule'}`}
                    >
                      {STATUS[key].label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <Field label="Category" htmlFor="filter-category">
              <Select
                value={filters.categoryId}
                onValueChange={(value) => onChange({ ...filters, categoryId: value })}
              >
                <SelectTrigger id="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="uncategorized">Uncategorised</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Due from" htmlFor="filter-from">
                <Input
                  id="filter-from"
                  type="date"
                  value={filters.from ?? ''}
                  onChange={(event) => onChange({ ...filters, from: event.target.value || null })}
                />
              </Field>
              <Field label="Due to" htmlFor="filter-to">
                <Input
                  id="filter-to"
                  type="date"
                  value={filters.to ?? ''}
                  onChange={(event) => onChange({ ...filters, to: event.target.value || null })}
                />
              </Field>
            </div>

            <Field label="Sort by" htmlFor="filter-sort">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => onChange({ ...filters, sortBy: value as SortBy })}
              >
                <SelectTrigger id="filter-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgency">Urgency</SelectItem>
                  <SelectItem value="due_date">Due date</SelectItem>
                  <SelectItem value="created_at">Newest first</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Group by" htmlFor="filter-group">
              <Select
                value={filters.groupBy}
                onValueChange={(value) => onChange({ ...filters, groupBy: value as GroupBy })}
              >
                <SelectTrigger id="filter-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No grouping</SelectItem>
                  <SelectItem value="urgency">Urgency</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <label className="flex items-center gap-2 self-end py-2">
              <Checkbox
                checked={filters.showCompleted}
                onCheckedChange={(checked) => onChange({ ...filters, showCompleted: checked === true })}
              />
              <span className="font-mono text-[11px] uppercase tracking-widest">Show completed</span>
            </label>

            <div className="self-end">
              <Button variant="link" size="sm" onClick={() => onChange({ ...defaultFilters(), search: filters.search })}>
                Reset filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
