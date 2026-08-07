const ZENODO_API_URL = 'https://zenodo.org/api';

export interface ZenodoCreator {
  name: string;
  affiliation?: string;
  orcid?: string;
}

export interface ZenodoMetadata {
  title: string;
  description: string;
  creators: ZenodoCreator[];
  upload_type: string;
  publication_type?: string;
  communities?: { identifier: string }[];
  access_right?: string;
  license?: string;
  keywords?: string[];
}

const getHeaders = () => {
  const token = process.env.NEXT_PUBLIC_ZENODO_API_TOKEN || process.env.VITE_ZENODO_API_TOKEN;
  if (!token) {
    throw new Error('Zenodo API Token is not defined in environment variables.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Creates an empty deposition in Zenodo with the provided metadata.
 */
export async function createDeposition(metadata: ZenodoMetadata) {
  const response = await fetch(`${ZENODO_API_URL}/deposit/depositions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ metadata })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to create deposition: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Downloads a file from a public URL and uploads it to the Zenodo deposition.
 */
/**
 * Downloads a file from a public URL and uploads it to the Zenodo deposition.
 * Supports both modern Bucket PUT API and legacy multipart form upload.
 */
export async function uploadFileToDeposition(
  depositionId: number, 
  fileUrl: string, 
  fileName: string, 
  bucketUrl?: string
) {
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download file from ${fileUrl}`);
  }
  const arrayBuffer = await fileResponse.arrayBuffer();
  const contentLength = arrayBuffer.byteLength;

  const token = process.env.NEXT_PUBLIC_ZENODO_API_TOKEN || process.env.VITE_ZENODO_API_TOKEN;

  if (bucketUrl) {
    try {
      // New Bucket API (PUT method, raw binary body with explicit Content-Length)
      const response = await fetch(`${bucketUrl}/${encodeURIComponent(fileName)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(contentLength)
        },
        body: new Uint8Array(arrayBuffer)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Zenodo Bucket PUT failed, trying legacy POST fallback...", response.statusText, errorData);
        throw new Error(response.statusText);
      }

      return response.json();
    } catch (bucketErr) {
      console.warn("Zenodo Bucket PUT failed, falling back to legacy upload:", bucketErr);
    }
  }

  // Fallback: Legacy API (POST method, FormData body)
  const fileBlob = new Blob([arrayBuffer]);
  const formData = new FormData();
  formData.append('file', fileBlob, fileName);
  formData.append('name', fileName);

  const response = await fetch(`${ZENODO_API_URL}/deposit/depositions/${depositionId}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to upload file to deposition: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Publishes a deposition, assigning a permanent DOI.
 */
export async function publishDeposition(depositionId: number) {
  const response = await fetch(`${ZENODO_API_URL}/deposit/depositions/${depositionId}/actions/publish`, {
    method: 'POST',
    headers: getHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to publish deposition: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Orchestrates the full process: Create -> Upload -> Publish
 */
export async function publishArticleToZenodo(
  metadata: ZenodoMetadata, 
  fileUrl: string, 
  fileName: string,
  coverUrl?: string
) {
  let deposition: any;
  try {
    deposition = await createDeposition(metadata);
    const depositionId = deposition.id;
    const bucketUrl = deposition.links?.bucket;
    
    let uploadSuccess = true;
    let uploadError = "";

    if (fileUrl) {
      try {
        await uploadFileToDeposition(depositionId, fileUrl, fileName, bucketUrl);
      } catch (e: any) {
        console.error("Zenodo main file upload failed, falling back to manual upload mode:", e);
        uploadSuccess = false;
        uploadError = e.message;
      }
    }

    if (uploadSuccess && coverUrl) {
      try {
        const coverName = coverUrl.split('/').pop()?.split('?')[0] || 'cover.png';
        await uploadFileToDeposition(depositionId, coverUrl, coverName, bucketUrl);
      } catch (e: any) {
        console.error("Zenodo cover file upload failed, but continuing:", e);
      }
    }
    
    // If the main file upload was blocked/failed, we do NOT call publishDeposition 
    // (since publishing requires files to be uploaded), but we return the draft details!
    if (!uploadSuccess) {
      const prereservedDoi = deposition.metadata?.prereserve_doi?.doi || `10.5281/zenodo.${depositionId}`;
      const zenodoUrl = deposition.links.html;
      return { 
        success: true, 
        partial: true, 
        error: uploadError, 
        doi: prereservedDoi, 
        zenodoUrl, 
        deposition 
      };
    }
    
    const publishedDeposition = await publishDeposition(depositionId);
    
    const doi = publishedDeposition.doi || publishedDeposition.metadata?.prereserve_doi?.doi || `10.5281/zenodo.${depositionId}`;
    const zenodoUrl = publishedDeposition.links.html;
    
    return { success: true, doi, zenodoUrl, deposition: publishedDeposition };
  } catch (error: any) {
    console.error("Zenodo Integration Error:", error);
    // If deposition creation itself failed (e.g. invalid token)
    if (deposition && deposition.id) {
      const prereservedDoi = deposition.metadata?.prereserve_doi?.doi || `10.5281/zenodo.${deposition.id}`;
      return { 
        success: true, 
        partial: true, 
        error: error.message, 
        doi: prereservedDoi, 
        zenodoUrl: deposition.links.html, 
        deposition 
      };
    }
    return { success: false, error: error.message };
  }
}
