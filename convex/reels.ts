import { v } from "convex/values";
import { internalAction, mutation, query, } from "./_generated/server";
import { OpenAI } from "openai";
import { InferenceClient } from '@huggingface/inference';


const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_KEY
})

const inference = new InferenceClient(process.env.HUGGINGFACE_TOKEN!);

export const getSummary = query({
  args: {
    topic: v.string()
  },
  handler: async (_, args) => {
    const { topic } = args;

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-4-maverick:free",
      messages: [
        {
          role: "system",
          content: `You are a professional TikTok content creator. 
          Create an engaging 2-minute TikTok script about the given topic. 
          Return ONLY the pure text content without any formatting, 
          instructions, speaker labels, or special markers. 
          Do not include phrases like 'Host:', 'Audio plays:', or any other production notes. 
          Just the actual script text that would be spoken.
          
          The script should be in the following format:
          {
            "content": "The full script text",
            "transcript": [{
              "text": "A segment of the script",
              "start": "Start time in seconds",
              "end": "End time in seconds"
            }]
          }`
        },
        {
          role: "user",
          content: `Create a TikTok script about: ${topic}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "TikTokScript",
          schema: {
            content: "The full script text",
            transcript: [{
              text: "A segment of the script",
              start: "Start time in seconds",
              end: "End time in seconds"
            }]
          }
        }
      },
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response from OpenAI");
    }

    const script = JSON.parse(response.choices[0].message.content);
    return script;
  }
})

export const generateAudio = internalAction({
  args: {
    text: v.string()
  },
  handler: async (ctx, args) => {
    const { text } = args;

    const response = await inference.textToSpeech({
      model: 'facebook/mms-tts-eng',
      inputs: text,
    });

    if (!response) {
      throw new Error("No audio response from model");
    }
    const url = await ctx.storage.generateUploadUrl();

    await ctx.storage.store(response);
    return url;
  }
})

export const getVTTFile = internalAction({
  args: {
    transcript: v.array(v.object({
      text: v.string(),
      start: v.string(),
      end: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const { transcript } = args;

    let vttContent = 'WEBVTT\n\n';

    for (const item of transcript) {
      const start = formatToVTTTime(Number(item.start));
      const end = formatToVTTTime(Number(item.end));
      vttContent += `${start} --> ${end}\n${item.text}\n\n`;
    }

    const url = await ctx.storage.generateUploadUrl()
    await ctx.storage.store(new Blob([vttContent], { type: 'text/vtt' }));
    return url;
  }
});

function formatToVTTTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
