import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  ArrowRight,
  Loader2,
  User,
  Maximize2,
  X,
  MessageSquare,
  Mail,
  Calendar,
  Paperclip,
  CheckSquare,
  Save,
  Receipt,
  Plus,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  reconcile,
  triggerAction,
  uploadInvoice,
  uploadBankStatements,
  uploadFetchInvoices,
} from "./api/n8n";

const BookkeepingSaaS = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bankStatement, setBankStatement] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [emailInvoices, setEmailInvoices] = useState([]);
  const [matchingResults, setMatchingResults] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [expandedTableView, setExpandedTableView] = useState(false);
  const [transactionNotes, setTransactionNotes] = useState({});
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState({
    from: null,
    to: null,
    detected: false,
  });
  const [periodOption, setPeriodOption] = useState("detected");
  const [selectedEmails, setSelectedEmails] = useState({
    primary: true,
    secondary: false,
  });
  const [emailFetchStatus, setEmailFetchStatus] = useState({
    isActive: false,
    progress: 0,
    foundCount: 0,
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState("main"); // 'main' or 'profile'
  const [emailRequestSent, setEmailRequestSent] = useState(false);
  const [bankUploads, setBankUploads] = useState([]); // 已上传到Drive的记录
  const [bankUploading, setBankUploading] = useState(false);
  const [bankUploadError, setBankUploadError] = useState("");

  const [invoiceUploads, setInvoiceUploads] = useState([]); // 已上传到Drive的记录
  const [invoiceUploading, setInvoiceUploading] = useState(false);
  const [invoiceUploadError, setInvoiceUploadError] = useState("");

  // ---- helpers: format date & money (DD/MM/YYYY) ----
  const formatDate = (value) => {
    if (!value || value === "-") return "-";
    const s = String(value).trim();

    // ISO 2025-08-07 -> 07/08/2025
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split("-");
      return `${d}/${m}/${y}`;
    }

    // Already DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split("/");
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }

    // Fallback using Date
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }
    return s;
  };

  const formatMoney = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "£0.00";
    return `£${n.toFixed(2)}`;
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (!matchingResults || !matchingResults.matches) return;

    // Prepare data for export
    const exportData = matchingResults.matches.map((match) => ({
      Status: match.status?.charAt(0).toUpperCase() + match.status?.slice(1),
      "Vendor Name": match.vendorName || "-",
      "Invoice Number": match.invoiceNumber || "-",
      "Invoice Date": match.invoiceDate || "-",
      "Paid Date": match.paidDate,
      Subtotal: `£${match.subtotal}`,
      VAT: `£${match.vat}`,
      "Total Paid": `£${match.totalPaid}`,
      File: match.fileName || "Missing",
    }));

    // Create a new workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matching Results");

    // Add some styling to column widths
    const wscols = [
      { wch: 10 }, // Status
      { wch: 25 }, // Vendor Name
      { wch: 15 }, // Invoice Number
      { wch: 12 }, // Invoice Date
      { wch: 12 }, // Paid Date
      { wch: 12 }, // Subtotal
      { wch: 10 }, // VAT
      { wch: 12 }, // Total Paid
      { wch: 20 }, // File (reduced from 40)
      { wch: 15 }, // Action (new column)
    ];
    ws["!cols"] = wscols;

    // Generate Excel file and download
    XLSX.writeFile(
      wb,
      `BookkeepingMatches_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Note Dialog Component
  const NoteDialog = () => {
    const taRef = useRef(null);
    useEffect(() => {
      if (noteDialogOpen && taRef.current) {
        const el = taRef.current;
        el.focus({ preventScroll: true });
        const len = el.value.length;
        try {
          el.setSelectionRange(len, len);
        } catch {}
      }
    }, [noteDialogOpen, currentNoteId]);

    const close = () => {
      setNoteDialogOpen(false);
      setCurrentNoteId(null);
      setTempNoteText("");
    };

    const save = () => {
      const raw = taRef.current?.value ?? "";
      const text = raw.trim();
      const key = String(currentNoteId);

      setTransactionNotes((prev) => {
        const next = { ...prev };
        if (text) {
          next[key] = text;
        } else {
          delete next[key];
        }
        return next;
      });
      close();
    };

    const initialValue =
      transactionNotes?.[String(currentNoteId)] ?? tempNoteText ?? "";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {transactionNotes?.[String(currentNoteId)]
                ? "Edit Note"
                : "Add Note"}
            </h3>
            <button
              onClick={close}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <textarea
              ref={taRef}
              defaultValue={
                transactionNotes?.[String(currentNoteId)] ??
                (tempNoteText || "")
              }
              placeholder="Enter your note here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              data-gramm="false"
              data-enable-grammarly="false"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="border-t p-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setNoteDialogOpen(false);
                setCurrentNoteId(null);
                setTempNoteText("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Load Inter font
  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  // File upload handler
  const handleFileUpload = async (files, type) => {
    if (type === "invoices") {
      const list = Array.from(files || []);
      if (!list.length) return;

      setInvoices((prev) => [...prev, ...list]);

      setInvoiceUploadError("");
      setInvoiceUploading(true);

      try {
        const results = await uploadFetchInvoices(list, { sessionId });

        const newUploaded = results.map((r) => ({
          localName: r.file.name,
          size: r.file.size,
          type: r.file.type,
          ...(r.data?.stored || {}),
          raw: r.data,
        }));

        setInvoiceUploads((prev) => {
          const map = new Map(prev.map((x) => [x.localName, x]));
          for (const item of newUploaded) map.set(item.localName, item);
          return Array.from(map.values());
        });
      } catch (e) {
        setInvoiceUploadError(e?.message || "Invoice upload failed");
      } finally {
        setInvoiceUploading(false);
      }

      return;
    }

    if (type !== "bank") return;

    const list = Array.from(files || []);
    if (!list.length) return;

    setBankUploadError("");
    setBankUploading(true);

    try {
      // ✅ 真实上传到独立 bank webhook
      const results = await uploadBankStatements(list, { sessionId });

      // ✅ 统一成“可追踪的 uploaded records”，支持多次追加
      const newUploaded = results.map((r) => ({
        localName: r.file.name,
        size: r.file.size,
        type: r.file.type,
        ...(r.data?.stored || {}), // 期望包含 fileId/name/overwritten/modifiedTime 等
        raw: r.data,
      }));

      setBankUploads((prev) => [...prev, ...newUploaded]);

      // ✅ 兼容你现在 reconcile 仍用 bankStatement(File) 的实现：保留一个“当前选中的 statement”
      // 我建议：把“最后一次选择的最后一个文件”设为当前 statement（最符合用户预期）
      setBankStatement(list[list.length - 1]);
    } catch (e) {
      setBankUploadError(e?.message || "Bank upload failed");
    } finally {
      setBankUploading(false);
    }
  };

  /* ==== Actions helper: optimistic update + n8n call + rollback ==== */
  const runAction = async ({ type, targetId, note, fileName }) => {
    if (targetId === undefined || targetId === null) {
      alert("Action 缺少 targetId");
      return;
    }

    // 1) 备份当前状态，便于回滚
    const prevMatches = matchingResults
      ? JSON.parse(JSON.stringify(matchingResults))
      : null;
    const prevActions = JSON.parse(JSON.stringify(actionItems));

    // 2) 乐观更新 UI
    setMatchingResults((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => {
        if (m.id !== targetId) return m;
        if (type === "APPROVE_MATCH") return { ...m, status: "green" };
        if (type === "REJECT_MATCH")
          return {
            ...m,
            status: "red",
            fileName: null,
            invoiceNumber: null,
            invoiceDate: null,
          };
        if (type === "UPLOAD_INVOICE")
          return {
            ...m,
            fileName,
            status: m.status === "red" ? "green" : m.status,
          };
        return m;
      }),
    }));

    // 同步移除对应 action 卡片
    setActionItems((prev) => prev.filter((it) => it.id !== targetId));

    try {
      // 3) 真正调用 n8n
      const res = await triggerAction({ type, targetId, note, fileName });
      if (!res?.ok) throw new Error(res?.message || "Action 失败");
      // 可选：console.log("action ok", res.executionId);
    } catch (err) {
      // 4) 出错则回滚
      if (prevMatches) setMatchingResults(prevMatches);
      setActionItems(prevActions);
      alert(err?.message || String(err));
    }
  };

  // ============ 替换后的：用真实 webhook 的 processFiles ============
  const processFiles = async (allInvoices = []) => {
    setIsProcessing(true);
    try {
      // 只有在 adjust 时才传自定义期间
      const periodPayload =
        periodOption === "adjust"
          ? { from: selectedPeriod?.from, to: selectedPeriod?.to }
          : null;

      // 勾选的邮箱 → 数组
      const emailsPayload = [
        selectedEmails.primary ? "john.smith@company.com" : null,
        selectedEmails.secondary ? "accounts@company.com" : null,
      ].filter(Boolean);

      // 手动上传 + 邮箱抓取 合并
      const invoiceFiles = allInvoices.length
        ? allInvoices
        : [...invoices, ...emailInvoices];

      // 调用 n8n
      const data = await reconcile({
        bankFile: bankStatement,
        invoiceFiles,
        period: periodPayload,
        periodOption,
        emails: emailsPayload,
      });

      // 兼容不同返回结构
      const matches = data?.matches ?? data?.[0]?.matches ?? [];
      //.filter((m) => m.id >= 0 && m.id <= 25 // 只保留 ID 0-30 的记录，过滤掉测试数据);

      setSessionId(
        data?.sessionId || data?.executionId || data?.requestId || null,
      );

      setMatchingResults({ matches });

      // 黄色/红色生成 Action 卡片（若后端无 actions 字段）
      const derivedActions = matches
        .filter((m) => m.status === "yellow" || m.status === "red")
        .map((m) => ({
          id: m.id,
          type: m.status === "yellow" ? "review" : "missing",
          description:
            m.status === "yellow"
              ? `Partial match found - please verify invoice ${
                  m.invoiceNumber ?? "(N/A)"
                } from ${m.vendorName ?? "(Unknown)"}`
              : `Payee: ${m.vendorName ?? "(Unknown)"}\nPay Date: ${
                  m.paidDate ?? "(Unknown)"
                }\nAmount: £${m.totalPaid ?? "0.00"}`,
        }));

      setActionItems(
        Array.isArray(data?.actions) ? data.actions : derivedActions,
      );
      setCurrentStep(4);
    } catch (error) {
      console.error("Processing error:", error);
      alert(error?.message || String(error)); // 联调期直接 alert，方便看到 401/403/404/CORS 等
    } finally {
      setIsProcessing(false);
    }
  };
  // ================================================================

  // Step navigation
  const nextStep = () => {
    if (currentStep === 1 && bankUploads.length > 0 && !bankUploading) {
      // Simulate detecting period from bank statement
      const detectedFrom = new Date(2025, 7, 1); // August 1, 2025
      const detectedTo = new Date(2025, 7, 31); // August 31, 2025
      setSelectedPeriod({
        from: detectedFrom.toISOString().split("T")[0],
        to: detectedTo.toISOString().split("T")[0],
        detected: true,
      });
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Start email fetching when moving to step 3
      if (selectedEmails.primary || selectedEmails.secondary) {
        setEmailFetchStatus({
          isActive: true,
          progress: 0,
          foundCount: 0,
        });

        // Simulate email fetching progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          const foundCount = Math.floor(progress / 30);
          setEmailFetchStatus({
            isActive: progress < 100,
            progress: Math.min(progress, 100),
            foundCount: foundCount,
          });

          if (progress >= 100) {
            clearInterval(interval);
            // Auto-add found invoices to email invoices list (not manual invoices)
            const foundInvoices = Array.from(
              { length: 3 },
              (_, i) =>
                new File([`invoice${i}`], `Invoice_from_email_${i + 1}.pdf`, {
                  type: "application/pdf",
                }),
            );
            setEmailInvoices(foundInvoices);
          }
        }, 1000);
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Check if user has any invoices (manual or from email)
      const totalInvoices = invoices.length + emailInvoices.length;
      if (totalInvoices === 0) {
        setShowSkipModal(true);
      } else {
        // Combine all invoices for processing
        const allInvoices = [...invoices, ...emailInvoices];
        processFiles(allInvoices);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle skip confirmation
  const handleSkipInvoices = () => {
    setShowSkipModal(false);
    setIsProcessing(true);
    // Process with bank statement only after a short delay
    setTimeout(() => {
      processFiles();
    }, 100);
  };

  const prevStep = () => setCurrentStep(currentStep - 1);

  // Progress indicator
  const ProgressBar = () => {
    const steps = [
      { id: 1, verb: "Upload", desc: "Statement", icon: FileText },
      { id: 2, verb: "Select", desc: "Period", icon: Calendar },
      { id: 3, verb: "Fetch", desc: "Invoice", icon: Receipt },
      { id: 4, verb: "Verify", desc: "Transaction", icon: CheckSquare },
      { id: 5, verb: "Download", desc: "Package", icon: Save },
    ];

    return (
      <div className="w-full max-w-3xl mx-auto mb-8">
        <div className="flex justify-between items-center relative">
          {/* Progress line */}
          <div
            className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"
            style={{ left: "5%", right: "5%" }}
          />
          <div
            className="absolute top-6 left-0 h-0.5 bg-blue-600 transition-all duration-300"
            style={{
              left: "5%",
              width: `${Math.max(0, (currentStep - 1) * 22.5)}%`,
            }}
          />

          {/* Steps */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div key={step.id} className="flex flex-col items-center z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-blue-600"
                      : isCurrent
                        ? "bg-white border-2 border-blue-600 shadow-sm"
                        : "bg-white border-2 border-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <Icon
                      className={`w-6 h-6 ${
                        isCurrent ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div className="mt-1 text-center">
                  <span
                    className={`text-xs font-medium block leading-tight ${
                      isCompleted || isCurrent
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.verb}
                  </span>
                  <span
                    className={`text-xs leading-tight ${
                      isCompleted || isCurrent
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // File upload component
  const FileUploadArea = ({ type, accept, multiple = false }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
      <input
        type="file"
        id={`file-${type}`}
        accept={accept}
        multiple={multiple}
        onChange={async (e) => {
          await handleFileUpload(e.target.files, type);
          e.target.value = "";
        }}
        className="hidden"
      />
      <label htmlFor={`file-${type}`} className="cursor-pointer">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">
          {type === "bank"
            ? "Upload Bank Statement"
            : "Upload Invoices (Recommended)"}
        </p>
        <p className="text-sm text-gray-500">
          {type === "bank" ? "PDF, CSV, or Excel file" : "PDF, JPG, JPEG, PNG"}
        </p>
        <div className="h-6 mt-4">
          {type === "bank" && bankStatement && (
            <p className="text-green-600 font-medium">{bankStatement.name}</p>
          )}
          {type === "invoices" && invoiceUploads.length > 0 && (
            <p className="text-green-600 font-medium">
              {invoiceUploads.length} files uploaded
            </p>
          )}
          {type === "invoices" && invoiceUploadError && (
            <p className="text-red-600 font-medium">{invoiceUploadError}</p>
          )}
        </div>
      </label>
    </div>
  );

  // Matching results table
  const MatchingTable = ({ expanded = false }) => {
    const [uploadedFiles, setUploadedFiles] = useState({});

    // Handle invoice upload directly from table
    const handleTableInvoiceUpload = (matchId, vendorName) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.jpg,.jpeg,.png";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // 乐观更新
        const prev = matchingResults;
        setMatchingResults((prevResults) => ({
          ...prevResults,
          matches: prevResults.matches.map((m) =>
            m.id === matchId
              ? { ...m, status: "green", fileName: file.name }
              : m,
          ),
        }));
        setActionItems((prevItems) =>
          prevItems.filter((it) => it.id !== matchId),
        );
        try {
          const uploadRes = await uploadInvoice({
            file,
            sessionId,
            transactionId: matchId,
          });

          const storedName = uploadRes?.stored?.name || file.name;
          // const storedFileId = uploadRes?.stored?.fileId || null; // 可选：你后端 action 支持的话再传

          await runAction({
            type: "UPLOAD_INVOICE",
            targetId: matchId,
            fileName: storedName,
          });
          setUploadedFiles((p) => ({ ...p, [matchId]: file.name }));
        } catch (err) {
          // 回滚并提示
          setMatchingResults(prev);
          alert(err?.message || String(err));
        }
      };
      input.click();
    };

    return (
      <div className="overflow-x-auto">
        <div
          className={`overflow-y-auto border border-gray-200 rounded-lg ${
            expanded ? "" : "max-h-96"
          }`}
          style={expanded ? { maxHeight: "calc(100vh - 200px)" } : {}}
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="border-b border-gray-200 p-3 text-left">
                  Status
                </th>
                <th className="border-b border-gray-200 p-3 text-left">
                  Vendor Name
                </th>
                <th className="border-b border-gray-200 p-3 text-left">
                  Invoice Number
                </th>
                <th className="border-b border-gray-200 p-3 text-left">
                  Invoice Date
                </th>
                <th className="border-b border-gray-200 p-3 text-left">
                  Paid Date
                </th>
                <th className="border-b border-gray-200 p-3 text-left">
                  Subtotal
                </th>
                <th className="border-b border-gray-200 p-3 text-left">VAT</th>
                <th className="border-b border-gray-200 p-3 text-left">
                  Total Paid
                </th>
                <th className="border-b border-gray-200 p-3 text-left">File</th>
                <th className="border-b border-gray-200 p-3 text-left">
                  Action
                </th>
                <th className="border-b border-gray-200 p-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {matchingResults?.matches.map((match) => (
                <tr
                  key={match.id}
                  className={`
                    ${
                      match.status === "green"
                        ? "bg-green-50 hover:bg-green-100"
                        : match.status === "yellow"
                          ? "bg-yellow-50 hover:bg-yellow-100"
                          : "bg-red-50 hover:bg-red-100"
                    }
                  `}
                >
                  <td className="border-b border-gray-200 p-3">
                    <div className="flex justify-center">
                      {match.status === "green" && (
                        <svg
                          className="w-5 h-5 text-green-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {match.status === "yellow" && (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      {match.status === "red" && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    {match.vendorName || "-"}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    {match.invoiceNumber || "-"}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    {match.invoiceDate || "-"}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    {match.paidDate}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    £{match.subtotal}
                  </td>
                  <td className="border-b border-gray-200 p-3">£{match.vat}</td>
                  <td className="border-b border-gray-200 p-3 font-medium">
                    £{match.totalPaid}
                  </td>
                  <td className="border-b border-gray-200 p-3 text-sm">
                    {match.fileName ? (
                      <button
                        className="truncate block max-w-[80px] text-blue-600 hover:underline cursor-pointer"
                        title={match.fileName}
                        onClick={() =>
                          alert(
                            "In a real app, this would open a file preview for: " +
                              match.fileName,
                          )
                        }
                      >
                        {match.fileName.length > 10
                          ? match.fileName.substring(0, 10) + "..."
                          : match.fileName}
                      </button>
                    ) : (
                      <span className="text-gray-400">Missing</span>
                    )}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    {match.status === "red" ? (
                      <button
                        onClick={() =>
                          handleTableInvoiceUpload(match.id, match.vendorName)
                        }
                        className="px-3 py-1 bg-white border border-blue-600 text-blue-600 rounded text-xs hover:bg-blue-50"
                      >
                        Upload
                      </button>
                    ) : match.status === "yellow" ? (
                      <button
                        onClick={() => {
                          setSelectedReviewItem(match);
                          setShowReviewDialog(true);
                        }}
                        className="px-3 py-1 bg-white border border-blue-600 text-blue-600 rounded text-xs hover:bg-blue-50"
                      >
                        Review
                      </button>
                    ) : (
                      <span></span>
                    )}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    {transactionNotes?.[String(match.id)] ? (
                      <button
                        onClick={() => {
                          setCurrentNoteId(match.id);
                          setTempNoteText(
                            transactionNotes?.[String(match.id)] || "",
                          );
                          setNoteDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title={transactionNotes?.[String(match.id)]}
                      >
                        <MessageSquare className="w-4 h-4 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentNoteId(match.id);
                          setTempNoteText("");
                          setNoteDialogOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Add note"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Action cards
  const ActionCard = ({ item, onResolve }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (showMenu && !e.target.closest(".action-menu")) {
          setShowMenu(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, [showMenu]);

    // Handle invoice upload for this specific transaction
    const handleInvoiceUpload = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.jpg,.jpeg,.png";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const uploadRes = await uploadInvoice({
            file,
            sessionId,
            transactionId: item.id,
          });

          const storedName = uploadRes?.stored?.name || file.name;
          const storedFileId = uploadRes?.stored?.fileId || null; // 可选：你后端 action 支持的话再传

          await runAction({
            type: "UPLOAD_INVOICE",
            targetId: item.id,
            fileName: storedName,
            ...(storedFileId ? { fileId: storedFileId } : {}),
          });
        } catch (err) {
          alert(err?.message || String(err));
        } finally {
          input.value = "";
        }
      };
      input.click();
    };

    return (
      <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-medium mb-2
              ${
                item.type === "review"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.type === "review" ? "Review Required" : "Missing Invoice"}
            </span>
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
              {item.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 relative justify-end">
          <button
            onClick={item.type === "missing" ? handleInvoiceUpload : undefined}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 min-w-[140px]"
          >
            {item.type === "review" ? "See Detail" : "Upload Invoice"}
          </button>
          <div className="action-menu relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="2" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="14" r="1.5" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {item.type === "missing" ? (
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                    See Detail
                  </button>
                ) : (
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                    Approve
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Skip Modal Component
  const SkipModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-center mb-2">
          No Invoices Uploaded
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Would you like to proceed without invoices? You can still match bank
          transactions, but some items may require manual review.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowSkipModal(false);
              document.getElementById("file-invoices").click();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload
          </button>
          <button
            onClick={handleSkipInvoices}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Continue Without Invoices
          </button>
        </div>
      </div>
    </div>
  );

  // Review Dialog Component（后端驱动版）
  const ReviewDialog = () => {
    if (!selectedReviewItem) return null;

    const match = selectedReviewItem;

    // 后端返回的结构：invoiceDetails[] / bankDetails[]
    const invoiceDetails = Array.isArray(match.invoiceDetails)
      ? match.invoiceDetails
      : [];
    const bankDetails = Array.isArray(match.bankDetails)
      ? match.bankDetails
      : [];

    const mainInvoice = invoiceDetails[0] || null;
    const mainBank = bankDetails[0] || null;

    // 金额汇总：所有 invoiceDetails 的 total（退一步用 subtotal）
    const invoiceTotal = invoiceDetails.reduce((sum, inv) => {
      const v = Number(inv.total ?? inv.subtotal ?? match.totalPaid ?? 0) || 0;
      return sum + v;
    }, 0);

    const bankAmount = Number(mainBank?.amount ?? match.totalPaid ?? 0) || 0;

    const hasInvoices = invoiceDetails.length > 0;
    const hasBank = !!mainBank;

    const amountDiff =
      hasInvoices && hasBank ? Math.abs(bankAmount - invoiceTotal) : null;
    const percentDiff =
      hasInvoices && hasBank && invoiceTotal !== 0
        ? (amountDiff / invoiceTotal) * 100
        : null;

    // 备注
    const [noteText, setNoteText] = useState(
      transactionNotes?.[String(match.id)] || "",
    );

    // reasons -> 文案
    const reasonLabels = {
      missingBank: "No matching bank transaction was found for this invoice.",
      missingInvoice: "No invoice was found for this bank transaction.",
      amountDiff: "Invoice total and bank amount do not match.",
      dateMismatch:
        "Payment date and invoice date differ beyond the allowed window.",
      vendorMismatch:
        "Vendor in invoice and bank description differ significantly.",
      multiInvoice: "This bank payment appears to cover multiple invoices.",
      // 其它未知 reason 直接展示原始 key
    };

    const reasonMessages = (match.reasons || []).map(
      (r) => reasonLabels[r] || r,
    );

    // 标题行：根据 status 粗略提示
    const headerText =
      match.status === "green"
        ? "Match looks good"
        : match.status === "red"
          ? "Unmatched transaction - review required"
          : "Partial match found - review required";

    // UI 渲染
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Review Transaction</h2>
            <button
              onClick={() => {
                setShowReviewDialog(false);
                setSelectedReviewItem(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Warning Header */}
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{headerText}</span>
            </div>

            {/* Side by Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Bank Transaction */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-center">
                  Bank Transaction
                </h3>

                {hasBank ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Payee:</span>
                      <div className="font-medium">
                        {mainBank.vendor ||
                          mainBank.description ||
                          match.vendorName ||
                          "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <div className="font-medium">
                        {formatMoney(mainBank.amount)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <div className="font-medium">
                        {formatDate(mainBank.paidDate || match.paidDate)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Reference:</span>
                      <div className="font-medium">{mainBank.ref || "-"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 text-center py-4">
                    No bank transaction is currently linked to this match.
                  </div>
                )}
              </div>

              {/* Invoice Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-center">
                  Invoice{invoiceDetails.length > 1 ? "s" : ""} Total
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Vendor:</span>
                    <div className="font-medium">
                      {mainInvoice?.vendor || match.vendorName || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <div className="font-medium">
                      {formatMoney(
                        hasInvoices ? invoiceTotal : match.totalPaid,
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Invoice Count:</span>
                    <div className="font-medium">{invoiceDetails.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Range:</span>
                    <div className="font-medium">
                      {invoiceDetails.length === 0 && "-"}
                      {invoiceDetails.length === 1 &&
                        formatDate(
                          mainInvoice?.invoiceDate || match.invoiceDate,
                        )}
                      {invoiceDetails.length > 1 &&
                        (() => {
                          const dates = invoiceDetails
                            .map((inv) => inv.invoiceDate)
                            .filter(Boolean);
                          if (!dates.length) return "-";
                          const sorted = [...dates].sort();
                          return `${formatDate(sorted[0])} - ${formatDate(
                            sorted[sorted.length - 1],
                          )}`;
                        })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discrepancies */}
            {reasonMessages.length > 0 && (
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Discrepancies Found:
                </h3>
                <ul className="space-y-1 text-sm ml-6">
                  {reasonMessages.map((msg, idx) => (
                    <li key={idx}>• {msg}</li>
                  ))}
                  {amountDiff !== null && (
                    <li>
                      • Amount difference: {formatMoney(amountDiff)}{" "}
                      {percentDiff !== null &&
                        `(${percentDiff.toFixed(1)}% variance)`}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Invoice List */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Invoices ({invoiceDetails.length})
                </h3>
              </div>
              <div className="space-y-2">
                {invoiceDetails.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No invoice is currently linked to this transaction.
                  </div>
                )}
                {invoiceDetails.map((inv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">
                          Invoice #{inv.invoiceNumber || match.invoiceNumber}
                        </div>
                        <div className="text-gray-600">
                          {(inv.vendor || match.vendorName || "-") +
                            " - " +
                            formatMoney(
                              inv.total ?? inv.subtotal ?? match.totalPaid,
                            )}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatDate(inv.invoiceDate || match.invoiceDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {invoiceDetails.length > 0 && (
                  <div className="border-t pt-2 mt-2 flex justify-between text-sm font-medium">
                    <span>Total:</span>
                    <span>{formatMoney(invoiceTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add Note */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add Note (optional):
              </label>
              <textarea
                className="w-full border rounded-lg p-2 text-sm"
                rows={2}
                placeholder="Add any explanation for this match..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {/* Reject */}
              <button
                onClick={async () => {
                  await runAction({
                    type: "REJECT_MATCH",
                    targetId: match.id,
                    note: noteText.trim() || undefined,
                  });
                  setShowReviewDialog(false);
                  setSelectedReviewItem(null);
                  if (noteText.trim()) {
                    setTransactionNotes((prev) => ({
                      ...prev,
                      [String(match.id)]: noteText.trim(),
                    }));
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reject
              </button>

              {/* Approve */}
              <button
                onClick={async () => {
                  await runAction({
                    type: "APPROVE_MATCH",
                    targetId: match.id,
                    note: noteText.trim() || undefined,
                  });
                  setShowReviewDialog(false);
                  setSelectedReviewItem(null);
                  if (noteText.trim()) {
                    setTransactionNotes((prev) => ({
                      ...prev,
                      [String(match.id)]: noteText.trim(),
                    }));
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profile Page Component
  const ProfilePage = () => {
    const connectedEmails = [
      { email: "john.smith@company.com", isPrimary: true },
      { email: "accounts@company.com", isPrimary: false },
    ];
    const [hoveredEmail, setHoveredEmail] = useState(null);

    const handleAddEmailRequest = () => {
      setEmailRequestSent(true);
    };

    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Back to Main */}
        <button
          onClick={() => setCurrentPage("main")}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md">
          {/* Business Info Section */}
          <div className="p-6">
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                Business Name:{" "}
                <span className="text-gray-900 font-medium">
                  Smith & Associates Ltd
                </span>
              </p>
              <p className="text-gray-600">
                Primary Email:{" "}
                <span className="text-gray-900 font-medium">
                  john.smith@company.com
                </span>
              </p>
            </div>
          </div>

          {/* Email Accounts Section */}
          <div className="px-6 pb-6">
            <h3 className="text-base font-semibold mb-4">Connected Emails</h3>
            <div className="space-y-1 mb-4">
              {connectedEmails.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-1"
                  onMouseEnter={() => setHoveredEmail(index)}
                  onMouseLeave={() => setHoveredEmail(null)}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{account.email}</span>
                    {account.isPrimary && hoveredEmail === index && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {emailRequestSent ? (
              <p className="text-sm text-gray-400">
                You will be contacted shortly
              </p>
            ) : (
              <button
                onClick={handleAddEmailRequest}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                Add Email Account
              </button>
            )}
          </div>

          {/* Reconciliation Status Section */}
          <div className="p-6 border-t">
            <h3 className="text-base font-semibold mb-4">
              Reconciliation Status
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Last reconciled:</span>
                <span className="ml-2 text-gray-900 tabular-nums">
                  October 2024 (completed November 18)
                </span>
              </div>
              <div>
                <span className="text-gray-600">Current position:</span>
                <span className="ml-2 text-gray-900">
                  Ready for November 2024
                </span>
              </div>
              <div>
                <span className="text-gray-600">Suggested action:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  Reconcile November by{" "}
                  <span className="tabular-nums">December 15</span>
                </span>
              </div>
              <div>
                <span className="text-gray-600">Next deadline:</span>
                <span className="ml-2 text-gray-900">
                  Q4 filing -{" "}
                  <span className="tabular-nums">January 31, 2025</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 px-4 py-1">
              <h1 className="text-lg font-semibold text-white">GID</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative user-menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 border-2 border-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setCurrentPage("profile");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      alert("Sign out functionality would be triggered here");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentPage === "profile" ? (
        <ProfilePage />
      ) : (
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            <ProgressBar />

            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Step 1: Bank Statement Upload */}
              {currentStep === 1 && (
                <div>
                  <FileUploadArea
                    type="bank"
                    accept=".pdf,.csv,.xlsx,.xls"
                    multiple
                  />

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={nextStep}
                      disabled={bankUploading || bankUploads.length === 0}
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                        bankUploading || bankUploads.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {bankUploading ? (
                        <>
                          Upload to Continue <ArrowRight className="w-4 h-4" />
                        </>
                      ) : bankUploads.length === 0 ? (
                        <>
                          Upload to Continue <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Next <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Period Selection */}
              {currentStep === 2 && (
                <div>
                  {selectedPeriod.detected && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800 mb-1">
                        Detected period:
                      </p>
                      <p className="text-lg font-semibold text-blue-900">
                        {new Date(selectedPeriod.from).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}{" "}
                        -{" "}
                        {new Date(selectedPeriod.to).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={periodOption === "adjust"}
                        onChange={(e) =>
                          setPeriodOption(
                            ((checked) => {
                              const next = e.target.checked
                                ? "adjust"
                                : "detected";
                              if (next === "adjust") {
                                setSelectedPeriod((prev) => ({
                                  ...prev,
                                  from: prev.from || selectedPeriod.from,
                                  to: prev.to || selectedPeriod.to,
                                }));
                              }
                              return next;
                            })(),
                          )
                        }
                      />
                      <span className="text-sm">
                        Adjust period for invoice search
                      </span>
                    </label>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 block mb-1">
                          From:
                        </label>
                        <input
                          type="date"
                          value={selectedPeriod.from || ""}
                          disabled={periodOption !== "adjust"}
                          onChange={(e) =>
                            setSelectedPeriod((prev) => ({
                              ...prev,
                              from: e.target.value,
                            }))
                          }
                          className={`w-full border rounded px-3 py-1 text-sm ${
                            periodOption !== "adjust"
                              ? "bg-gray-100 text-gray-500"
                              : ""
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 block mb-1">
                          To:
                        </label>
                        <input
                          type="date"
                          value={selectedPeriod.to || ""}
                          disabled={periodOption !== "adjust"}
                          onChange={(e) =>
                            setSelectedPeriod((prev) => ({
                              ...prev,
                              to: e.target.value,
                            }))
                          }
                          className={`w-full border rounded px-3 py-1 text-sm ${
                            periodOption !== "adjust"
                              ? "bg-gray-100 text-gray-500"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Search From</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedEmails.primary}
                          onChange={(e) =>
                            setSelectedEmails({
                              ...selectedEmails,
                              primary: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm">john.smith@company.com</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedEmails.secondary}
                          onChange={(e) =>
                            setSelectedEmails({
                              ...selectedEmails,
                              secondary: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm">accounts@company.com</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={
                        !selectedEmails.primary && !selectedEmails.secondary
                      }
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                        !selectedEmails.primary && !selectedEmails.secondary
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {!selectedEmails.primary && !selectedEmails.secondary ? (
                        <>Select Email</>
                      ) : (
                        <>
                          Start Fetching <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Invoice Upload */}
              {currentStep === 3 && (
                <div>
                  {/* Email Fetching Progress Banner */}
                  {emailFetchStatus.isActive && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 mb-2">
                            Searching emails for invoices...
                          </p>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 bg-blue-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-full transition-all duration-500"
                                style={{
                                  width: `${emailFetchStatus.progress}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-blue-700 font-medium">
                              {emailFetchStatus.progress}%
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            {emailFetchStatus.foundCount > 0
                              ? `Found ${emailFetchStatus.foundCount} invoice${
                                  emailFetchStatus.foundCount > 1 ? "s" : ""
                                } so far`
                              : "Searching..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Fetch Complete Message */}
                  {!emailFetchStatus.isActive &&
                    emailFetchStatus.progress === 100 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-green-900 mb-2">
                              Email search complete!
                            </p>
                            <div className="h-2 mb-2"></div>
                            <p className="text-sm text-green-700">
                              {emailFetchStatus.foundCount} invoices from your
                              emails found.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  <FileUploadArea
                    type="invoices"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                  />
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={isProcessing || emailFetchStatus.isActive}
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                        isProcessing || emailFetchStatus.isActive
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : emailFetchStatus.isActive ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Please wait...
                        </>
                      ) : (
                        <>
                          Next <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Matching Results */}
              {currentStep === 4 && matchingResults && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-green-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">
                            {
                              matchingResults.matches.filter(
                                (m) => m.status === "green",
                              ).length
                            }
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">
                            {
                              matchingResults.matches.filter(
                                (m) => m.status === "yellow",
                              ).length
                            }
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium">
                            {
                              matchingResults.matches.filter(
                                (m) => m.status === "red",
                              ).length
                            }
                          </span>
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        ~
                        {Math.ceil(
                          matchingResults.matches.filter(
                            (m) => m.status === "yellow",
                          ).length *
                            5 +
                            matchingResults.matches.filter(
                              (m) => m.status === "red",
                            ).length *
                              3,
                        )}{" "}
                        mins to complete
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedTableView(true)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Maximize2 className="w-4 h-4" />
                        Expand View
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export to Excel
                      </button>
                    </div>
                  </div>
                  <MatchingTable />
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={
                        !matchingResults.matches.every(
                          (m) => m.status === "green",
                        )
                      }
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                        matchingResults.matches.every(
                          (m) => m.status === "green",
                        )
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Finish <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Download Package */}
              {currentStep === 5 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <button className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto">
                    <Download className="w-5 h-5" />
                    Download Complete Package
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="mt-4 text-blue-600 hover:underline block mx-auto"
                  >
                    Start New Session
                  </button>
                </div>
              )}

              {/* Skip Modal */}
              {showSkipModal && <SkipModal />}

              {/* Review Dialog */}
              {showReviewDialog && <ReviewDialog />}

              {/* Note Dialog */}
              {noteDialogOpen && <NoteDialog />}

              {/* Expanded Table View */}
              {expandedTableView && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                  <div className="bg-white h-full w-full flex flex-col">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-green-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium">
                              {
                                matchingResults.matches.filter(
                                  (m) => m.status === "green",
                                ).length
                              }
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">
                              {
                                matchingResults.matches.filter(
                                  (m) => m.status === "yellow",
                                ).length
                              }
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="font-medium">
                              {
                                matchingResults.matches.filter(
                                  (m) => m.status === "red",
                                ).length
                              }
                            </span>
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ~
                          {Math.ceil(
                            matchingResults.matches.filter(
                              (m) => m.status === "yellow",
                            ).length *
                              5 +
                              matchingResults.matches.filter(
                                (m) => m.status === "red",
                              ).length *
                                3,
                          )}{" "}
                          mins to complete
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={exportToExcel}
                          className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export to Excel
                        </button>
                        <button
                          onClick={() => setExpandedTableView(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Close
                        </button>
                      </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 p-6 overflow-auto">
                      <div className="min-w-fit">
                        <MatchingTable expanded={true} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total: {matchingResults.matches.length} transactions
                      </span>
                      <button
                        onClick={() => {
                          setExpandedTableView(false);
                          nextStep();
                        }}
                        disabled={
                          !matchingResults.matches.every(
                            (m) => m.status === "green",
                          )
                        }
                        className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                          matchingResults.matches.every(
                            (m) => m.status === "green",
                          )
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Finish <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookkeepingSaaS;
