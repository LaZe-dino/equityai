import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/documents/upload — Upload document
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const companyId = formData.get('company_id') as string;
  const offeringId = formData.get('offering_id') as string | null;
  const fileType = formData.get('file_type') as string || 'other';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(path);

  // Create document record
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      company_id: companyId || null,
      offering_id: offeringId || null,
      uploaded_by: user.id,
      name: file.name,
      file_url: publicUrl,
      file_type: fileType,
      file_size: file.size,
    })
    .select()
    .single();

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 500 });
  }

  return NextResponse.json({ data: doc }, { status: 201 });
}
