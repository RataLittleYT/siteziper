import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { RefreshCw, Check, Package, Download, Activity } from "lucide-react";
import type { CloneJob } from "@shared/schema";

interface ProgressMonitorProps {
  jobId: string;
  onComplete: () => void;
}

export function ProgressMonitor({ jobId, onComplete }: ProgressMonitorProps) {
  const { data: job, isLoading } = useQuery<CloneJob>({
    queryKey: ["/api/clone-jobs", jobId],
    refetchInterval: 1000, // Poll every second
    enabled: !!jobId,
  });

  useEffect(() => {
    if (job?.status === "completed") {
      onComplete();
    }
  }, [job?.status, onComplete]);

  if (isLoading || !job) {
    return (
      <div className="bg-card-bg/50 glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          <span className="ml-3 text-white">Loading progress...</span>
        </div>
      </div>
    );
  }

  const progressSteps = [
    {
      name: "HTML Analysis",
      description: "Parsing DOM structure",
      status: job.progress >= 25 ? "complete" : job.progress > 0 ? "current" : "pending",
      icon: Check,
    },
    {
      name: "Resource Download",
      description: "Downloading assets",
      status: job.progress >= 75 ? "complete" : job.progress >= 25 ? "current" : "pending",
      icon: RefreshCw,
    },
    {
      name: "ZIP Creation",
      description: "Creating archive",
      status: job.progress >= 95 ? "complete" : job.progress >= 75 ? "current" : "pending",
      icon: Package,
    },
    {
      name: "Download",
      description: "Preparing download",
      status: job.progress === 100 ? "complete" : job.progress >= 95 ? "current" : "pending",
      icon: Download,
    },
  ];

  return (
    <div className="bg-card-bg/50 glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-success to-accent rounded-xl flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white">Cloning in Progress</h3>
            <p className="text-gray-400">{job.currentStatus || "Processing..."}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent">{job.progress}%</div>
          <div className="text-sm text-gray-400">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
          <div 
            className="progress-bar h-full bg-gradient-to-r from-success to-accent rounded-full transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {progressSteps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = step.status === "complete";
          const isCurrent = step.status === "current";
          const isPending = step.status === "pending";

          return (
            <div
              key={step.name}
              className={`rounded-xl p-4 border transition-all duration-300 ${
                isComplete
                  ? "bg-slate-800/50 border-success"
                  : isCurrent
                  ? "bg-slate-800/50 border-accent border-dashed"
                  : "bg-slate-800/30 border-slate-600"
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isComplete
                      ? "bg-success"
                      : isCurrent
                      ? "bg-accent"
                      : "bg-slate-600"
                  }`}
                >
                  <Icon 
                    className={`w-4 h-4 text-white ${
                      isCurrent && step.icon === RefreshCw ? "animate-spin-slow" : ""
                    }`}
                  />
                </div>
                <span
                  className={`font-medium ${
                    isComplete || isCurrent ? "text-white" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              <p
                className={`text-sm ${
                  isComplete || isCurrent ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {step.description}
              </p>
              <div
                className={`text-xs mt-1 ${
                  isComplete
                    ? "text-success"
                    : isCurrent
                    ? "text-accent"
                    : "text-gray-500"
                }`}
              >
                {isComplete ? "✓ Complete" : isCurrent ? "In Progress..." : "Pending"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{job.filesProcessed || 0}</div>
          <div className="text-sm text-gray-400">Files Processed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">{job.totalSize || "0 B"}</div>
          <div className="text-sm text-gray-400">Total Size</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{job.downloadSpeed || "0 B/s"}</div>
          <div className="text-sm text-gray-400">Speed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">{job.timeRemaining || "Unknown"}</div>
          <div className="text-sm text-gray-400">Time Left</div>
        </div>
      </div>
    </div>
  );
}
