import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Shield, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  Scale,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Building,
  CreditCard,
  Briefcase,
  Heart,
  Settings,
  Bell,
  History
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
import { toast } from 'sonner';
import apiClient from '@/api/client';

const AUTHORIZATION_LEVELS = [
  { 
    value: 'limited', 
    label: 'Limited Powers', 
    description: 'Specific financial tasks only',
    icon: Lock,
    color: 'bg-yellow-500'
  },
  { 
    value: 'general', 
    label: 'General Powers', 
    description: 'Broad financial management',
    icon: Key,
    color: 'bg-blue-500'
  },
  { 
    value: 'durable', 
    label: 'Durable Powers', 
    description: 'Continues if you become incapacitated',
    icon: Shield,
    color: 'bg-green-500'
  },
  { 
    value: 'healthcare', 
    label: 'Healthcare Powers', 
    description: 'Medical and healthcare decisions',
    icon: Heart,
    color: 'bg-red-500'
  }
];

const POWER_TYPES = [
  { category: 'Banking', powers: ['Access bank accounts', 'Write checks', 'Make deposits/withdrawals', 'Manage online banking'] },
  { category: 'Investments', powers: ['Buy/sell securities', 'Manage retirement accounts', 'Make investment decisions', 'Access brokerage accounts'] },
  { category: 'Real Estate', powers: ['Buy/sell property', 'Manage rental properties', 'Sign leases', 'Property maintenance decisions'] },
  { category: 'Business', powers: ['Manage business operations', 'Sign contracts', 'Make business decisions', 'Access business accounts'] },
  { category: 'Legal', powers: ['Sign legal documents', 'Hire attorneys', 'File legal claims', 'Represent in legal matters'] },
  { category: 'Healthcare', powers: ['Make medical decisions', 'Access medical records', 'Choose healthcare providers', 'End-of-life decisions'] }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500', icon: Clock },
  { value: 'pending', label: 'Pending Approval', color: 'bg-yellow-500', icon: Clock },
  { value: 'active', label: 'Active', color: 'bg-green-500', icon: CheckCircle },
  { value: 'suspended', label: 'Suspended', color: 'bg-orange-500', icon: AlertTriangle },
  { value: 'revoked', label: 'Revoked', color: 'bg-red-500', icon: Lock },
  { value: 'expired', label: 'Expired', color: 'bg-gray-400', icon: Clock }
];

