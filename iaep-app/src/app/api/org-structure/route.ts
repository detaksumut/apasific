import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'org-structure.json');
const uploadDir = path.join(process.cwd(), 'public', 'images', 'org');

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json([]);
    }
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { no, name, position, division, photo } = body;

    if (!no) {
      return NextResponse.json({ error: 'Member No is required' }, { status: 400 });
    }

    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const memberIndex = data.findIndex((m: any) => m.no === no);

    if (memberIndex === -1) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Handle photo upload if provided as base64
    let photoUrl = data[memberIndex].photo;
    if (photo && photo.startsWith('data:image/')) {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const matches = photo.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `member-${no}-${Date.now()}.${ext}`;
        const filepath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filepath, buffer);
        photoUrl = `/images/org/${filename}`;
      }
    } else if (photo === '') {
      // Allow clearing the photo
      photoUrl = '';
    } else if (photo) {
      photoUrl = photo;
    }

    // Update member
    data[memberIndex] = {
      ...data[memberIndex],
      name: name !== undefined ? name : data[memberIndex].name,
      position: position !== undefined ? position : data[memberIndex].position,
      division: division !== undefined ? division : data[memberIndex].division,
      photo: photoUrl
    };

    // Save back to JSON
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ success: true, member: data[memberIndex] });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
