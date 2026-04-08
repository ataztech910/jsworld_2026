import * as dotenv from "dotenv";
dotenv.config();

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ollama } from "ollama";

export type ModelId =
  | "mistral"
  | "codeqwen"
  | "gpt-4o-mini"
  | "gemini-flash"
  | "claude-sonnet";

export interface ModelResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || "http://localhost:11434" });

export async function callModel(
  modelId: ModelId,
  prompt: string,
  temperature = 0.1
): Promise<ModelResponse> {
  switch (modelId) {
    case "claude-sonnet": {
      const res = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        temperature,
        messages: [{ role: "user", content: prompt }],
      });
      const text = res.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");
      return {
        text,
        promptTokens: res.usage.input_tokens,
        completionTokens: res.usage.output_tokens,
      };
    }

    case "gpt-4o-mini": {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      return {
        text: res.choices[0].message.content || "",
        promptTokens: res.usage?.prompt_tokens || 0,
        completionTokens: res.usage?.completion_tokens || 0,
      };
    }

    case "gemini-flash": {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { temperature },
      });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const usage = res.response.usageMetadata;
      return {
        text,
        promptTokens: usage?.promptTokenCount || 0,
        completionTokens: usage?.candidatesTokenCount || 0,
      };
    }

    case "mistral": {
      const res = await ollama.generate({
        model: "mistral:instruct",
        prompt,
        stream: false,
        options: { temperature },
      });
      const promptTokens = Math.round(prompt.length / 4);
      return {
        text: res.response,
        promptTokens,
        completionTokens: res.eval_count || 0,
      };
    }

    case "codeqwen": {
      const res = await ollama.generate({
        model: "codeqwen:7b",
        prompt,
        stream: false,
        options: { temperature },
      });
      const promptTokens = Math.round(prompt.length / 4);
      return {
        text: res.response,
        promptTokens,
        completionTokens: res.eval_count || 0,
      };
    }
  }
}

export const ALL_MODELS: ModelId[] = [
  "mistral",
  "codeqwen",
  "gpt-4o-mini",
  "gemini-flash",
  "claude-sonnet",
];

export const BIG_MODELS: ModelId[] = [
  "gpt-4o-mini",
  "gemini-flash",
  "claude-sonnet",
];

export const LOCAL_MODELS: ModelId[] = ["mistral", "codeqwen"];