export default function PowerOfAttorney() {
  const [powerOfAttorneys, setPowerOfAttorneys] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [accessLog, setAccessLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isPOADialogOpen, setIsPOADialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  
  // Form states
  const [newPOA, setNewPOA] = useState({
    attorney_name: '',
    attorney_contact_id: '',
    authorization_level: 'limited',
    effective_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
    status: 'draft',
    specific_powers: [],
    limitations: '',
    emergency_only: false,
    requires_incapacity: false,
    notification_required: true,
    attorney_compensation: '',
    backup_attorney: '',
    notes: ''
  });
  
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: 'Spouse',
    phone: '',
    email: '',
    address: '',
    verified: false,
    can_be_attorney: true,
    emergency_contact: true,
    notes: ''
  });
  
  const [selectedPOA, setSelectedPOA] = useState(null);

  useEffect(() => {
    loadPOAData();
  }, []);

  const loadPOAData = async () => {
    try {
      setLoading(true);
      const [poaRes, contactsRes, authRes, logRes] = await Promise.all([
        apiClient.get('/power-of-attorney'),
        apiClient.get('/emergency-contacts'),
        apiClient.get('/account-authorizations'),
        apiClient.get('/authorization-log')
      ]);
      
      setPowerOfAttorneys(poaRes.data || []);
      setEmergencyContacts(contactsRes.data || []);
      setAuthorizations(authRes.data || []);
      setAccessLog(logRes.data || []);
    } catch (error) {
      console.error('Error loading POA data:', error);
      toast.error('Failed to load Power of Attorney data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPOA = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/power-of-attorney', newPOA);
      if (response.success) {
        setPowerOfAttorneys([...powerOfAttorneys, response.data]);
        setNewPOA({
          attorney_name: '',
          attorney_contact_id: '',
          authorization_level: 'limited',
          effective_date: new Date().toISOString().split('T')[0],
          expiration_date: '',
          status: 'draft',
          specific_powers: [],
          limitations: '',
          emergency_only: false,
          requires_incapacity: false,
          notification_required: true,
          attorney_compensation: '',
          backup_attorney: '',
          notes: ''
        });
        setIsPOADialogOpen(false);
        toast.success('Power of Attorney created successfully');
      }
    } catch (error) {
      console.error('Error creating POA:', error);
      toast.error('Failed to create Power of Attorney');
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/emergency-contacts', newContact);
      if (response.success) {
        setEmergencyContacts([...emergencyContacts, response.data]);
        setNewContact({
          name: '',
          relationship: 'Spouse',
          phone: '',
          email: '',
          address: '',
          verified: false,
          can_be_attorney: true,
          emergency_contact: true,
          notes: ''
        });
        setIsContactDialogOpen(false);
        toast.success('Contact added successfully');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    }
  };

  const handleRevokePOA = async (poaId) => {
    try {
      const response = await apiClient.patch(`/power-of-attorney/${poaId}`, { 
        status: 'revoked',
        revocation_date: new Date().toISOString()
      });
      if (response.success) {
        setPowerOfAttorneys(powerOfAttorneys.map(poa => 
          poa.id === poaId ? { ...poa, status: 'revoked' } : poa
        ));
        setIsRevokeDialogOpen(false);
        toast.success('Power of Attorney revoked successfully');
      }
    } catch (error) {
      console.error('Error revoking POA:', error);
      toast.error('Failed to revoke Power of Attorney');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return statusConfig;
  };

  const getAuthorizationLevel = (level) => {
    return AUTHORIZATION_LEVELS.find(l => l.value === level) || AUTHORIZATION_LEVELS[0];
  };

  const getActiveAuthorizations = () => {
    return powerOfAttorneys.filter(poa => poa.status === 'active').length;
  };

  const getExpiringAuthorizations = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return powerOfAttorneys.filter(poa => 
      poa.expiration_date && 
      new Date(poa.expiration_date) <= thirtyDaysFromNow &&
      poa.status === 'active'
    ).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading Power of Attorney data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Financial Power of Attorney
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-3xl mx-auto mb-8">
            Manage authorized representatives for your financial and healthcare decisions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active POAs</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{getActiveAuthorizations()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Trusted Contacts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{emergencyContacts.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Expiring Soon</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{getExpiringAuthorizations()}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Recent Activity</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{accessLog.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <History className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Alert */}
        {getExpiringAuthorizations() > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have {getExpiringAuthorizations()} Power of Attorney authorization(s) expiring within 30 days. 
              Please review and renew as needed.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="authorizations">Authorizations</TabsTrigger>
            <TabsTrigger value="contacts">Trusted Contacts</TabsTrigger>
            <TabsTrigger value="access">Access Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Authorizations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Active Authorizations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {powerOfAttorneys.filter(poa => poa.status === 'active').slice(0, 3).map((poa, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Shield className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{poa.attorney_name}</p>
                        <p className="text-xs text-slate-500">
                          {getAuthorizationLevel(poa.authorization_level).label}
                        </p>
                      </div>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  ))}
                  {powerOfAttorneys.filter(poa => poa.status === 'active').length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No active authorizations</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accessLog.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {accessLog.length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      <History className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Power Types Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Authorization Categories</CardTitle>
                <CardDescription>Different types of powers you can grant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {POWER_TYPES.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{category.category}</h4>
                      <ul className="space-y-1">
                        {category.powers.map((power, powerIndex) => (
                          <li key={powerIndex} className="text-sm text-slate-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            {power}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common Power of Attorney tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setIsPOADialogOpen(true)}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create POA</span>
                  </Button>
                  <Button
                    onClick={() => setIsContactDialogOpen(true)}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <Users className="w-6 h-6" />
                    <span>Add Contact</span>
                  </Button>
                  <Button
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <FileText className="w-6 h-6" />
                    <span>View Templates</span>
                  </Button>
                  <Button
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <Download className="w-6 h-6" />
                    <span>Export Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authorizations Tab */}
          <TabsContent value="authorizations" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search authorizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <Dialog open={isPOADialogOpen} onOpenChange={setIsPOADialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Authorization
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Power of Attorney</DialogTitle>
                    <DialogDescription>
                      Set up a new financial or healthcare power of attorney
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPOA} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Attorney-in-Fact Name</Label>
                        <Input
                          value={newPOA.attorney_name}
                          onChange={(e) => setNewPOA({...newPOA, attorney_name: e.target.value})}
                          placeholder="Full name of the person you're authorizing"
                          required
                        />
                      </div>
                      <div>
                        <Label>Authorization Level</Label>
                        <Select
                          value={newPOA.authorization_level}
                          onValueChange={(value) => setNewPOA({...newPOA, authorization_level: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AUTHORIZATION_LEVELS.map(level => (
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Effective Date</Label>
                        <Input
                          type="date"
                          value={newPOA.effective_date}
                          onChange={(e) => setNewPOA({...newPOA, effective_date: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label>Expiration Date (Optional)</Label>
                        <Input
                          type="date"
                          value={newPOA.expiration_date}
                          onChange={(e) => setNewPOA({...newPOA, expiration_date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Authorization Options</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newPOA.emergency_only}
                            onCheckedChange={(checked) => setNewPOA({...newPOA, emergency_only: checked})}
                          />
                          <Label>Emergency use only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newPOA.requires_incapacity}
                            onCheckedChange={(checked) => setNewPOA({...newPOA, requires_incapacity: checked})}
                          />
                          <Label>Requires incapacity determination</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newPOA.notification_required}
                            onCheckedChange={(checked) => setNewPOA({...newPOA, notification_required: checked})}
                          />
                          <Label>Require notification before use</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Specific Powers & Limitations</Label>
                      <Textarea
                        value={newPOA.limitations}
                        onChange={(e) => setNewPOA({...newPOA, limitations: e.target.value})}
                        placeholder="Specify any limitations or specific powers being granted..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Attorney Compensation</Label>
                        <Input
                          value={newPOA.attorney_compensation}
                          onChange={(e) => setNewPOA({...newPOA, attorney_compensation: e.target.value})}
                          placeholder="Compensation terms (if any)"
                        />
                      </div>
                      <div>
                        <Label>Backup Attorney</Label>
                        <Input
                          value={newPOA.backup_attorney}
                          onChange={(e) => setNewPOA({...newPOA, backup_attorney: e.target.value})}
                          placeholder="Name of alternate attorney-in-fact"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={newPOA.notes}
                        onChange={(e) => setNewPOA({...newPOA, notes: e.target.value})}
                        placeholder="Any additional notes or special instructions..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Create Authorization</Button>
                      <Button type="button" variant="outline" onClick={() => setIsPOADialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Authorizations List */}
            <div className="space-y-4">
              {powerOfAttorneys
                .filter(poa => poa.attorney_name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((poa, index) => {
                  const statusConfig = getStatusBadge(poa.status);
                  const levelConfig = getAuthorizationLevel(poa.authorization_level);
                  
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${levelConfig.color}`}>
                              <levelConfig.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{poa.attorney_name}</h3>
                              <p className="text-sm text-slate-500">{levelConfig.label}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Effective: {new Date(poa.effective_date).toLocaleDateString()}</span>
                          </div>
                          {poa.expiration_date && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Expires: {new Date(poa.expiration_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {poa.emergency_only && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>Emergency Only</span>
                            </div>
                          )}
                          {poa.requires_incapacity && (
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-500" />
                              <span>Durable</span>
                            </div>
                          )}
                        </div>
                        
                        {poa.limitations && (
                          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                            <h4 className="font-medium text-sm mb-1">Powers & Limitations:</h4>
                            <p className="text-sm text-slate-600">{poa.limitations}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {poa.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedPOA(poa);
                                setIsRevokeDialogOpen(true);
                              }}
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          {/* Trusted Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Trusted Contacts</h2>
              <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Trusted Contact</DialogTitle>
                    <DialogDescription>
                      Add someone who can be authorized to act on your behalf
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddContact} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          placeholder="Contact's full name"
                          required
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Select
                          value={newContact.relationship}
                          onValueChange={(value) => setNewContact({...newContact, relationship: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Attorney', 'Accountant', 'Other'].map(rel => (
                              <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          placeholder="Primary phone number"
                          required
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea
                        value={newContact.address}
                        onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                        placeholder="Full address"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Contact Options</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newContact.can_be_attorney}
                            onCheckedChange={(checked) => setNewContact({...newContact, can_be_attorney: checked})}
                          />
                          <Label>Can serve as attorney-in-fact</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newContact.emergency_contact}
                            onCheckedChange={(checked) => setNewContact({...newContact, emergency_contact: checked})}
                          />
                          <Label>Emergency contact</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newContact.verified}
                            onCheckedChange={(checked) => setNewContact({...newContact, verified: checked})}
                          />
                          <Label>Identity verified</Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={newContact.notes}
                        onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                        placeholder="Additional notes about this contact"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Add Contact</Button>
                      <Button type="button" variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Contacts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emergencyContacts.map((contact, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                          <p className="text-sm text-slate-500">{contact.relationship}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {contact.verified && (
                          <Badge className="bg-green-500">Verified</Badge>
                        )}
                        {contact.can_be_attorney && (
                          <Badge variant="outline">Attorney-eligible</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{contact.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {contact.notes && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">{contact.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Access Log Tab */}
          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Authorization Access Log
                </CardTitle>
                <CardDescription>
                  Track when and how your Power of Attorney authorizations are used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessLog.map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{log.action}</h4>
                          <span className="text-sm text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{log.details}</p>
                        {log.attorney_name && (
                          <p className="text-xs text-slate-500">By: {log.attorney_name}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={
                        log.success ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'
                      }>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                  {accessLog.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <History className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                      <p>Authorization access will be logged here when they occur.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Authorization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notification Alerts</h4>
                      <p className="text-sm text-slate-500">Get notified when authorizations are used</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Multi-Factor Authentication</h4>
                      <p className="text-sm text-slate-500">Require additional verification for attorney access</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Automatic Expiration Reminders</h4>
                      <p className="text-sm text-slate-500">Remind me before authorizations expire</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Emergency Access Override</h4>
                      <p className="text-sm text-slate-500">Allow emergency access with additional verification</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Generate Emergency Access Codes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Security Backup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Legal Documents
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Revoke All Authorizations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Revoke POA Dialog */}
        <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Revoke Power of Attorney
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke this authorization? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedPOA && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium">{selectedPOA.attorney_name}</h4>
                <p className="text-sm text-slate-600">
                  {getAuthorizationLevel(selectedPOA.authorization_level).label}
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={() => selectedPOA && handleRevokePOA(selectedPOA.id)}
                className="flex-1"
              >
                Revoke Authorization
              </Button>
              <Button variant="outline" onClick={() => setIsRevokeDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}