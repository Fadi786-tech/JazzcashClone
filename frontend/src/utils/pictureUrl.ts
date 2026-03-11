export const getPictureUrl = (picturePath: string | undefined): string => {
  if (!picturePath) return '';
  
  // Agar ye pehly se hi url ha tu return kar de 
  if (picturePath.startsWith('http://') || picturePath.startsWith('https://')) {
    return picturePath;
  }
  
  // Ye path mein se filename ko extract kary ga beshak absolute ho ya realative path ho
  // Absolute path: "F:\Users\...\backend\uploads\picture-xxx.jpg" -> "picture-xxx.jpg"
  // Relative path: "uploads/picture-xxx.jpg" -> "picture-xxx.jpg"
  let filename = picturePath;
  
  // Extract filename from absolute path
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

