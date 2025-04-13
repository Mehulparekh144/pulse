import { v } from "convex/values";
import { workflow } from ".";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export const convertIdeaToScript = workflow.define({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { content } = args;

    const script = await ctx.runAction(internal.reels.generateScript, { content });
    const audioUrl: string = await ctx.runAction(internal.reels.generateAudio, { text: script.content });
    const vttUrl: string = await ctx.runAction(internal.reels.getVTTFile, { transcript: script.transcript });

    return {
      audioUrl,
      vttUrl
    }
  }
})

export const kickOffWorkflow = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { content } = args;

    const workflowId: string = await workflow.start(
      ctx,
      internal.workflow.convertIdeaToScript,
      {
        content
      }
    )

    return workflowId;

  }
})