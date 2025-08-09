import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Users, 
  Shield, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Heart,
  Building,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Scale,
  Gavel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import apiClient from '@/api/client';

const DOCUMENT_TYPES = [
  { value: 'will', label: 'Last Will & Testament', icon: FileText, color: 'bg-blue-500' },
  { value: 'trust', label: 'Living Trust', icon: Shield, color: 'bg-green-500' },
  { value: 'power_of_attorney', label: 'Power of Attorney', icon: Scale, color: 'bg-purple-500' },
  { value: 'healthcare_directive', label: 'Healthcare Directive', icon: Heart, color: 'bg-red-500' },
  { value: 'beneficiary_forms', label: 'Beneficiary Forms', icon: Users, color: 'bg-orange-500' },
  { value: 'other', label: 'Other Legal Document', icon: Gavel, color: 'bg-gray-500' }
];

const RELATIONSHIP_TYPES = [
  'Spouse', 'Child', 'Parent', 'Sibling', 'Grandchild', 'Friend', 'Charity', 'Trust', 'Other'
];

const ASSET_TYPES = [
  'Real Estate', 'Bank Accounts', 'Investment Accounts', 'Life Insurance', 'Business Interest', 
  'Personal Property', 'Vehicles', 'Collectibles', 'Digital Assets', 'Other'
];

