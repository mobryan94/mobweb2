import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  CreditCard, 
  MessageSquare, 
  Server, 
  BarChart3, 
  Settings,
  Shield,
  DollarSign,
  Activity,
  Globe,
  Database
} from "lucide-react";
import logoPath from "@assets/triangle-logo.svg";

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  tier: "free" | "official" | "premium";
  createdAt: string;
  isActive: boolean;
  totalDeployments: number;
  storageUsed: number;
}

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Check if user is admin (you should implement proper admin check)
  if (!user || user.email !== "admin@seskrow.com") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => apiRequest("/api/admin/users"),
  });

  const { data: supportTickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ["admin-support"],
    queryFn: () => apiRequest("/api/admin/support"),
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => apiRequest("/api/admin/analytics"),
  });

  const updateUserTierMutation = useMutation({
    mutationFn: ({ userId, tier }: { userId: string; tier: string }) =>
      apiRequest(`/api/admin/users/${userId}/tier`, {
        method: "PUT",
        body: JSON.stringify({ tier }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      toast({
        title: "User tier updated",
        description: "Changes have been saved",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const resolveTicketMutation = useMutation({
    mutationFn: (ticketId: string) =>
      apiRequest(`/api/admin/support/${ticketId}/resolve`, {
        method: "PUT",
      }),
    onSuccess: () => {
      toast({
        title: "Ticket resolved",
        description: "Support ticket has been marked as resolved",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-support"] });
    },
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free": return "bg-gray-500/20 text-gray-400";
      case "official": return "bg-blue-500/20 text-blue-400";
      case "premium": return "bg-purple-500/20 text-purple-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTierPrice = (tier: string) => {
    switch (tier) {
      case "free": return "$0";
      case "official": return "$15";
      case "premium": return "$35";
      default: return "$0";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="glass-morphism border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoPath} alt="SESKROW" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-gray-400 text-sm">SESKROW Management Dashboard</p>
            </div>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500">
            Administrator
          </Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Monthly Revenue</p>
                  <p className="text-2xl font-bold">
                    ${users.reduce((total, user) => {
                      const price = getTierPrice(user.tier);
                      return total + parseInt(price.replace("$", ""));
                    }, 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Open Tickets</p>
                  <p className="text-2xl font-bold">
                    {supportTickets.filter(t => t.status === "open").length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Deployments</p>
                  <p className="text-2xl font-bold">
                    {users.reduce((total, user) => total + user.totalDeployments, 0)}
                  </p>
                </div>
                <Server className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="glass-morphism border-gray-700">
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-semibold">{user.fullName}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                          <Badge className={getTierColor(user.tier)}>
                            {user.tier} - {getTierPrice(user.tier)}/mo
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                          <span>{user.totalDeployments} deployments</span>
                          <span>{(user.storageUsed / 1024 / 1024).toFixed(1)} MB used</span>
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black border-gray-700">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Full Name</Label>
                                <p className="text-sm text-gray-300">{user.fullName}</p>
                              </div>
                              <div>
                                <Label>Email</Label>
                                <p className="text-sm text-gray-300">{user.email}</p>
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <p className="text-sm text-gray-300">{user.phoneNumber}</p>
                              </div>
                              <div>
                                <Label>Address</Label>
                                <p className="text-sm text-gray-300">{user.address}</p>
                              </div>
                              <div>
                                <Label>Current Tier</Label>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getTierColor(user.tier)}>
                                    {user.tier}
                                  </Badge>
                                  <span className="text-sm">{getTierPrice(user.tier)}/month</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateUserTierMutation.mutate({
                                    userId: user.id,
                                    tier: "free"
                                  })}
                                >
                                  Set Free
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateUserTierMutation.mutate({
                                    userId: user.id,
                                    tier: "official"
                                  })}
                                >
                                  Set Official
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateUserTierMutation.mutate({
                                    userId: user.id,
                                    tier: "premium"
                                  })}
                                >
                                  Set Premium
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card className="glass-morphism border-gray-700">
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-start justify-between p-4 border border-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{ticket.userEmail}</h4>
                          <Badge
                            className={
                              ticket.status === "open"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{ticket.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {ticket.status === "open" && (
                        <Button
                          size="sm"
                          onClick={() => resolveTicketMutation.mutate(ticket.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-morphism border-gray-700">
                <CardHeader>
                  <CardTitle>User Distribution by Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["free", "official", "premium"].map((tier) => {
                      const count = users.filter(u => u.tier === tier).length;
                      const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                      return (
                        <div key={tier} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getTierColor(tier)}>
                              {tier}
                            </Badge>
                            <span className="text-sm">{count} users</span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-gray-700">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["official", "premium"].map((tier) => {
                      const count = users.filter(u => u.tier === tier).length;
                      const price = parseInt(getTierPrice(tier).replace("$", ""));
                      const revenue = count * price;
                      return (
                        <div key={tier} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getTierColor(tier)}>
                              {tier}
                            </Badge>
                            <span className="text-sm">{count} × {getTierPrice(tier)}</span>
                          </div>
                          <span className="text-sm font-semibold">
                            ${revenue}/mo
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-700 mt-4 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Monthly Revenue</span>
                      <span className="text-lg font-bold text-green-400">
                        ${users.reduce((total, user) => {
                          const price = getTierPrice(user.tier);
                          return total + parseInt(price.replace("$", ""));
                        }, 0)}/mo
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
