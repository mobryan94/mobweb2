import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { SupportChat } from "@/components/support-chat";
import { 
  Upload, 
  Download, 
  Share, 
  BarChart3, 
  Clock, 
  Eye, 
  Copy,
  Trash2,
  ExternalLink
} from "lucide-react";
import logoPath from "@assets/triangle-logo.svg";

interface SharedFile {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  shareUrl: string;
  analyticsUrl: string;
  downloadCount: number;
  createdAt: string;
  expiresAt: string;
}

export default function FileShare() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { data: files = [], refetch } = useQuery<SharedFile[]>({
    queryKey: ["shared-files"],
    queryFn: () => apiRequest("/api/files/shared"),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("POST", "/api/files/upload");
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      toast({
        title: "File uploaded successfully!",
        description: "Your file is now available for sharing",
      });
      refetch();
      setUploadProgress(0);
      setIsUploading(false);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => apiRequest(`/api/files/${fileId}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "File has been removed",
      });
      refetch();
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Expires soon";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="glass-morphism border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoPath} alt="SESKROW" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold">SESKROW Share</h1>
              <p className="text-gray-400 text-sm">Fast, secure file sharing</p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Free Service
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="manage">Manage Files</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Upload Zone */}
            <Card className="glass-morphism border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-primary" />
                  Upload File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? "border-primary bg-primary/10" 
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
                  <p className="text-gray-400 mb-4">Or click to select files</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum file size: 100MB • Files are deleted after 7 days of inactivity
                  </p>
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-morphism border-gray-700">
                <CardContent className="p-4 text-center">
                  <Share className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Instant Sharing</h4>
                  <p className="text-sm text-gray-400">Get shareable links immediately</p>
                </CardContent>
              </Card>
              <Card className="glass-morphism border-gray-700">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Analytics</h4>
                  <p className="text-sm text-gray-400">Track downloads and views</p>
                </CardContent>
              </Card>
              <Card className="glass-morphism border-gray-700">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Auto-Cleanup</h4>
                  <p className="text-sm text-gray-400">Files deleted after 7 days</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Files List */}
            <Card className="glass-morphism border-gray-700">
              <CardHeader>
                <CardTitle>Your Shared Files</CardTitle>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{file.originalName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {file.downloadCount} downloads
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTimeLeft(file.expiresAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(file.shareUrl)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(file.analyticsUrl, "_blank")}
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(file.shareUrl, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(file.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Support Chat */}
      <SupportChat />
    </div>
  );
}
