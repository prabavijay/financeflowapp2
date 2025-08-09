import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Scan, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  DollarSign,
  Calendar,
  Building,
  Receipt,
  Trash2,
  Edit,
  Save,
  X,
  Download,
  Plus,
  Search,
  Filter
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
import { ocrProcessor, validateReceiptData } from '@/utils/ocrProcessor';

const PROCESSING_STATUS = {
  pending: { label: 'Pending', color: 'bg-gray-500', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500', icon: Scan },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: AlertCircle },
  manual_review: { label: 'Needs Review', color: 'bg-yellow-500', icon: Eye }
};

const EXPENSE_CATEGORIES = [
  'food', 'transportation', 'shopping', 'entertainment', 'healthcare', 
  'utilities', 'gas', 'groceries', 'restaurants', 'other'
];

export default function ReceiptScanner() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isEditingReceipt, setIsEditingReceipt] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    merchant_name: '',
    total_amount: '',
    tax_amount: '',
    tip_amount: '',
    transaction_date: '',
    category: '',
    receipt_number: '',
    notes: ''
  });

  useEffect(() => {
    loadReceipts();
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since backend may not be ready
      const mockReceipts = [
        {
          id: '1',
          merchant_name: 'Starbucks',
          total_amount: 15.47,
          tax_amount: 1.24,
          tip_amount: 2.00,
          transaction_date: '2024-01-15',
          category: 'food',
          processing_status: 'completed',
          ocr_confidence: 0.92,
          receipt_number: 'ST123456',
          manual_verified: true,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          merchant_name: 'Shell Gas Station',
          total_amount: 45.80,
          tax_amount: 0.00,
          transaction_date: '2024-01-14',
          category: 'transportation',
          processing_status: 'manual_review',
          ocr_confidence: 0.65,
          receipt_number: null,
          manual_verified: false,
          created_at: '2024-01-14T16:45:00Z'
        }
      ];

      try {
        const receiptsResult = await apiClient.get('/api/receipts');
        setReceipts(receiptsResult.data || receiptsResult || mockReceipts);
      } catch (error) {
        console.warn('Receipts API not available, using mock data');
        setReceipts(mockReceipts);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      toast.error('Failed to load receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      await processReceiptFile(file);
    }
  };

  const processReceiptFile = async (file) => {
    try {
      setProcessing(true);
      setUploadProgress(0);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadProgress(20);
      toast.info('Processing receipt image...');

      // Process with OCR
      const ocrResult = await ocrProcessor.processReceipt(file);
      setUploadProgress(60);

      if (!ocrResult.success) {
        throw new Error(ocrResult.error || 'OCR processing failed');
      }

      // Validate extracted data
      const validation = validateReceiptData(ocrResult.extractedData);
      setUploadProgress(80);

      // Create receipt record
      const receiptData = {
        merchant_name: ocrResult.extractedData.merchantName || 'Unknown Merchant',
        total_amount: ocrResult.extractedData.totalAmount || 0,
        tax_amount: ocrResult.extractedData.taxAmount || 0,
        tip_amount: ocrResult.extractedData.tipAmount || 0,
        transaction_date: ocrResult.extractedData.transactionDate || new Date().toISOString().split('T')[0],
        category: ocrResult.extractedData.category || 'other',
        receipt_number: ocrResult.extractedData.receiptNumber,
        ocr_confidence: ocrResult.confidence,
        ocr_text: ocrResult.rawText,
        processing_status: validation.requiresReview ? 'manual_review' : 'completed',
        manual_verified: false,
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };

      // Save to backend (mock for now)
      try {
        await apiClient.post('/api/receipts', receiptData);
      } catch (error) {
        console.warn('Backend not available, adding to local state');
        // Add to local state with generated ID
        const newReceipt = {
          ...receiptData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        };
        setReceipts(prev => [newReceipt, ...prev]);
      }

      setUploadProgress(100);
      
      if (validation.issues.length > 0) {
        toast.warning(`Receipt processed with issues: ${validation.issues.join(', ')}`);
      } else {
        toast.success('Receipt processed successfully!');
      }

      // Reload receipts from backend
      setTimeout(() => {
        loadReceipts();
      }, 1000);

    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error(`Failed to process receipt: ${error.message}`);
    } finally {
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const startCamera = async () => {
    try {
      // Enhanced camera constraints for mobile optimization
      const constraints = {
        video: {
          facingMode: { exact: 'environment' }, // Prefer back camera
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 16/9 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      };

      // Try with strict constraints first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (strictError) {
        console.warn('Strict camera constraints failed, trying fallback:', strictError);
        // Fallback to less strict constraints
        const fallbackConstraints = {
          video: {
            facingMode: 'environment', // Less strict preference
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions and ensure you\'re using HTTPS.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Get actual video dimensions
    const videoWidth = video.videoWidth || video.clientWidth;
    const videoHeight = video.videoHeight || video.clientHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Apply image enhancement for better OCR
    context.filter = 'contrast(1.2) brightness(1.1)';
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Reset filter for future use
    context.filter = 'none';

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to capture image');
        return;
      }

      const file = new File([blob], `receipt-${Date.now()}.jpg`, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      setCapturedImage(URL.createObjectURL(blob));
      
      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      
      // Close dialog and process the captured image
      setIsScanDialogOpen(false);
      
      // Add a small delay to ensure UI updates
      setTimeout(async () => {
        await processReceiptFile(file);
      }, 100);
      
    }, 'image/jpeg', 0.85); // Slightly higher quality for better OCR
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleEditReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setEditForm({
      merchant_name: receipt.merchant_name || '',
      total_amount: receipt.total_amount || '',
      tax_amount: receipt.tax_amount || '',
      tip_amount: receipt.tip_amount || '',
      transaction_date: receipt.transaction_date || '',
      category: receipt.category || '',
      receipt_number: receipt.receipt_number || '',
      notes: receipt.notes || ''
    });
    setIsEditingReceipt(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedData = {
        ...editForm,
        total_amount: parseFloat(editForm.total_amount) || 0,
        tax_amount: parseFloat(editForm.tax_amount) || 0,
        tip_amount: parseFloat(editForm.tip_amount) || 0,
        manual_verified: true
      };

      // Update backend (mock for now)
      try {
        await apiClient.put(`/api/receipts/${selectedReceipt.id}`, updatedData);
      } catch (error) {
        console.warn('Backend not available, updating local state');
        setReceipts(prev => prev.map(r => 
          r.id === selectedReceipt.id ? { ...r, ...updatedData } : r
        ));
      }

      toast.success('Receipt updated successfully');
      setIsEditingReceipt(false);
      setSelectedReceipt(null);
      loadReceipts();
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast.error('Failed to update receipt');
    }
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;

    try {
      await apiClient.delete(`/api/receipts/${receiptId}`);
      toast.success('Receipt deleted successfully');
      loadReceipts();
    } catch (error) {
      console.warn('Backend not available, removing from local state');
      setReceipts(prev => prev.filter(r => r.id !== receiptId));
      toast.success('Receipt deleted');
    }
  };

  const handleConvertToExpense = async (receipt) => {
    try {
      const expenseData = {
        description: `${receipt.merchant_name} - Receipt`,
        amount: receipt.total_amount,
        category: receipt.category,
        date: receipt.transaction_date,
        payment_method: 'unknown',
        receipt_id: receipt.id,
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };

      await apiClient.convertReceiptToExpense(receipt.id, expenseData);
      toast.success('Receipt converted to expense successfully');
    } catch (error) {
      console.error('Error converting to expense:', error);
      try {
        // Fallback to creating expense directly
        await apiClient.createExpense(expenseData);
        toast.success('Receipt converted to expense successfully');
      } catch (fallbackError) {
        console.error('Fallback expense creation failed:', fallbackError);
        toast.error('Failed to convert receipt to expense');
      }
    }
  };

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.processing_status === statusFilter;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const receiptDate = new Date(receipt.transaction_date);
      const today = new Date();
      const daysAgo = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const cutoffDate = new Date(today.setDate(today.getDate() - daysAgo));
      matchesDate = receiptDate >= cutoffDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate analytics
  const analytics = {
    totalReceipts: receipts.length,
    processedReceipts: receipts.filter(r => r.processing_status === 'completed').length,
    needsReview: receipts.filter(r => r.processing_status === 'manual_review').length,
    totalAmount: receipts
      .filter(r => r.processing_status === 'completed')
      .reduce((sum, r) => sum + (r.total_amount || 0), 0),
    averageConfidence: receipts.length > 0 
      ? receipts.reduce((sum, r) => sum + (r.ocr_confidence || 0), 0) / receipts.length 
      : 0
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receipt Scanner</h1>
          <p className="text-gray-600">Scan and digitize receipts with OCR technology</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCamera}>
                <Camera className="h-4 w-4 mr-2" />
                Scan Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Scan Receipt with Camera</DialogTitle>
                <DialogDescription>
                  Position the receipt in the camera view and tap Capture. Use good lighting for best results.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-80 sm:h-96 object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror for front-facing camera
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Camera overlay guide */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-white/50 border-dashed rounded-lg flex items-center justify-center">
                      <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
                        Position receipt here
                      </div>
                    </div>
                  </div>
                  
                  {/* Camera status */}
                  {!cameraStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/75">
                      <div className="text-white text-center">
                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Starting camera...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      stopCamera();
                      setIsScanDialogOpen(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Switch camera if possible
                        stopCamera();
                        setTimeout(startCamera, 100);
                      }}
                      disabled={!cameraStream}
                      size="sm"
                    >
                      🔄 Switch
                    </Button>
                    
                    <Button 
                      onClick={capturePhoto} 
                      disabled={!cameraStream}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Receipt
                    </Button>
                  </div>
                </div>
                
                {/* Tips */}
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <strong>Tips for best results:</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Ensure good lighting</li>
                    <li>• Keep receipt flat and fully visible</li>
                    <li>• Avoid shadows and glare</li>
                    <li>• Hold camera steady</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Receipt
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Processing Progress */}
      {processing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing receipt...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReceipts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.processedReceipts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.needsReview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Scan className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageConfidence * 100)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(PROCESSING_STATUS).map(([key, status]) => (
                  <SelectItem key={key} value={key}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReceipts.map((receipt) => {
          const status = PROCESSING_STATUS[receipt.processing_status];
          const StatusIcon = status.icon;
          
          return (
            <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{receipt.merchant_name}</CardTitle>
                    <CardDescription>
                      {new Date(receipt.transaction_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${status.color} text-white`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${receipt.total_amount.toFixed(2)}</span>
                  <div className="text-sm text-gray-600">
                    Confidence: {Math.round((receipt.ocr_confidence || 0) * 100)}%
                  </div>
                </div>
                
                {receipt.tax_amount > 0 && (
                  <div className="text-sm text-gray-600">
                    Tax: ${receipt.tax_amount.toFixed(2)}
                  </div>
                )}
                
                {receipt.receipt_number && (
                  <div className="text-sm text-gray-600">
                    Receipt #: {receipt.receipt_number}
                  </div>
                )}
                
                <div className="text-sm">
                  <Badge variant="outline" className="capitalize">
                    {receipt.category}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditReceipt(receipt)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConvertToExpense(receipt)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    To Expense
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteReceipt(receipt.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReceipts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
            <p className="text-gray-600 mb-4">Start by scanning or uploading your first receipt.</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Receipt
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Receipt Dialog */}
      <Dialog open={isEditingReceipt} onOpenChange={setIsEditingReceipt}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
            <DialogDescription>
              Review and correct the extracted receipt information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchant_name">Merchant Name</Label>
                <Input
                  id="merchant_name"
                  value={editForm.merchant_name}
                  onChange={(e) => setEditForm({...editForm, merchant_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={editForm.total_amount}
                  onChange={(e) => setEditForm({...editForm, total_amount: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  value={editForm.tax_amount}
                  onChange={(e) => setEditForm({...editForm, tax_amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tip_amount">Tip Amount</Label>
                <Input
                  id="tip_amount"
                  type="number"
                  step="0.01"
                  value={editForm.tip_amount}
                  onChange={(e) => setEditForm({...editForm, tip_amount: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Date</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={editForm.transaction_date}
                  onChange={(e) => setEditForm({...editForm, transaction_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm({...editForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_number">Receipt Number</Label>
              <Input
                id="receipt_number"
                value={editForm.receipt_number}
                onChange={(e) => setEditForm({...editForm, receipt_number: e.target.value})}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingReceipt(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}