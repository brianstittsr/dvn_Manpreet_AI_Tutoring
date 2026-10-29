/**
 * DocuSeal Templates API
 * 
 * Endpoints for managing DocuSeal templates:
 * - GET: List templates (from DocuSeal or local cache)
 * - POST: Sync templates from DocuSeal
 */

import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, DocuSealTemplateDoc } from "@/lib/schema";
import { getDefaultDocuSealService } from "@/lib/docuseal";

// Serialize timestamps
function serializeTemplate(data: DocuSealTemplateDoc): Record<string, unknown> {
  return {
    ...data,
    lastSyncedAt: (data.lastSyncedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.lastSyncedAt,
    createdAt: (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: (data.updatedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'local';
    const category = searchParams.get('category');

    // Fetch from DocuSeal API
    if (source === 'docuseal') {
      const service = getDefaultDocuSealService();
      if (!service) {
        return NextResponse.json(
          { success: false, error: "DocuSeal not configured" },
          { status: 503 }
        );
      }

      const result = await service.getTemplates({ limit: 100 });
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        templates: result.data?.data || [],
        source: 'docuseal',
      });
    }

    // Fetch from local cache
    if (!adminDb) {
      return NextResponse.json({ success: true, templates: [], source: 'local' });
    }

    let q: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.DOCUSEAL_TEMPLATES);
    if (category) {
      q = adminDb.collection(COLLECTIONS.DOCUSEAL_TEMPLATES).where('category', '==', category);
    }

    const snapshot = await q.get();
    const templates = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as DocuSealTemplateDoc;
      return serializeTemplate({ ...data, id: docSnap.id });
    });

    return NextResponse.json({ success: true, templates, source: 'local' });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const service = getDefaultDocuSealService();
    if (!service) {
      return NextResponse.json(
        { success: false, error: "DocuSeal not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Sync templates from DocuSeal
    if (action === 'sync') {
      const result = await service.getTemplates({ limit: 100 });
      if (!result.success || !result.data?.data) {
        return NextResponse.json(
          { success: false, error: result.error || "Failed to fetch templates" },
          { status: 500 }
        );
      }

      const now = Timestamp.now();
      let synced = 0;

      for (const template of result.data.data) {
        // Check if template already exists
        const existingSnap = await adminDb
          .collection(COLLECTIONS.DOCUSEAL_TEMPLATES)
          .where('docusealId', '==', template.id)
          .get();

        const templateData = {
          docusealId: template.id,
          name: template.name,
          slug: template.slug,
          category: 'other',
          fields: template.fields?.map((f) => ({
            name: f.name,
            type: f.type,
            required: f.required,
          })) || [],
          submitterRoles: template.submitters?.map((s) => s.name) || [],
          isActive: !template.archived_at,
          lastSyncedAt: now,
          createdAt: now,
          updatedAt: now,
        };

        if (existingSnap.empty) {
          await adminDb.collection(COLLECTIONS.DOCUSEAL_TEMPLATES).add(templateData);
        } else {
          const existingDoc = existingSnap.docs[0];
          await adminDb.collection(COLLECTIONS.DOCUSEAL_TEMPLATES).doc(existingDoc.id).update({
            ...templateData,
            createdAt: existingDoc.data().createdAt,
          });
        }
        synced++;
      }

      return NextResponse.json({
        success: true,
        message: `Synced ${synced} templates from DocuSeal`,
        synced,
      });
    }

    // Add a new template mapping
    if (action === 'add') {
      const { docusealId, name, category, description } = body;

      if (!docusealId || !name) {
        return NextResponse.json(
          { success: false, error: "DocuSeal ID and name are required" },
          { status: 400 }
        );
      }

      const now = Timestamp.now();
      const templateData = {
        docusealId,
        name,
        slug: '',
        description,
        category: category || 'other',
        fields: [],
        submitterRoles: [],
        isActive: true,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await adminDb.collection(COLLECTIONS.DOCUSEAL_TEMPLATES).add(templateData);

      return NextResponse.json({
        success: true,
        template: {
          id: docRef.id,
          ...templateData,
          createdAt: now.toDate().toISOString(),
          updatedAt: now.toDate().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error managing templates:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
