/**
 * Get the picture URL from the stored path
 * Handles both absolute paths (from multer) and relative paths
 * @param picturePath - The path stored in the database
 * @returns The full URL to access the picture
 */
export const getPictureUrl = (picturePath: string | undefined): string => {
  if (!picturePath) return '';
  
  // If it's already a URL, return it
  if (picturePath.startsWith('http://') || picturePath.startsWith('https://')) {
    return picturePath;
  }
  
  // Extract filename from path (handles both absolute and relative paths)
  // Absolute path: "F:\Users\...\backend\uploads\picture-xxx.jpg" -> "picture-xxx.jpg"
  // Relative path: "uploads/picture-xxx.jpg" -> "picture-xxx.jpg"
  let filename = picturePath;
  
  // Extract filename from absolute path (Windows or Unix)
  const pathParts = picturePath.split(/[/\\]/);
  if (pathParts.length > 1) {
    filename = pathParts[pathParts.length - 1];
  }
  
  // Remove 'uploads/' prefix if present
  if (filename.startsWith('uploads/')) {
    filename = filename.replace('uploads/', '');
  }
  
  return `http://localhost:5000/uploads/${filename}`;
};

