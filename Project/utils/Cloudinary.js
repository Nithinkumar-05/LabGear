const Cloudinary = {
    uploadImageToCloudinary: async (imageUri, CLOUD_NAME, UPLOAD_PRESET) => {
        const data = new FormData();
        const filename = imageUri.split('/').pop();
        const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

        data.append('file', {
            uri: imageUri,
            type: mimeType,
            name: filename || `upload.${fileExtension}`,
        });
        data.append('upload_preset', UPLOAD_PRESET);
        data.append('cloud_name', CLOUD_NAME);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = await response.json();
            return result.secure_url;
        } catch (error) {
            console.error("Upload error:", error);
            return null;
        }
    }
};
 
export default Cloudinary;