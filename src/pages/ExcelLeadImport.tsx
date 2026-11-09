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
  Check, 
  Download, 
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { LeadImportRow, ConsentStatus, LanguageCode } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { CONSENT_OPTIONS } from '../data/mockConfig';

interface RejectedRowItem {
  rowId: number;
  name: string;
  phone: string;
  reason: string;
  rawDetails: any;
}

export const ExcelLeadImport: React.FC = () => {
  const { drivers, importLeads } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper state: 'upload' | 'mapping' | 'preview' | 'completed'
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview' | 'completed'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);

  // Raw parsed Excel headers and rows
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);

  // Column Mappings (including mandatory Consent mapping or default)
  const [mappings, setMappings] = useState({
    name: '',
    phone: '',
    city: '',
    vehicleType: '',
    language: '',
    consent: ''
  });

  const [defaultConsentIfUnmapped, setDefaultConsentIfUnmapped] = useState<ConsentStatus>('Consent Granted');

  // Validated rows & rejected rows
  const [parsedLeads, setParsedLeads] = useState<LeadImportRow[]>([]);
  const [rejectedRows, setRejectedRows] = useState<RejectedRowItem[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState<'all' | 'valid' | 'rejected'>('all');
  const [importResult, setImportResult] = useState<{ addedCount: number; duplicateCount: number } | null>(null);

  // Clean Indian mobile phone validator: 10 digits starting with 6, 7, 8, or 9
  const validateIndianMobile = (phoneStr: string): { isValid: boolean; cleaned: string } => {
    let digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.substring(2);
    } else if (digits.startsWith('0') && digits.length === 11) {
      digits = digits.substring(1);
    }
    const isValid = /^[6-9]\d{9}$/.test(digits);
    return { isValid, cleaned: digits ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : phoneStr };
  };

  // Generate and download a clean .xlsx sample template with consent header
  const handleDownloadTemplate = () => {
    const templateData = [
      ['Driver_Name', 'Mobile_Number', 'City_Hub', 'Vehicle_Category', 'Preferred_Lang', 'Consent_Status'],
      ['Karthik Shanmugam (Demo)', '98000 00010', 'Chennai', 'Auto', 'Tamil', 'Consent Granted'],
      ['Naveen Kumar G (Demo)', '98000 00011', 'Hyderabad', 'Sedan', 'Telugu', 'Consent Granted'],
      ['Rajeshwari Balan (Demo)', '98000 00012', 'Coimbatore', 'EV Auto', 'Tamil', 'Consent Granted'],
      ['Syed Imran Pasha (Demo)', '98000 00013', 'Bengaluru', 'Hatchback', 'English', 'Consent Unknown'],
      ['Senthil Velan (Demo)', '98000 00014', 'Madurai', 'Auto', 'Tamil', 'Consent Granted']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Driver_Leads_Template');
    XLSX.writeFile(wb, 'XPOOL_Driver_Leads_Template.xlsx');
  };

  // Sample data generator for quick test
  const handleLoadSampleDataset = () => {
    const sampleHeaders = ['Driver_Name', 'Mobile_Number', 'City_Hub', 'Vehicle_Category', 'Preferred_Lang', 'Consent_Status'];
    const sampleRows = [
      { 'Driver_Name': 'Karthik Shanmugam (Demo)', 'Mobile_Number': '98000 00020', 'City_Hub': 'Chennai', 'Vehicle_Category': 'Auto', 'Preferred_Lang': 'Tamil', 'Consent_Status': 'Consent Granted' },
      { 'Driver_Name': 'Naveen Kumar G (Demo)', 'Mobile_Number': '98000 00021', 'City_Hub': 'Hyderabad', 'Vehicle_Category': 'Sedan', 'Preferred_Lang': 'Telugu', 'Consent_Status': 'Consent Granted' },
      // Duplicate of existing driver in CRM (DRV-1003)
      { 'Driver_Name': 'Muruganandham P (Demo Duplicate)', 'Mobile_Number': '98000 00003', 'City_Hub': 'Madurai', 'Vehicle_Category': 'Auto', 'Preferred_Lang': 'Tamil', 'Consent_Status': 'Consent Granted' },
      // Duplicate inside this sheet
      { 'Driver_Name': 'Karthik Duplicate in Sheet', 'Mobile_Number': '98000 00020', 'City_Hub': 'Chennai', 'Vehicle_Category': 'Auto', 'Preferred_Lang': 'Tamil', 'Consent_Status': 'Consent Granted' },
      { 'Driver_Name': 'Rajeshwari Balan (Demo)', 'Mobile_Number': '98000 00022', 'City_Hub': 'Coimbatore', 'Vehicle_Category': 'EV Auto', 'Preferred_Lang': 'Tamil', 'Consent_Status': 'Consent Granted' },
      { 'Driver_Name': 'Syed Imran Pasha (Demo)', 'Mobile_Number': '98000 00023', 'City_Hub': 'Bengaluru', 'Vehicle_Category': 'Hatchback', 'Preferred_Lang': 'English', 'Consent_Status': 'Consent Unknown' },
      // Invalid phone format
      { 'Driver_Name': 'Invalid Mobile Lead', 'Mobile_Number': '12345', 'City_Hub': 'Chennai', 'Vehicle_Category': 'Bike', 'Preferred_Lang': 'Tamil', 'Consent_Status': 'Consent Granted' },
      // Missing name
      { 'Driver_Name': '', 'Mobile_Number': '98000 00024', 'City_Hub': 'Madurai', 'Vehicle_Category': 'Auto', 'Preferred_Lang': 'Tamil', 'Consent_Status': 'Consent Granted' }
    ];

    setFileError(null);
    setFileName('South_India_Driver_Leads_Batch_Sample.xlsx');
    setFileSize('18.4 KB');
    setExcelHeaders(sampleHeaders);
    setRawRows(sampleRows);

    setMappings({
      name: 'Driver_Name',
      phone: 'Mobile_Number',
      city: 'City_Hub',
      vehicleType: 'Vehicle_Category',
      language: 'Preferred_Lang',
      consent: 'Consent_Status'
    });

    setCurrentStep('mapping');
  };

  // File upload validation: STRICTLY .xlsx only!
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx');
    if (!isXlsx) {
      setFileError('Invalid file format. Only Microsoft Excel (.xlsx) files are supported for secure lead ingestion. (.csv and .xls are not supported in this phase).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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
          const headers = (data[0] as string[]).map(h => String(h || '').trim()).filter(Boolean);
          if (headers.length === 0) {
            setFileError('The uploaded Excel file does not contain valid column headers on row 1.');
            return;
          }

          setExcelHeaders(headers);
          const rows = XLSX.utils.sheet_to_json(ws);
          setRawRows(rows);

          // Auto-detect columns
          const autoMap = {
            name: headers.find(h => /name|driver/i.test(h)) || headers[0] || '',
            phone: headers.find(h => /phone|mobile|contact|cell/i.test(h)) || headers[1] || '',
            city: headers.find(h => /city|location|hub|zone/i.test(h)) || headers[2] || '',
            vehicleType: headers.find(h => /vehicle|type|model|category/i.test(h)) || headers[3] || '',
            language: headers.find(h => /lang|language|dialect/i.test(h)) || headers[4] || '',
            consent: headers.find(h => /consent|opt.?in|permission/i.test(h)) || ''
          };
          setMappings(autoMap);
          setCurrentStep('mapping');
        } else {
          setFileError('The uploaded worksheet appears to be empty.');
        }
      } catch (err) {
        setFileError('Failed to parse Excel file. Please ensure it is an unencrypted, valid .xlsx spreadsheet.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Step 2 -> Step 3: Run full deduplication & phone validation
  const handleProceedToValidation = () => {
    const existingCrmPhones = new Set(drivers.map(d => d.phone.replace(/\D/g, '')));
    const seenSheetPhones = new Set<string>();

    const validated: LeadImportRow[] = [];
    const rejected: RejectedRowItem[] = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 1;
      const rawName = String(row[mappings.name] || '').trim();
      const rawPhone = String(row[mappings.phone] || '').trim();
      const rawCity = String(row[mappings.city] || 'Chennai').trim();
      const rawVehicle = String(row[mappings.vehicleType] || 'Auto').trim();
      const rawLang = String(row[mappings.language] || 'Tamil').trim();

      // Resolve consent
      let consentVal: ConsentStatus = defaultConsentIfUnmapped;
      if (mappings.consent && row[mappings.consent]) {
        const cText = String(row[mappings.consent]).trim().toLowerCase();
        if (cText.includes('granted') || cText.includes('yes') || cText.includes('opted')) {
          consentVal = 'Consent Granted';
        } else if (cText.includes('revoked') || cText.includes('no') || cText.includes('optout') || cText.includes('dnc')) {
          consentVal = 'Consent Revoked';
        } else {
          consentVal = 'Consent Unknown';
        }
      }

      // 1. Validate Name
      if (!rawName) {
        rejected.push({
          rowId: rowNum,
          name: '(Missing Name)',
          phone: rawPhone,
          reason: 'Driver name is empty or missing.',
          rawDetails: row
        });
        validated.push({
          rowId: rowNum,
          name: 'Missing Name',
          phone: rawPhone,
          city: rawCity,
          vehicleType: rawVehicle,
          language: rawLang,
          consentStatus: consentVal,
          status: 'invalid',
          errorDetails: 'Driver full name is required'
        });
        return;
      }

      // 2. Validate Phone
      const { isValid, cleaned } = validateIndianMobile(rawPhone);
      if (!isValid) {
        rejected.push({
          rowId: rowNum,
          name: rawName,
          phone: rawPhone,
          reason: 'Invalid Indian mobile phone format (Must be valid 10-digit starting with 6,7,8,9).',
          rawDetails: row
        });
        validated.push({
          rowId: rowNum,
          name: rawName,
          phone: rawPhone,
          city: rawCity,
          vehicleType: rawVehicle,
          language: rawLang,
          consentStatus: consentVal,
          status: 'invalid',
          errorDetails: 'Invalid 10-digit mobile format'
        });
        return;
      }

      const strippedDigits = cleaned.replace(/\D/g, '').slice(-10);

      // 3. Deduplicate against sheet
      if (seenSheetPhones.has(strippedDigits)) {
        rejected.push({
          rowId: rowNum,
          name: rawName,
          phone: cleaned,
          reason: 'Internal Duplicate: Phone number appears multiple times in this uploaded spreadsheet.',
          rawDetails: row
        });
        validated.push({
          rowId: rowNum,
          name: rawName,
          phone: cleaned,
          city: rawCity,
          vehicleType: rawVehicle,
          language: rawLang,
          consentStatus: consentVal,
          status: 'duplicate',
          errorDetails: 'Duplicate entry inside sheet'
        });
        return;
      }
      seenSheetPhones.add(strippedDigits);

      // 4. Deduplicate against CRM
      if (existingCrmPhones.has(strippedDigits)) {
        rejected.push({
          rowId: rowNum,
          name: rawName,
          phone: cleaned,
          reason: 'CRM Duplicate: Phone number already exists in active driver CRM database.',
          rawDetails: row
        });
        validated.push({
          rowId: rowNum,
          name: rawName,
          phone: cleaned,
          city: rawCity,
          vehicleType: rawVehicle,
          language: rawLang,
          consentStatus: consentVal,
          status: 'duplicate',
          errorDetails: 'Already exists in CRM'
        });
        return;
      }

      // Row is valid!
      validated.push({
        rowId: rowNum,
        name: rawName,
        phone: cleaned,
        city: rawCity,
        vehicleType: rawVehicle,
        language: rawLang,
        consentStatus: consentVal,
        status: 'valid'
      });
    });

    setParsedLeads(validated);
    setRejectedRows(rejected);
    setCurrentStep('preview');
  };

  // Step 3 -> Step 4: Commit import (STRICT: Never trigger calls!)
  const handleCommitImport = () => {
    const validLeads = parsedLeads.filter(r => r.status === 'valid');
    const result = importLeads(validLeads);
    setImportResult(result);
    setCurrentStep('completed');
  };

  // Export rejected rows report as .xlsx
  const handleExportRejectedReport = () => {
    if (rejectedRows.length === 0) return;
    const exportData = [
      ['Row_Number', 'Driver_Name', 'Phone_Number', 'Rejection_Reason'],
      ...rejectedRows.map(r => [r.rowId, r.name, r.phone, r.reason])
    ];
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rejected_Leads_Report');
    XLSX.writeFile(wb, `XPOOL_Rejected_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const validCount = parsedLeads.filter(p => p.status === 'valid').length;
  const duplicateCount = parsedLeads.filter(p => p.status === 'duplicate').length;
  const invalidCount = parsedLeads.filter(p => p.status === 'invalid').length;
  const consentGrantedCount = parsedLeads.filter(p => p.status === 'valid' && p.consentStatus === 'Consent Granted').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Excel Lead Ingest & Validation (XLSX Only)
            </h1>
            <DemoBadge label="STRICT XLSX PIPELINE • NO AUTO-CALL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest partner driver leads with phone validation, internal deduplication, consent mapping, and rejected row reporting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            title="Download verified .xlsx template"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Download .xlsx Template</span>
          </button>

          <button
            onClick={handleLoadSampleDataset}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Load Demo Batch</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { id: 'upload', label: '1. File Upload', desc: 'XLSX validation only' },
            { id: 'mapping', label: '2. Column Mapping', desc: 'Consent & attributes' },
            { id: 'preview', label: '3. Preview & Dedup', desc: 'Report & rejection review' },
            { id: 'completed', label: '4. Confirmed Ingest', desc: 'Saved without auto-dial' },
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

      {/* STEP 1: Upload (XLSX ONLY) */}
      {currentStep === 'upload' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-card text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx"
            className="hidden"
          />

          {fileError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl max-w-xl mx-auto flex items-start gap-2.5 text-left text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">File Upload Error</strong>
                <span>{fileError}</span>
              </div>
            </div>
          )}

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-10 cursor-pointer transition bg-slate-50/50 hover:bg-amber-50/20 max-w-xl mx-auto space-y-3"
          >
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Microsoft Excel (.xlsx) Lead Sheet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Strict format: <strong>.xlsx files only</strong> (Legacy .xls and .csv are restricted to guarantee schema integrity)
              </p>
            </div>
            <button
              type="button"
              className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-sm"
            >
              Browse Local .xlsx Files
            </button>
          </div>

          <div className="pt-2 text-xs text-slate-400">
            Or test right now with our pre-configured sample:{' '}
            <button
              onClick={handleLoadSampleDataset}
              className="text-amber-700 font-bold hover:underline"
            >
              Click here to load South India Demo Batch
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Column & Consent Mapping */}
      {currentStep === 'mapping' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Map Excel Columns & Consent Rules</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                File: <strong className="text-slate-700">{fileName}</strong> ({fileSize}, {rawRows.length} total rows)
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
              <label className="font-bold text-slate-800 block">Mobile Phone Number (Indian 10-Digit) *</label>
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

            {/* Preferred Language */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block">Preferred Dialect (Tamil / Telugu / English)</label>
              <select
                value={mappings.language}
                onChange={(e) => setMappings({ ...mappings, language: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select Excel Column (or default to Tamil)</option>
                {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Consent Column Mapping */}
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
              <label className="font-bold text-amber-950 block">Calling Consent Column (Optional)</label>
              <select
                value={mappings.consent}
                onChange={(e) => setMappings({ ...mappings, consent: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No column in file (Use Default below)</option>
                {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              {!mappings.consent && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Default for unmapped:</span>
                  <select
                    value={defaultConsentIfUnmapped}
                    onChange={(e) => setDefaultConsentIfUnmapped(e.target.value as ConsentStatus)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px]"
                  >
                    {CONSENT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Leads will be verified for mobile validity, sheet duplicates & CRM duplicates
            </span>
            <button
              onClick={handleProceedToValidation}
              disabled={!mappings.name || !mappings.phone}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-brand hover:from-amber-600 hover:to-orange-600 flex items-center gap-2 transition"
            >
              <span>Validate & Generate Rejection Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview, Validation & Rejection Report */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          {/* Validation Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-900 block text-base">{validCount} Valid Leads</span>
                <span className="text-emerald-700 text-[11px]">{consentGrantedCount} have Consent Granted</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-900 block text-base">{duplicateCount} Duplicate Rows</span>
                <span className="text-amber-700 text-[11px]">In file or existing in CRM</span>
              </div>
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-rose-900 block text-base">{invalidCount} Format Errors</span>
                <span className="text-rose-700 text-[11px]">Invalid mobile / missing name</span>
              </div>
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block text-base">{rejectedRows.length} Total Rejected</span>
                <span className="text-slate-500 text-[11px]">Filtered out before saving</span>
              </div>
              <ShieldCheck className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePreviewTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activePreviewTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Rows ({parsedLeads.length})
                </button>
                <button
                  onClick={() => setActivePreviewTab('valid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activePreviewTab === 'valid' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Valid Ready ({validCount})
                </button>
                <button
                  onClick={() => setActivePreviewTab('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activePreviewTab === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Rejected Report ({rejectedRows.length})
                </button>
              </div>

              {rejectedRows.length > 0 && (
                <button
                  onClick={handleExportRejectedReport}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rejected Rows (.xlsx)</span>
                </button>
              )}
            </div>

            {/* Rows Table */}
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-4">Row</th>
                    <th className="py-2.5 px-4">Driver Name</th>
                    <th className="py-2.5 px-4">Phone Number</th>
                    <th className="py-2.5 px-4">City</th>
                    <th className="py-2.5 px-4">Vehicle</th>
                    <th className="py-2.5 px-4">Consent Status</th>
                    <th className="py-2.5 px-4">Validation Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedLeads
                    .filter(row => {
                      if (activePreviewTab === 'valid') return row.status === 'valid';
                      if (activePreviewTab === 'rejected') return row.status !== 'valid';
                      return true;
                    })
                    .map((row) => (
                      <tr key={row.rowId} className="hover:bg-slate-50">
                        <td className="py-2 px-4 font-mono text-slate-400">{row.rowId}</td>
                        <td className="py-2 px-4 font-bold text-slate-800">{row.name}</td>
                        <td className="py-2 px-4 font-mono text-slate-600">{row.phone}</td>
                        <td className="py-2 px-4 text-slate-700">{row.city}</td>
                        <td className="py-2 px-4 text-slate-700">{row.vehicleType}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.consentStatus === 'Consent Granted' ? 'bg-emerald-100 text-emerald-800' :
                            row.consentStatus === 'Consent Revoked' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {row.consentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {row.status === 'valid' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Valid (Ready to Save)
                            </span>
                          ) : row.status === 'duplicate' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold" title={row.errorDetails}>
                              {row.errorDetails}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold" title={row.errorDetails}>
                              Rejected: {row.errorDetails}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Confirmation Action Strip */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <strong>Ingestion Notice:</strong> Only the {validCount} valid leads will be added. <strong>Calls are NEVER automatically triggered.</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep('mapping')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-white"
                >
                  Back to Mapping
                </button>

                <button
                  onClick={handleCommitImport}
                  disabled={validCount === 0}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-brand flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Confirm & Save {validCount} Valid Leads</span>
                </button>
              </div>
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
            <strong>{importResult?.addedCount || validCount} driver leads</strong> were added to the CRM database with verified consent states. 
            {rejectedRows.length > 0 && ` ${rejectedRows.length} duplicate or invalid rows were safely rejected.`}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Autonomous Outbound Telephony:</span>
              <strong className="text-emerald-700 font-bold">DISABLED (Zero Auto-Calls)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status in Pipeline:</span>
              <strong className="text-slate-800">Pending Manual Operator Review</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Consent Verified:</span>
              <strong className="text-amber-800">{consentGrantedCount} Leads with Recorded Opt-In</strong>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setCurrentStep('upload');
                setParsedLeads([]);
                setRawRows([]);
                setRejectedRows([]);
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Upload Another .xlsx
            </button>
            <a
              href="/drivers"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold rounded-xl shadow-brand hover:from-amber-600 hover:to-orange-600 inline-flex items-center"
            >
              View Ingested Drivers
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
