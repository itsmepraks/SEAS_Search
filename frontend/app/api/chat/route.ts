import { type NextRequest, NextResponse } from "next/server"
import { Client } from "@gradio/client"

const HF_API_TOKEN = process.env.HF_API_TOKEN
const HF_MODEL_ENDPOINT = process.env.HF_MODEL_ENDPOINT // Paid Inference Endpoint URL
const HF_SPACE_ID = process.env.HF_SPACE_ID // Free Gradio Space (e.g., "itsmepraks/gw-courses-chat")

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()?.content || ""

    if (HF_SPACE_ID) {
      console.log("[v0] Using Gradio Space:", HF_SPACE_ID)

      try {
        const client = await Client.connect(HF_SPACE_ID, {
          hf_token: HF_API_TOKEN as `hf_${string}`,
        })

        // Format history as array of [user, assistant] tuples for gr.ChatInterface
        const history: [string, string][] = []
        for (let i = 0; i < messages.length - 1; i += 2) {
          const userMsg = messages[i]?.role === "user" ? messages[i]?.content : ""
          const assistantMsg = messages[i + 1]?.role === "assistant" ? messages[i + 1]?.content : ""
          if (userMsg || assistantMsg) {
            history.push([userMsg || "", assistantMsg || ""])
          }
        }

        // gr.ChatInterface exposes /chat endpoint with positional args: (message, history)
        const result = await client.predict("/chat", [lastUserMessage, history])

        const content = (result.data as string[])?.[0] || result.data || "No response generated"
        return NextResponse.json({ content })
      } catch (spaceError) {
        console.error("[v0] Gradio Space error:", spaceError)
        throw spaceError
      }
    }

    if (HF_MODEL_ENDPOINT) {
      if (!HF_API_TOKEN) {
        return NextResponse.json(
          { error: "Hugging Face API token not configured. Add HF_API_TOKEN in the Vars section." },
          { status: 500 },
        )
      }

      console.log("[v0] Using Inference Endpoint:", HF_MODEL_ENDPOINT)

      const response = await fetch(HF_MODEL_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: formatMessagesForModel(messages),
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] HF Endpoint Error:", response.status, errorText)

        if (response.status === 503) {
          return NextResponse.json({
            content: "The model is currently loading (cold start). Please try again in a moment.",
          })
        }
        throw new Error(`Endpoint returned ${response.status}`)
      }

      const data = await response.json()
      const content = Array.isArray(data)
        ? data[0]?.generated_text || "No response generated"
        : data.generated_text || data[0]?.generated_text || "No response generated"

      return NextResponse.json({ content })
    }

    return NextResponse.json({
      content: `**Free Setup Guide**

You can run your fine-tuned model for free using **Hugging Face Spaces**:

**Step 1: Create a Gradio Space**
1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Choose **Gradio** as the SDK
3. Select **ZeroGPU** (free A100 access!) or **CPU Basic** (always free)

**Step 2: Add this app.py to your Space**
\`\`\`python
import gradio as gr
from transformers import pipeline

pipe = pipeline("text-generation", model="itsmepraks/gwcoursesfinetuned")

def chat(message, history):
    response = pipe(message, max_new_tokens=256)[0]["generated_text"]
    return response

gr.ChatInterface(chat).launch()
\`\`\`

**Step 3: Connect to this app**
Add \`HF_SPACE_ID\` in **Vars** with your Space ID (e.g., \`itsmepraks/gw-courses-chat\`)

---
*Explore the **Data** and **Reports** sections while you set this up!*`,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to connect to the model. Please check your configuration." },
      { status: 500 },
    )
  }
}

function formatMessagesForModel(messages: { role: string; content: string }[]): string {
  return (
    messages
      .map((m) => {
        if (m.role === "system") return `### System:\n${m.content}`
        if (m.role === "user") return `### User:\n${m.content}`
        if (m.role === "assistant") return `### Assistant:\n${m.content}`
        return m.content
      })
      .join("\n\n") + "\n\n### Assistant:\n"
  )
}
