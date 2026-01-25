import React, { useState, useEffect } from "react";

// Icon components using SVG
const Upload = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const FileText = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const XCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
  </svg>
);

const Download = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

const Loader2 = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const User = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const Maximize2 = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
    />
  </svg>
);

const X = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const MessageSquare = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const BookkeepingSaaS = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bankStatement, setBankStatement] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [matchingResults, setMatchingResults] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [expandedTableView, setExpandedTableView] = useState(false);
  const [transactionNotes, setTransactionNotes] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState({
    from: null,
    to: null,
    detected: false,
  });
  const [periodOption, setPeriodOption] = useState("detected");

  // Export to Excel function (using download simulation)
  const exportToExcel = () => {
    if (!matchingResults || !matchingResults.matches) return;

    // Create CSV content
    const headers = [
      "Status",
      "Vendor Name",
      "Invoice Number",
      "Invoice Date",
      "Paid Date",
      "Subtotal",
      "VAT",
      "Total Paid",
      "File",
    ];
    const csvContent = [
      headers.join(","),
      ...matchingResults.matches.map((match) =>
        [
          match.status.charAt(0).toUpperCase() + match.status.slice(1),
          `"${match.vendorName || "-"}"`,
          match.invoiceNumber || "-",
          match.invoiceDate || "-",
          match.paidDate,
          `£${match.subtotal}`,
          `£${match.vat}`,
          `£${match.totalPaid}`,
          `"${match.fileName || "Missing"}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `BookkeepingMatches_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File upload handler
  const handleFileUpload = (files, type) => {
    if (type === "bank") {
      setBankStatement(files[0]);
    } else if (type === "invoices") {
      setInvoices(Array.from(files));
    }
  };

  // Process files with n8n webhook API call
  const processFiles = async () => {
    setIsProcessing(true);
    try {
      // Prepare form data for file upload
      const formData = new FormData();

      // Add bank statement file
      if (bankStatement) {
        formData.append("bankStatement", bankStatement);
      }

      // Add invoice files
      invoices.forEach((invoice, index) => {
        formData.append(`invoice_${index}`, invoice);
      });

      // Add period information
      formData.append("periodFrom", selectedPeriod.from);
      formData.append("periodTo", selectedPeriod.to);
      formData.append("periodOption", periodOption);

      // Replace with your actual n8n webhook URL
      const N8N_WEBHOOK_URL =
        "https://yanchen07ty.app.n8n.cloud/webhook-test/bookkeepingTest";

      // Make API call to n8n webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type header for FormData - browser will set it automatically with boundary
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const backendData = await response.json();

      // Extract matches from response (adjust based on your n8n response structure)
      const matches = backendData.matches || backendData[0]?.matches || [];

      setMatchingResults({ matches });

      // Create action items for yellow and red statuses
      const actionItems = matches
        .filter((m) => m.status === "yellow" || m.status === "red")
        .map((match) => ({
          id: match.id,
          type: match.status === "yellow" ? "review" : "missing",
          description:
            match.status === "yellow"
              ? `Invoice has no bank match - verify ${match.invoiceNumber} from ${match.vendorName}`
              : `Payee: ${match.vendorName}\nPay Date: ${match.paidDate}\nAmount: £${match.totalPaid}`,
        }));

      setActionItems(actionItems);
      setIsProcessing(false);
      setCurrentStep(4);
    } catch (error) {
      console.error("Processing error:", error);
      setIsProcessing(false);

      // Show user-friendly error message
      alert(
        `Processing failed: ${error.message}\nPlease check your files and try again.`
      );
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep === 1 && bankStatement) {
      // Simulate detecting period from bank statement
      const detectedFrom = new Date(2025, 7, 1); // August 1, 2025
      const detectedTo = new Date(2025, 7, 31); // August 31, 2025
      setSelectedPeriod({
        from: detectedFrom.toISOString().split("T")[0],
        to: detectedTo.toISOString().split("T")[0],
        detected: true,
      });
      setCurrentStep(2);
    } else if (currentStep === 3) {
      if (invoices.length === 0) {
        setShowSkipModal(true);
      } else {
        processFiles();
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
      { id: 1, verb: "Upload" },
      { id: 2, verb: "Period" },
      { id: 3, verb: "Add" },
      { id: 4, verb: "Review" },
      { id: 5, verb: "Download" },
    ];

    return (
      <div className="w-full max-w-3xl mx-auto mb-8">
        <div className="flex justify-between items-center relative">
          {/* Progress line */}
          <div
            className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"
            style={{ left: "10%", right: "10%" }}
          />
          <div
            className="absolute top-6 left-0 h-0.5 bg-blue-600 transition-all duration-300"
            style={{
              left: "10%",
              width: `${Math.max(0, (currentStep - 1) * 20)}%`,
            }}
          />

          {/* Steps */}
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <span
                className={`text-xs font-medium mb-1 ${
                  currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.verb}
              </span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep > step.id
                    ? "bg-blue-600 text-white"
                    : currentStep === step.id
                    ? "bg-white border-2 border-blue-600 text-blue-600 shadow-sm"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step.id ? (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
            </div>
          ))}
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
        onChange={(e) => handleFileUpload(e.target.files, type)}
        className="hidden"
      />
      <label htmlFor={`file-${type}`} className="cursor-pointer">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">
          {type === "bank" ? "Upload Bank Statement" : "Upload Invoices"}
        </p>
        <p className="text-sm text-gray-500">
          {type === "bank"
            ? "PDF, CSV, or Excel file"
            : "Multiple files allowed (PDF, images)"}
        </p>
        <div className="h-6 mt-4">
          {type === "bank" && bankStatement && (
            <p className="text-green-600 font-medium">{bankStatement.name}</p>
          )}
          {type === "invoices" && invoices.length > 0 && (
            <p className="text-green-600 font-medium">
              {invoices.length} files uploaded
            </p>
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
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Store the uploaded file name
          setUploadedFiles((prev) => ({
            ...prev,
            [matchId]: file.name,
          }));

          // In a real app, this would validate the invoice against the transaction
          alert(
            `Invoice uploaded for ${vendorName}\nFile: ${file.name}\n\nIn a real system, this would now validate the invoice data and update the match status.`
          );

          // Update the match status to green after a brief delay (simulating validation)
          setTimeout(() => {
            setMatchingResults((prevResults) => ({
              ...prevResults,
              matches: prevResults.matches.map((match) =>
                match.id === matchId
                  ? {
                      ...match,
                      status: "green",
                      fileName: file.name,
                      invoiceNumber: `INV-${100000 + matchId}`,
                      invoiceDate: new Date().toLocaleDateString("en-GB"),
                    }
                  : match
              ),
            }));

            // Also update action items to remove this resolved item
            setActionItems((prevItems) =>
              prevItems.filter((item) => item.id !== matchId)
            );
          }, 1500);
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
                        <CheckCircle className="w-5 h-5 text-green-600" />
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
                              match.fileName
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
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Upload Invoice
                      </button>
                    ) : match.status === "yellow" ? (
                      <button
                        onClick={() => {
                          setSelectedReviewItem(match);
                          setShowReviewDialog(true);
                        }}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                      >
                        Review
                      </button>
                    ) : (
                      <span></span>
                    )}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    {transactionNotes[match.id] ? (
                      <button
                        onClick={() => {
                          const newNote = prompt(
                            "Edit note:",
                            transactionNotes[match.id]
                          );
                          if (newNote !== null) {
                            setTransactionNotes((prev) => ({
                              ...prev,
                              [match.id]: newNote,
                            }));
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title={transactionNotes[match.id]}
                      >
                        <MessageSquare className="w-4 h-4 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const newNote = prompt("Add note:");
                          if (newNote) {
                            setTransactionNotes((prev) => ({
                              ...prev,
                              [match.id]: newNote,
                            }));
                          }
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

  // Review Dialog Component
  const ReviewDialog = () => {
    if (!selectedReviewItem) return null;

    const [invoices, setInvoices] = useState([
      {
        id: 1,
        number: selectedReviewItem.invoiceNumber,
        vendor: selectedReviewItem.vendorName,
        amount: (parseFloat(selectedReviewItem.totalPaid) - 3.5).toFixed(2),
      },
    ]);

    const [noteText, setNoteText] = useState(
      transactionNotes[selectedReviewItem.id] || ""
    );

    // Add invoice handler
    const handleAddInvoice = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.jpg,.jpeg,.png";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const newInvoice = {
            id: Date.now(),
            number: `INV-${Math.floor(Math.random() * 100000)}`,
            vendor: selectedReviewItem.vendorName,
            amount: (Math.random() * 500).toFixed(2),
            fileName: file.name,
          };
          setInvoices([...invoices, newInvoice]);
        }
      };
      input.click();
    };

    // Remove invoice handler
    const handleRemoveInvoice = (id) => {
      setInvoices(invoices.filter((inv) => inv.id !== id));
    };

    // Calculate totals
    const totalInvoiceAmount = invoices
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
      .toFixed(2);
    const bankAmount = parseFloat(selectedReviewItem.totalPaid);
    const amountDiff = Math.abs(bankAmount - totalInvoiceAmount);
    const percentDiff = ((amountDiff / totalInvoiceAmount) * 100).toFixed(1);

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
              <span className="font-medium">
                Partial Match Found - Review Required
              </span>
            </div>

            {/* Side by Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Bank Transaction */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-center">
                  Bank Transaction
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Payee:</span>
                    <div className="font-medium">
                      {selectedReviewItem.vendorName
                        .toUpperCase()
                        .substring(0, 15) + " PMT"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <div className="font-medium">
                      £{selectedReviewItem.totalPaid}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-medium">
                      {selectedReviewItem.paidDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Reference:</span>
                    <div className="font-medium">
                      PMT-{Math.floor(Math.random() * 9000000) + 1000000}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-center">
                  Invoice{invoices.length > 1 ? "s" : ""} Total
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Vendor:</span>
                    <div className="font-medium">
                      {selectedReviewItem.vendorName}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <div className="font-medium">£{totalInvoiceAmount}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Invoice Count:</span>
                    <div className="font-medium">{invoices.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Range:</span>
                    <div className="font-medium">
                      {selectedReviewItem.invoiceDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discrepancies */}
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                Discrepancies Found:
              </h3>
              <ul className="space-y-1 text-sm ml-6">
                <li>
                  • Amount difference: £{amountDiff.toFixed(2)} ({percentDiff}%
                  variance)
                </li>
                <li>• Payment date differs from invoice date</li>
                <li>• Vendor name variation in bank statement</li>
              </ul>
            </div>

            {/* Invoice List */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Invoices ({invoices.length})
                </h3>
                <button
                  onClick={handleAddInvoice}
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" />
                  Add Invoice
                </button>
              </div>
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">
                          Invoice #{invoice.number}
                        </div>
                        <div className="text-gray-600">
                          {invoice.vendor} - £{invoice.amount}
                        </div>
                      </div>
                    </div>
                    {invoices.length > 1 && (
                      <button
                        onClick={() => handleRemoveInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <span>£{totalInvoiceAmount}</span>
                </div>
              </div>
            </div>

            {/* Add Note */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add Note (optional):
              </label>
              <textarea
                className="w-full border rounded-lg p-2 text-sm"
                rows="2"
                placeholder="Add any explanation for this match..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  // Update the match status to red
                  setMatchingResults((prevResults) => ({
                    ...prevResults,
                    matches: prevResults.matches.map((match) =>
                      match.id === selectedReviewItem.id
                        ? {
                            ...match,
                            status: "red",
                            fileName: null,
                            invoiceNumber: null,
                            invoiceDate: null,
                          }
                        : match
                    ),
                  }));
                  // Save the note if any
                  if (noteText.trim()) {
                    setTransactionNotes((prev) => ({
                      ...prev,
                      [selectedReviewItem.id]: noteText.trim(),
                    }));
                  }
                  setShowReviewDialog(false);
                  setSelectedReviewItem(null);
                  alert(
                    "Match rejected - transaction marked as missing invoice"
                  );
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reject Match
              </button>
              <button
                onClick={() => {
                  // Update the match status to green
                  setMatchingResults((prevResults) => ({
                    ...prevResults,
                    matches: prevResults.matches.map((match) =>
                      match.id === selectedReviewItem.id
                        ? { ...match, status: "green" }
                        : match
                    ),
                  }));
                  // Save the note if any
                  if (noteText.trim()) {
                    setTransactionNotes((prev) => ({
                      ...prev,
                      [selectedReviewItem.id]: noteText.trim(),
                    }));
                  }
                  setShowReviewDialog(false);
                  setSelectedReviewItem(null);
                  alert("Match approved");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Seasonal Bookkeeping Assistant
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                John Smith
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <ProgressBar />

          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Step 1: Bank Statement Upload */}
            {currentStep === 1 && (
              <div>
                <p className="text-gray-600 mb-4">
                  Upload your bank statement for the period to reconcile
                </p>
                <FileUploadArea type="bank" accept=".pdf,.csv,.xlsx,.xls" />
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={!bankStatement}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                      !bankStatement
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {!bankStatement ? (
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
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Period Detection
                  </h2>
                  <p className="text-gray-600">
                    We detected transactions from your bank statement
                  </p>
                </div>

                {selectedPeriod.detected && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 mb-2">
                      Detected period:
                    </p>
                    <p className="text-lg font-semibold text-blue-900">
                      {new Date(selectedPeriod.from).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}{" "}
                      -{" "}
                      {new Date(selectedPeriod.to).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="period"
                      value="detected"
                      checked={periodOption === "detected"}
                      onChange={(e) => setPeriodOption(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">Use detected period</p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedPeriod.from).toLocaleDateString(
                          "en-GB",
                          { month: "long", year: "numeric" }
                        )}{" "}
                        - Full Month
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="period"
                      value="adjust"
                      checked={periodOption === "adjust"}
                      onChange={(e) => setPeriodOption(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Adjust period</p>
                      <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                          <label className="text-sm text-gray-600 block mb-1">
                            From:
                          </label>
                          <input
                            type="date"
                            defaultValue={selectedPeriod.from}
                            disabled={periodOption !== "adjust"}
                            className={`w-full border rounded px-3 py-2 ${
                              periodOption !== "adjust"
                                ? "bg-gray-100 text-gray-500"
                                : ""
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm text-gray-600 block mb-1">
                            To:
                          </label>
                          <input
                            type="date"
                            defaultValue={selectedPeriod.to}
                            disabled={periodOption !== "adjust"}
                            className={`w-full border rounded px-3 py-2 ${
                              periodOption !== "adjust"
                                ? "bg-gray-100 text-gray-500"
                                : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    Confirm Period <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Invoice Upload */}
            {currentStep === 3 && (
              <div>
                <p className="text-gray-600 mb-4">
                  Upload any invoices you have available (optional)
                </p>
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
                    disabled={isProcessing}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
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
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">
                          {
                            matchingResults.matches.filter(
                              (m) => m.status === "green"
                            ).length
                          }
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">
                          {
                            matchingResults.matches.filter(
                              (m) => m.status === "yellow"
                            ).length
                          }
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium">
                          {
                            matchingResults.matches.filter(
                              (m) => m.status === "red"
                            ).length
                          }
                        </span>
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ~
                      {Math.ceil(
                        matchingResults.matches.filter(
                          (m) => m.status === "yellow"
                        ).length *
                          5 +
                          matchingResults.matches.filter(
                            (m) => m.status === "red"
                          ).length *
                            3
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
                      Export to CSV
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
                        (m) => m.status === "green"
                      )
                    }
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                      matchingResults.matches.every((m) => m.status === "green")
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {matchingResults.matches.every((m) => m.status === "green")
                      ? "Download"
                      : "Next"}
                    {matchingResults.matches.every(
                      (m) => m.status === "green"
                    ) ? (
                      <Download className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Download Package */}
            {currentStep === 5 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-8">
                  All invoices have been matched and organized.
                </p>
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

            {/* Expanded Table View */}
            {expandedTableView && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                <div className="bg-white h-full w-full flex flex-col">
                  {/* Header */}
                  <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <h2 className="text-xl font-semibold">
                        Matching Results - Expanded View
                      </h2>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            {
                              matchingResults.matches.filter(
                                (m) => m.status === "green"
                              ).length
                            }
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">
                            {
                              matchingResults.matches.filter(
                                (m) => m.status === "yellow"
                              ).length
                            }
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium">
                            {
                              matchingResults.matches.filter(
                                (m) => m.status === "red"
                              ).length
                            }
                          </span>
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        ~
                        {Math.ceil(
                          matchingResults.matches.filter(
                            (m) => m.status === "yellow"
                          ).length *
                            5 +
                            matchingResults.matches.filter(
                              (m) => m.status === "red"
                            ).length *
                              3
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
                        Export to CSV
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
                          (m) => m.status === "green"
                        )
                      }
                      className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                        matchingResults.matches.every(
                          (m) => m.status === "green"
                        )
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {matchingResults.matches.every(
                        (m) => m.status === "green"
                      )
                        ? "Download"
                        : "Next"}
                      {matchingResults.matches.every(
                        (m) => m.status === "green"
                      ) ? (
                        <Download className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookkeepingSaaS;
