import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { inference, openai, uploadFile } from '.'

export const getSummary = action({
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
        `
        },
        {
          role: "user",
          content: `Create a TikTok script about: ${topic}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response from OpenAI");
    }
    return response.choices[0].message.content;
  }
})

export const generateScript = internalAction({
  args: {
    content: v.string(),
  },
  handler: async (_, args) => {
    const { content } = args;

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-4-maverick:free",
      messages: [
        {
          role: "system",
          content: `You are a professional TikTok content creator and script formatter. Your task is to take the provided content and format it as a proper TikTok script with timestamps.

Follow these guidelines:
1. Keep the original content intact - do not change the wording or meaning
2. Break the content into natural segments (5-15 seconds each)
3. Create realistic timestamps for a 2-minute TikTok video
4. Start with timestamp 0 and end around 120 seconds
5. Ensure segments flow naturally with proper pacing
6. Avoid overlapping timestamps

EXTREMELY IMPORTANT FORMATTING INSTRUCTIONS:
- You must return ONLY a valid JSON object without any surrounding text
- DO NOT include any explanatory text or markdown formatting
- DO NOT include phrases like "Here's the formatted TikTok script as a JSON object:" 
- DO NOT wrap the JSON in code block markers like \`\`\` or any other formatting
- DO NOT use escaped characters like \\n or \\" in the content or transcript text
- Return the pure, valid JSON data only

The JSON structure must be exactly:
{
  "content": "The full original text without any modifications",
  "transcript": [
    {
      "text": "First segment of the script",
      "start": "0",
      "end": "8"
    },
    {
      "text": "Second segment of the script",
      "start": "8",
      "end": "15"
    }
  ]
}
`
        },
        {
          role: "user",
          content: `Create a TikTok script about: ${content}`
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

    // Extract the JSON from the response, handling potential markdown formatting
    let rawContent = response.choices[0].message.content;

    // Remove any preceding text before the JSON
    const jsonStartIndex = rawContent.indexOf('{');
    if (jsonStartIndex > 0) {
      rawContent = rawContent.substring(jsonStartIndex);
    }

    // Remove any code block markers or trailing text
    rawContent = rawContent.replace(/^```(?:json)?\s*/g, '').replace(/\s*```$/g, '');

    try {
      const script = JSON.parse(rawContent);
      return script;
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Failed to parse script response");
    }
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

    const url = await uploadFile(ctx, response);
    if (!url) {
      throw new Error("Failed to upload audio file");
    }
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

    const url = await uploadFile(ctx, new Blob([vttContent], { type: 'text/vtt' }));
    if (!url) {
      throw new Error("Failed to upload VTT file");
    }
    return url;
  }
});

function formatToVTTTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

