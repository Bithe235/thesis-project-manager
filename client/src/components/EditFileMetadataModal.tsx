"use client";
import { useMemo, useState } from "react";
import { X, Tag, FileText, User, Save } from "lucide-react";
 
 const FILE_TYPES = [
   "Research Paper", "Dataset", "Thesis Chapter", "Presentation",
   "Code / Script", "Notes", "Report", "Image / Figure", "Other",
 ];
 
 const SUGGESTED_TAGS = [
   "thesis",
   "chapter-1",
   "dataset",
   "figures",
   "code",
   "final",
 ];
 
 export interface EditFileMetaValues {
   key: string;
   type: string;
   description: string;
   tags: string[];
   uploadedBy: string;
 }
 
 interface Props {
   initial: EditFileMetaValues;
   onCancel: () => void;
   onSave: (next: EditFileMetaValues) => void;
 }
 
 export default function EditFileMetadataModal({ initial, onCancel, onSave }: Props) {
   const [type, setType] = useState(initial.type || "Other");
   const [description, setDescription] = useState(initial.description || "");
   const [tagsInput, setTagsInput] = useState((initial.tags || []).join(", "));
   const [uploadedBy, setUploadedBy] = useState(initial.uploadedBy || "");
 
   const addTag = (tag: string) => {
     const existing = tagsInput
       .split(",")
       .map((t) => t.trim())
       .filter(Boolean);
     if (existing.includes(tag)) return;
     const next = [...existing, tag];
     setTagsInput(next.join(", "));
   };
 
   const fileName = useMemo(() => initial.key.split("/").pop() || initial.key, [initial.key]);
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
     onSave({
       key: initial.key,
       type,
       description,
       tags,
       uploadedBy: uploadedBy.trim(),
     });
   };
 
   return (
     <div className="modal-overlay animate-fade-in">
       <div
         className="neo-card animate-bounce-in"
         style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
       >
         <div style={{
           padding: "16px 20px",
           borderBottom: "2.5px solid #1a1a1a",
           background: "#4ECDC4",
           display: "flex",
           alignItems: "center",
           justifyContent: "space-between",
         }}>
           <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 16 }}>
             Edit Metadata
             <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, marginTop: 2 }}>
               {fileName}
             </div>
           </div>
           <button onClick={onCancel} style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>
             <X size={15} />
           </button>
         </div>
 
         <form onSubmit={handleSubmit} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
           <div>
             <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
               📂 File Type
             </label>
             <select className="neo-input" value={type} onChange={(e) => setType(e.target.value)}>
               {FILE_TYPES.map((t) => (
                 <option key={t} value={t}>{t}</option>
               ))}
             </select>
           </div>
 
           <div>
             <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
               <FileText size={12} style={{ display: "inline", marginRight: 4 }} />
               Description
             </label>
             <textarea
               className="neo-input"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="What is this file? What does it contain?"
               rows={3}
               style={{ resize: "vertical" }}
             />
           </div>
 
           <div>
             <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
               <Tag size={12} style={{ display: "inline", marginRight: 4 }} />
               Tags (comma separated)
             </label>
             <input
               className="neo-input"
               value={tagsInput}
               onChange={(e) => setTagsInput(e.target.value)}
               placeholder="e.g. chapter-1, dataset, final"
             />
             <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
               {SUGGESTED_TAGS.map((t) => (
                 <button
                   key={t}
                   type="button"
                   onClick={() => addTag(t)}
                   className="neo-btn neo-btn-white"
                   style={{ padding: "4px 10px", fontSize: 11, borderRadius: 999 }}
                 >
                   #{t}
                 </button>
               ))}
             </div>
           </div>
 
           <div>
             <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
               <User size={12} style={{ display: "inline", marginRight: 4 }} />
               Uploaded by
             </label>
             <input
               className="neo-input"
               value={uploadedBy}
               onChange={(e) => setUploadedBy(e.target.value)}
               placeholder="Your name"
             />
           </div>
 
           <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
             <button type="button" onClick={onCancel} className="neo-btn neo-btn-white" style={{ flex: 1, justifyContent: "center" }}>
               Cancel
             </button>
             <button type="submit" className="neo-btn neo-btn-black" style={{ flex: 2, justifyContent: "center" }}>
               <Save size={14} /> Save
             </button>
           </div>
         </form>
       </div>
     </div>
   );
 }
 
