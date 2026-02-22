import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ParsedExpense {
  item: string;
  amount: number;
  category: string;
  purpose: string;
}

export async function parseExpenseText(text: string): Promise<ParsedExpense> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Phân tích mô tả chi tiêu sau thành đối tượng JSON. Trả về tất cả văn bản bằng tiếng Việt (tên mục, danh mục, mục đích). Tiền tệ mặc định là VND: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Tên mục chi tiêu" },
          amount: { type: Type.NUMBER, description: "Số tiền (số)" },
          category: { type: Type.STRING, description: "Danh mục ngắn bằng tiếng Việt (VD: Ăn uống, Di chuyển, Tiện ích)" },
          purpose: { type: Type.STRING, description: "Mục đích chi tiêu bằng tiếng Việt" },
        },
        required: ["item", "amount", "category", "purpose"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function parseExpenseImage(base64Data: string, mimeType: string): Promise<ParsedExpense> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      {
        text: "Trích xuất chi tiết chi tiêu từ ảnh hóa đơn thành đối tượng JSON. Trả về tất cả văn bản bằng tiếng Việt. Tiền tệ mặc định là VND.",
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Tên mục hoặc cửa hàng" },
          amount: { type: Type.NUMBER, description: "Tổng số tiền (số)" },
          category: { type: Type.STRING, description: "Danh mục ngắn bằng tiếng Việt" },
          purpose: { type: Type.STRING, description: "Mục đích chi tiêu bằng tiếng Việt" },
        },
        required: ["item", "amount", "category", "purpose"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
