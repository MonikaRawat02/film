import { CheckCircle, AlertCircle, XCircle, TrendingUp, FileText, Link2, MessageSquare } from "lucide-react";

/**
 * Quality Score Badge Component
 */
export function QualityScoreBadge({ score }) {
  const getColor = () => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getColor()}`}>
      {score >= 70 ? (
        <CheckCircle className="w-4 h-4" />
      ) : score >= 50 ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      <span className="text-sm font-bold">{score}/100</span>
      <span className="text-xs opacity-80">{getLabel()}</span>
    </div>
  );
}

/**
 * Word Count Display Component
 */
export function WordCountDisplay({ wordCount, minRequired = 1200 }) {
  const isSufficient = wordCount >= minRequired;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
      isSufficient 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border-red-500/30'
    }`}>
      <FileText className="w-4 h-4" />
      <span className="text-sm font-bold">{wordCount.toLocaleString()} words</span>
      {!isSufficient && (
        <span className="text-xs">
          (need {minRequired - wordCount} more)
        </span>
      )}
    </div>
  );
}

/**
 * Validation Issues List Component
 */
export function ValidationIssuesList({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>No issues found</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <div key={index} className="flex items-start gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{issue}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Quality Report Card Component
 */
export function QualityReportCard({ report }) {
  if (!report) return null;

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Content Quality Report
        </h3>
        <QualityScoreBadge score={report.qualityScore} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 uppercase">Word Count</span>
          </div>
          <p className="text-lg font-bold text-white">{report.wordCount?.toLocaleString() || 0}</p>
          <WordCountDisplay wordCount={report.wordCount || 0} />
        </div>

        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 uppercase">Checks Passed</span>
          </div>
          <p className="text-lg font-bold text-white">{report.passedChecks}/{report.totalChecks}</p>
          <div className="text-xs text-zinc-400">
            {Math.round((report.passedChecks / report.totalChecks) * 100)}% success
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 uppercase">FAQ Section</span>
          </div>
          <p className="text-lg font-bold text-white">{report.hasFAQ ? 'Yes' : 'No'}</p>
          <div className={`text-xs ${report.hasFAQ ? 'text-green-400' : 'text-red-400'}`}>
            {report.hasFAQ ? 'Present' : 'Missing'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 uppercase">Internal Links</span>
          </div>
          <p className="text-lg font-bold text-white">{report.internalLinks || 0}</p>
          <div className={`text-xs ${report.internalLinks >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
            {report.internalLinks >= 2 ? 'Good' : 'Needs more'}
          </div>
        </div>
      </div>

      {/* Heading Structure */}
      {report.headingStructure && (
        <div className="p-3 rounded-lg bg-white/5">
          <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Heading Structure</h4>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-400">H1: {report.headingStructure.hasH1 ? '✓' : '✗'}</span>
            <span className="text-zinc-400">H2: {report.headingStructure.h2Count || 0}</span>
            <span className="text-zinc-400">H3: {report.headingStructure.h3Count || 0}</span>
          </div>
        </div>
      )}

      {/* Issues */}
      {report.issues && report.issues.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Issues Found ({report.issues.length})
          </h4>
          <ValidationIssuesList issues={report.issues} />
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommendations ({report.recommendations.length})
          </h4>
          <div className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'high' 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : rec.priority === 'medium'
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-bold uppercase mt-0.5 ${
                    rec.priority === 'high' ? 'text-red-400' :
                    rec.priority === 'medium' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    [{rec.priority}]
                  </span>
                  <span className="text-sm text-zinc-300">{rec.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Quick Stats Component for Article List
 */
export function ArticleQuickStats({ article }) {
  const wordCount = article.sections?.reduce((sum, s) => 
    sum + (s.content?.split(' ').length || 0), 0) || 0;
  
  const hasFAQ = article.meta?.faq?.length > 0 || 
                 article.sections?.some(s => s.heading.toLowerCase().includes('faq'));
  
  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400">
      <span className="flex items-center gap-1">
        <FileText className="w-3 h-3" />
        {wordCount.toLocaleString()}w
      </span>
      <span className="flex items-center gap-1">
        <MessageSquare className="w-3 h-3" />
        {article.meta?.faq?.length || 0} FAQs
      </span>
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        article.isAIContent 
          ? 'bg-blue-500/20 text-blue-400' 
          : 'bg-zinc-500/20 text-zinc-400'
      }`}>
        {article.isAIContent ? 'AI' : 'Manual'}
      </span>
    </div>
  );
}
