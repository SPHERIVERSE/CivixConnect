'use client';

import React from 'react';
import Image from 'next/image';
import { CivicReport } from '@/app/auth/dashboard/citizen/civic-report/page';
import { LuThumbsUp, LuThumbsDown } from 'react-icons/lu';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface ReportCardProps {
  report: CivicReport;
  handleVote: (reportId: string, type: 'support' | 'oppose') => Promise<void>;
  votingStates: Record<string, boolean>;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  handleVote,
  votingStates,
}) => {
  const isVotingDisabled =
    report.hasVoted || votingStates[report.id] || !report.canVote;

  const getStatusColor = (status: CivicReport['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-yellow-950';
      case 'working':
        return 'bg-amber-500 text-amber-950'; // New working status
      case 'assigned':
        return 'bg-blue-500 text-white';
      case 'resolved':
        return 'bg-green-500 text-white';
      case 'escalated':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: CivicReport['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'working':
        return 'Working on it'; // New working status
      case 'assigned':
        return 'Worker Dispatched';
      case 'escalated':
        return 'Escalated';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  const statusColor = getStatusColor(report.status);
  const statusText = getStatusText(report.status);
  const timeAgo = formatDistanceToNow(parseISO(report.createdAt), { addSuffix: true });

  return (
    <div className={`bg-gray-900 rounded-xl shadow-lg overflow-hidden border ${report.aiFlaggedAsSpam ? 'border-red-900' : 'border-gray-700'}`}>
      
      {/* AI Spam Banner */}
      {report.aiFlaggedAsSpam && (
        <div className="bg-red-950/80 border-b border-red-900 px-4 py-2 text-center">
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">⚠️ Flagged as Invalid/Spam by AI</span>
        </div>
      )}

      {report.imageUrl && (
        <div className={`relative w-full h-48 ${report.aiFlaggedAsSpam ? 'opacity-50 grayscale' : ''}`}>
          <Image
            src={report.imageUrl}
            alt={report.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={report.aiFlaggedAsSpam ? '' : 'rounded-t-xl'}
          />
        </div>
      )}
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
            {report.title}
          </h3>
          <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusColor}`}>
            {statusText}
          </span>
        </div>

        {/* AI Insights Box */}
        {report.aiSummary && (
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-blue-400 text-xs font-bold">✨ Swavi AI Triage</span>
              {report.aiSeverityScore !== undefined && report.aiSeverityScore > 0 && (
                <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded uppercase">
                  Severity: {report.aiSeverityScore}/10
                </span>
              )}
            </div>
            <p className="text-sm text-blue-200/80 italic">"{report.aiSummary}"</p>
          </div>
        )}

        <p className="text-gray-400 text-sm line-clamp-3">{report.description}</p>
        
        <div className="flex justify-between items-center text-gray-500 text-xs font-mono">
          {report.createdBy && (
            <span className="text-gray-400 text-xs font-semibold">
              by {report.createdBy.name}
            </span>
          )}
          <span>{timeAgo}</span>
        </div>

        <div className="flex items-center justify-between text-sm font-semibold">
          <div className="flex space-x-4">
            <span className="flex items-center text-green-400">
              <LuThumbsUp className="mr-1" /> {report.supportCount}
            </span>
            <span className="flex items-center text-red-400">
              <LuThumbsDown className="mr-1" /> {report.oppositionCount}
            </span>
          </div>
          {/* Duplicate Clustering Indicator */}
          {report.duplicateCount && report.duplicateCount > 1 && (
             <span className="text-xs text-blue-400 font-medium">
               🔄 +{report.duplicateCount - 1} similar
             </span>
          )}
        </div>

        {report.resolvedImageUrl && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Resolution Evidence:</p>
            <div className="relative w-full h-44 rounded-lg overflow-hidden border border-green-700">
              <Image
                src={report.resolvedImageUrl}
                alt={report.title + ' resolved'}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            {report.resolvedNotes && (
              <p className="text-xs text-green-300 italic mt-2">Notes: {report.resolvedNotes}</p>
            )}
          </div>
        )}
        
        {report.isOwnReport ? (
          <div className="text-center py-2 bg-gray-800 rounded">
            <p className="text-gray-600 italic text-sm">📝 This is your report</p>
          </div>
        ) : report.hasVoted ? (
          <div className="text-center py-2 bg-gray-800 rounded">
            <p className="text-gray-600 italic text-sm">
              ✅ You {report.userVote === 'support' ? 'supported' : 'opposed'} this report
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleVote(report.id, 'support')}
              disabled={isVotingDisabled}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              👍 Support
            </button>
            <button
              onClick={() => handleVote(report.id, 'oppose')}
              disabled={isVotingDisabled}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              👎 Oppose
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;