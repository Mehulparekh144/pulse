// convex/index.ts
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";
import { OpenAI } from "openai";
import { InferenceClient } from '@huggingface/inference';
import type { AnyDataModel } from "convex/server";
import type { GenericActionCtx } from "convex/server";

export const workflow = new WorkflowManager(components.workflow);

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_KEY
})

export const inference = new InferenceClient(process.env.HUGGINGFACE_TOKEN!);

export const uploadFile = async (ctx: GenericActionCtx<AnyDataModel>, file: Blob) => {
  const uploadUrl = await ctx.storage.generateUploadUrl();

  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file
  });

  const { storageId } = await result.json();

  const url = await ctx.storage.getUrl(storageId);
  return url;
}