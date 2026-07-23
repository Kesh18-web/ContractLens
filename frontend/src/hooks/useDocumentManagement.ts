import { useState, useEffect, useMemo, useCallback } from "react";
import { documentApi } from "@/lib/api";

export interface Document {
  id: string;
  name: string;
  date: string;
  status?: string;
}

export interface UseDocumentManagementReturn {
  recentDocs: Document[];
  selectedDocs: string[];
  currentDocId: string | null;
  docQuery: string;
  filteredDocs: Document[];
  setDocQuery: (query: string) => void;
  toggleSelectDoc: (id: string) => void;
  clearContext: () => void;
  addDocument: (doc: Document) => void;
  addDocuments: (docs: Document[]) => void;
  removeDocument: (id: string) => void;
  setSelectedDocs: (docs: string[]) => void;
  setCurrentDocId: (id: string | null) => void;
  updateDocumentStatus: (docId: string, status: string) => void;
}

/**
 * Hook for managing document selection, filtering, and state
 */
export const useDocumentManagement = (): UseDocumentManagementReturn => {
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [docQuery, setDocQuery] = useState("");

  // Load uploaded documents from Firestore on mount
  useEffect(() => {
    documentApi.listDocuments().then((docs) => {
      if (docs && docs.length > 0) {
        setRecentDocs(docs);
      }
    });
  }, []);

  // Filter documents based on search query
  const filteredDocs = useMemo(() => {
    return recentDocs.filter((d) =>
      d.name.toLowerCase().includes(docQuery.toLowerCase())
    );
  }, [recentDocs, docQuery]);

  // Toggle document selection
  const toggleSelectDoc = useCallback((id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
    );
  }, []);

  // Clear all selected documents
  const clearContext = useCallback(() => {
    setSelectedDocs([]);
  }, []);

  // Add single document to recent docs
  const addDocument = useCallback((doc: Document) => {
    setRecentDocs((prev) => [doc, ...prev]);
  }, []);

  // Add multiple documents to recent docs
  const addDocuments = useCallback((docs: Document[]) => {
    setRecentDocs((prev) => [...docs, ...prev]);
  }, []);

  // Remove document
  const removeDocument = useCallback(async (id: string) => {
    setRecentDocs((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocs((prev) => prev.filter((x) => x !== id));
    await documentApi.deleteDocument(id);
  }, []);

  // Update document status
  const updateDocumentStatus = useCallback((docId: string, status: string) => {
    setRecentDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status } : doc))
    );
  }, []);

  // Update current document when selection changes
  useEffect(() => {
    if (selectedDocs.length > 0) {
      setCurrentDocId(selectedDocs[0]);
    } else {
      setCurrentDocId(null);
    }
  }, [selectedDocs]);

  return {
    recentDocs,
    selectedDocs,
    currentDocId,
    docQuery,
    filteredDocs,
    setDocQuery,
    toggleSelectDoc,
    clearContext,
    addDocument,
    addDocuments,
    removeDocument,
    setSelectedDocs,
    setCurrentDocId,
    updateDocumentStatus,
  };
};
