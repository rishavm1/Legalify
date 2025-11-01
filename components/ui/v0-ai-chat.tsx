"use client";

import { useState, useEffect } from "react";
import { templates } from "@/lib/templates";
import { QuestionFlow } from "@/components/question-flow";
import { DocumentResult } from "@/components/document-result";
import { generateDocument } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

type Stage = "template" | "questions" | "generating" | "result";

export function VercelV0Chat() {
    const { data: session } = useSession();
    const [stage, setStage] = useState<Stage>("template");
    const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
    const [generatedDoc, setGeneratedDoc] = useState("");
    const [error, setError] = useState("");
    const [savedDocs, setSavedDocs] = useState<any[]>([]);

    useEffect(() => {
        if (session?.user) {
            fetch('/api/documents/list')
                .then(res => res.json())
                .then(data => setSavedDocs(data.documents || []))
                .catch(error => {
                    console.error('Failed to load documents:', error);
                    setSavedDocs([]);
                });
        }
    }, [session]);

    const handleTemplateSelect = (template: typeof templates[0]) => {
        setSelectedTemplate(template);
        setStage("questions");
    };

    const handleQuestionsComplete = async (answers: Record<string, string>) => {
        if (!selectedTemplate) return;
        
        setStage("generating");
        setError("");
        
        try {
            const doc = await generateDocument(selectedTemplate.systemPrompt, answers);
            setGeneratedDoc(doc);
            setStage("result");
            
            if (session?.user) {
                try {
                    await fetch('/api/documents/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            templateId: selectedTemplate.id,
                            answers,
                            document: doc,
                        }),
                    });
                } catch (saveError) {
                    console.error('Failed to save document:', saveError);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate document");
            setStage("questions");
        }
    };

    const handleReset = () => {
        setStage("template");
        setSelectedTemplate(null);
        setGeneratedDoc("");
        setError("");
    };

    if (stage === "generating") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                <p className="text-white text-lg">Generating your legal document...</p>
                <p className="text-neutral-400 text-sm">This may take a moment</p>
            </div>
        );
    }

    if (stage === "result") {
        return <DocumentResult document={generatedDoc} onReset={handleReset} />;
    }

    if (stage === "questions" && selectedTemplate) {
        return (
            <div className="space-y-6">
                {error && (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
                        {error}
                    </div>
                )}
                <QuestionFlow
                    questions={selectedTemplate.questions}
                    onComplete={handleQuestionsComplete}
                    onBack={handleReset}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-white">
                    What legal document do you need?
                </h1>
                <p className="text-neutral-400">Select a template to get started</p>
            </div>

            {savedDocs.length > 0 && (
                <div className="w-full">
                    <h2 className="text-xl font-semibold text-white mb-4">Your Recent Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedDocs.slice(0, 3).map((doc: any) => (
                            <div key={doc.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                                <p className="text-white text-sm truncate">{doc.document.substring(0, 100)}...</p>
                                <p className="text-neutral-500 text-xs mt-2">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-white rounded-xl p-6 transition-all text-left group"
                    >
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-white font-semibold text-lg group-hover:text-white transition-colors">
                            {template.name}
                        </h3>
                        <p className="text-neutral-400 text-sm mt-2">
                            {template.questions.length} questions
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
