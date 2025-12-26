"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  CheckCircle2,
  Edit2,
  Save,
  X,
  ShieldCheck,
  Mail,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { API } from "@/lib/api-endpoints";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Admin {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(API.PROFILE, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Session expired. Please login again.");
        router.push(API.LOGIN);
        return;
      }

      const data = await response.json();
      setAdmin(data.admin);
      setFormData({
        name: data.admin.name,
      });
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      toast.error("Failed to load profile");
      router.push(API.LOGIN);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(API.PROFILE, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      setAdmin(data.admin);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: admin?.name || "",
    });
    setEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-white font-bold text-2xl">
                  {getInitials(admin.name)}
                </AvatarFallback>
              </Avatar>
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {admin.name}
                  </h2>
                  <Badge
                    variant={admin.is_active ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {admin.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{admin.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs">Administrator</span>
                </div>
              </div>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)} size="sm" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Update your personal details
              </p>
            </div>
            {editing && (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm" disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                Full Name
              </Label>
              {editing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter your full name"
                  className="max-w-md"
                />
              ) : (
                <p className="text-base text-gray-900">{admin.name}</p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </Label>
              <div className="flex items-center gap-3">
                <p className="text-base text-gray-900">{admin.email}</p>
                <Badge variant="outline" className="text-xs">
                  Cannot be changed
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Your email address is used for authentication and cannot be
                modified
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details Card */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Account Details</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Information about your account
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Account ID */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                Account ID
              </Label>
              <p className="text-base text-gray-600 font-mono">#{admin.id}</p>
            </div>

            {/* Created Date */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Account Created
              </Label>
              <p className="text-base text-gray-900">
                {formatDate(admin.created_at)}
              </p>
            </div>

            {/* Last Updated */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Last Updated
              </Label>
              <p className="text-base text-gray-900">
                {formatDate(admin.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
