import { useState, useEffect } from 'react'
import { format, parse, isValid } from 'date-fns'
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface DateRangeFilterProps {
  value: { startDate: Date; endDate: Date }
  onChange: (range: { startDate: Date; endDate: Date }) => void
  presets?: Array<'7d' | '30d' | '90d'>
  maxRangeDays?: number
  onRefresh?: () => void
}

const PRESET_LABELS = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
} as const

export function DateRangeFilter({
  value,
  onChange,
  presets = ['7d', '30d', '90d'],
  maxRangeDays = 365,
  onRefresh,
}: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<'7d' | '30d' | '90d' | null>(null)
  const [startDateInput, setStartDateInput] = useState(format(value.startDate, 'dd/MM/yyyy'))
  const [endDateInput, setEndDateInput] = useState(format(value.endDate, 'dd/MM/yyyy'))
  const [startDateError, setStartDateError] = useState<string | null>(null)
  const [endDateError, setEndDateError] = useState<string | null>(null)

  // Update inputs when value changes externally
  useEffect(() => {
    setStartDateInput(format(value.startDate, 'dd/MM/yyyy'))
    setEndDateInput(format(value.endDate, 'dd/MM/yyyy'))
  }, [value.startDate, value.endDate])

  const handlePresetClick = (preset: '7d' | '30d' | '90d') => {
    const days = parseInt(preset)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    setSelectedPreset(preset)
    onChange({ startDate, endDate })
    setStartDateInput(format(startDate, 'dd/MM/yyyy'))
    setEndDateInput(format(endDate, 'dd/MM/yyyy'))
    setStartDateError(null)
    setEndDateError(null)
  }

  const parseDate = (dateStr: string): Date | null => {
    // Try format dd/MM/yyyy
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date())
    if (isValid(parsedDate)) {
      return parsedDate
    }
    return null
  }

  const handleStartDateChange = (value: string) => {
    setStartDateInput(value)
    setSelectedPreset(null)

    if (value.length === 10) {
      const parsedDate = parseDate(value)
      if (parsedDate) {
        setStartDateError(null)
        onChange({ startDate: parsedDate, endDate: value.endDate })
      } else {
        setStartDateError('Data inválida (use dd/MM/yyyy)')
      }
    } else {
      setStartDateError(null)
    }
  }

  const handleEndDateChange = (value: string) => {
    setEndDateInput(value)
    setSelectedPreset(null)

    if (value.length === 10) {
      const parsedDate = parseDate(value)
      if (parsedDate) {
        setEndDateError(null)
        onChange({ startDate: value.startDate, endDate: parsedDate })
      } else {
        setEndDateError('Data inválida (use dd/MM/yyyy)')
      }
    } else {
      setEndDateError(null)
    }
  }

  const handleStartDateCalendar = (date: Date | undefined) => {
    if (date) {
      setSelectedPreset(null)
      onChange({ startDate: date, endDate: value.endDate })
      setStartDateInput(format(date, 'dd/MM/yyyy'))
      setStartDateError(null)
    }
  }

  const handleEndDateCalendar = (date: Date | undefined) => {
    if (date) {
      setSelectedPreset(null)
      onChange({ startDate: value.startDate, endDate: date })
      setEndDateInput(format(date, 'dd/MM/yyyy'))
      setEndDateError(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={selectedPreset === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="min-h-[44px] md:min-h-0"
          >
            {PRESET_LABELS[preset]}
          </Button>
        ))}
      </div>

      {/* Date Inputs */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm font-medium">
            Data Inicial
          </Label>
          <div className="flex gap-2">
            <Input
              id="start-date"
              type="text"
              placeholder="dd/MM/yyyy"
              value={startDateInput}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className={cn(
                'flex-1 min-h-[44px] md:min-h-0',
                startDateError && 'border-red-500'
              )}
              maxLength={10}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 shrink-0"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value.startDate}
                  onSelect={handleStartDateCalendar}
                  disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {startDateError && (
            <p className="text-xs text-red-500">{startDateError}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-medium">
            Data Final
          </Label>
          <div className="flex gap-2">
            <Input
              id="end-date"
              type="text"
              placeholder="dd/MM/yyyy"
              value={endDateInput}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className={cn(
                'flex-1 min-h-[44px] md:min-h-0',
                endDateError && 'border-red-500'
              )}
              maxLength={10}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 shrink-0"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value.endDate}
                  onSelect={handleEndDateCalendar}
                  disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          {endDateError && (
            <p className="text-xs text-red-500">{endDateError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
