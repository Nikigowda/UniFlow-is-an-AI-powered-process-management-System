import { GoogleGenAI, Type } from "@google/genai";
import { DefectCategory } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check for API key
const hasKey = () => !!apiKey;

export const suggestDefectCategory = async (description: string): Promise<DefectCategory> => {
  if (!hasKey()) return DefectCategory.OTHER;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize the following software defect description into exactly one of these categories: "Functional Bugs", "Logical Bugs", "Workflow Bugs", "Other". 
      
      Description: "${description}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                'Functional Bugs',
                'Logical Bugs',
                'Workflow Bugs',
                'Other'
              ]
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.category as DefectCategory;
  } catch (error) {
    console.error("Gemini classification failed:", error);
    return DefectCategory.OTHER;
  }
};

export const generateRelatedTasks = async (context: string, type: 'DEFECT' | 'RECRUITMENT'): Promise<any[]> => {
  if (!hasKey()) return [];

  const prompt = type === 'DEFECT' 
    ? `Given this defect description: "${context}", suggest 3-5 specific, actionable tasks to resolve it. Return JSON.`
    : `Given this recruitment context for candidate/role: "${context}", suggest 3-5 standard hiring tasks. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              owner: { type: Type.STRING, description: "Suggested role like 'Developer', 'QA', 'HR'" },
              dueDateOffset: { type: Type.NUMBER, description: "Days from now, e.g. 1, 2, 7" }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini task generation failed:", error);
    return [];
  }
};

export const generateSolutionDescription = async (processName: string, details: string): Promise<string> => {
  if (!hasKey()) return "## API Key Missing\nPlease provide an API Key to generate the documentation.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a comprehensive solution design document for a "${processName}" process in a process management system (like Unifize). 
      
      The document should cover:
      1. **Introduction**: What problem this solves.
      2. **Process Flow**: A textual description of the user journey (e.g., "Recruiter adds candidate -> System auto-assigns tasks -> Interview Scheduled").
      3. **Key Features**: Highlight the fields and logic configured (based on these details: ${details}).
      4. **Analytical Justification**: Why this structure works efficiently.
      
      Format with Markdown.`,
    });

    return response.text || "Failed to generate documentation.";
  } catch (error) {
    console.error("Gemini doc generation failed:", error);
    return "Error generating documentation. Please try again.";
  }
};