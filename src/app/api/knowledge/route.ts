import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  extractTextFromPdf,
  extractTextFromFile,
  extractTextFromUrl,
  uploadKnowledgeFile,
} from "@/lib/knowledge";

const FILE_SIZE_LIMITS = { FREE: 10 * 1024 * 1024, PRO: 40 * 1024 * 1024 } as const; // 10MB / 40MB
const SOURCE_LIMITS = { FREE: 2, PRO: 5 } as const;

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await prisma.knowledgeSource.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      sizeBytes: true,
      sourceUrl: true,
    },
  });

  return NextResponse.json(
    sources.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check source limit based on plan
  const plan = (user.plan || "FREE") as "FREE" | "PRO";
  const maxSources = SOURCE_LIMITS[plan];
  const sourceCount = await prisma.knowledgeSource.count({
    where: { userId: user.id },
  });
  if (sourceCount >= maxSources) {
    return NextResponse.json(
      { error: `Source limit reached (max ${maxSources}). Remove one to add a new source.${plan === "FREE" ? " Upgrade to PRO for up to 5 sources!" : ""}` },
      { status: 429 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  // URL submission (JSON body)
  if (contentType.includes("application/json")) {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    try {
      const rawText = await extractTextFromUrl(url);

      if (!rawText) {
        return NextResponse.json(
          { error: "Could not extract content from URL" },
          { status: 400 }
        );
      }

      const source = await prisma.knowledgeSource.create({
        data: {
          userId: user.id,
          type: "URL",
          name: url,
          rawText,
          sourceUrl: url,
          sizeBytes: Buffer.byteLength(rawText, "utf-8"),
        },
      });

      return NextResponse.json({
        id: source.id,
        name: source.name,
        type: source.type,
        createdAt: source.createdAt.toISOString(),
        sizeBytes: source.sizeBytes,
        sourceUrl: source.sourceUrl,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch URL content" },
        { status: 400 }
      );
    }
  }

  // File upload (multipart/form-data)
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const maxFileSize = FILE_SIZE_LIMITS[plan];
  const maxFileSizeMB = maxFileSize / (1024 * 1024);
  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: `File too large (max ${maxFileSizeMB}MB)` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

  let rawText: string;
  try {
    rawText = isPdf
      ? await extractTextFromPdf(buffer)
      : extractTextFromFile(buffer);
  } catch {
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 400 }
    );
  }

  if (!rawText) {
    return NextResponse.json(
      { error: "No text content found in file" },
      { status: 400 }
    );
  }

  const sourceId = crypto.randomUUID();
  const fileUrl = await uploadKnowledgeFile(buffer, file.type, user.id, sourceId);

  const source = await prisma.knowledgeSource.create({
    data: {
      userId: user.id,
      type: isPdf ? "PDF" : "TEXT",
      name: file.name,
      rawText,
      fileUrl,
      sizeBytes: file.size,
    },
  });

  return NextResponse.json({
    id: source.id,
    name: source.name,
    type: source.type,
    createdAt: source.createdAt.toISOString(),
    sizeBytes: source.sizeBytes,
    sourceUrl: null,
  });
}