export default function EstatePlanning() {
  const [estateDocuments, setEstateDocuments] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [assets, setAssets] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isEmergencyContactDialogOpen, setIsEmergencyContactDialogOpen] = useState(false);
  const [isWillWizardOpen, setIsWillWizardOpen] = useState(false);
  
  // Form states
  const [newDocument, setNewDocument] = useState({
    document_type: 'will',
    title: '',
    status: 'draft',
    last_updated: new Date().toISOString().split('T')[0],
    legal_review_date: '',
    attorney_name: '',
    attorney_contact: '',
    notes: ''
  });
  
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    relationship: 'Spouse',
    percentage: '',
    contact_info: {
      email: '',
      phone: '',
      address: ''
    },
    contingent: false,
    notes: ''
  });
  
  const [newEmergencyContact, setNewEmergencyContact] = useState({
    name: '',
    relationship: 'Spouse',
    phone: '',
    email: '',
    address: '',
    is_primary: false,
    notes: ''
  });

  useEffect(() => {
    loadEstateData();
  }, []);

  const loadEstateData = async () => {
    try {
      setLoading(true);
      const [documentsRes, beneficiariesRes, assetsRes, contactsRes] = await Promise.all([
        apiClient.get('/estate-documents'),
        apiClient.get('/beneficiaries'),
        apiClient.get('/assets'), // Reuse existing assets
        apiClient.get('/emergency-contacts')
      ]);
      
      setEstateDocuments(documentsRes.data || []);
      setBeneficiaries(beneficiariesRes.data || []);
      setAssets(assetsRes.data || []);
      setEmergencyContacts(contactsRes.data || []);
    } catch (error) {
      console.error('Error loading estate data:', error);
      toast.error('Failed to load estate planning data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/estate-documents', newDocument);
      if (response.success) {
        setEstateDocuments([...estateDocuments, response.data]);
        setNewDocument({
          document_type: 'will',
          title: '',
          status: 'draft',
          last_updated: new Date().toISOString().split('T')[0],
          legal_review_date: '',
          attorney_name: '',
          attorney_contact: '',
          notes: ''
        });
        setIsDocumentDialogOpen(false);
        toast.success('Estate document added successfully');
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add estate document');
    }
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/beneficiaries', newBeneficiary);
      if (response.success) {
        setBeneficiaries([...beneficiaries, response.data]);
        setNewBeneficiary({
          name: '',
          relationship: 'Spouse',
          percentage: '',
          contact_info: { email: '', phone: '', address: '' },
          contingent: false,
          notes: ''
        });
        setIsBeneficiaryDialogOpen(false);
        toast.success('Beneficiary added successfully');
      }
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      toast.error('Failed to add beneficiary');
    }
  };

  const handleAddEmergencyContact = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/emergency-contacts', newEmergencyContact);
      if (response.success) {
        setEmergencyContacts([...emergencyContacts, response.data]);
        setNewEmergencyContact({
          name: '',
          relationship: 'Spouse',
          phone: '',
          email: '',
          address: '',
          is_primary: false,
          notes: ''
        });
        setIsEmergencyContactDialogOpen(false);
        toast.success('Emergency contact added successfully');
      }
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast.error('Failed to add emergency contact');
    }
  };

  const calculateEstateValue = () => {
    return assets.reduce((total, asset) => total + (asset.current_value || 0), 0);
  };

  const getCompletionPercentage = () => {
    const totalItems = 8; // Will, Trust, Healthcare Directive, POA, Beneficiaries, Emergency Contacts, Asset Inventory, Legal Review
    let completedItems = 0;
    
    if (estateDocuments.some(doc => doc.document_type === 'will' && doc.status === 'executed')) completedItems++;
    if (estateDocuments.some(doc => doc.document_type === 'healthcare_directive')) completedItems++;
    if (estateDocuments.some(doc => doc.document_type === 'power_of_attorney')) completedItems++;
    if (beneficiaries.length > 0) completedItems++;
    if (emergencyContacts.length > 0) completedItems++;
    if (assets.length > 0) completedItems++;
    if (estateDocuments.some(doc => doc.legal_review_date)) completedItems++;
    if (estateDocuments.some(doc => doc.attorney_name)) completedItems++;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  const getDocumentIcon = (type) => {
    const docType = DOCUMENT_TYPES.find(d => d.value === type);
    return docType ? docType.icon : FileText;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-500', label: 'Draft' },
      review: { color: 'bg-blue-500', label: 'Under Review' },
      executed: { color: 'bg-green-500', label: 'Executed' },
      expired: { color: 'bg-red-500', label: 'Needs Update' }
    };
    return statusConfig[status] || statusConfig.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading estate planning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Estate Planning
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-3xl mx-auto mb-8">
            Secure your family's future with comprehensive estate planning and document management
          </p>
          
          {/* Progress Overview */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Estate Planning Progress</span>
              <span>{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-3" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Estate Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${calculateEstateValue().toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Documents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{estateDocuments.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Beneficiaries</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{beneficiaries.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Completion</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{getCompletionPercentage()}%</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estate Planning Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Estate Planning Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { task: 'Create Last Will & Testament', completed: estateDocuments.some(d => d.document_type === 'will') },
                    { task: 'Designate Healthcare Directive', completed: estateDocuments.some(d => d.document_type === 'healthcare_directive') },
                    { task: 'Establish Power of Attorney', completed: estateDocuments.some(d => d.document_type === 'power_of_attorney') },
                    { task: 'Name Beneficiaries', completed: beneficiaries.length > 0 },
                    { task: 'Update Emergency Contacts', completed: emergencyContacts.length > 0 },
                    { task: 'Inventory Assets', completed: assets.length > 0 },
                    { task: 'Legal Review', completed: estateDocuments.some(d => d.legal_review_date) },
                    { task: 'Annual Review Schedule', completed: estateDocuments.some(d => d.attorney_name) }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                      <span className={item.completed ? 'text-slate-700' : 'text-slate-500'}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {estateDocuments.slice(0, 5).map((doc, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        {React.createElement(getDocumentIcon(doc.document_type), { className: "w-4 h-4 text-blue-500" })}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-slate-500">Updated {new Date(doc.last_updated).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getStatusBadge(doc.status).color}>
                          {getStatusBadge(doc.status).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with essential estate planning documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setIsWillWizardOpen(true)}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Create Will</span>
                  </Button>
                  <Button
                    onClick={() => setIsBeneficiaryDialogOpen(true)}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <Users className="w-6 h-6" />
                    <span>Add Beneficiary</span>
                  </Button>
                  <Button
                    onClick={() => setIsEmergencyContactDialogOpen(true)}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <Phone className="w-6 h-6" />
                    <span>Emergency Contact</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Estate Document</DialogTitle>
                    <DialogDescription>
                      Add a new estate planning document to your collection
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddDocument} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Document Type</Label>
                        <Select
                          value={newDocument.document_type}
                          onValueChange={(value) => setNewDocument({...newDocument, document_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DOCUMENT_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={newDocument.status}
                          onValueChange={(value) => setNewDocument({...newDocument, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="review">Under Review</SelectItem>
                            <SelectItem value="executed">Executed</SelectItem>
                            <SelectItem value="expired">Needs Update</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Document Title</Label>
                      <Input
                        value={newDocument.title}
                        onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                        placeholder="e.g., Last Will and Testament - 2024"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Attorney Name</Label>
                        <Input
                          value={newDocument.attorney_name}
                          onChange={(e) => setNewDocument({...newDocument, attorney_name: e.target.value})}
                          placeholder="Attorney or law firm name"
                        />
                      </div>
                      <div>
                        <Label>Legal Review Date</Label>
                        <Input
                          type="date"
                          value={newDocument.legal_review_date}
                          onChange={(e) => setNewDocument({...newDocument, legal_review_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Attorney Contact</Label>
                      <Input
                        value={newDocument.attorney_contact}
                        onChange={(e) => setNewDocument({...newDocument, attorney_contact: e.target.value})}
                        placeholder="Phone number or email"
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={newDocument.notes}
                        onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                        placeholder="Additional notes about this document"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Add Document</Button>
                      <Button type="button" variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estateDocuments
                .filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((doc, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {React.createElement(getDocumentIcon(doc.document_type), { 
                          className: "w-8 h-8 text-blue-500" 
                        })}
                        <div>
                          <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                          <p className="text-sm text-slate-500">
                            {DOCUMENT_TYPES.find(d => d.value === doc.document_type)?.label}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(doc.status).color}>
                        {getStatusBadge(doc.status).label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Updated: {new Date(doc.last_updated).toLocaleDateString()}</span>
                      </div>
                      {doc.attorney_name && (
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4" />
                          <span>{doc.attorney_name}</span>
                        </div>
                      )}
                      {doc.legal_review_date && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Reviewed: {new Date(doc.legal_review_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {doc.notes && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">{doc.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Beneficiaries Tab */}
          <TabsContent value="beneficiaries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Beneficiaries</h2>
              <Dialog open={isBeneficiaryDialogOpen} onOpenChange={setIsBeneficiaryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Beneficiary
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Beneficiary</DialogTitle>
                    <DialogDescription>
                      Add a new beneficiary to your estate plan
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddBeneficiary} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={newBeneficiary.name}
                          onChange={(e) => setNewBeneficiary({...newBeneficiary, name: e.target.value})}
                          placeholder="Beneficiary's full name"
                          required
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Select
                          value={newBeneficiary.relationship}
                          onValueChange={(value) => setNewBeneficiary({...newBeneficiary, relationship: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_TYPES.map(rel => (
                              <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Inheritance Percentage</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newBeneficiary.percentage}
                        onChange={(e) => setNewBeneficiary({...newBeneficiary, percentage: e.target.value})}
                        placeholder="Percentage of estate"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Contact Information</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newBeneficiary.contact_info.email}
                            onChange={(e) => setNewBeneficiary({
                              ...newBeneficiary,
                              contact_info: {...newBeneficiary.contact_info, email: e.target.value}
                            })}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={newBeneficiary.contact_info.phone}
                            onChange={(e) => setNewBeneficiary({
                              ...newBeneficiary,
                              contact_info: {...newBeneficiary.contact_info, phone: e.target.value}
                            })}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={newBeneficiary.contact_info.address}
                          onChange={(e) => setNewBeneficiary({
                            ...newBeneficiary,
                            contact_info: {...newBeneficiary.contact_info, address: e.target.value}
                          })}
                          placeholder="Full address"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={newBeneficiary.notes}
                        onChange={(e) => setNewBeneficiary({...newBeneficiary, notes: e.target.value})}
                        placeholder="Additional notes about this beneficiary"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Add Beneficiary</Button>
                      <Button type="button" variant="outline" onClick={() => setIsBeneficiaryDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Beneficiaries List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beneficiaries.map((beneficiary, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-purple-500" />
                        <div>
                          <h3 className="font-semibold text-slate-900">{beneficiary.name}</h3>
                          <p className="text-sm text-slate-500">{beneficiary.relationship}</p>
                        </div>
                      </div>
                      {beneficiary.percentage && (
                        <Badge variant="outline">{beneficiary.percentage}%</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600">
                      {beneficiary.contact_info?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{beneficiary.contact_info.email}</span>
                        </div>
                      )}
                      {beneficiary.contact_info?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{beneficiary.contact_info.phone}</span>
                        </div>
                      )}
                      {beneficiary.contact_info?.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{beneficiary.contact_info.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {beneficiary.notes && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">{beneficiary.notes}</p>
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

          {/* Emergency Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Emergency Contacts</h2>
              <Dialog open={isEmergencyContactDialogOpen} onOpenChange={setIsEmergencyContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Emergency Contact</DialogTitle>
                    <DialogDescription>
                      Add someone who should be contacted in case of emergency
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddEmergencyContact} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={newEmergencyContact.name}
                          onChange={(e) => setNewEmergencyContact({...newEmergencyContact, name: e.target.value})}
                          placeholder="Contact's full name"
                          required
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Select
                          value={newEmergencyContact.relationship}
                          onValueChange={(value) => setNewEmergencyContact({...newEmergencyContact, relationship: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_TYPES.map(rel => (
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
                          value={newEmergencyContact.phone}
                          onChange={(e) => setNewEmergencyContact({...newEmergencyContact, phone: e.target.value})}
                          placeholder="Primary phone number"
                          required
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newEmergencyContact.email}
                          onChange={(e) => setNewEmergencyContact({...newEmergencyContact, email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea
                        value={newEmergencyContact.address}
                        onChange={(e) => setNewEmergencyContact({...newEmergencyContact, address: e.target.value})}
                        placeholder="Full address"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={newEmergencyContact.notes}
                        onChange={(e) => setNewEmergencyContact({...newEmergencyContact, notes: e.target.value})}
                        placeholder="Additional notes about this contact"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Add Contact</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEmergencyContactDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Emergency Contacts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emergencyContacts.map((contact, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Phone className="w-8 h-8 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                          <p className="text-sm text-slate-500">{contact.relationship}</p>
                        </div>
                      </div>
                      {contact.is_primary && (
                        <Badge className="bg-green-500">Primary</Badge>
                      )}
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

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Legal Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Legal Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Will Templates</h4>
                      <p className="text-sm text-blue-700">Basic will templates for different situations</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">Healthcare Directives</h4>
                      <p className="text-sm text-green-700">Living will and healthcare proxy forms</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900">Power of Attorney</h4>
                      <p className="text-sm text-purple-700">Financial and healthcare POA documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Planning Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Planning Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-semibold">Inventory Your Assets</h4>
                        <p className="text-sm text-slate-600">List all your assets, debts, and accounts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-semibold">Choose Your Beneficiaries</h4>
                        <p className="text-sm text-slate-600">Decide who inherits what and in what proportions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-semibold">Draft Your Documents</h4>
                        <p className="text-sm text-slate-600">Create your will, directives, and POA documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-semibold">Legal Review</h4>
                        <p className="text-sm text-slate-600">Have an attorney review and execute documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">5</div>
                      <div>
                        <h4 className="font-semibold">Annual Review</h4>
                        <p className="text-sm text-slate-600">Update documents yearly or after major life events</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Important Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Important Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Legal Requirements Vary</h4>
                      <p className="text-sm text-yellow-800">Estate planning laws differ by state. Consult with a local attorney for compliance.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Regular Updates</h4>
                      <p className="text-sm text-blue-800">Review and update your estate plan annually or after major life events like marriage, divorce, or births.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Document Storage</h4>
                      <p className="text-sm text-green-800">Keep original documents in a safe place and provide copies to your attorney and executor.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}