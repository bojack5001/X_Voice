import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  PhoneCall, 
  Play, 
  Eye, 
  FileText, 
  Clock, 
  Download, 
  Calendar, 
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CallRecord, CallOutcome, LanguageCode } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AudioPlayerMock } from '../components/common/AudioPlayerMock';
import { DemoBadge } from '../components/common/DemoBadge';

export const CallHistory: React.FC = () => {
  const { calls } = useData();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Call for Full Transcript Modal
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const matchesSearch = 
        call.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.contactPhone.includes(searchTerm) ||
        call.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.keyNotes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOutcome = outcomeFilter === 'all' || call.outcome === outcomeFilter;
      const matchesLang = languageFilter === 'all' || call.language === languageFilter;
      const matchesSentiment = sentimentFilter === 'all' || call.sentiment === sentimentFilter;

      return matchesSearch && matchesOutcome && matchesLang && matchesSentiment;
    });
  }, [calls, searchTerm, outcomeFilter, languageFilter, sentimentFilter]);

  const totalPages = Math.ceil(filteredCalls.length / pageSize) || 1;
  const paginatedCalls = filteredCalls.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getOutcomeBadge = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'Interested':
        return <Badge variant="green">Interested</Badge>;
      case 'Docs Submitted':
        return <Badge variant="blue">Docs Submitted</Badge>;
      case 'Callback Requested':
        return <Badge variant="amber">Callback Req</Badge>;
      case 'Escalated to Human':
        return <Badge variant="red">Human Escalated</Badge>;
      case 'Not Reachable':
        return <Badge variant="slate">Not Reachable</Badge>;
      default:
        return <Badge variant="slate">{outcome}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              AI Call History & Audit Transcripts
            </h1>
            <DemoBadge label="MULTI-LINGUAL TRANSCRIPTS" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit multi-turn speech recordings, extracted key entities, sentiment analysis, and operator transfers
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contact, phone, agent, keyword..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Outcomes</option>
              <option value="Interested">Interested</option>
              <option value="Docs Submitted">Docs Submitted</option>
              <option value="Callback Requested">Callback Requested</option>
              <option value="Escalated to Human">Escalated to Human</option>
              <option value="Not Reachable">Not Reachable</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Dialects</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <select
              value={sentimentFilter}
              onChange={(e) => {
                setSentimentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Sentiments</option>
              <option value="Positive">Positive Sentiment</option>
              <option value="Neutral">Neutral Sentiment</option>
              <option value="Negative">Negative / Escalated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Found <strong className="text-slate-900">{filteredCalls.length}</strong> logged conversations</span>
          {(searchTerm || outcomeFilter !== 'all' || languageFilter !== 'all' || sentimentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setOutcomeFilter('all');
                setLanguageFilter('all');
                setSentimentFilter('all');
              }}
              className="text-amber-700 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Calls Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">AI Agent & Language</th>
                <th className="py-3 px-4">Call Outcome</th>
                <th className="py-3 px-4">Duration & Audio</th>
                <th className="py-3 px-4">Sentiment</th>
                <th className="py-3 px-4">Key Extracted Intent</th>
                <th className="py-3 px-4 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No calls match selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedCalls.map((call) => (
                  <tr 
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="hover:bg-amber-50/40 transition cursor-pointer group"
                  >
                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-amber-700 transition">
                        {call.contactName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{call.contactPhone}</div>
                      <div className="text-[10px] text-slate-400">{call.id} • {call.contactType}</div>
                    </td>

                    {/* Agent & Language */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{call.agentName}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block ${
                        call.language === 'Tamil' ? 'bg-amber-100 text-amber-900' :
                        call.language === 'Telugu' ? 'bg-orange-100 text-orange-900' :
                        'bg-blue-100 text-blue-900'
                      }`}>
                        {call.language}
                      </span>
                    </td>

                    {/* Outcome */}
                    <td className="py-3 px-4">
                      {getOutcomeBadge(call.outcome)}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{call.audioDuration || '02:15'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{call.startTime}</span>
                    </td>

                    {/* Sentiment */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        call.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' :
                        call.sentiment === 'Neutral' ? 'bg-slate-100 text-slate-700' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {call.sentiment}
                      </span>
                    </td>

                    {/* Key Notes */}
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600">
                      {call.keyNotes}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Transcript</span>
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* Transcript & Audio Modal */}
      {selectedCall && (
        <Modal
          isOpen={!!selectedCall}
          onClose={() => setSelectedCall(null)}
          title={`Call Audit & Full Transcript • ${selectedCall.contactName}`}
          subtitle={`${selectedCall.id} • ${selectedCall.agentName} • ${selectedCall.startTime}`}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Audio Wave Player */}
            <AudioPlayerMock
              duration={selectedCall.audioDuration || '02:44'}
              callId={selectedCall.id}
            />

            {/* AI Summary & Action Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI Extracted Notes
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">{selectedCall.keyNotes}</p>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Follow-up Action Triggered
                </span>
                <p className="text-amber-950 font-medium leading-relaxed">{selectedCall.actionItem}</p>
                {selectedCall.escalatedTo && (
                  <div className="text-[11px] text-rose-700 font-bold mt-1">
                    Escalated To: {selectedCall.escalatedTo}
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Speech Bubbles */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Multi-Turn Conversation Speech Log ({selectedCall.language})
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedCall.transcript.map((msg, idx) => {
                  const isAgent = msg.speaker === 'AI Agent';
                  const isSpecialist = msg.speaker === 'Human Specialist';

                  return (
                    <div 
                      key={idx}
                      className={`flex gap-3 ${isAgent ? 'justify-start' : isSpecialist ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAgent && (
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[11px] shadow-sm flex-shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      {isSpecialist && (
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`p-3 rounded-2xl max-w-lg border ${
                        isAgent 
                          ? 'bg-amber-50 border-amber-200 text-slate-900' 
                          : isSpecialist
                          ? 'bg-blue-50 border-blue-200 text-slate-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 gap-4">
                          <span className="font-bold uppercase tracking-wider">
                            {msg.speaker} {isAgent ? `(${selectedCall.language})` : ''}
                          </span>
                          <span className="font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed text-xs">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

