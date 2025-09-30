"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIconLucide, Clock, User, Wrench, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { API_BASE_URL, fetchJson } from "@/lib/api"
import { useNotifications } from "@/contexts/notifications-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarWidget } from "@/components/ui/calendar"
import { useAuth } from "@/contexts/auth-context"

interface Task {
  id: string
  taskName: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate: string
  zone: string
  assignedTechnician: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'pending_approval'
  createdAt: string
}

export function MaintenanceSchedule() {
  const { addNotification } = useNotifications()
  const { isDemo } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    taskName: "",
    type: "",
    priority: "medium" as Task['priority'],
    dueDate: "",
    zone: "",
    assignedTechnician: "",
  })
  const [formDate, setFormDate] = useState<Date | undefined>(undefined)
  const [formTime, setFormTime] = useState<string>("10:00")
  const [formError, setFormError] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const typeOptions = [
    "Preventive Maintenance","Equipment Replacement","Emergency Repair","Calibration","Inspection"
  ]
  const zoneOptions = ["A","B","C","D"]

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchJson<{ tasks: Task[] }>(`${API_BASE_URL}/tasks`).then((d) => {
      if (mounted) setTasks(d.tasks)
    }).catch(() => {}).finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const upcomingMaintenance = useMemo(() => tasks.filter(t => t.status !== 'completed').sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [tasks])
  const completedMaintenance = useMemo(() => tasks.filter(t => t.status === 'completed').slice(0, 5), [tasks])

  async function submitTask(e: React.FormEvent) {
    e.preventDefault()
    if (isDemo) { addNotification({ type: 'info', title: 'Demo', message: 'Task creation is disabled in demo.' }); return }
    setFormError("")
    // Basic client-side validation to match server contract
    if (!form.taskName.trim()) return setFormError('Task name is required')
    if (!form.type.trim()) return setFormError('Type is required')
    if (!form.zone.trim()) return setFormError('Zone is required')
    if (!form.assignedTechnician.trim()) return setFormError('Assigned technician is required')
    if (!formDate) return setFormError('Due date is required')

    setSubmitting(true)
    try {
      const [hh, mm] = formTime.split(':')
      const d = new Date(formDate)
      d.setHours(Number(hh) || 0)
      d.setMinutes(Number(mm) || 0)
      d.setSeconds(0); d.setMilliseconds(0)
      const dueISO = d.toISOString()
      const payload = { ...form, dueDate: dueISO }
      const resp = await fetchJson<{ task: Task }>(`${API_BASE_URL}/tasks`, { method: 'POST', body: JSON.stringify(payload) })
      setTasks((prev) => [resp.task, ...prev])
      addNotification({ type: 'success', title: 'Maintenance Task Scheduled', message: `${resp.task.taskName} on ${new Date(resp.task.dueDate).toLocaleString()}`, region: form.zone })
      setOpen(false)
      setForm({ taskName: "", type: "", priority: "medium", dueDate: "", zone: "", assignedTechnician: "" })
      setFormDate(undefined); setFormTime("10:00")
    } catch (e) {
      addNotification({ type: 'warning', title: 'Failed to schedule task', message: (e as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500 text-white">Scheduled</Badge>
      case "approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>
      case "in_progress":
        return <Badge className="bg-orange-500 text-white">In Progress</Badge>
      case "pending_approval":
        return <Badge className="bg-yellow-500 text-white">Pending Approval</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Maintenance Schedule</h1>
        <p className="text-muted-foreground">Planned and ongoing maintenance activities for power distribution lines</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
              <CalendarIconLucide className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <Wrench className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIconLucide className="w-5 h-5 text-blue-500" />
              Upcoming Maintenance
            </CardTitle>
          <Dialog open={open} onOpenChange={(v)=> !isDemo && setOpen(v)}>
            <DialogTrigger asChild>
              <Button disabled={isDemo} title={isDemo ? 'Disabled in demo' : undefined}>Schedule New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Maintenance Task</DialogTitle>
              </DialogHeader>
              <form className="space-y-3" onSubmit={submitTask}>
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <div>
                  <Label>Task Name</Label>
                  <Input value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} required />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type (required)" /></SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task['priority'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          {formDate ? formDate.toDateString() : 'Pick a date (required)'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarWidget mode="single" selected={formDate} onSelect={setFormDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <div className="mt-2 flex gap-2">
                      <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Zone</Label>
                    <Select value={form.zone} onValueChange={(v) => setForm({ ...form, zone: v })}>
                      <SelectTrigger><SelectValue placeholder="Select zone (required)" /></SelectTrigger>
                      <SelectContent>
                        {zoneOptions.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Assigned Technician</Label>
                  <Input value={form.assignedTechnician} onChange={(e) => setForm({ ...form, assignedTechnician: e.target.value })} required />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
                  <Button type="submit" disabled={submitting || !form.taskName || !form.type || !form.zone || !form.assignedTechnician || !formDate}>Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMaintenance.map((maintenance) => (
            <Card key={maintenance.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", getPriorityColor(maintenance.priority))} />
                    <div>
                      <div className="font-semibold text-lg">
                        {maintenance.taskName} - {maintenance.type}
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {maintenance.id}</div>
                    </div>
                  </div>
                  {getStatusBadge(maintenance.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIconLucide className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Due:</span>
                      <span>{new Date(maintenance.dueDate).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Technician:</span>
                      <span>{maintenance.assignedTechnician}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Zone:</span>
                      <span>{maintenance.zone}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Priority:</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-2 text-xs",
                          maintenance.priority === "critical" && "border-red-500 text-red-600",
                          maintenance.priority === "high" && "border-orange-500 text-orange-600",
                          maintenance.priority === "medium" && "border-yellow-500 text-yellow-600",
                          maintenance.priority === "low" && "border-blue-500 text-blue-600",
                        )}
                      >
                        {maintenance.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isDemo && <EditScheduleDialog task={maintenance} onUpdated={(t) => setTasks(prev => prev.map(p => p.id === t.id ? t : p))} />}
                  {!isDemo && <AssignTechDialog task={maintenance} onUpdated={(t) => setTasks(prev => prev.map(p => p.id === t.id ? t : p))} />}
                  <ViewDetailsDialog task={maintenance} />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Recently Completed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recently Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {completedMaintenance.map((maintenance) => (
            <Card key={maintenance.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-lg">
                      {maintenance.taskName} - {maintenance.type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed on {new Date(maintenance.dueDate).toLocaleString()} by {maintenance.assignedTechnician}
                    </div>
                  </div>
                  {getStatusBadge(maintenance.status)}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Report
                  </Button>
                  <Button size="sm" variant="outline">
                    Schedule Follow-up
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function useTaskApi() {
  async function patchTask(id: string, body: any) {
    const res = await fetchJson<{ task: any }>(`${API_BASE_URL}/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
    return res.task
  }
  return { patchTask }
}

function EditScheduleDialog({ task, onUpdated }: { task: any; onUpdated: (t: any) => void }) {
  const [open, setOpen] = useState(false)
  const [taskName, setTaskName] = useState(task.taskName)
  const [type, setType] = useState(task.type)
  const [priority, setPriority] = useState<Task['priority']>(task.priority)
  const [zone, setZone] = useState(task.zone)
  const [date, setDate] = useState<Date | undefined>(new Date(task.dueDate))
  const [time, setTime] = useState<string>(() => {
    const d = new Date(task.dueDate); const hh = String(d.getHours()).padStart(2,'0'); const mm = String(d.getMinutes()).padStart(2,'0'); return `${hh}:${mm}`
  })
  const { patchTask } = useTaskApi()

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    const [hh, mm] = time.split(':')
    const d = date ? new Date(date) : new Date(task.dueDate)
    d.setHours(Number(hh)||0); d.setMinutes(Number(mm)||0); d.setSeconds(0); d.setMilliseconds(0)
    const updated = await patchTask(task.id, { taskName, type, priority, zone, dueDate: d.toISOString() })
    onUpdated(updated)
    setOpen(false)
  }

  const typeOptions = ["Preventive Maintenance","Equipment Replacement","Emergency Repair","Calibration","Inspection"]
  const zoneOptions = ["A","B","C","D"]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Edit Schedule</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Schedule</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={onSave}>
          <div>
            <Label>Task Name</Label>
            <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} required />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{typeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">{date ? date.toDateString() : new Date(task.dueDate).toDateString()}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarWidget mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
              <div className="mt-2"><Input type="time" value={time} onChange={(e)=>setTime(e.target.value)} /></div>
            </div>
            <div>
              <Label>Zone</Label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{zoneOptions.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-2 text-right"><Button type="submit">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AssignTechDialog({ task, onUpdated }: { task: any; onUpdated: (t: any) => void }) {
  const [open, setOpen] = useState(false)
  const [tech, setTech] = useState(task.assignedTechnician || "")
  const { patchTask } = useTaskApi()
  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    const updated = await patchTask(task.id, { assignedTechnician: tech })
    onUpdated(updated)
    setOpen(false)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Assign Technician</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign Technician</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={onSave}>
          <div>
            <Label>Technician</Label>
            <Input value={tech} onChange={(e)=>setTech(e.target.value)} placeholder="Enter name" required />
          </div>
          <div className="pt-2 text-right"><Button type="submit">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewDetailsDialog({ task }: { task: any }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">View Details</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Task Details</DialogTitle></DialogHeader>
        <div className="text-sm space-y-2">
          <div><span className="font-medium">Task:</span> {task.taskName}</div>
          <div><span className="font-medium">Type:</span> {task.type}</div>
          <div><span className="font-medium">Priority:</span> {task.priority}</div>
          <div><span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleString()}</div>
          <div><span className="font-medium">Zone:</span> {task.zone}</div>
          <div><span className="font-medium">Technician:</span> {task.assignedTechnician || '—'}</div>
          <div><span className="font-medium">Status:</span> {task.status}</div>
          <div><span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleString()}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
