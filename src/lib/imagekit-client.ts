export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
  size: number;
}

export async function uploadFileToImageKit(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<ImageKitUploadResult> {
  // Get authentication parameters from your API
  const authResponse = await fetch('/api/imagekit-auth');
  if (!authResponse.ok) {
    throw new Error('Failed to get authentication parameters');
  }
  
  const authParams = await authResponse.json();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentCompleted = Math.round((e.loaded * 100) / e.total);
          onProgress(percentCompleted);
        }
      });
    }

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            size: result.size,
          });
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('folder', `/${folder}`);
    formData.append('useUniqueFileName', 'true');
    formData.append('signature', authParams.signature);
    formData.append('token', authParams.token);
    formData.append('expire', authParams.expire.toString());
    formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);

    // Send request to ImageKit
    xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
    xhr.send(formData);
  });
}
