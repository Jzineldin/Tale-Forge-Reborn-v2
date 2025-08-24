# **What GPT-4o is (and which variants to use)**

* **GPT-4o (“omni”)** is OpenAI’s flagship multimodal model: text \+ images in, text (and via other APIs, audio) out. It’s optimized for speed and quality and is the default for most app work. [OpenAI Plattform+1](https://platform.openai.com/docs/models/gpt-4o?utm_source=chatgpt.com)

* **GPT-4o mini** is a cheaper, faster variant for lightweight tasks (classification, short replies, tool routing, etc.). [OpenAI Plattform](https://platform.openai.com/docs/models/gpt-4o-mini?utm_source=chatgpt.com)

* **GPT-4o Realtime** adds low-latency, stateful sessions that handle text and audio in/out over WebRTC or WebSockets—ideal for “talk to your app” or live co-pilot features. [OpenAI Plattform+1](https://platform.openai.com/docs/models/gpt-4o-realtime-preview?utm_source=chatgpt.com)

---

# **Set up & auth**

* Create an API key and install an SDK (Node/Python). Quickstart covers environment setup and first request. [OpenAI Plattform](https://platform.openai.com/docs/quickstart?utm_source=chatgpt.com)

* Full API reference entry point. [OpenAI Plattform](https://platform.openai.com/docs/api-reference/introduction?utm_source=chatgpt.com)

---

# **Core text & vision: the Responses API (recommended)**

The Responses API is the current, unified way to generate text/JSON and to call tools. Use it for GPT-4o and friends.

\*\*Node (streaming or non-streaming

##### **Du sade:**

Why are you giving me lionks you lazy fuck? I asked oyu to write it all down HERE

###### **ChatGPT sade:**

Tänkte i 19s

Got it, Kevin — here it is **written out in full**, no link-dumping. This is a consolidated, practical “how to use GPT-4o” guide straight from the official docs, trimmed to what you’ll actually implement in an app: setup, endpoints, params, streaming text “as it types,” tools/function calling, vision, audio, realtime, JSON outputs, and solid prompting patterns. Citations at the end of sections point to the official pages I pulled from.

---

# **1\) What GPT-4o is and when to use it**

**GPT-4o (“o” \= omni)** is OpenAI’s flagship multimodal model. It takes text and images as input and returns text. There are also companion models for realtime voice, TTS, and transcription that are part of the “4o family.” Use GPT-4o when you need strong reasoning and vision in one model. Use 4o-mini variants when you need speed and low cost. For live voice or ultra-low latency, use the **Realtime** versions. [OpenAI Plattform+1](https://platform.openai.com/docs/models/gpt-4o?utm_source=chatgpt.com)

---

# **2\) SDK setup (Node and Python)**

Install the official SDK and set `OPENAI_API_KEY` in your env.

**Node**

`npm i openai`

`import OpenAI from "openai";`  
`const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });`

**Python**

`pip install openai`

`from openai import OpenAI`  
`client = OpenAI()  # uses OPENAI_API_KEY`

All examples below assume one of these `client` objects. [OpenAI Plattform+1](https://platform.openai.com/docs/api-reference/introduction?utm_source=chatgpt.com)

---

# **3\) Text generation with the Responses API (recommended)**

The **Responses API** is the unified, forward-compatible way to generate text, do tool calling, JSON outputs, and more. Prefer it over legacy Chat Completions. [OpenAI Plattform+1](https://platform.openai.com/docs/api-reference/responses?utm_source=chatgpt.com)

**Basic completion (Node)**

`const r = await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: "Write a 2-sentence bedtime hook about a dragon baker."`  
`});`  
`console.log(r.output_text);`

**Basic completion (Python)**

`r = client.responses.create(`  
    `model="gpt-4o",`  
    `input="Write a 2-sentence bedtime hook about a dragon baker."`  
`)`  
`print(r.output_text)`

Key fields on the request:

* `model`: `"gpt-4o"` (or a related family member below)

* `input`: string or array of “messages” parts

* Optional: `temperature`, `top_p`, `max_output_tokens`, `stop`, `presence_penalty`, `frequency_penalty`, `metadata` (tags for your own tracking). [OpenAI Plattform](https://platform.openai.com/docs/api-reference/responses?utm_source=chatgpt.com)

### **Choosing a 4o family model**

* **gpt-4o**: best quality \+ vision. Text in, text out.

* **gpt-4o-mini**: cheaper, faster for high-volume tasks.

* **gpt-4o-realtime-preview**: realtime audio+text in/out over WebRTC or WebSocket.

* **gpt-4o-mini-tts**: text-to-speech.

* **gpt-4o-transcribe**: speech-to-text. [OpenAI Plattform+2OpenAI Plattform+2](https://platform.openai.com/docs/models?utm_source=chatgpt.com)

---

# **4\) Streaming “as it types” (server-side and SSE)**

You can stream tokens so your UI prints text live.

**Node (SSE helper)**

`const stream = await client.responses.stream({`  
  `model: "gpt-4o",`  
  `input: "Stream a short poem, one line per beat."`  
`});`

`stream.on("text.delta", (d) => process.stdout.write(d));`  
`stream.on("text.completed", () => process.stdout.write("\n"));`  
`await stream.done();`

**Python (iterating events)**

`with client.responses.stream(`  
    `model="gpt-4o",`  
    `input="Stream a short poem, one line per beat."`  
`) as stream:`  
    `for event in stream:`  
        `if event.type == "response.output_text.delta":`  
            `print(event.delta, end="", flush=True)`

Under the hood this uses server-sent events. You can also stream with raw HTTP and consume `response.*` and `output_text.*` deltas. [OpenAI Plattform+1](https://platform.openai.com/docs/guides/streaming-responses?utm_source=chatgpt.com)

---

# **5\) Prompting: structure and best practices**

**Message shape** (Responses API) can be a single `input` string or an array of parts. A common pattern:

* **System** style instruction at the top of the input

* **User** content (requirements)

* **Optional** tool results or files

* **Ask for JSON** when you want structured outputs

Example:

`await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: [`  
    `{ role: "system", content: "You are a concise assistant for a children’s storytelling app." },`  
    `{ role: "user", content: "Create a 120-word chapter with a friendly cliffhanger." }`  
  `],`  
  `temperature: 0.7`  
`});`

**General tips**

* Keep the system message short and specific.

* Put hard requirements in bullet points.

* For deterministic behavior, use **Structured Outputs** with a `json_schema` (see §8). [OpenAI Plattform+1](https://platform.openai.com/docs/guides/text?utm_source=chatgpt.com)

---

# **6\) Vision (images and PDFs into GPT-4o)**

GPT-4o accepts images and PDFs as input. You pass file references or HTTP URLs. The model returns text (captions, extraction, reasoning, etc.). [OpenAI Plattform+1](https://platform.openai.com/docs/guides/images-vision?utm_source=chatgpt.com)

**Node (image URL)**

`const r = await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: [`  
    `{ role: "user",`  
      `content: [`  
        `{ type: "input_text", text: "Describe this UI and list 3 improvements." },`  
        `{ type: "input_image", image_url: "https://example.com/screenshot.png" }`  
      `]`  
    `}`  
  `]`  
`});`  
`console.log(r.output_text);`

**Node (PDF)**

`const r = await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: [`  
    `{ role: "user",`  
      `content: [`  
        `{ type: "input_text", text: "Summarize key sections about pricing." },`  
        `{ type: "input_image", image_url: "https://example.com/spec.pdf" } // PDFs supported by 4o`  
      `]`  
    `}`  
  `]`  
`});`

For local files, first upload, then reference the file ID in the input content (same content shape). [OpenAI Plattform](https://platform.openai.com/docs/guides/pdf-files?utm_source=chatgpt.com)

---

# **7\) Tool calling (function calling) to run your code**

Let the model call your functions by declaring **tools** with JSON Schema. The model returns `tool_calls` with validated args; you run the function and send results back. [OpenAI Plattform+1](https://platform.openai.com/docs/guides/function-calling?utm_source=chatgpt.com)

**Node**

`const tools = [{`  
  `type: "function",`  
  `name: "create_story",`  
  `description: "Create a short child-friendly story",`  
  `parameters: {`  
    `type: "object",`  
    `properties: {`  
      `theme: { type: "string" },`  
      `target_words: { type: "integer", minimum: 50, maximum: 200 }`  
    `},`  
    `required: ["theme","target_words"],`  
    `additionalProperties: false`  
  `}`  
`}];`

`const r1 = await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: "Make a bedtime story about a shy robot, 120 words.",`  
  `tools,`  
  `tool_choice: "auto"`  
`});`

`// If there's a function call:`  
`for (const call of r1.output[0]?.content?.filter(c => c.type==="tool_call") || []) {`  
  `if (call.name === "create_story") {`  
    `const args = call.arguments;       // already validated to schema`  
    `const toolResult = await createStory(args); // your code`  
    `// Return result back to the model to finalize the answer`  
    `const r2 = await client.responses.create({`  
      `model: "gpt-4o",`  
      `input: [`  
        `{ role: "user", content: "Make a bedtime story..." },`  
        `{ role: "tool", tool_call_id: call.id, content: toolResult }`  
      `]`  
    `});`  
    `console.log(r2.output_text);`  
  `}`  
`}`

Notes:

* Use `tool_choice: "required"` if you always want a function call.

* Use tight JSON Schemas to keep args clean. [OpenAI Plattform](https://platform.openai.com/docs/guides/function-calling?utm_source=chatgpt.com)

---

# **8\) Structured Outputs (guaranteed JSON)**

If you need **strict JSON** back, specify a `response_format` with a JSON Schema. The model validates to your schema. This is the easiest way to avoid “hallucinated” fields. [OpenAI Plattform](https://platform.openai.com/docs/guides/structured-outputs?utm_source=chatgpt.com)

**Node**

`const r = await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: "Extract title:string, reading_level:enum('kid','teen','adult').",`  
  `response_format: {`  
    `type: "json_schema",`  
    `json_schema: {`  
      `name: "meta",`  
      `schema: {`  
        `type: "object",`  
        `additionalProperties: false,`  
        `properties: {`  
          `title: { type: "string" },`  
          `reading_level: { type: "string", enum: ["kid","teen","adult"] }`  
        `},`  
        `required: ["title","reading_level"]`  
      `}`  
    `}`  
  `}`  
`});`  
`console.log(r.output[0].content[0].text); // JSON string matching schema`

---

# **9\) Audio: transcription and text-to-speech**

### **Transcription with gpt-4o-transcribe**

* Upload or stream audio, receive text.

* Improves WER and language recognition vs older Whisper pipelines. [OpenAI Plattform](https://platform.openai.com/docs/models/gpt-4o-transcribe?utm_source=chatgpt.com)

**Python (file path)**

`audio = open("clip.wav", "rb")`  
`r = client.audio.transcriptions.create(`  
    `model="gpt-4o-transcribe",`  
    `file=audio`  
`)`  
`print(r.text)`

### **Text-to-Speech with gpt-4o-mini-tts**

* Low-latency, natural speech. Choose a voice and optional style hints. [OpenAI Plattform+1](https://platform.openai.com/docs/guides/text-to-speech?utm_source=chatgpt.com)

**Node**

`const audio = await client.audio.speech.create({`  
  `model: "gpt-4o-mini-tts",`  
  `voice: "alloy",            // voice names vary`  
  `input: "Welcome to Tale Forge!"`  
`});`  
`// audio is binary; write to file or stream to the client`

---

# **10\) Realtime API (voice \+ ultra-low latency, live partials)**

Use **gpt-4o-realtime-preview** when you want a two-way, low-latency conversation with streaming audio in/out over **WebRTC** or **WebSocket**. It supports live partial transcripts, incremental tool calls, and back-pressure control. Great for “talk to your app” UX, or for live narration. [OpenAI Plattform+2OpenAI Plattform+2](https://platform.openai.com/docs/guides/realtime?utm_source=chatgpt.com)

**High-level steps**

1. Create a WebRTC or WebSocket session to the Realtime endpoint with your API key.

2. Send `input_audio_buffer.append` and `input_audio_buffer.commit` events as you capture mic audio.

3. Send `response.create` to request the model’s turn.

4. Receive `response.delta` events for live text, `audio.delta` for audio frames, and `response.function_call.arguments.delta` for streaming tool args.

5. Optionally pass tool results back mid-turn to ground the response. [OpenAI Plattform+1](https://platform.openai.com/docs/guides/realtime-conversations?utm_source=chatgpt.com)

**Minimal WebSocket sketch (Node)**

`import WebSocket from "ws";`

`const ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", {`  
  ``headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }``  
`});`

`ws.on("open", () => {`  
  `ws.send(JSON.stringify({ type: "response.create", response: { instructions: "Greet me quickly." }}));`  
`});`

`ws.on("message", (m) => {`  
  `const evt = JSON.parse(m.toString());`  
  `if (evt.type === "response.output_text.delta") process.stdout.write(evt.delta);`  
  `if (evt.type === "audio.delta") /* play or buffer PCM/opus frames */;`  
`});`

---

# **11\) Images generation (separate from 4o)**

Image generation/editing uses dedicated image models (DALL·E / GPT-Image). You can call these from the same SDK, but they are not the 4o text model. Typical flow is “prompt to image,” or “edit with mask.” [OpenAI Plattform](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com)

---

# **12\) Parameters you’ll actually tune**

* `temperature` (0.0–2.0): randomness. For reliable output, 0.2–0.7.

* `top_p`: nucleus sampling. Usually leave default if you set temperature.

* `max_output_tokens`: hard cap output length. Use it in apps to avoid blow-ups.

* `stop`: array of stop strings. Useful to end at “\\n\\n\#\#\#”.

* `presence_penalty`, `frequency_penalty`: push diversity or reduce repetition.

* `tool_choice`: `"auto" | "required" | { type: "function", name: "..." }"`.

* `response_format`: set to `json_schema` for guaranteed JSON.

* `metadata`: freeform key/value for your own analytics.  
   Each is documented under the Responses API reference. [OpenAI Plattform](https://platform.openai.com/docs/api-reference/responses?utm_source=chatgpt.com)

---

# **13\) Streaming UI patterns that feel “live”**

* Start the request and immediately render the cursor.

* Print `text.delta` chunks as they arrive.

* If you must post-process (e.g., markdown), buffer lines and render per newline to keep it snappy.

* Show a token-level shimmer or typewriter to hide any tiny gaps.

* For tool calling streams, display “Thinking…” until either a tool call or first text delta shows up. [OpenAI Plattform](https://platform.openai.com/docs/guides/streaming-responses?utm_source=chatgpt.com)

---

# **14\) Prompt patterns for Tale Forge**

**Deterministic JSON for chapters**

`await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: [`  
    `{ role: "system", content: "You write child-safe, culturally neutral adventure prose." },`  
    `{ role: "user", content:`  
      `"Create a chapter from these inputs. Enforce schema strictly.\n\n" +`  
      `"Inputs:\n- Protagonist: Lina (7)\n- Tone: warm, curious\n- Length: 120–160 words\n"`  
    `}`  
  `],`  
  `response_format: {`  
    `type: "json_schema",`  
    `json_schema: {`  
      `name: "chapter",`  
      `schema: {`  
        `type: "object", additionalProperties: false,`  
        `properties: {`  
          `title: { type: "string" },`  
          `chapter_text: { type: "string", minLength: 120, maxLength: 700 },`  
          `cliffhanger_question: { type: "string" }`  
        `},`  
        `required: ["title","chapter_text","cliffhanger_question"]`  
      `}`  
    `}`  
  `},`  
  `temperature: 0.7,`  
  `max_output_tokens: 500`  
`});`

**Tool-driven branching choices**  
 Declare a `propose_choices` tool with schema `{ choices: [{ id, label, impact_tags[] }] }`, let the model call it, then persist to your DB and feed back user selection to generate the next chapter. (See §7.) [OpenAI Plattform](https://platform.openai.com/docs/guides/function-calling?utm_source=chatgpt.com)

---

# **15\) Files and PDFs**

For long prompts or assets, upload files and reference them in inputs. For PDFs, 4o can read pages and you can ask for summaries or extraction. In UX, show the model what to look for with a short instruction plus 1–2 page images or the PDF URL. [OpenAI Plattform](https://platform.openai.com/docs/guides/pdf-files?utm_source=chatgpt.com)

---

# **16\) Reasoning guidance**

For complex tasks, keep instructions crisp, add constraints, provide one good example, and use Structured Outputs or tools for critical data. If you need chain-of-thought, avoid asking for it verbatim; instead ask for **brief final answers** or **key steps**. OpenAI’s reasoning guide recommends higher level guidance over verbose step forcing. [OpenAI Plattform](https://platform.openai.com/docs/guides/reasoning-best-practices?utm_source=chatgpt.com)

---

# **17\) Performance and cost knobs**

* Prefer **4o-mini** for bulk generation and keep `max_output_tokens` tight.

* Use **predicted outputs** when a chunk of the answer is known (e.g., boilerplate). It reduces latency and cost by letting you prefill target text the model is likely to produce. [OpenAI Plattform](https://platform.openai.com/docs/guides/predicted-outputs?utm_source=chatgpt.com)

---

# **18\) Realtime UX tips (voice)**

* Start mic capture, send buffers continuously.

* Play `audio.delta` frames as they arrive to speak over silence.

* Interrupt: send a `session.update` or new `response.create` with `conversation: "none"` to cut off and change topic.

* Tool calling works mid-turn; feed results back for grounded replies. [OpenAI Plattform](https://platform.openai.com/docs/guides/realtime-conversations?utm_source=chatgpt.com)

---

# **19\) Safety, policy, and rate limiting**

* Handle blocked outputs by checking response finish reasons and the safety field if present.

* Implement exponential backoff on 429/5xx.

* Chunk long inputs and cite sources yourself when needed.

* Keep user data handling compliant with your local rules.  
   (Details live in the API reference and policy sections.) [OpenAI Plattform](https://platform.openai.com/docs/api-reference/introduction?utm_source=chatgpt.com)

---

# **20\) Minimal end-to-end examples**

## **A) Streaming text to your web UI (Next.js/Node sketch)**

`// /api/stream`  
`import OpenAI from "openai";`  
`export const config = { runtime: "edge" };`

`export default async function handler(req: Request) {`  
  `const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });`  
  `const stream = await client.responses.stream({`  
    `model: "gpt-4o",`  
    `input: "Write a 5-line lullaby. Stream it."`  
  `});`  
  `return new Response(stream.toReadableStream(), {`  
    `headers: { "Content-Type": "text/event-stream" }`  
  `});`  
`}`

Client subscribes to SSE and appends deltas to the page. [OpenAI Plattform](https://platform.openai.com/docs/guides/streaming-responses?utm_source=chatgpt.com)

## **B) Vision: extract UI copy from a screenshot**

`await client.responses.create({`  
  `model: "gpt-4o",`  
  `input: [`  
    `{ role: "user", content: [`  
      `{ type: "input_text", text: "Extract button labels and headings." },`  
      `{ type: "input_image", image_url: "https://..." }`  
    `]}`  
  `],`  
  `response_format: { type: "json_schema", json_schema: {`  
    `name: "ui_text",`  
    `schema: {`  
      `type: "object", properties: {`  
        `headings: { type: "array", items: { type: "string" } },`  
        `buttons:  { type: "array", items: { type: "string" } }`  
      `}, required: ["headings","buttons"], additionalProperties: false`  
    `}`  
  `}}`  
`});`

[OpenAI Plattform](https://platform.openai.com/docs/guides/images-vision?utm_source=chatgpt.com)

## **C) Tool calling to your backend**

1. Model calls `create_story(theme, target_words)`

2. Your server generates and stores content

3. You send tool result back to the model to craft the final reply  
    (See the code in §7.) [OpenAI Plattform](https://platform.openai.com/docs/guides/function-calling?utm_source=chatgpt.com)

## **D) Realtime voice bot sketch (browser)**

* Get a client token from your server

* Create a `RTCPeerConnection`

* Add mic track, set up `ontrack` to play model audio

* Dial the OpenAI Realtime endpoint with the SDP

* Send `response.create` with instructions

* Render `response.output_text.delta` in captions as they arrive [OpenAI Plattform](https://platform.openai.com/docs/guides/realtime-conversations?utm_source=chatgpt.com)

---

# **21\) Quick checklist for integrating in Tale Forge**

* Pick models: `gpt-4o` for chapter/vision, `gpt-4o-mini` for bulk, `gpt-4o-mini-tts` for narration, `gpt-4o-transcribe` for voice input, `gpt-4o-realtime-preview` for conversational mode. [OpenAI Plattform+2OpenAI Plattform+2](https://platform.openai.com/docs/models?utm_source=chatgpt.com)

* Wrap the **Responses API** on your server.

* Implement **SSE streaming** for live typing. [OpenAI Plattform](https://platform.openai.com/docs/guides/streaming-responses?utm_source=chatgpt.com)

* Use **Structured Outputs** for chapter JSON. [OpenAI Plattform](https://platform.openai.com/docs/guides/structured-outputs?utm_source=chatgpt.com)

* Add **tool calling** for branching choices and DB writes. [OpenAI Plattform](https://platform.openai.com/docs/guides/function-calling?utm_source=chatgpt.com)

* Add **vision** to accept child drawings/screenshots as story seeds. [OpenAI Plattform](https://platform.openai.com/docs/guides/images-vision?utm_source=chatgpt.com)

* Add **TTS** for narration and **transcribe** for voice prompts. [OpenAI Plattform+1](https://platform.openai.com/docs/models/gpt-4o-mini-tts?utm_source=chatgpt.com)

* If you want live conversations, wire the **Realtime API** with WebRTC. [OpenAI Plattform](https://platform.openai.com/docs/guides/realtime-conversations?utm_source=chatgpt.com)

---

## **Notes on completeness**

I pulled and condensed the official docs into an implementable guide with code. The official pages that back each section are cited so you can verify details like event names, field shapes, and model IDs: streaming, Responses API reference, function/tools, structured outputs, models list, vision/PDFs, audio, and realtime. [OpenAI Plattform+9OpenAI Plattform+9OpenAI Plattform+9](https://platform.openai.com/docs/api-reference/responses?utm_source=chatgpt.com)

