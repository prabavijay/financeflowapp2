import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Crown, 
  Shield, 
  Eye,
  EyeOff,
  UserPlus,
  Settings,
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Bell,
  Lock,
  Unlock,
  Key,
  Share2,
  Download,
  Upload,
  MessageCircle,
  BookOpen,
  GraduationCap,
  Baby,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import apiClient from '@/api/client';

const PERMISSION_LEVELS = [
  { 
    value: 'admin', 
    label: 'Administrator', 
    description: 'Full access to all family financial data',
    icon: Crown,
    color: 'bg-purple-500'
  },
  { 
    value: 'manager', 
    label: 'Manager', 
    description: 'Can view and manage most financial data',
    icon: Shield,
    color: 'bg-blue-500'
  },
  { 
    value: 'viewer', 
    label: 'Viewer', 
    description: 'Can view selected financial information',
    icon: Eye,
    color: 'bg-green-500'
  },
  { 
    value: 'child', 
    label: 'Child', 
    description: 'Limited access to age-appropriate information',
    icon: Baby,
    color: 'bg-orange-500'
  }
];

const FAMILY_MEMBER_TYPES = [
  'Spouse/Partner', 'Child', 'Parent', 'Sibling', 'Guardian', 'Other'
];

const DATA_CATEGORIES = [
  { id: 'income', label: 'Income', icon: TrendingUp, sensitive: false },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown, sensitive: false },
  { id: 'bills', label: 'Bills', icon: Calendar, sensitive: false },
  { id: 'debts', label: 'Debts', icon: AlertTriangle, sensitive: true },
  { id: 'assets', label: 'Assets', icon: BarChart3, sensitive: true },
  { id: 'investments', label: 'Investments', icon: DollarSign, sensitive: true },
  { id: 'budgets', label: 'Budgets', icon: Target, sensitive: false },
  { id: 'goals', label: 'Financial Goals', icon: Target, sensitive: false }
];

