import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RefreshCw, 
  FileDown, 
  Sparkles,
  Database,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { LeadImportRow } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';

export const ExcelLeadImport: React.FC = () => {
  const { drivers, importLeads } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper state: 'upload' | 'mapping' | 'preview' | 'completed'
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview' | 'completed'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  
  // Raw parsed Excel headers and rows
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);

  // Column Mappings
  const [mappings, setMappings] = useState({
    name: '',
    phone: '',
    city: '',
    vehicleType: '',
    language: ''
  });

  // Validated rows
  const [parsedLeads, setParsedLeads] = useState<LeadImportRow[]>([]);
  const [importResult, setImportResult] = useState<{ addedCount: number; duplicateCount: number } | null>(null);

  // Generate and download a real .xlsx sample template
  const handleDownloadTemplate = () => {
    const templateData = [
      ['Driver_Name', 'Mobile_Number', 'City_Hub', 'Vehicle_Category', 'Preferred_Lang'],
      ['Karthik Shanmugam', '98401 11223', 'Chennai', 'Auto', 'Tamil'],
      ['Naveen Kumar G', '97011 55667', 'Hyderabad', 'Sedan', 'Telugu'],
      ['Rajeshwari Balan', '98840 88990', 'Coimbatore', 'EV Auto', 'Tamil'],
      ['Syed Imran Pasha', '99002 77881', 'Bengaluru', 'Hatchback', 'English'],
      ['Senthil Velan', '94431 44556', 'Madurai', 'Auto', 'Tamil']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Driver_Leads_Template');
    XLSX.writeFile(wb, 'XPOOL_Driver_Leads_Template.xlsx');
  };

  // Sample data generator for quick test
  const handleLoadSampleDataset = () => {
    const sampleHeaders = ['Driver_Name', 'Mobile_Number', 'City_Hub', 'Vehicle_Category', 'Preferred_Lang'];
    const sampleRows = [
      { 'Driver_Name': 'Karthik Shanmugam', 'Mobile_Number': '98401 11223', 'City_Hub': 'Chennai', 'Vehicle_Category': 'Auto', 'Preferred_Lang': 'Tamil' },
      { 'Driver_Name': 'Naveen Kumar G', 'Mobile_Number': '97011 55667', 'City_Hub': 'Hyderabad', 'Vehicle_Category': 'Sedan', 'Preferred_Lang': 'Telugu' },
      { 'Driver_Name': 'Muruganandham P', 'Mobile_Number': '97890 12399', 'City_Hub': 'Madurai', 'Vehicle_Category': 'Auto', 'Preferred_Lang': 'Tamil' }, // Duplicate of DRV-1003
      { 'Driver_Name': 'Rajeshwari Balan', 'Mobile_Number': '98840 88990', 'City_Hub': 'Coimbatore', 'Vehicle_Category': 'EV Auto', 'Preferred_Lang': 'Tamil' },
      { 'Driver_Name': 'Syed Imran Pasha', 'Mobile_Number': '99002 77881', 'City_Hub': 'Bengaluru', 'Vehicle_Category': 'Hatchback', 'Preferred_Lang': 'English' },
      { 'Driver_Name': 'Invalid Phone Lead', 'Mobile_Number': '1234', 'City_Hub': 'Chennai', 'Vehicle_Category': 'Bike', 'Preferred_Lang': 'Tamil' } // Invalid format
    ];

    setFileName('Chennai_Hyderabad_Driver_Leads_Batch_Nov.xlsx');
    setFileSize('14.2 KB');
    setExcelHeaders(sampleHeaders);
    setRawRows(sampleRows);

    setMappings({
      name: 'Driver_Name',
      phone: 'Mobile_Number',
      city: 'City_Hub',
      vehicleType: 'Vehicle_Category',
      language: 'Preferred_Lang'
    });

    setCurrentStep('mapping');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length > 0) {
          const headers = (data[0] as string[]).map(h => String(h || '').trim());
          setExcelHeaders(headers);

          // Rows
          const rows = XLSX.utils.sheet_to_json(ws);
          setRawRows(rows);

          // Auto map detection
          const autoMap = {
            name: headers.find(h => /name|driver/i.test(h)) || headers[0] || '',
            phone: headers.find(h => /phone|mobile|contact|cell/i.test(h)) || headers[1] || '',
            city: headers.find(h => /city|location|hub|zone/i.test(h)) || headers[2] || '',
            vehicleType: headers.find(h => /vehicle|type|model|category/i.test(h)) || headers[3] || '',
            language: headers.find(h => /lang|language|dialect/i.test(h)) || headers[4] || ''
          };
          setMappings(autoMap);

          setCurrentStep('mapping');
        }
      } catch (err) {
        alert('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleProceedToValidation = () => {
    // Cross check with existing drivers
    const existingPhones = new Set(drivers.map(d => d.phone.replace(/\D/g, '')));

    const validated: LeadImportRow[] = rawRows.map((row, index) => {
      const rawName = String(row[mappings.name] || '').trim();
      const rawPhone = String(row[mappings.phone] || '').trim();
      const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
      const rawCity = String(row[mappings.city] || 'Chennai').trim();
      const rawVehicle = String(row[mappings.vehicleType] || 'Auto').trim();
      const rawLang = String(row[mappings.language] || 'Tamil').trim();

      let status: 'valid' | 'invalid' | 'duplicate' = 'valid';
      let errorDetails = '';

      if (!rawPhone || cleanPhoneDigits.length < 10) {
        status = 'invalid';
        errorDetails = 'Invalid phone number format (must be 10+ digits)';
      } else if (existingPhones.has(cleanPhoneDigits)) {
        status = 'duplicate';
        errorDetails = 'Phone number already exists in CRM database';
      } else if (!rawName) {
        status = 'invalid';
        errorDetails = 'Missing driver name';
      }

      return {
        rowId: index + 1,
        name: rawName,
        phone: rawPhone,
        city: rawCity,
        vehicleType: rawVehicle,
        language: rawLang,
        status,
        errorDetails
      };
    });

    setParsedLeads(validated);
    setCurrentStep('preview');
  };

  const handleCommitImport = () => {
    const validLeads = parsedLeads.filter(r => r.status === 'valid');
    const result = importLeads(validLeads);
    setImportResult(result);
    setCurrentStep('completed');
  };

  const validCount = parsedLeads.filter(p => p.status === 'valid').length;
  const duplicateCount = parsedLeads.filter(p => p.status === 'duplicate').length;
  const invalidCount = parsedLeads.filter(p => p.status === 'invalid').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Excel Lead Ingest & Validation
            </h1>
            <DemoBadge label="XLSX / CSV PARSING ENGINE" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk ingest driver leads from external campaigns with column mapping, deduplication & automated AI telephony queuing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            title="Download clean .xlsx template with sample headers"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Download .xlsx Template</span>
          </button>

          <button
            onClick={handleLoadSampleDataset}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Load Demo Excel File</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { id: 'upload', label: '1. File Upload', desc: 'XLSX / CSV drop' },
            { id: 'mapping', label: '2. Column Mapping', desc: 'Target field matching' },
            { id: 'preview', label: '3. Validation & Dedup', desc: 'Duplicate checks' },
            { id: 'completed', label: '4. Ingest Confirmation', desc: 'Commit to pipeline' },
          ].map((s) => {
            const isCurrent = currentStep === s.id;
            const isPassed = 
              (s.id === 'upload' && currentStep !== 'upload') ||
              (s.id === 'mapping' && (currentStep === 'preview' || currentStep === 'completed')) ||
              (s.id === 'preview' && currentStep === 'completed');

            return (
              <div 
                key={s.id} 
                className={`p-2.5 rounded-xl border transition ${
                  isCurrent 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : isPassed 
                    ? 'bg-slate-50 border-emerald-200 text-emerald-800' 
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {isPassed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                  <span>{s.label}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Upload Dropzone */}
      {currentStep === 'upload' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-card text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-10 cursor-pointer transition bg-slate-50/50 hover:bg-amber-50/20 max-w-xl mx-auto space-y-3"
          >
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Drag & Drop Excel or CSV Lead Sheet</h3>
              <p className="text-xs text-slate-500 mt-1">Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)</p>
            </div>
            <button
              type="button"
              className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-sm"
            >
              Browse Local Files
            </button>
          </div>

          <div className="pt-2 text-xs text-slate-400">
            Or test right now with our pre-populated sample:{' '}
            <button
              onClick={handleLoadSampleDataset}
              className="text-amber-700 font-bold hover:underline"
            >
              Click here to load South India Auto Expo Batch
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {currentStep === 'mapping' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Map Excel Columns to XPOOL CRM Attributes</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                File: <strong className="text-slate-700">{fileName}</strong> ({fileSize}, {rawRows.length} total rows detected)
              </p>
            </div>
            <button
              onClick={() => setCurrentStep('upload')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Choose different file
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Driver Name */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Driver Full Name *</label>
              <select
                value={mappings.name}
                onChange={(e) => setMappings({ ...mappings, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select Excel Column</option>
                {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Phone / Mobile Number *</label>
              <select
                value={mappings.phone}
                onChange={(e) => setMappings({ ...mappings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select Excel Column</option>
                {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* City */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">City Hub</label>
              <select
                value={mappings.city}
                onChange={(e) => setMappings({ ...mappings, city: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select Excel Column (or default to Chennai)</option>
                {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Vehicle Type */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Vehicle Category</label>
              <select
                value={mappings.vehicleType}
                onChange={(e) => setMappings({ ...mappings, vehicleType: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select Excel Column (or default to Auto)</option>
                {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-500">Columns are verified against XPOOL CRM ingestion schema</span>
            <button
              onClick={handleProceedToValidation}
              disabled={!mappings.name || !mappings.phone}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-brand hover:from-amber-600 hover:to-orange-600 flex items-center gap-2 transition"
            >
              <span>Validate & Scan for Duplicates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview, Validation & Dedup Report */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          {/* Validation Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-900 block text-sm">{validCount} Valid Leads</span>
                <span className="text-emerald-700 text-[11px]">Ready for instant CRM ingestion</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-900 block text-sm">{duplicateCount} Duplicate Rows</span>
                <span className="text-amber-700 text-[11px]">Already present in driver pool</span>
              </div>
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-rose-900 block text-sm">{invalidCount} Format Errors</span>
                <span className="text-rose-700 text-[11px]">Missing or invalid phone digits</span>
              </div>
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
          </div>

          {/* Detailed Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Lead Rows Ingestion Preview</h4>
                <p className="text-xs text-slate-500">Inspect each row before committing to active database</p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                Total: {parsedLeads.length} rows
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-4">Row</th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4">City</th>
                    <th className="py-2.5 px-4">Vehicle</th>
                    <th className="py-2.5 px-4">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedLeads.map((row) => (
                    <tr key={row.rowId} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-mono text-slate-400">{row.rowId}</td>
                      <td className="py-2 px-4 font-bold text-slate-800">{row.name}</td>
                      <td className="py-2 px-4 font-mono text-slate-600">{row.phone}</td>
                      <td className="py-2 px-4 text-slate-700">{row.city}</td>
                      <td className="py-2 px-4 text-slate-700">{row.vehicleType}</td>
                      <td className="py-2 px-4">
                        {row.status === 'valid' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Valid
                          </span>
                        )}
                        {row.status === 'duplicate' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Duplicate (Ignored)
                          </span>
                        )}
                        {row.status === 'invalid' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold" title={row.errorDetails}>
                            Error: {row.errorDetails}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('mapping')}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-white"
              >
                Back to Column Mapping
              </button>

              <button
                onClick={handleCommitImport}
                disabled={validCount === 0}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-brand flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Confirm & Ingest {validCount} Valid Leads</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Completed Confirmation */}
      {currentStep === 'completed' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-card text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">Lead Batch Successfully Ingested</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>{importResult?.addedCount || validCount} new partner driver leads</strong> have been added to the XPOOL onboarding database. 
            {importResult?.duplicateCount ? ` ${importResult.duplicateCount} duplicate phone records were safely skipped.` : ''}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Auto-Queued for AI Welcome Call:</span>
              <strong className="text-amber-800">{validCount} Contacts</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dialect Routing:</span>
              <strong className="text-slate-800">Tamil (Chennai/Coimbatore), Telugu (Hyderabad)</strong>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setCurrentStep('upload');
                setParsedLeads([]);
                setRawRows([]);
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Upload Another File
            </button>
            <a
              href="/drivers"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold rounded-xl shadow-brand hover:from-amber-600 hover:to-orange-600"
            >
              View Ingested Drivers Table
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

