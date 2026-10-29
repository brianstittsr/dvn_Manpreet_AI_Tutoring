"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  MailCheck,
  MoreVertical,
  RefreshCw,
  Search,
  TicketCheck,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { COLLECTIONS, type EventDoc, type EventRegistration } from "@/lib/schema";
import { authedJsonHeaders } from "@/lib/api-client";

type RegistrationRow = EventRegistration & {
  accountProvisioned?: boolean;
  accountProvisionError?: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-teal-500/10 text-teal-700 border-teal-500/30",
  checked_in: "bg-green-500/10 text-green-700 border-green-500/30",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-green-500/10 text-green-700 border-green-500/30",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  failed: "bg-red-500/10 text-red-600 border-red-500/30",
  refunded: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

export default function EventRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [eventsById, setEventsById] = useState<Record<string, EventDoc>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [regSnap, eventSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, COLLECTIONS.EVENT_REGISTRATIONS),
            orderBy("createdAt", "desc")
          )
        ),
        getDocs(collection(db, COLLECTIONS.EVENTS)),
      ]);
      setRegistrations(
        regSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as RegistrationRow)
      );
      const map: Record<string, EventDoc> = {};
      eventSnap.docs.forEach((d) => {
        map[d.id] = { id: d.id, ...d.data() } as EventDoc;
      });
      setEventsById(map);
    } catch (error) {
      console.error("Error loading registrations:", error);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return registrations.filter((r) => {
      if (eventFilter !== "all" && r.eventId !== eventFilter) return false;
      if (!term) return true;
      return (
        r.firstName.toLowerCase().includes(term) ||
        r.lastName.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        (eventsById[r.eventId]?.title || "").toLowerCase().includes(term)
      );
    });
  }, [registrations, search, eventFilter, eventsById]);

  const stats = useMemo(
    () => ({
      total: registrations.length,
      confirmed: registrations.filter((r) => r.status === "confirmed").length,
      checkedIn: registrations.filter((r) => r.status === "checked_in").length,
      provisioned: registrations.filter((r) => r.accountProvisioned).length,
    }),
    [registrations]
  );

  const resendLogin = async (registration: RegistrationRow) => {
    setBusyId(registration.id);
    try {
      const response = await fetch("/api/events/resend-login", {
        method: "POST",
        headers: await authedJsonHeaders(),
        body: JSON.stringify({ registrationId: registration.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to resend login info");
      }
      toast.success(
        data.emailSent
          ? `Login details sent to ${registration.email}`
          : "Account ready — email could not be sent (check SMTP settings)"
      );
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend login info"
      );
    } finally {
      setBusyId(null);
    }
  };

  const setStatus = async (
    registration: RegistrationRow,
    status: "checked_in" | "confirmed" | "cancelled"
  ) => {
    if (!db) return;
    setBusyId(registration.id);
    try {
      await updateDoc(doc(db, COLLECTIONS.EVENT_REGISTRATIONS, registration.id), {
        status,
        checkInTime: status === "checked_in" ? new Date() : null,
      });
      toast.success(
        status === "checked_in"
          ? `${registration.firstName} checked in`
          : `Registration ${status}`
      );
      await load();
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Failed to update registration");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TicketCheck className="h-6 w-6 text-teal-600" />
            Event Registrations
          </h1>
          <p className="text-muted-foreground">
            Attendees, learner accounts, check-in, and login emails.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Registrations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.confirmed}</div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-xs text-muted-foreground">Checked In</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.provisioned}</div>
            <div className="text-xs text-muted-foreground">Accounts Created</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registrations</CardTitle>
          <CardDescription>
            Accounts are created automatically at registration; use the menu to
            resend login details or manage check-in.
          </CardDescription>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, or event…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {Object.values(eventsById).map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CalendarCheck className="mx-auto mb-3 h-10 w-10" />
              No registrations found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <div className="font-medium">
                        {registration.firstName} {registration.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {registration.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {eventsById[registration.eventId]?.title || registration.eventId}
                    </TableCell>
                    <TableCell>
                      {registration.tickets
                        .map((t) => `${t.quantity}× ${t.ticketTypeName}`)
                        .join(", ")}
                      {registration.total > 0 &&
                        ` · $${(registration.total / 100).toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={PAYMENT_STYLES[registration.paymentStatus] || ""}
                      >
                        {registration.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[registration.status] || ""}
                      >
                        {registration.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {registration.accountProvisioned ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-700 border-blue-500/30"
                        >
                          <MailCheck className="mr-1 h-3 w-3" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          —
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {registration.createdAt?.toDate
                        ? format(registration.createdAt.toDate(), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={busyId === registration.id}
                          >
                            {busyId === registration.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => resendLogin(registration)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Resend login email
                          </DropdownMenuItem>
                          {registration.status !== "checked_in" && (
                            <DropdownMenuItem
                              onClick={() => setStatus(registration, "checked_in")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark checked in
                            </DropdownMenuItem>
                          )}
                          {registration.status === "checked_in" && (
                            <DropdownMenuItem
                              onClick={() => setStatus(registration, "confirmed")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Undo check-in
                            </DropdownMenuItem>
                          )}
                          {registration.status !== "cancelled" && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setStatus(registration, "cancelled")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel registration
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
