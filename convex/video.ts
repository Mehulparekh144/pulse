import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});


export const getVideoUrl = mutation({
  args: {
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const deleteVideo = mutation({
  args: {
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    return await ctx.storage.delete(args.storageId);
  },
});
