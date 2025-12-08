"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCurrentProperty } from "@/contexts/current-property-context";
import { useAuth } from "@/contexts/auth-context";
import { propertyAPI, Manager } from "@/lib/property-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building,
  UserPlus,
  Trash2,
  Mail,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PropertySettings() {
  const { currentProperty } = useCurrentProperty();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;

  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [managerEmail, setManagerEmail] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const isOwner = user?.role === "property_owner";

  useEffect(() => {
    if (!isOwner) {
      toast({
        title: "Access Denied",
        description: "Only property owners can access settings",
        variant: "destructive",
      });
      router.push(`/${propertyId}/dashboard`);
      return;
    }

    loadManagers();
  }, [isOwner, propertyId, router]);

  const loadManagers = async () => {
    try {
      setIsLoading(true);
      const data = await propertyAPI.getPropertyManagers(propertyId);
      setManagers(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load managers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignManager = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a manager email",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAssigning(true);
      await propertyAPI.assignManager(propertyId, managerEmail.trim());
      toast({
        title: "Success",
        description: "Manager assigned successfully",
      });
      setManagerEmail("");
      loadManagers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign manager",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignManager = async (managerId: string) => {
    if (!confirm("Are you sure you want to remove this manager?")) {
      return;
    }

    try {
      await propertyAPI.unassignManager(propertyId, managerId);
      toast({
        title: "Success",
        description: "Manager removed successfully",
      });
      loadManagers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove manager",
        variant: "destructive",
      });
    }
  };

  if (!currentProperty || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${propertyId}/dashboard`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Property Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentProperty.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Assign Manager Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Assign Manager
              </CardTitle>
              <CardDescription>
                Add a manager to this property by entering their email address.
                They must have a manager account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssignManager} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="managerEmail" className="sr-only">
                    Manager Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="managerEmail"
                      type="email"
                      placeholder="manager@example.com"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      className="pl-10"
                      disabled={isAssigning}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isAssigning}>
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Managers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Managers
              </CardTitle>
              <CardDescription>
                Managers who have access to this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                </div>
              ) : managers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-muted-foreground">
                    No managers assigned yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {managers.map((manager) => (
                    <div
                      key={manager.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-700">
                            {manager.first_name[0]}
                            {manager.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {manager.first_name} {manager.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {manager.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnassignManager(manager.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