export default function FamilyDashboard() {
  const [familyGroup, setFamilyGroup] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [familyFinancials, setFamilyFinancials] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMember, setSelectedMember] = useState('all');
  
  // Dialog states
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  // Form states
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    family_type: 'Nuclear Family',
    privacy_level: 'private'
  });
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'Spouse/Partner',
    permission_level: 'viewer',
    age: '',
    can_approve_expenses: false,
    spending_limit: '',
    data_access: [],
    notes: ''
  });
  
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      const [groupRes, membersRes, financialsRes, notificationsRes, userRes] = await Promise.all([
        apiClient.get('/family-group'),
        apiClient.get('/family-members'),
        apiClient.get('/family-financials'),
        apiClient.get('/family-notifications'),
        apiClient.get('/user/profile')
      ]);
      
      setFamilyGroup(groupRes.data);
      setFamilyMembers(membersRes.data || []);
      setFamilyFinancials(financialsRes.data || {});
      setNotifications(notificationsRes.data || []);
      setCurrentUser(userRes.data);
    } catch (error) {
      console.error('Error loading family data:', error);
      toast.error('Failed to load family dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/family-group', newGroup);
      if (response.success) {
        setFamilyGroup(response.data);
        setNewGroup({
          name: '',
          description: '',
          family_type: 'Nuclear Family',
          privacy_level: 'private'
        });
        setIsGroupDialogOpen(false);
        toast.success('Family group created successfully');
      }
    } catch (error) {
      console.error('Error creating family group:', error);
      toast.error('Failed to create family group');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/family-members', newMember);
      if (response.success) {
        setFamilyMembers([...familyMembers, response.data]);
        setNewMember({
          name: '',
          email: '',
          phone: '',
          relationship: 'Spouse/Partner',
          permission_level: 'viewer',
          age: '',
          can_approve_expenses: false,
          spending_limit: '',
          data_access: [],
          notes: ''
        });
        setIsMemberDialogOpen(false);
        toast.success('Family member invited successfully');
      }
    } catch (error) {
      console.error('Error adding family member:', error);
      toast.error('Failed to add family member');
    }
  };

  const handleUpdateMemberPermissions = async (memberId, newPermissions) => {
    try {
      const response = await apiClient.patch(`/family-members/${memberId}`, newPermissions);
      if (response.success) {
        setFamilyMembers(familyMembers.map(member => 
          member.id === memberId ? { ...member, ...newPermissions } : member
        ));
        toast.success('Member permissions updated');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  const getPermissionLevel = (level) => {
    return PERMISSION_LEVELS.find(p => p.value === level) || PERMISSION_LEVELS[2];
  };

  const calculateFamilyTotals = () => {
    return {
      income: familyFinancials.total_income || 0,
      expenses: familyFinancials.total_expenses || 0,
      assets: familyFinancials.total_assets || 0,
      debts: familyFinancials.total_debts || 0,
      netWorth: (familyFinancials.total_assets || 0) - (familyFinancials.total_debts || 0)
    };
  };

  const getFilteredMembers = () => {
    if (selectedMember === 'all') return familyMembers;
    return familyMembers.filter(member => member.id === selectedMember);
  };

  const canUserAccess = (dataCategory, member = currentUser) => {
    if (!member) return false;
    if (member.permission_level === 'admin') return true;
    if (member.permission_level === 'manager' && !DATA_CATEGORIES.find(c => c.id === dataCategory)?.sensitive) return true;
    return member.data_access?.includes(dataCategory) || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  // If no family group exists, show setup
  if (!familyGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-8 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Family Financial Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-3xl mx-auto mb-8">
              Manage your family's finances together with secure sharing and permission controls
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <CardTitle>Create Your Family Group</CardTitle>
              <CardDescription>
                Set up a shared financial dashboard for your family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div>
                  <Label>Family Group Name</Label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="e.g., The Smith Family"
                    required
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    placeholder="Brief description of your family financial goals"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Family Type</Label>
                    <Select
                      value={newGroup.family_type}
                      onValueChange={(value) => setNewGroup({...newGroup, family_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nuclear Family">Nuclear Family</SelectItem>
                        <SelectItem value="Extended Family">Extended Family</SelectItem>
                        <SelectItem value="Single Parent">Single Parent Family</SelectItem>
                        <SelectItem value="Blended Family">Blended Family</SelectItem>
                        <SelectItem value="Multi-Generational">Multi-Generational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Privacy Level</Label>
                    <Select
                      value={newGroup.privacy_level}
                      onValueChange={(value) => setNewGroup({...newGroup, privacy_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="family_only">Family Only</SelectItem>
                        <SelectItem value="limited_sharing">Limited Sharing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create Family Group
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totals = calculateFamilyTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {familyGroup.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {familyGroup.description || 'Family Financial Dashboard'}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Permissions
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Sharing Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Family Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${totals.income.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Family Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${totals.expenses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Assets</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${totals.assets.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Debts</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${totals.debts.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Net Worth</p>
                <p className={`text-2xl font-bold ${totals.netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${totals.netWorth.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-200/50 dark:border-blue-700/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-blue-800 dark:text-blue-200">
                You have {notifications.length} family notification(s). 
                <button className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline">View all</button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="sharing">Data Sharing</TabsTrigger>
              <TabsTrigger value="goals">Family Goals</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4">
              <Label>View:</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Family Members</SelectItem>
                  {familyMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Family Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Family Members ({familyMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {familyMembers.slice(0, 4).map((member, index) => {
                    const permissionConfig = getPermissionLevel(member.permission_level);
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`p-2 rounded-full ${permissionConfig.color}`}>
                          <permissionConfig.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.relationship}</p>
                        </div>
                        <Badge variant="outline">{permissionConfig.label}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Data Access Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Data Access Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DATA_CATEGORIES.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{category.label}</span>
                        {category.sensitive && (
                          <Lock className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      <span className="text-sm text-slate-500">
                        {familyMembers.filter(m => canUserAccess(category.id, m)).length}/{familyMembers.length} members
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Family Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Family Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mock activity data */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">John added $500 to Emergency Fund</p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Sarah updated grocery budget</p>
                      <p className="text-xs text-slate-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">New family goal created: Vacation Fund</p>
                      <p className="text-xs text-slate-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Family Members</h2>
              <Button onClick={() => setIsMemberDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map((member, index) => {
                const permissionConfig = getPermissionLevel(member.permission_level);
                
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${permissionConfig.color}`}>
                            <permissionConfig.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-500">{member.relationship}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="w-4 h-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>{permissionConfig.label}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Data Access</span>
                          <span>{member.data_access?.length || 0}/{DATA_CATEGORIES.length}</span>
                        </div>
                        <Progress 
                          value={(member.data_access?.length || 0) / DATA_CATEGORIES.length * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      {member.spending_limit && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Spending Limit: ${member.spending_limit.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Data Sharing Tab */}
          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Data Sharing Matrix
                </CardTitle>
                <CardDescription>
                  Control what financial data each family member can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Data Category</th>
                        {familyMembers.map(member => (
                          <th key={member.id} className="text-center p-4 font-medium min-w-[120px]">
                            {member.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DATA_CATEGORIES.map(category => (
                        <tr key={category.id} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <category.icon className="w-4 h-4 text-slate-500" />
                              <span>{category.label}</span>
                              {category.sensitive && (
                                <Lock className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                          </td>
                          {familyMembers.map(member => (
                            <td key={member.id} className="p-4 text-center">
                              <Switch
                                checked={canUserAccess(category.id, member)}
                                onCheckedChange={(checked) => {
                                  const newDataAccess = checked 
                                    ? [...(member.data_access || []), category.id]
                                    : (member.data_access || []).filter(id => id !== category.id);
                                  handleUpdateMemberPermissions(member.id, { data_access: newDataAccess });
                                }}
                                disabled={member.permission_level === 'admin'}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Sharing Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Sharing Rules & Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-500" />
                      Administrator Access
                    </h4>
                    <p className="text-sm text-slate-600">
                      Administrators have full access to all family financial data and can manage member permissions.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Manager Access
                    </h4>
                    <p className="text-sm text-slate-600">
                      Managers can view and edit most financial data but cannot access sensitive information without explicit permission.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      Viewer Access
                    </h4>
                    <p className="text-sm text-slate-600">
                      Viewers can only see financial data that has been specifically shared with them.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-orange-500" />
                      Child Access
                    </h4>
                    <p className="text-sm text-slate-600">
                      Children have limited access to age-appropriate financial information and educational content.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Family Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Family Financial Goals</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mock family goals */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">College Fund</h3>
                        <p className="text-sm text-slate-500">Education savings for kids</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500">Active</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>$15,000 / $50,000</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Target: Dec 2030</span>
                      <span>30% Complete</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Emergency Fund</h3>
                        <p className="text-sm text-slate-500">6 months of expenses</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500">In Progress</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>$8,500 / $20,000</span>
                    </div>
                    <Progress value={42.5} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Target: Jun 2025</span>
                      <span>42% Complete</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goal Creation Wizard */}
            <Card>
              <CardHeader>
                <CardTitle>Create Family Goal</CardTitle>
                <CardDescription>
                  Set up a shared financial goal that all family members can contribute to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-16 border-2 border-dashed">
                  <Plus className="w-6 h-6 mr-2" />
                  Start Goal Creation Wizard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Member Dialog */}
        <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
              <DialogDescription>
                Invite a family member to join your financial dashboard
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Family member's full name"
                    required
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Select
                    value={newMember.relationship}
                    onValueChange={(value) => setNewMember({...newMember, relationship: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FAMILY_MEMBER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label>Phone (Optional)</Label>
                  <Input
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Permission Level</Label>
                  <Select
                    value={newMember.permission_level}
                    onValueChange={(value) => setNewMember({...newMember, permission_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <level.icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-slate-500">{level.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Age (Optional)</Label>
                  <Input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                    placeholder="Age"
                  />
                </div>
              </div>
              
              <div>
                <Label>Spending Limit (Optional)</Label>
                <Input
                  type="number"
                  value={newMember.spending_limit}
                  onChange={(e) => setNewMember({...newMember, spending_limit: e.target.value})}
                  placeholder="Monthly spending limit"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Additional Permissions</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newMember.can_approve_expenses}
                    onCheckedChange={(checked) => setNewMember({...newMember, can_approve_expenses: checked})}
                  />
                  <Label>Can approve family expenses</Label>
                </div>
              </div>
              
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={newMember.notes}
                  onChange={(e) => setNewMember({...newMember, notes: e.target.value})}
                  placeholder="Additional notes about this family member"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">Send Invitation</Button>
                <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}