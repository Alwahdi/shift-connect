import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, FileText, Check, Loader2, AlertCircle, Eye, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DocumentUploadCardProps {
  type: string;
  name: string;
  description: string;
  required?: boolean;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  status?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  onRemove?: () => void;
}

const DocumentUploadCard = ({
  type,
  name,
  description,
  required = false,
  file,
  uploading,
  uploaded,
  status = "pending",
  rejectionReason,
  onFileSelect,
  onUpload,
  onRemove,
}: DocumentUploadCardProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const getStatusColor = () => {
    if (uploaded && status === "verified") return "border-success bg-success/5";
    if (uploaded && status === "rejected") return "border-destructive bg-destructive/5";
    if (uploaded) return "border-warning bg-warning/5";
    if (file) return "border-primary bg-primary/5";
    if (dragOver) return "border-primary bg-primary/5";
    return "border-border bg-background hover:border-muted-foreground/50";
  };

  const getStatusIcon = () => {
    if (uploaded && status === "verified") {
      return <Check className="w-5 h-5 text-success" />;
    }
    if (uploaded && status === "rejected") {
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
    if (uploaded) {
      return <Loader2 className="w-5 h-5 text-warning animate-spin" />;
    }
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-xl border-2 border-dashed transition-all ${getStatusColor()}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) onFileSelect(selectedFile);
        }}
      />

      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          uploaded ? (status === "verified" ? "bg-success/10" : status === "rejected" ? "bg-destructive/10" : "bg-warning/10") : "bg-muted"
        }`}>
          {getStatusIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground">{name}</h4>
            {required && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{t("documents.required")}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          {file && !uploaded && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-secondary">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
              <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploaded && status === "rejected" && rejectionReason && (
            <div className="mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{rejectionReason}</p>
            </div>
          )}

          {uploaded && status === "pending" && (
            <p className="text-sm text-warning mb-3">{t("documents.pendingVerification")}</p>
          )}

          {uploaded && status === "verified" && (
            <p className="text-sm text-success mb-3">{t("documents.verifiedApproved")}</p>
          )}

          {!uploaded && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 me-2" />
                {file ? t("documents.changeFile") : t("documents.selectFile")}
              </Button>
              {file && (
                <Button
                  size="sm"
                  onClick={onUpload}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 me-2" />
                      {t("documents.upload")}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {(uploaded && status === "rejected") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 me-2" />
              {t("documents.reUpload")}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentUploadCard;