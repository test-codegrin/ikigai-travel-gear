"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/lib/api-endpoints";

interface WarrantyStatus {
  id: number;
  name: string;
  description: string;
  is_deleted: number;
  created_at: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<WarrantyStatus[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<WarrantyStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API.WARRANTY_STATUSES, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStatuses(data.statuses);
      } else {
        toast.error("Failed to load warranty statuses");
      }
    } catch (error) {
      console.error("Fetch statuses error:", error);
      toast.error("Failed to load warranty statuses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({ name: "", description: "" });
    setShowAddDialog(true);
  };

  const handleEditClick = (status: WarrantyStatus) => {
    setSelectedStatus(status);
    setFormData({
      name: status.name,
      description: status.description,
    });
    setShowEditDialog(true);
  };

  const handleDeleteClick = (status: WarrantyStatus) => {
    setSelectedStatus(status);
    setShowDeleteDialog(true);
  };

  const handleAddSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Status name is required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(API.WARRANTY_STATUSES, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Status added successfully");
        setShowAddDialog(false);
        fetchStatuses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add status");
      }
    } catch (error) {
      console.error("Add status error:", error);
      toast.error("Failed to add status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedStatus) return;
    if (!formData.name.trim()) {
      toast.error("Status name is required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API.WARRANTY_STATUSES}/${selectedStatus.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Status updated successfully");
        setShowEditDialog(false);
        fetchStatuses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStatus) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${API.WARRANTY_STATUSES}/${selectedStatus.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Status deleted successfully");
        setShowDeleteDialog(false);
        fetchStatuses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete status");
      }
    } catch (error) {
      console.error("Delete status error:", error);
      toast.error("Failed to delete status");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage warranty statuses and system configurations
          </p>
        </div>
      </div>

      {/* Warranty Statuses Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Warranty Statuses
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manage warranty status types and descriptions
              </p>
            </div>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Status Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Created At</TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No warranty statuses found
                    </TableCell>
                  </TableRow>
                ) : (
                  statuses.map((status) => (
                    <TableRow key={status.id}>
                      <TableCell className="font-medium">{status.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {status.name.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {status.description || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(status.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(status)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(status)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Status Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Warranty Status</DialogTitle>
            <DialogDescription>
              Create a new warranty status type for your system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Status Name *</Label>
              <Input
                id="name"
                placeholder="e.g., under_review"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter status description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Warranty Status</DialogTitle>
            <DialogDescription>
              Update warranty status information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Status Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., under_review"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter status description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Warranty Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the status &quot;
              {selectedStatus?.name}&quot;? This action cannot be undone and may
              affect existing warranties using this status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
