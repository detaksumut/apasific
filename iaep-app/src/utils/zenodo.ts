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
export async function uploadFileToDeposition(depositionId: number, fileUrl: string, fileName: string) {
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download file from ${fileUrl}`);
  }
  const fileBlob = await fileResponse.blob();

  const formData = new FormData();
  formData.append('file', fileBlob, fileName);
  formData.append('name', fileName);

  const token = process.env.NEXT_PUBLIC_ZENODO_API_TOKEN || process.env.VITE_ZENODO_API_TOKEN;
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
  fileName: string
) {
  try {
    const deposition = await createDeposition(metadata);
    const depositionId = deposition.id;
    
    if (fileUrl) {
      await uploadFileToDeposition(depositionId, fileUrl, fileName);
    }
    
    const publishedDeposition = await publishDeposition(depositionId);
    
    const doi = publishedDeposition.doi || publishedDeposition.metadata.prereserve_doi.doi;
    const zenodoUrl = publishedDeposition.links.html;
    
    return { success: true, doi, zenodoUrl, deposition: publishedDeposition };
  } catch (error: any) {
    console.error("Zenodo Integration Error:", error);
    return { success: false, error: error.message };
  }
}
