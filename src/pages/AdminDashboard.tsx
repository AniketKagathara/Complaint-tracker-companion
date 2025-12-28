import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Shield, FileText, Clock, CheckCircle, Plus, Trash2, Tags } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  profiles: {
    name: string;
    email: string;
    enrollment: string;
    department: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  is_default: boolean;
}

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admin-login");
      return;
    }

    const session = JSON.parse(adminSession);
    if (!session.loggedIn) {
      navigate("/admin-login");
      return;
    }

    fetchComplaints();
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          profiles:student_id (
            name,
            email,
            enrollment,
            department
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      console.error("Error fetching complaints:", error);
      toast({
        title: "Error",
        description: "Failed to load complaints.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (complaintId: string, newStatus: string) => {
    setUpdating(complaintId);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaintId);

      if (error) throw error;

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId ? { ...c, status: newStatus } : c
        )
      );

      toast({
        title: "Status Updated",
        description: `Complaint status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    setAddingCategory(true);
    try {
      const { error } = await supabase
        .from("categories")
        .insert({ name: newCategory.trim(), is_default: false });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Category already exists");
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Category added successfully.",
      });

      setNewCategory("");
      fetchCategories();
    } catch (error: any) {
      console.error("Add category error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add category.",
        variant: "destructive",
      });
    } finally {
      setAddingCategory(false);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Category "${categoryName}" deleted.`,
      });

      fetchCategories();
    } catch (error: any) {
      console.error("Delete category error:", error);
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="status-pending">{status}</Badge>;
      case "In Progress":
        return <Badge className="status-progress">{status}</Badge>;
      case "Resolved":
        return <Badge className="status-resolved">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStats = () => {
    const pending = complaints.filter((c) => c.status === "Pending").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress").length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    return { pending, inProgress, resolved, total: complaints.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage campus complaints</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCategories(!showCategories)}
            >
              <Tags className="w-4 h-4 mr-2" />
              Categories
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Categories Management */}
        {showCategories && (
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="w-5 h-5" />
                Manage Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={addingCategory}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <Button onClick={addCategory} disabled={addingCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge 
                    key={cat.id} 
                    variant="outline" 
                    className="flex items-center gap-1 py-1.5 px-3"
                  >
                    {cat.name}
                    {!cat.is_default && (
                      <button
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {cat.is_default && (
                      <span className="text-xs text-muted-foreground ml-1">(default)</span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-status-pending">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-status-pending" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-status-progress">{stats.inProgress}</p>
                </div>
                <FileText className="w-8 h-8 text-status-progress" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-status-resolved">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-status-resolved" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No complaints found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{complaint.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {complaint.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{complaint.profiles?.name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">
                              {complaint.profiles?.enrollment}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{complaint.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                        <TableCell>
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => updateStatus(complaint.id, value)}
                            disabled={updating === complaint.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
