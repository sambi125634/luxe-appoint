import { useState, useEffect } from "react";
import { Search, Mail, User, Shield, ShieldCheck, ShieldX, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_approved: boolean;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: AppRole;
}

interface UserWithRoles extends Profile {
  roles: AppRole[];
}

const roleLabels: Record<AppRole, string> = {
  super_admin: "Super Admin",
  salon_owner: "Właściciel salonu",
  staff: "Pracownik",
  client: "Klient",
};

const roleColors: Record<AppRole, string> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
  salon_owner: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  staff: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  client: "bg-green-500/10 text-green-500 border-green-500/20",
};

export function UsersManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const profiles = profilesRes.data || [];
      const roles = rolesRes.data || [];

      const usersWithRoles: UserWithRoles[] = profiles.map((profile) => ({
        ...profile,
        roles: roles
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Błąd podczas pobierania użytkowników");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (user: UserWithRoles) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_approved: !user.is_approved,
          approved_at: !user.is_approved ? new Date().toISOString() : null,
          approved_by: !user.is_approved ? currentUser?.id : null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setUsers(users.map((u) =>
        u.id === user.id ? { ...u, is_approved: !u.is_approved } : u
      ));
      toast.success(user.is_approved ? "Użytkownik dezaktywowany" : "Użytkownik zatwierdzony");
    } catch (error) {
      console.error("Error toggling approval:", error);
      toast.error("Błąd podczas zmiany statusu");
    }
  };

  const openRolesDialog = (user: UserWithRoles) => {
    setSelectedUser(user);
    setSelectedRoles([...user.roles]);
    setRolesDialogOpen(true);
  };

  const handleRoleToggle = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const saveRoles = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Delete existing roles for this user
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      if (deleteError) throw deleteError;

      // Insert new roles
      if (selectedRoles.length > 0) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(
            selectedRoles.map((role) => ({
              user_id: selectedUser.id,
              role,
            }))
          );

        if (insertError) throw insertError;
      }

      setUsers(users.map((u) =>
        u.id === selectedUser.id ? { ...u, roles: selectedRoles } : u
      ));
      toast.success("Role zaktualizowane");
      setRolesDialogOpen(false);
    } catch (error) {
      console.error("Error saving roles:", error);
      toast.error("Błąd podczas zapisywania ról");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.roles.includes(roleFilter as AppRole);

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po emailu, imieniu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Rola" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie role</SelectItem>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-serif font-semibold">{users.length}</p>
          <p className="text-xs text-muted-foreground">Wszyscy</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-serif font-semibold">
            {users.filter((u) => u.is_approved).length}
          </p>
          <p className="text-xs text-muted-foreground">Zatwierdzeni</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-serif font-semibold">
            {users.filter((u) => u.roles.includes("super_admin")).length}
          </p>
          <p className="text-xs text-muted-foreground">Super Admini</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-serif font-semibold">
            {users.filter((u) => u.roles.includes("salon_owner")).length}
          </p>
          <p className="text-xs text-muted-foreground">Właściciele</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data rejestracji</TableHead>
              <TableHead className="w-24">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Brak użytkowników do wyświetlenia
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                          : "Brak nazwy"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <span className="text-muted-foreground text-sm">Brak</span>
                      ) : (
                        user.roles.map((role) => (
                          <Badge key={role} variant="outline" className={roleColors[role]}>
                            {roleLabels[role]}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_approved}
                        onCheckedChange={() => toggleApproval(user)}
                      />
                      {user.is_approved ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Aktywny
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <ShieldX className="w-3 h-3 mr-1" />
                          Oczekuje
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.created_at), "d MMM yyyy", { locale: pl })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openRolesDialog(user)}
                    >
                      <UserCog className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Roles Dialog */}
      <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Zarządzaj rolami</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {selectedUser.first_name || selectedUser.last_name
                    ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim()
                    : "Brak nazwy"}
                </p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>

              <div className="space-y-3">
                <Label>Przypisane role</Label>
                {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                  <div key={role} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Checkbox
                      id={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={role} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${role === "super_admin" ? "text-destructive" : role === "salon_owner" ? "text-purple-500" : "text-blue-500"}`} />
                          {roleLabels[role]}
                        </div>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {role === "super_admin" && "Pełny dostęp do panelu administratora platformy"}
                        {role === "salon_owner" && "Zarządzanie własnym salonem i personelem"}
                        {role === "staff" && "Dostęp do kalendarza i zarządzania wizytami"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolesDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={saveRoles} disabled={saving}>
              {saving ? "Zapisywanie..." : "Zapisz role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
