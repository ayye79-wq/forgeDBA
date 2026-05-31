import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getModuleDetail } from "../lib/content";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = auth.userId;
  next();
}

router.post("/ai/ask", requireAuth, async (req: any, res): Promise<void> => {
  const { question, moduleId, lessonId } = req.body as {
    question?: string;
    moduleId?: string;
    lessonId?: string;
  };

  if (!question?.trim()) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  const moduleDetail = moduleId ? getModuleDetail(moduleId, true) : null;
  const lesson = moduleDetail?.lessons.find(l => l.id === lessonId) ?? null;

  const lessonContext = lesson
    ? `Module: ${moduleDetail!.title}\nLesson: ${lesson.title} (type: ${lesson.type})\nContent: ${lesson.content.slice(0, 2000)}${lesson.codeExample ? `\n\nCode example:\n${lesson.codeExample.slice(0, 1000)}` : ""}`
    : moduleDetail
      ? `Module: ${moduleDetail.title}`
      : "";

  const systemPrompt = `You are an expert SQL Server DBA tutor built into the DBA Forge training platform. Your job is to answer student questions clearly and practically.

${lessonContext ? `The student is currently on:\n${lessonContext}\n\nAnswer questions in the context of this lesson when relevant.` : "Answer SQL Server DBA questions."}

Rules:
- Be concise and practical. Real-world DBA focus.
- Use SQL code examples when helpful (use backtick fences).
- If the question is unrelated to SQL Server or DBA work, politely redirect.
- Never be condescending. Students range from junior to mid-level DBAs.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question.trim() },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log?.error({ err }, "AI ask failed");
    res.write(`data: ${JSON.stringify({ error: "AI service unavailable. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
