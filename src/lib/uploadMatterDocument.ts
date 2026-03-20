import { supabase } from "./supabaseClient";
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (file.type === 'application/pdf') {
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else {
    // For other file types, return empty string or basic text extraction
    return '';
  }
}

async function classifyDocumentWithAI(text: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.warn('OpenAI API key not found, skipping AI classification');
    return 'Other';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a legal document classifier for UK property transactions. Classify the document into one of these categories: TR1, Completion Statement, Mortgage Deed, AP1, SDLT5 Certificate, Notice of Transfer, Certificate, Other.

Return only the category name, nothing else. If unsure, return "Other".`
          },
          {
            role: 'user',
            content: `Document text:\n${text.substring(0, 4000)}` // Limit text length
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const classification = data.choices[0]?.message?.content?.trim();

    // Validate the classification is one of our expected types
    const validTypes = ['TR1', 'Completion Statement', 'Mortgage Deed', 'AP1', 'SDLT5 Certificate', 'Notice of Transfer', 'Certificate', 'Other'];
    return validTypes.includes(classification) ? classification : 'Other';
  } catch (error) {
    console.error('AI classification failed:', error);
    return 'Other';
  }
}

async function updateChecklistForDocument(matterId: string, documentType: string) {
  // Map document types to checklist items that should be ticked
  const checklistMappings: Record<string, string[]> = {
    'TR1': ['Transfer deed (TR1) executed'],
    'Completion Statement': ['Stamp duty payment made'],
    'Mortgage Deed': ['Mortgage deed discharged (if applicable)'],
    'AP1': ['AP1 form completed and signed'],
    'SDLT5 Certificate': ['SDLT return submitted (or exemption confirmed)'],
    'Notice of Transfer': ['Official copies of title register obtained'],
    'Certificate': [], // No specific checklist item
    'Other': [], // No specific checklist item
  };

  const itemsToCheck = checklistMappings[documentType] || [];

  if (itemsToCheck.length === 0) return;

  try {
    // Get all tasks for this matter
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, label')
      .eq('matter_id', matterId);

    if (fetchError) throw fetchError;

    // Find tasks that match the items to check and are not already completed
    const tasksToUpdate = tasks?.filter(task =>
      itemsToCheck.includes(task.label) && !task.completed
    ) || [];

    if (tasksToUpdate.length === 0) return;

    // Update the tasks to completed
    const taskIds = tasksToUpdate.map(t => t.id);
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ completed: true })
      .in('id', taskIds);

    if (updateError) throw updateError;

    console.log(`Auto-completed checklist items: ${itemsToCheck.join(', ')}`);
  } catch (error) {
    console.error('Failed to update checklist:', error);
  }
}

export async function uploadMatterDocument(
  matterId: string,
  file: File,
  documentType?: string
) {
  const safeName = sanitizeFileName(file.name);
  const storagePath = `${matterId}/${crypto.randomUUID()}_${safeName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from("matter-documents")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Extract text for AI classification if no type provided or type is "Other"
  let extractedText = '';
  let finalDocumentType = documentType;

  if (!documentType || documentType === 'Other') {
    try {
      extractedText = await extractTextFromFile(file);
      if (extractedText.trim()) {
        finalDocumentType = await classifyDocumentWithAI(extractedText);
      }
    } catch (error) {
      console.error('Text extraction failed:', error);
      finalDocumentType = 'Other';
    }
  }

  // Insert document record
  const { error: insertError } = await supabase.from("documents").insert({
    matter_id: matterId,
    file_name: file.name,
    storage_bucket: "matter-documents",
    storage_path: storagePath,
    mime_type: file.type,
    size_bytes: file.size,
    document_type: finalDocumentType,
    extracted_text: extractedText || null,
  });

  if (insertError) throw insertError;

  // Auto-update checklist based on document type
  if (finalDocumentType && finalDocumentType !== 'Other') {
    await updateChecklistForDocument(matterId, finalDocumentType);
  }

  return { storagePath, documentType: finalDocumentType };
}
