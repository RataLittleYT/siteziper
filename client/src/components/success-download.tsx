import { useQuery } from "@tanstack/react-query";
import { Check, Download, FolderOpen, File, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CloneJob } from "@shared/schema";

interface SuccessDownloadProps {
  jobId: string;
  onNewClone: () => void;
}

export function SuccessDownload({ jobId, onNewClone }: SuccessDownloadProps) {
  const { data: job } = useQuery<CloneJob>({
    queryKey: ["/api/clone-jobs", jobId],
    enabled: !!jobId,
  });

  const handleDownload = async () => {
    if (job?.zipPath) {
      const link = document.createElement('a');
      link.href = `/api/download/${jobId}`;
      link.download = `${new URL(job.url).hostname}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  const siteDomain = new URL(job.url).hostname.replace(/\./g, '-');

  return (
    <div className="bg-card-bg/50 glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-soft">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4">Website Cloned Successfully!</h3>
        <p className="text-gray-300 mb-8">Your website has been completely cloned and is ready for download.</p>
        
        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-success to-accent hover:from-success/90 hover:to-accent/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-3"
          >
            <Download className="w-5 h-5" />
            <span>Download ZIP File</span>
            <span className="bg-white/20 px-2 py-1 rounded text-sm">{job.zipSize || "N/A"}</span>
          </Button>
          
          <Button
            onClick={onNewClone}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800 py-4 px-8 rounded-xl"
          >
            Clone Another Website
          </Button>
        </div>

        {/* File Structure Preview */}
        <div className="bg-slate-800/50 rounded-xl p-6 text-left">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FolderOpen className="mr-2 w-5 h-5 text-accent" />
            Archive Contents
          </h4>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center text-gray-300">
              <FolderOpen className="text-amber-400 mr-2 w-4 h-4" />
              <span>{siteDomain}/</span>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-center text-gray-400">
                <FileCode className="text-blue-400 mr-2 w-4 h-4" />
                <span>index.html</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FolderOpen className="text-amber-400 mr-2 w-4 h-4" />
                <span>assets/</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center text-gray-500">
                  <FolderOpen className="text-amber-400 mr-2 w-4 h-4" />
                  <span>css/</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FolderOpen className="text-amber-400 mr-2 w-4 h-4" />
                  <span>js/</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FolderOpen className="text-amber-400 mr-2 w-4 h-4" />
                  <span>images/</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FolderOpen className="text-amber-400 mr-2 w-4 h-4" />
                  <span>fonts/</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
