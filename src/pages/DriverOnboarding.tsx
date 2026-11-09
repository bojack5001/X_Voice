import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  PhoneCall, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Eye, 
  Download, 
  Clock, 
  ShieldCheck, 
  Car,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Driver, DriverStatus, LanguageCode, VehicleType } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CallSimulationDialog } from '../components/calls/CallSimulationDialog';
import { DemoBadge } from '../components/common/DemoBadge';

export const DriverOnboarding: React.FC = () => {
  const { drivers, addDriver, updateDriver } = useData();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Driver>('joinedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected driver for details modal
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Call simulation modal
  const [callModalData, setCallModalData] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
    language: LanguageCode;
  }>({
    isOpen: false,
    name: '',
    phone: '',
    language: 'Tamil'
  });

  // Add Driver Modal
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Chennai',
    vehicleType: 'Auto' as VehicleType,
    vehicleNumber: '',
    preferredLanguage: 'Tamil' as LanguageCode,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter & Search Logic
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchesSearch = 
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
      const matchesCity = cityFilter === 'all' || driver.city === cityFilter;
      const matchesVehicle = vehicleFilter === 'all' || driver.vehicleType === vehicleFilter;

      return matchesSearch && matchesStatus && matchesCity && matchesVehicle;
    }).sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [drivers, searchTerm, statusFilter, cityFilter, vehicleFilter, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(filteredDrivers.length / pageSize) || 1;
  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case 'onboarded':
        return <Badge variant="green">Active Onboarded</Badge>;
      case 'training':
        return <Badge variant="blue">Safety Training</Badge>;
      case 'verification':
        return <Badge variant="purple">KYC Review</Badge>;
      case 'docs_pending':
        return <Badge variant="amber">Docs Pending</Badge>;
      case 'contacted':
        return <Badge variant="orange">Contacted</Badge>;
      case 'lead':
        return <Badge variant="slate">New Lead</Badge>;
      case 'rejected':
        return <Badge variant="red">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStartCall = (driver: Driver, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCallModalData({
      isOpen: true,
      name: driver.name,
      phone: driver.phone,
      language: driver.preferredLanguage
    });
  };

  const handleValidateAndSubmitDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newDriverData.name.trim()) errors.name = 'Driver name is required';
    if (!newDriverData.phone.trim() || newDriverData.phone.length < 10) errors.phone = 'Valid 10+ digit phone is required';
    if (!newDriverData.city) errors.city = 'Operating city is required';
    if (!newDriverData.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle registration number required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addDriver({
      name: newDriverData.name,
      phone: newDriverData.phone,
      email: newDriverData.email || `${newDriverData.name.toLowerCase().replace(/\s+/g, '')}@xpool.in`,
      city: newDriverData.city,
      vehicleType: newDriverData.vehicleType,
      vehicleNumber: newDriverData.vehicleNumber.toUpperCase(),
      status: 'lead',
      preferredLanguage: newDriverData.preferredLanguage,
      aiCallAttempts: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      complianceScore: 25,
      documents: [
        { type: 'Aadhaar', number: 'Pending', status: 'Missing' },
        { type: 'Driving License', number: 'Pending', status: 'Missing' },
        { type: 'RC Book', number: newDriverData.vehicleNumber.toUpperCase(), status: 'Missing' },
        { type: 'Vehicle Insurance', number: 'Pending', status: 'Missing' }
      ],
      notes: newDriverData.notes || 'Manually added driver profile.'
    });

    setIsAddDriverOpen(false);
    setNewDriverData({
      name: '',
      phone: '',
      email: '',
      city: 'Chennai',
      vehicleType: 'Auto',
      vehicleNumber: '',
      preferredLanguage: 'Tamil',
      notes: ''
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Driver Onboarding Funnel
            </h1>
            <DemoBadge label="SIMULATED TELEPHONY & OCR" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage partner drivers, inspect KYC statutory documents, and trigger autonomous AI qualification calls
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddDriverOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow-brand flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, RC number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Funnel Statuses</option>
              <option value="lead">New Lead</option>
              <option value="contacted">Contacted</option>
              <option value="docs_pending">Docs Pending</option>
              <option value="verification">Verification</option>
              <option value="training">Training</option>
              <option value="onboarded">Onboarded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Cities</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Madurai">Madurai</option>
            </select>
          </div>

          {/* Vehicle Filter */}
          <div>
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Vehicle Types</option>
              <option value="Auto">Auto Rickshaw</option>
              <option value="EV Auto">EV Auto</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">Hatchback</option>
              <option value="SUV">SUV</option>
              <option value="Bike">Bike Taxi</option>
            </select>
          </div>
        </div>

        {/* Active Filter Counter & Quick Clear */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong className="text-slate-800">{filteredDrivers.length}</strong> matching driver records</span>
          {(statusFilter !== 'all' || cityFilter !== 'all' || vehicleFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setCityFilter('all');
                setVehicleFilter('all');
                setSearchTerm('');
              }}
              className="text-amber-700 hover:text-amber-800 font-semibold text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Driver Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                <th className="py-3 px-4">Driver Profile</th>
                <th className="py-3 px-4">City & Vehicle</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Funnel Status</th>
                <th className="py-3 px-4">KYC Compliance</th>
                <th className="py-3 px-4">AI Telephony</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Car className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No driver profiles match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedDrivers.map((driver) => {
                  const verifiedDocs = driver.documents.filter(d => d.status === 'Verified').length;
                  const totalDocs = driver.documents.length;

                  return (
                    <tr 
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className="hover:bg-amber-50/40 transition cursor-pointer group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-amber-700 transition">
                          {driver.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{driver.phone}</div>
                        <div className="text-[10px] text-slate-400">{driver.id}</div>
                      </td>

                      {/* City & Vehicle */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{driver.city}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Car className="w-3 h-3 text-slate-400" />
                          <span>{driver.vehicleType}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{driver.vehicleNumber}</span>
                      </td>

                      {/* Language */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          driver.preferredLanguage === 'Tamil' ? 'bg-amber-100 text-amber-900' :
                          driver.preferredLanguage === 'Telugu' ? 'bg-orange-100 text-orange-900' :
                          driver.preferredLanguage === 'Hindi' ? 'bg-purple-100 text-purple-900' :
                          'bg-blue-100 text-blue-900'
                        }`}>
                          {driver.preferredLanguage}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(driver.status)}
                      </td>

                      {/* Compliance Progress */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700">{driver.complianceScore}%</span>
                            <span className="text-slate-400 text-[10px]">{verifiedDocs}/{totalDocs} docs</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                driver.complianceScore >= 80 ? 'bg-emerald-500' :
                                driver.complianceScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${driver.complianceScore}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* AI Telephony status */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-medium text-slate-700">
                          {driver.lastCallOutcome ? driver.lastCallOutcome : 'Never Called'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{driver.lastContactedAt || 'Queued'}</span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Inspect Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleStartCall(driver, e)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                            title="Start AI Call Simulation"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Start AI Call</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Driver Profile Detail Modal */}
      {selectedDriver && (
        <Modal
          isOpen={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          title={`Driver Partner Profile • ${selectedDriver.name}`}
          subtitle={`ID: ${selectedDriver.id} • Registered on ${selectedDriver.joinedDate}`}
          maxWidth="3xl"
          footer={
            <>
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const d = selectedDriver;
                  setSelectedDriver(null);
                  handleStartCall(d);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow-brand flex items-center gap-1.5 transition active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Trigger AI Call</span>
              </button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Funnel State</span>
                <span className="mt-0.5 inline-block">{getStatusBadge(selectedDriver.status)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">City & Zone</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedDriver.city}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Preferred Dialect</span>
                <span className="font-bold text-amber-700 mt-0.5 block">{selectedDriver.preferredLanguage}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Compliance Index</span>
                <span className="font-bold text-emerald-600 mt-0.5 block">{selectedDriver.complianceScore}% Verified</span>
              </div>
            </div>

            {/* Vehicle & Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Car className="w-4 h-4 text-amber-500" />
                  Vehicle Registration Details
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Vehicle Type:</span>
                  <span className="font-semibold text-slate-800">{selectedDriver.vehicleType}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Plate Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDriver.vehicleNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Driver Rating:</span>
                  <span className="font-semibold text-amber-600">{selectedDriver.rating ? `★ ${selectedDriver.rating} / 5.0` : 'New Applicant'}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Contact & Telemetry
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedDriver.phone}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-700">{selectedDriver.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">AI Call Attempts:</span>
                  <span className="font-semibold text-slate-800">{selectedDriver.aiCallAttempts} attempts logged</span>
                </div>
              </div>
            </div>

            {/* KYC Documents Checklist */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Statutory KYC Documents Verification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDriver.documents.map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{doc.type}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{doc.number}</div>
                      {doc.notes && <div className="text-[10px] text-rose-600 mt-0.5 font-medium">{doc.notes}</div>}
                    </div>

                    <div>
                      {doc.status === 'Verified' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {doc.status === 'Pending Review' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Reviewing
                        </span>
                      )}
                      {doc.status === 'Missing' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Missing
                        </span>
                      )}
                      {doc.status === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-950">
              <span className="font-bold block mb-1 uppercase tracking-wide text-[10px] text-amber-900">
                Operations & AI Notes
              </span>
              <p>{selectedDriver.notes}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Add Driver Modal */}
      <Modal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        title="Register New Partner Driver"
        subtitle="Manually add lead record to XPOOL onboarding pipeline"
        maxWidth="lg"
      >
        <form onSubmit={handleValidateAndSubmitDriver} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Driver Name *</label>
            <input
              type="text"
              placeholder="e.g. Anandha Krishnan"
              value={newDriverData.name}
              onChange={(e) => setNewDriverData({ ...newDriverData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            {formErrors.name && <p className="text-rose-600 text-[11px] mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="+91 98400 00000"
                value={newDriverData.phone}
                onChange={(e) => setNewDriverData({ ...newDriverData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
              {formErrors.phone && <p className="text-rose-600 text-[11px] mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating City *</label>
              <select
                value={newDriverData.city}
                onChange={(e) => setNewDriverData({ ...newDriverData, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Chennai">Chennai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vehicle Type *</label>
              <select
                value={newDriverData.vehicleType}
                onChange={(e) => setNewDriverData({ ...newDriverData, vehicleType: e.target.value as VehicleType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Auto">Auto Rickshaw</option>
                <option value="EV Auto">EV Auto</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="SUV">SUV</option>
                <option value="Bike">Bike</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registration Plate *</label>
              <input
                type="text"
                placeholder="TN 01 AB 1234"
                value={newDriverData.vehicleNumber}
                onChange={(e) => setNewDriverData({ ...newDriverData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono uppercase"
              />
              {formErrors.vehicleNumber && <p className="text-rose-600 text-[11px] mt-1">{formErrors.vehicleNumber}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preferred Dialect</label>
            <select
              value={newDriverData.preferredLanguage}
              onChange={(e) => setNewDriverData({ ...newDriverData, preferredLanguage: e.target.value as LanguageCode })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Interested in airport queue permit"
              value={newDriverData.notes}
              onChange={(e) => setNewDriverData({ ...newDriverData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddDriverOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl shadow-brand hover:from-amber-600 hover:to-orange-600"
            >
              Save & Queue for AI Call
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Voice Call Simulation Modal */}
      <CallSimulationDialog
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData({ ...callModalData, isOpen: false })}
        targetName={callModalData.name}
        targetPhone={callModalData.phone}
        defaultLanguage={callModalData.language}
      />
    </div>
  );
};

